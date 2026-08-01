
const state=getJournalState();
let activeGenerator="prompt";
let activeCategory="journal";

const translations={
 en:{language:"Language",timezone:"Time zone",dashboard:"Dashboard",write:"Write",work:"My work",saved:"Saved",achievements:"Achievements",calendar:"Calendar",help:"Need help?",guide:"Visit the guide",greetingMorning:"Good morning",greetingAfternoon:"Good afternoon",greetingEvening:"Good evening",subtitle:"Keep writing. Keep growing.",dayStreak:"day streak",keepGoing:"Keep it going",feedbackTitle:"Get your writing feedback",feedbackSub:"Write and send your work to Nicole.",workTitle:"Previous work",workSub:"Review your submissions and feedback.",savedTitle:"Saved explanations",savedSub:"Keep useful feedback for later.",workspace:"Writing workspace",startWriting:"Start a new writing",clearAll:"Clear all",journal:"Journal",essay:"Essay",story:"Story",random:"Random",level:"Level",topic:"Random topic",grammar:"Random grammar",prompt:"Random prompt",surprise:"Surprise me",another:"Try another",placeholder:"Write your Korean here...",characters:" characters",words:" words",save:"Save draft",submit:"Get feedback",badgeTitle:"Next achievement",viewAll:"View all",progress:"Level & progress",calendarTitle:"Writing calendar",written:"Written",today:"Today",recent:"Recent work",daily:"Today’s random picks",newPick:"Reveal",usedToday:"Used today",revealPick:"Click to reveal",tip:"Quick tip",tipText:"Writing a little every day builds a stronger habit than writing a lot once in a while.",draftSaved:"Draft saved.",writeFirst:"Write something before saving.",cleared:"Writing cleared.",noEntries:"No writing yet. Start your first one today.",topicLabel:"Topic",grammarLabel:"Grammar",promptLabel:"Prompt",journalDate:"Journal date"},
 ko:{language:"언어",timezone:"시간대",dashboard:"대시보드",write:"새 글쓰기",work:"내 글",saved:"저장한 설명",achievements:"성장 기록",calendar:"글쓰기 달력",help:"도움이 필요하신가요?",guide:"이용 가이드 보기",greetingMorning:"좋은 아침이에요",greetingAfternoon:"좋은 오후예요",greetingEvening:"좋은 저녁이에요",subtitle:"꾸준히 쓰고, 천천히 성장해 보세요.",dayStreak:"일 연속 작성",keepGoing:"오늘도 이어 가 보세요",feedbackTitle:"글쓰기 피드백 받기",feedbackSub:"글을 작성하고 니콜 선생님께 보내 보세요.",workTitle:"내가 쓴 글",workSub:"제출한 글과 받은 피드백을 확인해 보세요.",savedTitle:"저장한 설명",savedSub:"도움이 된 설명을 저장해 두고 다시 확인해 보세요.",workspace:"글쓰기 공간",startWriting:"새로운 글쓰기",clearAll:"전체 지우기",journal:"일기",essay:"에세이",story:"이야기",random:"랜덤",level:"레벨",topic:"랜덤 주제",grammar:"랜덤 문법",prompt:"랜덤 질문",surprise:"깜짝 추천",another:"다시 추천",placeholder:"여기에 한국어로 글을 써 보세요...",characters:"자",words:"어절",save:"임시 저장",submit:"피드백 받기",badgeTitle:"다음 배지",viewAll:"모두 보기",progress:"레벨 & 경험치",calendarTitle:"글쓰기 달력",written:"작성 완료",today:"오늘",recent:"최근 작업",daily:"오늘의 랜덤 추천",newPick:"오늘의 추천 보기",usedToday:"오늘 사용 완료",revealPick:"눌러서 확인하세요",tip:"작은 팁",tipText:"한 번에 많이 쓰는 것보다 매일 조금씩 쓰는 습관이 더 오래갑니다.",draftSaved:"임시 저장했어요.",writeFirst:"저장할 글을 먼저 작성해 주세요.",cleared:"작성 중인 글을 지웠어요.",noEntries:"아직 작성한 글이 없어요. 오늘 첫 글을 시작해 보세요.",topicLabel:"주제",grammarLabel:"문법",promptLabel:"질문",journalDate:"일기 날짜"}
};

const content={
 starter:{
  topic:["오늘 하루","아침 식사","우리 가족","친한 친구","오늘 날씨","좋아하는 음식","내 방","주말 계획","학교나 회사","자주 가는 곳","좋아하는 계절","나의 취미"],
  prompt:["오늘 무엇을 했는지 써 보세요.","오늘 먹은 음식 중 가장 맛있었던 것은 무엇인가요?","가족 한 명을 소개해 보세요.","주말에 무엇을 하고 싶은지 써 보세요.","지금 있는 곳을 간단히 설명해 보세요.","좋아하는 계절과 그 이유를 써 보세요."],
  grammar:["-고","그리고","-았/었어요","-고 싶어요","-지만","-아/어서","-(으)ㄹ 거예요","-(으)려고 해요"]
 },
 beginner:{
  topic:["기억에 남는 하루","최근에 본 영화나 드라마","건강한 생활 습관","좋아하는 장소","친구와의 약속","새로 배우고 싶은 것","나의 여행 경험","스트레스를 푸는 방법","한국어를 배우는 이유","요즘 관심 있는 것","나의 장점","미래의 계획"],
  prompt:["최근에 가장 기억에 남았던 일을 자세히 써 보세요.","요즘 자주 하는 일과 그 이유를 써 보세요.","친구에게 추천하고 싶은 장소를 소개해 보세요.","새로운 습관을 만들기 위해 어떤 노력을 하고 있나요?","한국어를 배우면서 달라진 점을 써 보세요.","이번 달에 꼭 이루고 싶은 목표는 무엇인가요?"],
  grammar:["-(으)려고","-아/어서","-(으)ㄴ/는 것 같다","-아/어 본 적이 있다","-(으)면 좋겠다","-게 되다","-(으)면서","-기 전에"]
 },
 intermediate:{
  topic:["최근의 변화","인간관계","나의 가치관","실패에서 배운 점","일과 삶의 균형","SNS의 장단점","문화 차이","환경을 위한 실천","기억에 남는 선택","혼자 보내는 시간","좋은 습관을 유지하는 법","나에게 영향을 준 사람"],
  prompt:["최근에 스스로 가장 뿌듯했던 순간을 구체적으로 써 보세요.","예전의 나와 지금의 나는 어떻게 달라졌나요?","의견이 다른 사람과 대화했던 경험을 써 보세요.","실패가 오히려 도움이 되었던 경험이 있나요?","편리함과 불편함을 함께 가져온 기술 한 가지를 설명해 보세요.","앞으로 꼭 바꾸고 싶은 생활 습관과 그 이유를 써 보세요."],
  grammar:["-는 김에","-다 보니","-아/어서인지","-(으)ㄴ/는 반면에","-기는 하지만","-(으)ㄹ 뿐만 아니라","-더라고요","-거든요"]
 },
 advanced:{
  topic:["행복의 기준","기술과 인간관계","성공의 의미","개인의 자유와 책임","지속 가능한 생활","교육의 역할","세대 간의 차이","문화적 다양성","정보 과잉 시대","일의 의미","도시와 지역의 균형","변화에 적응하는 태도"],
  prompt:["행복은 개인의 선택으로 만들어질 수 있다고 생각하나요? 근거와 함께 써 보세요.","기술의 발전이 인간관계에 미친 긍정적·부정적 영향을 비교해 보세요.","성공을 평가할 때 결과와 과정 중 무엇이 더 중요하다고 생각하나요?","개인의 편리함과 환경 보호가 충돌할 때 어떤 기준으로 선택해야 할까요?","정보가 많을수록 더 현명한 판단을 할 수 있다는 주장에 대해 의견을 써 보세요.","사회가 빠르게 변할수록 교육이 맡아야 할 역할은 무엇인지 논해 보세요."],
  grammar:["-(으)ㄹ 뿐만 아니라","-(으)ㄴ/는 반면에","-다고 해서","-(으)ㄹ수록","-더라도","-(으)ㄹ 리가 없다","-기에 망정이지","-(으)ㄴ/는 셈이다"]
 }
};


function tr(key){return translations[state.language][key]}
function setText(id,key){const el=document.getElementById(id);if(el)el.textContent=tr(key)}
function getDateParts(date=new Date()){const parts=new Intl.DateTimeFormat("en-CA",{timeZone:state.timezone,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(date);const map=Object.fromEntries(parts.map(x=>[x.type,x.value]));return {year:+map.year,month:+map.month,day:+map.day}}
function dateKey(date=new Date()){const p=getDateParts(date);return `${p.year}-${String(p.month).padStart(2,"0")}-${String(p.day).padStart(2,"0")}`}
function getStreak(){const days=[...new Set(state.entries.map(e=>e.date))].sort();let streak=0;let cursor=new Date(dateKey()+"T12:00:00");if(!days.includes(dateKey()))cursor.setDate(cursor.getDate()-1);while(days.includes(cursor.toISOString().slice(0,10))){streak++;cursor.setDate(cursor.getDate()-1)}return streak}
function greetingKey(){const hour=Number(new Intl.DateTimeFormat("en-GB",{timeZone:state.timezone,hour:"2-digit",hour12:false}).format(new Date()));return hour<12?"greetingMorning":hour<18?"greetingAfternoon":"greetingEvening"}
function displayName(){return state.profile?.name?.trim()||""}

function applyLanguage(){
 document.documentElement.lang=state.language;
 const map={languageLabel:"language",timezoneLabel:"timezone",navDashboard:"dashboard",navWrite:"write",navWork:"work",navSaved:"saved",navAchievements:"achievements",navCalendar:"calendar",helpTitle:"help",helpText:"guide",welcomeSubtitle:"subtitle",streakUnit:"dayStreak",streakStatus:"keepGoing",quickFeedbackTitle:"feedbackTitle",quickFeedbackSub:"feedbackSub",quickWorkTitle:"workTitle",quickWorkSub:"workSub",quickSavedTitle:"savedTitle",quickSavedSub:"savedSub",writingKicker:"workspace",writingTitle:"startWriting",clearAllBtn:"clearAll",catJournal:"journal",catEssay:"essay",catStory:"story",catRandom:"random",levelLabel:"level",mainJournalDateLabel:"journalDate",topicButtonText:"topic",grammarButtonText:"grammar",promptButtonText:"prompt",surpriseButtonText:"surprise",charactersLabel:"characters",wordsLabel:"words",saveDraftBtn:"save",submitBtn:"submit",achievementTitle:"badgeTitle",viewAchievementsBtn:"viewAll",progressTitle:"progress",calendarTitle:"calendarTitle",legendSubmitted:"written",legendToday:"today",recentTitle:"recent",viewAllWork:"viewAll",dailyTitle:"daily",dailyTopicLabel:"topicLabel",dailyGrammarLabel:"grammarLabel",dailyPromptLabel:"promptLabel",dailyTopicButton:"newPick",dailyGrammarButton:"newPick",dailyPromptButton:"newPick",tipTitle:"tip",tipText:"tipText"};
 Object.entries(map).forEach(([id,key])=>setText(id,key));
 welcomeHeading.textContent=`${tr(greetingKey())}, ${displayName()}!`;
 journalText.placeholder=tr("placeholder");
 renderAll();
}
function updateCounts(){charCount.textContent=journalText.value.replace(/\s/g,"").length;wordCount.textContent=journalText.value.trim()?journalText.value.trim().split(/\s+/).length:0}
function pick(type){const arr=content[levelSelect.value][type];return arr[Math.floor(Math.random()*arr.length)]}
function showRecommendation(type){activeGenerator=type;generatorLabel.textContent=tr(type+"Label");generatorText.textContent=pick(type);generatorOutput.hidden=false}
function saveEntry(){
 if(!isNotebookMember()){requestNotebookLogin();showToast(state.language==="ko"?"로그인하면 임시 저장을 사용할 수 있어요.":"Log in to save your draft.");return}
 const text=journalText.value.trim();if(!text){showToast(tr("writeFirst"));return}const existing=state.entries.findIndex(e=>e.date===dateKey()&&e.status==="draft");const entry={id:existing>=0?state.entries[existing].id:crypto.randomUUID(),date:activeCategory==="journal"?(mainJournalDateInput.value||dateKey()):dateKey(),journalDate:activeCategory==="journal"?(mainJournalDateInput.value||dateKey()):null,createdAt:new Date().toISOString(),text,level:levelSelect.value,status:"draft",category:activeCategory};if(existing>=0)state.entries[existing]=entry;else state.entries.unshift(entry);state.lastDraft=text;state.level=levelSelect.value;saveJournalState(state);renderAll();showToast(tr("draftSaved"))}
function renderEntries(){entriesList.innerHTML="";if(!state.entries.length){entriesList.innerHTML=`<div class="empty-state">${tr("noEntries")}</div>`;return}state.entries.slice(0,5).forEach(e=>{const item=document.createElement("button");item.className="recent-item";item.innerHTML=`<span class="recent-icon">✎</span><span class="recent-copy"><strong>${escapeHTML(e.text.slice(0,40))}${e.text.length>40?"…":""}</strong><small>${e.journalDate?escapeHTML(formatKoreanDateOnly(e.journalDate)):escapeHTML(e.category||e.level)}</small></span><span class="recent-status">${e.status==="draft"?(state.language==="ko"?"임시 저장":"Draft"):(state.language==="ko"?"작성 완료":"Written")}</span><span class="card-arrow">›</span>`;item.onclick=()=>{journalText.value=e.text;levelSelect.value=e.level;activeCategory=e.category||"journal";mainJournalDateInput.value=e.journalDate||e.date||dateKey();updateMainJournalDateVisibility();document.querySelectorAll('.category-tab').forEach(x=>x.classList.toggle('active',x.dataset.category===activeCategory));updateCounts();document.getElementById('writing').scrollIntoView({behavior:'smooth'})};entriesList.appendChild(item)})}
function renderCalendar(){calendarGrid.innerHTML="";const labels=["월","화","수","목","금","토","일"];labels.forEach(d=>{const s=document.createElement("span");s.className="day-label";s.textContent=d;calendarGrid.appendChild(s)});const cur=getDateParts(),first=new Date(cur.year,cur.month-1,1),offset=(first.getDay()+6)%7,dim=new Date(cur.year,cur.month,0).getDate(),written=new Set(state.entries.map(e=>e.date));for(let i=0;i<offset;i++)calendarGrid.appendChild(document.createElement("span"));for(let d=1;d<=dim;d++){const s=document.createElement("span");s.className="calendar-day";s.textContent=d;const k=`${cur.year}-${String(cur.month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;if(written.has(k))s.classList.add("written");if(d===cur.day)s.classList.add("today");if(d>cur.day)s.classList.add("future");calendarGrid.appendChild(s)}calendarMonthLabel.textContent=new Intl.DateTimeFormat("ko-KR",{timeZone:state.timezone,year:"numeric",month:"long"}).format(new Date())}
function renderStreak(){streakCount.textContent=getStreak()}

function renderBadges(){
 const progress=getNotebookBadgeProgress();
 const next=getNextNotebookBadge();
 const label=state.language==="ko"?"다음 배지":"Next badge";
 const earnedLabel=state.language==="ko"?"획득한 배지":"Earned badges";
 const mini=progress.filter(item=>item.earned).slice(-3).reverse();
 const fallback=progress.filter(item=>!item.earned&&item.key!==next.key).slice(0,3-mini.length);
 const preview=[...mini,...fallback];

 badgeGrid.innerHTML=`<article class="next-badge-preview">
   <span class="badge-medal badge-1">${next.earned?"✓":"✦"}</span>
   <span class="next-badge-copy">
     <small>${label}</small>
     <strong>${state.language==="ko"?next.titleKo:next.titleEn}</strong>
     <span>${state.language==="ko"?next.descKo:next.descEn}</span>
   </span>
   <div class="badge-progress">
     <div class="badge-progress-bar"><i style="width:${next.percent}%"></i></div>
     <b>${Math.min(next.value,next.goal)} / ${next.goal}</b>
   </div>
 </article>
 <div class="badge-peek-label">${earnedLabel}</div>
 <div class="badge-peek-row">
   ${preview.map(item=>`<div class="badge-peek ${item.earned?"earned":""}" title="${state.language==="ko"?item.descKo:item.descEn}">
     <span>${item.earned?"✓":"✦"}</span>
     <small>${state.language==="ko"?item.titleKo:item.titleEn}</small>
   </div>`).join("")}
 </div>`;

 allBadgesGrid.innerHTML=progress.map(item=>`
   <article class="all-badge ${item.earned?"earned":""}">
     <span class="all-badge-icon">${item.earned?"✓":"✦"}</span>
     <div>
       <strong>${state.language==="ko"?item.titleKo:item.titleEn}</strong>
       <p>${state.language==="ko"?item.descKo:item.descEn}</p>
       <div class="badge-progress-bar"><i style="width:${item.percent}%"></i></div>
       <small>${Math.min(item.value,item.goal)} / ${item.goal}</small>
     </div>
   </article>
 `).join("");
}
function saveDailyPickState(value){localStorage.setItem(DAILY_PICK_KEY,JSON.stringify(value))}
function dailyElement(type){return document.getElementById("daily"+type[0].toUpperCase()+type.slice(1))}
function dailyButton(type){return document.getElementById("daily"+type[0].toUpperCase()+type.slice(1)+"Button")}
function revealDailyPick(type){
 const daily=getDailyPickState();
 if(daily.picks[type])return;
 daily.picks[type]={value:pick(type),level:levelSelect.value};
 saveDailyPickState(daily);
 renderDaily();
}
function renderDaily(){
 const daily=getDailyPickState();
 ["topic","grammar","prompt"].forEach(type=>{
  const output=dailyElement(type),button=dailyButton(type),saved=daily.picks[type];
  if(saved){output.textContent=saved.value;output.classList.remove("daily-placeholder");button.textContent=tr("usedToday");button.disabled=true;}
  else{output.textContent=tr("revealPick");output.classList.add("daily-placeholder");button.textContent=tr("newPick");button.disabled=false;}
 });
}
function showSurprise(){
 const button=document.getElementById("surpriseMeBtn");
 button.classList.add("is-shuffling"); button.disabled=true;
 generatorOutput.hidden=false; generatorLabel.textContent=state.language==="ko"?"오늘의 깜짝 추천":"Your lucky mix";
 generatorText.innerHTML=`<span class="shuffle-copy">${state.language==="ko"?"추천을 고르는 중...":"Mixing your ideas..."}</span>`;
 setTimeout(()=>{
   const topic=pick("topic"),grammar=pick("grammar"),prompt=pick("prompt");
   generatorText.innerHTML=`<span class="surprise-result"><small>TOPIC</small><b>${escapeHTML(topic)}</b></span><span class="surprise-result"><small>GRAMMAR</small><b>${escapeHTML(grammar)}</b></span><span class="surprise-result full"><small>PROMPT</small><b>${escapeHTML(prompt)}</b></span>`;
   activeGenerator="surprise"; button.classList.remove("is-shuffling"); button.disabled=false;
 },850);
}
function renderAll(){renderEntries();renderCalendar();renderStreak();renderBadges()}


function applyAuthUI(){
 const auth=getAuthSession();
 guestBanner.hidden=auth.loggedIn;
 guestLoginButton.onclick=requestNotebookLogin;

 if(auth.loggedIn){
   loginBtn.textContent=(auth.name||"Member").split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase()||"ME";
   loginBtn.title=auth.name||auth.email||"Member";
   loginBtn.onclick=()=>{};
   saveDraftBtn.hidden=false;
   saveDraftBtn.textContent=tr("save");
   submitBtn.disabled=false;
   submitBtn.textContent=tr("submit");
   welcomeHeading.textContent=`${tr(greetingKey())}, ${auth.name||displayName()}!`;
 }else{
   loginBtn.textContent=state.language==="ko"?"로그인":"Log in";
   loginBtn.title=state.language==="ko"?"로그인 또는 회원가입":"Log in or sign up";
   loginBtn.onclick=requestNotebookLogin;
   saveDraftBtn.hidden=false;
   saveDraftBtn.textContent=state.language==="ko"?"로그인 후 저장":"Log in to save";
   submitBtn.disabled=false;
   submitBtn.textContent=state.language==="ko"?"로그인 후 제출":"Log in to submit";
   welcomeHeading.textContent=state.language==="ko"
     ? `${tr(greetingKey())}!`
     : `${tr(greetingKey())}!`;
 }
}

window.addEventListener("langsnack:auth-change",()=>{
 applyAuthUI();
 renderAll();
});

document.querySelectorAll("[data-generator]").forEach(btn=>btn.onclick=()=>showRecommendation(btn.dataset.generator));
surpriseMeBtn.onclick=showSurprise;
shuffleAgainBtn.onclick=()=>activeGenerator==="surprise"?showSurprise():showRecommendation(activeGenerator);closeGenerator.onclick=()=>generatorOutput.hidden=true;
document.querySelectorAll(".category-tab").forEach(btn=>btn.onclick=()=>{activeCategory=btn.dataset.category;document.querySelectorAll(".category-tab").forEach(x=>x.classList.toggle("active",x===btn));updateMainJournalDateVisibility()});
document.querySelectorAll("[data-editor-command]").forEach(btn=>btn.onclick=()=>{journalText.focus();document.execCommand(btn.dataset.editorCommand)});
document.querySelectorAll("[data-wrap]").forEach(btn=>btn.onclick=()=>{const start=journalText.selectionStart,end=journalText.selectionEnd,wrap=btn.dataset.wrap,value=journalText.value;journalText.value=value.slice(0,start)+wrap+value.slice(start,end)+wrap+value.slice(end);journalText.focus();journalText.setSelectionRange(start+wrap.length,end+wrap.length);journalText.dispatchEvent(new Event("input"))});
document.querySelectorAll("[data-prefix]").forEach(btn=>btn.onclick=()=>{const start=journalText.selectionStart,end=journalText.selectionEnd,value=journalText.value,prefix=btn.dataset.prefix;const lineStart=value.lastIndexOf("\n",start-1)+1;const selected=value.slice(lineStart,end);const changed=selected.split("\n").map(line=>prefix+line).join("\n");journalText.value=value.slice(0,lineStart)+changed+value.slice(end);journalText.focus();journalText.setSelectionRange(lineStart+prefix.length,lineStart+changed.length);journalText.dispatchEvent(new Event("input"))});
document.querySelectorAll("[data-insert]").forEach(btn=>btn.onclick=()=>{const start=journalText.selectionStart,value=journalText.value,insert=btn.dataset.insert;journalText.value=value.slice(0,start)+insert+value.slice(start);journalText.focus();journalText.setSelectionRange(start+insert.length,start+insert.length);journalText.dispatchEvent(new Event("input"))});
clearFormatBtn.onclick=()=>{journalText.value=journalText.value.replace(/\*\*|__|_/g,"");journalText.dispatchEvent(new Event("input"))};
clearAllBtn.onclick=()=>{if(!journalText.value||confirm(state.language==="ko"?"작성 중인 글을 모두 지울까요?":"Clear the current writing?")){journalText.value="";state.lastDraft="";saveJournalState(state);updateCounts();showToast(tr("cleared"))}};
journalText.oninput=()=>{
 if(isNotebookMember()){
   state.lastDraft=journalText.value;
   saveJournalState(state);
 }
 updateCounts();
};
levelSelect.onchange=()=>{state.level=levelSelect.value;saveJournalState(state)};
mainJournalDateInput.onchange=()=>{
 state.journalDate=mainJournalDateInput.value;
 saveJournalState(state);
 updateMainJournalDatePreview();
};
timezoneSelect.onchange=()=>{state.timezone=timezoneSelect.value;saveJournalState(state);applyLanguage()};
window.addEventListener("langsnack:timezone-change",event=>{state.timezone=event.detail.timeZone;saveJournalState(state);applyLanguage()});
languageSelect.onchange=()=>{state.language=languageSelect.value;saveJournalState(state);applyLanguage()};
saveDraftBtn.onclick=saveEntry;
submitBtn.onclick=()=>{
 if(!isNotebookMember()){requestNotebookLogin();showToast(state.language==="ko"?"글을 제출하려면 먼저 로그인해 주세요.":"Please log in before submitting.");return}
 const text=journalText.value.trim();if(!text){showToast(tr("writeFirst"));return}const draft={entryId:crypto.randomUUID(),journal:text,level:levelSelect.value,date:dateKey(),language:state.language,category:activeCategory,journalDate:activeCategory==="journal"?(mainJournalDateInput.value||dateKey()):null};sessionStorage.setItem(LS.reviewDraft,JSON.stringify(draft));location.href="submit.html"};
viewAchievementsBtn.onclick=()=>{achievementModal.hidden=false;document.body.classList.add('modal-open')};
document.querySelectorAll('[data-close-badges]').forEach(el=>el.onclick=()=>{achievementModal.hidden=true;document.body.classList.remove('modal-open')});
function updateMainJournalDateVisibility(){
  mainJournalDateField.hidden=activeCategory!=="journal";
  if(!mainJournalDateInput.value)mainJournalDateInput.value=state.journalDate||dateKey();
}
languageSelect.value=state.language;
levelSelect.value=state.level;
journalText.value=isNotebookMember()?state.lastDraft:"";
mainJournalDateInput.value=state.journalDate||dateKey();
updateMainJournalDateVisibility();
updateCounts();
applyLanguage();
applyAuthUI();
