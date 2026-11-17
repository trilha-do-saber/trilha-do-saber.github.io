/* Trilha do Saber · LÓGICA DO APP */
/* =========================================================
   DADOS: salvos no aparelho e enviados para a planilha (Apps Script)
   ========================================================= */
const LS={get(k,d){try{const v=localStorage.getItem('ts:'+k);return v?JSON.parse(v):d}catch(e){return d}},
          set(k,v){try{localStorage.setItem('ts:'+k,JSON.stringify(v));return true}catch(e){return false}}};
const API={get url(){return LS.get('apiUrl','')},get token(){return LS.get('apiToken','')},aiReady:LS.get('aiReady',false)};
/* Link de configuração: index.html?api=URL&token=TOKEN salva a conexão neste aparelho */
(function(){try{const p=new URLSearchParams(location.search);if(p.get('api')&&p.get('token')){LS.set('apiUrl',p.get('api'));LS.set('apiToken',p.get('token'));
  history.replaceState(null,'',location.pathname);setTimeout(()=>toast('Conexão com a planilha salva neste aparelho.'),800)}}catch(e){}})();
async function api(action,payload){
  if(!API.url)throw {code:'sem_conexao'};
  const r=await fetch(API.url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({token:API.token,action,payload:payload||{}})});
  const j=await r.json();
  if(!j.ok)throw {code:j.error||'erro'};
  return j.data;
}
/* fila de envio: guarda no aparelho e envia quando houver internet */
let outbox=LS.get('outbox',[]),sending=false;
function enqueue(action,payload,key){outbox=outbox.filter(x=>x.key!==key);outbox.push({action,payload,key});LS.set('outbox',outbox);flushOutbox()}
async function flushOutbox(){
  if(sending||!API.url||!outbox.length||!navigator.onLine)return;
  sending=true;
  try{while(outbox.length){const it=outbox[0];await api(it.action,it.payload);outbox.shift();LS.set('outbox',outbox)}}
  catch(e){console.warn('envio adiado',e)}
  finally{sending=false}
}
setInterval(flushOutbox,30000);window.addEventListener('online',flushOutbox);
function mergeSession(map,s){const o=map[s.id];if(!o||(s.answers||[]).length>(o.answers||[]).length||(s.activeMs||0)>(o.activeMs||0))map[s.id]=s}
const store={
  synced:false,
  async init(){
    if(!API.url)return;
    try{
      const d=await api('getAll',{});
      const pending=k=>outbox.some(x=>x.key===k);
      if(d.config&&!pending('config'))LS.set('config',d.config);
      if(d.progress&&d.progress.lessons){const loc=(LS.get('progress',{lessons:{}}).lessons)||{};const srv=d.progress.lessons;
        for(const id in srv){const a=loc[id]||{},b=srv[id];loc[id]={...b,...a,stars:Math.max(a.stars||0,b.stars||0),best:Math.max(a.best||0,b.best||0),tries:Math.max(a.tries||0,b.tries||0)}}
        LS.set('progress',{lessons:loc})}
      if(Array.isArray(d.sessions)){const map=LS.get('sessions',{});d.sessions.forEach(s=>s&&s.id&&mergeSession(map,s));LS.set('sessions',trimSessions(map))}
      API.aiReady=!!d.aiReady;LS.set('aiReady',API.aiReady);this.synced=true;
    }catch(e){console.warn('sem sincronizar',e)}
    flushOutbox();
  },
  async get(p){return p==='config/main'?LS.get('config',null):p==='progress/main'?LS.get('progress',null):null},
  async set(p,d){
    if(p.startsWith('sessions/')){const map=LS.get('sessions',{});map[d.id]=d;if(!LS.set('sessions',trimSessions(map)))toast('Memória do aparelho cheia.');enqueue('saveSession',d,'s:'+d.id)}
    else if(p==='progress/main'){LS.set('progress',d);enqueue('saveProgress',d,'progress')}
    else if(p==='config/main'){LS.set('config',d);enqueue('saveConfig',d,'config')}
  },
  async sessions(){return Object.values(LS.get('sessions',{})).sort((a,b)=>b.start-a.start)}
};
function trimSessions(map){const arr=Object.values(map).sort((a,b)=>b.start-a.start).slice(0,300);const o={};arr.forEach(s=>o[s.id]=s);return o}
const aiOn=()=>!!(API.url&&API.aiReady);

/* VOZ: voz do próprio aparelho (gratuita e funciona sem internet) */
let speakTok=0,voiceWarned=false;
const hasWebSpeech=()=>typeof window.speechSynthesis!=='undefined'&&typeof window.SpeechSynthesisUtterance!=='undefined';
try{if(hasWebSpeech()){speechSynthesis.getVoices();speechSynthesis.onvoiceschanged=()=>{const b=document.getElementById('voicebox');if(b)b.innerHTML=voiceControls()}}}catch(e){}
function webSpeak(text){
  if(!hasWebSpeech())return false;
  try{const ss=window.speechSynthesis;ss.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='pt-BR';u.rate=.95;
    const v=chosenVoice();if(v){u.voice=v;u.lang=v.lang}u.rate=LS.get('voiceRate',.95);ss.speak(u);try{ss.resume()}catch(e){}return true}catch(e){return false}
}
function noVoice(){if(voiceWarned)return;voiceWarned=true;toast('Este navegador não tem voz. Use o Chrome ou o Safari.')}
function speak(text){if(!text)return;speakTok++;if(!webSpeak(text))noVoice()}
function stopSpeak(){speakTok++;try{hasWebSpeech()&&speechSynthesis.cancel()}catch(e){}}
/* vozes em português, das mais naturais para as mais simples */
function ptVoices(){
  if(!hasWebSpeech())return [];
  const score=v=>(/pt[-_]BR/i.test(v.lang)?10:0)+(/natural|neural|online|premium|enhanced|aprimorad/i.test(v.name)?5:0)+(/google/i.test(v.name)?3:0);
  return speechSynthesis.getVoices().filter(v=>/^pt/i.test(v.lang)).sort((a,b)=>score(b)-score(a));
}
function chosenVoice(){const vs=ptVoices(),pref=LS.get('voiceName','');return vs.find(v=>v.name===pref)||vs[0]||null}
function voiceStatus(){if(!hasWebSpeech())return 'nenhuma voz neste navegador';const v=chosenVoice();return v?v.name:'voz padrão do aparelho'}
function voiceControls(){
  const vs=ptVoices(),cur=chosenVoice(),rate=LS.get('voiceRate',.95);
  if(!vs.length)return `<p class="muted" style="font-size:14px;margin:0">Voz: ${esc(voiceStatus())}</p>`;
  return `<div class="form"><label for="cf-voice">Voz (deste aparelho)<select id="cf-voice" style="height:48px;border-radius:12px;border:2px solid #D5DDEE;padding:0 10px;font:inherit;font-size:16px;color:var(--ink);background:#fff">
    ${vs.map(v=>`<option value="${esc(v.name)}" ${cur&&v.name===cur.name?'selected':''}>${esc(v.name)}${/natural|neural|online|premium|enhanced|aprimorad/i.test(v.name)?' ★':''}</option>`).join('')}</select></label>
    <label for="cf-rate">Velocidade da fala: <span id="ratev">${Math.round(rate*100)}%</span><input id="cf-rate" type="range" min="0.7" max="1.2" step="0.05" value="${rate}"></label></div>
    <p class="muted" style="font-size:14px;margin:0">★ = vozes mais naturais. A voz fica salva só neste aparelho.</p>`;
}
document.addEventListener('change',e=>{
  if(e.target.id==='cf-voice'){LS.set('voiceName',e.target.value);speak('Olá! Esta é a minha voz.')}
  if(e.target.id==='cf-rate'){LS.set('voiceRate',parseFloat(e.target.value));speak('Olá! Esta é a velocidade da fala.')}
});
document.addEventListener('input',e=>{if(e.target.id==='cf-rate'){const r=document.getElementById('ratev');if(r)r.textContent=Math.round(e.target.value*100)+'%'}});

/* =========================================================
   ESTADO
   ========================================================= */
const S={config:{childName:'',pin:'1234',goal:20,ai:true,autoRead:true,unlockAll:false},progress:{},sessions:[],session:null,lastAct:Date.now(),view:'map',subject:(()=>{try{return localStorage.getItem('ts:subject')||'mat'}catch(e){return 'mat'}})()};
let R=null; // lição em andamento
const app=document.getElementById('app');
const today=(d=new Date())=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('show'),2600)}
function todayMs(){const d=today();let ms=S.sessions.filter(s=>s.date===d&&(!S.session||s.id!==S.session.id)).reduce((a,s)=>a+(s.activeMs||0),0);if(S.session)ms+=S.session.activeMs;return ms}
const mins=ms=>Math.round(ms/60000);

/* tempo ativo: conta só com a tela visível e interação nos últimos 2 minutos */
['pointerdown','keydown'].forEach(ev=>document.addEventListener(ev,()=>{S.lastAct=Date.now()},true));
setInterval(()=>{
  if(!S.session)return;
  if(document.visibilityState==='visible'&&Date.now()-S.lastAct<120000){S.session.activeMs+=1000}
  const el=document.getElementById('timer');if(el)el.textContent='⏱ '+mins(todayMs())+' min hoje';
},1000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushSession()});

let saveChain=Promise.resolve(),saveT=null;
function queueSave(){clearTimeout(saveT);saveT=setTimeout(flushSession,2500)}
function flushSession(){
  clearTimeout(saveT); if(!S.session)return saveChain;
  const snap=JSON.parse(JSON.stringify(S.session)); snap.end=Date.now();
  saveChain=saveChain.then(()=>store.set('sessions/'+snap.id,snap)).catch(e=>{console.warn(e);if(e&&e.code==='quota_exceeded')toast('O espaço de dados encheu. Avise o papai.')});
  return saveChain;
}
let progChain=Promise.resolve();
function saveProgress(){const p=JSON.parse(JSON.stringify(S.progress));progChain=progChain.then(()=>store.set('progress/main',{lessons:p})).catch(e=>console.warn(e))}
function saveConfig(){return store.set('config/main',S.config)}

/* =========================================================
   TELAS – CRIANÇA
   ========================================================= */
function starHTML(n){return '<span class="stars">'+[1,2,3].map(i=>`<span class="${i<=n?'':'off'}">⭐</span>`).join('')+'</span>'}
const curSubj=()=>SUBJECTS.find(s=>s.id===S.subject)||SUBJECTS[0];
const curLessons=()=>curSubj().lessons;
function unlocked(i){const L=curLessons();return S.config.unlockAll||i===0||((S.progress[L[i-1].id]||{}).stars||0)>=1}
function renderMap(){
  S.view='map';
  const goalMs=S.config.goal*60000,tm=todayMs(),pct=Math.min(100,Math.round(tm/goalMs*100));
  const name=S.config.childName?`, ${esc(S.config.childName)}`:'';
  app.innerHTML=`
  <div class="top"><h1 class="hello">Olá${name}! 👋</h1><div class="spacer"></div>
    <div class="goal card" style="padding:12px 16px"><div class="row" style="justify-content:space-between"><span>Meta de hoje</span><span>${mins(tm)} de ${S.config.goal} min</span></div><div class="bar"><i style="width:${pct}%"></i></div></div></div>
  ${!API.url?'<div class="note" style="margin-bottom:12px">Os dados estão salvos só neste aparelho até a planilha ser conectada na área dos pais.</div>':''}
  <div class="subjects">${SUBJECTS.map(s=>`<button class="subj ${s.ready?(s.id===S.subject?'on':''):'soon'}" data-act="subj" data-arg="${s.id}"><span class="ic">${s.ic}</span><span>${s.nome}</span><small>${s.ano}</small></button>`).join('')}</div>
  <h2 style="font-size:26px;margin-bottom:12px">Trilha de ${curSubj().nome}</h2>
  <div class="path">${curLessons().map((l,i)=>{const p=S.progress[l.id]||{},ok=unlocked(i);
    return `<button class="node ${p.stars?'done':''} ${ok?'':'locked'}" data-act="${ok?'open':'locked'}" data-arg="${i}">
      <span class="badge">${ok?l.icone:'🔒'}</span><span class="col" style="gap:4px"><h3>${esc(l.titulo)}</h3>${starHTML(p.stars||0)}</span></button>`}).join('')}</div>
  <div class="parentlink"><button data-act="parent">Área dos pais</button></div>`;
}
function startLesson(i){
  const l=curLessons()[i];
  R={idx:i,lesson:l,phase:'learn',slide:0,items:[],qi:0,q:null,tries:0,qStart:0,quizOk:0,aiUsed:0,results:[]};
  S.session={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),date:today(),start:Date.now(),end:Date.now(),activeMs:0,
    lessonId:l.id,lessonTitle:l.titulo,subject:curSubj().nome,phaseReached:'learn',answers:[],quizScore:null,quizTotal:l.quiz.length,stars:null};
  flushSession(); renderLearn();
}
function lessonTop(stepsHTML){return `<div class="lesson-top"><button class="btn ghost small" data-act="home" aria-label="Voltar para a trilha">✕</button><div class="steps">${stepsHTML}</div><span class="timer" id="timer">⏱ ${mins(todayMs())} min hoje</span></div>`}
function renderLearn(){
  const s=R.lesson.slides[R.slide],n=R.lesson.slides.length;
  app.innerHTML=lessonTop(R.lesson.slides.map((_,i)=>`<i class="${i<=R.slide?'on':''}"></i>`).join(''))+`
  <div class="qcard"><div class="row" style="justify-content:center"><span class="pill mid">Aprender · ${esc(R.lesson.titulo)}</span></div>
   <div class="visual">${s.v}</div>
   <div class="row" style="justify-content:center;flex-wrap:nowrap;max-width:640px"><button class="speak" data-act="say" aria-label="Ouvir">🔊</button><p class="qtext" style="font-size:26px;margin:0;text-align:left">${esc(s.t)}</p></div>
   <div class="row" style="justify-content:center">${R.slide>0?'<button class="btn ghost" data-act="prevslide">Voltar</button>':''}<button class="btn" data-act="nextslide">${R.slide<n-1?'Próximo':'Vamos praticar!'}</button></div></div>`;
  if(S.config.autoRead)speak(s.t);
}
function beginPhase(phase){
  R.phase=phase;R.qi=0;R.results=[];
  R.items=R.lesson[phase].map(k=>GEN[k]());
  S.session.phaseReached=phase;queueSave();renderQ();
}
function renderQ(){
  const q=R.q=R.items[R.qi];R.tries=0;R.qStart=Date.now();
  const steps=R.items.map((_,i)=>`<i class="${i<R.results.length?(R.results[i]?'okd':'bad'):(i===R.qi?'on':'')}"></i>`).join('');
  const label=R.phase==='practice'?'Praticar':'Desafio';
  let body='';
  if(q.kind==='build'){
    R.build={t:0,u:0};
    body=`<div class="buildarea" id="ba"></div><div class="cap" id="bacount"></div>
      <div class="buildbtns"><button class="btn" data-act="addT">+ Dezena</button><button class="btn" style="background:var(--sun);box-shadow:0 4px 0 #C27C00" data-act="addU">+ Unidade</button><button class="btn ghost" data-act="undoB">Tirar</button></div>
      <button class="btn okb" data-act="checkB">Pronto!</button>`;
  }else if(q.kind==='syll'){
    R.syl={order:shuffle(q.parts.map((p,i)=>i)),picked:[]};
    body=`<div class="buildarea" id="sa" style="min-height:96px"></div>
      <div class="buildbtns" id="stiles"></div>
      <div class="buildbtns"><button class="btn ghost" data-act="sylDel">Apagar</button><button class="btn okb" data-act="sylCheck">Pronto!</button></div>`;
  }else{
    body=`<div class="opts ${q.optClass||''}" id="opts">${q.options.map((o,i)=>`<button class="opt" data-act="ans" data-arg="${i}">${esc(o.label)}</button>`).join('')}</div>`;
  }
  app.innerHTML=lessonTop(steps)+`
  <div class="qcard"><span class="pill ${R.phase==='quiz'?'ok':'mid'}">${label} · ${R.qi+1} de ${R.items.length}</span>
   <div class="row" style="justify-content:center;flex-wrap:nowrap"><button class="speak" data-act="sayq" aria-label="Ouvir a pergunta">🔊</button><p class="qtext" style="margin:0">${esc(q.text)}</p></div>
   ${q.visual?`<div class="visual">${q.visual}</div>`:''}
   ${body}
   <div class="fb" id="fb"></div></div>`;
  if(q.kind==='build')drawBuild();
  if(q.kind==='syll')drawSyl();
  if(S.config.autoRead)speak(q.speak||q.text);
}
function drawSyl(){
  const q=R.q,sy=R.syl;
  document.getElementById('sa').innerHTML=sy.picked.length?`<span class="big" style="font-size:52px;letter-spacing:2px">${sy.picked.map(i=>q.parts[i]).join('')}</span>`:'<span class="muted">Toque nas sílabas abaixo</span>';
  document.getElementById('stiles').innerHTML=sy.order.map(i=>`<button class="btn" style="font-size:30px;min-width:96px;background:var(--sun);box-shadow:0 4px 0 #C27C00" data-act="sylPick" data-arg="${i}" ${sy.picked.includes(i)?'disabled':''}>${q.parts[i]}</button>`).join('');
}
function drawBuild(){
  document.getElementById('ba').innerHTML=(R.build.t||R.build.u)?blocksHTML(R.build.t,R.build.u):'<span class="muted">Toque nos botões para montar</span>';
  document.getElementById('bacount').textContent=`${R.build.t} dezena${R.build.t===1?'':'s'} e ${R.build.u} unidade${R.build.u===1?'':'s'} = ${R.build.t*10+R.build.u}`;
}
const correctLabel=q=>q.kind==='build'?String(q.target):q.kind==='syll'?q.word:String(q.options.find(o=>o.ok).label);
function record(given,ok,type){
  S.session.answers.push({ts:Date.now(),phase:R.phase,skill:R.q.skill,q:R.q.text+(R.q.desc?` (${R.q.desc})`:''),given:String(given),
    correct:correctLabel(R.q),ok,ms:Date.now()-R.qStart,type:ok?null:(type||'outro erro'),attempt:R.tries+1});
  queueSave();
}
function showFb(cls,html){const fb=document.getElementById('fb');fb.className='fb show '+cls;fb.innerHTML=html;fb.classList.add('pop')}
function nextBtn(){return `<div class="row"><button class="btn" data-act="nextq">${R.qi<R.items.length-1?'Próxima':'Terminar'}</button></div>`}
function aiBtn(){return (S.config.ai&&aiOn()&&R.aiUsed<5)?`<div class="row"><button class="btn ghost small" data-act="aiexp">Me explica de outro jeito</button></div><div id="aiout"></div>`:''}
function handleAnswer(ok,given,type,optEl){
  record(given,ok,type);
  const opts=document.getElementById('opts');
  if(ok){
    if(optEl)optEl.classList.add('right'); if(opts)opts.classList.add('locked');
    lockBuild();
    const p=pick(PRAISE);R.results.push(R.tries===0); if(R.phase==='quiz')R.quizOk++;
    showFb('good',`<b style="font-size:24px">✅ ${p}</b>${nextBtn()}`);speak(p);
    return;
  }
  if(optEl)optEl.classList.add('wrong','shake');
  if(R.phase==='practice'&&R.tries===0){
    R.tries++;
    showFb('try',`<b>Quase! Tente de novo.</b><span>💡 ${esc(R.q.hint)}</span>${aiBtn()}`);
    speak('Quase! '+R.q.hint);
    return;
  }
  if(opts)opts.classList.add('locked'); lockBuild();
  R.results.push(false);
  const right=R.q.kind?null:[...document.querySelectorAll('.opt')].find((b,i)=>R.q.options[i].ok);
  if(right)right.classList.add('right');
  showFb('bad',`<b>Essa foi difícil. Veja como é:</b><span>${esc(R.q.explain)}</span>${R.phase==='practice'?aiBtn():''}${nextBtn()}`);
  speak(R.q.explain);
}
function lockBuild(){document.querySelectorAll('[data-act=addT],[data-act=addU],[data-act=undoB],[data-act=checkB],[data-act=sylPick],[data-act=sylDel],[data-act=sylCheck]').forEach(b=>b.disabled=true)}
async function aiExplain(btn){
  const out=document.getElementById('aiout');if(!out)return;
  btn.disabled=true;out.innerHTML='<div class="ai">Pensando…</div>';
  const q=R.q,last=S.session.answers[S.session.answers.length-1];
  const correct=correctLabel(q);
  const prompt=`Você é um professor carinhoso de uma criança de 7 anos no 2º ano do ensino fundamental, no Brasil. Matéria: ${R.lesson.subject}.
Explique de um jeito diferente e bem simples como chegar na resposta certa.
Pergunta: ${q.text}${q.desc?` (${q.desc})`:''}
Resposta certa: ${correct}
A criança respondeu: ${last?last.given:'?'}
Dica que ela já viu: ${q.hint}
Regras: no máximo 2 frases curtas; palavras simples; português do Brasil; use um exemplo concreto (dedos, brinquedos, frutas); não faça perguntas; não use nomes; fale só do assunto da atividade (${R.lesson.subject}); responda apenas com a explicação.`;
  try{
    const r=await api('ai',{kind:'explain',prompt});
    const txt=String(r.text||'').replace(/[*#_`]/g,'').trim().slice(0,400);
    R.aiUsed++;
    out.innerHTML=`<div class="ai">🤖 ${esc(txt)}</div>`;speak(txt);
    S.session.aiHelps=(S.session.aiHelps||0)+1;queueSave();
  }catch(e){out.innerHTML='<div class="ai">Não consegui explicar agora. Tente a dica de novo.</div>'}
}
function finishLesson(){
  const total=R.items.length,ok=R.quizOk,stars=ok>=total?3:ok>=total-1?2:ok>=total-2?1:0;
  const p=S.progress[R.lesson.id]||{stars:0,best:0,tries:0};
  p.tries=(p.tries||0)+1;p.last=ok;p.best=Math.max(p.best||0,ok);p.stars=Math.max(p.stars||0,stars);p.lastAt=Date.now();
  S.progress[R.lesson.id]=p;saveProgress();
  S.session.quizScore=ok;S.session.stars=stars;S.session.phaseReached='done';
  const done=S.session;flushSession().then(()=>{S.sessions=[done,...S.sessions.filter(s=>s.id!==done.id)]});
  S.sessions=[JSON.parse(JSON.stringify(done)),...S.sessions.filter(s=>s.id!==done.id)];S.session=null;
  const msg=stars===3?'Incrível! Você acertou tudo!':stars>=1?'Muito bem! Você passou no desafio!':'Vamos treinar mais um pouco e tentar de novo!';
  app.innerHTML=`<div class="qcard result" style="margin-top:30px"><h1 style="font-size:40px">${esc(R.lesson.titulo)}</h1>
    <div class="bigstars">${[1,2,3].map(i=>`<span style="${i<=stars?'':'filter:grayscale(1);opacity:.3'}">⭐</span>`).join('')}</div>
    <p class="qtext" style="margin:0">${msg}</p><p class="cap" style="margin:0">Você acertou ${ok} de ${total} no desafio.</p>
    <div class="row" style="justify-content:center"><button class="btn ghost" data-act="again">Fazer de novo</button><button class="btn" data-act="home">Voltar para a trilha</button></div></div>`;
  speak(msg);
  if(stars>=1)confetti();
}
function confetti(){const c=document.createElement('div');c.className='confetti';const cols=['#3557E8','#FFB020','#1F9D61','#E5484D','#8FA6FF'];
  for(let i=0;i<60;i++){const e=document.createElement('i');e.style.left=Math.random()*100+'%';e.style.background=pick(cols);e.style.animationDelay=Math.random()*.6+'s';c.appendChild(e)}
  document.body.appendChild(c);setTimeout(()=>c.remove(),2800)}
function leaveLesson(){
  stopSpeak();
  if(S.session){const s=S.session;flushSession();S.sessions=[JSON.parse(JSON.stringify(s)),...S.sessions.filter(x=>x.id!==s.id)];S.session=null}
  R=null;renderMap();
}

/* =========================================================
   TELAS – PAIS
   ========================================================= */
let pinBuf='';
function renderPin(){
  S.view='pin';pinBuf='';
  app.innerHTML=`<div class="pin card"><h2>Área dos pais</h2><p class="muted">Digite o PIN de 4 números</p>
   <div class="dots" id="dots">${'<i></i>'.repeat(4)}</div>
   <div class="keys">${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-act="pk" data-arg="${n}">${n}</button>`).join('')}<button data-act="home" style="font-size:16px">Voltar</button><button data-act="pk" data-arg="0">0</button><button data-act="pdel" aria-label="Apagar">⌫</button></div>
   ${S.config.pin==='1234'?'<p class="muted" style="font-size:14px;margin-top:14px">PIN inicial: 1234. Troque nas configurações.</p>':''}</div>`;
}
function pinKey(d){
  if(d==='del')pinBuf=pinBuf.slice(0,-1);else if(pinBuf.length<4)pinBuf+=d;
  document.querySelectorAll('#dots i').forEach((e,i)=>e.classList.toggle('f',i<pinBuf.length));
  if(pinBuf.length===4){
    if(pinBuf===String(S.config.pin))setTimeout(renderParent,150);
    else{const d=document.getElementById('dots');d.classList.add('shake');setTimeout(()=>{pinBuf='';d.classList.remove('shake');document.querySelectorAll('#dots i').forEach(e=>e.classList.remove('f'))},400)}
  }
}
function stats(){
  const ss=S.sessions,byDay={};ss.forEach(s=>{byDay[s.date]=(byDay[s.date]||0)+(s.activeMs||0)});
  const days=[];for(let i=13;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=today(d);days.push({k,label:i===0?'hoje':String(d.getDate()),dow:'DSTQQSS'[d.getDay()],ms:byDay[k]||0})}
  const ans=ss.flatMap(s=>(s.answers||[]).map(a=>({...a,lesson:s.lessonTitle})));
  const group=(key)=>{const m={};ans.forEach(a=>{const k=a[key]||'—';(m[k]=m[k]||{n:0,ok:0,ms:0});m[k].n++;if(a.ok)m[k].ok++;m[k].ms+=a.ms||0});return Object.entries(m).map(([k,v])=>({k,...v,pct:Math.round(v.ok/v.n*100),avg:Math.round(v.ms/v.n/1000)}))};
  const errs={};ans.filter(a=>!a.ok).forEach(a=>{errs[a.type]=(errs[a.type]||0)+1});
  const week=days.slice(7),weekMs=week.reduce((a,d)=>a+d.ms,0),studiedDays=week.filter(d=>d.ms>0).length;
  return {days,ans,skills:group('skill').sort((a,b)=>a.pct-b.pct),errs:Object.entries(errs).sort((a,b)=>b[1]-a[1]),weekMs,studiedDays,
    recentErr:ans.filter(a=>!a.ok).sort((a,b)=>b.ts-a.ts).slice(0,10),
    total:ans.length,pct:ans.length?Math.round(ans.filter(a=>a.ok).length/ans.length*100):null,aiHelps:ss.reduce((a,s)=>a+(s.aiHelps||0),0)};
}
const fmtDT=ts=>{const d=new Date(ts);return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})+' '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})};
function meter(p){const c=p>=80?'var(--ok)':p>=60?'var(--sun)':'var(--bad)';return `<span class="meter"><i style="width:${p}%;background:${c}"></i></span>${p}%`}
function renderParent(){
  S.view='parent';
  const st=stats(),tm=todayMs(),studied=tm>=60000,goal=S.config.goal;
  const maxMs=Math.max(goal*60000,...st.days.map(d=>d.ms));
  app.innerHTML=`
  <div class="top"><h1 style="font-size:32px">Acompanhamento${S.config.childName?' · '+esc(S.config.childName):''}</h1><div class="spacer"></div><button class="btn ghost small" data-act="home">Sair</button></div>
  ${!API.url?'<div class="note">A planilha ainda não está conectada neste aparelho. Os dados estão salvos só aqui. Configure em Conexão, no fim da página.</div>':(outbox.length?`<div class="note">${outbox.length} registro(s) aguardando internet para ir para a planilha.</div>`:'')}
  <div class="pgrid">
    <div class="tile"><span class="l">Hoje</span><span class="v">${mins(tm)} min</span><span><span class="pill ${studied?(mins(tm)>=goal?'ok':'mid'):'no'}">${studied?(mins(tm)>=goal?'Meta cumprida':'Estudou, abaixo da meta'):'Ainda não estudou'}</span></span></div>
    <div class="tile"><span class="l">Últimos 7 dias</span><span class="v">${mins(st.weekMs)} min</span><span class="l">${st.studiedDays} de 7 dias com estudo</span></div>
    <div class="tile"><span class="l">Acerto geral</span><span class="v">${st.pct==null?'—':st.pct+'%'}</span><span class="l">${st.total} respostas registradas</span></div>
    <div class="tile"><span class="l">Lições concluídas</span><span class="v">${LESSONS.filter(l=>(S.progress[l.id]||{}).stars).length} de ${LESSONS.length}</span><span class="l">Ajudas da IA usadas: ${st.aiHelps}</span></div>
  </div>
  <div class="sec"><h2>Tempo de estudo por dia</h2><div class="card">
    <div class="chart">${st.days.map(d=>`<div title="${d.k}"><span>${d.ms?mins(d.ms):''}</span><b class="${mins(d.ms)>=goal?'goalhit':''}" style="height:${Math.round(d.ms/maxMs*100)}%"></b></div>`).join('')}</div>
    <div class="chartx">${st.days.map(d=>`<span>${d.label}<br>${d.dow}</span>`).join('')}</div>
    <p class="muted" style="font-size:14px;margin:10px 0 0">Minutos de tempo ativo. Verde = meta de ${goal} min cumprida. O tempo pausa quando ela fica 2 minutos sem tocar na tela ou sai do app.</p></div></div>
  <div class="sec"><h2>Análise com IA</h2>
    <div class="row"><button class="btn small" data-act="aianalyze">Gerar análise da semana</button><span class="muted" style="font-size:14px">Envia só números e erros, sem o nome dela.</span></div><div id="aianalysis"></div></div>
  <div class="sec"><h2>Desempenho por habilidade</h2><div class="card tbl">${st.skills.length?`<table><thead><tr><th>Habilidade</th><th>Acerto</th><th class="n">Respostas</th><th class="n">Tempo médio</th></tr></thead><tbody>
    ${st.skills.map(s=>`<tr><td>${esc(s.k)}</td><td>${meter(s.pct)}</td><td class="n">${s.n}</td><td class="n">${s.avg} s</td></tr>`).join('')}</tbody></table>`:'<p class="muted">Ainda sem respostas. Os dados aparecem depois da primeira lição.</p>'}</div></div>
  <div class="sec"><h2>Lições</h2><div class="card tbl"><table><thead><tr><th>Lição</th><th>BNCC</th><th>Estrelas</th><th class="n">Tentativas</th><th class="n">Melhor desafio</th></tr></thead><tbody>
    ${LESSONS.map(l=>{const p=S.progress[l.id]||{};return `<tr><td>${esc(l.subject)} · ${esc(l.titulo)}</td><td>${l.bncc}</td><td>${starHTML(p.stars||0)}</td><td class="n">${p.tries||0}</td><td class="n">${p.tries?`${p.best}/${l.quiz.length}`:'—'}</td></tr>`}).join('')}</tbody></table></div></div>
  <div class="sec"><h2>Erros mais frequentes</h2><div class="card">${st.errs.length?st.errs.slice(0,6).map(([t,n])=>`<div class="row" style="justify-content:space-between;padding:6px 0;border-bottom:1px solid #E3E9F5"><span>${esc(t)}</span><span class="pill no">${n}×</span></div>`).join(''):'<p class="muted">Nenhum erro registrado.</p>'}</div></div>
  <div class="sec"><h2>Últimos erros</h2><div class="card tbl">${st.recentErr.length?`<table><thead><tr><th>Quando</th><th>Pergunta</th><th>Respondeu</th><th>Certo</th></tr></thead><tbody>
    ${st.recentErr.map(a=>`<tr><td>${fmtDT(a.ts)}</td><td>${esc(a.q)}</td><td>${esc(a.given)}</td><td>${esc(a.correct)}</td></tr>`).join('')}</tbody></table>`:'<p class="muted">Nenhum erro registrado.</p>'}</div></div>
  <div class="sec"><h2>Sessões recentes</h2><div class="card tbl">${S.sessions.length?`<table><thead><tr><th>Início</th><th>Lição</th><th class="n">Tempo ativo</th><th>Etapa</th><th class="n">Desafio</th></tr></thead><tbody>
    ${S.sessions.slice(0,12).map(s=>`<tr><td>${fmtDT(s.start)}</td><td>${esc(s.lessonTitle)}</td><td class="n">${Math.max(0,Math.round((s.activeMs||0)/60000))} min</td><td>${{learn:'Aprender',practice:'Praticar',quiz:'Desafio',done:'Concluiu'}[s.phaseReached]||'—'}</td><td class="n">${s.quizScore==null?'—':s.quizScore+'/'+s.quizTotal}</td></tr>`).join('')}</tbody></table>`:'<p class="muted">Nenhuma sessão ainda.</p>'}</div></div>
  <div class="sec"><h2>Configurações</h2><div class="card col"><div class="form">
    <label for="cf-name">Nome dela (aparece só na tela)<input id="cf-name" type="text" value="${esc(S.config.childName)}" maxlength="30"></label>
    <label for="cf-pin">PIN da área dos pais (4 números)<input id="cf-pin" type="password" inputmode="numeric" maxlength="4" value="${esc(S.config.pin)}"></label>
    <label for="cf-goal">Meta diária (minutos)<input id="cf-goal" type="number" min="5" max="120" value="${S.config.goal}"></label>
    <label class="check" for="cf-ai"><input id="cf-ai" type="checkbox" ${S.config.ai?'checked':''}> Botão de ajuda com IA para ela</label>
    <label class="check" for="cf-read"><input id="cf-read" type="checkbox" ${S.config.autoRead?'checked':''}> Ler textos em voz alta automaticamente</label>
    <label class="check" for="cf-unlock"><input id="cf-unlock" type="checkbox" ${S.config.unlockAll?'checked':''}> Liberar todas as lições</label>
    </div><div class="row"><button class="btn small okb" data-act="savecfg">Salvar configurações</button><button class="btn small ghost" data-act="export">Copiar todos os dados (JSON)</button><button class="btn small ghost" data-act="testvoice">Testar voz</button></div>
    <div id="voicebox">${voiceControls()}</div>
    </div></div>
  <div class="sec"><h2>Conexão com a planilha</h2><div class="card col"><div class="form">
    <label for="cf-url">Endereço do Apps Script (termina em /exec)<input id="cf-url" type="text" value="${esc(API.url)}" placeholder="https://script.google.com/macros/s/.../exec"></label>
    <label for="cf-token">Token secreto<input id="cf-token" type="password" value="${esc(API.token)}"></label></div>
    <div class="row"><button class="btn small" data-act="savecon">Salvar e testar conexão</button><span class="muted" style="font-size:14px" id="constat">${API.url?(store.synced?'Conectado'+(API.aiReady?' · IA ativa':' · IA não configurada'):'Configurado, mas sem resposta ainda'):'Não configurado'}</span></div>
    <p class="muted" style="font-size:14px;margin:0">A conexão fica salva só neste aparelho. No tablet dela, use o link de configuração do guia para não precisar digitar.</p></div></div>`;
}
async function aiAnalyze(btn){
  const out=document.getElementById('aianalysis');btn.disabled=true;
  if(!aiOn()){out.innerHTML='<div class="aibox">A IA ainda não está configurada. Veja o passo do Gemini no guia de instalação.</div>';btn.disabled=false;return}
  const st=stats();
  if(!st.total){out.innerHTML='<div class="aibox">Ainda não há respostas para analisar. Faça uma lição primeiro.</div>';btn.disabled=false;return}
  const summary={metaDiariaMin:S.config.goal,minutosPorDia14:st.days.map(d=>({dia:d.k,min:mins(d.ms)})),diasComEstudo7:st.studiedDays,
    acertoGeral:st.pct,habilidades:st.skills.map(s=>({habilidade:s.k,acerto:s.pct,respostas:s.n,tempoMedioSeg:s.avg})),
    licoes:LESSONS.map(l=>({licao:l.subject+' - '+l.titulo,estrelas:(S.progress[l.id]||{}).stars||0,tentativas:(S.progress[l.id]||{}).tries||0})),
    errosFrequentes:st.errs.slice(0,8).map(([t,n])=>({tipo:t,vezes:n})),ultimosErros:st.recentErr.slice(0,8).map(a=>({pergunta:a.q,respondeu:a.given,certo:a.correct})),ajudasIA:st.aiHelps};
  const prompt=`Você ajuda um pai a acompanhar os estudos da filha de 7 anos (2º ano, Brasil), que usa em casa um app de reforço de Matemática e Português.
Com base nos dados abaixo, escreva em português do Brasil, de forma direta e prática:
**Resumo**: 2 ou 3 frases sobre frequência e tempo de estudo em relação à meta.
**Pontos fortes**
**O que reforçar**: explique o padrão dos erros e o que provavelmente está por trás deles.
**Para fazer fora da tela esta semana**: duas atividades curtas e concretas.
Use títulos em negrito como acima e listas com "- ". Seja honesto: se houver poucos dados, diga isso. No máximo 250 palavras.
Dados: ${JSON.stringify(summary)}`;
  out.innerHTML='<div class="aibox">Analisando…</div>';
  try{
    const r=await api('ai',{kind:'analyze',prompt});
    out.innerHTML='<div class="aibox">'+mdLite(r.text||'')+'</div>';
  }catch(e){out.innerHTML='<div class="aibox">Não foi possível gerar a análise agora'+(e&&e.code==='limite_ia'?' (limite diário de IA atingido)':e&&e.code?' ('+esc(e.code)+')':'')+'.</div>'}
  btn.disabled=false;
}
function mdLite(t){
  const lines=esc(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').split('\n');let h='',inL=false;
  for(const ln of lines){if(/^\s*[-•]\s+/.test(ln)){if(!inL){h+='<ul>';inL=true}h+='<li>'+ln.replace(/^\s*[-•]\s+/,'')+'</li>'}else{if(inL){h+='</ul>';inL=false}if(ln.trim())h+='<p style="margin:6px 0">'+ln+'</p>'}}
  return h+(inL?'</ul>':'');
}
async function saveCfg(){
  const pin=document.getElementById('cf-pin').value.trim();
  if(!/^\d{4}$/.test(pin)){toast('O PIN precisa ter 4 números.');return}
  const goal=Math.min(120,Math.max(5,parseInt(document.getElementById('cf-goal').value,10)||20));
  S.config={...S.config,childName:document.getElementById('cf-name').value.trim().slice(0,30),pin,goal,
    ai:document.getElementById('cf-ai').checked,autoRead:document.getElementById('cf-read').checked,unlockAll:document.getElementById('cf-unlock').checked};
  try{await saveConfig();toast('Configurações salvas.');renderParent()}catch(e){toast('Não consegui salvar. Tente de novo.')}
}
async function saveCon(){
  const url=document.getElementById('cf-url').value.trim(),tok=document.getElementById('cf-token').value.trim(),st=document.getElementById('constat');
  if(url&&!/^https:\/\/script\.google\.com\/.+\/exec$/.test(url)){toast('O endereço precisa começar com https://script.google.com e terminar com /exec.');return}
  LS.set('apiUrl',url);LS.set('apiToken',tok);
  if(!url){st.textContent='Não configurado';return}
  st.textContent='Testando…';
  try{const d=await api('ping',{});API.aiReady=!!d.aiReady;LS.set('aiReady',API.aiReady);st.textContent='Conectado'+(API.aiReady?' · IA ativa':' · IA não configurada');
    await store.init();await loadState();toast('Conexão funcionando.')}
  catch(e){st.textContent='Falhou: '+(e&&e.code==='token_invalido'?'token errado':'verifique o endereço e a implantação');}
}
async function exportData(){
  const data=JSON.stringify({exportadoEm:new Date().toISOString(),config:{...S.config,pin:undefined},progress:S.progress,sessions:S.sessions},null,1);
  try{await navigator.clipboard.writeText(data);toast('Dados copiados. Cole onde quiser guardar.')}catch(e){toast('Não consegui copiar neste aparelho.')}
}

/* =========================================================
   AÇÕES
   ========================================================= */
const ACT={
  subj(id){const s=SUBJECTS.find(x=>x.id===id);if(s&&s.ready){S.subject=id;try{localStorage.setItem('ts:subject',id)}catch(e){}renderMap()}else{toast(s.nome+' chega em breve!');speak(s.nome+' chega em breve!')}},
  locked(){toast('Ganhe pelo menos 1 estrela na lição anterior para abrir esta.');speak('Termine a lição anterior para abrir esta.')},
  open(i){startLesson(+i)},
  home(){if(S.view==='lesson'||R)leaveLesson();else renderMap()},
  say(){speak(R.lesson.slides[R.slide].t)},
  sayq(){speak(R.q.speak||R.q.text)},
  prevslide(){R.slide--;renderLearn()},
  nextslide(){if(R.slide<R.lesson.slides.length-1){R.slide++;renderLearn()}else beginPhase('practice')},
  ans(i,el){const o=R.q.options[+i];handleAnswer(o.ok,o.label,o.type,el)},
  addT(){if(R.build.t<9){R.build.t++;drawBuild()}},
  addU(){if(R.build.u<9){R.build.u++;drawBuild()}else if(R.build.t<9){R.build.t++;R.build.u=0;drawBuild();toast('10 unidades viraram 1 dezena!');speak('Dez unidades viraram uma dezena!')}},
  undoB(){if(R.build.u>0)R.build.u--;else if(R.build.t>0)R.build.t--;drawBuild()},
  checkB(){const b=R.build,q=R.q,ok=b.t===q.t&&b.u===q.u;
    const type=ok?null:(b.t===q.u&&b.u===q.t?'trocou dezena com unidade':b.t!==q.t?'montou as dezenas errado':'montou as unidades errado');
    handleAnswer(ok,b.t*10+b.u,type,null)},
  sylPick(i){const n=+i;if(!R.syl.picked.includes(n)){R.syl.picked.push(n);drawSyl();speak(R.q.parts[n].toLowerCase())}},
  sylDel(){R.syl.picked.pop();drawSyl()},
  sylCheck(){const q=R.q,given=R.syl.picked.map(i=>q.parts[i]).join('');if(R.syl.picked.length<q.parts.length){toast('Use todas as sílabas.');return}
    const ok=given===q.word,first=R.tries===0;handleAnswer(ok,given,ok?null:'trocou a ordem das sílabas',null);if(!ok&&R.phase==='practice'&&first){R.syl.picked=[];drawSyl()}},
  aiexp(_,el){aiExplain(el)},
  nextq(){if(R.qi<R.items.length-1){R.qi++;renderQ()}else if(R.phase==='practice'){R.quizOk=0;beginPhase('quiz')}else finishLesson()},
  again(){startLesson(R.idx)},
  parent(){renderPin()},
  pk(d){pinKey(d)},
  pdel(){pinKey('del')},
  aianalyze(_,el){aiAnalyze(el)},
  savecfg(){saveCfg()},
  export(){exportData()},
  savecon(){saveCon()},
  testvoice(){voiceWarned=false;speak('Olá! Vamos estudar juntos? Quantas dezenas tem o número quarenta e sete?')},
};
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const f=ACT[b.dataset.act];if(f)f(b.dataset.arg,b)});

/* =========================================================
   INÍCIO
   ========================================================= */
async function loadState(){
  const [cfg,prog,sess]=await Promise.all([store.get('config/main'),store.get('progress/main'),store.sessions()]);
  if(cfg)S.config={...S.config,...cfg};
  if(prog&&prog.lessons)S.progress=prog.lessons;
  S.sessions=sess||[];
}
(async function init(){
  await loadState();renderMap();           // abre na hora com os dados do aparelho
  await store.init();await loadState();    // depois sincroniza com a planilha
  if(S.view==='map'&&!R)renderMap();
})();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
