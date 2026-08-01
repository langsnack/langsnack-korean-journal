
    const state = getState();
    let selectedId = null;
    const snippets = {
      en: ["Great improvement!", "This sounds natural.", "Please check the particle here.", "Watch the spacing.", "Good vocabulary choice.", "Try connecting these ideas more smoothly."],
      ko: ["많이 자연스러워졌어요!", "이 표현은 자연스러워요.", "여기 조사를 다시 확인해 주세요.", "띄어쓰기를 확인해 주세요.", "어휘 선택이 좋아요.", "두 문장을 조금 더 자연스럽게 연결해 보세요."]
    };
    const T = {
      en: {waiting:"Waiting",progress:"In progress",complete:"Completed",total:"Total records",all:"All",search:"Search student or writing",select:"Select a submission",original:"Student version",corrected:"Corrected version",studentNote:"Student note",feedback:"Feedback for student",start:"Start review",save:"Save draft",return:"Return to student",reopen:"Reopen review",delete:"Delete",started:"Review started.",saved:"Draft saved.",returned:"Review returned to the student.",reopened:"Review reopened.",deleted:"Submission deleted.",noNote:"No note from the student",quick:"Quick feedback",details:"Submission details",words:"Words",submitted:"Submitted",updated:"Last updated",email:"Email",status:"Status"},
      ko: {waiting:"첨삭 대기",progress:"첨삭 중",complete:"첨삭 완료",total:"전체 기록",all:"전체",search:"학생 이름이나 글 검색",select:"첨삭할 글 선택",original:"학생 원문",corrected:"첨삭본",studentNote:"학생이 전한 말",feedback:"학생에게 보낼 피드백",start:"첨삭 시작",save:"임시 저장",return:"학생에게 보내기",reopen:"첨삭 다시 열기",delete:"삭제",started:"첨삭을 시작했어요.",saved:"임시 저장했어요.",returned:"학생에게 첨삭본을 보냈어요.",reopened:"첨삭을 다시 열었어요.",deleted:"기록을 삭제했어요.",noNote:"학생이 남긴 메시지가 없어요",quick:"빠른 피드백",details:"제출 정보",words:"단어 수",submitted:"제출 시간",updated:"최근 수정",email:"이메일",status:"상태"}
    };

    function items(){ return getSubmissions() || []; }
    function safeDate(value){ const d=new Date(value); return Number.isNaN(d.getTime()) ? null : d; }
    function sameDay(a,b){ return a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate(); }
    function relativeTime(value){
      return formatKoreanDate(value,{includeTime:true,includeWeekday:true});
    }m ago`; if(sec<86400)return `${Math.floor(sec/3600)}h ago`; if(sec<604800)return `${Math.floor(sec/86400)}d ago`; return formatDate(value,state.language); }
    function wordCount(text){ return String(text||"").trim() ? String(text).trim().split(/\s+/).length : 0; }

    function renderHeader(){
      const now=new Date(); const hour=now.getHours();
      const phrase=state.language==="ko" ? (hour<12?"좋은 아침이에요, 니콜쌤":hour<18?"좋은 오후예요, 니콜쌤":"좋은 저녁이에요, 니콜쌤") : (hour<12?"Good morning, Nicole":hour<18?"Good afternoon, Nicole":"Good evening, Nicole");
      greeting.textContent=phrase;
      todayLabel.textContent=new Intl.DateTimeFormat("ko-KR",{timeZone:state.timezone,weekday:"long",year:"numeric",month:"long",day:"numeric"}).format(now);
      language.value=state.language;
    }

    function renderStats(){
      const a=items(), now=new Date();
      const pending=a.filter(x=>x.status==="pending"), reviewing=a.filter(x=>x.status==="reviewing"), completed=a.filter(x=>x.status==="completed");
      pendingCount.textContent=pending.length; reviewCount.textContent=reviewing.length; completeCount.textContent=completed.length; totalCount.textContent=a.length;
      const t=T[state.language]; pendingLabel.textContent=t.waiting; reviewLabel.textContent=t.progress; completeLabel.textContent=t.complete; totalLabel.textContent=t.total;
      const oldest=pending.map(x=>safeDate(x.submittedAt)).filter(Boolean).sort((a,b)=>a-b)[0];
      oldestPending.textContent=oldest ? `Oldest: ${relativeTime(oldest)}` : (state.language==="ko"?"대기 중인 글이 없어요":"No waiting submissions");
      draftHint.textContent=state.language==="ko"?`${reviewing.length}개 임시 첨삭 중`:`${reviewing.length} draft${reviewing.length===1?"":"s"} in progress`;
      const todayDone=completed.filter(x=>sameDay(safeDate(x.completedAt),now)).length;
      completedToday.textContent=state.language==="ko"?`오늘 ${todayDone}개 완료`:`${todayDone} returned today`;
      const unique=new Set(a.map(x=>x.memberId||x.studentEmail||x.studentName).filter(Boolean));
      studentCount.textContent=state.language==="ko"?`${unique.size}명 학생`:`${unique.size} student${unique.size===1?"":"s"}`;

      const unresolved=pending.length+reviewing.length;
      const pct=a.length ? Math.max(0,Math.round((completed.length/a.length)*100)) : 100;
      healthPercent.textContent=`${pct}%`; healthRing.style.setProperty("--health",`${pct}%`);
      healthText.textContent=unresolved===0?(state.language==="ko"?"모두 처리했어요":"All caught up"):(state.language==="ko"?`${unresolved}개 처리 필요`:`${unresolved} need attention`);
      healthSubtext.textContent=pending.length?(state.language==="ko"?`${pending.length}개가 첨삭을 기다리고 있어요.`:`${pending.length} submission${pending.length===1?" is":"s are"} waiting.`):(state.language==="ko"?"새 제출을 기다리고 있어요.":"Waiting for new submissions.");
    }

    function renderWeekly(){
      const labels=state.language==="ko"?["월","화","수","목","금","토","일"]:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
      const now=new Date(); const day=(now.getDay()+6)%7; const monday=new Date(now); monday.setHours(0,0,0,0); monday.setDate(now.getDate()-day);
      const counts=Array(7).fill(0);
      items().forEach(x=>{const d=safeDate(x.submittedAt); if(!d)return; const diff=Math.floor((d-monday)/86400000); if(diff>=0&&diff<7)counts[diff]++;});
      const max=Math.max(1,...counts); weeklyTotal.textContent=counts.reduce((a,b)=>a+b,0);
      weeklyChart.innerHTML=counts.map((n,i)=>`<div class="chart-day"><div class="bar-wrap"><span class="bar" style="height:${Math.max(8,(n/max)*100)}%"><em>${n}</em></span></div><small>${labels[i]}</small></div>`).join("");
    }

    function renderActiveStudents(){
      const map=new Map(); items().forEach(x=>{const key=x.memberId||x.studentEmail||x.studentName||"Student"; const prev=map.get(key)||{name:x.studentName||"Student",count:0,latest:x.submittedAt}; prev.count++; if(new Date(x.submittedAt)>new Date(prev.latest))prev.latest=x.submittedAt; map.set(key,prev);});
      const top=[...map.values()].sort((a,b)=>b.count-a.count).slice(0,3);
      activeStudents.innerHTML=top.length?top.map((x,i)=>`<div class="active-student"><span class="rank">${i+1}</span><div class="avatar">${escapeHTML((x.name||"S").charAt(0).toUpperCase())}</div><div><strong>${escapeHTML(x.name)}</strong><small>${x.count} journal${x.count===1?"":"s"}</small></div></div>`).join(""):`<div class="widget-empty">No student data yet</div>`;
    }

    function renderQueue(){
      const q=search.value.toLowerCase().trim(), f=statusFilter.value;
      const filtered=items().filter(x=>(f==="all"||x.status===f)&&(`${x.studentName||""} ${x.studentPlain||""}`.toLowerCase().includes(q))).sort((a,b)=>new Date(b.submittedAt)-new Date(a.submittedAt));
      queue.innerHTML="";
      filtered.forEach(x=>{const b=document.createElement("button"); const id=x._id||x.id; b.className=`teacher-queue-item ${id===selectedId?"active":""}`; b.innerHTML=`<div class="queue-item-top"><div class="queue-person"><span class="avatar">${escapeHTML((x.studentName||"S").charAt(0).toUpperCase())}</span><div><strong>${escapeHTML(x.studentName||"Student")}</strong><small>${relativeTime(x.submittedAt)} · ${wordCount(x.studentPlain)} words</small></div></div><span class="${statusClass(x.status)}">${statusText(x.status,state.language)}</span></div><p>${escapeHTML((x.studentPlain||"").slice(0,120))}${(x.studentPlain||"").length>120?"…":""}</p>`; b.onclick=()=>{selectedId=id; renderQueue(); renderWorkspace();}; queue.appendChild(b);});
      if(!filtered.length) queue.innerHTML=`<div class="queue-empty">${state.language==="ko"?"조건에 맞는 제출이 없어요.":"No submissions match this filter."}</div>`;
    }

    function renderWorkspace(){
      const t=T[state.language], x=items().find(v=>(v._id||v.id)===selectedId);
      if(!x){workspace.innerHTML=`<div class="teacher-empty-state"><div class="empty-illustration">✎</div><h2>${t.select}</h2><p>${state.language==="ko"?"왼쪽 목록에서 학생의 글을 선택해 주세요.":"Choose a student from the review queue to begin."}</p></div>`;return;}
      const words=wordCount(x.studentPlain), initial=escapeHTML((x.studentName||"S").charAt(0).toUpperCase());
      workspace.innerHTML=`
        <div class="workspace-topbar">
          <div class="workspace-student"><span class="avatar large">${initial}</span><div><p class="widget-kicker">${formatDate(x.submittedAt,state.language)}</p><h2>${escapeHTML(x.studentName||"Student")}</h2><span>${escapeHTML(x.studentEmail||"No email")}</span></div></div>
          <span class="${statusClass(x.status)}">${statusText(x.status,state.language)}</span>
        </div>
        <div class="workspace-layout">
          <div class="correction-area">
            <div class="compare-grid">
              <article class="compare-panel original-panel"><div class="compare-head"><div><p class="widget-kicker">${t.original}</p><h3>Original</h3></div><span>${words} ${t.words.toLowerCase()}</span></div><div class="student-paper html-display">${x.studentHtml||escapeHTML(x.studentPlain||"")}</div></article>
              <article class="compare-panel correction-panel"><div class="compare-head"><div><p class="widget-kicker">${t.corrected}</p><h3>Correction</h3></div><span id="correctionWordCount">${wordCount(stripHTML(x.teacherHtml||x.studentHtml||""))} ${t.words.toLowerCase()}</span></div><div id="teacherEditorMount"></div></article>
            </div>
            <article class="feedback-card"><div class="feedback-head"><div><p class="widget-kicker">${t.quick}</p><h3>${t.feedback}</h3></div></div><div id="snippetChips" class="snippet-chips"></div><textarea id="teacherNote" placeholder="${state.language==="ko"?"학생에게 전달할 피드백을 적어 주세요.":"Write feedback the student will receive."}">${escapeHTML(x.teacherNote||"")}</textarea></article>
          </div>
          <aside class="workspace-sidebar">
            <article class="mini-widget"><p class="widget-kicker">${t.details}</p><div class="detail-list"><div><span>${t.status}</span><strong>${statusText(x.status,state.language)}</strong></div><div><span>${t.submitted}</span><strong>${relativeTime(x.submittedAt)}</strong></div><div><span>${t.updated}</span><strong>${relativeTime(x.studentUpdatedAt||x.submittedAt)}</strong></div><div><span>${t.words}</span><strong>${words}</strong></div><div><span>${t.email}</span><strong class="truncate">${escapeHTML(x.studentEmail||"—")}</strong></div></div></article>
            <article class="mini-widget"><p class="widget-kicker">${t.studentNote}</p><div class="student-note-box">${escapeHTML(x.studentNote||t.noNote)}</div></article>
            <article class="mini-widget action-widget"><p class="widget-kicker">Actions</p><div id="teacherActions" class="teacher-actions"></div></article>
          </aside>
        </div>`;
      teacherEditorMount.innerHTML=richEditorHTML("teacherEditor",""); const ed=initRichEditor(teacherEditorMount); ed.innerHTML=x.teacherHtml||x.studentHtml||""; ed.addEventListener("input",()=>{correctionWordCount.textContent=`${wordCount(stripHTML(ed.innerHTML))} ${t.words.toLowerCase()}`;});
      snippetChips.innerHTML=snippets[state.language].map(s=>`<button type="button">${escapeHTML(s)}</button>`).join(""); snippetChips.querySelectorAll("button").forEach(btn=>btn.onclick=()=>{teacherNote.value+=(teacherNote.value?"\n":"")+btn.textContent; teacherNote.focus();});
      const acts=teacherActions;
      if(x.status==="pending") acts.innerHTML=`<button class="button button-primary action-full" id="startBtn">${t.start}</button>`;
      else acts.innerHTML=`${x.status==="completed"?`<button class="button button-secondary action-full" id="reopenBtn">${t.reopen}</button>`:""}<button class="button button-secondary action-full" id="saveBtn">${t.save}</button><button class="button button-success action-full" id="completeBtn">${t.return}</button><button class="text-danger" id="deleteBtn">${t.delete}</button>`;
      if(document.getElementById("startBtn")) startBtn.onclick=()=>updateRecord("start",ed);
      if(document.getElementById("reopenBtn")) reopenBtn.onclick=()=>updateRecord("reopen",ed);
      if(document.getElementById("saveBtn")) saveBtn.onclick=()=>updateRecord("save",ed);
      if(document.getElementById("completeBtn")) completeBtn.onclick=()=>updateRecord("complete",ed);
      if(document.getElementById("deleteBtn")) deleteBtn.onclick=deleteRecord;
    }

    function updateRecord(action,ed){
      const t=T[state.language], a=items(), i=a.findIndex(x=>(x._id||x.id)===selectedId); if(i<0)return;
      if(action==="start"){a[i].status="reviewing";a[i].reviewStartedAt=new Date().toISOString();}
      if(action==="reopen"){a[i].status="reviewing";a[i].completedAt=null;}
      if(action==="save"||action==="complete"){a[i].teacherHtml=ed.innerHTML;a[i].teacherNote=teacherNote.value.trim();a[i].teacherUpdatedAt=new Date().toISOString();}
      if(action==="complete"){a[i].status="completed";a[i].completedAt=new Date().toISOString();window.parent?.postMessage({source:"langsnack-journal",type:"reviewCompleted",payload:a[i]},"*");}
      saveSubmissions(a); toast(action==="start"?t.started:action==="save"?t.saved:action==="complete"?t.returned:t.reopened); renderAll();
    }
    function deleteRecord(){const t=T[state.language]; if(!confirm(state.language==="ko"?"이 기록을 정말 삭제할까요?":"Delete this submission permanently?"))return; saveSubmissions(items().filter(x=>(x._id||x.id)!==selectedId)); selectedId=null; toast(t.deleted); renderAll();}

    function applyText(){const t=T[state.language]; search.placeholder=t.search; statusFilter.options[0].text=t.all; statusFilter.options[1].text=t.waiting; statusFilter.options[2].text=t.progress; statusFilter.options[3].text=t.complete; document.querySelector('[data-filter="all"]').textContent=t.all; document.querySelector('[data-filter="pending"]').textContent=t.waiting; document.querySelector('[data-filter="reviewing"]').textContent=t.progress; document.querySelector('[data-filter="completed"]').textContent=t.complete;}
    function renderAll(){renderHeader();applyText();renderStats();renderWeekly();renderActiveStudents();renderQueue();renderWorkspace();}
    search.oninput=renderQueue; statusFilter.onchange=()=>{document.querySelectorAll("#queueTabs button").forEach(b=>b.classList.toggle("active",b.dataset.filter===statusFilter.value));renderQueue();};
    queueTabs.onclick=e=>{const b=e.target.closest("button");if(!b)return;statusFilter.value=b.dataset.filter;document.querySelectorAll("#queueTabs button").forEach(x=>x.classList.toggle("active",x===b));renderQueue();};
    refreshButton.onclick=()=>renderAll();
    language.onchange=()=>{state.language=language.value;saveState(state);renderAll();};
    window.addEventListener("langsnack:timezone-change",event=>{const journalState=getJournalState();journalState.timezone=event.detail.timeZone;saveJournalState(journalState);renderAll();});
    renderAll();
  