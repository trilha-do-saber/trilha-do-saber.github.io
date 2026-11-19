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
  try{
    // um registro recusado pelo servidor não trava os outros: vai para o fim da fila e os demais seguem
    for(const it of outbox.slice()){
      try{await api(it.action,it.payload);outbox=outbox.filter(x=>x!==it)}
      catch(e){if(!e||!e.code)throw e;it.erro=e.code;it.tent=(it.tent||0)+1;console.warn('servidor recusou',it.action,e.code)}
      LS.set('outbox',outbox);
    }
  }catch(e){console.warn('envio adiado (sem conexão)',e)}
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
      if(Array.isArray(d.memoria))LS.set('memoria',d.memoria);
      if(Array.isArray(d.diario)){const m=LS.get('diario',{});d.diario.forEach(r=>{if(r&&r.id&&!pending('d:'+r.id))m[r.id]=r});LS.set('diario',m)}
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
  async sessions(){return Object.values(LS.get('sessions',{})).sort((a,b)=>b.start-a.start)},
  diario(){return Object.values(LS.get('diario',{}))},
  setDiario(rec){const m=LS.get('diario',{});m[rec.id]=rec;LS.set('diario',m);enqueue('saveDiario',rec,'d:'+rec.id)}
};
/* SINCRONIZAÇÃO ENTRE APARELHOS: busca os dados novos da planilha ao abrir, ao voltar para o app,
   ao entrar na área dos pais e a cada 45 s com a área dos pais ou a tela inicial abertas (nunca no meio de uma lição). */
let syncing=false,lastSync=0;
async function sincronizar(force){
  if(!API.url||syncing||R||(!force&&Date.now()-lastSync<20000))return;
  syncing=true;const ind=document.getElementById('syncinfo');if(ind)ind.textContent='Atualizando dados…';
  try{await flushOutbox();await store.init();lastSync=Date.now();await loadState()}catch(e){console.warn(e)}
  finally{syncing=false}
  if(R)return;
  const ae=document.activeElement,digitando=ae&&/INPUT|TEXTAREA|SELECT/.test(ae.tagName);
  if(S.view==='parent'&&!digitando){const y=window.scrollY;renderParent();window.scrollTo(0,y)}
  else if(S.view==='map')renderMap();
  else{const i=document.getElementById('syncinfo');if(i)i.textContent=syncTxt()}
}
const syncTxt=()=>lastSync?'Dados atualizados às '+new Date(lastSync).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'Dados deste aparelho';
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')sincronizar()});
setInterval(()=>{if(document.visibilityState==='visible'&&(S.view==='parent'||S.view==='map'))sincronizar()},45000);
function trimSessions(map){const arr=Object.values(map).sort((a,b)=>b.start-a.start).slice(0,300);const o={};arr.forEach(s=>o[s.id]=s);return o}
const aiOn=()=>!!(API.url&&API.aiReady);

/* ATUALIZAÇÃO AUTOMÁTICA: o app confere se há versão nova e se atualiza sozinho quando ela não está no meio de uma lição
   (ao abrir, ao voltar para a tela inicial ou ao sair da área dos pais). Se a atualização não pegar, tenta de novo sozinha a cada 90 segundos.
   Ao publicar, mude APP_VERSAO, versao.json e VERSAO no sw.js para o mesmo valor. */
const APP_VERSAO='trilha-v53';
let novaVersao=null;
async function checarVersao(){
  try{const r=await fetch('versao.json?t='+Date.now(),{cache:'no-store'});const j=await r.json();
    if(j.versao&&j.versao!==APP_VERSAO){novaVersao=j.versao;atualizarSePuder()}else return false}catch(e){return null}
  return true;
}
function atualizarSePuder(){
  if(!novaVersao)return;
  /* espera só no meio de uma lição (sessão aberta), na área dos pais ou no meio de uma partida; na tela de resultado e no menu de jogos pode atualizar */
  if((R&&S.session)||S.view==='parent'||S.view==='pin'||(S.view==='jogo'&&typeof JG!=='undefined'&&JG)||(S.view==='fotos'&&typeof FOTO_ATUAL!=='undefined'&&FOTO_ATUAL))return;
  const t=LS.get('updTent',{});
  if(t.v===novaVersao&&Date.now()-t.ts<90000){setTimeout(atualizarSePuder,90000);return} // tentou há pouco: tenta de novo sozinho, sem botão
  LS.set('updTent',{v:novaVersao,ts:Date.now()});
  toast('Atualizando o app…');atualizarApp();
}
function mostrarAtualizacao(){}
const ARQ_APP=['./','index.html','app.js','jogos.js','fotos.js','robo.js','conteudo.js','versao.json','sw.js','manifest.webmanifest'];
async function atualizarApp(){
  const b=document.querySelector('[data-act=atualizar]');if(b){b.disabled=true;b.textContent='Atualizando…'}
  try{flushSession&&flushSession()}catch(e){}
  /* força o navegador a buscar os arquivos novos (o GitHub Pages deixa uma cópia de 10 minutos no cache) */
  try{await Promise.all(ARQ_APP.map(u=>fetch(u,{cache:'reload'}).catch(()=>{})))}catch(e){}
  try{const reg=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();
    if(reg){await reg.update();const w=reg.installing||reg.waiting;
      if(w){await new Promise(ok=>{const fim=()=>ok();navigator.serviceWorker.addEventListener('controllerchange',fim,{once:true});if(reg.waiting)reg.waiting.postMessage('pular');
        w.addEventListener('statechange',()=>{if(w.state==='installed')w.postMessage('pular');if(w.state==='activated'||w.state==='redundant')fim()});setTimeout(fim,6000)})}}}catch(e){}
  try{const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)))}catch(e){}
  setTimeout(()=>location.reload(),300);
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checarVersao()});
setInterval(checarVersao,10*60*1000);

/* VOZ: voz do próprio aparelho (gratuita e funciona sem internet) */
let speakTok=0,voiceWarned=false;
const hasWebSpeech=()=>typeof window.speechSynthesis!=='undefined'&&typeof window.SpeechSynthesisUtterance!=='undefined';
try{if(hasWebSpeech()){speechSynthesis.getVoices();speechSynthesis.onvoiceschanged=()=>{const b=document.getElementById('voicebox');if(b)b.innerHTML=voiceControls()}}}catch(e){}
function webSpeak(text){
  if(!hasWebSpeech())return false;
  try{const ss=window.speechSynthesis;ss.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='pt-BR';u.rate=.95;
    const v=chosenVoice();if(v){u.voice=v;u.lang=v.lang}u.rate=LS.get('voiceRate',.95);u.onerror=e=>{if(e&&e.error!=='interrupted'&&e.error!=='canceled')vozFalhou(e.error)};ss.speak(u);try{ss.resume()}catch(e){}return true}catch(e){return false}
}
let vozAviso=false;
function vozFalhou(motivo){console.warn('voz',motivo);if(vozAviso)return;vozAviso=true;toast('O tablet não conseguiu falar. Confira a voz do sistema em Configurações → Saída de texto para voz.')}
function noVoice(){if(voiceWarned)return;voiceWarned=true;toast('Este navegador não tem voz. Use o Chrome ou o Safari.')}
function speak(text){if(!text)return;speakTok++;text=String(text);
  if(!/\{[^}]+\}/.test(text)){if(!webSpeak(text))noVoice();return}
  if(!hasWebSpeech()){noVoice();return}
  /* trechos entre chaves {apple} são falados com voz em inglês */
  try{const ss=window.speechSynthesis;ss.cancel();const pv=chosenVoice(),ev=enVoice(),rate=LS.get('voiceRate',.95);
    text.split(/(\{[^}]+\})/).filter(t=>t.trim()).forEach(t=>{const en=t[0]==='{',u=new SpeechSynthesisUtterance(en?t.slice(1,-1):t);
      if(en){u.lang='en-US';if(ev){u.voice=ev;u.lang=ev.lang}u.rate=Math.min(rate,.85)}else{u.lang='pt-BR';if(pv){u.voice=pv;u.lang=pv.lang}u.rate=rate}
      ss.speak(u)});try{ss.resume()}catch(e){}}catch(e){noVoice()}}
/* voz em inglês para a matéria Inglês (prefere en-US e vozes do Google) */
function enVoice(){if(!hasWebSpeech())return null;
  const score=v=>(/en[-_]US/i.test(v.lang)?10:/en[-_]GB/i.test(v.lang)?8:0)+(/natural|neural|online|premium|enhanced/i.test(v.name)?5:0)+(/google/i.test(v.name)?3:0);
  return speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang)).sort((a,b)=>score(b)-score(a))[0]||null}
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
  const android=/android/i.test(navigator.userAgent);
  if(vs.length<2)return `<p class="muted" style="font-size:14px;margin:0">Voz: ${esc(voiceStatus())}</p>`+(android?`<div class="note">Neste celular/tablet Android, o navegador usa a voz do sistema. Para trocar: <b>Configurações → Acessibilidade (ou Gerenciamento geral) → Saída de texto para voz</b> → escolha <b>Serviços de fala do Google</b> → engrenagem → <b>Instalar dados de voz → Português (Brasil)</b> → escolha a voz e baixe em qualidade alta. Depois feche e abra o app.</div>`:'');
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
const S={config:{childName:'',pin:'1234',goal:20,ai:true,autoRead:true,unlockAll:false,fundo:true,roteiro:true,livreDepois:true,memDias:[1,3,5]},progress:{},sessions:[],session:null,lastAct:Date.now(),view:'map',subject:(()=>{try{return localStorage.getItem('ts:subject')||'mat'}catch(e){return 'mat'}})()};
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
/* Semana do CC recém-liberada que ela ainda não terminou: aviso na tela inicial com tudo o que veio junto */
function ccSemanaNova(){const lib=MEMINFO.lib;if(!lib.length)return null;const k=lib[lib.length-1].k,[c,s]=k.split('|');
  const ls=LESSONS.filter(l=>l.subject==='Memória'&&(l.id===`mem-c${c}-s${s}`||l.cc===k)),falta=ls.filter(l=>!((S.progress[l.id]||{}).tries));
  if(!falta.length)return null;
  return {k,c,s,aprof:ls.filter(l=>l.cc===k).length,mem:ls.some(l=>l.id===`mem-c${c}-s${s}`),pratica:praticaDe(k),exper:(typeof CC_EXPER!=='undefined'?CC_EXPER:[]).filter(e=>e.cc===k).length,falta:falta.length}}
function ccAvisoHTML(){const n=ccSemanaNova();if(!n)return '';
  if(LS.get('ccAvisada','')!==n.k){LS.set('ccAvisada',n.k);setTimeout(()=>speak(`Chegou a semana ${n.s} do CC! Vamos descobrir as novidades?`),800)}
  const it=[n.mem?'🎵 Memorização':'',n.aprof?`📚 ${n.aprof} lições Aprofunde`:'',n.pratica?'🖐️ Mãos na massa':'',n.exper?`🧪 ${n.exper} experimento${n.exper>1?'s':''}`:''].filter(Boolean);
  return `<button class="mini" data-act="subj" data-arg="mem" style="width:100%;margin-bottom:12px;background:linear-gradient(135deg,#FFF1C9,#FFD9E8);border:3px solid #FFB020;animation:jpisca 1.6s infinite;text-align:left">
    <span class="ic">✨</span><span><b style="font-size:20px">Chegou a semana ${n.s} do CC!</b><small>${it.join(' · ')}</small><small>Toque para começar. ${n.falta>1?`Faltam ${n.falta} lições desta semana.`:'Falta 1 lição desta semana.'}</small></span></button>`}
const memNovas=()=>LESSONS.filter(l=>l.subject==='Memória'&&l.id!=='mem-mestre'&&!((S.progress[l.id]||{}).tries));
function unlocked(i){const L=curLessons();if(curSubj().id==='mem')return true;return S.config.unlockAll||i===0||((S.progress[L[i-1].id]||{}).stars||0)>=1}
/* ---- missão, aquecimento, leitura, potes ---- */
const weekIdx=()=>Math.floor((Date.now()-new Date(2026,0,5).getTime())/6048e5);
const missaoAtual=()=>MISSOES[((weekIdx()%MISSOES.length)+MISSOES.length)%MISSOES.length];
const missaoFeita=()=>store.diario().find(r=>r.id==='missao-'+weekIdx());
const leituras=()=>store.diario().filter(r=>r.tipo==='leitura').sort((a,b)=>b.ts-a.ts);
const livrosLidos=()=>[...new Set(leituras().map(r=>r.livro))];
/* ---- Minha estante: livros que ela já leu (registros de leitura da área dos pais) ---- */
const CORES_LIVRO=['#E06666','#6FA8DC','#F6C342','#93C47D','#B39DDB','#F4A261','#4DB6AC','#F48FB1'];
function renderEstante(){S.view='estante';
  const por={};leituras().forEach(r=>{const k=r.livro||'Sem título';const b=por[k]=por[k]||{livro:k,vezes:0,min:0,ult:0,primeiro:Infinity,recontou:false,nota:0};
    b.vezes++;b.min+=Number(r.minutos)||0;b.ult=Math.max(b.ult,r.ts||0);b.primeiro=Math.min(b.primeiro,r.ts||Infinity);b.recontou=b.recontou||!!r.recontou;b.nota=Math.max(b.nota,Number(r.gostou)||0)});
  const livros=Object.values(por).sort((x,y)=>y.ult-x.ult),totMin=livros.reduce((s,b)=>s+b.min,0),dt=ts=>new Date(ts).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
  app.innerHTML=`<div class="top"><button class="btn ghost small" data-act="home">⬅ Início</button><h1 class="hello" style="font-size:28px">📚 Minha estante</h1><div class="spacer"></div></div>
   <div class="card col" style="gap:6px;text-align:center;margin-top:10px"><div style="font-size:22px;font-weight:800">${livros.length} livro${livros.length===1?'':'s'} lido${livros.length===1?'':'s'} · ${totMin} minutos de leitura</div>
   <div class="muted">${livros.length?'Toque no 🔊 para ouvir o nome do livro.':'Quando o papai registrar uma leitura, o livro aparece aqui na sua estante.'}</div></div>
   <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-top:14px">
   ${livros.map((b,i)=>`<div style="background:${CORES_LIVRO[i%CORES_LIVRO.length]};border-radius:10px 18px 18px 10px;border-left:12px solid rgba(0,0,0,.18);padding:12px;color:#1D2846;box-shadow:0 4px 0 rgba(29,40,70,.15);display:flex;flex-direction:column;gap:6px;min-height:170px">
     <div style="font-size:30px">📖</div><b style="font-size:18px;line-height:1.2;flex:1">${esc(b.livro)}</b>
     <div style="font-size:18px">${b.nota?'⭐'.repeat(b.nota):''}</div>
     <small style="font-weight:700">${b.vezes>1?`Lido ${b.vezes} vezes`:'Lido 1 vez'} · ${b.min} min${b.recontou?' · 🗣️ recontou':''}</small>
     <small>Última vez: ${dt(b.ult)}</small>
     <button class="speak" data-act="saylivro" data-arg="${esc(b.livro)}" aria-label="Ouvir o nome do livro" style="align-self:flex-end">🔊</button></div>`).join('')}
   </div>`;window.scrollTo(0,0)}
const potes=()=>store.diario().find(r=>r.id==='potes');
function perguntasHoje(){const d=Math.floor(Date.now()/864e5),n=LEIT_PERGUNTAS.length;return [0,1,2].map(i=>LEIT_PERGUNTAS[(d*3+i)%n])}
function applyFundo(){document.documentElement.classList.toggle('fundo',S.config.fundo!==false)}
function warmupKeys(){
  const done=LESSONS.filter(l=>((S.progress[l.id]||{}).stars||0)>=1&&l.subject!=='Memória');
  const keys=[...new Set(done.flatMap(l=>l.quiz))].filter(k=>GEN[k]);
  if(!keys.length)return [];
  const lim=Date.now()-14*864e5,err={};
  S.sessions.filter(x=>x.start>=lim).forEach(x=>(x.answers||[]).forEach(a=>{if(!a.ok)err[a.skill]=(err[a.skill]||0)+1}));
  const w=keys.map(k=>{let sk='';try{sk=GEN[k]().skill}catch(e){}return 1+3*Math.min(3,err[sk]||0)});
  const tot=w.reduce((a,b)=>a+b,0),out=[];
  for(let i=0;i<tam().aquec;i++){let r=Math.random()*tot,ch=keys[keys.length-1];for(let j=0;j<keys.length;j++){r-=w[j];if(r<=0){ch=keys[j];break}}out.push(ch)}
  return out;
}
const warmupDone=()=>S.sessions.some(x=>x.lessonId==='aquecimento'&&x.date===today()&&x.phaseReached==='done');
function startWarmup(){const keys=warmupKeys();if(!keys.length){toast('Complete uma lição primeiro.');return}
  startLessonObj({id:'aquecimento',titulo:'Aquecimento do dia',icone:'🔥',subject:'Revisão',slides:[],practice:[],quiz:keys},-1,'Revisão',true)}
/* ---- Potes: o app faz as contas a partir dos movimentos ---- */
const POTES=['gastar','guardar','investir'],POTE_IC={gastar:'🛍️',guardar:'🐷',investir:'📈'},POTE_NM={gastar:'Gastar',guardar:'Guardar',investir:'Investir'};
const brl=v=>{const n=Math.round((v||0)*100)/100;return 'R$ '+(Number.isInteger(n)?String(n):n.toFixed(2).replace('.',','))};
function potesCfg(){const p=potes()||{};return {ativo:!!potes(),mesada:p.mesada??10,pct:p.pct||{gastar:40,guardar:40,investir:20},cada:p.cada??10,ganha:p.ganha??1,metaNome:p.metaNome||'',metaValor:p.metaValor||0,
  base:p.base||{gastar:p.gastar||0,guardar:p.guardar||0,investir:p.investir??p.doar??0}}}
const movs=()=>store.diario().filter(r=>r.tipo==='pote').sort((a,b)=>a.ts-b.ts);
function saldos(ate){const c=potesCfg(),s={...c.base};movs().filter(m=>!ate||m.ts<ate).forEach(m=>POTES.forEach(k=>{s[k]=Math.round(((s[k]||0)+((m.v||{})[k]||0))*100)/100}));return s}
function dividir(valor){const c=potesCfg(),v={};const g=Math.floor(valor*c.pct.gastar)/100,u=Math.floor(valor*c.pct.guardar)/100;v.gastar=g;v.guardar=u;v.investir=Math.round((valor-g-u)*100)/100;return v}
function addMov(op,v,desc){store.setDiario({id:'t-'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),tipo:'pote',op,data:today(),ts:Date.now(),v,desc:String(desc||'').slice(0,60)})}
function aplicarRendimento(){
  const c=potesCfg();if(!c.ativo||!c.cada||!c.ganha)return;
  const d=new Date(),ini=new Date(d.getFullYear(),d.getMonth(),1).getTime(),pm=new Date(d.getFullYear(),d.getMonth()-1,1);
  const key=pm.getFullYear()+'-'+String(pm.getMonth()+1).padStart(2,'0'),id='rend-'+key;
  if(store.diario().some(r=>r.id===id))return;
  const bal=saldos(ini).investir,g=Math.floor(bal/c.cada)*c.ganha;if(g<=0)return;
  store.setDiario({id,tipo:'pote',op:'rendimento',data:today(),ts:ini,v:{investir:g},desc:`Rendimento de ${['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'][pm.getMonth()]}`});
}
function metaInfo(){const c=potesCfg(),s=saldos();if(!c.metaNome||!c.metaValor)return null;const falta=Math.max(0,c.metaValor-s.guardar),porSem=c.mesada*c.pct.guardar/100;
  return {pct:Math.min(100,Math.round(s.guardar/c.metaValor*100)),falta,semanas:falta&&porSem?Math.ceil(falta/porSem):0}}
function movTexto(m){const tot=POTES.reduce((a,k)=>a+((m.v||{})[k]||0),0),ic={mesada:'💵',gasto:'🛍️',entrada:'➕',rendimento:'📈',meta:'🎯'}[m.op]||'•';
  return `${ic} ${esc(m.desc||m.op)} <b style="color:${tot<0?'var(--bad)':'var(--ok)'}">${tot<0?'−':'+'}${brl(Math.abs(tot))}</b>`}
function potesParentHTML(){
  const c=potesCfg(),s=saldos(),mi=metaInfo(),hist=movs().slice(-12).reverse(),p=c.pct;
  const cfg=`<div class="form">
      <label for="pc-mesada">Mesada por semana (R$)<input id="pc-mesada" type="number" min="0" step="0.5" value="${c.mesada}"></label>
      <label for="pc-g">🛍️ Gastar (%)<input id="pc-g" type="number" min="0" max="100" value="${p.gastar}"></label>
      <label for="pc-u">🐷 Guardar (%)<input id="pc-u" type="number" min="0" max="100" value="${p.guardar}"></label>
      <label for="pc-i">📈 Investir (%)<input id="pc-i" type="number" min="0" max="100" value="${p.investir}"></label>
      <label for="pc-ganha">Rendimento: ganha R$<input id="pc-ganha" type="number" min="0" step="0.5" value="${c.ganha}"></label>
      <label for="pc-cada">… a cada R$ no pote Investir, por mês<input id="pc-cada" type="number" min="1" step="1" value="${c.cada}"></label>
      <label for="pc-mn">Meta: o que ela quer comprar<input id="pc-mn" type="text" maxlength="40" value="${esc(c.metaNome)}"></label>
      <label for="pc-mv">Valor da meta (R$)<input id="pc-mv" type="number" min="0" step="0.5" value="${c.metaValor||''}"></label>
    </div><div class="row"><button class="btn small okb" data-act="ptcfg">${c.ativo?'Salvar configuração':'Ligar os potes'}</button></div>`;
  if(!c.ativo)return `<div class="sec"><h2>🐷 Potes de dinheiro</h2><div class="card col"><p class="muted" style="margin:0">Configure uma vez. Depois você só registra a mesada e os gastos, e o app faz as contas.</p>${cfg}</div></div>`;
  return `<div class="sec"><h2>🐷 Potes de dinheiro</h2><div class="card col">
    <div class="potes">${POTES.map(k=>`<span>${POTE_IC[k]}<b>${POTE_NM[k]}</b>${brl(s[k])}</span>`).join('')}</div>
    ${mi?`<div><div class="row" style="justify-content:space-between"><span>🎯 ${esc(c.metaNome)}</span><span>${brl(s.guardar)} de ${brl(c.metaValor)} (${mi.pct}%)</span></div><div class="bar"><i style="width:${mi.pct}%"></i></div><small class="muted">${mi.falta?`Faltam ${brl(mi.falta)}, cerca de ${mi.semanas} semana(s) de mesada.`:'Meta alcançada!'}</small></div>`:''}
    <div class="row"><button class="btn small okb" data-act="ptmesada">💵 Dar mesada (${brl(c.mesada)})</button><span class="muted" style="font-size:14px">Divide sozinho: ${POTES.map(k=>`${POTE_NM[k]} ${brl(dividir(c.mesada)[k])}`).join(' · ')}</span></div>
    <div class="form">
      <label for="pt-val">Valor (R$)<input id="pt-val" type="number" min="0" step="0.5"></label>
      <label for="pt-pote">Pote<select id="pt-pote" class="sel"><option value="auto">Dividir nos 3 potes</option>${POTES.map(k=>`<option value="${k}">${POTE_IC[k]} ${POTE_NM[k]}</option>`).join('')}</select></label>
      <label for="pt-desc">Descrição<input id="pt-desc" type="text" maxlength="60" placeholder="ex.: figurinha, presente da vó"></label>
    </div>
    <div class="row"><button class="btn small" data-act="ptgasto">➖ Ela gastou</button><button class="btn small ghost" data-act="ptentrada">➕ Ela ganhou</button>${mi&&!mi.falta?`<button class="btn small" style="background:var(--sun);box-shadow:0 4px 0 #C27C00" data-act="ptmeta">🎯 Comprou a meta</button>`:''}</div>
    <p class="muted" style="margin:0;font-size:14px">Gasto sem pote escolhido sai do Gastar. Entrada com "Dividir" segue as porcentagens. O rendimento do mês entra sozinho no dia 1º.</p>
    ${hist.length?`<div class="tbl"><table><thead><tr><th>Data</th><th>Movimento</th>${POTES.map(k=>`<th class="n">${POTE_IC[k]}</th>`).join('')}</tr></thead><tbody>${hist.map(m=>`<tr><td>${new Date(m.ts).toLocaleDateString('pt-BR')}</td><td>${esc(m.desc||m.op)}</td>${POTES.map(k=>{const x=(m.v||{})[k]||0;return `<td class="n" style="color:${x<0?'var(--bad)':x>0?'var(--ok)':'var(--muted)'}">${x?(x>0?'+':'−')+brl(Math.abs(x)).replace('R$ ',''):'·'}</td>`}).join('')}</tr>`).join('')}</tbody></table></div>`:''}
    <details><summary style="cursor:pointer;color:var(--pri)">Configurar mesada, porcentagens, rendimento e meta</summary><div class="col" style="margin-top:10px">${cfg}</div></details>
  </div></div>`;
}
function potesHTML(){
  const c=potesCfg();if(!c.ativo)return '<div class="mini" style="margin-bottom:14px"><span class="ic">🐷</span><span><b>Meus potes</b><small>Peça para o papai ligar seus potes de Gastar, Guardar e Investir.</small></span></div>';
  const s=saldos(),mi=metaInfo(),ult=movs().slice(-3).reverse();
  return `<div class="card col" style="margin-bottom:14px"><div class="potes">${POTES.map(k=>`<span>${POTE_IC[k]}<b>${POTE_NM[k]}</b>${brl(s[k])}</span>`).join('')}</div>
    ${mi?`<div><div class="row" style="justify-content:space-between"><span>🎯 Meta: ${esc(c.metaNome)}</span><span>${brl(s.guardar)} de ${brl(c.metaValor)}</span></div><div class="bar"><i style="width:${mi.pct}%"></i></div>
      <small class="muted">${mi.falta?`Faltam ${brl(mi.falta)}: mais ou menos ${mi.semanas} semana${mi.semanas>1?'s':''} de mesada.`:'Você já tem o dinheiro da meta! 🎉'}</small></div>`:''}
    ${ult.length?`<div class="col" style="gap:4px;font-size:15px">${ult.map(m=>`<span>${movTexto(m)}</span>`).join('')}</div>`:''}</div>`;
}

/* ---- Conversa com o Claude (área dos pais) ----
   O Pedro escreve pedidos (tipo 'pedido' na aba Diario). Uma rotina do Claude lê todo dia à noite,
   faz as mudanças no app e responde gravando um registro tipo 'resposta' (ref = id do pedido) na mesma aba. */
let chatTudo=false;
const chatMsgs=()=>store.diario().filter(r=>r.tipo==='pedido'||r.tipo==='resposta').sort((x,y)=>(x.ts||0)-(y.ts||0));
const chatNovas=()=>{const lido=LS.get('chatLido',0);return chatMsgs().filter(r=>r.tipo==='resposta'&&(r.ts||0)>lido).length};
function chatHTML(){
  const ms=chatMsgs(),mostra=chatTudo?ms:ms.slice(-6),resp=new Set(ms.filter(r=>r.tipo==='resposta').map(r=>r.ref)),nov=chatNovas();
  const quando=ts=>new Date(ts).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
  const bolha=r=>{const eu=r.tipo==='pedido';return `<div style="display:flex;justify-content:${eu?'flex-end':'flex-start'}"><div style="max-width:85%;background:${eu?'#DCF3D8':'#fff'};border:1px solid #D5DDEE;border-radius:${eu?'16px 16px 4px 16px':'16px 16px 16px 4px'};padding:8px 12px;font-size:16px;line-height:1.4;white-space:pre-wrap">${eu?'':'<b style="color:var(--pri)">Claude</b><br>'}${esc(r.texto||'')}<div class="muted" style="font-size:12px;text-align:right;margin-top:4px">${quando(r.ts||0)}${eu?(resp.has(r.id)?' ✓✓':' ✓'):''}</div></div></div>`};
  const pend=ms.filter(r=>r.tipo==='pedido'&&!resp.has(r.id)).length;
  return `<div class="sec"><h2>💬 Conversa com o Claude${nov?` <span class="pill ok">${nov} nova${nov>1?'s':''}</span>`:''}</h2><div class="card col" style="gap:8px">
    <p class="muted" style="margin:0;font-size:14px">Peça mudanças, lições, reforços ou ajustes. Eu leio e respondo todo dia à noite. As mudanças entram no app sozinhas. Para algo urgente, fale comigo pelo app do Claude.</p>
    ${ms.length>6&&!chatTudo?'<button class="btn small ghost" data-act="chattudo" style="align-self:center">Ver conversa inteira</button>':''}
    <div class="col" style="gap:8px;background:#EEF3FB;border-radius:14px;padding:10px">${mostra.length?mostra.map(bolha).join(''):'<div class="muted" style="text-align:center;font-size:15px">Nenhuma mensagem ainda.</div>'}</div>
    ${pend?`<div class="muted" style="font-size:14px">⏳ ${pend} pedido${pend>1?'s':''} aguardando: respondo hoje à noite.</div>`:''}
    <textarea id="chat-txt" rows="3" maxlength="1500" placeholder="Escreva aqui. Ex.: ela está errando horas, faça um reforço com meia hora." style="border-radius:12px;border:2px solid #D5DDEE;padding:10px;font:inherit;font-size:16px;width:100%;resize:vertical"></textarea>
    <button class="btn small okb" data-act="chatenviar" style="align-self:flex-end">Enviar</button>
  </div></div>`;
}
/* ---- Memória CC: cadastro por foto ---- */
let CCD=null;
function ccSemanas(){const rows=LS.get('memoria',[]),m={};rows.forEach(r=>{const k=String(r.ciclo||'1');(m[k]=m[k]||new Set()).add(Number(r.semana))});return m}
function ccProxima(ciclo){const m=ccSemanas()[ciclo];return m&&m.size?Math.min(24,Math.max(...m)+1):1}
function ccSectionHTML(){
  const sem=ccSemanas(),ciclo=CCD?CCD.ciclo:(Object.keys(sem).sort().pop()||'1'),semana=CCD?CCD.semana:ccProxima(ciclo);
  const lista=Object.keys(sem).sort().map(c=>`Ciclo ${c}: semana${sem[c].size>1?'s':''} ${[...sem[c]].sort((a,b)=>a-b).join(', ')}`).join(' · ');
  const dm=ts=>new Date(ts).toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'2-digit'}),nomeK=k=>{const[c,s]=k.split('|');return `ciclo ${c}, semana ${s}`};
  const M=MEMINFO,atual=M.lib[M.lib.length-1];
  const fila=!M.ks.length?'':`<div class="note" style="margin:0">📅 Liberadas: <b>${M.lib.length} de ${M.ks.length}</b> semana${M.ks.length>1?'s':''}.
    ${atual?` Semana atual: ${nomeK(atual.k)}${atual.em?`, prazo até ${dm(atual.em+6*864e5)}`:''}${memConcluida(atual.k)?' ✅ concluída':''}.`:''}
    ${M.prox?(M.proxEm?` Próxima (${nomeK(M.prox)}) abre ${dm(M.proxEm)}.`:` Próxima (${nomeK(M.prox)}) abre na segunda-feira depois que ela concluir a semana atual.`)+` <button class="btn small ghost" data-act="ccforcar" style="min-height:36px;margin-left:6px">Liberar agora</button>`
      :' Não há semana guardada na fila: cadastre a próxima para ela abrir na segunda.'}</div>`;
  return `<div class="sec"><h2>🎵 Memória CC: semanas</h2><div class="card col">${fila}
    <p class="muted" style="margin:0;font-size:15px">Pode cadastrar várias semanas de uma vez: elas ficam guardadas e abrem uma por semana, sempre na segunda-feira.</p>
    <p class="muted" style="margin:0;font-size:15px">Fotografe a página da semana no livro Foundations. A IA lê, você confere e salva. As frases ficam só na sua planilha.</p>
    ${lista?`<div class="col" style="gap:6px"><span class="muted" style="font-size:15px">Semanas cadastradas (toque para ver ou corrigir):</span><div class="row" style="flex-wrap:wrap;gap:6px">${Object.keys(sem).sort().flatMap(c=>[...sem[c]].sort((x,y)=>x-y).map(s=>`<button class="btn small ghost" data-act="ccedit" data-arg="${c}|${s}">✏️ Ciclo ${c} · Semana ${s}</button>`)).join('')}</div></div>`:''}
    <div class="form">
      <label for="cc-ciclo">Ciclo<select id="cc-ciclo" class="sel">${['1','2','3'].map(c=>`<option ${c===ciclo?'selected':''}>${c}</option>`).join('')}</select></label>
      <label for="cc-semana">Semana<input id="cc-semana" type="number" min="1" max="24" value="${semana}"></label>
      <label for="cc-fotos">Fotos da página (até 4)<input id="cc-fotos" type="file" accept="image/*" capture="environment" multiple></label>
    </div>
    <div class="row"><button class="btn small" data-act="ccler">📷 Ler fotos com IA</button><button class="btn small ghost" data-act="ccmanual">Digitar à mão</button><span class="muted" style="font-size:14px" id="cc-status"></span></div>
    <div id="ccdraft">${ccDraftHTML()}</div>
    ${maosParentHTML()}
  </div></div>`;
}
/* ---- Mãos na massa da semana do CC (atividade prática, feita fora da tela) ----
   Registro na aba Diario: tipo 'pratica', id pratica-c<ciclo>-s<semana>, com titulo, passos, materiais e feita. */
let MMD=null;
const praticas=()=>store.diario().filter(r=>r.tipo==='pratica');
const praticaDe=k=>{const[c,s]=k.split('|');return praticas().find(r=>String(r.ciclo)===c&&Number(r.semana)===Number(s))};
/* Experimentos de ciências (CC_EXPER em conteudo.js): os da semana liberada mais recente que tiver algum */
const experAtuais=()=>{if(typeof CC_EXPER==='undefined')return[];const lib=MEMINFO.lib;for(let i=lib.length-1;i>=0;i--){const xs=CC_EXPER.filter(e=>e.cc===lib[i].k);if(xs.length)return xs}return[]};
const experFeito=id=>store.diario().find(r=>r.tipo==='experimento'&&r.ref===id);
const praticaAtual=()=>{const lib=MEMINFO.lib;for(let i=lib.length-1;i>=0;i--){const p=praticaDe(lib[i].k);if(p)return p}return null};
function maosParentHTML(){
  const ps=praticas().sort((a,b)=>String(a.ciclo).localeCompare(String(b.ciclo))||a.semana-b.semana);
  return `<hr style="border:0;border-top:2px dashed #D5DDEE;margin:6px 0">
  <b>🖐️ Mãos na massa da semana</b>
  <p class="muted" style="margin:0;font-size:15px">Fotografe a página da atividade prática (Belas Artes, Ciências…). A IA resume em passos simples, com as palavras dela. Aparece para sua filha junto com a semana do CC.</p>
  <label for="mm-fotos" class="muted" style="font-size:15px">Fotos da atividade (use o ciclo e a semana escolhidos acima)<input id="mm-fotos" type="file" accept="image/*" capture="environment" multiple></label>
  <div class="row"><button class="btn small" data-act="mmler">📷 Resumir com IA</button><button class="btn small ghost" data-act="mmmanual">Escrever à mão</button><span class="muted" style="font-size:14px" id="mm-status"></span></div>
  <div id="mmdraft">${mmDraftHTML()}</div>
  ${(()=>{const EX=typeof CC_EXPER!=='undefined'?CC_EXPER:[],hora=new Date().getHours()*60+new Date().getMinutes(),quando=hora<21*60+13?'hoje às 21h13':'amanhã às 21h13';
    /* nomes que o Pedro escreveu e que ainda não viraram experimento (a rotina da noite cria) */
    const pend=praticas().filter(p=>(p.ciencias||[]).length&&!EX.some(e=>e.cc===`${p.ciclo}|${p.semana}`)).flatMap(p=>p.ciencias.map(n=>({n,c:p.ciclo,s:p.semana})));
    if(!EX.length&&!pend.length)return '';
    /* em ordem de ciclo e semana: prontos e pendentes juntos */
    const ord=k=>{const[c,s]=String(k).split('|');return Number(c)*100+Number(s)};
    const itens=[...EX.map(e=>({k:e.cc,e})),...pend.map(x=>({k:`${x.c}|${x.s}`,x}))].sort((a,b)=>ord(a.k)-ord(b.k));
    return `<b>🧪 Experimentos de ciências</b><div class="col" style="gap:6px">${itens.map(({e,x})=>x?`<div class="row" style="gap:8px;flex-wrap:wrap"><span class="pill mid">C${esc(x.c)} · S${x.s}</span><span style="flex:1">${esc(x.n)}</span><span class="pill">⏳ fica pronto ${quando}</span></div>`:(e=>{const[c,s]=e.cc.split('|'),f=experFeito(e.id);return `<div class="row" style="gap:8px;flex-wrap:wrap"><span class="pill ${f?'ok':'mid'}">C${c} · S${s}</span><span style="flex:1">${esc(e.titulo)}</span>${f?'<span class="pill ok">✅ Feito</span>':`<button class="btn small okb" data-act="experok" data-arg="${e.id}">Marcar como feito</button>`}</div>`})(e)).join('')}</div>`})()}
  ${ps.length?`<div class="col" style="gap:6px">${ps.map(p=>`<div class="row" style="gap:8px;flex-wrap:wrap"><span class="pill ${p.feita?'ok':'mid'}">C${esc(p.ciclo)} · S${p.semana}</span><span style="flex:1">${esc(p.titulo)}</span><button class="btn small ghost" data-act="mmedit" data-arg="${esc(p.id)}">✏️ Editar</button>${p.feita?'<span class="pill ok">✅ Feita</span>':`<button class="btn small okb" data-act="mmfeita" data-arg="${esc(p.id)}">Marcar como feita</button>`}</div>`).join('')}</div>`:''}`;
}
function mmDraftHTML(){if(!MMD)return '';
  return `<div class="form"><label for="mm-tit">Título<input id="mm-tit" maxlength="80" value="${esc(MMD.titulo||'')}"></label>
   <label for="mm-pas">Passos (um por linha)<textarea id="mm-pas" rows="5">${esc((MMD.passos||[]).join('\n'))}</textarea></label>
   <label for="mm-mat">Materiais (um por linha)<textarea id="mm-mat" rows="3">${esc((MMD.materiais||[]).join('\n'))}</textarea></label>
   <label for="mm-cie">Experimentos de ciências citados na página (só os nomes, um por linha). Eu crio um experimento parecido à noite.<textarea id="mm-cie" rows="2">${esc((MMD.ciencias||[]).join('\n'))}</textarea></label></div>
   <div class="row"><button class="btn small okb" data-act="mmsalvar">Salvar atividade da semana ${MMD.semana}</button><button class="btn small ghost" data-act="mmcancel">Cancelar</button></div>`}
function mmRedraw(){const d=document.getElementById('mmdraft');if(d)d.innerHTML=mmDraftHTML()}
async function mmLer(btn){
  const st=document.getElementById('mm-status'),files=[...(document.getElementById('mm-fotos').files||[])].slice(0,4),{ciclo,semana}=ccLerCampos();
  if(!files.length){toast('Escolha ou tire pelo menos uma foto.');return}
  if(!aiOn()){toast('A IA não está ativa. Confira a conexão com a planilha e a chave do Gemini.');return}
  btn.disabled=true;st.textContent='Preparando as fotos…';
  try{const imagens=await Promise.all(files.map(lerImagem));st.textContent='A IA está lendo a atividade…';
    const r=await api('lerFotoCC',{ciclo,semana,imagens,tipo:'pratica'});
    if(!r||!r.pratica){st.textContent=r&&r.motivo==='acao_desconhecida'?'Atualize o servidor (Codigo.gs) para usar esta função.':'Não consegui resumir a atividade. Tente outra foto ou escreva à mão.'+(r&&r.motivo?` (motivo: ${r.motivo})`:'');return}
    MMD={ciclo,semana,...r.pratica};st.textContent='Confira e salve.';mmRedraw()}
  catch(e){st.textContent='Erro: '+(e.message||e)}finally{btn.disabled=false}
}
function ccDraftHTML(){
  if(!CCD)return '';
  return `<div class="col" style="gap:10px"><b>${CCD.editando?'Corrigindo':'Confira'} as frases da semana ${CCD.semana} (ciclo ${CCD.ciclo}):</b>${CCD.editando?'<span class="muted" style="font-size:14px">Ao salvar, esta semana é substituída pelo que estiver aqui. O progresso dela não se perde.</span>':''}
    ${CCD.itens.map((x,i)=>`<div class="ccrow"><input class="cc-m" aria-label="Matéria" value="${esc(x.materia)}" maxlength="40"><textarea class="cc-t" aria-label="Frase" rows="2">${esc(x.texto)}</textarea><button class="btn small ghost" data-act="ccdel" data-arg="${i}" aria-label="Remover">✕</button></div>`).join('')}
    <div class="row"><button class="btn small ghost" data-act="ccadd">+ Linha</button><button class="btn small okb" data-act="ccsalvar">Salvar semana</button><button class="btn small ghost" data-act="cccancel">Cancelar</button></div></div>`;
}
function ccSync(){if(!CCD)return;const ms=[...document.querySelectorAll('.cc-m')],ts=[...document.querySelectorAll('.cc-t')];CCD.itens=ms.map((m,i)=>({materia:m.value.trim(),texto:(ts[i]||{}).value||''}))}
function ccRedraw(){const d=document.getElementById('ccdraft');if(d)d.innerHTML=ccDraftHTML()}
function ccLerCampos(){const c=document.getElementById('cc-ciclo').value,sm=Math.max(1,Math.min(24,parseInt(document.getElementById('cc-semana').value,10)||1));return {ciclo:c,semana:sm}}
function lerImagem(file){return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>{const img=new Image();img.onload=()=>{const mx=1600,sc=Math.min(1,mx/Math.max(img.width,img.height)),c=document.createElement('canvas');
  c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);c.getContext('2d').drawImage(img,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.82).split(',')[1])};img.onerror=rej;img.src=fr.result};fr.onerror=rej;fr.readAsDataURL(file)})}
async function ccLer(btn){
  const st=document.getElementById('cc-status'),files=[...(document.getElementById('cc-fotos').files||[])].slice(0,4),{ciclo,semana}=ccLerCampos();
  if(!files.length){toast('Escolha ou tire pelo menos uma foto.');return}
  if(!aiOn()){toast('A IA não está ativa. Confira a conexão com a planilha e a chave do Gemini.');return}
  btn.disabled=true;st.textContent='Preparando as fotos…';
  try{const imagens=await Promise.all(files.map(lerImagem));st.textContent='A IA está lendo a página…';
    const r=await api('lerFotoCC',{ciclo,semana,imagens});
    if(r.itens)r.itens=r.itens.map(x=>({...x,materia:ccMateria(x.materia)}));
    if(!r.itens||!r.itens.length){const m=r.motivo||'';
      st.textContent=/RECITATION|COPYRIGHT/i.test(m)?'O Gemini não quis transcrever o texto do livro (proteção de direitos autorais). Use "Digitar à mão" para esta semana.'
        :/SAFETY|BLOCK|PROHIBITED/i.test(m)?'O Gemini bloqueou a leitura desta foto. Use "Digitar à mão" para esta semana.'
        :/MAX_TOKENS/i.test(m)?'A resposta da IA ficou grande demais. Tente com uma foto só da página da semana.'
        :'Não encontrei frases de memorização. Tente uma foto mais nítida, reta e só da página da semana.'+(m?` (motivo: ${m})`:'');return}
    CCD={ciclo,semana,itens:r.itens};st.textContent='Pronto! Confira abaixo e salve.';ccRedraw();
  }catch(e){st.textContent='Não deu certo: '+(e&&e.code==='limite_ia'?'limite diário de IA atingido':e&&e.code==='sem_conexao'?'sem conexão com a planilha':(e&&e.code)||'erro de conexão')}
  finally{btn.disabled=false}
}
async function ccSalvar(btn){
  ccSync();const itens=CCD.itens.filter(x=>x.texto.trim()).map(x=>({materia:x.materia||'Memória',texto:x.texto.trim()}));
  if(!itens.length){toast('Não há frases para salvar.');return}
  btn.disabled=true;
  try{await api('salvarMemoria',{ciclo:CCD.ciclo,semana:CCD.semana,itens});
    const rows=LS.get('memoria',[]).filter(r=>!(String(r.ciclo)===CCD.ciclo&&Number(r.semana)===CCD.semana));
    itens.forEach(x=>rows.push({ciclo:CCD.ciclo,semana:CCD.semana,materia:x.materia,texto:x.texto}));
    LS.set('memoria',rows);applyMemoria(rows);
    toast(MEMINFO.lib.some(x=>x.k===memChave(CCD))?`Semana ${CCD.semana} salva! A Memória CC vai acender na tela dela.`:`Semana ${CCD.semana} guardada. Ela abre sozinha quando chegar a vez dela.`);CCD=null;renderParent();
  }catch(e){btn.disabled=false;toast('Não consegui salvar: '+((e&&e.code)||'sem internet')+'. Tente de novo.')}
}
/* ---- Roteiro do dia ---- */
const dayNum=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/864e5);
/* Matemática ou Português: alterna pelos DIAS EM QUE ELA ESTUDOU, não pelo calendário.
   Olha o último dia antes de hoje em que ela fez lição de Matemática ou de Português e escolhe a outra.
   Assim, se ela pular o domingo, a segunda não repete a matéria de sábado. Sem histórico, usa o calendário. */
/* ROTEIRO DE SEGUNDA A SEXTA, COM PENDÊNCIAS ACUMULADAS
   - Dias úteis: aquecimento + matéria principal (Mat/Port alternando por dia útil) + 2 matérias do dia.
   - Sábado e domingo: sem roteiro novo; o tempo livre abre se não houver pendência.
   - O que ficou sem fazer num dia útil vira pendência (até 7 dias para trás, a partir de config pendZero) e se soma ao dia seguinte,
     sem tirar nada do roteiro novo. Uma lição concluída da matéria resolve primeiro a pendência mais antiga dela.
   - O tempo livre só abre com o roteiro de hoje feito e nenhuma pendência. */
const ehUtil=d=>{const g=d.getDay();return g>=1&&g<=5};
const dataDe=s=>{const[y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d)};
function mainFor(ds){const dias=Math.round((dataDe(ds)-new Date(1970,0,5))/864e5),w=Math.floor(dias/7)*5+Math.min(((dias%7)+7)%7,5);return w%2===0?'mat':'por'}
function mainSubj(){const st=LS.get('rot:'+today(),null);return SUBJECTS.find(x=>x.id===((st&&st.main)||mainFor(today())))}
const PEND_INICIO='2026-11-19';   // as pendências começam a contar a partir deste dia
function itensDoDia(d){const st=LS.get('rot:'+d,null),it=[{d,id:(st&&st.main)||mainFor(d)}];((st&&st.ops)||[]).forEach(id=>it.push({d,id}));return it}
function resolverItens(itens){
  const nomeId={};SUBJECTS.forEach(s=>nomeId[s.nome]=s.id);
  const ss=(S.sessions||[]).filter(z=>z&&z.phaseReached==='done'&&z.lessonId!=='aquecimento'&&nomeId[z.subject]).sort((x,y)=>(x.start||0)-(y.start||0));
  itens.sort((x,y)=>x.d<y.d?-1:x.d>y.d?1:0).forEach(x=>x.ok=false);
  for(const z of ss){const it=itens.find(x=>!x.ok&&x.id===nomeId[z.subject]&&x.d<=z.date);if(it)it.ok=true}
  return itens}
function diasPendentes(){const zero=[PEND_INICIO,LS.get('pendZero','')].sort().pop(),out=[];
  for(let i=7;i>=1;i--){const dt=new Date();dt.setDate(dt.getDate()-i);const d=today(dt);if(ehUtil(dt)&&d>=zero)out.push(d)}return out}
const doneToday=f=>S.sessions.some(x=>x.date===today()&&x.phaseReached==='done'&&f(x));
/* conta só lição concluída: abrir e sair no meio não tira a matéria da fila */
const lastStudied=n=>Math.max(0,...S.sessions.filter(z=>z.subject===n&&z.phaseReached==='done').map(z=>z.start));
function rotOpcoes(excluir){
  const memOk=(S.config.memDias||[1,3,5]).includes(new Date().getDay())||memNovas().length>0;
  let pool=SUBJECTS.filter(x=>x.ready&&['cie','his','geo','fin','log','ing','mem'].includes(x.id)&&(x.id!=='mem'||memOk)).sort((a,b)=>lastStudied(a.nome)-lastStudied(b.nome));
  /* as matérias que já estão pendentes não se repetem hoje, para variar (se sobrarem matérias) */
  const semPend=pool.filter(x=>!(excluir||[]).includes(x.id));if(semPend.length>=2)pool=semPend;
  let ops=pool.slice(0,2).map(x=>x.id);
  if(memNovas().length&&pool.some(x=>x.id==='mem')&&!ops.includes('mem'))ops=[ops[0],'mem'];
  return ops;
}
function roteiro(){
  const dPend=diasPendentes(),passado=resolverItens(dPend.flatMap(itensDoDia)),pendIds=[...new Set(passado.filter(x=>!x.ok).map(x=>x.id))];
  if(!ehUtil(new Date())){const pend=passado.filter(x=>!x.ok).map(x=>({...x,s:SUBJECTS.find(y=>y.id===x.id)})).filter(x=>x.s);
    return {fds:true,pend,done:true,livre:!pend.length,total:0,feitos:0}}
  const key='rot:'+today();let st=LS.get(key,null);
  if(!st||!st.ops||!st.ops.length){st={ops:rotOpcoes(pendIds)};LS.set(key,st)}
  if(!st.main){st.main=mainFor(today());LS.set(key,st)}   // a matéria principal do dia fica fixa até a meia-noite
  const main=SUBJECTS.find(x=>x.id===st.main),ops=st.ops.map(id=>SUBJECTS.find(x=>x.id===id)).filter(x=>x&&x.ready);
  const todos=resolverItens([...dPend.flatMap(itensDoDia),{d:today(),id:main.id,hoje:'main'},...ops.map((o,k)=>({d:today(),id:o.id,hoje:k}))]);
  const pend=todos.filter(x=>!x.hoje&&x.hoje!==0&&!x.ok).map(x=>({...x,s:SUBJECTS.find(y=>y.id===x.id)})).filter(x=>x.s);
  const w=warmupKeys().length>0,s1=!w||warmupDone(),s2=todos.find(x=>x.hoje==='main').ok,opsFeitas=ops.map((o,k)=>todos.find(x=>x.hoje===k).ok),s3=opsFeitas.every(Boolean);
  /* as 2 matérias do dia são obrigatórias, na ordem que ela quiser */
  const done=s1&&s2&&s3;
  return {main,ops,opsFeitas,w,s1,s2,s3,done,pend,livre:done&&!pend.length,total:(w?1:0)+1+ops.length,feitos:(w&&s1?1:0)+(s2?1:0)+opsFeitas.filter(Boolean).length};
}
function nextLessonOf(subj){
  const L=subj.lessons||[];
  if(subj.id==='mem'){const nv=memNovas()[0];if(nv)return {l:nv,i:L.indexOf(nv)}}
  for(let i=0;i<L.length;i++){if(!(((S.progress[L[i].id]||{}).stars||0)>=1))return {l:L[i],i}}
  let bi=0;L.forEach((l,i)=>{if(((S.progress[l.id]||{}).stars||0)<((S.progress[L[bi].id]||{}).stars||0))bi=i});return {l:L[bi],i:bi,rev:true};
}
function startSubjNext(id){const sb=SUBJECTS.find(x=>x.id===id);if(!sb||!sb.ready||!(sb.lessons||[]).length)return;S.subject=id;const n=nextLessonOf(sb);startLessonObj(n.l,n.i,sb.nome)}
function roteiroHTML(r){
  const passo=(act,arg,ic,tit,sub,feito,ativo)=>`<button class="passo ${feito?'feito':''} ${ativo&&!feito?'ativo':''}" data-act="${act}" ${arg?`data-arg="${arg}"`:''} ${feito||!ativo?'disabled':''}><span class="ic">${ic}</span><span class="col" style="gap:2px;flex:1"><b>${tit}</b><small>${sub}</small></span><span class="st">${feito?'✅':ativo?'▶️':'🔒'}</span></button>`;
  const DS=['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
  const pendHTML=()=>!r.pend.length?'':`<div class="col" style="gap:8px;margin-top:4px"><b>📌 Ficou de outros dias (${r.pend.length})</b>${r.pend.map(x=>{const nx=nextLessonOf(x.s);return passo('rotpend',x.id,x.s.ic,`${esc(x.s.nome)} <small class="muted">· de ${DS[dataDe(x.d).getDay()]}</small>`,nx&&nx.l?(nx.rev?'Revisão: ':'')+esc(nx.l.titulo):'',false,true)}).join('')}</div>`;
  if(r.fds){
    let h=`<div class="card col roteiro"><div class="row"><h2 style="font-size:26px">🌞 Fim de semana!</h2></div>`;
    h+=r.pend.length?`<p style="margin:0">Hoje não tem roteiro novo. Termine o que ficou da semana e o tempo livre abre. 💪</p>${pendHTML()}`:`<div class="note" style="background:var(--ok-soft);color:#11603B;text-align:center;font-size:18px">🎉 Sem tarefas hoje: aproveite o tempo livre! Se quiser, pode estudar qualquer matéria.</div>`;
    return h+'</div>'}
  const nx=nextLessonOf(r.main);
  let h=`<div class="card col roteiro"><div class="row"><h2 style="font-size:26px">🗺️ Roteiro de hoje</h2><span class="spacer"></span><span class="pill ${r.done?'ok':'mid'}">${r.feitos} de ${r.total}</span>${r.pend.length?`<span class="pill">📌 +${r.pend.length}</span>`:''}</div>`;
  if(r.w)h+=passo('rot1','','🔥','Aquecimento',`${tam().aquec} questões de revisão`,r.s1,true);
  h+=passo('rot2','',r.main.ic,r.main.nome,(nx.rev?'Revisão: ':'')+esc(nx.l.titulo),r.s2,r.s1);
  r.ops.forEach((o,k)=>{const nxo=nextLessonOf(o);
    h+=passo('rot3',o.id,o.ic,`Matéria do dia ${k+1}: ${esc(o.nome)}${o.id==='mem'&&memNovas().length?' ✨':''}`,r.opsFeitas[k]?'Feita!':(nxo&&nxo.l?(nxo.rev?'Revisão: ':'')+esc(nxo.l.titulo):''),r.opsFeitas[k],r.s1&&r.s2)});
  h+=pendHTML();
  if(r.livre)h+=`<div class="note" style="background:var(--ok-soft);color:#11603B;text-align:center;font-size:18px">🎉 Roteiro completo! Agora é tempo livre: escolha o que quiser.</div>`;
  else if(r.done)h+=`<p class="muted" style="margin:0;font-size:15px;text-align:center">Roteiro de hoje feito! Termine o que ficou de outros dias para liberar o tempo livre.</p>`;
  else if(S.config.livreDepois!==false)h+=`<p class="muted" style="margin:0;font-size:14px;text-align:center">Termine o roteiro para liberar o tempo livre.</p>`;
  return h+'</div>';
}
function renderMap(){
  S.view='map';
  if(novaVersao)setTimeout(atualizarSePuder,300);
  const rotOn=S.config.roteiro!==false,rot=rotOn?roteiro():null,livre=!rotOn||rot.livre||S.config.livreDepois===false;
  if(rot&&!rot.fds&&rot.livre&&!LS.get('rotCel:'+today(),false)){LS.set('rotCel:'+today(),true);setTimeout(()=>{confetti();speak('Roteiro completo! Agora é tempo livre.')},300)}
  const goalMs=S.config.goal*60000,tm=todayMs(),pct=Math.min(100,Math.round(tm/goalMs*100));
  const name=S.config.childName?`, ${esc(S.config.childName)}`:'';
  app.innerHTML=`
  <div class="top"><h1 class="hello">Olá${name}! 👋</h1><div class="spacer"></div>
    <div class="goal card" style="padding:12px 16px"><div class="row" style="justify-content:space-between"><span>Meta de hoje</span><span>${mins(tm)} de ${S.config.goal} min</span></div><div class="bar"><i style="width:${pct}%"></i></div></div></div>
  ${!API.url?'<div class="note" style="margin-bottom:12px">Os dados estão salvos só neste aparelho até a planilha ser conectada na área dos pais.</div>':''}
  ${rotOn?roteiroHTML(rot):''}
  ${ccAvisoHTML()}
  ${(()=>{const wk=warmupKeys().length,m=missaoAtual(),f=missaoFeita(),lv=livrosLidos();return `<div class="cards2">
    ${wk&&!rotOn?`<button class="mini" data-act="warmup"><span class="ic">🔥</span><span><b>Aquecimento do dia</b><small>${warmupDone()?'✅ Feito hoje! Pode fazer de novo.':'5 questões rápidas de revisão'}</small></span></button>`:''}
    <div class="mini"><span class="ic">${m.icone}</span><span><b>Missão da semana ${f?'✅':''}</b><small>${esc(m.texto)}</small></span><button class="speak" data-act="saymissao" aria-label="Ouvir a missão">🔊</button></div>
    ${experAtuais().map(e=>`<div class="mini" style="align-items:flex-start"><span class="ic">🧪</span><span><b>Experimento: ${esc(e.titulo)} ${experFeito(e.id)?'✅':((ccSemanaNova()||{}).k===e.cc?'<span class="badge-novo" style="position:static">NOVO</span>':'')}</b><small><i>${esc(e.pergunta)}</i></small>${e.passos.map((x,i)=>`<small>${i+1}. ${esc(x)}</small>`).join('')}<small>🧺 ${esc(e.materiais.join(', '))}</small><details><summary style="font-weight:800;color:var(--pri);cursor:pointer">Por que acontece?</summary><small>${esc(e.explica)}</small></details></span><button class="speak" data-act="sayexper" data-arg="${e.id}" aria-label="Ouvir o experimento">🔊</button></div>`).join('')}
    ${(()=>{const p=praticaAtual();if(!p)return '';return `<div class="mini" style="align-items:flex-start"><span class="ic">🖐️</span><span><b>Mãos na massa ${p.feita?'✅':((ccSemanaNova()||{}).k===`${p.ciclo}|${p.semana}`?'<span class="badge-novo" style="position:static">NOVO</span>':'')}</b><small><b>${esc(p.titulo)}</b></small>${p.passos.map((x,i)=>`<small>${i+1}. ${esc(x)}</small>`).join('')}${p.materiais&&p.materiais.length?`<small>🧺 ${esc(p.materiais.join(', '))}</small>`:''}</span><button class="speak" data-act="saymaos" aria-label="Ouvir a atividade">🔊</button></div>`})()}
    ${(()=>{const c=potesCfg();if(!c.ativo)return '';const sd=saldos(),mi=metaInfo();return `<button class="mini" data-act="subj" data-arg="fin"><span class="ic">🐷</span><span><b>Meus potes</b><small>🛍️ ${brl(sd.gastar)} · 🐷 ${brl(sd.guardar)} · 📈 ${brl(sd.investir)}</small>${mi?`<small>🎯 ${esc(c.metaNome)}: ${mi.pct}%</small><span class="bar" style="height:8px"><i style="width:${mi.pct}%"></i></span>`:''}</span></button>`})()}
    <button class="mini" data-act="estante"><span class="ic">📚</span><span><b>Minha estante</b><small>${lv.length} livro${lv.length===1?'':'s'} lido${lv.length===1?'':'s'}${lv.length?' · último: '+esc(leituras()[0].livro):''}</small></span></button></div>`})()}
  ${livre&&typeof jogosHTML==='function'?jogosHTML():''}
  ${livre?`<div class="subjects">${SUBJECTS.map(s=>`<button class="subj ${s.ready?(s.id===S.subject?'on':''):'soon'} ${s.id==='mem'&&memNovas().length?'novo':''}" data-act="subj" data-arg="${s.id}">${s.id==='mem'&&memNovas().length?'<span class="badge-novo">NOVO!</span>':''}<span class="ic">${s.ic}</span><span>${s.nome}</span><small>${s.ano}</small></button>`).join('')}</div>
  <h2 style="font-size:26px;margin-bottom:12px">Trilha de ${curSubj().nome}</h2>
  ${S.subject==='fin'?potesHTML():''}
  <div class="path">${curLessons().map((l,i)=>{const p=S.progress[l.id]||{},ok=unlocked(i);
    return `<button class="node ${p.stars?'done':''} ${ok?'':'locked'} ${l.subject==='Memória'&&l.id!=='mem-mestre'&&!p.tries?'novo':''}" data-act="${ok?'open':'locked'}" data-arg="${i}">
      <span class="badge">${ok?l.icone:'🔒'}</span><span class="col" style="gap:4px"><h3>${esc(l.titulo)}</h3>${starHTML(p.stars||0)}</span></button>`}).join('')}</div>`:''}
  <div class="parentlink"><button data-act="parent">Área dos pais</button></div>`;
}
function startLesson(i){startLessonObj(curLessons()[i],i,curSubj().nome)}
function startLessonObj(l,i,subj,direto){
  R={idx:i,lesson:l,subjName:subj,phase:'learn',slide:0,items:[],qi:0,q:null,tries:0,qStart:0,quizOk:0,aiUsed:0,results:[]};
  R.base=l;if(!direto)R.lesson={...l,slides:[...(l.slides||[]),...exemplos(l)]};
  S.session={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),date:today(),start:Date.now(),end:Date.now(),activeMs:0,
    lessonId:l.id,lessonTitle:l.titulo,subject:subj,phaseReached:'learn',answers:[],quizScore:null,quizTotal:l.quiz.length,stars:null};
  flushSession(); if(direto){R.quizOk=0;beginPhase('quiz')}else renderLearn();
}
function lessonTop(stepsHTML){return `<div class="lesson-top"><button class="btn ghost small" data-act="home" aria-label="Voltar para a trilha">✕</button><div class="steps">${stepsHTML}</div><span class="timer" id="timer">⏱ ${mins(todayMs())} min hoje</span></div>`}
/* EXEMPLO RESOLVIDO: antes de praticar, a lição mostra 1 ou 2 questões já respondidas, com a explicação. */
function respostaDe(q){if(q.options&&q.options.length){const o=q.options.find(o=>o.ok);return o?o.label:null}return q.answer!=null?String(q.answer):null}
function exemplos(l){
  const keys=[...new Set(l.practice||[])].filter(k=>GEN[k]),out=[];R.usados=R.usados||new Set();calcNiveis();
  for(const k of shuffle(keys)){if(out.length>=tam().ex)break;
    try{const q=GEN[k]();if(q.kind||!respostaDe(q)||!q.explain)continue;R.usados.add(qid(q));out.push({ex:q,t:(q.speak||q.text)+' A resposta é '+(q.respFala||respostaDe(q))+'. '+(q.explainFala||q.explain)})}catch(e){}}
  return out;
}
function exemploHTML(q){const r=respostaDe(q);
  return `<div class="col" style="gap:10px;align-items:center;width:100%"><span class="pill ok">👀 Vamos fazer juntos</span><p class="qtext" style="margin:0">${esc(q.text)}</p>${q.visual?`<div class="visual">${q.visual}</div>`:''}
   ${q.options&&q.options.length?`<div class="opts ${q.optClass||''}">${q.options.map(o=>`<div class="opt" style="${o.ok?'background:var(--ok-soft);border-color:var(--ok);color:#11603B':'opacity:.45'}">${o.ok?'✅ ':''}${esc(o.label)}</div>`).join('')}</div>`:`<div class="numdisp" style="color:#11603B;background:var(--ok-soft)">${esc(r)}</div>`}
   <div style="max-width:640px;background:var(--ok-soft);color:#11603B;border-radius:16px;padding:12px 16px;font-size:20px;font-weight:700;text-align:left">💡 ${esc(q.explain)}</div></div>`}
function renderLearn(){
  const s=R.lesson.slides[R.slide],n=R.lesson.slides.length;
  if(s.ex){app.innerHTML=lessonTop(R.lesson.slides.map((_,i)=>`<i class="${i<=R.slide?'on':''}"></i>`).join(''))+`<div class="qcard">${exemploHTML(s.ex)}
   <div class="row" style="justify-content:center"><button class="speak" data-act="say" aria-label="Ouvir">🔊</button>${R.slide>0?'<button class="btn ghost" data-act="prevslide">Voltar</button>':''}<button class="btn" data-act="nextslide">${R.slide<n-1?'Próximo':'Agora é sua vez!'}</button></div></div>`;
    if(S.config.autoRead)speak(s.fala||s.t);return}
  app.innerHTML=lessonTop(R.lesson.slides.map((_,i)=>`<i class="${i<=R.slide?'on':''}"></i>`).join(''))+`
  <div class="qcard"><div class="row" style="justify-content:center"><span class="pill mid">Aprender · ${esc(R.lesson.titulo)}</span></div>
   <div class="visual">${s.v}</div>
   <div class="row" style="justify-content:center;flex-wrap:nowrap;max-width:640px"><button class="speak" data-act="say" aria-label="Ouvir">🔊</button><p class="qtext" style="font-size:26px;margin:0;text-align:left">${esc(s.t)}</p></div>
   <div class="row" style="justify-content:center">${R.slide>0?'<button class="btn ghost" data-act="prevslide">Voltar</button>':''}<button class="btn" data-act="nextslide">${R.slide<n-1?'Próximo':'Vamos praticar!'}</button></div></div>`;
  if(S.config.autoRead)speak(s.fala||s.t);
}
function beginPhase(phase){
  R.phase=phase;R.qi=0;R.results=[];
  calcNiveis();const alvo=(R.lesson.id==='aquecimento'||R.lesson.treino)?R.lesson[phase].length:tam()[phase];R.items=gerarItens(esticar(R.lesson[phase],alvo),R.usados=R.usados||new Set());
  S.session.phaseReached=phase;queueSave();renderQ();
}
/* ---- Variedade: nada repetido na lição e o mínimo de repetição entre os dias ---- */
const qid=q=>q.skill+'|'+(q.desc||q.text);
/* TAMANHO DAS LIÇÕES (Configurações): a lição usa as chaves dela e repete, embaralhadas, até chegar no tamanho escolhido. */
const TAMANHOS={curta:{practice:6,quiz:5,aquec:5,ex:1},media:{practice:9,quiz:7,aquec:8,ex:2},longa:{practice:12,quiz:9,aquec:10,ex:2}};
const tam=()=>TAMANHOS[S.config.tamanho]||TAMANHOS.media;
function esticar(keys,n){keys=(keys||[]).filter(k=>GEN[k]);if(!keys.length||keys.length>=n)return keys.slice();const out=keys.slice();while(out.length<n)out.push(...shuffle(keys.slice()));return out.slice(0,n)}
function gerarItens(keys,usados){
  const vistos=LS.get('vistos',{}),lim=Date.now()-5*864e5,out=[];
  for(const k of keys){
    let melhor=null;
    for(let t=0;t<30;t++){const q=GEN[k]();const id=qid(q);if(usados.has(id))continue;if(!melhor)melhor=q;if(!(vistos[id]>lim)){melhor=q;break}}
    if(!melhor)melhor=GEN[k]();
    usados.add(qid(melhor));out.push(melhor);
  }
  return out;
}
let vistosCache=null,vistosT=null;
function marcarVista(q){
  if(!vistosCache)vistosCache=LS.get('vistos',{});
  vistosCache[qid(q)]=Date.now();
  clearTimeout(vistosT);vistosT=setTimeout(()=>{const lim=Date.now()-14*864e5,m={};let n=0;
    Object.entries(vistosCache).sort((a,b)=>b[1]-a[1]).forEach(([k,t])=>{if(t>lim&&n<4000){m[k]=t;n++}});vistosCache=m;LS.set('vistos',m)},1500);
}
/* ---- Níveis: sobe com 7 acertos em 8 respostas; desce com 3 ou menos em 6 (só primeira tentativa) ---- */
const HAB_NIVEL=['Antes e depois','Reta numérica','Contar pulando','Somar dezenas e unidades','Subtrair dezenas e unidades','Ler números com blocos','Problemas de somar','Problemas de subtrair','Problemas de comparar','Problemas: quanto falta','Grupos iguais','Dobro e metade','Horas no relógio','Medir com régua'];
function calcNiveis(){
  const ans=S.sessions.flatMap(x=>(x.answers||[])).filter(a=>HAB_NIVEL.includes(a.skill)&&(a.attempt||1)===1).sort((a,b)=>a.ts-b.ts);
  const est={};HAB_NIVEL.forEach(h=>est[h]={n:1,j:[]});
  ans.forEach(a=>{const e=est[a.skill];e.j.push(!!a.ok);const u8=e.j.slice(-8),u6=e.j.slice(-6);
    if(u8.length>=8&&u8.filter(Boolean).length>=7&&e.n<3){e.n++;e.j=[]}
    else if(u6.length>=6&&u6.filter(Boolean).length<=3&&e.n>1){e.n--;e.j=[]}});
  HAB_NIVEL.forEach(h=>NIVEL[h]=est[h].n);
}
function renderQ(){
  const q=R.q=R.items[R.qi];R.tries=0;R.qStart=Date.now();marcarVista(q);
  const steps=R.items.map((_,i)=>`<i class="${i<R.results.length?(R.results[i]?'okd':'bad'):(i===R.qi?'on':'')}"></i>`).join('');
  const label=R.lesson.id==='aquecimento'?'Aquecimento':R.phase==='practice'?'Praticar':'Desafio';
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
  }else if(q.num){
    R.numVal='';
    body=`<div class="numdisp" id="nd">?</div><div class="keys numkeys">${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-act="nk" data-arg="${n}">${n}</button>`).join('')}<button data-act="nk" data-arg="del" aria-label="Apagar">⌫</button><button data-act="nk" data-arg="0">0</button><button data-act="nk" data-arg="ok" class="nkok" aria-label="Confirmar">✓</button></div>`;
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
  document.getElementById('sa').innerHTML=sy.picked.length?`<span class="big" style="font-size:${q.small?26:52}px;letter-spacing:${q.small?0:2}px;line-height:1.3">${sy.picked.map(i=>q.parts[i]).join('')}</span>`:'<span class="muted">Toque nas sílabas abaixo</span>';
  document.getElementById('stiles').innerHTML=sy.order.map(i=>`<button class="btn" style="font-size:${q.small?20:30}px;min-width:96px;background:var(--sun);box-shadow:0 4px 0 #C27C00" data-act="sylPick" data-arg="${i}" ${sy.picked.includes(i)?'disabled':''}>${q.parts[i]}</button>`).join('');
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
    showFb('good',`<b style="font-size:24px">✅ ${p}</b>${nextBtn()}`);speak(R.q.acerto?p+' '+R.q.acerto:p);
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
  speak(R.q.explainFala||R.q.explain);
}
function drawNum(){const e=document.getElementById('nd');if(e)e.textContent=R.numVal||'?'}
function lockBuild(){document.querySelectorAll('[data-act=addT],[data-act=addU],[data-act=undoB],[data-act=checkB],[data-act=sylPick],[data-act=sylDel],[data-act=sylCheck],[data-act=nk]').forEach(b=>b.disabled=true)}
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
  const total=R.items.length,ok=R.quizOk,stars=ok>=total?3:ok>=total-1?2:ok>=Math.ceil(total*0.6)?1:0;
  if(R.lesson.id!=='aquecimento'&&!R.lesson.treino){const p=S.progress[R.lesson.id]||{stars:0,best:0,tries:0};
    p.tries=(p.tries||0)+1;p.last=ok;p.best=Math.max(p.best||0,ok);p.stars=Math.max(p.stars||0,stars);p.lastAt=Date.now();if(p.stars>=1&&!p.passouEm)p.passouEm=Date.now();
    S.progress[R.lesson.id]=p;saveProgress();}
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
    if(pinBuf===String(S.config.pin))setTimeout(()=>{renderParent();sincronizar(true);setTimeout(()=>LS.set('chatLido',Date.now()),4000)},150);
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
  calcNiveis();
  const st=stats(),tm=todayMs(),studied=tm>=60000,goal=S.config.goal;
  const lts=leituras(),lim7=Date.now()-7*864e5,lt7=lts.filter(r=>r.ts>=lim7),diasLeit=new Set(lt7.map(r=>r.data)).size,leitDia=new Set(lts.map(r=>r.data)),mis=missaoAtual(),misF=missaoFeita(),pt=potes()||{};
  const maxMs=Math.max(goal*60000,...st.days.map(d=>d.ms));
  app.innerHTML=`
  <div class="top"><h1 style="font-size:32px">Acompanhamento${S.config.childName?' · '+esc(S.config.childName):''}</h1><div class="spacer"></div>${API.url?`<span class="muted" id="syncinfo" style="font-size:14px">${syncing?'Atualizando dados…':syncTxt()}</span><button class="btn ghost small" data-act="sync">↻</button>`:''}<button class="btn ghost small" data-act="home">Sair</button></div>
  ${!API.url?'<div class="note">A planilha ainda não está conectada neste aparelho. Os dados estão salvos só aqui. Configure em Conexão, no fim da página.</div>':(outbox.length?`<div class="note">${outbox.length} registro(s) ainda não foram para a planilha.${outbox.some(x=>x.erro==='acao_desconhecida')?' O servidor está numa versão antiga: no Apps Script, vá em Implantar → Gerenciar implantações → ✏️ → Nova versão → Implantar.':outbox.some(x=>x.erro)?' Erro do servidor: '+esc(outbox.find(x=>x.erro).erro)+'.':' Eles serão enviados quando houver internet.'}</div>`:'')}
  <div class="pgrid">
    <div class="tile"><span class="l">Hoje</span><span class="v">${mins(tm)} min</span><span><span class="pill ${studied?(mins(tm)>=goal?'ok':'mid'):'no'}">${studied?(mins(tm)>=goal?'Meta cumprida':'Estudou, abaixo da meta'):'Ainda não estudou'}</span></span></div>
    <div class="tile"><span class="l">Últimos 7 dias</span><span class="v">${mins(st.weekMs)} min</span><span class="l">${st.studiedDays} de 7 dias com estudo</span></div>
    <div class="tile"><span class="l">Acerto geral</span><span class="v">${st.pct==null?'—':st.pct+'%'}</span><span class="l">${st.total} respostas registradas</span></div>
    <div class="tile"><span class="l">Lições concluídas</span><span class="v">${LESSONS.filter(l=>(S.progress[l.id]||{}).stars).length} de ${LESSONS.length}</span><span class="l">Ajudas da IA usadas: ${st.aiHelps}</span></div>
    <div class="tile"><span class="l">Leitura (7 dias)</span><span class="v">${diasLeit} dia${diasLeit===1?'':'s'}</span><span class="l">${lt7.reduce((a,r)=>a+(r.minutos||0),0)} min · ${new Set(lt7.map(r=>r.livro)).size} livro(s)</span></div>
    <div class="tile"><span class="l">Missão da semana</span><span class="v">${misF?'✅ Feita':'⏳'}</span><span class="l">${mis.icone} ${esc(mis.materia)}</span></div>
  </div>
  ${chatHTML()}
  <div class="sec"><h2>Tempo de estudo por dia</h2><div class="card">
    <div class="chart">${st.days.map(d=>`<div title="${d.k}"><span>${d.ms?mins(d.ms):''}</span><b class="${mins(d.ms)>=goal?'goalhit':''}" style="height:${Math.round(d.ms/maxMs*100)}%"></b></div>`).join('')}</div>
    <div class="chartx">${st.days.map(d=>`<span>${d.label}<br>${d.dow}${leitDia.has(d.k)?'<br>📖':''}</span>`).join('')}</div>
    <p class="muted" style="font-size:14px;margin:10px 0 0">Minutos de tempo ativo. Verde = meta de ${goal} min cumprida. O tempo pausa quando ela fica 2 minutos sem tocar na tela ou sai do app.</p></div></div>
  <div class="sec"><h2>⚖️ Equilíbrio da semana</h2><div class="card tbl"><table><thead><tr><th>Matéria</th><th class="n">Minutos (7 dias)</th><th class="n">Lições feitas</th><th>Última vez</th></tr></thead><tbody>
    ${SUBJECTS.filter(x=>x.ready).map(x=>{const ss=S.sessions.filter(z=>z.start>=lim7&&z.subject===x.nome),lt=lastStudied(x.nome),dias=lt?Math.floor((Date.now()-lt)/864e5):null;
      return `<tr><td>${x.ic} ${esc(x.nome)}</td><td class="n">${mins(ss.reduce((a,z)=>a+(z.activeMs||0),0))}</td><td class="n">${ss.filter(z=>z.phaseReached==='done').length}</td><td>${dias==null?'<span class="pill no">nunca</span>':dias>7?`<span class="pill no">há ${dias} dias</span>`:dias===0?'hoje':`há ${dias} dia${dias>1?'s':''}`}</td></tr>`}).join('')}
    </tbody></table><p class="muted" style="font-size:14px;margin:8px 0 0">Com o roteiro ligado, Matemática e Português se alternam a cada dia, e a matéria do dia sai das que estão há mais tempo sem estudo.</p></div></div>
  <div class="sec"><h2>📖 Leitura do dia</h2><div class="card col">
    <div class="note" style="background:var(--pri-soft);color:var(--ink)"><b>Perguntas para fazer durante a leitura de hoje:</b><ul style="margin:6px 0 0;padding-left:20px">${perguntasHoje().map(q=>`<li>${esc(q)}</li>`).join('')}</ul>
      <div style="margin-top:6px">No final, peça: <i>"Me conta o que aconteceu na história."</i></div></div>
    <div class="form">
      <label for="lt-livro">Livro<input id="lt-livro" type="text" list="lt-livros" maxlength="80" placeholder="Nome do livro"></label>
      <datalist id="lt-livros">${livrosLidos().map(b=>`<option value="${esc(b)}">`).join('')}</datalist>
      <label for="lt-min">Minutos<input id="lt-min" type="number" min="1" max="180" value="15"></label>
      <label for="lt-quem">Quem leu<select id="lt-quem" class="sel"><option>Papai leu</option><option>Lemos juntos</option><option>Ela leu</option></select></label>
      <label for="lt-gostou">Ela gostou?<select id="lt-gostou" class="sel">${[5,4,3,2,1].map(n=>`<option value="${n}">${'⭐'.repeat(n)}</option>`).join('')}</select></label>
      <label class="check" for="lt-reconto"><input id="lt-reconto" type="checkbox"> Ela recontou a história</label>
    </div>
    <div class="row"><button class="btn small okb" data-act="leitura">Registrar leitura</button></div>
    ${lts.length?`<div class="tbl"><table><thead><tr><th>Data</th><th>Livro</th><th class="n">Min</th><th>Quem</th><th>Recontou</th><th>Gostou</th></tr></thead><tbody>${lts.slice(0,8).map(r=>`<tr><td>${fmtDT(r.ts)}</td><td>${esc(r.livro)}</td><td class="n">${r.minutos}</td><td>${esc(r.quem)}</td><td>${r.recontou?'sim':'não'}</td><td>${'⭐'.repeat(r.gostou||0)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="muted" style="margin:0">Nenhuma leitura registrada ainda.</p>'}
  </div></div>
  <div class="sec"><h2>🎯 Missão da semana</h2><div class="card col">
    <div class="row" style="flex-wrap:nowrap"><span style="font-size:40px">${mis.icone}</span><span>${esc(mis.texto)}</span></div>
    <div class="row">${misF?`<span class="pill ok">Feita em ${new Date(misF.ts).toLocaleDateString('pt-BR')}</span>`:'<button class="btn small okb" data-act="missaook">Marcar como feita</button>'}<span class="muted" style="font-size:14px">A missão muda toda segunda-feira.</span></div>
  </div></div>
  ${ccSectionHTML()}
  ${potesParentHTML()}
  <div class="sec"><h2>Análise com IA</h2>
    <div class="row"><button class="btn small" data-act="aianalyze">Gerar análise da semana</button><span class="muted" style="font-size:14px">Envia só números e erros, sem o nome dela.</span></div><div id="aianalysis"></div></div>
  <div class="sec"><h2>Desempenho por habilidade</h2><div class="card tbl">${st.skills.length?`<table><thead><tr><th>Habilidade</th><th>Acerto</th><th>Nível</th><th class="n">Respostas</th><th class="n">Tempo médio</th></tr></thead><tbody>
    ${st.skills.map(s=>`<tr><td>${esc(s.k)}</td><td>${meter(s.pct)}</td><td>${HAB_NIVEL.includes(s.k)?['','🟢 1 (até 30)','🟡 2 (até 60)','🔵 3 (até 100)'][NIVEL[s.k]||1]:'—'}</td><td class="n">${s.n}</td><td class="n">${s.avg} s</td></tr>`).join('')}</tbody></table>`:'<p class="muted">Ainda sem respostas. Os dados aparecem depois da primeira lição.</p>'}</div></div>
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
    <label class="check" for="cf-fundo"><input id="cf-fundo" type="checkbox" ${S.config.fundo!==false?'checked':''}> Imagem de fundo</label>
    <label class="check" for="cf-rot"><input id="cf-rot" type="checkbox" ${S.config.roteiro!==false?'checked':''}> Roteiro do dia (Matemática e Português alternados + matéria do dia)</label>
    <label>Tamanho das lições<select id="cf-tam">${[['curta','Curta: 6 para praticar + 5 no desafio'],['media','Média: 9 + 7, com 2 exemplos resolvidos'],['longa','Longa: 12 + 9, com 2 exemplos resolvidos']].map(([v,t])=>`<option value="${v}" ${(S.config.tamanho||'media')===v?'selected':''}>${t}</option>`).join('')}</select></label>
    <div class="row" style="gap:8px;flex-wrap:wrap"><span class="muted" style="font-size:15px;flex:1">Pendências de outros dias: ${(()=>{try{return (roteiro().pend||[]).length}catch(e){return 0}})()}. Use se ela ficou doente ou viajou.</span><button class="btn small ghost" data-act="pendzero">Zerar pendências</button></div>
    <label class="check" for="cf-livre"><input id="cf-livre" type="checkbox" ${S.config.livreDepois!==false?'checked':''}> Tempo livre só depois do roteiro</label>
    <fieldset style="border:0;padding:0;margin:0;display:flex;flex-direction:column;gap:6px"><legend style="font-size:15px;color:var(--muted);margin-bottom:6px">Dias da Memória CC no roteiro</legend>
      <div class="row" style="gap:10px">${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map((d,i)=>`<label class="check" for="cf-md${i}" style="font-size:15px!important"><input id="cf-md${i}" type="checkbox" ${(S.config.memDias||[1,3,5]).includes(i)?'checked':''}> ${d}</label>`).join('')}</div></fieldset>
    </div><div class="row"><button class="btn small okb" data-act="savecfg">Salvar configurações</button><button class="btn small ghost" data-act="export">Copiar todos os dados (JSON)</button><button class="btn small ghost" data-act="testvoice">Testar voz</button><button class="btn small ghost" data-act="checarupd">Verificar atualização</button><span class="muted" style="font-size:13px">Versão ${APP_VERSAO.replace('trilha-','')}</span></div>
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
    errosFrequentes:st.errs.slice(0,8).map(([t,n])=>({tipo:t,vezes:n})),ultimosErros:st.recentErr.slice(0,8).map(a=>({pergunta:a.q,respondeu:a.given,certo:a.correct})),ajudasIA:st.aiHelps,leitura7dias:{dias:new Set(leituras().filter(r=>r.ts>=Date.now()-7*864e5).map(r=>r.data)).size,recontou:leituras().filter(r=>r.ts>=Date.now()-7*864e5&&r.recontou).length},missaoDaSemanaFeita:!!missaoFeita()};
  const prompt=`Você ajuda um pai a acompanhar os estudos da filha de 7 anos (2º ano, Brasil), que usa em casa um app de reforço escolar (Matemática, Português, Ciências, Dinheiro, Lógica, Inglês e Memória do Classical Conversations). Os dados também trazem a leitura em família e a missão fora da tela da semana.
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
    ai:document.getElementById('cf-ai').checked,fundo:document.getElementById('cf-fundo').checked,roteiro:document.getElementById('cf-rot').checked,livreDepois:document.getElementById('cf-livre').checked,memDias:[0,1,2,3,4,5,6].filter(i=>document.getElementById('cf-md'+i).checked),autoRead:document.getElementById('cf-read').checked,unlockAll:document.getElementById('cf-unlock').checked,tamanho:document.getElementById('cf-tam').value};
  try{await saveConfig();applyFundo();toast('Configurações salvas.');renderParent()}catch(e){toast('Não consegui salvar. Tente de novo.')}
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
  subj(id){const s=SUBJECTS.find(x=>x.id===id);if(s&&s.ready){S.subject=id;try{localStorage.setItem('ts:subject',id)}catch(e){}renderMap()}else if(s&&s.id==='mem'){toast('Peça para o papai colocar as frases da semana na planilha.')}else{toast(s.nome+' chega em breve!');speak(s.nome+' chega em breve!')}},
  locked(){toast('Ganhe pelo menos 1 estrela na lição anterior para abrir esta.');speak('Termine a lição anterior para abrir esta.')},
  open(i){startLesson(+i)},
  home(){if(S.view==='lesson'||R)leaveLesson();else renderMap()},
  say(){const s=R.lesson.slides[R.slide];speak(s.fala||s.t)},
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
  nextq(){if(R.qi<R.items.length-1){R.qi++;renderQ()}else if(R.phase==='practice'&&!R.lesson.treino){R.quizOk=0;beginPhase('quiz')}else finishLesson()},
  again(){if(R.lesson.id==='aquecimento')startWarmup();else if(R.lesson.treino&&typeof roboTreino==='function')roboTreino(R.lesson.skillTreino);else startLessonObj(R.base||R.lesson,R.idx,R.subjName)},
  warmup(){startWarmup()},
  rot1(){startWarmup()},
  rot2(){startSubjNext(mainSubj().id)},
  rotpend(id){startSubjNext(id)},
  pendzero(){LS.set('pendZero',today());toast('Pendências zeradas. A contagem recomeça hoje.');const y=window.scrollY;renderParent();window.scrollTo(0,y)},
  rot3(id){const k='rot:'+today(),st=LS.get(k,{});st.escolha=id;LS.set(k,st);startSubjNext(id)},
  saymissao(){speak('Missão da semana: '+missaoAtual().texto)},
  nk(d){if(d==='ok'){if(!R.numVal){toast('Digite a resposta.');return}const v=+R.numVal,q=R.q,ok=v===q.answer,first=R.tries===0,o=q.options.find(x=>x.v===v);
      handleAnswer(ok,v,ok?null:((o&&o.type)||'errou a conta'),null);if(!ok&&R.phase==='practice'&&first){R.numVal='';drawNum()}return}
    if(d==='del')R.numVal=R.numVal.slice(0,-1);else if(R.numVal.length<3)R.numVal+=d;drawNum()},
  missaook(){store.setDiario({id:'missao-'+weekIdx(),tipo:'missao',data:today(),ts:Date.now(),semana:weekIdx(),texto:missaoAtual().texto,feita:true});toast('Missão marcada como feita!');renderParent()},
  leitura(){const livro=document.getElementById('lt-livro').value.trim();if(!livro){toast('Escreva o nome do livro.');return}
    store.setDiario({id:'l-'+Date.now().toString(36),tipo:'leitura',data:today(),ts:Date.now(),livro:livro.slice(0,80),minutos:Math.max(1,Math.min(180,parseInt(document.getElementById('lt-min').value,10)||15)),
      quem:document.getElementById('lt-quem').value,recontou:document.getElementById('lt-reconto').checked,gostou:+document.getElementById('lt-gostou').value});
    toast('Leitura registrada!');renderParent()},
  ptcfg(){const n=(id,d)=>{const v=parseFloat(document.getElementById(id).value);return isNaN(v)?d:Math.max(0,v)};
    const pct={gastar:Math.round(n('pc-g',40)),guardar:Math.round(n('pc-u',40)),investir:Math.round(n('pc-i',20))};
    if(pct.gastar+pct.guardar+pct.investir!==100){toast('As porcentagens precisam somar 100%.');return}
    const old=potes()||{},c=potesCfg();
    store.setDiario({id:'potes',tipo:'potes',data:today(),ts:Date.now(),base:c.base,mesada:n('pc-mesada',10),pct,ganha:n('pc-ganha',1),cada:Math.max(1,n('pc-cada',10)),
      metaNome:document.getElementById('pc-mn').value.trim().slice(0,40),metaValor:n('pc-mv',0)});
    toast(old.id?'Configuração salva!':'Potes ligados!');renderParent()},
  ptmesada(){const c=potesCfg();if(!c.mesada){toast('Defina o valor da mesada na configuração.');return}addMov('mesada',dividir(c.mesada),'Mesada');toast('Mesada dividida nos potes!');renderParent()},
  ptgasto(){const v=parseFloat(document.getElementById('pt-val').value),k0=document.getElementById('pt-pote').value,k=k0==='auto'?'gastar':k0,desc=document.getElementById('pt-desc').value.trim()||'Gasto';
    if(!(v>0)){toast('Digite o valor.');return}const s=saldos();if(v>s[k]+1e-9){toast(`O pote ${POTE_NM[k]} só tem ${brl(s[k])}.`);return}
    addMov('gasto',{[k]:-v},desc);toast(`Gasto registrado no pote ${POTE_NM[k]}.`);renderParent()},
  ptentrada(){const v=parseFloat(document.getElementById('pt-val').value),k=document.getElementById('pt-pote').value,desc=document.getElementById('pt-desc').value.trim()||'Entrada';
    if(!(v>0)){toast('Digite o valor.');return}addMov('entrada',k==='auto'?dividir(v):{[k]:v},desc);toast('Entrada registrada!');renderParent()},
  ptmeta(el){const c=potesCfg(),b=document.querySelector('[data-act=ptmeta]');if(b&&!b.dataset.ok){b.dataset.ok='1';b.textContent='Toque de novo para confirmar';return}
    addMov('meta',{guardar:-c.metaValor},'Comprou: '+c.metaNome);const p=potes();store.setDiario({...p,ts:Date.now(),metaNome:'',metaValor:0});toast('Parabéns pela conquista! Escolham uma meta nova.');renderParent()},
  ccler(_,el){ccLer(el)},
  mmler(_,el){mmLer(el)},
  mmedit(id){const r=store.diario().find(x=>x.id===id);if(!r)return;MMD={ciclo:String(r.ciclo),semana:Number(r.semana),titulo:r.titulo,passos:r.passos||[],materiais:r.materiais||[],ciencias:r.ciencias||[]};
    mmRedraw();const d=document.getElementById('mmdraft');if(d)d.scrollIntoView({behavior:'smooth',block:'start'});toast('Edite e toque em Salvar. Os experimentos vão no último campo, um por linha.')},mmmanual(){const c=ccLerCampos();MMD={...c,titulo:'',passos:[],materiais:[]};mmRedraw()},mmcancel(){MMD=null;mmRedraw()},
  mmsalvar(){if(!MMD)return;const tit=document.getElementById('mm-tit').value.trim(),linhas=id=>document.getElementById(id).value.split('\n').map(x=>x.trim()).filter(Boolean);
    const passos=linhas('mm-pas');if(!tit||!passos.length){toast('Preencha o título e pelo menos um passo.');return}
    const id=`pratica-c${MMD.ciclo}-s${MMD.semana}`,ant=store.diario().find(r=>r.id===id)||{};
    store.setDiario({...ant,id,tipo:'pratica',data:today(),ts:Date.now(),ciclo:MMD.ciclo,semana:MMD.semana,titulo:tit,passos,materiais:linhas('mm-mat'),ciencias:linhas('mm-cie')});
    toast('Atividade salva! Ela aparece junto com a semana do CC.');MMD=null;const y=window.scrollY;renderParent();window.scrollTo(0,y)},
  mmfeita(id){const r=store.diario().find(x=>x.id===id);if(!r)return;store.setDiario({...r,feita:true,feitaTs:Date.now()});toast('Marcada como feita!');const y=window.scrollY;renderParent();window.scrollTo(0,y)},
  sayexper(id){const e=(typeof CC_EXPER!=='undefined'?CC_EXPER:[]).find(x=>x.id===id);if(e)speak('Experimento: '+e.titulo+'. '+e.pergunta+' '+e.passos.map((x,i)=>'Passo '+(i+1)+': '+x).join(' '))},
  experok(id){store.setDiario({id:'expfeito-'+id,tipo:'experimento',ref:id,data:today(),ts:Date.now(),feita:true});toast('Experimento marcado como feito!');const y=window.scrollY;renderParent();window.scrollTo(0,y)},
  estante(){renderEstante()},saylivro(t){speak(t)},
  saymaos(){const p=praticaAtual();if(p)speak('Mãos na massa: '+p.titulo+'. '+p.passos.map((x,i)=>'Passo '+(i+1)+': '+x).join(' '))},
  ccmanual(){const c=ccLerCampos();CCD={...c,itens:[{materia:'História',texto:''}]};ccRedraw()},
  ccadd(){ccSync();CCD.itens.push({materia:'',texto:''});ccRedraw()},
  ccdel(i){ccSync();CCD.itens.splice(+i,1);ccRedraw()},
  cccancel(){CCD=null;ccRedraw()},
  ccsalvar(_,el){ccSalvar(el)},
  ccedit(k){const[c,s]=k.split('|'),rows=LS.get('memoria',[]).filter(r=>String(r.ciclo||'1')===c&&Number(r.semana)===Number(s));
    CCD={ciclo:c,semana:Number(s),itens:rows.map(r=>({materia:ccMateria(r.materia),texto:r.texto||''})),editando:true};
    const ci=document.getElementById('cc-ciclo'),se=document.getElementById('cc-semana');if(ci)ci.value=c;if(se)se.value=s;
    ccRedraw();const d=document.getElementById('ccdraft');if(d)d.scrollIntoView({behavior:'smooth',block:'start'});toast('Corrija o que precisar e toque em Salvar semana.')},
  chattudo(){chatTudo=true;const y=window.scrollY;renderParent();window.scrollTo(0,y)},
  chatenviar(){const t=document.getElementById('chat-txt'),txt=(t&&t.value||'').trim();if(!txt){toast('Escreva a mensagem primeiro.');return}
    store.setDiario({id:'p-'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),tipo:'pedido',data:today(),ts:Date.now(),texto:txt.slice(0,1500)});
    toast('Mensagem enviada. Respondo hoje à noite.');const y=window.scrollY;renderParent();window.scrollTo(0,y)},
  ccforcar(){if(!MEMINFO.prox)return;S.config.ccForcar=[...new Set([...(S.config.ccForcar||[]),MEMINFO.prox])];saveConfig();applyMemoria(LS.get('memoria',[]));toast('Semana liberada na tela dela.');renderParent()},
  parent(){renderPin()},
  pk(d){pinKey(d)},
  pdel(){pinKey('del')},
  aianalyze(_,el){aiAnalyze(el)},
  savecfg(){saveCfg()},
  export(){exportData()},
  savecon(){saveCon()},
  atualizar(){atualizarApp()},
  sync(){sincronizar(true)},
  checarupd(_,el){el.disabled=true;checarVersao().then(r=>{el.disabled=false;if(r===false)toast('O app já está na versão mais nova.');else if(r===null)toast('Sem internet para verificar agora.')})},
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
  applyMemoria(LS.get('memoria',[]));
  applyFundo();
  try{aplicarRendimento()}catch(e){console.warn(e)}
}
/* LIBERAÇÃO SEMANAL DA MEMÓRIA CC: o Pedro pode cadastrar várias semanas de uma vez.
   A 1ª fica aberta; cada semana seguinte abre na segunda-feira depois que ela concluir (1 estrela) a anterior.
   Semanas que ela já começou continuam abertas, e o Pedro pode liberar a próxima na hora pela área dos pais. */
function proxSegunda(ts){const d=new Date(ts);d.setHours(0,0,0,0);d.setDate(d.getDate()+(((8-d.getDay())%7)||7));return d.getTime()}
const memChave=r=>(String(r.ciclo||'').trim()||'1')+'|'+(Number(r.semana)||0);
const memIdDe=k=>{const[c,s]=k.split('|');return `mem-c${c}-s${s}`};
const memConcluida=k=>{const p=S.progress[memIdDe(k)]||{};return (p.stars||0)>=1?(p.passouEm||p.lastAt||1):null};
function memLiberacao(rows){
  const ks=[...new Set((rows||[]).filter(r=>r&&r.texto&&String(r.texto).trim()).map(memChave))].sort((a,b)=>{const[ca,sa]=a.split('|'),[cb,sb]=b.split('|');return ca===cb?sa-sb:ca.localeCompare(cb)});
  const lib=[];let i=0;
  for(;i<ks.length;i++){const k=ks[i],p=S.progress[memIdDe(k)]||{};
    if(i===0||p.tries||(S.config.ccForcar||[]).includes(k)){lib.push({k,em:null});continue}
    const q=memConcluida(ks[i-1]);if(q&&Date.now()>=proxSegunda(q)){lib.push({k,em:proxSegunda(q)});continue}
    break}
  const q=ks[i]?memConcluida(ks[i-1]):null;
  return {ks,lib,prox:ks[i]||null,proxEm:q?proxSegunda(q):null};
}
let MEMINFO={ks:[],lib:[],prox:null,proxEm:null};
/* O livro do CC em português tem a matéria "Português" (no lugar do Inglês da edição americana); a IA às vezes troca o nome. */
const ccMateria=m=>/ingl|english/i.test(String(m||''))?'Português':(m||'Memória');
function applyMemoria(rows){
  rows=(rows||[]).map(r=>r&&{...r,materia:ccMateria(r.materia)});
  const subj=SUBJECTS.find(x=>x.id==='mem');if(!subj)return;
  MEMINFO=memLiberacao(rows);const abertas=new Set(MEMINFO.lib.map(x=>x.k));
  let L=[];try{L=buildMemoria((rows||[]).filter(r=>r&&abertas.has(memChave(r))))}catch(e){console.warn('memória',e)}
  /* Aprofunde (CC_APROF em conteudo.js): lições originais da semana, logo depois da lição de memorização dela, só quando a semana está liberada */
  if(typeof CC_APROF!=='undefined'){const out=[];for(const l of L){out.push(l);const m=/^mem-c(.+)-s(\d+)$/.exec(l.id);
    if(m)out.push(...CC_APROF.filter(a=>a.cc===`${m[1]}|${m[2]}`).map(a=>({...a,subject:'Memória'})))}L=out}
  for(let i=LESSONS.length-1;i>=0;i--)if(LESSONS[i].subject==='Memória')LESSONS.splice(i,1);
  LESSONS.push(...L);subj.lessons=L;subj.ready=L.length>0;subj.nome='Memória CC';subj.ano=L.length?`${L.length} lições`:'em breve';
}
(async function init(){
  await loadState();renderMap();           // abre na hora com os dados do aparelho
  await store.init();lastSync=Date.now();await loadState();    // depois sincroniza com a planilha
  if(S.view==='map'&&!R)renderMap();
})();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
setTimeout(checarVersao,3000);
