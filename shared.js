
const LS = {
  journalState: "langsnackJournalState",
  reviewDraft: "langsnackReviewDraftV3",
  submissions: "langsnackReviewSubmissionsV3"
};

const STATUS = {
  en: { pending: "Waiting for review", reviewing: "Review in progress", completed: "Review complete" },
  ko: { pending: "첨삭 대기 중", reviewing: "첨삭 중", completed: "첨삭 완료" }
};

function safeParse(value, fallback) {
  try { return JSON.parse(value); } catch { return fallback; }
}

function detectTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul";
  } catch {
    return "Asia/Seoul";
  }
}

function getJournalState() {
  const saved = safeParse(localStorage.getItem(LS.journalState), {});
  return {
    entries: Array.isArray(saved.entries) ? saved.entries : [],
    lastDraft: saved.lastDraft || "",
    level: saved.level || "starter",
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
  const journal = getJournalState();
  return {
    language: journal.language,
    timeZone: journal.timezone,
    timezone: journal.timezone,
    profile: journal.profile,
    journal: journal.lastDraft
  };
}

function saveState(state) {
  const journal = getJournalState();
  journal.language = state.language || journal.language;
  journal.timezone = state.timeZone || state.timezone || journal.timezone;
  journal.profile = state.profile || journal.profile;
  if (typeof state.journal === "string") journal.lastDraft = state.journal;
  saveJournalState(journal);
}

function getSubmissions() {
  return safeParse(localStorage.getItem(LS.submissions), []);
}

function saveSubmissions(items) {
  localStorage.setItem(LS.submissions, JSON.stringify(items));
}

function statusText(status, language = "en") {
  return STATUS[language]?.[status] || status;
}

function statusClass(status) {
  return `status-badge status-${status}`;
}

function stripHTML(html = "") {
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || "").trim();
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

function formatDate(value, language = "en") {
  const state = getJournalState();
  return new Intl.DateTimeFormat(language === "ko" ? "ko-KR" : "en-GB", {
    timeZone: state.timezone,
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function showToast(message) {
  const element = document.getElementById("toast");
  if (!element) return;
  element.textContent = message;
  element.classList.add("show");
  setTimeout(() => element.classList.remove("show"), 2200);
}

function toast(message) { showToast(message); }

function makeId() {
  return "JR-" + Date.now().toString(36).toUpperCase() + "-" +
    Math.random().toString(36).slice(2, 6).toUpperCase();
}

function initRichEditor(root) {
  const editor = root.querySelector(".editor-content");
  root.querySelectorAll("[data-cmd]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      editor.focus();
      document.execCommand(button.dataset.cmd, false, button.dataset.value || null);
    });
  });
  const block = root.querySelector("[data-block]");
  if (block) block.onchange = () => {
    editor.focus();
    document.execCommand("formatBlock", false, block.value);
  };
  const color = root.querySelector("[data-color]");
  if (color) color.oninput = () => {
    editor.focus();
    document.execCommand("foreColor", false, color.value);
  };
  const highlight = root.querySelector("[data-highlight]");
  if (highlight) highlight.oninput = () => {
    editor.focus();
    document.execCommand("hiliteColor", false, highlight.value);
  };
  const clear = root.querySelector("[data-clear]");
  if (clear) clear.onclick = event => {
    event.preventDefault();
    editor.focus();
    document.execCommand("removeFormat");
  };
  return editor;
}

function richEditorHTML(id, placeholder) {
  return `<div class="rich-editor" id="${escapeHTML(id)}">
    <div class="toolbar">
      <button class="tool-btn" data-cmd="bold"><b>B</b></button>
      <button class="tool-btn" data-cmd="italic"><i>I</i></button>
      <button class="tool-btn" data-cmd="underline"><u>U</u></button>
      <button class="tool-btn" data-cmd="strikeThrough">S̶</button>
      <select data-block><option value="p">Paragraph</option><option value="h2">Heading</option><option value="blockquote">Quote</option></select>
      <button class="tool-btn" data-cmd="insertUnorderedList">• List</button>
      <button class="tool-btn" data-cmd="insertOrderedList">1. List</button>
      <label>A <input type="color" data-color value="#2f2a25"></label>
      <label>▰ <input type="color" data-highlight value="#fff0a8"></label>
      <button class="tool-btn" data-clear>Tx</button>
    </div>
    <div class="editor-content" contenteditable="true" data-placeholder="${escapeHTML(placeholder)}"></div>
  </div>`;
}


// Notebook V2 additions
LS.bookmarks = "langsnackNotebookBookmarksV2";
LS.threads = "langsnackNotebookThreadsV2";

function getBookmarks() { return safeParse(localStorage.getItem(LS.bookmarks), []); }
function saveBookmarks(items) { localStorage.setItem(LS.bookmarks, JSON.stringify(items)); }
function toggleBookmark(item) {
  const items=getBookmarks();
  const key=item.key || `${item.submissionId}:${item.text}`;
  const idx=items.findIndex(x=>x.key===key);
  if(idx>=0){ items.splice(idx,1); saveBookmarks(items); return false; }
  items.unshift({...item,key,savedAt:new Date().toISOString()}); saveBookmarks(items); return true;
}
function isBookmarked(key){return getBookmarks().some(x=>x.key===key)}
function getThreads(){return safeParse(localStorage.getItem(LS.threads), {})}
function saveThreads(value){localStorage.setItem(LS.threads,JSON.stringify(value))}
function threadFor(id){return getThreads()[id]||[]}
function addThreadMessage(id,message){const all=getThreads();all[id]=all[id]||[];all[id].push({...message,id:makeId(),createdAt:new Date().toISOString()});saveThreads(all);return all[id]}
function relativeDate(value){
  const diff=Date.now()-new Date(value).getTime(), min=Math.floor(diff/60000), hr=Math.floor(min/60), day=Math.floor(hr/24);
  if(min<1)return "just now"; if(min<60)return `${min}m ago`; if(hr<24)return `${hr}h ago`; if(day<7)return `${day}d ago`; return formatDate(value).split(',')[0];
}
