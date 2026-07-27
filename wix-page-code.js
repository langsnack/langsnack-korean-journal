// Wix page code for the page containing your HTML Component.
// Change #journalHtml to the actual ID of your embedded HTML element.
import wixData from 'wix-data';
import { authentication, currentMember } from 'wix-members-frontend';

const COLLECTION = 'JournalEntries';

$w.onReady(async function () {
  const frame = $w('#journalHtml');

  async function sendMemberState() {
    const loggedIn = authentication.loggedIn();
    if (!loggedIn) {
      frame.postMessage({ source: 'langsnack-wix', type: 'memberState', payload: { loggedIn: false } });
      return;
    }
    const member = await currentMember.getMember({ fieldsets: ['FULL'] });
    const name = member?.contactDetails?.firstName || member?.profile?.nickname || '';
    const email = member?.loginEmail || member?.contactDetails?.emails?.[0] || '';
    frame.postMessage({ source: 'langsnack-wix', type: 'memberState', payload: { loggedIn: true, id: member._id, name, email } });
  }

  frame.onMessage(async (event) => {
    const msg = event.data || {};
    if (msg.source !== 'langsnack-journal') return;
    try {
      if (msg.type === 'ready') await sendMemberState();
      if (msg.type === 'login') {
        try { await authentication.promptLogin({ mode: 'login' }); await sendMemberState(); }
        catch (_) { frame.postMessage({ source: 'langsnack-wix', type: 'authCancelled' }); }
      }
      if (msg.type === 'logout') { await authentication.logout(); await sendMemberState(); }
      if (msg.type === 'loadEntries') {
        const member = await currentMember.getMember();
        const result = await wixData.query(COLLECTION).eq('memberId', member._id).descending('createdAt').limit(1000).find();
        const entries = result.items.map(item => ({ id:item.entryId, date:item.entryDate, createdAt:item.createdAt, text:item.text, level:item.level, status:item.status }));
        frame.postMessage({ source:'langsnack-wix', type:'entriesLoaded', payload:{ entries } });
      }
      if (msg.type === 'saveEntry') {
        const member = await currentMember.getMember();
        const entry = msg.payload.entry;
        const existing = await wixData.query(COLLECTION).eq('memberId', member._id).eq('entryId', entry.id).limit(1).find();
        const item = existing.items[0] || { memberId:member._id, entryId:entry.id };
        Object.assign(item,{ entryDate:entry.date, createdAt:entry.createdAt, text:entry.text, level:entry.level, status:entry.status });
        await wixData.save(COLLECTION,item);
        frame.postMessage({ source:'langsnack-wix', type:'entrySaved', payload:{entry} });
      }
    } catch (error) {
      console.error('Journal bridge error', error);
      frame.postMessage({ source:'langsnack-wix', type:'bridgeError', payload:{message:error.message} });
    }
  });
});
