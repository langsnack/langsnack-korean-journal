const LS = {
  state: "langsnackJournalStateV4",
  draft: "langsnackReviewDraftV4",
  submissions: "langsnackReviewSubmissionsV4",
  timezone: "langsnackTimeZone"
};

const STATUS = {
  en: {
    pending: "Waiting for review",
    reviewing: "Review in progress",
    completed: "Review complete"
  },
  ko: {
    pending: "첨삭 대기 중",
    reviewing: "첨삭 중",
    completed: "첨삭 완료"
  }
};

function safeJSON(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function detectedTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul";
  } catch {
    return "Asia/Seoul";
  }
}

function getTimeZone() {
  return (
    localStorage.getItem(LS.timezone) ||
    safeJSON(localStorage.getItem(LS.state), {})?.timeZone ||
    detectedTimeZone()
  );
}

function getState() {
  const saved = safeJSON(localStorage.getItem(LS.state), {});
  return {
    language: saved.language || "en",
    timeZone: saved.timeZone || getTimeZone(),
    profile: saved.profile || { name: "", email: "" },
    journal: saved.journal || ""
  };
}

function saveState(state) {
  const next = {
    ...state,
    timeZone: state.timeZone || getTimeZone()
  };
  localStorage.setItem(LS.state, JSON.stringify(next));
  localStorage.setItem(LS.timezone, next.timeZone);
}

function setTimeZone(timeZone) {
  if (!timeZone) return;
  localStorage.setItem(LS.timezone, timeZone);
  const state = getState();
  state.timeZone = timeZone;
  saveState(state);
}

function getSubmissions() {
  return safeJSON(localStorage.getItem(LS.submissions), []);
}

function saveSubmissions(value) {
  localStorage.setItem(LS.submissions, JSON.stringify(value));
}

function statusText(status, language) {
  return STATUS[language]?.[status] || status;
}

function statusClass(status) {
  return `status-badge status-${status}`;
}

function stripHTML(html = "") {
  const element = document.createElement("div");
  element.innerHTML = html;
  return (element.textContent || "").trim();
}

function escapeHTML(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    character =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[character]
  );
}

function formatDate(value, language = "en", timeZone = getTimeZone()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  try {
    return new Intl.DateTimeFormat(language === "ko" ? "ko-KR" : "en-GB", {
      timeZone,
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat(language === "ko" ? "ko-KR" : "en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }
}

function toast(message) {
  const element = document.getElementById("toast");
  if (!element) return;
  element.textContent = message;
  element.classList.add("show");
  window.setTimeout(() => element.classList.remove("show"), 2200);
}

function makeId() {
  return (
    "JR-" +
    Date.now().toString(36).toUpperCase() +
    "-" +
    Math.random().toString(36).slice(2, 6).toUpperCase()
  );
}

function initRichEditor(root) {
  const editor = root.querySelector(".editor-content");
  if (!editor) throw new Error("Rich text editor element was not found.");

  root.querySelectorAll("[data-cmd]").forEach(button => {
    button.addEventListener("mousedown", event => event.preventDefault());
    button.addEventListener("click", event => {
      event.preventDefault();
      editor.focus();
      document.execCommand(
        button.dataset.cmd,
        false,
        button.dataset.value || null
      );
    });
  });

  const block = root.querySelector("[data-block]");
  if (block) {
    block.addEventListener("change", () => {
      editor.focus();
      document.execCommand("formatBlock", false, block.value);
    });
  }

  const color = root.querySelector("[data-color]");
  if (color) {
    color.addEventListener("input", () => {
      editor.focus();
      document.execCommand("foreColor", false, color.value);
    });
  }

  const highlight = root.querySelector("[data-highlight]");
  if (highlight) {
    highlight.addEventListener("input", () => {
      editor.focus();
      document.execCommand("hiliteColor", false, highlight.value);
    });
  }

  const clear = root.querySelector("[data-clear]");
  if (clear) {
    clear.addEventListener("click", event => {
      event.preventDefault();
      editor.focus();
      document.execCommand("removeFormat");
    });
  }

  return editor;
}

function richEditorHTML(id, placeholder) {
  return `<div class="rich-editor" id="${escapeHTML(id)}">
    <div class="toolbar" role="toolbar" aria-label="Text formatting">
      <button type="button" class="tool-btn" data-cmd="bold" title="Bold" aria-label="Bold"><b>B</b></button>
      <button type="button" class="tool-btn" data-cmd="italic" title="Italic" aria-label="Italic"><i>I</i></button>
      <button type="button" class="tool-btn" data-cmd="underline" title="Underline" aria-label="Underline"><u>U</u></button>
      <button type="button" class="tool-btn" data-cmd="strikeThrough" title="Strikethrough" aria-label="Strikethrough">S̶</button>
      <select data-block title="Text style" aria-label="Text style">
        <option value="p">Paragraph</option>
        <option value="h2">Heading</option>
        <option value="blockquote">Quote</option>
      </select>
      <button type="button" class="tool-btn" data-cmd="insertUnorderedList" title="Bullet list">• List</button>
      <button type="button" class="tool-btn" data-cmd="insertOrderedList" title="Numbered list">1. List</button>
      <label class="colour-tool" title="Text colour">A <input type="color" data-color value="#2f2a25" aria-label="Text colour"></label>
      <label class="colour-tool" title="Highlight">▰ <input type="color" data-highlight value="#fff0a8" aria-label="Highlight colour"></label>
      <button type="button" class="tool-btn" data-clear title="Clear formatting" aria-label="Clear formatting">Tx</button>
    </div>
    <div class="editor-content" contenteditable="true" spellcheck="true" data-placeholder="${escapeHTML(placeholder)}"></div>
  </div>`;
}

function bindTimezone(state, render) {
  window.addEventListener("langsnack:timezone-change", event => {
    state.timeZone = event.detail.timeZone;
    saveState(state);
    if (typeof render === "function") render();
  });
}
