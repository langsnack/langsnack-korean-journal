
const state=getState();
function renderAchievement(){
 const next=getNextNotebookBadge();
 const progress=getNotebookBadgeProgress();
 const earned=progress.filter(item=>item.earned).slice(-4).reverse();

 miniAchievement.innerHTML=`<div class="history-achievement-head">
   <span class="badge-medal">✦</span>
   <div class="mini-achievement-copy">
     <small>${state.language==="ko"?"다음 배지":"Next achievement"}</small>
     <strong>${state.language==="ko"?next.titleKo:next.titleEn}</strong>
     <span class="muted">${state.language==="ko"?next.descKo:next.descEn}</span>
     <div class="badge-progress"><div class="badge-progress-bar"><i style="width:${next.percent}%"></i></div><b>${Math.min(next.value,next.goal)} / ${next.goal}</b></div>
   </div>
 </div>
 <div class="history-badge-peek">
   ${earned.length?earned.map(item=>`<span title="${state.language==="ko"?item.descKo:item.descEn}"><b>✓</b>${state.language==="ko"?item.titleKo:item.titleEn}</span>`).join(""):`<span class="muted">${state.language==="ko"?"첫 글을 제출하고 첫 배지를 받아 보세요.":"Submit your first writing to earn a badge."}</span>`}
 </div>
 <button class="button-ghost history-view-badges" id="historyViewBadges" type="button">${state.language==="ko"?"배지 모두 보기":"View all badges"}</button>`;

 historyViewBadges.onclick=()=>{historyBadgeModal.hidden=false;document.body.classList.add("modal-open")};
 historyAllBadges.innerHTML=progress.map(item=>`<article class="all-badge ${item.earned?"earned":""}">
   <span class="all-badge-icon">${item.earned?"✓":"✦"}</span>
   <div><strong>${state.language==="ko"?item.titleKo:item.titleEn}</strong><p>${state.language==="ko"?item.descKo:item.descEn}</p><div class="badge-progress-bar"><i style="width:${item.percent}%"></i></div><small>${Math.min(item.value,item.goal)} / ${item.goal}</small></div>
 </article>`).join("");
}
function draw(){
 const auth=getAuthSession();
 historyLoginButton.textContent=auth.loggedIn?(auth.name||"Member"):(state.language==="ko"?"로그인 / 회원가입":"Log in / Sign up");
 historyLoginButton.onclick=auth.loggedIn?()=>{}:requestNotebookLogin;
 if(!auth.loggedIn){
   workList.innerHTML=`<div class="nb-empty guest-history-empty"><h2>${state.language==="ko"?"게스트 모드예요":"You’re in Guest Mode"}</h2><p>${state.language==="ko"?"내 글을 저장하고 확인하려면 로그인해 주세요.":"Log in to save and view your work across devices."}</p><button class="button button-primary" id="historyGuestLogin">${state.language==="ko"?"로그인 / 회원가입":"Log in / Sign up"}</button></div>`;
   document.getElementById("historyGuestLogin").onclick=requestNotebookLogin;
   return;
 }
 const q=searchInput.value.toLowerCase(),s=statusInput.value;
 const all=getSubmissions().filter(x=>(s==='all'||x.status===s)&&`${x.title||''} ${x.studentPlain||''} ${x.category||''}`.toLowerCase().includes(q));
 workList.innerHTML=all.length?'':'<div class="nb-empty"><h2>No work here yet</h2><p>Start a new writing from your notebook.</p></div>';
 all.forEach(x=>{
  const id=encodeURIComponent(x.id||x._id);
  const row=document.createElement('article');row.className='nb-work-card-wrap';
  row.innerHTML=`<a class="nb-work-card-main" href="submission.html?id=${id}"><span class="nb-work-icon">${x.category==='Sentences'?'≡':'✎'}</span><span><strong>${escapeHTML(x.title||x.category||'Untitled')}</strong><p>${x.journalDate?`<small class="journal-date">${escapeHTML(formatKoreanDateOnly(x.journalDate))}</small>`:""}${escapeHTML((x.studentPlain||x.attachments?.map(a=>a.name).join(', ')||'Attachment submission').slice(0,100))}</p></span><span style="text-align:right"><span class="${statusClass(x.status)}">${statusText(x.status,state.language)}</span><time style="display:block;margin-top:8px">${relativeDate(x.submittedAt)}</time></span></a><div class="nb-work-actions"><a class="button-ghost" href="submission.html?id=${id}">Re-read</a><a class="button button-secondary" href="submit.html?id=${id}">Edit</a><button class="button-danger-soft" type="button" data-delete-id="${escapeHTML(x.id||x._id)}">Delete</button></div>`;
  workList.appendChild(row);
  row.querySelector("[data-delete-id]")?.addEventListener("click",event=>{
    event.preventDefault();
    openDeleteModal(event.currentTarget.dataset.deleteId);
  });
 })
}

let pendingDeleteId=null;

function openDeleteModal(id){
 pendingDeleteId=id;
 deleteConfirmInput.value="";
 confirmDeleteButton.disabled=true;
 deleteConfirmModal.hidden=false;
 document.body.classList.add("modal-open");
 deleteConfirmInput.focus();
}

function closeDeleteModal(){
 pendingDeleteId=null;
 deleteConfirmModal.hidden=true;
 document.body.classList.remove("modal-open");
}

deleteConfirmInput.addEventListener("input",()=>{
 confirmDeleteButton.disabled=deleteConfirmInput.value.trim()!=="삭제";
});

cancelDeleteButton.onclick=closeDeleteModal;
document.querySelector(".delete-confirm-backdrop").onclick=closeDeleteModal;

confirmDeleteButton.onclick=()=>{
 if(deleteConfirmInput.value.trim()!=="삭제"||!pendingDeleteId)return;

 const auth=getAuthSession();
 const id=pendingDeleteId;

 saveSubmissions((getSubmissions()||[]).filter(item=>(item.id||item._id)!==id));
 window.parent?.postMessage({
   source:"langsnack-journal",
   type:"deleteSubmissionRequested",
   payload:{submissionId:id,memberId:auth.memberId}
 },"*");

 closeDeleteModal();
 showToast(state.language==="ko"?"글을 영구 삭제했어요.":"The writing was permanently deleted.");
 renderAchievement();
 draw();
};

document.querySelectorAll("[data-close-history-badges]").forEach(element=>{
 element.onclick=()=>{historyBadgeModal.hidden=true;document.body.classList.remove("modal-open")};
});

window.addEventListener("langsnack:auth-change",()=>{
 renderAchievement();
 draw();
});

searchInput.oninput=draw;statusInput.onchange=draw;document.querySelector('[data-nav="work"]').classList.add('active');languageSelect.value=state.language;renderAchievement();draw();
