
const LS = {
  state: "langsnackJournalStateV2",
  reviewDraft: "langsnackReviewDraft",
  submissions: "langsnackReviewSubmissions"
};

const STATUS_LABELS = {
  en:{draft:"Draft",pending:"Waiting for review",completed:"Review complete"},
  ko:{draft:"작성 중",pending:"첨삭 대기 중",completed:"첨삭 완료"}
};

function getJournalState(){
  const state = JSON.parse(localStorage.getItem(LS.state) || "{}");
  return {
    entries:Array.isArray(state.entries)?state.entries:[],
    lastDraft:state.lastDraft||"",
    level:state.level||"starter",
    timezone:state.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone||"Asia/Seoul",
    language:state.language||"en",
    profile:state.profile||{name:"",email:""}
  };
}
function saveJournalState(state){localStorage.setItem(LS.state,JSON.stringify(state))}
function getSubmissions(){return JSON.parse(localStorage.getItem(LS.submissions)||"[]")}
function saveSubmissions(items){localStorage.setItem(LS.submissions,JSON.stringify(items))}
function showToast(message){
  const toast=document.getElementById("toast");
  if(!toast)return;
  toast.textContent=message;toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),2200);
}
function statusText(status,lang){return STATUS_LABELS[lang]?.[status]||STATUS_LABELS.en[status]||status}
function statusClass(status){return `status-badge status-${status}`}
function escapeHTML(value=""){
  return value.replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
}
function formatDate(iso,lang="en"){
  return new Intl.DateTimeFormat(lang==="ko"?"ko-KR":"en-GB",{year:"numeric",month:"long",day:"numeric"}).format(new Date(iso));
}
