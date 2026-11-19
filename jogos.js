/* Trilha do Saber · jogos do tempo livre: clínica dos bichinhos, dentista, forca, caça-palavras, memória e sudoku.
   Os jogos não contam como tempo de estudo e só aparecem quando o tempo livre está aberto.
   As palavras ficam em JOGO_TEMAS (conteudo.js). */
let JG=null;
const embaralha=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const jogoTopo=(titulo,extra='')=>`<div class="top"><button class="btn ghost small" data-act="jogos">⬅ Jogos</button><h1 class="hello" style="font-size:26px">${titulo}</h1><div class="spacer"></div>${extra}</div>`;
function jogoFim(msg){confetti();somVitoria();speak(msg);toast(msg);ganhaEstrela()}

const estrelasJogo=()=>LS.get('jogoEstrelas',0);
function ganhaEstrela(n=1){LS.set('jogoEstrelas',estrelasJogo()+n)}
function jogosHTML(){
  const j=(id,ic,t,s)=>`<button class="mini jogo-card" data-act="jogo" data-arg="${id}"><span class="ic">${ic}</span><span><b>${t}</b><small>${s}</small></span></button>`;
  return `<div class="row" style="align-items:center;margin:0 0 10px"><h2 style="font-size:24px;margin:0">🎮 Jogos</h2><span class="spacer"></span><span class="pill ok" style="font-size:16px">⭐ ${estrelasJogo()} estrelas</span></div><div class="cards2">
    ${j('medico','🩺','Clínica dos bichinhos','Cuide dos animais doentes')}
    ${j('dentista','🦷','Dentista','Deixe os dentes brilhando')}
    ${j('forca','🎈','Forca dos balões','Descubra a palavra antes dos balões estourarem')}
    ${j('desenho','🙃','Desenho de cabeça para baixo','Copie o desenho virado e depois vire!')}
    ${j('caca','🔎','Caça-palavras','Ache as palavras escondidas')}
    ${j('memoria','🃏','Jogo da memória','Encontre os pares')}
    ${j('sudoku','🧩','Sudoku das figuras','Cada figura uma vez em cada linha')}</div>`;
}
function renderJogos(){S.view='jogo';JG=null;clearTimeout(dicaT);
  app.innerHTML=jogoTopo('🎮 Jogos','<button class="btn ghost small" data-act="home">Início</button>')+`<div style="margin-top:12px">${jogosHTML().replace(/<h2[^>]*>.*?<\/h2>/,'')}</div>`}

/* ---------- Caça-palavras ---------- */
function novoCaca(temaId){
  const ids=Object.keys(JOGO_TEMAS),tid=temaId&&JOGO_TEMAS[temaId]?temaId:ids[Math.floor(Math.random()*ids.length)],T=JOGO_TEMAS[tid],N=8;
  for(let tent=0;tent<50;tent++){
    const g=Array.from({length:N},()=>Array(N).fill('')),pos=[];
    const ws=embaralha(T.palavras).filter(p=>p[0].length<=N).slice(0,5);let ok=true;
    for(const [w,e] of ws){let colocou=false;
      for(let k=0;k<200&&!colocou;k++){const vert=Math.random()<.5,r=Math.floor(Math.random()*(vert?N-w.length+1:N)),c=Math.floor(Math.random()*(vert?N:N-w.length+1));
        let cabe=true;for(let i=0;i<w.length;i++){const rr=r+(vert?i:0),cc=c+(vert?0:i);if(g[rr][cc]&&g[rr][cc]!==w[i]){cabe=false;break}}
        if(cabe){for(let i=0;i<w.length;i++)g[r+(vert?i:0)][c+(vert?0:i)]=w[i];pos.push({w,e,r,c,vert,achou:false});colocou=true}}
      if(!colocou){ok=false;break}}
    if(!ok)continue;
    const L='ABCDEFGHIJLMNOPRSTUVZ';for(const row of g)for(let i=0;i<N;i++)if(!row[i])row[i]=L[Math.floor(Math.random()*L.length)];
    JG={tipo:'caca',tid,g,pos,sel:null,N};return}
}
function cacaHTML(){const{g,pos,sel,N,tid}=JG,marc=new Set();
  pos.filter(p=>p.achou).forEach(p=>{for(let i=0;i<p.w.length;i++)marc.add((p.r+(p.vert?i:0))+','+(p.c+(p.vert?0:i)))});
  const temas=Object.entries(JOGO_TEMAS).map(([id,t])=>`<button class="btn small ${id===tid?'':'ghost'}" data-act="cacatema" data-arg="${id}">${t.ic} ${t.nome}</button>`).join('');
  return jogoTopo('🔎 Caça-palavras',`<button class="btn small ghost" data-act="cacanovo">Novo</button>`)+
  `<div class="row" style="flex-wrap:wrap;gap:6px;margin:10px 0">${temas}</div>
   <p class="muted" style="margin:0 0 8px;text-align:center">Toque na <b>primeira</b> letra e depois na <b>última</b> letra da palavra. Elas estão deitadas ➡️ ou em pé ⬇️.</p>
   <div style="display:grid;grid-template-columns:repeat(${N},1fr);gap:4px;max-width:440px;margin:0 auto;user-select:none">
   ${g.map((row,r)=>row.map((ch,c)=>{const k=r+','+c,on=sel&&sel[0]===r&&sel[1]===c;
     return `<button data-act="cacaletra" data-arg="${k}" style="aspect-ratio:1;border-radius:10px;font-size:clamp(18px,5vw,28px);font-weight:800;border:2px solid ${on?'var(--sun)':'#D5DDEE'};background:${marc.has(k)?'var(--ok-soft)':on?'#FFF1D6':'#fff'};color:${marc.has(k)?'#11603B':'var(--ink)'}">${ch}</button>`}).join('')).join('')}
   </div>
   <div class="row" style="flex-wrap:wrap;gap:8px;justify-content:center;margin-top:14px">${pos.map(p=>`<span class="pill ${p.achou?'ok':''}" style="font-size:18px;padding:6px 12px;${p.achou?'text-decoration:line-through':''}">${p.e} ${p.w}</span>`).join('')}</div>`}
function cacaToque(arg){const[r,c]=arg.split(',').map(Number);
  if(!JG.sel){JG.sel=[r,c];return draw()}
  const[r0,c0]=JG.sel;JG.sel=null;
  if(r0===r&&c0===c)return draw();
  const p=JG.pos.find(p=>!p.achou&&((p.r===r0&&p.c===c0&&p.r+(p.vert?p.w.length-1:0)===r&&p.c+(p.vert?0:p.w.length-1)===c)||(p.r===r&&p.c===c&&p.r+(p.vert?p.w.length-1:0)===r0&&p.c+(p.vert?0:p.w.length-1)===c0)));
  if(p){p.achou=true;speak(p.w.toLowerCase());if(JG.pos.every(x=>x.achou))setTimeout(()=>jogoFim('Parabéns! Você achou todas as palavras!'),400)}
  else toast('Não é uma palavra da lista. Tente de novo!');
  draw();
  function draw(){app.innerHTML=cacaHTML()}
}

/* ---------- Jogo da memória ---------- */
function novaMemoria(modo){
  modo=modo||'figuras';let pares;
  if(modo==='numeros'){pares=embaralha([1,2,3,4,5,6,7,8,9]).slice(0,6).map(n=>[{t:String(n),big:true},{t:'⭐'.repeat(n),small:true}])}
  else{const todas=Object.values(JOGO_TEMAS).flatMap(t=>t.palavras),esc6=embaralha(todas).filter((p,i,a)=>a.findIndex(q=>q[1]===p[1])===i).slice(0,6);
    pares=modo==='palavras'?esc6.map(([w,e])=>[{t:e,big:true},{t:w,word:true}]):esc6.map(([w,e])=>[{t:e,big:true},{t:e,big:true}])}
  const cartas=embaralha(pares.flatMap((p,i)=>p.map(x=>({...x,par:i}))));
  JG={tipo:'memoria',modo,cartas,abertas:[],achados:new Set(),jogadas:0,trava:false};
}
function memoriaHTML(){const{cartas,abertas,achados,jogadas,modo}=JG;
  const modos=[['figuras','🐱 Figuras'],['numeros','🔢 Números'],['palavras','🔤 Palavras']].map(([m,n])=>`<button class="btn small ${m===modo?'':'ghost'}" data-act="memmodo" data-arg="${m}">${n}</button>`).join('');
  return jogoTopo('🃏 Jogo da memória',`<button class="btn small ghost" data-act="memnovo">Novo</button>`)+
  `<div class="row" style="flex-wrap:wrap;gap:6px;margin:10px 0">${modos}</div>
   <p class="muted" style="margin:0 0 8px;text-align:center">${modo==='numeros'?'Junte o número com a quantidade de estrelas.':modo==='palavras'?'Junte a figura com o nome dela.':'Encontre as figuras iguais.'} Jogadas: <b>${jogadas}</b></p>
   <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:480px;margin:0 auto">
   ${cartas.map((k,i)=>{const vis=abertas.includes(i)||achados.has(k.par);
     return `<button data-act="memcarta" data-arg="${i}" style="aspect-ratio:3/4;border-radius:16px;border:3px solid ${achados.has(k.par)?'var(--ok)':'#D5DDEE'};background:${vis?'#fff':'var(--pri)'};font-size:${!vis?'32px':k.word?'clamp(13px,3.4vw,18px)':k.small?'clamp(12px,3.2vw,16px)':'clamp(30px,8vw,46px)'};font-weight:800;color:var(--ink);padding:4px;line-height:1.2;word-break:break-word">${vis?esc(k.t):'❓'}</button>`}).join('')}
   </div>`}
function memoriaToque(i){i=Number(i);const J=JG;
  if(J.trava||J.abertas.includes(i)||J.achados.has(J.cartas[i].par))return;
  J.abertas.push(i);
  if(J.abertas.length===2){J.jogadas++;const[a,b]=J.abertas;
    if(J.cartas[a].par===J.cartas[b].par){J.achados.add(J.cartas[a].par);J.abertas=[];
      if(J.achados.size*2===J.cartas.length)setTimeout(()=>jogoFim(`Muito bem! Você achou todos os pares em ${J.jogadas} jogadas!`),400)}
    else{J.trava=true;setTimeout(()=>{J.abertas=[];J.trava=false;if(JG===J)app.innerHTML=memoriaHTML()},1100)}}
  app.innerHTML=memoriaHTML();
}

/* ---------- Sudoku 4x4 de figuras ---------- */
const SUDO_FIG=[['🍎','🍌','🍇','🍓'],['🔴','🟦','🔺','⭐'],['🐶','🐱','🐰','🐸']];
function novoSudoku(nivel){
  nivel=nivel||1;let s=[[0,1,2,3],[2,3,0,1],[1,0,3,2],[3,2,1,0]];
  const perm=embaralha([0,1,2,3]);s=s.map(r=>r.map(v=>perm[v]));
  if(Math.random()<.5)s=[s[1],s[0],s[2],s[3]];if(Math.random()<.5)s=[s[0],s[1],s[3],s[2]];if(Math.random()<.5)s=[s[2],s[3],s[0],s[1]];
  if(Math.random()<.5)s=s[0].map((_,c)=>s.map(r=>r[c]));
  if(Math.random()<.5)s=s.map(r=>[r[1],r[0],r[2],r[3]]);if(Math.random()<.5)s=s.map(r=>[r[0],r[1],r[3],r[2]]);
  const vazias=new Set(embaralha([...Array(16).keys()]).slice(0,nivel===1?5:nivel===2?8:10));
  JG={tipo:'sudoku',nivel,sol:s,fig:SUDO_FIG[Math.floor(Math.random()*SUDO_FIG.length)],g:s.map((r,ri)=>r.map((v,ci)=>vazias.has(ri*4+ci)?null:v)),fixas:vazias,sel:null,erro:null};
}
function sudokuHTML(){const{g,fig,fixas,sel,erro,nivel}=JG;
  const nv=[[1,'⭐ Fácil'],[2,'⭐⭐ Médio'],[3,'⭐⭐⭐ Difícil']].map(([n,t])=>`<button class="btn small ${n===nivel?'':'ghost'}" data-act="sudonivel" data-arg="${n}">${t}</button>`).join('');
  return jogoTopo('🧩 Sudoku das figuras',`<button class="btn small ghost" data-act="sudonovo">Novo</button>`)+
  `<div class="row" style="flex-wrap:wrap;gap:6px;margin:10px 0">${nv}</div>
   <p class="muted" style="margin:0 0 8px;text-align:center">Cada figura aparece <b>uma vez</b> em cada linha, em cada coluna e em cada quadrado grande. Toque num espaço vazio e escolha a figura.</p>
   <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0;max-width:340px;margin:0 auto;border:4px solid var(--ink);border-radius:12px;overflow:hidden;background:#fff">
   ${g.map((row,r)=>row.map((v,c)=>{const k=r*4+c,livre=fixas.has(k),on=sel===k,er=erro===k;
     return `<button ${livre?`data-act="sudocel" data-arg="${k}"`:''} style="aspect-ratio:1;font-size:clamp(28px,8vw,44px);border:0;border-right:${c===1?'4px solid var(--ink)':c<3?'1px solid #C9D3E8':'0'};border-bottom:${r===1?'4px solid var(--ink)':r<3?'1px solid #C9D3E8':'0'};background:${er?'var(--bad-soft)':on?'#FFF1D6':livre?(v==null?'#F5F8FF':'#EEF9F2'):'#fff'}">${v==null?'':fig[v]}</button>`}).join('')).join('')}
   </div>
   <div class="row" style="gap:10px;justify-content:center;margin-top:16px">${fig.map((f,i)=>`<button class="btn" data-act="sudofig" data-arg="${i}" style="font-size:34px;min-width:64px;${sel==null?'opacity:.45':''}">${f}</button>`).join('')}</div>`}
function sudokuFig(i){i=Number(i);const J=JG;if(J.sel==null){toast('Primeiro toque num espaço vazio.');return}
  const r=Math.floor(J.sel/4),c=J.sel%4;
  if(J.sol[r][c]===i){J.g[r][c]=i;J.sel=null;J.erro=null;
    if(J.g.every(row=>row.every(v=>v!=null)))setTimeout(()=>jogoFim('Parabéns! Você completou o sudoku!'),300)}
  else{J.erro=J.sel;toast('Essa figura já tem nesta linha, coluna ou quadrado. Tente outra!');setTimeout(()=>{if(JG===J){J.erro=null;app.innerHTML=sudokuHTML()}},900)}
  app.innerHTML=sudokuHTML();
}

/* ---------- Sons e estilos dos jogos (sem arquivos: o próprio navegador gera os sons) ---------- */
let audioCtx=null;
function bip(freq=660,dur=.12,tipo='sine',vol=.15,quando=0){try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain(),t=audioCtx.currentTime+quando;
  o.type=tipo;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+dur)}catch(e){}}
const somAcerto=()=>{bip(660,.1);bip(880,.14,'sine',.15,.09)},somErro=()=>bip(180,.22,'square',.08),somPop=()=>bip(320,.08,'triangle',.18),
  somEsfrega=()=>bip(900+Math.random()*400,.04,'triangle',.05),somVitoria=()=>[523,659,784,1047].forEach((f,i)=>bip(f,.18,'sine',.14,i*.12));
(function(){const st=document.createElement('style');st.textContent=`
.jogo-card{transition:transform .15s}.jogo-card:active{transform:scale(.96)}
@keyframes jpop{0%{transform:scale(.3);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
@keyframes jbalanca{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
@keyframes jflutua{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes jpisca{0%,100%{box-shadow:0 0 0 0 rgba(255,176,32,.9)}50%{box-shadow:0 0 0 12px rgba(255,176,32,0)}}
@keyframes jtreme{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
@keyframes jsobe{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-70px);opacity:0}}
@keyframes jmole{0%,100%{transform:rotate(0)}25%{transform:rotate(-7deg)}75%{transform:rotate(7deg)}}
.jpop{animation:jpop .35s ease-out both}.jflutua{animation:jflutua 2.4s ease-in-out infinite}.jbalanca{animation:jbalanca 1.6s ease-in-out infinite}
.jpisca{animation:jpisca 1s infinite}.jtreme{animation:jtreme .3s 2}.jmole{animation:jmole .5s infinite}
.ferramentas{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:14px;touch-action:none}
.ferr{display:flex;flex-direction:column;align-items:center;gap:2px;min-width:78px;padding:8px 6px;border-radius:18px;background:#fff;border:3px solid #D5DDEE;font-size:38px;line-height:1;cursor:grab;touch-action:none;user-select:none;box-shadow:0 4px 0 rgba(29,40,70,.12)}
.ferr small{font-size:13px;font-weight:800;color:var(--ink)}.ferr.sel{border-color:var(--sun);background:#FFF6E0}
.fantasma{position:fixed;z-index:999;pointer-events:none;font-size:54px;transform:translate(-50%,-60%);filter:drop-shadow(0 6px 6px rgba(0,0,0,.25))}
.alvo{position:absolute;translate:-50% -50%;font-size:40px;line-height:1;border-radius:50%;padding:6px;background:rgba(255,255,255,.75);border:3px dashed #E5484D;transition:opacity .2s}
.alvo.ok{border-color:var(--ok);background:var(--ok-soft)}
.estrela-sobe{position:fixed;z-index:998;font-size:40px;pointer-events:none;animation:jsobe .9s ease-out forwards}
.balao{font-size:46px;display:inline-block}.letra{display:inline-flex;align-items:center;justify-content:center;width:46px;height:56px;border-bottom:5px solid var(--ink);font-size:38px;font-weight:900;margin:0 3px}
.teclas{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;max-width:520px;margin:14px auto 0}
.teclas button{height:52px;border-radius:12px;font-size:24px;font-weight:900;background:#fff;border:2px solid #D5DDEE;color:var(--ink)}
.teclas button.cert{background:var(--ok-soft);border-color:var(--ok);color:#11603B}.teclas button.err{background:var(--bad-soft);border-color:var(--bad);color:var(--bad);opacity:.6}
`;document.head.appendChild(st)})();
function estrelaVoa(x,y){const e=document.createElement('div');e.className='estrela-sobe';e.textContent='⭐';e.style.left=(x-20)+'px';e.style.top=(y-20)+'px';document.body.appendChild(e);setTimeout(()=>e.remove(),900)}

/* ---------- Forca dos balões (6 balões: cada letra errada estoura um) ---------- */
function novaForca(temaId){
  const ids=Object.keys(JOGO_TEMAS),tid=temaId&&JOGO_TEMAS[temaId]?temaId:ids[Math.floor(Math.random()*ids.length)],[w,e]=JOGO_TEMAS[tid].palavras[Math.floor(Math.random()*JOGO_TEMAS[tid].palavras.length)];
  JG={tipo:'forca',tid,w,e,certas:new Set(),erradas:new Set(),max:6,fim:false};
  setTimeout(()=>speak(`Tema: ${JOGO_TEMAS[tid].nome}. A palavra tem ${w.length} letras.`),300);
}
function forcaHTML(){const J=JG,T=JOGO_TEMAS[J.tid],rest=J.max-J.erradas.size,ganhou=[...J.w].every(c=>J.certas.has(c)),perdeu=rest<=0;
  const temas=Object.entries(JOGO_TEMAS).map(([id,t])=>`<button class="btn small ${id===J.tid?'':'ghost'}" data-act="forcatema" data-arg="${id}">${t.ic} ${t.nome}</button>`).join('');
  const baloes=Array.from({length:J.max},(_,i)=>i<rest?`<span class="balao jflutua" style="animation-delay:${i*.2}s">🎈</span>`:`<span class="balao" style="opacity:.25">💨</span>`).join('');
  return jogoTopo('🎈 Forca dos balões',`<button class="btn small ghost" data-act="forcanovo">Nova</button>`)+
  `<div class="row" style="flex-wrap:wrap;gap:6px;margin:10px 0">${temas}</div>
  <div class="card col" style="align-items:center;gap:6px;text-align:center">
    <div>${baloes}</div>
    <div style="font-size:56px;margin-top:-6px" class="${perdeu?'':'jbalanca'}">${perdeu?'🧸💤':ganhou?'🧸🎉':'🧸'}</div>
    <div class="row" style="justify-content:center;gap:10px"><span style="font-size:44px">${ganhou||perdeu?J.e:'❓'}</span><span class="muted">Tema: <b>${T.ic} ${T.nome}</b> · ${J.w.length} letras</span><button class="speak" data-act="forcafala" aria-label="Ouvir a dica">🔊</button></div>
    <div style="margin:8px 0">${[...J.w].map(c=>`<span class="letra ${J.certas.has(c)?'jpop':''}" style="${perdeu&&!J.certas.has(c)?'color:var(--bad)':''}">${J.certas.has(c)||perdeu?c:''}</span>`).join('')}</div>
    ${ganhou?`<div class="note" style="background:var(--ok-soft);color:#11603B;font-size:20px">🎉 Você acertou: <b>${J.w}</b>!</div><button class="btn okb" data-act="forcanovo">Próxima palavra</button>`
      :perdeu?`<div class="note" style="font-size:20px">Os balões acabaram e o ursinho pousou devagar. A palavra era <b>${J.w}</b>.</div><button class="btn" data-act="forcanovo">Tentar outra</button>`
      :`<div class="teclas">${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l=>`<button data-act="forcaletra" data-arg="${l}" class="${J.certas.has(l)?'cert':J.erradas.has(l)?'err':''}" ${J.certas.has(l)||J.erradas.has(l)?'disabled':''}>${l}</button>`).join('')}</div>`}
  </div>`}
function forcaLetra(l){const J=JG;if(J.fim||J.certas.has(l)||J.erradas.has(l))return;
  if(J.w.includes(l)){J.certas.add(l);somAcerto()}else{J.erradas.add(l);somPop()}
  if([...J.w].every(c=>J.certas.has(c))){J.fim=true;setTimeout(()=>jogoFim(`Muito bem! A palavra é ${J.w.toLowerCase()}!`),300)}
  else if(J.erradas.size>=J.max){J.fim=true;setTimeout(()=>speak(`A palavra era ${J.w.toLowerCase()}. Vamos tentar outra?`),300)}
  app.innerHTML=forcaHTML()}

/* ---------- Motor de arrastar ferramentas (médico e dentista) ----------
   Toque e arraste a ferramenta até o problema. Também funciona tocando na ferramenta e depois no problema.
   Alvos: elementos com data-alvo; cada alvo pede uma ferramenta (need). 'drop' resolve ao soltar; 'scrub' precisa esfregar (hp). */
let dicaT=null,arr=null;
function pedeDica(){clearTimeout(dicaT);const J0=JG;dicaT=setTimeout(()=>{if(S.view!=='jogo'||JG!==J0||!JG||!JG.alvos)return;const a=JG.alvos.find(a=>!a.ok);if(!a)return;
  const f=document.querySelector(`.ferr[data-tool="${a.need}"]`);if(f){f.classList.add('jpisca');speak('Experimente '+a.tnome+'!')}},9000)}
function alvoEm(x,y){const el=document.elementFromPoint(x,y);const t=el&&el.closest('[data-alvo]');return t?JG.alvos.find(a=>a.id===t.dataset.alvo):null}
function aplica(a,tool,x,y,forca){const J=JG;if(!a||a.ok)return;
  if(a.need!==tool){if(forca){somErro();const el=document.querySelector(`[data-alvo="${a.id}"]`);if(el){el.classList.remove('jtreme');void el.offsetWidth;el.classList.add('jtreme')}toast(`Hum... aqui precisa de ${a.tnome}.`)}return}
  if(a.tipo==='scrub'){a.hp-=forca?2:1;somEsfrega();const el=document.querySelector(`[data-alvo="${a.id}"]`);if(el)el.style.opacity=Math.max(.15,a.hp/a.hp0);if(a.hp>0)return}
  a.ok=true;somAcerto();estrelaVoa(x,y);J.pontos=(J.pontos||0)+1;
  if(a.fala)speak(a.fala);
  J.redesenha();pedeDica();
  if(J.alvos.every(a=>a.ok))setTimeout(()=>J.terminou(),700);
}
document.addEventListener('pointerdown',e=>{const f=e.target.closest('.ferr[data-tool]');if(!f||!JG||!JG.alvos)return;e.preventDefault();
  const g=document.createElement('div');g.className='fantasma';g.textContent=f.dataset.ic;document.body.appendChild(g);
  arr={tool:f.dataset.tool,g,x0:e.clientX,y0:e.clientY,mov:false,ult:0};g.style.left=e.clientX+'px';g.style.top=e.clientY+'px';
  document.querySelectorAll('.ferr.jpisca').forEach(x=>x.classList.remove('jpisca'))},{passive:false});
document.addEventListener('pointermove',e=>{if(!arr)return;e.preventDefault();arr.g.style.left=e.clientX+'px';arr.g.style.top=e.clientY+'px';
  if(Math.hypot(e.clientX-arr.x0,e.clientY-arr.y0)>10)arr.mov=true;
  const a=alvoEm(e.clientX,e.clientY);if(a&&a.tipo==='scrub'&&a.need===arr.tool&&Date.now()-arr.ult>90){arr.ult=Date.now();aplica(a,arr.tool,e.clientX,e.clientY,false)}},{passive:false});
document.addEventListener('pointerup',e=>{if(!arr)return;const d=arr;arr=null;d.g.remove();
  if(!d.mov){JG.sel=JG.sel===d.tool?null:d.tool;JG.redesenha();if(JG.sel){const a=JG.alvos.find(a=>a.need===JG.sel&&!a.ok);toast(a?'Agora toque no lugar certo!':'Essa ferramenta não é preciso agora.')}return}
  const a=alvoEm(e.clientX,e.clientY);if(a&&a.tipo!=='scrub')aplica(a,d.tool,e.clientX,e.clientY,true);else if(a&&a.need!==d.tool)aplica(a,d.tool,e.clientX,e.clientY,true)});
document.addEventListener('pointercancel',()=>{if(arr){arr.g.remove();arr=null}});
document.addEventListener('click',e=>{const t=e.target.closest('[data-alvo]');if(!t||!JG||!JG.alvos||!JG.sel)return;const a=JG.alvos.find(a=>a.id===t.dataset.alvo);
  if(a)aplica(a,JG.sel,e.clientX,e.clientY,true)});
const ferrHTML=lista=>`<div class="ferramentas">${lista.map(([tool,ic,nome])=>`<div class="ferr ${JG.sel===tool?'sel':''}" data-tool="${tool}" data-ic="${ic}"><span>${ic}</span><small>${nome}</small></div>`).join('')}</div>`;

/* ---------- Clínica dos bichinhos ---------- */
const PACIENTES=[['🐶','o cachorrinho'],['🐱','o gatinho'],['🐰','o coelhinho'],['🐼','o pandinha'],['🐻','o ursinho'],['🦊','a raposinha'],['🐵','o macaquinho'],['🐷','o porquinho'],['🐨','o coala'],['🐯','o tigrinho'],['🐸','o sapinho'],['🦁','o leãozinho']];
const DOENCAS=[
  {id:'febre',ic:'🥵',txt:'está com febre',need:'termometro',tnome:'o termômetro',fala:'O termômetro mede a febre. Agora um adulto cuida do remédio.'},
  {id:'dodoi',ic:'💢',txt:'tem um dodói',need:'curativo',tnome:'o curativo',fala:'O curativo protege o machucado enquanto ele sara.'},
  {id:'tosse',ic:'😮‍💨',txt:'está tossindo',need:'esteto',tnome:'o estetoscópio',fala:'Com o estetoscópio a gente escuta o coração e o pulmão.'},
  {id:'osso',ic:'🦴',txt:'machucou a pata',need:'raiox',tnome:'o raio-x',fala:'O raio-x mostra os ossos por dentro do corpo.'},
  {id:'vacina',ic:'🛡️',txt:'precisa tomar vacina',need:'vacina',tnome:'a vacina',fala:'A vacina protege o corpo contra doenças.'},
  {id:'olho',ic:'😣',txt:'está com o olho irritado',need:'colirio',tnome:'o colírio',fala:'O colírio limpa e acalma os olhos.'},
  {id:'sujo',ic:'🟤',txt:'se sujou brincando',need:'esponja',tnome:'a esponja',tipo:'scrub',fala:'Lavar com água e sabão tira a sujeira e os germes!'},
];
const FERR_MED=[['termometro','🌡️','Termômetro'],['curativo','🩹','Curativo'],['esteto','🩺','Estetoscópio'],['raiox','🩻','Raio-x'],['vacina','💉','Vacina'],['colirio','💧','Colírio'],['esponja','🧽','Esponja']];
const POS=[[22,24],[78,26],[18,70],[82,72],[50,88],[50,14]];
function novoPaciente(){const ant=JG&&JG.tipo==='medico'?JG:null,[emo,nome]=PACIENTES[Math.floor(Math.random()*PACIENTES.length)];
  const ds=embaralha(DOENCAS).slice(0,Math.random()<.5?2:3),pos=embaralha(POS);let k=0;const alvos=[];
  ds.forEach(d=>{if(d.tipo==='scrub'){for(let i=0;i<3;i++){const[x,y]=pos[k++%pos.length];alvos.push({...d,id:d.id+i,x,y,hp:4,hp0:4,ok:false,fala:i===2?d.fala:''})}}
    else{const[x,y]=pos[k++%pos.length];alvos.push({...d,tipo:'drop',x,y,ok:false})}});
  JG={tipo:'medico',emo,nome,ds,alvos,sel:null,pontos:ant?ant.pontos:0,atendidos:ant?ant.atendidos:0,feliz:false,
    redesenha:()=>desenhaClinica(),terminou:()=>{JG.feliz=true;JG.atendidos++;desenhaClinica();jogoFim(`${cap1(nome)} está curado! Obrigado, doutora!`)}};
}
function desenhaClinica(chegou){const J=JG;
  app.innerHTML=jogoTopo('🩺 Clínica dos bichinhos',`<span class="pill ok" style="font-size:16px">🐾 ${J.atendidos} atendidos</span>`)+
  `<div class="card col" style="align-items:center;gap:8px;text-align:center;margin-top:10px">
    <div class="note" style="margin:0;font-size:18px">${J.feliz?`😊 ${cap1(J.nome)} está ótimo! Obrigado!`:`${cap1(J.nome)} ${J.ds.map(d=>d.txt).join(' e ')}. Arraste a ferramenta certa até cada problema.`}</div>
    <div style="position:relative;width:min(340px,86vw);aspect-ratio:1;background:radial-gradient(circle at 50% 55%,#E7F0FF 0 55%,#fff 56%);border-radius:28px;border:4px solid #DCE4FF">
      <div class="${chegou?'jpop':''} ${J.feliz?'jflutua':''}" style="position:absolute;left:50%;top:52%;translate:-50% -50%;font-size:min(150px,36vw);line-height:1">${J.emo}</div>
      ${J.feliz?'<div class="jpop" style="position:absolute;right:8%;top:6%;font-size:48px">💖</div>':J.alvos.map(a=>`<div class="alvo ${a.ok?'ok':''}" data-alvo="${a.id}" style="left:${a.x}%;top:${a.y}%">${a.ok?'✅':a.ic}</div>`).join('')}
    </div>
    ${J.feliz?'<button class="btn okb" data-act="mednovo">Próximo paciente ➡️</button>':ferrHTML(embaralha(FERR_MED.filter(f=>J.alvos.some(a=>a.need===f[0]))).concat(embaralha(FERR_MED.filter(f=>!J.alvos.some(a=>a.need===f[0]))).slice(0,2)).sort((a,b)=>a[0]<b[0]?-1:1))}
  </div>`;
  if(chegou){speak(`${cap1(J.nome)} ${J.ds.map(d=>d.txt).join(' e ')}. Vamos ajudar?`);pedeDica()}
}

/* ---------- Dentista ---------- */
const PAC_DENTE=[['🐊','o jacaré'],['🦛','o hipopótamo'],['🐴','o cavalinho'],['🦈','o tubarão'],['🐶','o cachorrinho'],['🐻','o ursinho'],['🦁','o leãozinho'],['🐭','o ratinho']];
const DENTE_PROB=[
  {id:'sujo',ic:'🦠',txt:'dentes sujos',need:'escova',tnome:'a escova',tipo:'scrub',fala:'Escovar tira os restos de comida e os germes.'},
  {id:'carie',ic:'⚫',txt:'uma cárie',need:'broca',tnome:'a broca',fala:'A cárie foi limpa e o dente foi consertado!'},
  {id:'comida',ic:'🌽',txt:'comida entre os dentes',need:'fio',tnome:'o fio dental',fala:'O fio dental limpa onde a escova não alcança.'},
  {id:'mole',ic:'🦷',txt:'um dente de leite mole',need:'pinca',tnome:'a pinça',fala:'O dente de leite saiu! Logo nasce um dente novo.'},
];
const FERR_DENTE=[['escova','🪥','Escova'],['fio','🧵','Fio dental'],['broca','🌀','Broca'],['pinca','🥢','Pinça'],['agua','💦','Água']];
const DICAS_DENTE=['Escove os dentes depois de comer e antes de dormir.','Use o fio dental todos os dias.','Doce demais ajuda a fazer cárie.','Vá ao dentista para uma consulta, mesmo sem dor.','Troque a escova quando as cerdas ficarem abertas.'];
function novoDente(){const ant=JG&&JG.tipo==='dentista'?JG:null,[emo,nome]=PAC_DENTE[Math.floor(Math.random()*PAC_DENTE.length)];
  const nd=12,dentes=embaralha([...Array(nd).keys()]),ps=embaralha(DENTE_PROB).slice(0,3);if(!ps.some(p=>p.id==='sujo'))ps[0]=DENTE_PROB[0];
  const alvos=[];let k=0;
  ps.forEach(p=>{const n=p.id==='sujo'?3:1;for(let i=0;i<n;i++){const d=dentes[k++];alvos.push({...p,id:p.id+i,dente:d,tipo:p.tipo||'drop',hp:5,hp0:5,ok:false,fala:i===n-1?p.fala:''})}});
  alvos.push({id:'enxague',ic:'💦',txt:'',need:'agua',tnome:'a água',tipo:'drop',dente:-1,ok:false,fala:'Agora bochecha com água. Prontinho!',final:true});
  JG={tipo:'dentista',emo,nome,ps,alvos,sel:null,atendidos:ant?ant.atendidos:0,feliz:false,
    redesenha:()=>desenhaDente(),terminou:()=>{JG.feliz=true;JG.atendidos++;desenhaDente();jogoFim(`Dentes brilhando! ${DICAS_DENTE[Math.floor(Math.random()*DICAS_DENTE.length)]}`)}};
}
function desenhaDente(chegou){const J=JG,pend=J.alvos.filter(a=>!a.ok&&!a.final),soFinal=!pend.length&&!J.feliz;
  const dente=i=>{const a=J.alvos.find(a=>a.dente===i),tira=a&&a.need==='pinca'&&a.ok,mole=a&&a.need==='pinca'&&!a.ok;
    return `<div style="position:relative;width:100%;aspect-ratio:3/4;background:${tira?'#F7A8B8':'#fff'};border-radius:${i<6?'10px 10px 22px 22px':'22px 22px 10px 10px'};border:2px solid #E3E8F2;box-shadow:inset 0 -6px 0 #EEF2F8" class="${mole?'jmole':''}">
      ${a&&!a.ok?`<div class="alvo" data-alvo="${a.id}" style="left:50%;top:50%;font-size:clamp(18px,5vw,28px);padding:2px;${a.tipo==='scrub'?`opacity:${Math.max(.15,a.hp/a.hp0)}`:''}">${a.ic}</div>`:''}
      ${a&&a.ok&&!tira?'<div class="jpop" style="position:absolute;left:50%;top:50%;translate:-50% -50%;font-size:20px">✨</div>':''}</div>`};
  app.innerHTML=jogoTopo('🦷 Dentista',`<span class="pill ok" style="font-size:16px">😁 ${J.atendidos} sorrisos</span>`)+
  `<div class="card col" style="align-items:center;gap:8px;text-align:center;margin-top:10px">
    <div class="note" style="margin:0;font-size:18px">${J.feliz?`😁 ${cap1(J.nome)} saiu sorrindo!`:soFinal?'Muito bem! Agora arraste a 💦 água até a boca para o bochecho.':`${J.emo} ${cap1(J.nome)} tem ${J.ps.map(p=>p.txt).join(', ')}. Arraste a ferramenta certa até cada dente.`}</div>
    <div style="font-size:64px;line-height:1" class="${chegou?'jpop':''}">${J.emo}</div>
    <div ${soFinal?'data-alvo="enxague"':''} class="${soFinal?'jpisca':''}" style="width:min(420px,92vw);background:#C2185B;border-radius:44% 44% 48% 48%/30% 30% 70% 70%;padding:18px 18px 26px;position:relative">
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px">${[0,1,2,3,4,5].map(dente).join('')}</div>
      <div style="height:40px;background:#8E1043;border-radius:50%;margin:6px 10px;display:flex;align-items:center;justify-content:center;font-size:26px">${J.feliz?'✨😁✨':soFinal?'💦':'👅'}</div>
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px">${[6,7,8,9,10,11].map(dente).join('')}</div>
    </div>
    ${J.feliz?'<button class="btn okb" data-act="dentnovo">Próximo paciente ➡️</button>':ferrHTML(FERR_DENTE)}
  </div>`;
  if(chegou){speak(`${cap1(J.nome)} tem ${J.ps.map(p=>p.txt).join(', ')}. Vamos ajudar?`);pedeDica()}
}

/* ---------- Desenho de cabeça para baixo + ilusão "dois rostos ou uma taça?" ----------
   Técnica de desenho: copiar uma figura virada ao contrário ajuda a desenhar o que se vê. Desenhos originais, feitos aqui. */
const MODELOS=[
  ['Casa','<path d="M30 110 L100 45 L170 110 M45 98 V175 H155 V98 M85 175 V130 H115 V175 M120 105 H145 V128 H120 Z"/>'],
  ['Peixe','<path d="M30 100 C70 50 130 50 160 100 C130 150 70 150 30 100 Z M160 100 L190 70 V130 Z"/><circle cx="65" cy="92" r="6"/><path d="M95 75 C105 95 105 105 95 125"/>'],
  ['Estrela','<path d="M100 25 L120 80 L178 80 L131 113 L149 170 L100 136 L51 170 L69 113 L22 80 L80 80 Z"/>'],
  ['Barco','<path d="M30 130 H170 L145 165 H55 Z M100 130 V35 L150 115 H100 M100 45 L60 115 H100"/>'],
  ['Árvore','<path d="M90 180 V125 H110 V180 M100 125 C40 130 35 70 70 60 C70 25 130 25 130 60 C165 70 160 130 100 125"/>'],
  ['Gato','<circle cx="100" cy="110" r="55"/><path d="M58 75 L62 30 L90 58 M142 75 L138 30 L110 58 M88 120 L100 128 L112 120 M60 115 H25 M60 125 L28 135 M140 115 H175 M140 125 L172 135"/><circle cx="80" cy="100" r="5"/><circle cx="120" cy="100" r="5"/>'],
  ['Flor','<circle cx="100" cy="70" r="16"/><circle cx="100" cy="35" r="18"/><circle cx="135" cy="70" r="18"/><circle cx="100" cy="105" r="18"/><circle cx="65" cy="70" r="18"/><path d="M100 123 V185 M100 160 C80 140 65 150 60 160 C80 165 95 162 100 160"/>'],
  ['Sorvete','<path d="M65 95 L100 185 L135 95 Z M70 95 C55 60 85 40 100 55 C115 40 145 60 130 95 M80 120 L120 150 M120 120 L80 150"/>'],
];
const CORES_D=['#1D2846','#E5484D','#3557E8','#1F9D61','#FFB020','#9B51E0'];
function novoDesenho(i){const k=i==null?Math.floor(Math.random()*MODELOS.length):i;JG={tipo:'desenho',k,virado:false,cor:CORES_D[0],tracos:[]}}
function desenhoHTML(){const J=JG,[nome,svg]=MODELOS[J.k];
  return jogoTopo('🙃 Desenho de cabeça para baixo',`<button class="btn small ghost" data-act="ilusao">👀 Ilusão</button>`)+
  `<div class="card col" style="align-items:center;gap:10px;text-align:center;margin-top:10px">
   <div class="note" style="margin:0;font-size:17px">${J.virado?`Olha só o seu desenho de <b>${nome.toLowerCase()}</b>! Ficou parecido?`:'Copie o desenho do jeitinho que você vê, <b>de cabeça para baixo</b>. Não tente adivinhar o que é: só copie as linhas!'}</div>
   <div class="row" style="gap:12px;justify-content:center;flex-wrap:wrap">
     <div style="background:#fff;border:3px solid #D5DDEE;border-radius:18px;padding:6px"><div class="muted" style="font-size:13px">Modelo</div>
       <svg viewBox="0 0 200 200" style="width:min(150px,38vw);transition:transform .8s;transform:rotate(${J.virado?0:180}deg)"><g fill="none" stroke="#1D2846" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${svg}</g></svg></div>
     <div style="background:#fff;border:3px solid var(--pri);border-radius:18px;padding:6px"><div class="muted" style="font-size:13px">Seu desenho</div>
       <canvas id="tela" width="600" height="600" style="width:min(320px,78vw);height:min(320px,78vw);touch-action:none;border-radius:12px;background:#FFFDF6;transition:transform .8s;transform:rotate(${J.virado?180:0}deg)"></canvas></div>
   </div>
   <div class="row" style="gap:8px;justify-content:center">${CORES_D.map(c=>`<button data-act="dcor" data-arg="${c}" aria-label="cor" style="width:40px;height:40px;border-radius:50%;background:${c};border:${J.cor===c?'4px solid #FFB020':'3px solid #fff'};box-shadow:0 0 0 1px #ccd"></button>`).join('')}
     <button class="btn small ghost" data-act="dapaga">🧽 Apagar</button></div>
   <div class="row" style="gap:10px;justify-content:center">${J.virado?'<button class="btn" data-act="dvira">🙃 Desvirar</button><button class="btn okb" data-act="dnovo">Outro desenho ➡️</button>':'<button class="btn okb" data-act="dvira">🔄 Virar e comparar</button><button class="btn small ghost" data-act="dnovo">Trocar desenho</button>'}</div>
  </div>`}
function telaRedesenha(){const c=document.getElementById('tela');if(!c)return;const g=c.getContext('2d');g.clearRect(0,0,600,600);g.lineCap='round';g.lineJoin='round';g.lineWidth=12;
  for(const t of JG.tracos){g.strokeStyle=t.cor;g.beginPath();t.p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));if(t.p.length===1)g.lineTo(t.p[0][0]+.1,t.p[0][1]);g.stroke()}}
function abreDesenho(){app.innerHTML=desenhoHTML();telaRedesenha();const c=document.getElementById('tela');let atual=null;
  const pos=e=>{const r=c.getBoundingClientRect();let x=(e.clientX-r.left)/r.width*600,y=(e.clientY-r.top)/r.height*600;if(JG.virado){x=600-x;y=600-y}return[x,y]};
  c.addEventListener('pointerdown',e=>{e.preventDefault();c.setPointerCapture(e.pointerId);atual={cor:JG.cor,p:[pos(e)]};JG.tracos.push(atual);telaRedesenha()});
  c.addEventListener('pointermove',e=>{if(!atual)return;e.preventDefault();atual.p.push(pos(e));telaRedesenha()});
  const fim=()=>{atual=null};c.addEventListener('pointerup',fim);c.addEventListener('pointercancel',fim)}
/* Ilusão: perfil desenhado aqui (pontos x,y); o rosto da direita é o espelho. O espaço branco entre eles forma uma taça. */
const PERFIL=[[64,0],[66,30],[72,62],[66,78],[70,88],[90,104],[74,114],[80,122],[72,128],[78,136],[68,146],[74,160],[66,176],[60,196],[58,240]];
function ilusaoHTML(){const esq='M0 0 '+PERFIL.map(([x,y])=>`L${x} ${y}`).join(' ')+' L0 240 Z',dir='M200 0 '+PERFIL.map(([x,y])=>`L${200-x} ${y}`).join(' ')+' L200 240 Z';
  return jogoTopo('👀 Ilusão de ótica',`<button class="btn small ghost" data-act="jogo" data-arg="desenho">🙃 Desenhar</button>`)+
  `<div class="card col" style="align-items:center;gap:10px;text-align:center;margin-top:10px">
   <div class="note" style="margin:0;font-size:18px">O que você vê? <b>Dois rostos</b> olhando um para o outro ou <b>uma taça</b>?</div>
   <svg viewBox="0 0 200 240" style="width:min(300px,80vw);border-radius:16px;border:3px solid #D5DDEE;background:#fff"><path d="${esq}" fill="#2B3A67" stroke="#2B3A67" stroke-linejoin="round" stroke-width="3"/><path d="${dir}" fill="#2B3A67" stroke="#2B3A67" stroke-linejoin="round" stroke-width="3"/></svg>
   <div class="row" style="gap:10px;justify-content:center"><button class="btn" data-act="ilresp" data-arg="rostos">👥 Dois rostos</button><button class="btn" data-act="ilresp" data-arg="taca">🏆 Uma taça</button></div>
   <div id="ilfb"></div></div>`}
/* ---------- Ações ---------- */
Object.assign(ACT,{
  jogos(){renderJogos()},
  jogo(t){S.view='jogo';clearTimeout(dicaT);if(t==='caca'){novoCaca();app.innerHTML=cacaHTML()}else if(t==='memoria'){novaMemoria();app.innerHTML=memoriaHTML()}else if(t==='forca'){novaForca();app.innerHTML=forcaHTML()}else if(t==='medico'){novoPaciente();desenhaClinica(true)}else if(t==='dentista'){novoDente();desenhaDente(true)}else if(t==='desenho'){novoDesenho();abreDesenho()}else{novoSudoku(1);app.innerHTML=sudokuHTML()}window.scrollTo(0,0)},
  cacaletra(a){cacaToque(a)},cacanovo(){novoCaca(JG.tid);app.innerHTML=cacaHTML()},cacatema(t){novoCaca(t);app.innerHTML=cacaHTML()},
  memcarta(i){memoriaToque(i)},memnovo(){novaMemoria(JG.modo);app.innerHTML=memoriaHTML()},memmodo(m){novaMemoria(m);app.innerHTML=memoriaHTML()},
  forcaletra(l){forcaLetra(l)},forcanovo(){novaForca(JG.tid);app.innerHTML=forcaHTML()},forcatema(t){novaForca(t);app.innerHTML=forcaHTML()},
  forcafala(){speak(`Tema: ${JOGO_TEMAS[JG.tid].nome}. A palavra tem ${JG.w.length} letras.`)},
  mednovo(){novoPaciente();desenhaClinica(true)},dentnovo(){novoDente();desenhaDente(true)},
  dcor(c){JG.cor=c;document.querySelectorAll('[data-act=dcor]').forEach(b=>b.style.border=b.dataset.arg===c?'4px solid #FFB020':'3px solid #fff')},
  dapaga(){JG.tracos=[];telaRedesenha()},dvira(){JG.virado=!JG.virado;const tr=JG.tracos;app.innerHTML=desenhoHTML();JG.tracos=tr;abreDesenho();if(JG.virado){somVitoria();if(JG.tracos.length>3){ganhaEstrela();speak('Que legal! Veja o seu desenho do lado certo.')}}},
  dnovo(){novoDesenho((JG.k+1+Math.floor(Math.random()*(MODELOS.length-1)))%MODELOS.length);abreDesenho()},
  ilusao(){S.view='jogo';JG={tipo:'ilusao'};app.innerHTML=ilusaoHTML()},
  ilresp(){const d=document.getElementById('ilfb');if(d)d.innerHTML='<div class="note jpop" style="background:var(--ok-soft);color:#11603B;font-size:18px">🎉 As duas respostas estão certas! Se você olha para a parte escura, vê dois rostos. Se olha para a parte branca do meio, vê uma taça. O nosso olho escolhe o que ver!</div>';somAcerto();speak('As duas respostas estão certas! Olhando a parte escura, você vê dois rostos. Olhando a parte branca, você vê uma taça.')},
  sudocel(k){JG.sel=Number(k);JG.erro=null;app.innerHTML=sudokuHTML()},sudofig(i){sudokuFig(i)},sudonovo(){novoSudoku(JG.nivel);app.innerHTML=sudokuHTML()},sudonivel(n){novoSudoku(Number(n));app.innerHTML=sudokuHTML()},
});

/* app.js desenha a tela inicial antes deste arquivo carregar: redesenha para mostrar os jogos */
if(S.view==='map'&&!R)renderMap();
