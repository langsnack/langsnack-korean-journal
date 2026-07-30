
const LS={state:"langsnackJournalStateV3",draft:"langsnackReviewDraftV3",submissions:"langsnackReviewSubmissionsV3"};
const STATUS={en:{pending:"Waiting for review",reviewing:"Review in progress",completed:"Review complete"},ko:{pending:"첨삭 대기 중",reviewing:"첨삭 중",completed:"첨삭 완료"}};
function getState(){const s=JSON.parse(localStorage.getItem(LS.state)||"{}");return {language:s.language||"en",profile:s.profile||{name:"",email:""},journal:s.journal||""}}
function saveState(s){localStorage.setItem(LS.state,JSON.stringify(s))}
function getSubmissions(){return JSON.parse(localStorage.getItem(LS.submissions)||"[]")}
function saveSubmissions(v){localStorage.setItem(LS.submissions,JSON.stringify(v))}
function statusText(s,l){return STATUS[l]?.[s]||s}
function statusClass(s){return `status-badge status-${s}`}
function stripHTML(html=""){const d=document.createElement("div");d.innerHTML=html;return (d.textContent||"").trim()}
function escapeHTML(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function formatDate(v,l="en"){return new Intl.DateTimeFormat(l==="ko"?"ko-KR":"en-GB",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(v))}
function toast(msg){const t=document.getElementById("toast");if(!t)return;t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
function makeId(){return "JR-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,6).toUpperCase()}
function initRichEditor(root){
  const editor=root.querySelector(".editor-content");
  root.querySelectorAll("[data-cmd]").forEach(btn=>btn.addEventListener("click",e=>{e.preventDefault();editor.focus();document.execCommand(btn.dataset.cmd,false,btn.dataset.value||null)}));
  const block=root.querySelector("[data-block]");if(block)block.onchange=()=>{editor.focus();document.execCommand("formatBlock",false,block.value)};
  const color=root.querySelector("[data-color]");if(color)color.oninput=()=>{editor.focus();document.execCommand("foreColor",false,color.value)};
  const highlight=root.querySelector("[data-highlight]");if(highlight)highlight.oninput=()=>{editor.focus();document.execCommand("hiliteColor",false,highlight.value)};
  const clear=root.querySelector("[data-clear]");if(clear)clear.onclick=e=>{e.preventDefault();editor.focus();document.execCommand("removeFormat")};
  return editor;
}
function richEditorHTML(id,placeholder){
return `<div class="rich-editor" id="${id}">
<div class="toolbar">
<button class="tool-btn" data-cmd="bold" title="Bold"><b>B</b></button>
<button class="tool-btn" data-cmd="italic" title="Italic"><i>I</i></button>
<button class="tool-btn" data-cmd="underline" title="Underline"><u>U</u></button>
<button class="tool-btn" data-cmd="strikeThrough" title="Strike">S̶</button>
<select data-block title="Text style"><option value="p">Paragraph</option><option value="h2">Heading</option><option value="blockquote">Quote</option></select>
<button class="tool-btn" data-cmd="insertUnorderedList" title="Bullets">• List</button>
<button class="tool-btn" data-cmd="insertOrderedList" title="Numbered list">1. List</button>
<label title="Text colour">A <input type="color" data-color value="#2f2a25"></label>
<label title="Highlight">▰ <input type="color" data-highlight value="#fff0a8"></label>
<button class="tool-btn" data-clear title="Clear formatting">Tx</button>
</div><div class="editor-content" contenteditable="true" data-placeholder="${escapeHTML(placeholder)}"></div></div>`;
}
