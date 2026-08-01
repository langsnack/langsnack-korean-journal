
function draw(){
 const auth=getAuthSession();
 if(!auth.loggedIn){
   savedList.innerHTML=`<div class="nb-empty"><h2>${state.language==="ko"?"게스트 모드예요":"You’re in Guest Mode"}</h2><p>${state.language==="ko"?"설명을 저장하려면 로그인해 주세요.":"Log in to save explanations and access them later."}</p><button class="button button-primary" id="savedGuestLogin">${state.language==="ko"?"로그인 / 회원가입":"Log in / Sign up"}</button></div>`;
   document.getElementById("savedGuestLogin").onclick=requestNotebookLogin;
   return;
 }const q=searchInput.value.toLowerCase();const items=getBookmarks().filter(x=>`${x.title} ${x.text}`.toLowerCase().includes(q));savedGrid.innerHTML=items.length?'':'<div class="nb-card nb-empty"><h2>Nothing saved yet</h2><p>Open returned work and tap “Save explanation”.</p></div>';items.forEach(x=>{const a=document.createElement('article');a.className='nb-card nb-saved-card';a.innerHTML=`<div style="display:flex;justify-content:space-between;gap:10px"><span class="nb-kicker">Saved from correction</span><button class="nb-bookmark saved">⭐</button></div><h3 style="margin-top:10px">${escapeHTML(x.title)}</h3><blockquote>${escapeHTML((x.text||'').slice(0,260))}</blockquote><div style="display:flex;justify-content:space-between;align-items:center"><small class="muted">Saved ${relativeDate(x.savedAt)}</small><a href="submission.html?id=${encodeURIComponent(x.submissionId)}">Open work →</a></div>`;a.querySelector('button').onclick=()=>{toggleBookmark(x);draw()};savedGrid.appendChild(a)})}searchInput.oninput=draw;document.querySelector('[data-nav="saved"]').classList.add('active');languageSelect.value=getState().language;window.addEventListener("langsnack:auth-change",draw);
draw();
