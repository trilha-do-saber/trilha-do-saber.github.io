/* Trilha do Saber · CONTEÚDO DAS LIÇÕES
   Para criar lições novas, edite este arquivo. */
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const rep=(e,n)=>Array(Math.max(0,n)).fill(e).join('');
const cap1=s=>s.charAt(0).toUpperCase()+s.slice(1);

function blocksHTML(t,u){
  let h='<div class="blocks">';
  for(let i=0;i<t;i++) h+='<div class="ten">'+rep('<i></i>',10)+'</div>';
  if(u>0) h+='<div class="ones">'+rep('<i></i>',u)+'</div>';
  return h+'</div>';
}
function numline(arr,hiIdx){return '<div class="numline">'+arr.map((v,i)=>`<b class="${v==='?'?'q':(i===hiIdx?'hi':'')}">${v}</b>`).join('')+'</div>'}
function cols(a,b,op,res){return `<div class="conta"><div>${a}</div><div><span class="op">${op}</span>${b}</div><div class="linha"></div><div>${res==null?'?':res}</div></div>`}

function opts(ans,cands){
  const m=new Map([[ans,null]]);
  for(const c of cands){ if(m.size>=3)break; if(Number.isInteger(c.v)&&c.v>=0&&c.v<=100&&!m.has(c.v)) m.set(c.v,c.type); }
  let g=0; while(m.size<3&&g++<60){const v=ans+pick([-3,-2,2,3,11,-11]); if(v>=0&&v<=100&&!m.has(v)) m.set(v,'outro erro');}
  return shuffle([...m].map(([v,type])=>({v,label:String(v),type,ok:v===ans})));
}
const NOMES=['a Bia','o Léo','a Duda','o Theo','a Malu','o Davi','a Lara','o Gui'];
const COISAS=[['figurinhas'],['bolinhas de gude'],['adesivos'],['lápis de cor'],['balas']];
function twoNums(){
  let a,b;
  if(Math.random()<.4){const t=rnd(1,9);a=t*10+rnd(0,9);do{b=t*10+rnd(0,9)}while(b===a)}
  else{do{a=rnd(10,99);b=rnd(10,99)}while(a===b||Math.floor(a/10)===Math.floor(b/10))}
  return [a,b];
}
function compareQ(kind){
  const [a,b]=twoNums(),M=Math.max(a,b),m=Math.min(a,b),target=kind==='maior'?M:m,other=kind==='maior'?m:M;
  const sameT=Math.floor(a/10)===Math.floor(b/10);
  const wt=(!sameT&&(other%10>target%10)===(kind==='maior'))?'olhou a unidade antes da dezena':(kind==='maior'?'escolheu o menor':'escolheu o maior');
  return {skill:'Comparar números',text:kind==='maior'?'Qual é o número MAIOR?':'Qual é o número MENOR?',visual:'',desc:`${kind} entre ${a} e ${b}`,
    options:[a,b].map(v=>({v,label:String(v),ok:v===target,type:v===target?null:wt})),
    hint:'Olhe primeiro as dezenas. Se forem iguais, olhe as unidades.',
    explain:sameT?`As dezenas são iguais, então olhamos as unidades: ${target%10} contra ${other%10}. O ${kind} é ${target}.`
                 :`${Math.floor(target/10)} dezenas contra ${Math.floor(other/10)} dezenas. O ${kind} é ${target}.`};
}
const GEN={
  blocks(){const t=rnd(1,8),u=rnd(0,9),n=t*10+u;return{skill:'Ler números com blocos',text:'Que número os blocos mostram?',visual:blocksHTML(t,u),desc:`${t} dezenas e ${u} unidades`,
    options:opts(n,[{v:u*10+t,type:'trocou dezena com unidade'},{v:n+10,type:'contou dezenas errado'},{v:n-1,type:'contou unidades errado'},{v:n+1,type:'contou unidades errado'}]),
    hint:'Conte as barras de 10 em 10. Depois continue contando os cubinhos soltos.',explain:`São ${t} dezenas, que dão ${t*10}, e mais ${u} unidades. ${t*10} mais ${u} é ${n}.`}},
  quantasDez(){const n=rnd(12,98),t=Math.floor(n/10),u=n%10;return{skill:'Dezenas e unidades',text:`Quantas dezenas tem o número ${n}?`,visual:`<div class="big"><span class="cd">${t}</span><span class="cu">${u}</span></div>`,desc:`dezenas de ${n}`,
    options:opts(t,[{v:u,type:'confundiu dezena com unidade'},{v:t+1,type:'errou por 1'},{v:t-1,type:'errou por 1'}]),
    hint:'As dezenas ficam no primeiro algarismo, o da esquerda.',explain:`No ${n}, o ${t} está no lugar das dezenas. São ${t} dezenas.`}},
  quantasUni(){const n=rnd(12,98),t=Math.floor(n/10),u=n%10;return{skill:'Dezenas e unidades',text:`Quantas unidades soltas tem o número ${n}?`,visual:`<div class="big"><span class="cd">${t}</span><span class="cu">${u}</span></div>`,desc:`unidades de ${n}`,
    options:opts(u,[{v:t,type:'confundiu dezena com unidade'},{v:u+1,type:'errou por 1'},{v:u+2,type:'errou por 2'}]),
    hint:'As unidades ficam no último algarismo, o da direita.',explain:`No ${n}, o ${u} está no lugar das unidades. São ${u} unidades.`}},
  build(){const t=rnd(1,6),u=rnd(1,9),n=t*10+u;return{kind:'build',skill:'Montar números',target:n,t,u,text:`Monte o número ${n}`,desc:`montar ${n}`,
    hint:`O ${n} tem ${t} dezenas e ${u} unidades.`,explain:`Para o ${n} usamos ${t} barras de dez e ${u} cubinhos.`}},
  depois(){const n=Math.random()<.4?rnd(1,9)*10-1:rnd(5,98),a=n+1;return{skill:'Antes e depois',text:`Qual número vem logo depois do ${n}?`,visual:numline([n,'?']),desc:`depois de ${n}`,
    options:opts(a,[{v:n-1,type:'confundiu antes com depois'},{v:n+10,type:'pulou uma dezena'},{v:n+2,type:'errou por 1'}]),
    hint:'Depois é um a mais. Conte mais um.',explain:n%10===9?`Depois do ${n} a dezena muda: vem o ${a}.`:`Um a mais que ${n} é ${a}.`}},
  antes(){const n=Math.random()<.4?rnd(1,9)*10:rnd(6,99),a=n-1;return{skill:'Antes e depois',text:`Qual número vem logo antes do ${n}?`,visual:numline(['?',n]),desc:`antes de ${n}`,
    options:opts(a,[{v:n+1,type:'confundiu antes com depois'},{v:n-10,type:'pulou uma dezena'},{v:n-2,type:'errou por 1'}]),
    hint:'Antes é um a menos. Conte para trás.',explain:n%10===0?`Antes do ${n} vem o ${a}: a dezena anterior termina no 9.`:`Um a menos que ${n} é ${a}.`}},
  seq(){const a=rnd(1,94),r=a+3;return{skill:'Antes e depois',text:'Qual número completa a fila?',visual:numline([a,a+1,a+2,'?']),desc:`sequência ${a}, ${a+1}, ${a+2}, ?`,
    options:opts(r,[{v:a+2,type:'repetiu o último'},{v:a+4,type:'errou por 1'},{v:a+13,type:'pulou uma dezena'}]),
    hint:'Cada número é um a mais que o anterior.',explain:`Depois do ${a+2} vem o ${r}.`}},
  maior(){return compareQ('maior')},
  menor(){return compareQ('menor')},
  somaPequena(){const a=rnd(1,6),b=rnd(1,4),s=a+b;return{skill:'Somar',text:`Quantas maçãs ao todo?`,visual:`<div class="emo">${rep('🍎',a)}<span class="op">+</span>${rep('🍎',b)}</div>`,desc:`${a} + ${b}`,
    options:opts(s,[{v:s+1,type:'errou a contagem'},{v:s-1,type:'errou a contagem'},{v:a,type:'não juntou os grupos'}]),
    hint:'Junte os dois grupos e conte todas.',explain:`${a} mais ${b} dá ${s}.`}},
  soma2(){const a1=rnd(1,7),b1=rnd(1,8-a1),a0=rnd(0,8),b0=rnd(0,9-a0),a=a1*10+a0,b=b1*10+b0,s=a+b;return{skill:'Somar dezenas e unidades',text:`Quanto é ${a} mais ${b}?`,visual:cols(a,b,'+'),desc:`${a} + ${b}`,
    options:opts(s,[{v:s+10,type:'errou nas dezenas'},{v:s-10,type:'errou nas dezenas'},{v:s+1,type:'errou nas unidades'},{v:a-b,type:'subtraiu em vez de somar'}]),
    hint:'Some primeiro as unidades. Depois some as dezenas.',explain:`Unidades: ${a0} mais ${b0} dá ${a0+b0}. Dezenas: ${a1} mais ${b1} dá ${a1+b1}. Resultado: ${s}.`}},
  somaHist(){const n=pick(NOMES),c=pick(COISAS)[0],a0=rnd(0,6),a=rnd(1,4)*10+a0,b=rnd(1,9-a0),s=a+b;return{skill:'Problemas de somar',text:`${cap1(n)} tinha ${a} ${c} e ganhou mais ${b}. Com quantas ficou?`,visual:cols(a,b,'+'),desc:`${a} + ${b} (história)`,
    options:opts(s,[{v:a-b,type:'subtraiu em vez de somar'},{v:s+1,type:'errou nas unidades'},{v:s+10,type:'errou nas dezenas'}]),
    hint:'Ganhou mais quer dizer juntar: é uma conta de mais.',explain:`${a} mais ${b} dá ${s}.`}},
  subPequena(){const a=rnd(4,9),b=rnd(1,a-1),r=a-b;return{skill:'Subtrair',text:`Tinha ${a} balões e ${b} voaram. Quantos ficaram?`,visual:`<div class="emo">${rep('🎈',r)}<span class="fly">${rep('🎈',b)}</span></div>`,desc:`${a} − ${b}`,
    options:opts(r,[{v:a+b,type:'somou em vez de subtrair'},{v:r+1,type:'errou a contagem'},{v:b,type:'respondeu os que voaram'}]),
    hint:'Comece com todos e tire os que voaram.',explain:`${a} menos ${b} dá ${r}.`}},
  sub2(){const a1=rnd(2,9),b1=rnd(1,a1-1),a0=rnd(1,9),b0=rnd(0,a0),a=a1*10+a0,b=b1*10+b0,r=a-b;return{skill:'Subtrair dezenas e unidades',text:`Quanto é ${a} menos ${b}?`,visual:cols(a,b,'−'),desc:`${a} − ${b}`,
    options:opts(r,[{v:a+b,type:'somou em vez de subtrair'},{v:r+10,type:'errou nas dezenas'},{v:r-1,type:'errou nas unidades'},{v:r+1,type:'errou nas unidades'}]),
    hint:'Tire primeiro as unidades. Depois tire as dezenas.',explain:`Unidades: ${a0} menos ${b0} dá ${a0-b0}. Dezenas: ${a1} menos ${b1} dá ${a1-b1}. Resultado: ${r}.`}},
  subHist(){const n=pick(NOMES),c=pick(COISAS)[0],a0=rnd(3,9),a=rnd(1,5)*10+a0,b=rnd(1,a0),r=a-b;return{skill:'Problemas de subtrair',text:`${cap1(n)} tinha ${a} ${c} e deu ${b} para um amigo. Com quantas ficou?`,visual:cols(a,b,'−'),desc:`${a} − ${b} (história)`,
    options:opts(r,[{v:a+b,type:'somou em vez de subtrair'},{v:r+1,type:'errou nas unidades'},{v:r-10,type:'errou nas dezenas'}]),
    hint:'Deu para alguém quer dizer tirar: é uma conta de menos.',explain:`${a} menos ${b} dá ${r}.`}},
};

const SUBJECTS=[
  {id:'mat',nome:'Matemática',ic:'🔢',ano:'2º ano',ready:true},
  {id:'por',nome:'Português',ic:'📖',ano:'em breve'},
  {id:'cie',nome:'Ciências',ic:'🌱',ano:'em breve'},
  {id:'his',nome:'História',ic:'🏛️',ano:'em breve'},
  {id:'geo',nome:'Geografia',ic:'🗺️',ano:'em breve'},
  {id:'mem',nome:'Memória',ic:'🎵',ano:'em breve'},
];
const MAT_LESSONS=[
  {id:'dez-uni',titulo:'Dezenas e unidades',icone:'🧱',bncc:'EF02MA01',
   slides:[
    {t:'Quando temos muitas coisas para contar, juntamos de 10 em 10. Um grupo de 10 se chama dezena.',v:blocksHTML(1,0)+'<div class="cap">1 dezena = 10 unidades</div>'},
    {t:'Cada pecinha solta se chama unidade. Aqui temos 4 unidades.',v:blocksHTML(0,4)},
    {t:'Juntando 2 dezenas e 3 unidades, formamos o número 23. O 2 conta as dezenas e o 3 conta as unidades.',v:blocksHTML(2,3)+'<div><span class="cd">2</span><span class="cu">3</span></div>'}],
   practice:['build','blocks','quantasDez','build','quantasUni','blocks'],
   quiz:['blocks','quantasDez','quantasUni','blocks','quantasDez']},
  {id:'vizinhos',titulo:'Antes e depois',icone:'👣',bncc:'EF02MA01',
   slides:[
    {t:'Os números andam em fila. O número que vem logo depois é sempre um a mais.',v:numline([14,15,16],1)},
    {t:'O número que vem logo antes é sempre um a menos. Antes do 30 vem o 29.',v:numline([29,30],0)},
    {t:'Atenção! Depois do 39 vem o 40. Quando as unidades chegam no 9, começa a próxima dezena.',v:numline([38,39,40],2)}],
   practice:['depois','antes','seq','depois','antes','seq'],
   quiz:['depois','antes','seq','depois','antes']},
  {id:'comparar',titulo:'Maior ou menor',icone:'⚖️',bncc:'EF02MA01',
   slides:[
    {t:'Para saber qual número é maior, olhe primeiro as dezenas. 42 tem 4 dezenas e 38 tem só 3. Então 42 é maior.',v:`<div class="vs"><div>${blocksHTML(4,2)}<b>42</b></div><div>${blocksHTML(3,8)}<b>38</b></div></div>`},
    {t:'Se as dezenas forem iguais, olhe as unidades. 56 e 53 têm 5 dezenas, mas 6 é mais que 3. Então 56 é maior.',v:'<div class="big">56 &gt; 53</div>'}],
   practice:['maior','menor','maior','menor','maior','menor'],
   quiz:['maior','menor','maior','menor','maior']},
  {id:'soma',titulo:'Somar sem reserva',icone:'➕',bncc:'EF02MA06',
   slides:[
    {t:'Somar é juntar. 3 maçãs mais 2 maçãs dá 5 maçãs.',v:'<div class="emo">🍎🍎🍎<span class="op">+</span>🍎🍎</div><div class="big">= 5</div>'},
    {t:'Com números maiores, juntamos unidades com unidades e dezenas com dezenas. 23 mais 14: 3 mais 4 dá 7, e 2 mais 1 dá 3. O resultado é 37.',v:cols(23,14,'+',37)}],
   practice:['somaPequena','somaPequena','soma2','soma2','somaHist','soma2'],
   quiz:['soma2','somaHist','soma2','somaPequena','soma2']},
  {id:'sub',titulo:'Subtrair sem reserva',icone:'➖',bncc:'EF02MA06',
   slides:[
    {t:'Subtrair é tirar. Tinha 5 balões e 2 voaram. Ficaram 3.',v:'<div class="emo">🎈🎈🎈<span class="fly">🎈🎈</span></div><div class="big">5 − 2 = 3</div>'},
    {t:'Com números maiores, tiramos unidades das unidades e dezenas das dezenas. 38 menos 15: 8 menos 5 dá 3, e 3 menos 1 dá 2. O resultado é 23.',v:cols(38,15,'−',23)}],
   practice:['subPequena','subPequena','sub2','sub2','subHist','sub2'],
   quiz:['sub2','subHist','sub2','subPequena','sub2']},
];

/* ---------------- PORTUGUÊS · 2º ano ---------------- */
const PALAVRAS=[ // palavra separada em sílabas + figura
  ['GA-TO','🐱'],['BO-LA','⚽'],['CA-SA','🏠'],['SA-PA-TO','👞'],['PA-TO','🦆'],['MA-CA-CO','🐒'],['JA-NE-LA','🪟'],
  ['PEI-XE','🐟'],['E-LE-FAN-TE','🐘'],['BA-NA-NA','🍌'],['TO-MA-TE','🍅'],['CA-VA-LO','🐴'],['BOR-BO-LE-TA','🦋'],
  ['A-BA-CA-XI','🍍'],['SA-PO','🐸'],['VA-CA','🐮'],['DA-DO','🎲'],['LU-A','🌙'],['SOL','☀️'],['FLOR','🌸'],
  ['PÃO','🍞'],['MAR','🌊'],['CO-RA-ÇÃO','❤️'],['BO-LO','🎂'],['U-VA','🍇'],['CE-NOU-RA','🥕'],['TAR-TA-RU-GA','🐢'],
  ['CHO-CO-LA-TE','🍫'],['O-VO','🥚'],['MA-ÇÃ','🍎'],['CA-MI-SA','👕'],['BA-LÃO','🎈']
];
const RIMAS=[['MÃO','PÃO'],['GATO','PATO'],['BOLA','COLA'],['JANELA','PANELA'],['CADEIRA','BANDEIRA'],['DEDO','MEDO'],
  ['FLOR','COR'],['CHAPÉU','CÉU'],['ANEL','PAPEL'],['LIMÃO','FEIJÃO'],['CANECA','BONECA'],['RATO','SAPATO'],['PENTE','DENTE'],
  ['VELA','PANELA'],['BALÃO','AVIÃO'],['MEIA','AREIA']];
const FRASES=[ // [quem, faz, o quê]
  ['O gato','bebe','leite'],['A menina','come','uma maçã'],['O menino','chuta','a bola'],['A vovó','faz','um bolo'],
  ['O cachorro','pega','o osso'],['O papai','lava','o carro'],['A professora','lê','um livro'],['O passarinho','come','alpiste'],
  ['A mamãe','rega','as flores'],['O coelho','come','cenoura'],['A Bia','desenha','uma casa'],['O Léo','pinta','um sol']];
const NOMES_P=['Ana','Pedro','Lucas','Maria','Sofia','Davi','Laura','Miguel'];
const sylOf=w=>w.split('-'),wordOf=w=>w.replace(/-/g,'');
function wordOpts(ans,pool){const set=new Set([ans]);let g=0;while(set.size<3&&g++<80){const w=pick(pool);if(w!==ans)set.add(w)}return shuffle([...set].map(v=>({v,label:v,ok:v===ans,type:null})))}
Object.assign(GEN,{
  contaSil(){const [w,e]=pick(PALAVRAS),n=sylOf(w).length;return{skill:'Contar sílabas',text:`Quantas sílabas tem a palavra ${wordOf(w)}?`,visual:`<div class="emo" style="font-size:64px">${e}</div><div class="big" style="font-size:48px">${wordOf(w)}</div>`,desc:wordOf(w),
    options:shuffle([1,2,3,4].filter(x=>x!==n)).slice(0,2).concat(n).sort((x,y)=>x-y).map(v=>({v,label:String(v),ok:v===n,type:v<n?'contou sílabas a menos':'contou sílabas a mais'})),
    hint:'Fale a palavra devagar e bata uma palma em cada pedacinho.',explain:`${wordOf(w)} se fala assim: ${sylOf(w).join(' - ')}. São ${n} sílaba${n>1?'s':''}.`}},
  primSil(){const pool=PALAVRAS.filter(p=>sylOf(p[0]).length>=2),[w,e]=pick(pool),sy=sylOf(w),first=sy[0];
    const others=shuffle(PALAVRAS.map(p=>sylOf(p[0])[0]).filter(x=>x!==first&&x[0]!==first[0]));const cand=[first,...new Set(others)].slice(0,3);
    if(sy[1]&&!cand.includes(sy[1]))cand[2]=sy[1];
    return{skill:'Primeira sílaba',text:`Com qual sílaba começa a palavra ${wordOf(w)}?`,visual:`<div class="emo" style="font-size:64px">${e}</div>`,desc:wordOf(w),
    options:shuffle(cand.map(v=>({v,label:v,ok:v===first,type:v===sy[1]?'escolheu a segunda sílaba':'confundiu o som inicial'}))),
    hint:'Fale a palavra e preste atenção no primeiro pedacinho.',explain:`${wordOf(w)} começa com ${first}: ${sy.join(' - ')}.`}},
  monta(){const [w,e]=pick(PALAVRAS.filter(p=>sylOf(p[0]).length>=2)),sy=sylOf(w);return{kind:'syll',skill:'Formar palavras',parts:sy,word:wordOf(w),text:'Toque nas sílabas na ordem certa para formar a palavra.',speak:`Forme a palavra: ${wordOf(w).toLowerCase()}`,
    visual:`<div class="emo" style="font-size:72px">${e}</div>`,desc:`formar ${wordOf(w)}`,hint:`Fale ${wordOf(w).toLowerCase()} devagar: qual pedacinho vem primeiro?`,explain:`A palavra é ${wordOf(w)}: ${sy.join(' - ')}.`}},
  rima(){const [a,b]=pick(RIMAS),pool=RIMAS.flat().filter(x=>x.slice(-2)!==a.slice(-2));return{skill:'Rimas',text:`Qual palavra rima com ${a}?`,visual:`<div class="big" style="font-size:48px">${a}</div>`,desc:`rima com ${a}`,
    options:wordOpts(b,pool).map(o=>({...o,type:o.ok?null:'não percebeu o som final'})),hint:'Palavras que rimam terminam com o mesmo som.',explain:`${a} e ${b} terminam com o mesmo som. Por isso rimam.`}},
  frasecerta(){const [q,f,o]=pick(FRASES),ok=`${q} ${f} ${o}.`,low=ok.charAt(0).toLowerCase()+ok.slice(1),nop=ok.slice(0,-1);
    return{skill:'Maiúscula e ponto final',text:'Qual frase está escrita do jeito certo?',speak:'Qual frase está escrita do jeito certo? Lembre da letra grande no começo e do ponto no final.',visual:'',desc:ok,optClass:'sent',
    options:shuffle([{v:ok,label:ok,ok:true,type:null},{v:low,label:low,ok:false,type:'esqueceu a letra maiúscula'},{v:nop,label:nop,ok:false,type:'esqueceu o ponto final'}]),
    hint:'A frase começa com letra maiúscula e termina com ponto.',explain:`O certo é: ${ok} Começa com letra maiúscula e termina com ponto.`}},
  nomecerto(){const n=pick(NOMES_P);return{skill:'Maiúscula e ponto final',text:'Qual nome está escrito do jeito certo?',visual:'',desc:n,optClass:'txt',
    options:shuffle([{v:n,label:n,ok:true,type:null},{v:n.toLowerCase(),label:n.toLowerCase(),ok:false,type:'esqueceu a maiúscula no nome'},{v:n.toUpperCase().charAt(0)+n.slice(1,-1)+n.slice(-1).toUpperCase(),label:n.charAt(0)+n.slice(1,-1)+n.slice(-1).toUpperCase(),ok:false,type:'usou maiúscula no lugar errado'}]),
    hint:'Nome de pessoa começa com letra maiúscula.',explain:`Nome de pessoa começa com letra maiúscula: ${n}.`}},
  quem(){const [q,f,o]=pick(FRASES),fr=`${q} ${f} ${o}.`,opsPool=FRASES.map(x=>x[0]);return{skill:'Ler e entender frases',text:`${fr} Quem ${f} ${o}?`,speak:`Leia a frase e responda: quem ${f} ${o}?`,visual:'',desc:fr,optClass:'txt',
    options:wordOpts(q,opsPool).map(x=>({...x,type:x.ok?null:'não encontrou quem faz a ação'})),hint:'Leia a frase de novo. Quem aparece no começo?',explain:`Na frase "${fr}" quem ${f} é: ${q.toLowerCase()}.`}},
  oque(){const [q,f,o]=pick(FRASES),fr=`${q} ${f} ${o}.`,pool=FRASES.map(x=>x[2]);return{skill:'Ler e entender frases',text:`${fr} O que ${q.toLowerCase()} ${f}?`,speak:`Leia a frase e responda: o que ${q.toLowerCase()} ${f}?`,visual:'',desc:fr,optClass:'txt',
    options:wordOpts(o,pool).map(x=>({...x,type:x.ok?null:'não encontrou o que é feito'})),hint:'Leia a frase de novo. O que vem depois da ação?',explain:`Na frase "${fr}" a resposta é: ${o}.`}},
});
const POR_LESSONS=[
  {id:'silabas',titulo:'Sílabas',icone:'👏',bncc:'EF02LP02',
   slides:[
    {t:'As palavras são feitas de pedacinhos. Cada pedacinho que a gente fala de uma vez se chama sílaba.',v:'<div class="big" style="font-size:52px">BO · LA</div><div class="cap">BO-LA tem 2 sílabas</div>'},
    {t:'Para contar as sílabas, fale a palavra devagar e bata uma palma em cada pedacinho. SA, PA, TO: três palmas, três sílabas.',v:'<div class="emo" style="font-size:64px">👞</div><div class="big" style="font-size:52px">SA · PA · TO</div><div class="emo">👏👏👏</div>'}],
   practice:['contaSil','primSil','contaSil','primSil','contaSil','primSil'],
   quiz:['contaSil','primSil','contaSil','primSil','contaSil']},
  {id:'formar',titulo:'Formar palavras',icone:'🧩',bncc:'EF02LP02',
   slides:[
    {t:'Juntando sílabas na ordem certa, formamos palavras. GA mais TO forma GATO.',v:'<div class="emo" style="font-size:64px">🐱</div><div class="big" style="font-size:52px">GA + TO = GATO</div>'},
    {t:'Se trocar a ordem, a palavra muda ou não faz sentido. TO mais GA forma TOGA, que é outra coisa. Por isso, preste atenção na ordem.',v:'<div class="big" style="font-size:44px">GA·TO ✔️ &nbsp; TO·GA ✖️</div>'}],
   practice:['monta','monta','monta','monta','monta','monta'],
   quiz:['monta','monta','monta','monta','monta']},
  {id:'rimas',titulo:'Rimas',icone:'🎶',bncc:'EF02LP01',
   slides:[
    {t:'Rima é quando duas palavras terminam com o mesmo som. MÃO rima com PÃO.',v:'<div class="big" style="font-size:52px">M<b style="color:var(--pri)">ÃO</b> · P<b style="color:var(--pri)">ÃO</b></div>'},
    {t:'GATO rima com PATO. Os dois terminam com ATO. Escute o final das palavras!',v:'<div class="emo" style="font-size:56px">🐱 🦆</div><div class="big" style="font-size:44px">G<b style="color:var(--pri)">ATO</b> · P<b style="color:var(--pri)">ATO</b></div>'}],
   practice:['rima','rima','rima','rima','rima','rima'],
   quiz:['rima','rima','rima','rima','rima']},
  {id:'maiuscula',titulo:'Letra maiúscula e ponto',icone:'✏️',bncc:'EF02LP03',
   slides:[
    {t:'Toda frase começa com letra maiúscula, que é a letra grande. E termina com um ponto.',v:'<div class="big" style="font-size:40px"><b style="color:var(--pri)">O</b> gato dorme<b style="color:var(--bad)">.</b></div>'},
    {t:'Nome de pessoa também começa com letra maiúscula: Ana, Pedro, Maria.',v:'<div class="big" style="font-size:44px"><b style="color:var(--pri)">A</b>na · <b style="color:var(--pri)">P</b>edro</div>'}],
   practice:['frasecerta','nomecerto','frasecerta','nomecerto','frasecerta','frasecerta'],
   quiz:['frasecerta','nomecerto','frasecerta','frasecerta','nomecerto']},
  {id:'leitura',titulo:'Ler e entender',icone:'📖',bncc:'EF12LP02',
   slides:[
    {t:'Quando lemos uma frase, descobrimos quem faz alguma coisa e o que faz. O gato bebe leite: quem bebe é o gato.',v:'<div class="emo" style="font-size:56px">🐱🥛</div><div class="big" style="font-size:36px">O gato bebe leite.</div>'},
    {t:'Se não souber a resposta, leia a frase de novo, com calma. A resposta está escrita nela!',v:'<div class="emo" style="font-size:56px">🔍📖</div>'}],
   practice:['quem','oque','quem','oque','quem','oque'],
   quiz:['quem','oque','quem','oque','quem']},
];

/* ================= LOTE 1 · 17/11/2026 ================= */
/* ---- Matemática: reserva e contagem pulando ---- */
Object.assign(GEN,{
  somaReserva(){const a1=rnd(1,7),b1=rnd(1,8-a1),a0=rnd(2,9),b0=rnd(10-a0,9),a=a1*10+a0,b=b1*10+b0,s=a+b,u=a0+b0;
    return{skill:'Somar com reserva',text:`Quanto é ${a} mais ${b}?`,visual:cols(a,b,'+'),desc:`${a} + ${b}`,
    options:opts(s,[{v:s-10,type:'esqueceu o vai um'},{v:s+10,type:'errou nas dezenas'},{v:s-1,type:'errou nas unidades'},{v:s+1,type:'errou nas unidades'}]),
    hint:'Some as unidades primeiro. Se passar de 9, guarde 1 dezena para somar junto com as dezenas.',
    explain:`Unidades: ${a0} mais ${b0} dá ${u}. Fica ${u-10} e vai 1 dezena. Dezenas: ${a1} mais ${b1} mais 1 dá ${a1+b1+1}. Resultado: ${s}.`}},
  somaReservaHist(){const n=pick(NOMES),c=pick(COISAS)[0],a0=rnd(4,9),a=rnd(1,5)*10+a0,b=rnd(10-a0,9),s=a+b;
    return{skill:'Somar com reserva',text:`${cap1(n)} tinha ${a} ${c} e ganhou mais ${b}. Com quantas ficou?`,visual:cols(a,b,'+'),desc:`${a} + ${b} (história)`,
    options:opts(s,[{v:s-10,type:'esqueceu o vai um'},{v:a-b,type:'subtraiu em vez de somar'},{v:s+1,type:'errou nas unidades'}]),
    hint:'Ganhou mais é conta de mais. Cuidado com o vai um!',explain:`${a0} mais ${b} dá ${a0+b}: fica ${a0+b-10} e vai 1. Resultado: ${s}.`}},
  subReserva(){const a1=rnd(2,9),b1=rnd(1,a1-1),a0=rnd(0,8),b0=rnd(a0+1,9),a=a1*10+a0,b=b1*10+b0,r=a-b;
    return{skill:'Subtrair com reserva',text:`Quanto é ${a} menos ${b}?`,visual:cols(a,b,'−'),desc:`${a} − ${b}`,
    options:opts(r,[{v:(a1-b1)*10+(b0-a0),type:'tirou o menor do maior na unidade'},{v:r+10,type:'esqueceu de tirar a dezena emprestada'},{v:r-1,type:'errou nas unidades'},{v:r+1,type:'errou nas unidades'}]),
    hint:'Se a unidade de cima for menor, pegue 1 dezena emprestada: ela vira 10 unidades.',
    explain:`${a0} é menor que ${b0}, então pegamos 1 dezena emprestada: ${a0} vira ${a0+10}. ${a0+10} menos ${b0} dá ${a0+10-b0}. Dezenas: ${a1} menos 1 menos ${b1} dá ${a1-1-b1}. Resultado: ${r}.`}},
  subReservaHist(){const n=pick(NOMES),c=pick(COISAS)[0],a0=rnd(0,5),a=rnd(2,6)*10+a0,b=rnd(a0+1,9),r=a-b;
    return{skill:'Subtrair com reserva',text:`${cap1(n)} tinha ${a} ${c} e deu ${b} para um amigo. Com quantas ficou?`,visual:cols(a,b,'−'),desc:`${a} − ${b} (história)`,
    options:opts(r,[{v:a+b,type:'somou em vez de subtrair'},{v:r+10,type:'esqueceu de tirar a dezena emprestada'},{v:Math.floor(a/10)*10+(b-a0),type:'tirou o menor do maior na unidade'}]),
    hint:'Deu para alguém é conta de menos. Precisa pegar emprestado?',explain:`${a} menos ${b}: pegamos 1 dezena emprestada. Resultado: ${r}.`}},
  pular(){const st=pick([2,2,5,10]),a=st*rnd(0,5),seq=[a,a+st,a+2*st],r=a+3*st;
    return{skill:'Contar pulando',text:`Contando de ${st} em ${st}, qual número vem depois?`,visual:numline([...seq,'?']),desc:`de ${st} em ${st}: ${seq.join(', ')}, ?`,
    options:opts(r,[{v:a+2*st+1,type:'contou de 1 em 1'},{v:r+st,type:'pulou um número'},{v:r-1,type:'errou a soma do pulo'}]),
    hint:`Some ${st} ao último número.`,explain:`${a+2*st} mais ${st} dá ${r}.`}},
  pularFalta(){const st=pick([2,5,10]),a=st*rnd(1,5),r=a+st;
    return{skill:'Contar pulando',text:`Qual número está faltando na fila?`,visual:numline([a-st,a,'?',a+2*st]),desc:`de ${st} em ${st}: ${a-st}, ${a}, ?, ${a+2*st}`,
    options:opts(r,[{v:a+1,type:'contou de 1 em 1'},{v:a+2*st,type:'repetiu o próximo'},{v:r+1,type:'errou a soma do pulo'}]),
    hint:'Descubra de quanto em quanto a fila pula.',explain:`A fila pula de ${st} em ${st}. Depois do ${a} vem ${r}.`}},
});
MAT_LESSONS.push(
  {id:'soma-reserva',titulo:'Somar com reserva',icone:'🎒',bncc:'EF02MA06',
   slides:[
    {t:'Às vezes, ao somar as unidades, o resultado passa de 9. Por exemplo: 7 mais 5 dá 12.',v:'<div class="big">7 + 5 = 12</div>'},
    {t:'12 unidades são 1 dezena e 2 unidades. O 2 fica nas unidades e a dezena vai para a coluna das dezenas. É o famoso vai um!',v:blocksHTML(1,2)},
    {t:'27 mais 15: 7 mais 5 dá 12. Fica 2 e vai 1. Depois, 2 mais 1 mais 1 dá 4. O resultado é 42.',v:'<div class="cap" style="color:var(--bad);font-family:var(--display);font-size:28px">1</div>'+cols(27,15,'+',42)}],
   practice:['somaReserva','somaReserva','somaReservaHist','somaReserva','somaReserva','somaReservaHist'],
   quiz:['somaReserva','somaReservaHist','somaReserva','somaReserva','somaReservaHist']},
  {id:'sub-reserva',titulo:'Subtrair com reserva',icone:'🔄',bncc:'EF02MA06',
   slides:[
    {t:'Em 42 menos 17, as unidades são 2 menos 7. Não dá para tirar 7 de 2!',v:cols(42,17,'−')},
    {t:'Então pegamos 1 dezena emprestada. O 4 vira 3, e o 2 vira 12.',v:blocksHTML(3,12)+'<div class="cap">12 unidades soltas</div>'},
    {t:'Agora sim: 12 menos 7 dá 5. E 3 menos 1 dá 2. O resultado é 25.',v:cols(42,17,'−',25)}],
   practice:['subReserva','subReserva','subReservaHist','subReserva','subReserva','subReservaHist'],
   quiz:['subReserva','subReservaHist','subReserva','subReserva','subReservaHist']},
  {id:'pular',titulo:'Contar pulando',icone:'🐸',bncc:'EF02MA09',
   slides:[
    {t:'Podemos contar pulando números. De 2 em 2: 2, 4, 6, 8, 10.',v:numline([2,4,6,8,10])},
    {t:'De 5 em 5: 5, 10, 15, 20, 25. Repare que sempre termina em 5 ou em 0.',v:numline([5,10,15,20,25])},
    {t:'De 10 em 10: 10, 20, 30, 40, 50. Só a dezena muda!',v:numline([10,20,30,40,50])}],
   practice:['pular','pular','pularFalta','pular','pularFalta','pular'],
   quiz:['pular','pularFalta','pular','pularFalta','pular']}
);

/* ---- Português: NH, LH, CH e ordem alfabética ---- */
const DIGRAFOS=[['GALINHA','🐔','NH'],['NINHO','🪺','NH'],['UNHA','💅','NH'],['ARANHA','🕷️','NH'],['MINHOCA','🪱','NH'],['PINHÃO','🌰','NH'],
  ['FOLHA','🍃','LH'],['ABELHA','🐝','LH'],['COELHO','🐰','LH'],['ORELHA','👂','LH'],['TELHADO','🏠','LH'],['OVELHA','🐑','LH'],
  ['CHAVE','🔑','CH'],['CHUVA','🌧️','CH'],['CHAPÉU','👒','CH'],['BICHO','🐛','CH'],['CHINELO','🩴','CH'],['CHOCOLATE','🍫','CH']];
const ALFABETO='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
Object.assign(GEN,{
  digrafo(){const [w,e,d]=pick(DIGRAFOS),blank=w.replace(d,'__');
    return{skill:'NH, LH e CH',text:`Complete a palavra: ${blank}`,speak:`Complete a palavra ${w.toLowerCase()}.`,visual:`<div class="emo" style="font-size:72px">${e}</div><div class="big" style="font-size:48px">${blank}</div>`,desc:w,optClass:'txt',
    options:shuffle(['NH','LH','CH'].map(v=>({v,label:v,ok:v===d,type:v===d?null:`trocou ${d} por ${v}`}))),
    hint:'Fale a palavra devagar e preste atenção no som do meio.',explain:`${w} se escreve com ${d}.`}},
  temDigrafo(){const d=pick(['NH','LH','CH']),cert=pick(DIGRAFOS.filter(x=>x[2]===d)),outros=shuffle(DIGRAFOS.filter(x=>x[2]!==d)).filter((x,i,arr)=>arr.findIndex(y=>y[2]===x[2])===i).slice(0,2);
    return{skill:'NH, LH e CH',text:`Qual palavra tem ${d}?`,visual:'',desc:`palavra com ${d}`,optClass:'txt',
    options:shuffle([cert,...outros].map(x=>({v:x[0],label:`${x[1]} ${x[0]}`,ok:x[2]===d,type:x[2]===d?null:`confundiu ${d} com ${x[2]}`}))),
    hint:`Procure as letras ${d.split('').join(' e ')} juntinhas.`,explain:`${cert[0]} tem ${d}.`}},
  letraDepois(){const i=rnd(0,24),l=ALFABETO[i],r=ALFABETO[i+1];
    return{skill:'Ordem alfabética',text:`Qual letra vem logo depois do ${l}?`,speak:`Qual letra vem logo depois do ${l.toLowerCase()}?`,visual:`<div class="big">${l} → ?</div>`,desc:`depois de ${l}`,optClass:'txt',
    options:shuffle([r,...[ALFABETO[i+2],ALFABETO[i-1],ALFABETO[i+3],ALFABETO[i-2]].filter(x=>x&&x!==r).slice(0,2)].map(v=>({v,label:v,ok:v===r,type:v===r?null:(v===ALFABETO[i-1]?'confundiu antes com depois':'errou a sequência do alfabeto')}))),
    hint:'Cante o alfabeto baixinho até chegar nessa letra.',explain:`No alfabeto, depois do ${l} vem o ${r}.`}},
  primeiraAlf(){const pool=shuffle(PALAVRAS.map(p=>wordOf(p[0]))),ws=[];for(const w of pool){if(!ws.some(x=>x[0]===w[0]))ws.push(w);if(ws.length===3)break}
    const first=[...ws].sort((a,b)=>ALFABETO.indexOf(a[0])-ALFABETO.indexOf(b[0]))[0];
    return{skill:'Ordem alfabética',text:'Qual palavra vem primeiro na ordem alfabética?',visual:'',desc:ws.join(', '),optClass:'txt',
    options:shuffle(ws.map(v=>({v,label:v,ok:v===first,type:v===first?null:'não comparou a primeira letra'}))),
    hint:'Olhe só a primeira letra de cada palavra. Qual vem antes no alfabeto?',explain:`${first} começa com ${first[0]}, que vem antes das outras letras no alfabeto.`}},
});
POR_LESSONS.push(
  {id:'digrafos',titulo:'NH, LH e CH',icone:'🐔',bncc:'EF02LP04',
   slides:[
    {t:'Algumas letras se juntam para fazer um som novo. N e H juntos fazem NH, como em GALINHA.',v:'<div class="emo" style="font-size:64px">🐔</div><div class="big" style="font-size:48px">GALI<b style="color:var(--pri)">NH</b>A</div>'},
    {t:'L e H fazem LH, como em FOLHA. C e H fazem CH, como em CHUVA.',v:'<div class="big" style="font-size:44px">FO<b style="color:var(--pri)">LH</b>A · <b style="color:var(--pri)">CH</b>UVA</div><div class="emo">🍃 🌧️</div>'}],
   practice:['digrafo','digrafo','temDigrafo','digrafo','temDigrafo','digrafo'],
   quiz:['digrafo','temDigrafo','digrafo','digrafo','temDigrafo']},
  {id:'alfabeto',titulo:'Ordem alfabética',icone:'🔤',bncc:'EF02LP07',
   slides:[
    {t:'O alfabeto tem 26 letras, sempre na mesma ordem: A, B, C, D, E, F, G...',v:'<div class="big" style="font-size:36px;letter-spacing:4px">ABCDEFG<br>HIJKLMN<br>OPQRSTU<br>VWXYZ</div>'},
    {t:'Para colocar palavras em ordem alfabética, olhamos a primeira letra. BOLA vem antes de GATO, porque B vem antes de G.',v:'<div class="big" style="font-size:40px"><b style="color:var(--pri)">B</b>OLA → <b style="color:var(--pri)">G</b>ATO</div>'}],
   practice:['letraDepois','primeiraAlf','letraDepois','primeiraAlf','letraDepois','primeiraAlf'],
   quiz:['letraDepois','primeiraAlf','primeiraAlf','letraDepois','primeiraAlf']}
);

/* ---- Ciências: banco de perguntas ---- */
function bankGen(skill,bank){let fila=[];return function(){if(!fila.length)fila=shuffle(bank.slice());const it=fila.pop();
  const ops=shuffle([{v:it.a,label:it.a,ok:true,type:null},...it.w.map(x=>({v:x,label:x,ok:false,type:it.erro||'confundiu o conceito'}))]);
  return{skill,text:it.q,visual:it.e?`<div class="emo" style="font-size:72px">${it.e}</div>`:'',desc:it.q,optClass:ops.some(o=>o.label.length>12)?'sent':'txt',options:ops,hint:it.h||'Pense no que você faz no dia a dia.',explain:it.x}}}
Object.assign(GEN,{
  corpo:bankGen('Corpo humano e higiene',[
    {q:'Para que servem os olhos?',a:'Para ver',w:['Para ouvir','Para sentir cheiro'],e:'👀',x:'Os olhos servem para ver.'},
    {q:'Qual parte do corpo usamos para ouvir?',a:'As orelhas',w:['O nariz','Os joelhos'],e:'👂',x:'Ouvimos com as orelhas.'},
    {q:'Com o nariz nós sentimos o...',a:'Cheiro',w:['Som','Frio da água'],e:'👃',x:'O nariz sente o cheiro das coisas.'},
    {q:'Com a língua nós sentimos o...',a:'Gosto',w:['Cheiro','Barulho'],e:'👅',x:'A língua sente o gosto da comida: doce, salgado, azedo.'},
    {q:'Quando devemos lavar as mãos?',a:'Antes de comer e depois de usar o banheiro',w:['Só no fim de semana','Só quando pintar com tinta'],e:'🧼',x:'Lavamos as mãos antes de comer e depois do banheiro para tirar os germes.'},
    {q:'Quando devemos escovar os dentes?',a:'Depois das refeições',w:['Uma vez por semana','Só quando o dente doer'],e:'🪥',x:'Escovamos os dentes depois de comer para não ter cáries.'},
    {q:'O que ajuda o corpo a crescer forte?',a:'Comer frutas e verduras',w:['Comer só doces','Ficar sem dormir'],e:'🥦',x:'Frutas, verduras e uma boa noite de sono ajudam o corpo a crescer.'},
    {q:'Por que tomamos banho?',a:'Para tirar a sujeira e os germes',w:['Para ficar com fome','Para crescer mais rápido'],e:'🛁',x:'O banho limpa a sujeira e os germes do corpo.'},
    {q:'O que devemos fazer ao espirrar?',a:'Cobrir com o braço',w:['Espirrar no amigo','Espirrar na comida'],e:'🤧',x:'Cobrimos o espirro com o braço para não espalhar germes.'},
    {q:'Com qual sentido percebemos se algo é áspero ou macio?',a:'Tato',w:['Visão','Audição'],e:'✋',x:'O tato, pela pele, sente se algo é macio, áspero, quente ou frio.'}]),
  animais:bankGen('Animais',[
    {q:'Onde vive o peixe?',a:'Na água',w:['Na árvore','No deserto'],e:'🐟',x:'O peixe vive na água e respira por brânquias.'},
    {q:'Qual destes animais tem penas?',a:'Galinha',w:['Cachorro','Peixe'],e:'🪶',x:'As aves, como a galinha, têm o corpo coberto de penas.'},
    {q:'O que a vaca come?',a:'Capim',w:['Carne','Peixe'],e:'🐮',x:'A vaca é herbívora: come capim e outras plantas.'},
    {q:'Qual destes animais nasce de um ovo?',a:'Tartaruga',w:['Gato','Cavalo'],e:'🥚',x:'A tartaruga nasce de um ovo. Gato e cavalo nascem da barriga da mãe.'},
    {q:'Qual destes animais tem o corpo coberto de pelos?',a:'Cachorro',w:['Cobra','Peixe'],e:'🐶',x:'O cachorro é um mamífero e tem pelos.'},
    {q:'Como o passarinho se locomove?',a:'Voando',w:['Só nadando','Rastejando'],e:'🐦',x:'O passarinho voa com as asas.'},
    {q:'Qual destes animais vive na fazenda?',a:'Cavalo',w:['Tubarão','Pinguim'],e:'🐴',x:'O cavalo vive na fazenda. Tubarão vive no mar e pinguim no gelo.'},
    {q:'Qual destes animais come carne?',a:'Leão',w:['Coelho','Vaca'],e:'🦁',x:'O leão é carnívoro: come carne.'},
    {q:'Antes de virar borboleta, ela era uma...',a:'Lagarta',w:['Abelha','Formiga'],e:'🦋',x:'A borboleta nasce como lagarta, vira casulo e depois borboleta.'},
    {q:'Como a cobra se locomove?',a:'Rastejando',w:['Voando','Pulando'],e:'🐍',x:'A cobra não tem pernas: ela rasteja.'}]),
});
const CIE_LESSONS=[
  {id:'corpo',titulo:'Corpo e higiene',icone:'🧼',bncc:'EF02CI',
   slides:[
    {t:'Nosso corpo tem cinco sentidos: visão com os olhos, audição com as orelhas, olfato com o nariz, paladar com a língua e tato com a pele.',v:'<div class="emo" style="font-size:56px">👀 👂 👃 👅 ✋</div>'},
    {t:'Para cuidar do corpo: lavar as mãos, tomar banho, escovar os dentes, comer bem e dormir cedo.',v:'<div class="emo" style="font-size:56px">🧼 🛁 🪥 🥦 😴</div>'}],
   practice:['corpo','corpo','corpo','corpo','corpo','corpo'],quiz:['corpo','corpo','corpo','corpo','corpo']},
  {id:'animais',titulo:'Animais',icone:'🐾',bncc:'EF02CI04',
   slides:[
    {t:'Os animais vivem em lugares diferentes: na água, na terra, nas árvores e até no gelo.',v:'<div class="emo" style="font-size:56px">🐟 🐴 🐒 🐧</div>'},
    {t:'Alguns têm pelos, outros penas, escamas ou casco. Alguns nascem de ovos e outros da barriga da mãe.',v:'<div class="emo" style="font-size:56px">🐶 🐔 🐍 🐢</div>'},
    {t:'Eles também comem coisas diferentes: alguns comem plantas, outros comem carne.',v:'<div class="emo" style="font-size:56px">🐮🌿 &nbsp; 🦁🍖</div>'}],
   practice:['animais','animais','animais','animais','animais','animais'],quiz:['animais','animais','animais','animais','animais']},
];


/* ================= MEMÓRIA CC (dinâmica) =================
   As frases vêm da aba privada "MemoriaCC" da planilha da família (material do Classical Conversations
   que eles possuem). NADA desse texto fica no repositório: aqui só está o código que monta as atividades. */
const MEM_STOP=new Set(['a','o','as','os','e','é','de','do','da','dos','das','em','no','na','nos','nas','um','uma','uns','umas','que','com','por','para','pra','se','ao','aos','à','às','foi','são','era','eu','ele','ela','seu','sua','the','of','and','in','to','is']);
const memClean=w=>w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,'');
const memWords=t=>String(t).split(/\s+/).filter(Boolean);
function buildMemoria(rows){
  rows=(rows||[]).filter(r=>r&&r.texto&&String(r.texto).trim()).map(r=>({ciclo:String(r.ciclo||'').trim()||'1',semana:Number(r.semana)||0,materia:String(r.materia||'Memória').trim(),texto:String(r.texto).trim()}));
  if(!rows.length)return [];
  const vocab=[...new Set(rows.flatMap(r=>memWords(r.texto).map(memClean)).filter(w=>w.length>=3&&!MEM_STOP.has(w.toLowerCase())))];
  const skillOf=r=>'Memória · '+r.materia;
  function orderQ(r){
    const ws=memWords(r.texto);if(ws.length<2)return clozeQ(r,true);
    const n=Math.min(4,Math.max(2,Math.ceil(ws.length/3))),size=Math.ceil(ws.length/n),parts=[];
    for(let i=0;i<ws.length;i+=size)parts.push(ws.slice(i,i+size).join(' '));
    const ps=parts.map((x,i)=>x+(i<parts.length-1?' ':''));
    return{kind:'syll',small:true,skill:skillOf(r),parts:ps,word:ps.join(''),text:'Toque nos pedaços na ordem certa para montar a frase.',speak:'Monte a frase na ordem certa.',
      visual:`<span class="pill mid">${esc(r.materia)} · semana ${r.semana}</span>`,desc:`${r.materia}, semana ${r.semana} (ordem)`,hint:'Comece pelo pedaço que abre a frase. Cante a música baixinho!',explain:`A frase é: ${r.texto}`};
  }
  function clozeQ(r,noFallback){
    const ws=memWords(r.texto),cand=ws.map((w,i)=>({w:memClean(w),i})).filter(x=>x.w.length>=3&&!MEM_STOP.has(x.w.toLowerCase()));
    if(!cand.length)return noFallback?null:orderQ(r);
    const pickc=cand.sort((a,b)=>b.w.length-a.w.length).slice(0,Math.max(1,Math.ceil(cand.length/2)));const {w:ans,i}=pick(pickc);
    const fmt=x=>/^[A-ZÀ-Ú]/.test(ans)?x.charAt(0).toUpperCase()+x.slice(1):x.charAt(0).toLowerCase()+x.slice(1);
    const naFrase=new Set(ws.map(x=>memClean(x).toLowerCase()));let ds=shuffle(vocab.filter(v=>!naFrase.has(v.toLowerCase()))).map(fmt).filter((v,k,a)=>a.indexOf(v)===k&&v!==ans).slice(0,2);
    if(ds.length<2){if(/^\d+$/.test(ans)){const n=+ans;ds=[String(n+1),String(n+10)]}else return noFallback?null:orderQ(r)}
    const shown=ws.map((w,k)=>k===i?w.replace(memClean(w),'_____'):w).join(' ');
    return{skill:skillOf(r),text:'Complete a frase:',speak:'Complete a frase.',optClass:'txt',
      visual:`<span class="pill mid">${esc(r.materia)} · semana ${r.semana}</span><div class="cap" style="font-size:24px;color:var(--ink);max-width:620px;line-height:1.4">${esc(shown)}</div>`,
      desc:`${r.materia}, semana ${r.semana} (completar)`,options:shuffle([{v:ans,label:ans,ok:true,type:null},...ds.map(d=>({v:d,label:d,ok:false,type:'trocou a palavra da memória'}))]),
      hint:'Leia a frase inteira e lembre da música.',explain:`A frase completa é: ${r.texto}`};
  }
  const anyQ=(pool,pCloze)=>()=>{const r=pick(pool);return (Math.random()<pCloze?clozeQ(r):orderQ(r))||orderQ(r)};
  const lessons=[],grupos={};
  rows.forEach(r=>{const k=r.ciclo+'|'+r.semana;(grupos[k]=grupos[k]||[]).push(r)});
  Object.keys(grupos).sort((a,b)=>{const [ca,sa]=a.split('|'),[cb,sb]=b.split('|');return ca===cb?sa-sb:ca.localeCompare(cb)}).forEach(k=>{
    const cur=grupos[k],[ciclo,sem]=k.split('|'),s=+sem;
    const prev=rows.filter(r=>r.ciclo===ciclo&&r.semana<s&&r.semana>=s-6);
    const kp=`mem_${ciclo}_${s}_p`,kq=`mem_${ciclo}_${s}_q`;
    GEN[kp]=anyQ(cur,.5);
    GEN[kq]=()=>{const pool=prev.length&&Math.random()<.4?prev:cur;return anyQ(pool,.6)()};
    lessons.push({id:`mem-c${ciclo}-s${s}`,titulo:`Ciclo ${ciclo} · Semana ${s}`,icone:'🎵',bncc:'CC',subject:'Memória',
      slides:[{t:`Semana ${s}. Antes de começar, ouça as músicas desta semana no app do CC. Depois, vamos ler as frases juntos.`,v:'<div class="emo" style="font-size:64px">🎵📖</div>'},
        ...cur.map(r=>({t:`${r.materia}. ${r.texto}`,v:`<span class="pill mid">${esc(r.materia)}</span><div class="cap" style="font-size:26px;color:var(--ink);max-width:640px;line-height:1.4">${esc(r.texto)}</div>`}))],
      practice:Array(6).fill(kp),quiz:Array(prev.length?6:5).fill(kq)});
  });
  if(lessons.length>=2){GEN.mem_mestre=anyQ(rows,.6);
    lessons.push({id:'mem-mestre',titulo:'Mestre da Memória',icone:'🏆',bncc:'CC',subject:'Memória',
      slides:[{t:'Revisão geral! Aqui aparecem frases de todas as semanas que você já estudou.',v:'<div class="emo" style="font-size:64px">🏆</div>'}],
      practice:Array(6).fill('mem_mestre'),quiz:Array(10).fill('mem_mestre')});}
  return lessons;
}

MAT_LESSONS.forEach(l=>l.subject='Matemática');POR_LESSONS.forEach(l=>l.subject='Português');CIE_LESSONS.forEach(l=>l.subject='Ciências');
SUBJECTS[0].lessons=MAT_LESSONS;Object.assign(SUBJECTS[1],{lessons:POR_LESSONS,ready:true,ano:'2º ano'});
Object.assign(SUBJECTS[2],{lessons:CIE_LESSONS,ready:true,ano:'2º ano'});
const LESSONS=[...MAT_LESSONS,...POR_LESSONS,...CIE_LESSONS];
const PRAISE=['Muito bem!','Isso aí!','Arrasou!','Perfeito!','Você acertou!'];
