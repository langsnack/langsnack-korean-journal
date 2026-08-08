
/* FINAL WORKING: show initialization errors instead of failing silently */
window.addEventListener("error", event => {
  console.error("Langsnack runtime error:", event.error || event.message);

  const existing = document.getElementById("langsnackRuntimeError");
  if (existing) return;

  const notice = document.createElement("div");
  notice.id = "langsnackRuntimeError";
  notice.style.cssText = [
    "position:fixed",
    "left:16px",
    "right:16px",
    "bottom:16px",
    "z-index:99999",
    "padding:12px 14px",
    "border:1px solid #dba7a2",
    "border-radius:12px",
    "background:#fff1f0",
    "color:#7f3f3a",
    "font:600 12px/1.5 system-ui,sans-serif",
    "box-shadow:0 12px 30px rgba(60,35,30,.16)"
  ].join(";");

  notice.textContent =
    "The Notebook could not finish loading. Please refresh once. " +
    (event.message || "");

  document.body.appendChild(notice);
});


/* FINAL MASTER: RELIABLE ELEMENT LOOKUP */
function exposeNotebookElements(root = document) {
  root.querySelectorAll("[id]").forEach(element => {
    const id = element.id;
    if (!id) return;
    try {
      if (typeof window[id] === "undefined" || window[id] instanceof HTMLElement) {
        window[id] = element;
      }
    } catch (error) {}
  });
}

const LS = {
  journalState: "langsnackJournalStateV4",
  reviewDraft: "langsnackReviewDraftV4",
  submissions: "langsnackReviewSubmissionsV4",
  bookmarks: "langsnackNotebookBookmarksV4",
  threads: "langsnackNotebookThreadsV4"
};

(function migrateV3Data(){
  const pairs=[["langsnackJournalState",LS.journalState],["langsnackReviewSubmissionsV3",LS.submissions],["langsnackNotebookBookmarksV2",LS.bookmarks],["langsnackNotebookThreadsV2",LS.threads]];
  pairs.forEach(([oldKey,newKey])=>{if(!localStorage.getItem(newKey)&&localStorage.getItem(oldKey))localStorage.setItem(newKey,localStorage.getItem(oldKey));});
})();

const STATUS = {
  en: { pending: "Waiting for review", reviewing: "Review in progress", completed: "Review complete" },
  ko: { pending: "첨삭 대기 중", reviewing: "첨삭 중", completed: "첨삭 완료" }
};

function safeParse(value, fallback) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value);

    return parsed === null || parsed === undefined
      ? fallback
      : parsed;
  } catch {
    return fallback;
  }
}

function detectTimeZone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul"; }
  catch { return "Asia/Seoul"; }
}

function getJournalState() {
  const parsed = safeParse(localStorage.getItem(LS.journalState), {});
  const saved =
    parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};

  return {
    entries: Array.isArray(saved.entries) ? saved.entries : [],
    lastDraft: saved.lastDraft || "",
    level: saved.level || "starter",
    journalDate: saved.journalDate || "",
    timezone: saved.timezone || localStorage.getItem("langsnackTimeZone") || detectTimeZone(),
    language: saved.language || "en",
    profile: saved.profile || { name: "", email: "" }
  };
}

function saveJournalState(state) {
  localStorage.setItem(LS.journalState, JSON.stringify(state));
  if (state.timezone) localStorage.setItem("langsnackTimeZone", state.timezone);
}

function getState() {
  const j=getJournalState();
  return {language:j.language,timeZone:j.timezone,timezone:j.timezone,profile:j.profile,journal:j.lastDraft};
}
function saveState(state) {
  const j=getJournalState();
  j.language=state.language||j.language;
  j.timezone=state.timeZone||state.timezone||j.timezone;
  j.profile=state.profile||j.profile;
  if(typeof state.journal==='string')j.lastDraft=state.journal;
  saveJournalState(j);
}

function getSubmissions(){return safeParse(localStorage.getItem(LS.submissions),[])||[]}
function saveSubmissions(items){localStorage.setItem(LS.submissions,JSON.stringify(Array.isArray(items)?items:[]))}
function getBookmarks(){return safeParse(localStorage.getItem(LS.bookmarks),[])||[]}
function saveBookmarks(items){localStorage.setItem(LS.bookmarks,JSON.stringify(items||[]))}
function getThreads(){return safeParse(localStorage.getItem(LS.threads),{})||{}}
function saveThreads(value){localStorage.setItem(LS.threads,JSON.stringify(value||{}))}
function threadFor(id){
  const threads = getThreads();

  // Direct match first
  if(Array.isArray(threads[id])){
    return threads[id];
  }

  // Find the submission so we can match both
  // the Wix _id and our clientId.
  const submission = getSubmissions().find(item =>
    item._id === id ||
    item.id === id ||
    item.clientId === id
  );

  if(!submission){
    return [];
  }

  const possibleKeys = [
    submission.clientId,
    submission.id,
    submission._id
  ].filter(Boolean);

  for(const key of possibleKeys){
    if(Array.isArray(threads[key])){
      return threads[key];
    }
  }

  return [];
}function addThreadMessage(id,message){
  const all=getThreads();
  const savedMessage={...message,id:makeId(),createdAt:new Date().toISOString()};
  all[id]=all[id]||[];
  all[id].push(savedMessage);
  saveThreads(all);
  syncThreadToWix(id,savedMessage);
  return all[id];
}
function toggleBookmark(item){
  const items=getBookmarks();
  const key=item.key||`${item.submissionId}:${item.text}`;
  const i=items.findIndex(x=>x.key===key);

  if(i>=0){
    const removed=items.splice(i,1)[0];
    saveBookmarks(items);
    syncBookmarkToWix(removed,true);
    return false;
  }

  const savedItem={...item,key,savedAt:new Date().toISOString()};
  items.unshift(savedItem);
  saveBookmarks(items);
  syncBookmarkToWix(savedItem,false);
  return true;
}
function isBookmarked(key){return getBookmarks().some(x=>x.key===key)}

function statusText(status,language='en'){return STATUS[language]?.[status]||status}
function statusClass(status){return `status-badge status-${status}`}
function stripHTML(html=''){const d=document.createElement('div');d.innerHTML=html;return(d.textContent||'').trim()}
function escapeHTML(value=''){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[c])}
function showToast(message){const el=document.getElementById('toast');if(!el)return;el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2200)}
function toast(message){showToast(message)}
function makeId(){return 'JR-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase()}

function dateKeyInTimeZone(date=new Date(),timeZone=getJournalState().timezone){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const m=Object.fromEntries(parts.map(p=>[p.type,p.value]));
  return `${m.year}-${m.month}-${m.day}`;
}
function parseISODate(value){
  const match=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!match)return null;
  return {year:+match[1],month:+match[2],day:+match[3]};
}
function formatKoreanDateOnly(value){
  const p=parseISODate(value);
  if(p){
    const d=new Date(p.year,p.month-1,p.day,12);
    const weekdays=['일','월','화','수','목','금','토'];
    return `${p.year}년 ${p.month}월 ${p.day}일 (${weekdays[d.getDay()]})`;
  }
  const d=new Date(value);if(Number.isNaN(d.getTime()))return '';
  return new Intl.DateTimeFormat('ko-KR',{timeZone:getJournalState().timezone,year:'numeric',month:'long',day:'numeric',weekday:'short'}).format(d);
}
function formatDate(value){
  const d=new Date(value);if(Number.isNaN(d.getTime()))return '';
  return new Intl.DateTimeFormat('ko-KR',{timeZone:getJournalState().timezone,year:'numeric',month:'long',day:'numeric',weekday:'short',hour:'numeric',minute:'2-digit',hour12:true}).format(d);
}
function relativeDate(value){return formatDate(value)}

function initKoreanDatePicker(input, options={}){
  if(!input)return null;
  input.type='hidden';
  const wrap=document.createElement('div');wrap.className='korean-date-picker';
  const year=document.createElement('select'),month=document.createElement('select'),day=document.createElement('select');
  year.setAttribute('aria-label','Year');month.setAttribute('aria-label','Month');day.setAttribute('aria-label','Day');
  const now=parseISODate(options.value||input.value||dateKeyInTimeZone())||parseISODate(dateKeyInTimeZone());
  const start=options.startYear||now.year-5,end=options.endYear||now.year+5;
  for(let y=end;y>=start;y--){year.add(new Option(`${y}년`,String(y)))}
  for(let m=1;m<=12;m++){month.add(new Option(`${m}월`,String(m)))}
  function fillDays(){const max=new Date(+year.value,+month.value,0).getDate();const old=Math.min(+day.value||now.day,max);day.innerHTML='';for(let d=1;d<=max;d++)day.add(new Option(`${d}일`,String(d)));day.value=String(old)}
  year.value=String(now.year);month.value=String(now.month);fillDays();day.value=String(now.day);
  const preview=document.createElement('strong');preview.className='korean-date-preview';
  wrap.append(year,month,day,preview);input.insertAdjacentElement('afterend',wrap);
  function getValue(){return `${year.value}-${String(month.value).padStart(2,'0')}-${String(day.value).padStart(2,'0')}`}
  function sync(emit=true){fillDays();input.value=getValue();preview.textContent=formatKoreanDateOnly(input.value);if(emit){input.dispatchEvent(new Event('change',{bubbles:true}));options.onChange?.(input.value)}}
  function setValue(value){const p=parseISODate(value)||parseISODate(dateKeyInTimeZone());year.value=String(p.year);month.value=String(p.month);fillDays();day.value=String(p.day);sync(false)}
  year.onchange=()=>sync();month.onchange=()=>sync();day.onchange=()=>sync();setValue(options.value||input.value||dateKeyInTimeZone());
  return {wrap,getValue,setValue,preview};
}

function initRichEditor(root){
  const editor=root.querySelector('.editor-content');
  if(!editor)throw new Error('Editor not found');
  root.querySelectorAll('[data-cmd]').forEach(b=>b.onclick=e=>{e.preventDefault();editor.focus();document.execCommand(b.dataset.cmd,false,b.dataset.value||null)});
  const block=root.querySelector('[data-block]');if(block)block.onchange=()=>{editor.focus();document.execCommand('formatBlock',false,block.value)};
  const color=root.querySelector('[data-color]');if(color)color.oninput=()=>{editor.focus();document.execCommand('foreColor',false,color.value)};
  const hi=root.querySelector('[data-highlight]');if(hi)hi.oninput=()=>{editor.focus();document.execCommand('hiliteColor',false,hi.value)};
  const clear=root.querySelector('[data-clear]');if(clear)clear.onclick=e=>{e.preventDefault();editor.focus();document.execCommand('removeFormat')};
  return editor;
}
function richEditorHTML(id,placeholder){return `<div class="rich-editor" id="${escapeHTML(id)}"><div class="toolbar"><button class="tool-btn" data-cmd="bold"><b>B</b></button><button class="tool-btn" data-cmd="italic"><i>I</i></button><button class="tool-btn" data-cmd="underline"><u>U</u></button><button class="tool-btn" data-cmd="strikeThrough">S̶</button><select data-block><option value="p">Paragraph</option><option value="h2">Heading</option><option value="blockquote">Quote</option></select><button class="tool-btn" data-cmd="insertUnorderedList">• List</button><button class="tool-btn" data-cmd="insertOrderedList">1. List</button><label>A <input type="color" data-color value="#2f2a25"></label><label>▰ <input type="color" data-highlight value="#fff0a8"></label><button class="tool-btn" data-clear>Clear</button></div><div class="editor-content" contenteditable="true" spellcheck="true" data-placeholder="${escapeHTML(placeholder)}"></div></div>`}


/* =========================================================
   WIX CMS MESSAGE BRIDGE
   Local browser storage stays available for Guest Mode.
   Logged-in Wix members are synchronised through the parent page.
   ========================================================= */
const CMS_PENDING = new Map();
let cmsRequestCounter = 0;

function isInsideWix(){
  return Boolean(window.parent && window.parent !== window);
}

function cmsRequest(action,payload={}){
  if(!isInsideWix()){
    return Promise.resolve({ok:false,guest:true});
  }

  const requestId=`CMS-${Date.now()}-${++cmsRequestCounter}`;

  return new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>{
      CMS_PENDING.delete(requestId);
      reject(new Error("Wix CMS request timed out."));
    },15000);

    CMS_PENDING.set(requestId,{resolve,reject,timeout});

    window.parent.postMessage({
      source:"langsnack-journal",
      type:"cmsRequest",
      requestId,
      action,
      payload
    },"*");
  });
}

window.addEventListener("message",event=>{
  const message=event.data;
  if(!message||message.source!=="langsnack-wix")return;

  if(message.type==="cmsResponse"&&message.requestId){
    const pending=CMS_PENDING.get(message.requestId);
    if(!pending)return;

    clearTimeout(pending.timeout);
    CMS_PENDING.delete(message.requestId);

    if(message.ok)pending.resolve(message.payload);
    else pending.reject(new Error(message.error||"Wix CMS request failed."));
  }
});

function syncSubmissionToWix(item,action="createSubmission"){
  return cmsRequest(action,{submission:item}).catch(error=>{
    console.warn("Wix CMS sync skipped:",error.message);
    return null;
  });
}

function syncThreadToWix(submissionId,message){
  return cmsRequest("addThreadMessage",{submissionId,message}).catch(error=>{
    console.warn("Thread sync skipped:",error.message);
    return null;
  });
}

function syncBookmarkToWix(item,remove=false){
  return cmsRequest(remove?"removeBookmark":"saveBookmark",{bookmark:item}).catch(error=>{
    console.warn("Bookmark sync skipped:",error.message);
    return null;
  });
}

function requestCmsRefresh(){
  return cmsRequest("getMemberWorkspace")
    .then(payload => {

      console.log("STUDENT WORKSPACE FROM WIX:", payload);

      if(Array.isArray(payload?.submissions)){
        saveSubmissions(payload.submissions);
      }

      if(Array.isArray(payload?.bookmarks)){
        saveBookmarks(payload.bookmarks);
      }

      /* ---------------------------------------------
         THREADS
         Wix may return either:
         1. an array of CMS thread records, or
         2. an already-grouped thread object.
         --------------------------------------------- */

      if(Array.isArray(payload?.threads)){
        const threadMap = {};

        payload.threads.forEach(message => {
          const key =
            message.submissionClientId ||
            message.submissionId;

          if(!key) return;

          if(!threadMap[key]){
            threadMap[key] = [];
          }

          threadMap[key].push(message);
        });

        saveThreads(threadMap);

      } else if(
        payload?.threads &&
        typeof payload.threads === "object"
      ){
        saveThreads(payload.threads);
      }

      window.dispatchEvent(
        new CustomEvent("langsnack:cms-sync")
      );

      return payload;
    })
    .catch(error => {
      console.warn(
        "Member workspace refresh failed:",
        error?.message || error
      );

      return null;
    });
}

/* =========================================================
   WRITING FONT PREFERENCE
   ========================================================= */

const WRITING_FONT_KEY = "langsnackWritingFont";

const WRITING_FONT_OPTIONS = {
  default: "Default",
  notoSans: "Modern Sans",
  nanumGothic: "Clean Gothic",
  nanumMyeongjo: "Classic Myeongjo",
  gowunDodum: "Soft Rounded",
  gowunBatang: "Elegant Serif"
};

function getWritingFont() {
  const saved = localStorage.getItem(WRITING_FONT_KEY);

  return WRITING_FONT_OPTIONS[saved]
    ? saved
    : "default";
}

function applyWritingFont(fontKey = getWritingFont()) {
  const validFont = WRITING_FONT_OPTIONS[fontKey]
    ? fontKey
    : "default";

  document.documentElement.setAttribute(
    "data-writing-font",
    validFont
  );

  localStorage.setItem(
    WRITING_FONT_KEY,
    validFont
  );
}

function initWritingFontSelect(selectElement) {
  if (!selectElement) return;

  selectElement.innerHTML = Object.entries(
    WRITING_FONT_OPTIONS
  )
    .map(([value, label]) => {
      return `<option value="${value}">${label}</option>`;
    })
    .join("");

  selectElement.value = getWritingFont();

  selectElement.addEventListener("change", () => {
    applyWritingFont(selectElement.value);
  });

  applyWritingFont(selectElement.value);
}

applyWritingFont();
