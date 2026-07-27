# Langsnack Korean Journal V6 — Wix setup

## What changed
- Wix login and sign-up button in the journal header
- Guest warning explaining that browser-only drafts are not permanent
- Logged-in entries load from and save to Wix CMS
- Random daily missions by level: grammar, content and expression style
- Removed obvious missions such as “write today” and “save your entry”
- Full English/Korean interface switching, including buttons, dialogs, dates, levels, statuses, missions, packages, notices and entry metadata

## Connect it to Wix
1. Add Wix Members Area to your Wix site.
2. Turn on Velo/Dev Mode.
3. Create a CMS collection with ID `JournalEntries`.
4. Add these fields:
   - `memberId` — Text
   - `entryId` — Text
   - `entryDate` — Text
   - `createdAt` — Text
   - `text` — Rich Text or Text
   - `level` — Text
   - `status` — Text
5. Set collection permissions so site members can create and read their own content. For stronger security, move data operations to a backend web module and verify the current member there.
6. Add an HTML Component to the Wix journal page and set its ID to `journalHtml`.
7. Embed the published HTTPS URL for this `index.html` file.
8. Paste `wix-page-code.js` into that Wix page's code panel.
9. Publish the Wix site. Wix member APIs do not fully work in Preview mode.

## Important
The standalone HTML file cannot directly open Wix's member modal. The included bridge uses `postMessage` between the embedded journal and its parent Wix page. Login, logout and Wix Data operations become functional only after the Wix page code is installed and the site is published.
