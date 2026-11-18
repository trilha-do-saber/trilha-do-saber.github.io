/* Trilha do Saber · jogos do tempo livre: caça-palavras, jogo da memória e sudoku de figuras.
   Os jogos não contam como tempo de estudo e só aparecem quando o tempo livre está aberto.
   As palavras ficam em JOGO_TEMAS (conteudo.js). */
let JG=null;
const embaralha=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const jogoTopo=(titulo,extra='')=>`<div class="top"><button class="btn ghost small" data-act="jogos">⬅ Jogos</button><h1 class="hello" style="font-size:26px">${titulo}</h1><div class="spacer"></div>${extra}</div>`;
function jogoFim(msg){confetti();speak(msg);toast(msg)}

function jogosHTML(){
  return `<h2 style="font-size:24px;margin:0 0 10px">🎮 Jogos</h2><div class="cards2">
    <button class="mini" data-act="jogo" data-arg="caca"><span class="ic">🔎</span><span><b>Caça-palavras</b><small>Ache as palavras escondidas</small></span></button>
    <button class="mini" data-act="jogo" data-arg="memoria"><span class="ic">🃏</span><span><b>Jogo da memória</b><small>Encontre os pares</small></span></button>
    <button class="mini" data-act="jogo" data-arg="sudoku"><span class="ic">🧩</span><span><b>Sudoku das figuras</b><small>Cada figura uma vez em cada linha</small></span></button></div>`;
}
function renderJogos(){S.view='jogo';JG=null;
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

/* ---------- Ações ---------- */
Object.assign(ACT,{
  jogos(){renderJogos()},
  jogo(t){S.view='jogo';if(t==='caca'){novoCaca();app.innerHTML=cacaHTML()}else if(t==='memoria'){novaMemoria();app.innerHTML=memoriaHTML()}else{novoSudoku(1);app.innerHTML=sudokuHTML()}window.scrollTo(0,0)},
  cacaletra(a){cacaToque(a)},cacanovo(){novoCaca(JG.tid);app.innerHTML=cacaHTML()},cacatema(t){novoCaca(t);app.innerHTML=cacaHTML()},
  memcarta(i){memoriaToque(i)},memnovo(){novaMemoria(JG.modo);app.innerHTML=memoriaHTML()},memmodo(m){novaMemoria(m);app.innerHTML=memoriaHTML()},
  sudocel(k){JG.sel=Number(k);JG.erro=null;app.innerHTML=sudokuHTML()},sudofig(i){sudokuFig(i)},sudonovo(){novoSudoku(JG.nivel);app.innerHTML=sudokuHTML()},sudonivel(n){novoSudoku(Number(n));app.innerHTML=sudokuHTML()},
});

/* app.js desenha a tela inicial antes deste arquivo carregar: redesenha para mostrar os jogos */
if(S.view==='map'&&!R)renderMap();
