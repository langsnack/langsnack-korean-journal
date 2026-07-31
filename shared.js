
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


/* =========================================================
   WIX MEMBER / GUEST SESSION
   ========================================================= */
const AUTH_SESSION_KEY = "langsnackNotebookAuthSession";

function getAuthSession() {
  return safeParse(sessionStorage.getItem(AUTH_SESSION_KEY), {
    loggedIn: false,
    memberId: "",
    name: "",
    email: ""
  });
}

function setAuthSession(value) {
  const session = {
    loggedIn: Boolean(value?.loggedIn),
    memberId: String(value?.memberId || ""),
    name: String(value?.name || ""),
    email: String(value?.email || "")
  };

  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));

  if (session.loggedIn) {
    const journal = getJournalState();
    journal.profile = {
      name: session.name || journal.profile?.name || "",
      email: session.email || journal.profile?.email || ""
    };
    saveJournalState(journal);
  }

  window.dispatchEvent(new CustomEvent("langsnack:auth-change", {
    detail: session
  }));

  return session;
}

function isNotebookMember() {
  return getAuthSession().loggedIn;
}

function requestNotebookLogin() {
  window.parent?.postMessage({
    source: "langsnack-journal",
    type: "loginRequested"
  }, "*");
}

function announceNotebookReady() {
  window.parent?.postMessage({
    source: "langsnack-journal",
    type: "appReady"
  }, "*");
}

window.addEventListener("message", event => {
  const message = event.data;

  if (!message || message.source !== "langsnack-wix") return;

  if (message.type === "memberState") {
    setAuthSession(message.payload || {});
  }

  if (message.type === "submissionDeleted") {
    window.dispatchEvent(new CustomEvent("langsnack:submission-deleted", {
      detail: message.payload || {}
    }));
  }

  if (message.type === "submissionDeleteError") {
    window.dispatchEvent(new CustomEvent("langsnack:submission-delete-error", {
      detail: message.payload || {}
    }));
  }
});

window.addEventListener("load", () => {
  window.setTimeout(announceNotebookReady, 150);
});

/* =========================================================
   ACHIEVEMENT SYSTEM
   ========================================================= */
const NOTEBOOK_BADGES = [
  {key:"first",titleKo:"첫 제출",titleEn:"First submission",descKo:"첫 번째 글을 제출해요",descEn:"Submit your first writing",goal:1,type:"submissions"},
  {key:"three",titleKo:"좋은 시작",titleEn:"Off to a good start",descKo:"글을 3번 제출해요",descEn:"Submit 3 writings",goal:3,type:"submissions"},
  {key:"five",titleKo:"글쓰기 루틴",titleEn:"Writing routine",descKo:"글을 5번 제출해요",descEn:"Submit 5 writings",goal:5,type:"submissions"},
  {key:"ten",titleKo:"집중력 작가",titleEn:"Focused writer",descKo:"글을 10번 제출해요",descEn:"Submit 10 writings",goal:10,type:"submissions"},
  {key:"twenty",titleKo:"꾸준한 작가",titleEn:"Dedicated writer",descKo:"글을 20번 제출해요",descEn:"Submit 20 writings",goal:20,type:"submissions"},
  {key:"fifty",titleKo:"기록 수집가",titleEn:"Writing collector",descKo:"글을 50번 제출해요",descEn:"Submit 50 writings",goal:50,type:"submissions"},
  {key:"streak3",titleKo:"3일의 시작",titleEn:"Three-day spark",descKo:"3일 연속으로 글을 써요",descEn:"Write for 3 days in a row",goal:3,type:"streak"},
  {key:"streak7",titleKo:"일주일의 습관",titleEn:"One-week habit",descKo:"7일 연속으로 글을 써요",descEn:"Write for 7 days in a row",goal:7,type:"streak"},
  {key:"streak14",titleKo:"꾸준한 발걸음",titleEn:"Steady steps",descKo:"14일 연속으로 글을 써요",descEn:"Write for 14 days in a row",goal:14,type:"streak"},
  {key:"streak30",titleKo:"한 달의 기록",titleEn:"A month of writing",descKo:"30일 연속으로 글을 써요",descEn:"Write for 30 days in a row",goal:30,type:"streak"},
  {key:"feedback1",titleKo:"첫 피드백",titleEn:"First feedback",descKo:"첫 번째 첨삭을 받아요",descEn:"Receive your first review",goal:1,type:"completed"},
  {key:"feedback5",titleKo:"피드백 수집가",titleEn:"Feedback seeker",descKo:"첨삭을 5번 받아요",descEn:"Receive 5 reviews",goal:5,type:"completed"},
  {key:"feedback10",titleKo:"성장하는 작가",titleEn:"Growing writer",descKo:"첨삭을 10번 받아요",descEn:"Receive 10 reviews",goal:10,type:"completed"},
  {key:"question1",titleKo:"첫 질문",titleEn:"First question",descKo:"첨삭 질문을 처음 남겨요",descEn:"Ask your first question",goal:1,type:"questions"},
  {key:"question5",titleKo:"궁금증 탐험가",titleEn:"Curious learner",descKo:"질문을 5번 남겨요",descEn:"Ask 5 questions",goal:5,type:"questions"},
  {key:"saved1",titleKo:"첫 설명 저장",titleEn:"First saved note",descKo:"도움이 된 설명을 처음 저장해요",descEn:"Save your first explanation",goal:1,type:"saved"},
  {key:"saved5",titleKo:"설명 수집가",titleEn:"Knowledge keeper",descKo:"설명을 5개 저장해요",descEn:"Save 5 explanations",goal:5,type:"saved"},
  {key:"chars500",titleKo:"500자의 기록",titleEn:"500 characters",descKo:"누적 500자를 작성해요",descEn:"Write 500 Korean characters",goal:500,type:"characters"},
  {key:"chars2000",titleKo:"2,000자의 성장",titleEn:"2,000 characters",descKo:"누적 2,000자를 작성해요",descEn:"Write 2,000 Korean characters",goal:2000,type:"characters"},
  {key:"chars10000",titleKo:"만 자 작가",titleEn:"Ten-thousand writer",descKo:"누적 10,000자를 작성해요",descEn:"Write 10,000 Korean characters",goal:10000,type:"characters"}
];

function calculateNotebookStreak(entries = getJournalState().entries) {
  const dates = [...new Set((entries || []).map(item => item.date).filter(Boolean))].sort();
  if (!dates.length) return 0;

  const today = new Date();
  const key = date => date.toISOString().slice(0, 10);
  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  if (!dates.includes(key(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (dates.includes(key(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function getNotebookBadgeValues() {
  const submissions = getSubmissions() || [];
  const saved = safeParse(localStorage.getItem("langsnackSavedExplanations"), []);
  return {
    submissions: submissions.length,
    streak: calculateNotebookStreak(),
    completed: submissions.filter(item => item.status === "completed").length,
    questions: submissions.filter(item => String(item.studentNote || "").trim()).length,
    saved: Array.isArray(saved) ? saved.length : 0,
    characters: submissions.reduce(
      (total, item) => total + String(item.studentPlain || "").replace(/\s/g, "").length,
      0
    )
  };
}

function getNotebookBadgeProgress() {
  const values = getNotebookBadgeValues();
  return NOTEBOOK_BADGES.map((badge, index) => {
    const value = Number(values[badge.type] || 0);
    const earned = value >= badge.goal;
    return {
      ...badge,
      index,
      value,
      earned,
      percent: Math.min(100, Math.round((value / badge.goal) * 100))
    };
  });
}

function getNextNotebookBadge() {
  const progress = getNotebookBadgeProgress();
  return progress.find(item => !item.earned) || progress[progress.length - 1];
}
