
const state=getState();
const editId=new URLSearchParams(location.search).get('id');
const existing=editId?getSubmissions().find(x=>(x.id||x._id)===editId):null;
const draft=safeParse(sessionStorage.getItem(LS.reviewDraft),null)||{journal:state.journal||'',plain:state.journal||''};
studentEditorMount.innerHTML=richEditorHTML('studentEditor','Write here, or submit attachments only.');
const editor=initRichEditor(studentEditorMount);
editor.innerHTML=existing?.studentHtml||escapeHTML(existing?.studentPlain||draft.journal||draft.plain||'');
function todayInTimeZone(){
  try{
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:state.timeZone||state.timezone||'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const m=Object.fromEntries(parts.map(x=>[x.type,x.value]));
    return `${m.year}-${m.month}-${m.day}`;
  }catch{return new Date().toISOString().slice(0,10)}
}
function updateJournalDatePreview(){
  journalDatePreview.textContent=formatKoreanDateOnly(journalDateInput.value||todayInTimeZone());
}

function updateJournalDateVisibility(){
  journalDateField.hidden=categoryInput.value!=='Journal';
  if(!journalDateInput.value)journalDateInput.value=draft.journalDate||draft.date||todayInTimeZone();
  updateJournalDatePreview();
}
function generatedTitle(category,journalDate,plain){
  if(category==='Journal'){
    const d=journalDate||todayInTimeZone();
    return state.language==='ko'?`${d.replaceAll('-','. ')} 일기`:`Journal · ${d}`;
  }
  const labels={Sentences:'Sentence practice',Essay:'Essay',Story:'Story',Other:'Writing'};
  const first=(plain||'').split(/[.!?。！？\n]/)[0].trim();
  return first?`${labels[category]||category} · ${first.slice(0,34)}${first.length>34?'…':''}`:(labels[category]||category);
}
journalDateInput.value=todayInTimeZone();
categoryInput.addEventListener('change',updateJournalDateVisibility);
updateJournalDateVisibility();
if(existing){
  document.title='Edit work | Langsnack Notebook';
  document.querySelector('.nb-kicker').textContent='Edit submission';
  document.querySelector('.nb-page-head h1').textContent='Update your work';
  document.querySelector('.nb-page-head p').textContent='Make changes, then save your updated version.';
  categoryInput.value=existing.category||'Journal';
  journalDateInput.value=existing.journalDate||existing.submittedAt?.slice(0,10)||todayInTimeZone();
  questionInput.value=existing.studentNote||'';
  submitButton.textContent='Save changes';
}
let files=(existing?.attachments||[]).map(x=>({...x,existing:true}));
function drawFiles(){
  fileList.innerHTML='';
  files.forEach((f,i)=>{
    const row=document.createElement('div');row.className='nb-file';
    row.innerHTML=`<span>📎 <strong>${escapeHTML(f.name)}</strong> <small class="muted">${f.size?Math.ceil(f.size/1024)+' KB':''}</small></span><button type="button" aria-label="Remove">Remove</button>`;
    row.querySelector('button').onclick=()=>{files.splice(i,1);drawFiles()};fileList.appendChild(row)
  })
}
function addFiles(list){[...list].slice(0,10-files.length).forEach(f=>files.push(f));drawFiles()}
drawFiles();
dropzone.onclick=()=>fileInput.click();fileInput.onchange=()=>addFiles(fileInput.files);
['dragenter','dragover'].forEach(e=>dropzone.addEventListener(e,x=>{x.preventDefault();dropzone.classList.add('drag')}));
['dragleave','drop'].forEach(e=>dropzone.addEventListener(e,x=>{x.preventDefault();dropzone.classList.remove('drag')}));
dropzone.addEventListener('drop',e=>addFiles(e.dataTransfer.files));
submitButton.onclick=()=>{
  if(!isNotebookMember()){
    loginRequiredModal.hidden=false;
    document.body.classList.add("modal-open");
    return;
  }
  const html=editor.innerHTML.trim(),plain=stripHTML(html);
  if(!plain&&!files.length)return toast('Add writing or at least one file.');
  const all=getSubmissions()||[];
  const now=new Date().toISOString();
  if(existing){
    const idx=all.findIndex(x=>(x.id||x._id)===editId);
    if(idx>=0){
      all[idx]={...all[idx],title:generatedTitle(categoryInput.value,journalDateInput.value,plain),category:categoryInput.value,journalDate:categoryInput.value==='Journal'?journalDateInput.value:null,studentHtml:html,studentPlain:plain,studentNote:questionInput.value.trim(),attachments:files.map(f=>({name:f.name,size:f.size,type:f.type})),studentUpdatedAt:now,status:all[idx].status==='completed'?'pending':all[idx].status};
      saveSubmissions(all);toast('Your changes were saved.');
    }
  }else{
    const item={id:makeId(),memberId:getAuthSession().memberId,studentName:state.profile.name||'Student',studentEmail:state.profile.email||'',title:generatedTitle(categoryInput.value,journalDateInput.value,plain),category:categoryInput.value,journalDate:categoryInput.value==='Journal'?journalDateInput.value:null,studentHtml:html,studentPlain:plain,studentNote:questionInput.value.trim(),attachments:files.map(f=>({name:f.name,size:f.size,type:f.type})),teacherHtml:'',teacherNote:'',status:'pending',submittedAt:now,studentUpdatedAt:now,reviewStartedAt:null,completedAt:null};
    all.unshift(item);saveSubmissions(all);
    if(questionInput.value.trim())addThreadMessage(item.id,{author:'student',name:state.profile.name||'Student',text:questionInput.value.trim()});
    window.parent?.postMessage({source:'langsnack-journal',type:'submissionCreated',payload:item},'*');
    sessionStorage.removeItem(LS.reviewDraft);
    submissionModal.hidden=false;
    document.body.classList.add('modal-open');
    return;
  }
  setTimeout(()=>location.href='history.html',350)
};
understandButton.onclick=()=>{location.href='history.html'};
submissionLoginButton.onclick=requestNotebookLogin;

function applySubmissionAuth(){
  const auth=getAuthSession();
  if(!auth.loggedIn){
    submitButton.textContent=state.language==='ko'?'로그인 후 제출':'Log in to submit';
  }else{
    submitButton.textContent=existing?'Save changes':'Submit work';
    loginRequiredModal.hidden=true;
    document.body.classList.remove('modal-open');
  }
}
window.addEventListener('langsnack:auth-change',applySubmissionAuth);
applySubmissionAuth();
document.querySelector('[data-nav="work"]').classList.add('active');languageSelect.value=state.language;
