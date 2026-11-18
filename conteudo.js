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
    return{skill:'NH, LH e CH',text:`Qual palavra tem ${d}?`,visual:'',desc:`palavra com ${d}: ${[cert,...outros].map(x=>x[0]).sort().join(', ')}`,optClass:'txt',
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
function bankGen(skill,bank){let fila=[];const f=function(){if(!fila.length)fila=shuffle(bank.slice());const it=fila.pop();
  const ops=shuffle([{v:it.a,label:it.a,ok:true,type:null},...it.w.map(x=>({v:x,label:x,ok:false,type:it.erro||'confundiu o conceito'}))]);
  return{skill,text:it.q,visual:it.e?`<div class="emo" style="font-size:72px">${it.e}</div>`:'',desc:it.q,optClass:ops.some(o=>o.label.length>12)?'sent':'txt',options:ops,hint:it.h||'Pense no que você faz no dia a dia.',explain:it.x}};f.banco=bank;return f}
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


/* ================= LOTE 2 · 17/11/2026 ================= */
/* ---- Dinheiro (educação financeira) ---- */
const COR_NOTA={2:'#6FA8DC',5:'#B58BD9',10:'#E06666',20:'#F6C342',50:'#E69138'};
function dinheiroHTML(vals){return '<div class="dinheiro">'+vals.map(v=>v===1?'<span class="moeda">R$ 1</span>':`<span class="nota" style="background:${COR_NOTA[v]||'#9BC59D'}">R$ ${v}</span>`).join('')+'</div>'}
function trocoEm(v){const r=[];for(const n of [10,5,2,1])while(v>=n){r.push(n);v-=n}return r}
const ITENS_LOJA=[['🧸','um ursinho'],['⚽','uma bola'],['🪁','uma pipa'],['🖍️','um giz de cera'],['🧃','um suco'],['🍦','um sorvete'],['📒','um caderno'],['🎈','um balão'],['🍫','um chocolate'],['🪀','um ioiô']];
Object.assign(GEN,{
  contarDinheiro(){let vals,t;do{vals=Array.from({length:rnd(2,4)},()=>pick([1,1,2,2,5,10])).sort((a,b)=>b-a);t=vals.reduce((a,b)=>a+b,0)}while(t>30);
    return{skill:'Contar dinheiro',text:'Quanto dinheiro tem aqui, em reais?',visual:dinheiroHTML(vals),desc:vals.map(v=>'R$ '+v).join(' + '),
    options:opts(t,[{v:vals.length,type:'contou as notas em vez dos valores'},{v:t+1,type:'errou a soma'},{v:t-1,type:'errou a soma'}]),
    hint:'Comece pela nota maior e vá somando as outras.',explain:`${vals.join(' + ')} = ${t}. São ${t} reais.`}},
  podeComprar(){const tenho=rnd(4,15),its=shuffle(ITENS_LOJA.slice()).slice(0,3),precos=[rnd(1,tenho),rnd(tenho+1,tenho+8),rnd(tenho+1,tenho+8)];
    return{skill:'Comprar com o que tem',text:`Você tem R$ ${tenho}. O que dá para comprar?`,speak:`Você tem ${tenho} reais. O que dá para comprar?`,visual:dinheiroHTML(trocoEm(tenho)),desc:`tem R$ ${tenho}`,optClass:'txt',
    options:shuffle(its.map((it,i)=>({v:it[1],label:`${it[0]} R$ ${precos[i]}`,ok:i===0,type:i===0?null:'escolheu algo mais caro que o dinheiro'}))),
    hint:'Compare o preço com o dinheiro que você tem. O preço precisa ser igual ou menor.',explain:`${cap1(its[0][1])} custa R$ ${precos[0]}, e você tem R$ ${tenho}. Dá para comprar! Os outros custam mais do que você tem.`}},
  troco(){const pago=pick([5,10,10,20]),preco=rnd(1,pago-1),r=pago-preco,it=pick(ITENS_LOJA);
    return{skill:'Troco',text:`${cap1(it[1])} custa R$ ${preco}. Você pagou com R$ ${pago}. Quanto recebe de troco?`,speak:`${it[1]} custa ${preco} reais. Você pagou com ${pago} reais. Quanto recebe de troco?`,visual:`<div class="emo" style="font-size:56px">${it[0]}</div>`+dinheiroHTML([pago]),desc:`${pago} − ${preco}`,
    options:opts(r,[{v:preco,type:'respondeu o preço'},{v:pago+preco,type:'somou em vez de subtrair'},{v:r+1,type:'errou a conta'}]),
    hint:'Troco é o que sobra: o dinheiro que você deu menos o preço.',explain:`${pago} menos ${preco} dá ${r}. O troco é R$ ${r}.`}},
  guardarMeta(){const g=pick([1,2,5]),k=rnd(2,6),m=g*k,it=pick(ITENS_LOJA);
    return{skill:'Guardar para um objetivo',text:`Você guarda R$ ${g} por semana. Em quantas semanas junta R$ ${m} para comprar ${it[1]}?`,speak:`Você guarda ${g} reais por semana. Em quantas semanas junta ${m} reais?`,visual:`<div class="emo" style="font-size:56px">🐷 → ${it[0]}</div>`,desc:`${m} ÷ ${g}`,
    options:opts(k,[{v:m,type:'respondeu o preço'},{v:k+1,type:'contou uma semana a mais'},{v:k-1,type:'contou uma semana a menos'}]),
    hint:`Conte de ${g} em ${g} até chegar em ${m}. Quantos pulos?`,explain:`Contando de ${g} em ${g}: ${Array.from({length:k},(_,i)=>g*(i+1)).join(', ')}. São ${k} semanas.`}},
  precisarQuerer:(()=>{const P=[['🍞','Comida para o almoço'],['💊','Remédio quando está doente'],['🪥','Escova de dentes'],['🧥','Casaco no frio'],['✏️','Lápis para a escola'],['👟','Sapato que serve no pé'],['💧','Água para beber']],
      Q=[['🧸','Um brinquedo novo'],['🍬','Bala na saída da escola'],['🎮','Videogame'],['🃏','Mais figurinhas'],['🍦','Sorvete'],['✨','Tênis que acende luz'],['🎀','Mais um laço de cabelo']];
    return()=>{const pr=Math.random()<.5,it=pick(pr?P:Q),c=pr?'Precisar':'Querer';
      return{skill:'Precisar ou querer',text:`${it[1]}: é precisar ou querer?`,visual:`<div class="emo" style="font-size:72px">${it[0]}</div>`,desc:it[1],optClass:'txt',
      options:['Precisar','Querer'].map(v=>({v,label:v==='Precisar'?'✅ Precisar':'💭 Querer',ok:v===c,type:v===c?null:'confundiu precisar com querer'})),
      hint:'Precisar é o que faz falta para viver bem e com saúde. Querer é o que seria legal ter, mas dá para esperar.',
      explain:pr?`${it[1]} é precisar: faz falta para a saúde e o dia a dia.`:`${it[1]} é querer: é legal, mas dá para viver sem e esperar.`}}})(),
});
const FIN_LESSONS=[
  {id:'dinheiro',titulo:'Moedas e cédulas',icone:'🪙',bncc:'EF02MA20',
   slides:[
    {t:'No Brasil, o nosso dinheiro se chama real. Tem moedas e tem notas, que também se chamam cédulas.',v:dinheiroHTML([1,2,5,10,20])},
    {t:'Para saber quanto dinheiro temos, somamos o valor de cada nota e moeda. Uma nota de 5 e uma de 2 dão 7 reais.',v:dinheiroHTML([5,2])+'<div class="big">= R$ 7</div>'}],
   practice:['contarDinheiro','contarDinheiro','podeComprar','contarDinheiro','podeComprar','contarDinheiro'],quiz:['contarDinheiro','podeComprar','contarDinheiro','podeComprar','contarDinheiro']},
  {id:'troco',titulo:'Comprar e troco',icone:'🛒',bncc:'EF02MA20',
   slides:[
    {t:'Quando pagamos com mais dinheiro do que o preço, recebemos troco. Troco é o que sobra.',v:'<div class="emo" style="font-size:56px">🧃</div>'+dinheiroHTML([10])},
    {t:'O suco custa 3 reais e você pagou com 10. 10 menos 3 dá 7. O troco é 7 reais.',v:'<div class="big">10 − 3 = 7</div>'}],
   practice:['troco','troco','podeComprar','troco','troco','podeComprar'],quiz:['troco','troco','podeComprar','troco','troco']},
  {id:'precisar',titulo:'Precisar, querer e guardar',icone:'🐷',bncc:'Ed. financeira',
   slides:[
    {t:'Algumas coisas a gente precisa, como comida e remédio. Outras a gente quer, como um brinquedo novo. O que a gente quer pode esperar.',v:'<div class="emo" style="font-size:56px">🍞 💊 &nbsp;|&nbsp; 🧸 🎮</div>'},
    {t:'Para comprar algo que queremos, podemos guardar um pouco de dinheiro toda semana no cofrinho até juntar.',v:'<div class="emo" style="font-size:64px">🐷💰</div>'},
    {t:'Uma boa ideia é ter três potes: um para gastar agora, um para guardar para uma meta e um para investir.',v:'<div class="potes"><span>🛍️<b>Gastar</b></span><span>🐷<b>Guardar</b></span><span>📈<b>Investir</b></span></div>'},
    {t:'Investir é deixar o dinheiro quietinho para ele crescer com o tempo. O dinheiro do pote Investir não é para gastar: ele vai ganhando um pouquinho a mais todo mês.',v:'<div class="emo" style="font-size:56px">🌱 → 🌿 → 🌳</div>'}],
   practice:['precisarQuerer','precisarQuerer','guardarMeta','precisarQuerer','guardarMeta','precisarQuerer'],quiz:['precisarQuerer','guardarMeta','precisarQuerer','guardarMeta','precisarQuerer']},
];

/* ---- Lógica ---- */
const SIMBOLOS=[['🔴','🔵','🟡'],['🍎','🍌','🍇'],['⭐','🌙','☀️'],['🐶','🐱','🐭'],['🟥','🟩','🟦']];
const PADROES={AB:[0,1],AAB:[0,0,1],ABB:[0,1,1],ABC:[0,1,2],AABB:[0,0,1,1]};
const SETAS={'⬆️':[0,-1],'➡️':[1,0],'⬇️':[0,1],'⬅️':[-1,0]};
Object.assign(GEN,{
  padrao(){const sim=pick(SIMBOLOS),[nome,pp]=pick(Object.entries(PADROES)),len=pp.length*2+rnd(0,pp.length-1),seq=Array.from({length:len},(_,i)=>sim[pp[i%pp.length]]),r=sim[pp[len%pp.length]];
    return{skill:'Padrões',text:'Qual vem depois na sequência?',visual:`<div class="emo" style="font-size:40px;letter-spacing:6px">${seq.join('')}❓</div>`,desc:`padrão ${nome}: ${seq.join('')}`,optClass:'txt',
    options:shuffle(sim.map(v=>({v,label:v,ok:v===r,type:v===r?null:'não percebeu a repetição'}))),
    hint:'Procure o pedaço que se repete e continue a repetição.',explain:`O pedaço que se repete é ${pp.map(i=>sim[i]).join('')}. Depois vem ${r}.`}},
  setas(){const N=4;let x,y,cam,ex,ey;
    for(;;){x=rnd(0,N-1);y=rnd(0,N-1);cam=[];let cx=x,cy=y;const n=rnd(2,4);
      for(let i=0;i<n;i++){const ops=Object.entries(SETAS).filter(([k,[dx,dy]])=>cx+dx>=0&&cx+dx<N&&cy+dy>=0&&cy+dy<N);const [k,[dx,dy]]=pick(ops);cam.push(k);cx+=dx;cy+=dy}
      if(cx!==x||cy!==y){ex=cx;ey=cy;break}}
    const livres=[];for(let i=0;i<N;i++)for(let j=0;j<N;j++)if(!(i===ex&&j===ey)&&!(i===x&&j===y))livres.push([i,j]);
    const [o1,o2]=shuffle(livres),obj={[`${ex},${ey}`]:'🍎',[`${o1[0]},${o1[1]}`]:'⭐',[`${o2[0]},${o2[1]}`]:'🏠'};
    let g='<div class="grade">';for(let j=0;j<N;j++)for(let i=0;i<N;i++)g+=`<span>${i===x&&j===y?'🤖':(obj[`${i},${j}`]||'')}</span>`;g+='</div>';
    return{skill:'Seguir comandos',text:'O robô segue as setas. Onde ele chega?',visual:g+`<div class="emo" style="font-size:36px">${cam.join(' ')}</div>`,desc:`${cam.join(' ')} a partir de ${x},${y}`,optClass:'txt',
    options:shuffle(['🍎','⭐','🏠'].map(v=>({v,label:v,ok:v==='🍎',type:v==='🍎'?null:'errou a direção de uma seta'}))),
    hint:'Coloque o dedo no robô e ande um quadradinho para cada seta, na ordem.',explain:`Seguindo ${cam.join(' ')} a partir do robô, ele chega na 🍎.`}},
  passos:bankGen('Passo a passo',[
    {q:'Para escovar os dentes, o que fazemos primeiro?',a:'Colocar pasta na escova',w:['Enxaguar a boca','Guardar a escova'],e:'🪥',x:'Primeiro a pasta na escova, depois escovar, depois enxaguar.'},
    {q:'Para plantar uma semente, o que vem primeiro?',a:'Fazer um buraquinho na terra',w:['Regar a planta grande','Colher a flor'],e:'🌱',x:'Primeiro o buraquinho, depois a semente, terra por cima e água.'},
    {q:'Para tomar banho, o que fazemos por último?',a:'Secar com a toalha',w:['Abrir o chuveiro','Passar sabonete'],e:'🛁',x:'O último passo é secar com a toalha.'},
    {q:'Para fazer um sanduíche, o que vem primeiro?',a:'Pegar o pão',w:['Comer o sanduíche','Lavar o prato'],e:'🥪',x:'Primeiro o pão, depois o recheio, e só então comer.'},
    {q:'Para atravessar a rua, o que fazemos primeiro?',a:'Parar e olhar para os dois lados',w:['Correr','Fechar os olhos'],e:'🚦',x:'Primeiro paramos e olhamos para os dois lados, de mãos dadas com um adulto.'},
    {q:'Para calçar o tênis, o que vem antes?',a:'Colocar a meia',w:['Amarrar o cadarço','Sair para brincar'],e:'👟',x:'A meia vem antes do tênis, e o cadarço depois.'},
    {q:'Para fazer um desenho colorido, o que vem primeiro?',a:'Desenhar o contorno',w:['Mostrar para a mamãe','Guardar os lápis'],e:'🎨',x:'Primeiro desenhamos, depois pintamos e por fim guardamos o material.'},
    {q:'De manhã, o que fazemos antes de ir para a escola?',a:'Tomar café da manhã',w:['Jantar','Dormir'],e:'🌅',x:'De manhã tomamos café antes de ir para a escola.'},
    {q:'Para lavar as mãos, o que vem depois de molhar?',a:'Passar sabonete',w:['Secar','Abrir a torneira'],e:'🧼',x:'Molhar, ensaboar, esfregar, enxaguar e secar.'},
    {q:'Para ler um livro, o que fazemos primeiro?',a:'Abrir na primeira página',w:['Ler a última página','Fechar o livro'],e:'📖',x:'Começamos pela primeira página e seguimos em ordem.'}]),
});
const LOG_LESSONS=[
  {id:'padroes',titulo:'Padrões e sequências',icone:'🔁',bncc:'EF02MA10',
   slides:[{t:'Um padrão é algo que se repete sempre do mesmo jeito. Vermelho, azul, vermelho, azul...',v:'<div class="emo" style="font-size:44px">🔴🔵🔴🔵🔴🔵</div>'},
    {t:'Para descobrir o que vem depois, ache o pedaço que se repete e continue.',v:'<div class="emo" style="font-size:44px">🍎🍎🍌 🍎🍎🍌 🍎🍎❓</div>'}],
   practice:['padrao','padrao','padrao','padrao','padrao','padrao'],quiz:['padrao','padrao','padrao','padrao','padrao']},
  {id:'robo',titulo:'Programe o robô',icone:'🤖',bncc:'Computação',
   slides:[{t:'O robô só faz o que as setas mandam. Cada seta é um passo de um quadradinho.',v:'<div class="emo" style="font-size:44px">⬆️ ➡️ ⬇️ ⬅️</div>'},
    {t:'Ele segue as setas na ordem, uma de cada vez. Use o dedo para ajudar!',v:'<div class="emo" style="font-size:44px">🤖 ➡️ ➡️ 🍎</div>'}],
   practice:['setas','setas','setas','setas','setas','setas'],quiz:['setas','setas','setas','setas','setas']},
  {id:'passos',titulo:'Passo a passo',icone:'🪜',bncc:'Computação',
   slides:[{t:'Quase tudo que fazemos tem uma ordem de passos. Se trocar a ordem, não dá certo!',v:'<div class="emo" style="font-size:48px">1️⃣ 2️⃣ 3️⃣</div>'},
    {t:'Calçar o tênis antes da meia não funciona. Primeiro a meia, depois o tênis.',v:'<div class="emo" style="font-size:56px">🧦 → 👟</div>'}],
   practice:['passos','passos','passos','passos','passos','passos'],quiz:['passos','passos','passos','passos','passos']},
];

/* ---- Emoções e convivência ---- */
Object.assign(GEN,{
  sentir:bankGen('Nomear emoções',[
    {q:'Você ganhou um presente de aniversário. Como se sente?',a:'😄 Feliz',w:['😢 Triste','😠 Com raiva'],e:'🎁',x:'Ganhar um presente deixa a gente feliz.',erro:'confundiu as emoções'},
    {q:'Seu cachorrinho ficou doente. Como você se sente?',a:'😢 Triste',w:['😄 Feliz','😮 Surpresa'],e:'🐶',x:'Quando alguém que amamos está mal, ficamos tristes. Tudo bem sentir isso.',erro:'confundiu as emoções'},
    {q:'Um colega pegou seu brinquedo sem pedir. Como você se sente?',a:'😠 Com raiva',w:['😄 Feliz','😴 Com sono'],e:'🧸',x:'É normal sentir raiva. O importante é o que fazemos com ela.',erro:'confundiu as emoções'},
    {q:'Ouviu um trovão muito forte de noite. Como pode se sentir?',a:'😨 Com medo',w:['😄 Feliz','😠 Com raiva'],e:'⛈️',x:'Barulho forte no escuro pode dar medo. Dá para chamar um adulto.',erro:'confundiu as emoções'},
    {q:'Achou um bilhete de carinho na mochila que não esperava. Como se sente?',a:'😮 Surpresa',w:['😢 Triste','😨 Com medo'],e:'💌',x:'Quando algo bom acontece sem esperar, sentimos surpresa.',erro:'confundiu as emoções'},
    {q:'Você terminou um quebra-cabeça difícil sozinha. Como se sente?',a:'😊 Orgulhosa',w:['😢 Triste','😨 Com medo'],e:'🧩',x:'Quando conseguimos algo difícil, sentimos orgulho.',erro:'confundiu as emoções'},
    {q:'Seu melhor amigo mudou de cidade. Como você pode se sentir?',a:'😢 Triste',w:['😄 Feliz','😠 Com raiva'],e:'🚚',x:'Sentir saudade de quem gostamos dá tristeza.',erro:'confundiu as emoções'},
    {q:'Vai começar o primeiro dia numa escola nova. Como pode se sentir?',a:'😬 Nervosa',w:['😴 Com sono','😠 Com raiva'],e:'🏫',x:'Coisas novas podem deixar a gente nervosa. Isso passa com o tempo.',erro:'confundiu as emoções'},
    {q:'Seu irmão rasgou seu desenho de propósito. Como pode se sentir?',a:'😠 Com raiva',w:['😄 Feliz','😮 Surpresa'],e:'📄',x:'Ficamos com raiva quando estragam algo nosso. Conversar ajuda.',erro:'confundiu as emoções'},
    {q:'A família toda vai ao parque no domingo. Como você se sente?',a:'🤩 Animada',w:['😢 Triste','😨 Com medo'],e:'🎡',x:'Esperar algo legal deixa a gente animada.',erro:'confundiu as emoções'}]),
  conviver:bankGen('Resolver conflitos',[
    {q:'Um colega empurrou você na fila. O que é melhor fazer?',a:'Dizer que não gostou e avisar a professora',w:['Empurrar de volta','Gritar com ele'],e:'🧍',x:'Falar com calma e pedir ajuda a um adulto resolve sem machucar ninguém.',erro:'escolheu revidar'},
    {q:'Você perdeu no jogo. O que é melhor fazer?',a:'Respirar fundo e jogar de novo',w:['Jogar as peças no chão','Dizer que o outro roubou'],e:'🎲',x:'Perder faz parte. Respirar fundo e tentar de novo é o melhor.',erro:'não lidou bem com a frustração'},
    {q:'Duas crianças querem o mesmo balanço. O que é justo?',a:'Combinar e revezar',w:['Puxar a outra criança','Chorar até ganhar'],e:'🛝',x:'Revezar é justo: cada um brinca um pouco.',erro:'escolheu brigar'},
    {q:'Você está com muita raiva. O que pode ajudar?',a:'Respirar fundo e contar até 10',w:['Bater em alguém','Quebrar um brinquedo'],e:'😤',x:'Respirar e contar acalma o corpo, e depois dá para conversar.',erro:'escolheu revidar'},
    {q:'Uma colega está sozinha e triste no recreio. O que você pode fazer?',a:'Convidar para brincar',w:['Rir dela','Fingir que não viu'],e:'🤝',x:'Convidar alguém para brincar é ser gentil e faz a pessoa se sentir melhor.',erro:'não percebeu o outro'},
    {q:'Sem querer, você derrubou o lanche do amigo. O que fazer?',a:'Pedir desculpas e ajudar a limpar',w:['Sair correndo','Dizer que foi outra pessoa'],e:'🥤',x:'Pedir desculpas e ajudar mostra respeito.',erro:'não assumiu o erro'},
    {q:'Um amigo pediu seu lápis emprestado. O que é gentil?',a:'Emprestar e pedir para devolver depois',w:['Esconder o lápis','Dizer que não tem'],e:'✏️',x:'Emprestar e combinar a devolução é ser gentil e cuidadoso.',erro:'escolheu não compartilhar'},
    {q:'Alguém está falando mal de um colega. O que fazer?',a:'Não participar e defender o colega',w:['Rir junto','Contar para todo mundo'],e:'🗣️',x:'Não participar de maldade e defender o colega é coragem.',erro:'acompanhou a maldade'},
    {q:'Você não entendeu a lição. O que fazer?',a:'Pedir ajuda à professora ou ao papai',w:['Desistir','Ficar brava consigo mesma'],e:'🙋',x:'Pedir ajuda é inteligente. Todo mundo aprende assim.',erro:'desistiu'},
    {q:'Seu amigo ganhou o jogo de você. O que dizer?',a:'Parabéns, jogou bem!',w:['Não brinco mais com você','Foi sorte!'],e:'🏆',x:'Dar parabéns mostra que sabemos perder e ganhar com respeito.',erro:'não lidou bem com a frustração'}]),
});
const EMO_LESSONS=[
  {id:'sentimentos',titulo:'O que eu sinto',icone:'😊',bncc:'Competência 8',
   slides:[{t:'Todo mundo sente coisas diferentes: alegria, tristeza, raiva, medo e surpresa. Todos esses sentimentos são normais.',v:'<div class="emo" style="font-size:52px">😄 😢 😠 😨 😮</div>'},
    {t:'Dar nome ao que sentimos ajuda a entender e a pedir ajuda. Por exemplo: estou triste porque meu amigo foi embora.',v:'<div class="emo" style="font-size:64px">💬</div>'}],
   practice:['sentir','sentir','sentir','sentir','sentir','sentir'],quiz:['sentir','sentir','sentir','sentir','sentir']},
  {id:'conviver',titulo:'Resolver conflitos',icone:'🤝',bncc:'Competência 9',
   slides:[{t:'Quando alguém faz algo que não gostamos, dá vontade de revidar. Mas revidar só piora.',v:'<div class="emo" style="font-size:56px">😤 ➡️ 🌬️ ➡️ 🙂</div>'},
    {t:'O melhor é respirar fundo, falar com calma o que sentimos e, se precisar, chamar um adulto.',v:'<div class="emo" style="font-size:56px">🗣️ 🤝 🙋</div>'}],
   practice:['conviver','conviver','conviver','conviver','conviver','conviver'],quiz:['conviver','conviver','conviver','conviver','conviver']},
];

/* ---- Contas com resposta digitada (evita chute) ---- */
['somaPequena','soma2','somaHist','subPequena','sub2','subHist','somaReserva','somaReservaHist','subReserva','subReservaHist','pular','pularFalta','depois','antes','seq','contarDinheiro','troco','guardarMeta'].forEach(k=>{
  const g=GEN[k];GEN[k]=()=>{const q=g();q.num=true;q.answer=q.options.find(o=>o.ok).v;return q}});

/* ---- Missões fora da tela (uma por semana) ---- */
const MISSOES=[
  {icone:'✏️',materia:'Português',texto:'Copie no caderno, com letra caprichada, uma frase do livro que vocês leram esta semana.'},
  {icone:'🗣️',materia:'Leitura',texto:'Depois de uma leitura, conte a história para alguém da família com as suas palavras.'},
  {icone:'📏',materia:'Matemática',texto:'Com uma régua ou fita métrica, meça 3 objetos da casa e anote quantos centímetros cada um tem.'},
  {icone:'🐷',materia:'Dinheiro',texto:'Separe três potes: Gastar, Guardar e Investir. Divida o dinheirinho da semana entre eles.'},
  {icone:'🛒',materia:'Dinheiro',texto:'No mercado, ajude a encontrar o mais barato entre dois produtos iguais.'},
  {icone:'🌱',materia:'Ciências',texto:'Plante um feijão no algodão molhado e desenhe como ele está a cada 2 dias.'},
  {icone:'🧩',materia:'Lógica',texto:'Monte um caminho no chão e dê comandos (frente, vira à direita) para alguém chegar até o final.'},
  {icone:'🔢',materia:'Matemática',texto:'Conte de 2 em 2 usando tampinhas ou feijões até chegar em 30.'},
  {icone:'💛',materia:'Emoções',texto:'Desenhe uma carinha para o sentimento de cada dia da semana e conte por que se sentiu assim.'},
  {icone:'🗺️',materia:'Geografia',texto:'Desenhe o caminho da sua casa até a escola, com as coisas que você vê no meio.'},
  {icone:'🏛️',materia:'História',texto:'Pergunte a um avô ou avó do que eles brincavam quando eram crianças e faça um desenho.'},
  {icone:'🧼',materia:'Ciências',texto:'Ensine para a família o jeito certo de lavar as mãos, contando até 20.'},
  {icone:'🕐',materia:'Matemática',texto:'Olhe o relógio na hora do almoço e do jantar e desenhe onde estavam os ponteiros.'},
  {icone:'📚',materia:'Leitura',texto:'Escolha um livro novo na biblioteca ou na estante de casa e leiam juntos.'},
  {icone:'🎁',materia:'Emoções',texto:'Faça um desenho ou um bilhete de carinho para alguém da família.'},
  {icone:'🔤',materia:'Português',texto:'Encontre em casa 5 coisas que começam com a letra B e escreva os nomes.'},
];
const LEIT_PERGUNTAS=['O que você acha que vai acontecer agora?','Como o personagem está se sentindo? Por quê?','O que você faria no lugar dele?','Qual foi a parte mais legal até agora?','Tem alguma palavra que você não conhecia?','Onde e quando essa história acontece?','Quem é o personagem principal?','Por que você acha que ele fez isso?','Essa história parece com algo que já aconteceu com você?','Como você acha que a história vai terminar?','Se pudesse mudar o final, como seria?','O que o desenho dessa página mostra?','Qual personagem você mais gostou? Por quê?','O que aconteceu primeiro, depois e por último?','Você daria outro nome para o livro? Qual?'];

/* ================= LOTE 3 · 17/11/2026 · mais variedade, níveis e reforços ================= */
/* Níveis de dificuldade: o app calcula NIVEL[habilidade] (1 a 3) pelo desempenho dela. */
const NIVEL={};const nv=sk=>NIVEL[sk]||1;const LIM={1:30,2:60,3:99};
const comoNum=g=>()=>{const q=g();q.num=true;q.answer=q.options.find(o=>o.ok).v;return q};
function addBanco(k,itens,erro){const b=GEN[k].banco;itens.forEach(([q,a,w,e,x])=>b.push({q,a,w,e,x,erro}))}
Object.assign(GEN,{
  depois:comoNum(()=>{const L=LIM[nv('Antes e depois')],n=Math.random()<.4?rnd(1,Math.floor(L/10))*10-1:rnd(1,L-1),a=n+1;return{skill:'Antes e depois',text:`Qual número vem logo depois do ${n}?`,visual:numline([n,'?']),desc:`depois de ${n}`,
    options:opts(a,[{v:n-1,type:'confundiu antes com depois'},{v:n+10,type:'pulou uma dezena'},{v:n+2,type:'errou por 1'}]),hint:'Depois é um a mais. Conte mais um.',explain:n%10===9?`Depois do ${n} a dezena muda: vem o ${a}.`:`Um a mais que ${n} é ${a}.`}}),
  antes:comoNum(()=>{const L=LIM[nv('Antes e depois')],n=Math.random()<.4?rnd(1,Math.floor(L/10))*10:rnd(2,L),a=n-1;return{skill:'Antes e depois',text:`Qual número vem logo antes do ${n}?`,visual:numline(['?',n]),desc:`antes de ${n}`,
    options:opts(a,[{v:n+1,type:'confundiu antes com depois'},{v:n-10,type:'pulou uma dezena'},{v:n-2,type:'errou por 1'}]),hint:'Antes é um a menos. Conte para trás.',explain:n%10===0?`Antes do ${n} vem o ${a}: a dezena anterior termina no 9.`:`Um a menos que ${n} é ${a}.`}}),
  seq:comoNum(()=>{const L=LIM[nv('Antes e depois')],a=rnd(1,L-3),r=a+3;return{skill:'Antes e depois',text:'Qual número completa a fila?',visual:numline([a,a+1,a+2,'?']),desc:`sequência ${a}, ${a+1}, ${a+2}, ?`,
    options:opts(r,[{v:a+2,type:'repetiu o último'},{v:a+4,type:'errou por 1'},{v:a+13,type:'pulou uma dezena'}]),hint:'Cada número é um a mais que o anterior.',explain:`Depois do ${a+2} vem o ${r}.`}}),
  retaFalta:comoNum(()=>{const L=LIM[nv('Reta numérica')],a=rnd(0,L-4),pos=rnd(1,4),arr=[a,a+1,a+2,a+3,a+4],r=arr[pos];arr[pos]='?';return{skill:'Reta numérica',text:'Qual número está escondido na reta?',visual:numline(arr),desc:`reta ${a} a ${a+4}, falta ${r}`,
    options:opts(r,[{v:r+1,type:'contou um a mais'},{v:r-1,type:'contou um a menos'},{v:r+10,type:'confundiu a dezena'}]),hint:'Os números da reta crescem de 1 em 1. Olhe o vizinho da esquerda e some 1.',explain:`O vizinho da esquerda é ${r-1}. Um a mais dá ${r}.`}}),
  vizinhos(){const L=LIM[nv('Reta numérica')],n=rnd(2,L-1);return{skill:'Reta numérica',text:`Quem são os vizinhos do ${n}?`,visual:numline(['?',n,'?'],1),desc:`vizinhos de ${n}`,optClass:'txt',
    options:shuffle([{v:'ok',label:`${n-1} e ${n+1}`,ok:true,type:null},{v:'a',label:`${n} e ${n+2}`,ok:false,type:'errou o vizinho de trás'},{v:'b',label:`${n-10} e ${n+10}`,ok:false,type:'confundiu vizinho com dezena'}]),
    hint:'O vizinho de trás é um a menos. O da frente é um a mais.',explain:`Um a menos que ${n} é ${n-1}. Um a mais é ${n+1}.`}},
  pular:comoNum(()=>{const l=nv('Contar pulando'),st=l===1?pick([10,2]):pick([2,5,10]),max=l===1?(st===10?50:20):l===2?60:100,a=st*rnd(0,Math.max(0,Math.floor(max/st)-3)),seq=[a,a+st,a+2*st],r=a+3*st;
    return{skill:'Contar pulando',text:`Contando de ${st} em ${st}, qual número vem depois?`,visual:numline([...seq,'?']),desc:`de ${st} em ${st}: ${seq.join(', ')}, ?`,
    options:opts(r,[{v:a+2*st+1,type:'contou de 1 em 1'},{v:r+st,type:'pulou um número'},{v:r-1,type:'errou a soma do pulo'}]),hint:`Some ${st} ao último número. Pode usar os dedos!`,explain:`${a+2*st} mais ${st} dá ${r}.`}}),
  pularFalta:comoNum(()=>{const l=nv('Contar pulando'),st=l===1?pick([10,2]):pick([2,5,10]),max=l===1?(st===10?50:20):l===2?60:100,a=st*rnd(1,Math.max(1,Math.floor(max/st)-2)),r=a+st;
    return{skill:'Contar pulando',text:'Qual número está faltando na fila?',visual:numline([a-st,a,'?',a+2*st]),desc:`de ${st} em ${st}: ${a-st}, ${a}, ?, ${a+2*st}`,
    options:opts(r,[{v:a+1,type:'contou de 1 em 1'},{v:a+2*st,type:'repetiu o próximo'},{v:r+1,type:'errou a soma do pulo'}]),hint:'Descubra de quanto em quanto a fila pula.',explain:`A fila pula de ${st} em ${st}. Depois do ${a} vem ${r}.`}}),
  soma2:comoNum(()=>{const l=nv('Somar dezenas e unidades');let a1,b1,a0,b0;if(l===1){a1=rnd(1,3);b1=0;a0=rnd(0,7);b0=rnd(1,9-a0)}else if(l===2){a1=rnd(1,5);b1=rnd(1,8-a1>4?4:8-a1);a0=rnd(0,8);b0=rnd(0,9-a0)}else{a1=rnd(1,7);b1=rnd(1,8-a1);a0=rnd(0,8);b0=rnd(0,9-a0)}
    const a=a1*10+a0,b=b1*10+b0,s=a+b;return{skill:'Somar dezenas e unidades',text:`Quanto é ${a} mais ${b}?`,visual:cols(a,b,'+'),desc:`${a} + ${b}`,
    options:opts(s,[{v:s+10,type:'errou nas dezenas'},{v:s-10,type:'errou nas dezenas'},{v:s+1,type:'errou nas unidades'},{v:a-b,type:'subtraiu em vez de somar'}]),
    hint:'Some primeiro as unidades. Depois some as dezenas.',explain:`Unidades: ${a0} mais ${b0} dá ${a0+b0}. Dezenas: ${a1} mais ${b1} dá ${a1+b1}. Resultado: ${s}.`}}),
  sub2:comoNum(()=>{const l=nv('Subtrair dezenas e unidades');let a1,b1,a0,b0;if(l===1){a1=rnd(1,3);b1=0;a0=rnd(2,9);b0=rnd(1,a0)}else if(l===2){a1=rnd(2,5);b1=rnd(1,a1-1);a0=rnd(1,9);b0=rnd(0,a0)}else{a1=rnd(2,9);b1=rnd(1,a1-1);a0=rnd(1,9);b0=rnd(0,a0)}
    const a=a1*10+a0,b=b1*10+b0,r=a-b;return{skill:'Subtrair dezenas e unidades',text:`Quanto é ${a} menos ${b}?`,visual:cols(a,b,'−'),desc:`${a} − ${b}`,
    options:opts(r,[{v:a+b,type:'somou em vez de subtrair'},{v:r+10,type:'errou nas dezenas'},{v:r-1,type:'errou nas unidades'},{v:r+1,type:'errou nas unidades'}]),
    hint:'Tire primeiro as unidades. Depois tire as dezenas.',explain:`Unidades: ${a0} menos ${b0} dá ${a0-b0}. Dezenas: ${a1} menos ${b1} dá ${a1-b1}. Resultado: ${r}.`}}),
  blocks(){const L=LIM[nv('Ler números com blocos')],t=rnd(1,Math.min(8,Math.floor(L/10))),u=rnd(0,9),n=t*10+u;return{skill:'Ler números com blocos',text:'Que número os blocos mostram?',visual:blocksHTML(t,u),desc:`${t} dezenas e ${u} unidades`,
    options:opts(n,[{v:u*10+t,type:'trocou dezena com unidade'},{v:n+10,type:'contou dezenas errado'},{v:n-1,type:'contou unidades errado'},{v:n+1,type:'contou unidades errado'}]),
    hint:'Conte as barras de 10 em 10. Depois continue contando os cubinhos soltos.',explain:`São ${t} dezenas, que dão ${t*10}, e mais ${u} unidades. ${t*10} mais ${u} é ${n}.`}},
  letraAntes(){const i=rnd(1,25),l=ALFABETO[i],r=ALFABETO[i-1],c=[ALFABETO[i+1],ALFABETO[i-2],ALFABETO[i+2]].filter(x=>x&&x!==r).slice(0,2);
    return{skill:'Ordem alfabética',text:`Qual letra vem logo antes do ${l}?`,speak:`Qual letra vem logo antes do ${l.toLowerCase()}?`,visual:`<div class="big">? → ${l}</div>`,desc:`antes de ${l}`,optClass:'txt',
    options:shuffle([r,...c].map(v=>({v,label:v,ok:v===r,type:v===r?null:(v===ALFABETO[i+1]?'confundiu antes com depois':'errou a sequência do alfabeto')}))),hint:'Cante o alfabeto até chegar nessa letra. Qual cantou logo antes?',explain:`No alfabeto, antes do ${l} vem o ${r}.`}},
  alfaApoio(){const pool=shuffle(PALAVRAS.map(p=>wordOf(p[0]))),ws=[];for(const w of pool){if(!ws.some(x=>x[0]===w[0]))ws.push(w);if(ws.length===3)break}
    const first=[...ws].sort((a,b)=>ALFABETO.indexOf(a[0])-ALFABETO.indexOf(b[0]))[0],ini=ws.map(w=>w[0]);
    return{skill:'Ordem alfabética',text:'Qual palavra vem primeiro na ordem alfabética? Use o alfabeto para ajudar!',speak:'Qual palavra vem primeiro na ordem alfabética? Olhe a primeira letra de cada uma no alfabeto.',
    visual:`<div class="alfa">${ALFABETO.split('').map(c=>`<span class="${ini.includes(c)?'hi':''}">${c}</span>`).join('')}</div>`,desc:ws.join(', ')+' (com apoio)',optClass:'txt',
    options:shuffle(ws.map(v=>({v,label:v,ok:v===first,type:v===first?null:'não comparou a primeira letra'}))),hint:'As letras amarelas são as primeiras de cada palavra. Qual amarela aparece primeiro no alfabeto?',explain:`${first} começa com ${first[0]}, que aparece antes no alfabeto.`}},
});
/* mais palavras para os geradores de Português */
PALAVRAS.push(['PI-PO-CA','🍿'],['LÁ-PIS','✏️'],['BO-NÉ','🧢'],['CA-DEI-RA','🪑'],['GI-RA-FA','🦒'],['ZE-BRA','🦓'],['LE-ÃO','🦁'],['BA-LEI-A','🐋'],['FO-GUE-TE','🚀'],
  ['TE-LE-FO-NE','📞'],['RE-LÓ-GIO','⏰'],['CA-NE-TA','🖊️'],['LI-VRO','📖'],['ES-CO-VA','🪥'],['PEN-TE','🪮'],['CO-E-LHO','🐰'],['CA-CHOR-RO','🐶'],['MO-RAN-GO','🍓'],
  ['LA-RAN-JA','🍊'],['PIZ-ZA','🍕'],['QUEI-JO','🧀'],['SOR-VE-TE','🍦'],['BI-CI-CLE-TA','🚲'],['Ô-NI-BUS','🚌'],['A-VI-ÃO','✈️'],['NA-VI-O','🚢'],['ES-TRE-LA','⭐'],
  ['NU-VEM','☁️'],['TREM','🚆'],['JA-CA-RÉ','🐊'],['CA-RAN-GUE-JO','🦀'],['Ó-CU-LOS','👓'],['CO-RU-JA','🦉']);
RIMAS.push(['CAMA','LAMA'],['FOCA','BOCA'],['SAPO','TRAPO'],['BALEIA','SEREIA'],['LEÃO','FEIJÃO'],['COELHO','JOELHO'],['GALINHA','FARINHA'],['MARTELO','CHINELO'],
  ['NAVIO','RIO'],['PIPOCA','MINHOCA'],['BOLO','COLO'],['GIRAFA','GARRAFA'],['SORVETE','FOGUETE'],['QUEIJO','BEIJO'],['LUA','RUA'],['FITA','BONITA']);
FRASES.push(['A gata','bebe','água'],['O vovô','planta','uma árvore'],['A menina','pula','corda'],['O menino','come','uma banana'],['A Duda','lê','um gibi'],['O Theo','monta','um quebra-cabeça'],
  ['A abelha','faz','o mel'],['A professora','escreve','uma frase'],['A mamãe','prepara','o almoço'],['O cavalo','come','capim'],['A Malu','desenha','uma flor'],['O macaco','pega','a banana'],
  ['O Davi','empina','uma pipa'],['A vaca','dá','leite'],['O bombeiro','apaga','o fogo'],['O vovô','lê','o jornal'],['A Lara','pinta','um quadro'],['O padeiro','faz','o pão']);
DIGRAFOS.push(['BANHO','🛁','NH'],['SONHO','💭','NH'],['GOLFINHO','🐬','NH'],['CAMINHÃO','🚚','NH'],['PINHEIRO','🌲','NH'],['RAINHA','👑','NH'],
  ['MILHO','🌽','LH'],['PALHAÇO','🤡','LH'],['ESPELHO','🪞','LH'],['AGULHA','🪡','LH'],['GALHO','🌳','LH'],['FILHOTE','🐣','LH'],
  ['CHÁ','🍵','CH'],['CACHORRO','🐶','CH'],['MOCHILA','🎒','CH'],['BOLACHA','🍪','CH'],['FLECHA','🏹','CH'],['CHAMA','🔥','CH']);
/* bancos maiores */
addBanco('corpo',[
 ['Qual órgão bombeia o sangue pelo corpo?','O coração',['O pulmão','O estômago'],'❤️','O coração bate e empurra o sangue para o corpo todo.'],
 ['Com qual parte do corpo respiramos o ar?','Os pulmões',['O estômago','O coração'],'🫁','O ar entra pelo nariz e vai para os pulmões.'],
 ['Para onde vai a comida que engolimos?','Para o estômago',['Para os pulmões','Para o coração'],'🍽️','A comida desce até o estômago, onde é digerida.'],
 ['O que protege o nosso cérebro?','Os ossos da cabeça',['O cabelo','As orelhas'],'🧠','O crânio, os ossos da cabeça, protege o cérebro.'],
 ['Quantos sentidos nós temos?','5',['3','7'],'🖐️','Visão, audição, olfato, paladar e tato: 5 sentidos.'],
 ['O que acontece quando corremos muito?','O coração bate mais rápido',['O coração para','Ficamos mais baixos'],'🏃','Correndo, o corpo precisa de mais sangue, e o coração acelera.'],
 ['Por que devemos beber água?','O corpo precisa de água para funcionar',['Para ficar com sono','Só para matar a fome'],'💧','Quase tudo no nosso corpo precisa de água.'],
 ['Qual destes lanches é mais saudável?','Uma fruta',['Um refrigerante','Um pacote de balas'],'🍎','A fruta tem vitaminas e faz bem ao corpo.'],
 ['Quanto tempo devemos esfregar as mãos ao lavar?','Uns 20 segundos',['1 segundo','Só molhar e pronto'],'🧼','Esfregar bem, por uns 20 segundos, tira os germes.'],
 ['Por que dormimos à noite?','Para o corpo descansar e crescer',['Para ficar com fome','Porque o sol manda'],'😴','Dormindo, o corpo descansa e cresce.'],
 ['O que segura o nosso corpo em pé?','Os ossos e os músculos',['A pele','O cabelo'],'🦴','Os ossos são a estrutura, e os músculos fazem o corpo se mexer.'],
 ['Qual sentido usamos para ouvir uma música?','Audição',['Paladar','Olfato'],'🎵','Ouvimos com a audição, pelas orelhas.'],
 ['Qual sentido nos avisa que uma panela está quente?','Tato',['Audição','Paladar'],'♨️','O tato, pela pele, sente o quente e o frio. Cuidado com o fogão!'],
 ['Para que servem os dentes?','Para mastigar a comida',['Para ouvir','Para respirar'],'🦷','Os dentes cortam e mastigam a comida.'],
 ['Por que usamos protetor solar?','Para proteger a pele do sol',['Para ficar com frio','Para crescer o cabelo'],'🧴','O sol forte pode queimar a pele.'],
 ['Quando estamos doentes, o que é certo?','Avisar um adulto e descansar',['Esconder de todo mundo','Tomar remédio sozinha'],'🤒','Remédio, só com um adulto. Avisar e descansar ajuda a sarar.'],
 ['Onde fica o joelho?','Na perna',['No braço','Na cabeça'],'🦵','O joelho fica no meio da perna e deixa a perna dobrar.'],
 ['O que ajuda os dentes a não terem cárie?','Escovar e comer pouco doce',['Comer muito doce','Escovar só no domingo'],'🪥','Escovar sempre e comer menos doce protege os dentes.'],
 ['Qual parte do corpo nos ajuda a pegar as coisas?','As mãos',['Os joelhos','As orelhas'],'✋','Pegamos as coisas com as mãos.'],
 ['Por que devemos cortar as unhas?','Para não juntar sujeira e germes',['Para crescerem mais rápido','Para ouvir melhor'],'💅','Unha grande junta sujeira e germes.']],'confundiu o conceito');
addBanco('animais',[
 ['Qual destes animais vive no mar?','Polvo',['Coelho','Galinha'],'🐙','O polvo vive no mar e tem oito braços.'],
 ['Quantas patas tem uma aranha?','8',['4','6'],'🕷️','A aranha tem 8 patas. Os insetos têm 6.'],
 ['Quantas patas tem um inseto, como a formiga?','6',['4','8'],'🐜','Todo inseto tem 6 patas.'],
 ['Qual animal faz o mel?','Abelha',['Formiga','Borboleta'],'🍯','A abelha faz o mel com o néctar das flores.'],
 ['Qual destes é um mamífero, que mama quando é filhote?','Gato',['Galinha','Sapo'],'🐱','O gatinho mama o leite da mãe: é mamífero.'],
 ['Onde o passarinho coloca seus ovos?','No ninho',['Na água','No formigueiro'],'🪺','Os pássaros fazem ninhos para os ovos.'],
 ['O sapo começa a vida como...','Girino, na água',['Ovo de galinha','Lagarta'],'🐸','O sapo nasce como girino, que vive na água e depois vira sapo.'],
 ['Qual animal muda de cor para se esconder?','Camaleão',['Cachorro','Vaca'],'🦎','O camaleão muda de cor para se camuflar.'],
 ['Qual destes animais só come plantas?','Girafa',['Leão','Tubarão'],'🦒','A girafa é herbívora: come folhas das árvores.'],
 ['O que a baleia faz para respirar?','Sobe até a superfície',['Respira debaixo d’água como o peixe','Fica na areia'],'🐋','A baleia é mamífero e respira ar, por isso sobe à superfície.'],
 ['Qual animal tem um casco duro nas costas?','Tartaruga',['Coelho','Pato'],'🐢','A tartaruga tem um casco que a protege.'],
 ['Por que o urso polar tem pelo grosso?','Para aguentar o frio',['Para nadar mais rápido','Para enxergar melhor'],'🐻‍❄️','O pelo grosso aquece o urso no gelo.'],
 ['Qual animal vive no formigueiro?','Formiga',['Abelha','Minhoca'],'🐜','As formigas vivem juntas no formigueiro.'],
 ['Qual animal anda devagar e carrega a casa nas costas?','Caracol',['Coelho','Cavalo'],'🐌','O caracol carrega a concha, sua casinha.'],
 ['O pinguim vive onde é...','Muito frio',['Muito quente','Seco como o deserto'],'🐧','O pinguim vive em lugares gelados.'],
 ['Qual destes animais voa e é mamífero?','Morcego',['Galinha','Borboleta'],'🦇','O morcego voa, mas mama quando é filhote: é mamífero.'],
 ['Qual animal tem tromba?','Elefante',['Girafa','Zebra'],'🐘','O elefante usa a tromba para pegar comida e água.'],
 ['O que a minhoca faz pela terra?','Deixa a terra fofa e boa para as plantas',['Deixa a terra seca','Come as flores'],'🪱','A minhoca cava túneis e deixa a terra boa.'],
 ['Qual animal tem listras pretas e brancas?','Zebra',['Leão','Girafa'],'🦓','A zebra tem listras pretas e brancas.'],
 ['Como o peixe respira?','Pelas brânquias',['Pelo nariz, como nós','Ele não respira'],'🐠','O peixe respira pelas brânquias, que tiram o ar da água.']],'confundiu o conceito');
addBanco('passos',[
 ['Para fazer um bolo, o que vem primeiro?','Misturar os ingredientes',['Comer o bolo','Tirar do forno'],'🎂','Primeiro mistura, depois assa, e só então come.'],
 ['Depois de colocar a semente na terra, o que fazemos?','Cobrir com terra e regar',['Colher a fruta','Cavar o buraco'],'🌱','O buraco vem antes. Depois da semente, cobrimos e regamos.'],
 ['Para mandar uma carta, o que fazemos por último?','Colocar no correio',['Escrever','Fechar o envelope'],'✉️','Escrever, fechar o envelope e por último colocar no correio.'],
 ['Para lavar a louça, o que vem primeiro?','Tirar os restos de comida',['Secar o prato','Guardar no armário'],'🍽️','Primeiro tiramos os restos, depois lavamos, secamos e guardamos.'],
 ['O que fazemos antes de sair para a escola?','Arrumar a mochila',['Voltar para casa','Assistir à aula'],'🎒','A mochila é arrumada antes de sair.'],
 ['Para fazer suco, o que vem depois de cortar as laranjas?','Espremer',['Beber','Comprar as laranjas'],'🍊','Comprar, cortar, espremer e só então beber.'],
 ['Para montar um quebra-cabeça, o que é bom fazer primeiro?','Montar a borda',['Guardar a caixa','Mostrar pronto'],'🧩','Começar pela borda ajuda a montar o resto.'],
 ['O robô anda 1 passo para frente, 3 vezes. Quantos passos ele andou?','3',['1','6'],'🤖','Repetir 3 vezes 1 passo dá 3 passos.'],
 ['Repita 2 vezes: bater palma. Quantas palmas?','2',['1','4'],'👏','Repetir 2 vezes uma palma dá 2 palmas.'],
 ['Repita 3 vezes: pular. Quantos pulos?','3',['2','6'],'🦘','Repetir 3 vezes um pulo dá 3 pulos.'],
 ['Se chover, levo guarda-chuva. Está chovendo. O que levo?','Guarda-chuva',['Óculos de sol','Boia'],'☔','A condição aconteceu: está chovendo, então levo o guarda-chuva.'],
 ['Se a luz estiver vermelha, paramos. A luz está vermelha. O que fazemos?','Paramos',['Atravessamos correndo','Fechamos os olhos'],'🚦','Luz vermelha: paramos.'],
 ['Se estiver frio, vista o casaco. Está calor. Precisa do casaco?','Não',['Sim','Dois casacos'],'🧥','Só vestimos o casaco se estiver frio. Está calor, então não.'],
 ['Se a terra estiver seca, regue. A terra está molhada. Precisa regar?','Não, já está molhada',['Sim, regue muito','Regue com suco'],'🪴','Só regamos se estiver seca.'],
 ['Para tomar sopa quente, o que fazemos antes?','Esperar esfriar um pouco',['Lavar o prato','Guardar a colher'],'🥣','Esperar esfriar evita queimar a boca.'],
 ['Para escrever no caderno, o que vem primeiro?','Abrir o caderno',['Fechar o caderno','Guardar o lápis'],'📓','Primeiro abrimos o caderno.'],
 ['Para pintar com tinta, o que fazemos no final?','Lavar o pincel',['Molhar o pincel na tinta','Pintar o desenho'],'🖌️','No final, lavamos o pincel.'],
 ['Para ver um filme no cinema, o que vem primeiro?','Comprar o ingresso',['Sair da sala','Ver o final do filme'],'🎬','Primeiro o ingresso, depois o filme.'],
 ['Para andar de bicicleta com segurança, o que vem primeiro?','Colocar o capacete',['Pedalar rápido','Guardar a bicicleta'],'🚲','O capacete vem antes de pedalar.'],
 ['Para guardar os brinquedos, o que fazemos por último?','Fechar a caixa',['Pegar os brinquedos do chão','Colocar na caixa'],'🧸','Pegar, colocar na caixa e por último fechar.']],'errou a ordem dos passos');
addBanco('sentir',[
 ['Você caiu na frente dos colegas e todos riram. Como pode se sentir?','😳 Envergonhada',['😄 Feliz','🤩 Animada'],'😳','Quando riem de nós, podemos sentir vergonha.'],
 ['Seu irmãozinho ganhou todo o colo da mamãe hoje. Como pode se sentir?','😒 Com ciúme',['😄 Feliz','😨 Com medo'],'🤱','Querer a atenção só para nós é ciúme. Dá para conversar sobre isso.'],
 ['Você tentou montar a torre e ela caiu três vezes. Como pode se sentir?','😣 Frustrada',['🤩 Animada','😮 Surpresa'],'🧱','Quando tentamos e não dá certo, ficamos frustrados. Respire e tente de novo.'],
 ['Você está deitada ouvindo uma música suave. Como se sente?','😌 Calma',['😠 Com raiva','😨 Com medo'],'🎶','Uma música suave deixa a gente calma.'],
 ['Amanhã é seu aniversário e vai ter festa! Como se sente?','🤩 Animada',['😢 Triste','😣 Frustrada'],'🎉','Esperar algo legal deixa a gente animada.'],
 ['Você vai apresentar um trabalho para a turma toda. Como pode se sentir?','😬 Nervosa',['😴 Com sono','😒 Com ciúme'],'🎤','Falar em público pode deixar nervosa. Isso é normal.'],
 ['Você ajudou a vovó a carregar as sacolas. Como se sente?','😊 Orgulhosa',['😠 Com raiva','😳 Envergonhada'],'🛍️','Ajudar alguém dá orgulho.'],
 ['Abriu a porta e todos gritaram: surpresa! Como se sente?','😮 Surpresa',['😢 Triste','😌 Calma'],'🎊','Algo inesperado dá surpresa.'],
 ['Sua amiga não quis brincar com você hoje. Como pode se sentir?','😢 Triste',['🤩 Animada','😊 Orgulhosa'],'🧸','Ser deixada de lado pode deixar triste.'],
 ['Alguém furou a fila na sua frente. Como pode se sentir?','😠 Com raiva',['😌 Calma','😮 Surpresa'],'🚶','Quando algo não é justo, sentimos raiva.'],
 ['Você ouviu um barulho estranho no escuro. Como pode se sentir?','😨 Com medo',['😊 Orgulhosa','🤩 Animada'],'🌑','Barulhos no escuro podem dar medo. Chame um adulto.'],
 ['Você aprendeu a andar de bicicleta sem rodinhas! Como se sente?','😊 Orgulhosa',['😢 Triste','😨 Com medo'],'🚲','Conseguir algo novo dá orgulho.'],
 ['Seu sorvete caiu no chão. Como pode se sentir?','😢 Triste',['😌 Calma','😊 Orgulhosa'],'🍦','Perder algo que queríamos deixa triste.'],
 ['Esqueceu a fala na peça da escola e todos olharam. Como pode se sentir?','😳 Envergonhada',['🤩 Animada','😒 Com ciúme'],'🎭','Errar na frente de todos dá vergonha. Acontece com todo mundo.'],
 ['Perdeu o jogo depois de treinar muito. Como pode se sentir?','😣 Frustrada',['😄 Feliz','😌 Calma'],'⚽','Quando o esforço não deu resultado, ficamos frustrados.'],
 ['Quando estamos com raiva, o corpo pode...','Ficar quente e com o coração rápido',['Ficar com sono','Ficar com fome'],'😤','A raiva acelera o coração. Respirar fundo ajuda a acalmar.'],
 ['Quando sentimos medo, o que ajuda?','Contar para um adulto de confiança',['Guardar segredo','Fingir que não sentiu'],'🫂','Contar para um adulto de confiança ajuda com o medo.'],
 ['Seu amigo está chorando. Como ele provavelmente se sente?','😢 Triste',['😄 Feliz','🤩 Animado'],'😭','Chorar costuma mostrar tristeza.'],
 ['Seu primo sorri e pula quando vê você. Como ele se sente?','😄 Feliz',['😠 Com raiva','😨 Com medo'],'😃','Sorrir e pular mostra alegria.'],
 ['Tudo bem sentir raiva?','Sim, mas sem machucar ninguém',['Não, nunca podemos sentir raiva','Sim, e podemos bater'],'💬','Todo sentimento é normal. O que importa é o que fazemos com ele.']],'confundiu as emoções');
addBanco('conviver',[
 ['Você quer o brinquedo que o colega está usando. O que fazer?','Pedir e esperar a vez',['Pegar da mão dele','Chorar até ele dar'],'🧸','Pedir e esperar a vez é respeitar o colega.'],
 ['Um colega novo chegou na turma. O que é gentil?','Dizer oi e se apresentar',['Ignorar','Rir dele'],'👋','Receber bem quem chegou é ser gentil.'],
 ['Você recebeu um presente. O que dizer?','Obrigada!',['Só isso?','Não dizer nada'],'🎁','Agradecer mostra carinho com quem deu.'],
 ['Seu irmão está dormindo. O que fazer?','Brincar em silêncio',['Gritar','Ligar a TV bem alta'],'🤫','Respeitar o sono do outro é fazer silêncio.'],
 ['Um amigo caiu no recreio. O que fazer?','Ajudar e chamar um adulto',['Rir','Continuar correndo'],'🤕','Ajudar quem se machucou é o certo.'],
 ['Você e sua amiga querem brincadeiras diferentes. O que é justo?','Brincar um pouco de cada uma',['Só a sua','Ir embora brava'],'🤝','Revezar as brincadeiras é justo para as duas.'],
 ['A professora está falando. O que fazer?','Ouvir com atenção',['Conversar com o colega','Levantar e sair'],'👩‍🏫','Ouvir com atenção é respeito e ajuda a aprender.'],
 ['Você quebrou um copo sem querer. O que fazer?','Contar para um adulto e pedir desculpas',['Esconder os cacos','Culpar o irmão'],'🥛','Assumir o erro é coragem, e o adulto ajuda a limpar com segurança.'],
 ['Alguém pediu desculpas para você. O que é bom fazer?','Aceitar e continuar amigos',['Ficar brava para sempre','Rir da pessoa'],'🙏','Aceitar as desculpas faz a amizade continuar.'],
 ['Um colega está com dificuldade na tarefa. O que você pode fazer?','Oferecer ajuda',['Rir dele','Esconder seu caderno'],'✏️','Ajudar quem tem dificuldade é ser bom colega.'],
 ['Um adulto desconhecido oferece doce no parque. O que fazer?','Não aceitar e avisar o papai',['Aceitar e ir com ele','Guardar segredo'],'🍬','Nunca aceite nada de estranhos. Sempre avise um adulto da família.'],
 ['Você ganhou o jogo. O que fazer?','Comemorar sem zombar do outro',['Rir de quem perdeu','Dizer que o outro é ruim'],'🏅','Ganhar com respeito é tão importante quanto ganhar.'],
 ['Alguém pede para você guardar um segredo que te deixa triste ou com medo. O que fazer?','Contar para um adulto de confiança',['Guardar para sempre','Esquecer'],'🤐','Segredo que deixa triste ou com medo deve ser contado a um adulto de confiança.'],
 ['Seu colega esqueceu o lanche. O que você pode fazer?','Dividir um pouco do seu',['Comer na frente dele rindo','Fingir que não viu'],'🥪','Dividir é um jeito de cuidar do outro.'],
 ['Você está muito brava com sua amiga. O que fazer primeiro?','Respirar e se acalmar antes de falar',['Gritar com ela','Empurrar'],'🌬️','Primeiro acalmar, depois conversar.'],
 ['Na fila do escorregador, o que é certo?','Esperar a sua vez',['Furar a fila','Empurrar quem está na frente'],'🛝','Esperar a vez é justo com todos.'],
 ['Um amigo fez um desenho bonito. O que dizer?','Que bonito, parabéns!',['O meu é melhor','Que feio'],'🖍️','Elogiar o outro deixa todos felizes.'],
 ['Você precisa usar o lápis do colega. O que fazer?','Pedir emprestado',['Pegar sem pedir','Esconder o lápis dele'],'✏️','Pedir antes de pegar é respeito.'],
 ['Seu time perdeu. O que é bom dizer?','Foi divertido, vamos treinar mais',['A culpa é sua','Não jogo nunca mais'],'⚽','Perder faz parte. Culpar os outros não ajuda.'],
 ['Duas amigas estão brigando. O que você pode fazer?','Chamar um adulto para ajudar',['Torcer para uma delas','Brigar junto'],'👭','Um adulto pode ajudar a resolver a briga.']],'escolheu uma atitude que não ajuda');
/* lições de reforço */
MAT_LESSONS.splice(MAT_LESSONS.findIndex(l=>l.id==='vizinhos')+1,0,
  {id:'reta',titulo:'Reta numérica',icone:'📏',bncc:'EF02MA01',
   slides:[{t:'Na reta numérica, os números andam em fila, de 1 em 1. Cada número é um a mais que o da esquerda.',v:numline([20,21,22,23,24],2)},
    {t:'Todo número tem dois vizinhos: o de trás, que é um a menos, e o da frente, que é um a mais. Os vizinhos do 35 são 34 e 36.',v:numline([34,35,36],1)},
    {t:'Quando chega no 9, a dezena muda: 28, 29, 30, 31. Depois do 29 vem o 30!',v:numline([28,29,30,31],2)}],
   practice:['retaFalta','vizinhos','retaFalta','depois','retaFalta','antes'],quiz:['retaFalta','vizinhos','depois','antes','retaFalta']});
POR_LESSONS.splice(POR_LESSONS.findIndex(l=>l.id==='alfabeto')+1,0,
  {id:'alfabeto-treino',titulo:'Ordem alfabética: treino',icone:'🔡',bncc:'EF02LP07',
   slides:[{t:'Para saber qual palavra vem primeiro, olhe só a primeira letra de cada uma e procure no alfabeto.',v:`<div class="alfa">${ALFABETO.split('').map(c=>`<span class="${'BG'.includes(c)?'hi':''}">${c}</span>`).join('')}</div><div class="big" style="font-size:36px"><b style="color:var(--pri)">B</b>OLA → <b style="color:var(--pri)">G</b>ATO</div>`},
    {t:'O B aparece antes do G no alfabeto. Por isso BOLA vem antes de GATO.',v:'<div class="emo" style="font-size:56px">⚽ → 🐱</div>'}],
   practice:['alfaApoio','letraAntes','alfaApoio','letraDepois','alfaApoio','letraAntes'],quiz:['alfaApoio','primeiraAlf','letraAntes','primeiraAlf','alfaApoio']});

/* ================= LOTE 4 · 17/11/2026 · problemas, horas, formas, medidas, gráficos, textos, História e Geografia ================= */
const bk=(skill,erro,itens)=>bankGen(skill,itens.map(([q,a,w,e,x])=>({q,a,w,e,x,erro})));
const pad2=n=>String(n).padStart(2,'0');
/* ---- Problemas do dia a dia (EF02MA06) ---- */
const PCOISAS=[['figurinhas','f'],['bolinhas de gude','f'],['adesivos','m'],['lápis de cor','m'],['balas','f'],['carrinhos','m'],['conchinhas','f'],['livros','m']];
const qt=g=>g==='f'?'quantas':'quantos';
function probNum(tipo){
  const sk={juntar:'Problemas de somar',tirar:'Problemas de subtrair',comparar:'Problemas de comparar',falta:'Problemas: quanto falta'}[tipo],L=LIM[nv(sk)];
  const n=pick(NOMES),[n1,n2]=shuffle(NOMES.slice()).slice(0,2),[c,g]=pick(PCOISAS);let a,b,r,t,cands,dica,expl;
  if(tipo==='juntar'){a=rnd(2,L-2);b=rnd(2,Math.min(L-a,a>3?a-1:L-a));r=a+b;
    t=pick([`${cap1(n)} tinha ${a} ${c} e ganhou mais ${b}. ${cap1(qt(g))} ${c} tem agora?`,`Numa sala há ${a} meninas e ${b} meninos. Quantas crianças há na sala?`,
      `No ônibus havia ${a} pessoas. No ponto, subiram mais ${b}. Quantas pessoas estão no ônibus agora?`,`${cap1(n)} leu ${a} páginas ontem e ${b} páginas hoje. Quantas páginas leu ao todo?`,
      `Na fruteira há ${a} laranjas e ${b} bananas. Quantas frutas há ao todo?`]);
    cands=[{v:a-b,type:'subtraiu em vez de somar'},{v:r+1,type:'errou a conta'},{v:r-10,type:'errou nas dezenas'}];dica='Juntar, ganhar ou chegar mais: é conta de mais.';expl=`Juntamos: ${a} + ${b} = ${r}.`}
  if(tipo==='tirar'){a=rnd(5,L);b=rnd(1,a-1);r=a-b;
    t=pick([`${cap1(n)} tinha ${a} ${c} e deu ${b} para a irmã. ${cap1(qt(g))} ${c} sobraram?`,`Havia ${a} passarinhos na árvore. ${b} voaram. Quantos ficaram?`,
      `${cap1(n)} tinha ${a} reais e gastou ${b} reais. Quantos reais sobraram?`,`Uma caixa tinha ${a} ovos. ${b} quebraram. Quantos ovos ficaram inteiros?`,
      `O livro tem ${a} páginas. ${cap1(n)} já leu ${b}. Quantas páginas faltam para terminar?`]);
    cands=[{v:a+b,type:'somou em vez de subtrair'},{v:r+1,type:'errou a conta'},{v:b,type:'respondeu a parte que saiu'}];dica='Dar, gastar, perder ou sair: é conta de menos.';expl=`Tiramos: ${a} − ${b} = ${r}.`}
  if(tipo==='comparar'){a=rnd(4,L);b=rnd(1,a-1);r=a-b;
    t=pick([`${cap1(n1)} tem ${a} ${c}. ${cap1(n2)} tem ${b}. ${cap1(qt(g))} ${c} ${n1} tem a mais?`,`O prédio azul tem ${a} andares e o verde tem ${b}. Quantos andares o azul tem a mais?`,
      `Na corrida, ${n1} deu ${a} voltas e ${n2} deu ${b}. Quantas voltas ${n2} deu a menos?`,`Uma caneta custa ${a} reais e um lápis custa ${b} reais. Quantos reais a caneta custa a mais?`]);
    cands=[{v:a+b,type:'somou em vez de comparar'},{v:a,type:'respondeu o número maior'},{v:r+1,type:'errou a conta'}];dica='Para saber quanto um tem a mais, tire o menor do maior.';expl=`Comparamos tirando o menor do maior: ${a} − ${b} = ${r}.`}
  if(tipo==='falta'){b=rnd(5,L);a=rnd(1,b-1);r=b-a;
    t=pick([`${cap1(n)} quer juntar ${b} ${c}. Já tem ${a}. ${cap1(qt(g))} faltam?`,`O álbum tem ${b} figurinhas. ${cap1(n)} já colou ${a}. Quantas faltam para completar?`,
      `${cap1(n)} quer comprar um jogo de ${b} reais. Já tem ${a} reais. Quantos reais faltam?`,`A turma precisa de ${b} cadeiras. Já tem ${a}. Quantas cadeiras faltam?`]);
    cands=[{v:a+b,type:'somou em vez de subtrair'},{v:b,type:'respondeu o total'},{v:r+1,type:'errou a conta'}];dica='Quanto falta: comece no que já tem e conte até o total, ou faça total menos o que já tem.';expl=`O total é ${b} e já tem ${a}: ${b} − ${a} = ${r}.`}
  return{skill:sk,text:t,visual:'',desc:t,options:opts(r,cands),hint:dica,explain:expl,_a:a,_b:b,_r:r,_tipo:tipo};
}
Object.assign(GEN,{
  probJuntar:comoNum(()=>probNum('juntar')),probTirar:comoNum(()=>probNum('tirar')),
  probComparar:comoNum(()=>probNum('comparar')),probFalta:comoNum(()=>probNum('falta')),
  probConta(){const tipo=pick(['juntar','tirar','comparar','falta']),p=probNum(tipo),{_a:a,_b:b}=p;
    const certo=tipo==='juntar'?`${a} + ${b}`:tipo==='falta'?`${b} − ${a}`:`${a} − ${b}`,
      outros=tipo==='juntar'?[[`${a} − ${b}`,'escolheu menos em vez de mais']]:
        [[`${a} + ${b}`,'escolheu mais em vez de menos'],[tipo==='falta'?`${a} − ${b}`:`${b} − ${a}`,'inverteu a ordem da conta']];
    const ops=shuffle([{v:certo,label:certo,ok:true,type:null},...outros.filter(o=>o[0]!==certo).map(([v,type])=>({v,label:v,ok:false,type}))]);
    return{skill:'Escolher a conta',text:p.text+' Qual conta resolve?',speak:p.text+' Qual conta resolve?',visual:'',desc:'conta: '+p.text,optClass:'txt',options:ops,hint:p.hint,explain:p.explain}},
});
/* ---- Dobro, metade e grupos iguais (EF02MA07/08) ---- */
const GRUPOS=[['🍓','pratos','morangos','em cada prato','m'],['🥚','caixas','ovos','em cada caixa','m'],['🐞','folhas','joaninhas','em cada folha','f'],['🍪','pacotes','biscoitos','em cada pacote','m'],['⚽','sacolas','bolas','em cada sacola','f'],['🐟','aquários','peixes','em cada aquário','m'],['🌸','vasos','flores','em cada vaso','f']];
const gruposHTML=(g,k,e)=>`<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center">${Array(g).fill(`<span style="border:3px dashed var(--pri);border-radius:14px;padding:6px 8px;font-size:26px;max-width:160px;line-height:1.3">${rep(e,k)}</span>`).join('')}</div>`;
function grupoBase(){const l=nv('Grupos iguais'),g=rnd(2,l===1?5:6),k=rnd(2,l===1?5:l===2?6:10),ctx=pick(GRUPOS);return{g,k,ctx}}
Object.assign(GEN,{
  grupos:comoNum(()=>{const{g,k,ctx:[e,pl,it,emc,gen]}=grupoBase(),r=g*k;
    return{skill:'Grupos iguais',text:`São ${g} ${pl} com ${k} ${it} ${emc}. ${cap1(qt(gen))} ${it} ao todo?`,visual:gruposHTML(g,k,e),desc:`${g} grupos de ${k} ${it}`,
      options:opts(r,[{v:g+k,type:'somou os grupos com os itens'},{v:r-k,type:'contou um grupo a menos'},{v:r+k,type:'contou um grupo a mais'}]),
      hint:`Conte de ${k} em ${k}, um grupo de cada vez.`,explain:`${Array(g).fill(k).join(' + ')} = ${r}. ${g} grupos de ${k} dão ${r}.`}}),
  somaRepetida(){const{g,k,ctx:[e,pl,it]}=grupoBase(),certo=Array(g).fill(k).join(' + ');
    const cand=[[`${g} + ${k}`,'somou os grupos com os itens'],[Array(g+1).fill(k).join(' + '),'contou um grupo a mais'],[Array(k).fill(g).join(' + '),'trocou grupos e itens']];
    const ops=[{v:certo,label:certo,ok:true,type:null}];for(const [v,type] of cand)if(ops.length<3&&!ops.some(o=>o.label===v))ops.push({v,label:v,ok:false,type});
    return{skill:'Grupos iguais',text:`Qual conta mostra ${g} ${pl} com ${k} ${it} cada?`,visual:gruposHTML(g,k,e),desc:`conta de ${g} grupos de ${k} ${it}`,optClass:'txt',options:shuffle(ops),
      hint:'Cada grupo vira um número na conta. Quantos grupos? Quantos em cada um?',explain:`São ${g} grupos, e cada um tem ${k}: ${certo}.`}},
  dobro:comoNum(()=>{const l=nv('Dobro e metade'),n=rnd(2,l===1?10:l===2?25:45),r=2*n;
    return{skill:'Dobro e metade',text:`Qual é o dobro de ${n}?`,visual:n<=10?`<div class="emo">${rep('🔵',n)}<span class="op">+</span>${rep('🔵',n)}</div>`:'',desc:`dobro de ${n}`,
      options:opts(r,[{v:n+2,type:'somou 2 em vez de dobrar'},{v:n,type:'respondeu o próprio número'},{v:r+1,type:'errou a conta'}]),
      hint:'Dobro é duas vezes o número: some o número com ele mesmo.',explain:`O dobro de ${n} é ${n} + ${n} = ${r}.`}}),
  metade:comoNum(()=>{const l=nv('Dobro e metade'),r=rnd(1,l===1?10:l===2?25:45),m=2*r;
    return{skill:'Dobro e metade',text:`Qual é a metade de ${m}?`,visual:m<=20?`<div class="emo">${rep('🍬',r)} │ ${rep('🍬',r)}</div>`:'',desc:`metade de ${m}`,
      options:opts(r,[{v:m-2,type:'tirou 2 em vez de dividir'},{v:m*2<=100?m*2:m+1,type:m*2<=100?'dobrou em vez de dividir':'errou a conta'},{v:r+1,type:'dividiu em partes diferentes'}]),
      hint:'Metade é dividir em duas partes iguais. Que número somado com ele mesmo dá esse?',explain:`${r} + ${r} = ${m}. Então a metade de ${m} é ${r}.`}}),
});
/* ---- Horas e calendário (EF02MA18/19) ---- */
function relogioSVG(h,m){const ah=((h%12)+m/60)*30*Math.PI/180,am=m*6*Math.PI/180,P=(a,r)=>[(100+r*Math.sin(a)).toFixed(1),(100-r*Math.cos(a)).toFixed(1)];
  let s=`<svg viewBox="0 0 200 200" style="width:200px;max-width:70vw"><circle cx="100" cy="100" r="92" fill="#fff" stroke="#1D2846" stroke-width="5"/>`;
  for(let i=1;i<=12;i++){const [x,y]=P(i*Math.PI/6,72);s+=`<text x="${x}" y="${(+y+7).toFixed(1)}" text-anchor="middle" font-size="20" font-weight="700" fill="#1D2846">${i}</text>`}
  const [hx,hy]=P(ah,46),[mx,my]=P(am,74);
  return s+`<line x1="100" y1="100" x2="${mx}" y2="${my}" stroke="#3557E8" stroke-width="5" stroke-linecap="round"/><line x1="100" y1="100" x2="${hx}" y2="${hy}" stroke="#E5484D" stroke-width="8" stroke-linecap="round"/><circle cx="100" cy="100" r="6" fill="#1D2846"/></svg>`}
const DIAS=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'],MESES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const CAL_FATOS=[['Quantos dias tem uma semana?','7 dias',['5 dias','10 dias'],'Uma semana tem 7 dias: de domingo a sábado.'],['Quantos meses tem um ano?','12 meses',['7 meses','10 meses'],'Um ano tem 12 meses: de janeiro a dezembro.'],
  ['Quais dias são o fim de semana?','Sábado e domingo',['Segunda e terça','Quarta e quinta'],'Sábado e domingo formam o fim de semana.'],['Qual é o primeiro mês do ano?','Janeiro',['Dezembro','Março'],'O ano começa em janeiro.'],
  ['Qual é o último mês do ano?','Dezembro',['Janeiro','Novembro'],'O ano termina em dezembro.'],['Em que mês é o Natal?','Dezembro',['Junho','Abril'],'O Natal é no dia 25 de dezembro.'],
  ['Quantas vezes por ano fazemos aniversário?','Uma vez',['Todo mês','Toda semana'],'O aniversário acontece uma vez por ano, sempre no mesmo dia.'],['O que usamos para ver os dias e os meses?','Calendário',['Relógio','Régua'],'O calendário mostra os dias, as semanas e os meses.']];
Object.assign(GEN,{
  relogio(){const l=nv('Horas no relógio'),h=rnd(1,12),m=l===1?0:l===2?pick([0,30]):pick([0,30,15,45]),lab=(hh,mm)=>`${hh}:${pad2(mm)}`,prox=h%12+1;
    const cand=m===0?[[lab(prox,0),'leu o número vizinho'],[lab(h,30),'confundiu hora cheia com meia hora'],...(h!==12?[[lab(12,h*5),'trocou os ponteiros']]:[])]
      :[[lab(h,m/5),'leu o número sem contar de 5 em 5'],[lab(h,0),'ignorou o ponteiro grande'],[lab(m>=30?prox:(h===1?12:h-1),m),'leu a hora errada']];
    const ops=[{v:lab(h,m),label:lab(h,m),ok:true,type:null}];for(const [v,type] of shuffle(cand))if(ops.length<3&&!ops.some(o=>o.label===v))ops.push({v,label:v,ok:false,type});
    return{skill:'Horas no relógio',text:'Que horas o relógio está mostrando?',visual:relogioSVG(h,m),desc:`relógio ${lab(h,m)}`,options:shuffle(ops),
      hint:'O ponteiro pequeno e vermelho mostra a hora. O grande e azul mostra os minutos: cada número vale 5 minutos.',
      explain:m===0?`O ponteiro grande está no 12 e o pequeno no ${h}: são ${h} horas em ponto, ${lab(h,0)}.`:`O ponteiro pequeno já passou do ${h} e o grande está no ${m/5}. Contando de 5 em 5 até o ${m/5}: ${m} minutos. São ${lab(h,m)}.`}},
  duracao:comoNum(()=>{const[ev,art]=pick([['a aula','A aula'],['o passeio','O passeio'],['o filme','O filme'],['a festa','A festa'],['a viagem','A viagem'],['o jogo','O jogo']]),h=rnd(1,8),d=rnd(1,4),f=h+d;
    return{skill:'Duração do tempo',text:`${art} começou ${h===1?'à 1 hora':`às ${h} horas`} e terminou às ${f} horas. Quantas horas durou?`,visual:`<div style="display:flex;gap:16px;justify-content:center;align-items:center">${relogioSVG(h,0).replace('width:200px','width:120px')}<b style="font-size:32px">→</b>${relogioSVG(f,0).replace('width:200px','width:120px')}</div>`,desc:`${ev} das ${h} às ${f}`,
      options:opts(d,[{v:f,type:'respondeu a hora do fim'},{v:d+1,type:'contou a hora do começo também'},{v:h,type:'respondeu a hora do começo'}]),
      hint:`Comece no ${h} e conte as horas até chegar no ${f}.`,explain:`Do ${h} até o ${f}: ${Array.from({length:d},(_,i)=>h+i+1).join(', ')}. Durou ${d} ${d===1?'hora':'horas'}.`}}),
  calendario(){const t=pick(['diaDepois','ontem','amanha','mesDepois','mesAntes','fato']),C=cap1;let q,a,w,x;
    if(t==='fato'){const f=pick(CAL_FATOS);q=f[0];a=f[1];w=f[2].map(v=>[v,'não lembrou do calendário']);x=f[3]}
    else if(t.startsWith('mes')){const i=rnd(0,11),M=MESES,dep=t==='mesDepois';q=dep?`Que mês vem depois de ${M[i]}?`:`Que mês vem antes de ${M[i]}?`;a=C(M[(i+(dep?1:11))%12]);
      w=[[C(M[(i+(dep?11:1))%12]),'confundiu antes com depois'],[C(M[(i+(dep?2:10))%12]),'pulou um mês']];x=`Na ordem dos meses: ${C(M[(i+11)%12])}, ${M[i]}, ${M[(i+1)%12]}.`}
    else{const i=rnd(0,6),D=DIAS,dep=t!=='ontem';q=t==='diaDepois'?`Que dia da semana vem depois de ${D[i]}?`:t==='ontem'?`Se hoje é ${D[i]}, que dia foi ontem?`:`Se hoje é ${D[i]}, que dia será amanhã?`;
      a=C(D[(i+(dep?1:6))%7]);w=[[C(D[(i+(dep?6:1))%7]),t==='diaDepois'?'confundiu antes com depois':'confundiu ontem com amanhã'],[C(D[(i+(dep?2:5))%7]),'pulou um dia']];x=`Na ordem da semana: ${C(D[(i+6)%7])}, ${D[i]}, ${D[(i+1)%7]}.`}
    const ops=shuffle([{v:a,label:a,ok:true,type:null},...w.map(([v,type])=>({v,label:v,ok:false,type}))]);
    return{skill:'Calendário',text:q,visual:'<div class="emo" style="font-size:56px">📅</div>',desc:q,optClass:'txt',options:ops,hint:'Fale os dias da semana ou os meses em ordem, bem devagar.',explain:x}},
});
/* ---- Formas (EF02MA14/15) ---- */
const FORMAS={circulo:['Círculo',0,0,'<circle cx="80" cy="60" r="48"/>'],quadrado:['Quadrado',4,4,'<rect x="32" y="12" width="96" height="96"/>'],retangulo:['Retângulo',4,4,'<rect x="8" y="27" width="144" height="66"/>'],triangulo:['Triângulo',3,3,'<polygon points="80,8 148,112 12,112"/>']};
const CORES_F=['#E06666','#6FA8DC','#F6C342','#93C47D'];
Object.assign(GEN,{
  formaPlana(){const k=pick(Object.keys(FORMAS)),[nome,lados,vert,svg]=FORMAS[k],ci=rnd(0,3),rot=k==='circulo'?0:pick([0,0,15,30]),t=pick(['nome','nome','lados','vertices']);
    const vis=`<svg viewBox="0 0 160 120" style="width:220px;max-width:70vw"><g fill="${CORES_F[ci]}" stroke="#1D2846" stroke-width="3" transform="rotate(${rot} 80 60)">${svg}</g></svg>`;let ops,text,expl;
    if(t==='nome'){const outros=shuffle(Object.keys(FORMAS).filter(x=>x!==k)).slice(0,2);if(k==='quadrado'&&!outros.includes('retangulo'))outros[0]='retangulo';if(k==='retangulo'&&!outros.includes('quadrado'))outros[0]='quadrado';
      ops=[{v:nome,label:nome,ok:true,type:null},...outros.map(o=>({v:FORMAS[o][0],label:FORMAS[o][0],ok:false,type:(k+o).includes('quadrado')&&(k+o).includes('retangulo')?'confundiu quadrado com retângulo':'confundiu as formas'}))];
      text='Qual é o nome desta forma?';expl=k==='quadrado'?'O quadrado tem 4 lados do mesmo tamanho.':k==='retangulo'?'O retângulo tem 4 lados: dois compridos e dois curtos.':k==='circulo'?'O círculo é redondo e não tem lados retos nem cantos.':'O triângulo tem 3 lados e 3 cantos.'}
    else{const certo=t==='lados'?lados:vert,lb=v=>v===0?'Nenhum':String(v);
      ops=['Nenhum','3','4'].map(v=>({v,label:v,ok:v===lb(certo),type:v===lb(certo)?null:t==='lados'?'contou os lados errado':'contou os cantos errado'}));
      text=t==='lados'?'Quantos lados retos tem esta forma?':'Quantos cantos (vértices) tem esta forma?';expl=k==='circulo'?'O círculo é todo curvo: não tem lados retos nem cantos.':`O ${nome.toLowerCase()} tem ${lados} lados e ${vert} cantos.`}
    return{skill:'Formas planas',text,visual:vis,desc:`${t} ${k} cor${ci} giro${rot}`,optClass:'txt',options:shuffle(ops),hint:'Passe o dedo pela borda da forma e conte os lados e as pontas.',explain:expl}},
  solidos:bk('Sólidos geométricos','confundiu os sólidos',[
    ['Uma bola de futebol parece com qual forma?','Esfera',['Cubo','Cone'],'⚽','A bola é redonda por todos os lados: é uma esfera.'],
    ['Um dado parece com qual forma?','Cubo',['Esfera','Cilindro'],'🎲','O dado tem 6 faces quadradas: é um cubo.'],
    ['Uma lata de milho parece com qual forma?','Cilindro',['Cubo','Cone'],'🥫','A lata tem duas bases redondas e um lado que rola: é um cilindro.'],
    ['Uma casquinha de sorvete parece com qual forma?','Cone',['Esfera','Cubo'],'🍦','A casquinha tem uma base redonda e uma ponta: é um cone.'],
    ['Uma caixa de sapato parece com qual forma?','Bloco retangular',['Esfera','Cone'],'📦','A caixa tem faces retangulares: é um bloco retangular.'],
    ['Uma laranja parece com qual forma?','Esfera',['Cilindro','Cubo'],'🍊','A laranja é redonda como uma bola: parece uma esfera.'],
    ['Um chapéu de festa parece com qual forma?','Cone',['Cubo','Cilindro'],'🥳','O chapéu de festa tem uma ponta e uma base redonda: é um cone.'],
    ['Uma vela comprida parece com qual forma?','Cilindro',['Esfera','Cone'],'🕯️','A vela é comprida e redonda dos lados: é um cilindro.'],
    ['Qual destas formas rola com facilidade?','Esfera',['Cubo','Bloco retangular'],'🛝','A esfera não tem cantos, então rola para todo lado.'],
    ['Qual forma tem todas as faces quadradas?','Cubo',['Esfera','Cone'],'🧊','O cubo tem 6 faces, e todas são quadrados iguais.'],
    ['Qual forma não tem nenhuma ponta?','Esfera',['Cubo','Pirâmide'],'🔮','A esfera é toda redonda: não tem pontas.'],
    ['Um tijolo parece com qual forma?','Bloco retangular',['Cone','Esfera'],'🧱','O tijolo tem faces retangulares: é um bloco retangular.'],
    ['As pirâmides do Egito têm a forma de...','Pirâmide',['Esfera','Cilindro'],'🏜️','Elas têm a base no chão e os lados que se encontram numa ponta lá em cima.'],
    ['Qual destas é uma figura plana, achatada como um desenho?','Círculo',['Esfera','Cubo'],'✏️','O círculo é plano, como um desenho no papel. A esfera é a bola, que tem volume.'],
    ['Um globo terrestre parece com qual forma?','Esfera',['Cubo','Cone'],'🌍','O globo é redondo como uma bola: é uma esfera.']]),
});
/* ---- Medidas (EF02MA16/17) ---- */
function reguaSVG(s,n){let t='';for(let i=0;i<=15;i++){const x=20+i*20;t+=`<line x1="${x}" y1="58" x2="${x}" y2="${i%5===0?78:70}" stroke="#1D2846" stroke-width="2"/><text x="${x}" y="96" text-anchor="middle" font-size="13" fill="#1D2846">${i}</text>`}
  return`<svg viewBox="0 0 340 105" style="width:440px;max-width:92vw"><rect x="${20+s*20}" y="20" width="${n*20}" height="26" rx="8" fill="#F6C342" stroke="#1D2846" stroke-width="2"/><polygon points="${20+(s+n)*20},20 ${20+(s+n)*20+0},46 ${20+(s+n)*20},33" fill="#1D2846"/><rect x="10" y="56" width="320" height="46" rx="6" fill="#FFF3D1" stroke="#1D2846" stroke-width="2"/>${t}</svg>`}
Object.assign(GEN,{
  regua:comoNum(()=>{const l=nv('Medir com régua'),s=l===1?0:rnd(1,5),n=rnd(2,15-s),f=s+n;
    return{skill:'Medir com régua',text:'Quantos centímetros mede a barra amarela?',visual:reguaSVG(s,n),desc:`régua de ${s} a ${f}`,
      options:opts(n,[...(s>0?[{v:f,type:'leu só o número do fim'}]:[]),{v:n+1,type:'contou os riscos em vez dos espaços'},{v:n-1,type:'errou a contagem'}]),
      hint:s?'A barra não começa no 0. Faça o número do fim menos o número do começo.':'Veja em que número a barra termina. Ela começa no 0.',
      explain:s?`A barra vai do ${s} até o ${f}. ${f} − ${s} = ${n} centímetros.`:`A barra começa no 0 e termina no ${n}: mede ${n} centímetros.`}}),
  medidas:bk('Medidas','confundiu as medidas',[
    ['Para medir o comprimento da mesa, usamos...','Fita métrica',['Balança','Copo'],'📏','A fita métrica mede o comprimento.'],
    ['Para saber quanto pesa uma melancia, usamos...','Balança',['Régua','Relógio'],'⚖️','A balança mede o peso (a massa).'],
    ['Uma garrafa grande de suco tem 2...','Litros',['Metros','Quilos'],'🧃','Líquidos são medidos em litros.'],
    ['Um saco de arroz pesa 5...','Quilos',['Litros','Metros'],'🍚','O peso é medido em quilos (quilogramas).'],
    ['O que é mais pesado?','Uma melancia',['Uma uva','Uma pena'],'🍉','A melancia é bem mais pesada que a uva e a pena.'],
    ['O que é mais leve?','Uma pena',['Um tijolo','Uma melancia'],'🪶','A pena é levinha.'],
    ['O que é mais comprido?','Um ônibus',['Um lápis','Uma formiga'],'🚌','O ônibus é muito mais comprido.'],
    ['Em qual cabe mais água?','Um balde',['Uma xícara','Uma colher'],'🪣','O balde tem a maior capacidade: cabe mais água.'],
    ['Para medir um lápis, usamos...','Centímetros',['Quilos','Litros'],'✏️','Coisas pequenas medimos em centímetros, com a régua.'],
    ['Para medir a altura de uma pessoa, usamos...','Metros e centímetros',['Litros','Quilos'],'🧍','Altura é comprimento: metros e centímetros.'],
    ['O leite da caixinha vem em 1...','Litro',['Metro','Quilo'],'🥛','Leite é líquido: medimos em litros.'],
    ['Para medir a febre, usamos...','Termômetro',['Régua','Balança'],'🌡️','O termômetro mede a temperatura do corpo.'],
    ['Ana mediu a mesa e contou 8 palmos. O papai contou 5. Por que deu diferente?','O palmo do papai é maior',['A mesa mudou de tamanho','A Ana contou errado'],'✋','Mãos de tamanhos diferentes dão medidas diferentes. Por isso usamos a régua!'],
    ['Quantos centímetros tem 1 metro?','100',['10','1000'],'📐','Um metro tem 100 centímetros.'],
    ['Qual tem menos capacidade?','Uma colher',['Um balde','Uma panela'],'🥄','Na colher cabe pouca coisa.']]),
});
/* ---- Gráficos e tabelas (EF02MA22/23) ---- */
const FRUTAS=[['🍎','maçã'],['🍌','banana'],['🍇','uva'],['🍓','morango'],['🍉','melancia'],['🍊','laranja'],['🍍','abacaxi']];
Object.assign(GEN,{
  grafico(){const k=rnd(3,4),cats=shuffle(FRUTAS.slice()).slice(0,k),vals=shuffle([1,2,3,4,5,6,7,8]).slice(0,k),mx=vals.indexOf(Math.max(...vals)),mn=vals.indexOf(Math.min(...vals));
    const vis=`<div style="display:inline-block;text-align:left;background:#fff;border-radius:14px;padding:10px 14px"><b>Fruta preferida da turma</b>${cats.map((c,i)=>`<div style="display:flex;align-items:center;gap:8px;margin-top:6px"><span style="font-size:30px;width:38px">${c[0]}</span>${'<i style="display:inline-block;width:22px;height:22px;background:#3557E8;border-radius:5px"></i>'.repeat(vals[i])}</div>`).join('')}<div class="muted" style="font-size:14px;margin-top:6px">Cada quadradinho = 1 criança</div></div>`;
    const t=pick(['mais','menos','quantos','quantos','diferenca','total']),nm=i=>`${cats[i][0]} ${cap1(cats[i][1])}`;let text,ops,expl;
    if(t==='mais'||t==='menos'){const ok=t==='mais'?mx:mn;text=`Qual fruta teve ${t==='mais'?'MAIS':'MENOS'} votos?`;
      ops=cats.map((c,i)=>({v:c[1],label:nm(i),ok:i===ok,type:i===ok?null:(i===(t==='mais'?mn:mx)?'confundiu mais com menos':'leu o gráfico errado')}));expl=`A barra ${t==='mais'?'mais comprida':'mais curta'} é a de ${cats[ok][1]}, com ${vals[ok]}.`}
    else if(t==='quantos'){const i=rnd(0,k-1),o=vals.find((v,j)=>j!==i);text=`Quantas crianças escolheram ${cats[i][1]}?`;ops=opts(vals[i],[{v:o,type:'olhou a linha errada'},{v:vals[i]+1,type:'contou um a mais'},{v:vals[i]-1,type:'contou um a menos'}]);expl=`Na linha da ${cats[i][1]} há ${vals[i]} quadradinhos.`}
    else if(t==='diferenca'){const j=mx===0?1:0,r=vals[mx]-vals[j];text=`Quantas crianças a mais escolheram ${cats[mx][1]} do que ${cats[j][1]}?`;
      ops=opts(r,[{v:vals[mx]+vals[j],type:'somou em vez de comparar'},{v:vals[mx],type:'respondeu só o maior'},{v:r+1,type:'errou a conta'}]);expl=`${vals[mx]} − ${vals[j]} = ${r}.`}
    else{const s=vals.reduce((a,b)=>a+b,0);text='Quantas crianças votaram ao todo?';ops=opts(s,[{v:k,type:'contou as frutas em vez dos votos'},{v:s+1,type:'errou a soma'},{v:s-1,type:'errou a soma'}]);expl=`${vals.join(' + ')} = ${s}.`}
    return{skill:'Ler gráficos',text,visual:vis,desc:`${t} ${cats.map(c=>c[1]).join(',')} ${vals.join(',')}`,optClass:t==='mais'||t==='menos'?'txt':'',options:t==='mais'||t==='menos'?shuffle(ops):ops,hint:'Cada quadradinho vale 1. Conte os quadradinhos de cada linha.',explain:expl}},
});
MAT_LESSONS.push(
  {id:'problemas',titulo:'Problemas do dia a dia',icone:'🧠',bncc:'EF02MA06',
   slides:[{t:'Num problema, leia com calma e descubra o que está acontecendo: alguém ganhou, perdeu, comparou ou falta alguma coisa?',v:'<div class="emo" style="font-size:56px">📖 🤔 ➕➖</div>'},
    {t:'Ganhar, juntar ou chegar mais: conta de MAIS. Dar, gastar, perder ou sair: conta de MENOS.',v:'<div class="big" style="font-size:30px">🎁 ganhou → <b style="color:var(--ok)">+</b><br>🎈 voou → <b style="color:var(--bad)">−</b></div>'},
    {t:'Para saber quanto um tem a mais, ou quanto falta, também usamos a conta de menos: o maior menos o menor.',v:'<div class="big" style="font-size:30px">12 − 8 = 4</div>'}],
   practice:['probConta','probJuntar','probTirar','probConta','probComparar','probFalta'],quiz:['probJuntar','probTirar','probComparar','probFalta','probConta']},
  {id:'dobro-metade',titulo:'Dobro e metade',icone:'✌️',bncc:'EF02MA08',
   slides:[{t:'O dobro é duas vezes o mesmo número. O dobro de 4 é 4 + 4, que dá 8.',v:'<div class="emo">🔵🔵🔵🔵<span class="op">+</span>🔵🔵🔵🔵</div>'},
    {t:'A metade é dividir em duas partes iguais. A metade de 8 é 4, porque 4 + 4 = 8.',v:'<div class="emo">🍬🍬🍬🍬 │ 🍬🍬🍬🍬</div>'}],
   practice:['dobro','dobro','metade','dobro','metade','metade'],quiz:['dobro','metade','dobro','metade','dobro']},
  {id:'grupos',titulo:'Grupos iguais',icone:'🍓',bncc:'EF02MA07',
   slides:[{t:'Quando temos grupos com a mesma quantidade, podemos contar pulando. 3 pratos com 2 morangos: 2, 4, 6.',v:gruposHTML(3,2,'🍓')},
    {t:'Também dá para somar o mesmo número várias vezes: 2 + 2 + 2 = 6. Isso é o começo da multiplicação!',v:'<div class="big" style="font-size:34px">2 + 2 + 2 = 6</div>'}],
   practice:['grupos','somaRepetida','grupos','grupos','somaRepetida','grupos'],quiz:['grupos','somaRepetida','grupos','grupos','somaRepetida']},
  {id:'relogio',titulo:'Horas no relógio',icone:'🕐',bncc:'EF02MA19',
   slides:[{t:'O relógio tem dois ponteiros. O pequeno e vermelho mostra a HORA. O grande e azul mostra os MINUTOS.',v:relogioSVG(3,0)},
    {t:'Quando o ponteiro grande está no 12, é hora em ponto. Aqui são 3 horas: 3:00.',v:relogioSVG(3,0)},
    {t:'Quando o ponteiro grande está no 6, é meia hora: 30 minutos. Aqui são 3 e meia: 3:30.',v:relogioSVG(3,30)}],
   practice:['relogio','relogio','duracao','relogio','duracao','relogio'],quiz:['relogio','duracao','relogio','relogio','duracao']},
  {id:'calendario',titulo:'Dias, semanas e meses',icone:'📅',bncc:'EF02MA18',
   slides:[{t:'A semana tem 7 dias: domingo, segunda, terça, quarta, quinta, sexta e sábado.',v:'<div class="emo" style="font-size:44px">📅 7</div>'},
    {t:'O ano tem 12 meses. Começa em janeiro e termina em dezembro.',v:'<div class="emo" style="font-size:44px">🎆 janeiro … dezembro 🎄</div>'},
    {t:'Ontem já passou. Hoje é agora. Amanhã ainda vai chegar.',v:'<div class="emo" style="font-size:44px">⬅️ ontem · hoje · amanhã ➡️</div>'}],
   practice:['calendario','calendario','calendario','calendario','calendario','calendario'],quiz:['calendario','calendario','calendario','calendario','calendario']},
  {id:'formas',titulo:'Formas e sólidos',icone:'🔺',bncc:'EF02MA14/15',
   slides:[{t:'Formas planas são achatadas, como um desenho: círculo, quadrado, retângulo e triângulo.',v:`<svg viewBox="0 0 330 80" style="width:330px;max-width:90vw"><circle cx="40" cy="40" r="32" fill="#E06666"/><rect x="95" y="8" width="64" height="64" fill="#6FA8DC"/><rect x="180" y="20" width="70" height="40" fill="#F6C342"/><polygon points="295,6 328,74 262,74" fill="#93C47D"/></svg>`},
    {t:'O quadrado tem 4 lados iguais. O retângulo tem 4 lados, dois compridos e dois curtos. O triângulo tem 3 lados.',v:'<div class="emo" style="font-size:44px">🟦 ▬ 🔺</div>'},
    {t:'Sólidos têm volume e dá para pegar: a bola é uma esfera, o dado é um cubo, a lata é um cilindro e a casquinha é um cone.',v:'<div class="emo" style="font-size:48px">⚽ 🎲 🥫 🍦</div>'}],
   practice:['formaPlana','formaPlana','solidos','formaPlana','solidos','solidos'],quiz:['formaPlana','solidos','formaPlana','solidos','formaPlana']},
  {id:'medidas',titulo:'Medidas',icone:'📏',bncc:'EF02MA16/17',
   slides:[{t:'Para medir o comprimento usamos a régua ou a fita métrica, em centímetros e metros.',v:reguaSVG(0,6)},
    {t:'Na régua, comece sempre no 0. Se a coisa começa em outro número, faça o fim menos o começo.',v:reguaSVG(2,5)},
    {t:'O peso medimos em quilos, na balança. Os líquidos medimos em litros.',v:'<div class="emo" style="font-size:48px">⚖️ 🍚 &nbsp; 🥛 1 L</div>'}],
   practice:['regua','regua','medidas','regua','medidas','medidas'],quiz:['regua','medidas','regua','medidas','regua']},
  {id:'graficos',titulo:'Gráficos',icone:'📊',bncc:'EF02MA22/23',
   slides:[{t:'Um gráfico mostra quantidades com desenhos ou barras. Aqui, cada quadradinho é uma criança que votou.',v:'<div class="emo" style="font-size:40px">🍎 🟦🟦🟦<br>🍌 🟦🟦</div>'},
    {t:'A linha mais comprida tem MAIS votos. A mais curta tem MENOS. Para saber quantos a mais, faça o maior menos o menor.',v:'<div class="big" style="font-size:30px">3 − 2 = 1</div>'}],
   practice:['grafico','grafico','grafico','grafico','grafico','grafico'],quiz:['grafico','grafico','grafico','grafico','grafico']},
);

/* ---- Português: ler e entender textos curtos (EF12LP01/EF02LP12/EF12LP04) ---- */
const TEXTOS=[
 ['A pipa de Caio','Caio fez uma pipa amarela com o avô. No sábado, eles foram ao campo. O vento estava forte e a pipa subiu bem alto. Caio deu um grito de alegria.',[
   ['Quem ajudou Caio a fazer a pipa?','O avô',['A mãe','O professor']],['De que cor era a pipa?','Amarela',['Azul','Vermelha']],
   ['Por que a pipa subiu alto?','Porque o vento estava forte',['Porque era sábado','Porque era amarela'],'i'],['Como Caio se sentiu?','Feliz',['Triste','Com medo'],'i']]],
 ['O gato Pingo','Pingo é um gato branco com uma mancha preta no olho. Ele dorme o dia todo no sofá. À noite, ele acorda e brinca com uma bolinha de lã.',[
   ['Como é o Pingo?','Branco com uma mancha preta',['Todo preto','Laranja com listras']],['Onde o Pingo dorme?','No sofá',['Na cama','No telhado']],
   ['Quando o Pingo brinca?','À noite',['De manhã','Na hora do almoço']],['Com o que ele brinca?','Uma bolinha de lã',['Um carrinho','Uma bola de futebol']]]],
 ['A horta da escola','A turma da professora Rosa plantou alface e cenoura. Todo dia, uma criança regava a horta. Depois de dois meses, eles colheram as verduras e fizeram uma salada.',[
   ['O que a turma plantou?','Alface e cenoura',['Milho e feijão','Tomate e batata']],['O que as crianças faziam todo dia?','Regavam a horta',['Colhiam as verduras','Faziam salada']],
   ['O que fizeram com as verduras?','Uma salada',['Um bolo','Um suco']],['Por que regavam a horta todo dia?','Porque as plantas precisam de água',['Porque gostavam de se molhar','Porque a professora mandou brincar'],'i']]],
 ['Dia de chuva','Choveu a manhã toda. Lia queria brincar no parque, mas não pôde sair. Então ela e o irmão montaram uma cabana com lençóis na sala.',[
   ['Por que Lia não foi ao parque?','Porque estava chovendo',['Porque estava doente','Porque o parque fechou'],'i'],['Com quem Lia brincou?','Com o irmão',['Com a vizinha','Sozinha']],
   ['O que eles montaram?','Uma cabana de lençóis',['Um quebra-cabeça','Um castelo de areia']],['Onde fizeram a cabana?','Na sala',['No parque','No quintal']]]],
 ['As abelhas','As abelhas vivem em grupo, numa casa chamada colmeia. Elas visitam as flores para pegar o néctar. Com o néctar, elas fazem o mel.',[
   ['Como se chama a casa das abelhas?','Colmeia',['Ninho','Toca']],['O que as abelhas pegam nas flores?','Néctar',['Folhas','Terra']],
   ['O que as abelhas fazem com o néctar?','Mel',['Leite','Suco']],['Para que serve esse texto?','Para ensinar sobre as abelhas',['Para contar uma piada','Para ensinar uma receita'],'g']]],
 ['O bilhete','Mamãe, fui à casa da vovó com o papai. Voltamos às 6 horas. Tem bolo na geladeira. Beijos, Nina.',[
   ['Quem escreveu o bilhete?','Nina',['A mamãe','A vovó']],['Para quem é o bilhete?','Para a mamãe',['Para a vovó','Para o papai']],
   ['Aonde Nina foi?','À casa da vovó',['À escola','Ao mercado']],['A que horas eles voltam?','Às 6 horas',['Às 2 horas','Às 10 horas']]]],
 ['O piquenique','No domingo, a família de Beto fez um piquenique no parque. Levaram sanduíche, frutas e suco. Uma formiga subiu na toalha e Beto riu muito.',[
   ['Quando foi o piquenique?','No domingo',['Na segunda-feira','No sábado']],['Onde foi o piquenique?','No parque',['Na praia','Na escola']],
   ['O que subiu na toalha?','Uma formiga',['Um cachorro','Um passarinho']],['O que eles levaram para beber?','Suco',['Leite','Água de coco']]]],
 ['A semente de feijão','Téo colocou um feijão no algodão molhado. Depois de três dias, saiu uma raiz branquinha. Uma semana depois, apareceram as primeiras folhas verdes.',[
   ['Onde Téo colocou o feijão?','No algodão molhado',['Na geladeira','Na areia seca']],['O que apareceu primeiro?','A raiz',['As folhas','A flor'],'o'],
   ['Depois de quantos dias saiu a raiz?','Três dias',['Um dia','Dez dias']],['O que apareceu por último?','As folhas verdes',['A raiz','O algodão'],'o']]],
 ['O aniversário de Juca','Juca fez sete anos. A turma cantou parabéns e ele soprou as velas do bolo de chocolate. Ele ganhou um livro de dinossauros e ficou muito feliz.',[
   ['Quantos anos Juca fez?','Sete',['Seis','Oito']],['De que era o bolo?','De chocolate',['De morango','De cenoura']],
   ['O que Juca ganhou?','Um livro de dinossauros',['Uma bola','Um jogo de tabuleiro']],['Por que Juca soprou velas?','Porque era o aniversário dele',['Porque estava com calor','Porque a luz acabou'],'i']]],
 ['A tartaruga','A tartaruga anda bem devagar. Quando sente perigo, ela esconde a cabeça e as patas dentro do casco. O casco é duro e protege o corpo dela.',[
   ['Como a tartaruga anda?','Bem devagar',['Muito rápido','Pulando']],['O que ela faz quando sente perigo?','Esconde a cabeça e as patas no casco',['Sai voando','Corre para a água']],
   ['Para que serve o casco?','Para proteger o corpo',['Para nadar mais rápido','Para guardar comida']],['Que tipo de texto é esse?','Um texto que ensina sobre um animal',['Uma receita','Um bilhete'],'g']]],
 ['Suco de laranja','Você vai precisar de 3 laranjas e 1 copo de água. Corte as laranjas com a ajuda de um adulto. Esprema, misture com a água e sirva.',[
   ['Quantas laranjas são necessárias?','Três',['Uma','Cinco']],['Quem deve ajudar a cortar as laranjas?','Um adulto',['Um amigo','Ninguém']],
   ['O que se mistura com o suco?','Água',['Leite','Café']],['Para que serve esse texto?','Para ensinar a fazer suco',['Para contar uma história','Para convidar para uma festa'],'g']]],
 ['O convite','Venha para a festa junina da escola! Dia: sábado, 20 de junho. Hora: 3 da tarde. Venha com roupa caipira!',[
   ['Que festa é essa?','Festa junina',['Festa de Natal','Festa de aniversário']],['Em que dia da semana é a festa?','Sábado',['Domingo','Segunda-feira']],
   ['Que roupa usar?','Roupa caipira',['Fantasia de pirata','Pijama']],['A que horas começa?','3 da tarde',['8 da manhã','9 da noite']]]],
];
const TIPO_ERRO_TXT={i:'não entendeu o porquê',g:'não reconheceu o tipo de texto',o:'confundiu a ordem dos fatos'};
function textoGen(ini,fim){return()=>{const [tit,txt,qs]=pick(TEXTOS.slice(ini,fim)),[q,a,w,tp]=pick(qs);
  const ops=shuffle([{v:a,label:a,ok:true,type:null},...w.map(x=>({v:x,label:x,ok:false,type:TIPO_ERRO_TXT[tp]||'não achou a informação no texto'}))]);
  return{skill:tp==='i'?'Entender o texto':tp==='g'?'Tipos de texto':'Achar informação no texto',text:q,
    visual:`<div style="text-align:left;background:#fff;border-radius:14px;padding:12px 16px;font-size:21px;line-height:1.55;max-width:560px;margin:0 auto"><b style="color:var(--pri)">${tit}</b><br>${txt}</div>`,
    desc:`${tit}: ${q}`,optClass:ops.some(o=>o.label.length>12)?'sent':'txt',options:ops,hint:'Leia o texto de novo, devagar, e procure a parte que fala disso.',
    explain:tp==='i'?`O texto não diz com essas palavras, mas dá para entender. Resposta: ${a}.`:tp==='g'?`Resposta: ${a}.`:`Está escrito no texto. Resposta: ${a}.`}}}
Object.assign(GEN,{textoA:textoGen(0,6),textoB:textoGen(6,12)});
POR_LESSONS.push(
  {id:'textos1',titulo:'Ler e entender textos',icone:'📰',bncc:'EF12LP01',
   slides:[{t:'Antes de responder, leia o texto inteiro com calma. Depois leia a pergunta.',v:'<div class="emo" style="font-size:56px">📖 ➡️ ❓</div>'},
    {t:'A resposta quase sempre está escrita no texto. Volte e procure a parte que fala daquilo.',v:'<div class="emo" style="font-size:56px">🔍📄</div>'},
    {t:'Às vezes, a resposta não está escrita, mas dá para descobrir pensando: por que aconteceu? Como o personagem se sentiu?',v:'<div class="emo" style="font-size:56px">🤔💡</div>'}],
   practice:['textoA','textoA','textoA','textoA','textoA','textoA'],quiz:['textoA','textoA','textoA','textoA','textoA']},
  {id:'textos2',titulo:'Bilhetes, convites e receitas',icone:'💌',bncc:'EF02LP12',
   slides:[{t:'Existem textos de vários tipos. A história conta o que aconteceu. A receita ensina a fazer. O convite chama para uma festa. O bilhete dá um recado.',v:'<div class="emo" style="font-size:48px">📚 🍳 🎉 📝</div>'},
    {t:'Num convite, procure: que festa é, o dia, a hora e o lugar. Numa história: quem, onde, quando e o que aconteceu.',v:'<div class="emo" style="font-size:48px">❓ quem · onde · quando</div>'}],
   practice:['textoB','textoB','textoB','textoB','textoB','textoB'],quiz:['textoB','textoB','textoB','textoB','textoB']},
);

/* ---- Ciências: plantas e o Sol (EF02CI05/06/07/08) ---- */
Object.assign(GEN,{
  plantas:bk('Plantas','confundiu as partes da planta',[
    ['Do que a planta precisa para viver?','Água, luz e ar',['Só escuridão','Só doce'],'🌱','A planta precisa de água, luz do Sol, ar e de um solo bom.'],
    ['Qual parte da planta fica embaixo da terra?','A raiz',['A flor','A folha'],'🥕','A raiz fica embaixo da terra.'],
    ['Para que serve a raiz?','Para pegar água e segurar a planta',['Para enfeitar','Para fazer barulho'],'🌳','A raiz puxa a água da terra e segura a planta no chão.'],
    ['Para que serve o caule?','Para sustentar a planta e levar a água',['Para guardar ovos','Para fazer a planta dormir'],'🌿','O caule segura a planta em pé e leva a água até as folhas.'],
    ['Qual parte da planta vira fruto?','A flor',['A raiz','O caule'],'🌸','Depois de visitada pelas abelhas, a flor se transforma em fruto.'],
    ['Onde ficam as sementes?','Dentro do fruto',['Na raiz','Nas folhas'],'🍉','As sementes ficam dentro do fruto, como na melancia.'],
    ['O que acontece com uma planta sem água?','Ela murcha',['Ela cresce mais','Ela vira flor'],'🥀','Sem água, a planta murcha e pode morrer.'],
    ['Uma planta ficou dias num armário escuro. Como ela fica?','Fraca e amarelada',['Mais verde','Cheia de flores'],'🌑','Sem luz a planta não consegue fazer seu alimento e fica fraca.'],
    ['De onde nasce uma nova planta?','De uma semente',['De uma pedra','Do vento'],'🌰','A semente plantada na terra úmida germina e vira planta.'],
    ['Qual destes alimentos é uma raiz?','Cenoura',['Banana','Alface'],'🥕','A cenoura é a raiz da planta.'],
    ['Qual destes alimentos é uma folha?','Alface',['Feijão','Laranja'],'🥬','A alface é feita de folhas.'],
    ['Qual destes alimentos é um fruto?','Maçã',['Alface','Cenoura'],'🍎','A maçã é um fruto e tem sementes dentro.'],
    ['Que animal ajuda as flores a virarem frutos?','A abelha',['O peixe','A minhoca'],'🐝','A abelha leva o pólen de flor em flor.'],
    ['O tronco da árvore é um tipo de...','Caule',['Raiz','Folha'],'🌲','O tronco é o caule grosso das árvores.'],
    ['Na maioria das plantas, as folhas são de que cor?','Verdes',['Azuis','Pretas'],'🍃','As folhas costumam ser verdes.']]),
  sol:bk('Sol, luz e sombra','confundiu dia, noite e sombra',[
    ['O que ilumina o dia?','O Sol',['A Lua','As nuvens'],'☀️','O Sol ilumina e esquenta a Terra durante o dia.'],
    ['O que costumamos ver no céu à noite?','A Lua e as estrelas',['O arco-íris','O Sol forte'],'🌙','À noite vemos a Lua e as estrelas.'],
    ['Quando o Sol aparece no céu, começa o...','Dia',['Noite','Inverno'],'🌅','O Sol nascendo marca o começo do dia.'],
    ['A sombra aparece quando algo bloqueia a...','Luz',['Água','Comida'],'🌳','O corpo para a luz, e atrás dele fica a sombra.'],
    ['Ao meio-dia, com o Sol bem em cima, a sombra fica...','Bem curtinha',['Bem comprida','Colorida'],'🕛','Com o Sol lá no alto, a sombra fica pequena.'],
    ['No fim da tarde, com o Sol baixinho, a sombra fica...','Comprida',['Sumida','Quadrada'],'🌇','Quando o Sol está baixo, a sombra fica longa.'],
    ['Para que serve o protetor solar?','Para proteger a pele do Sol',['Para ficar cheiroso','Para matar a fome'],'🧴','O protetor evita queimaduras na pele.'],
    ['Qual horário tem o Sol mais forte?','Perto do meio-dia',['De manhã cedinho','À noite'],'🕛','Perto do meio-dia o Sol está mais forte: é melhor ficar na sombra.'],
    ['O que acontece com uma poça de água no sol?','Ela seca',['Ela congela','Ela fica maior'],'💧','O calor do Sol faz a água evaporar.'],
    ['Num dia de sol, qual lugar fica mais quente?','A calçada no sol',['A sombra da árvore','Dentro da geladeira'],'🔥','O que fica no sol esquenta mais.'],
    ['Qual camiseta esquenta mais no sol?','A preta',['A branca','A amarela clara'],'👕','Cores escuras esquentam mais no sol.'],
    ['Nunca devemos olhar direto para o...','Sol',['Livro','Desenho'],'😎','Olhar para o Sol machuca os olhos.'],
    ['Para fazer sombra com a mão, precisamos de...','Uma luz, como a lanterna',['Água','Silêncio'],'🔦','Sem luz não tem sombra.'],
    ['Quantas vezes o Sol nasce em um dia?','Uma vez',['Duas vezes','Nenhuma'],'🌄','O Sol nasce uma vez por dia, de manhã.'],
    ['O que fazemos normalmente à noite?','Dormir e descansar',['Tomar sol','Secar roupa no varal'],'😴','A noite é hora de descansar.']]),
});
CIE_LESSONS.push(
  {id:'plantas',titulo:'Plantas',icone:'🌻',bncc:'EF02CI05/06',
   slides:[{t:'A planta tem partes: a raiz embaixo da terra, o caule, as folhas, as flores e os frutos com as sementes.',v:'<div class="emo" style="font-size:44px">🌸 flor<br>🍃 folha<br>🌿 caule<br>🥕 raiz</div>'},
    {t:'Para viver, a planta precisa de água, luz do Sol, ar e terra boa.',v:'<div class="emo" style="font-size:56px">💧 ☀️ 🌬️ 🟫</div>'}],
   practice:['plantas','plantas','plantas','plantas','plantas','plantas'],quiz:['plantas','plantas','plantas','plantas','plantas']},
  {id:'sol',titulo:'Sol, dia e noite, sombra',icone:'☀️',bncc:'EF02CI07/08',
   slides:[{t:'De dia, o Sol ilumina e esquenta tudo. À noite, vemos a Lua e as estrelas.',v:'<div class="emo" style="font-size:56px">☀️ 🌍 🌙</div>'},
    {t:'A sombra aparece quando algo fica na frente da luz. Ela muda de tamanho conforme o Sol anda no céu.',v:'<div class="emo" style="font-size:56px">🔦 🧍 ⬛</div>'},
    {t:'O Sol é forte: use protetor, boné e beba água. E nunca olhe direto para ele!',v:'<div class="emo" style="font-size:56px">🧴 🧢 💧</div>'}],
   practice:['sol','sol','sol','sol','sol','sol'],quiz:['sol','sol','sol','sol','sol']},
);

/* ---- História (EF02HI01/04/06/07) ---- */
Object.assign(GEN,{
  tempo:bk('Passado, presente e futuro','confundiu passado, presente e futuro',[
    ['Ontem já passou. Ontem é...','Passado',['Presente','Futuro'],'⏪','O que já aconteceu é passado.'],
    ['Amanhã ainda vai chegar. Amanhã é...','Futuro',['Passado','Presente'],'⏩','O que ainda vai acontecer é futuro.'],
    ['O que está acontecendo agora é o...','Presente',['Passado','Futuro'],'⏺️','Agora é o presente.'],
    ['Quando você era bebê, isso foi no...','Passado',['Futuro','Presente'],'👶','Você já foi bebê: é passado.'],
    ['Quando você crescer e for adulto, isso será no...','Futuro',['Passado','Presente'],'🧑','Ser adulto ainda vai acontecer: é futuro.'],
    ['O que usamos para saber o dia, o mês e o ano?','Calendário',['Régua','Balança'],'📅','O calendário marca os dias, os meses e o ano.'],
    ['O que usamos para ver as horas?','Relógio',['Termômetro','Calendário'],'⏰','O relógio mostra as horas.'],
    ['O que aconteceu primeiro na sua vida?','Aprender a andar',['Aprender a ler','Ir para o 2º ano'],'🚶','Primeiro aprendemos a andar, bem pequenos. Ler vem depois.'],
    ['Qual vem primeiro na vida?','Ser bebê',['Ser criança','Ser adulto'],'🍼','Primeiro bebê, depois criança, depois adulto.'],
    ['Uma foto de quando você tinha 2 anos mostra o seu...','Passado',['Futuro','Presente'],'🖼️','A foto mostra algo que já aconteceu.'],
    ['Onde ficam guardadas as lembranças da família?','Em fotos, objetos e histórias dos avós',['Só na televisão','Em lugar nenhum'],'📷','Fotos, objetos e as histórias contadas guardam o passado da família.'],
    ['Qual documento tem seu nome e o dia em que você nasceu?','Certidão de nascimento',['Conta de luz','Receita de bolo'],'📄','A certidão de nascimento registra o nome e a data em que nascemos.'],
    ['Manhã, tarde e...','Noite',['Semana','Ano'],'🌙','O dia tem manhã, tarde e noite.'],
    ['Uma linha do tempo mostra...','Os acontecimentos em ordem',['As cores do arco-íris','Os animais da fazenda'],'➡️','A linha do tempo coloca os fatos na ordem em que aconteceram.'],
    ['Seu aniversário é a cada...','Ano',['Dia','Semana'],'🎂','Fazemos aniversário uma vez por ano.']]),
  antigamente:bk('Antigamente e hoje','confundiu antigamente com hoje',[
    ['Antigamente, sem celular, como as pessoas mandavam notícias para longe?','Por carta',['Por mensagem no celular','Por e-mail'],'✉️','Antes do celular, as notícias iam por carta, pelo correio.'],
    ['Qual destas brincadeiras é bem antiga e brincada até hoje?','Amarelinha',['Jogo no tablet','Videogame'],'🦶','A amarelinha é brincada há muito tempo.'],
    ['Antes da luz elétrica, as casas eram iluminadas com...','Velas e lampiões',['Lâmpadas de LED','Lanterna de celular'],'🕯️','Sem luz elétrica, usavam velas e lampiões.'],
    ['Antes da máquina de lavar, a roupa era lavada...','À mão, no tanque ou no rio',['Por um robô','Pelo celular'],'🧺','Lavavam a roupa à mão.'],
    ['Como era o telefone antigo?','Preso na parede ou na mesa, com fio',['Pequeno e no bolso','No relógio de pulso'],'☎️','O telefone antigo tinha fio e ficava num lugar só.'],
    ['Qual destes objetos é o mais antigo?','Máquina de escrever',['Computador','Tablet'],'⌨️','A máquina de escrever veio muito antes do computador.'],
    ['A peteca é uma brincadeira que veio dos...','Povos indígenas',['Robôs','Astronautas'],'🏸','A peteca foi criada pelos povos indígenas do Brasil.'],
    ['Para saber do que os avós brincavam, o melhor é...','Perguntar para eles',['Adivinhar','Ver um desenho animado'],'👵','Os avós contam as histórias do tempo deles.'],
    ['Qual é uma brincadeira de roda bem antiga?','Ciranda',['Videogame','Desenho no tablet'],'⭕','A ciranda é uma roda cantada muito antiga.'],
    ['Antes da geladeira, como se guardava a carne?','Com sal, secando ao sol',['No freezer','No micro-ondas'],'🥩','Salgar e secar a carne fazia ela durar mais.'],
    ['O que muda com o passar do tempo?','Os objetos e os costumes',['Nada muda','Só o tamanho do Sol'],'🔄','Os objetos e o jeito de viver mudam com o tempo.'],
    ['O que continua igual de antigamente até hoje?','As crianças gostam de brincar',['As crianças não brincam mais','Ninguém usa brinquedos'],'🧒','Em todas as épocas, as crianças brincam.'],
    ['Que brinquedo dá para fazer com duas latas e um barbante?','Telefone de lata',['Tablet','Videogame'],'🥫','Com latas e barbante se faz um telefone de brinquedo.'],
    ['Bolinha de gude, pião e pipa são brinquedos...','Antigos que ainda existem',['Que só existem no celular','Inventados ontem'],'🪀','São brinquedos antigos que as crianças ainda adoram.'],
    ['Antigamente, como se ouvia música em casa?','No rádio ou na vitrola',['No celular','No tablet'],'📻','Antes do celular, a música vinha do rádio e dos discos na vitrola.']]),
});
const HIS_LESSONS=[
  {id:'tempo',titulo:'Eu e o tempo',icone:'⏳',bncc:'EF02HI01/06/07',
   slides:[{t:'Passado é o que já aconteceu. Presente é agora. Futuro é o que ainda vai acontecer.',v:'<div class="emo" style="font-size:48px">⏪ ontem · ⏺️ hoje · ⏩ amanhã</div>'},
    {t:'Nossa vida também tem uma ordem: primeiro bebê, depois criança, depois adulto.',v:'<div class="emo" style="font-size:56px">👶 ➡️ 🧒 ➡️ 🧑</div>'},
    {t:'Usamos o relógio para as horas e o calendário para os dias, os meses e os anos.',v:'<div class="emo" style="font-size:56px">⏰ 📅</div>'}],
   practice:['tempo','tempo','tempo','tempo','tempo','tempo'],quiz:['tempo','tempo','tempo','tempo','tempo']},
  {id:'antigamente',titulo:'Antigamente e hoje',icone:'📻',bncc:'EF02HI04',
   slides:[{t:'Antigamente, muitas coisas eram diferentes: não tinha celular, e a luz era de vela.',v:'<div class="emo" style="font-size:56px">🕯️ ✉️ ☎️</div>'},
    {t:'Algumas coisas continuam: as crianças sempre brincaram de pipa, pião, amarelinha e ciranda.',v:'<div class="emo" style="font-size:56px">🪁 🪀 🦶</div>'},
    {t:'Para conhecer o passado, pergunte aos avós e veja fotos antigas da família.',v:'<div class="emo" style="font-size:56px">👴👵 📷</div>'}],
   practice:['antigamente','antigamente','antigamente','antigamente','antigamente','antigamente'],quiz:['antigamente','antigamente','antigamente','antigamente','antigamente']},
];

/* ---- Geografia (EF02GE01/03/04/10) ---- */
const LUG=[['🐶','o','cachorro'],['🐱','o','gato'],['🌳','a','árvore'],['🏠','a','casa'],['🚗','o','carro'],['⚽','a','bola'],['🐦','o','passarinho'],['🌻','a','flor'],['🚲','a','bicicleta'],['🐰','o','coelho']];
Object.assign(GEN,{
  lado(){const row=shuffle(LUG.slice()).slice(0,4),t=pick(['direita','esquerda','direita','esquerda','ponta']),nm=r=>`${r[0]} ${cap1(r[2])}`,de=r=>(r[1]==='o'?'do ':'da ')+r[2];let i,ans,text,expl;
    if(t==='ponta'){const lado=pick(['esquerda','direita']);ans=lado==='esquerda'?0:3;text=`Quem está na ponta da ${lado}?`;expl=`Na ponta da ${lado} está ${row[ans][1]} ${row[ans][2]}.`}
    else{i=t==='direita'?rnd(0,2):rnd(1,3);ans=t==='direita'?i+1:i-1;text=`Quem está logo à ${t} ${de(row[i])}?`;expl=`Logo à ${t} ${de(row[i])} está ${row[ans][1]} ${row[ans][2]}.`}
    const oposto=t==='ponta'?3-ans:(t==='direita'?i-1:i+1);
    const ops=row.map((r,j)=>({j,r})).filter(x=>x.j!==i).map(({j,r})=>({v:r[2],label:nm(r),ok:j===ans,type:j===ans?null:j===oposto?'confundiu direita com esquerda':'não olhou o vizinho do lado'}));
    return{skill:'Direita e esquerda',text,visual:`<div class="emo" style="font-size:52px;letter-spacing:10px">${row.map(r=>r[0]).join(' ')}</div><div style="display:flex;justify-content:space-between;gap:40px;font-weight:700;color:var(--muted);width:340px;max-width:90vw;margin:6px auto 0"><span>⬅️ esquerda</span><span>direita ➡️</span></div>`,
      desc:`${t} ${row.map(r=>r[2]).join(',')} ${i??ans}`,optClass:'txt',options:shuffle(ops),hint:'A esquerda fica do lado da seta ⬅️. A direita, do lado da seta ➡️.',explain:expl}},
  transportes:bk('Transportes e comunicação','confundiu os meios de transporte',[
    ['Qual meio de transporte anda nos trilhos?','Trem',['Barco','Avião'],'🚆','O trem anda sobre trilhos.'],
    ['Qual meio de transporte anda na água?','Barco',['Ônibus','Bicicleta'],'⛵','O barco é um transporte aquático.'],
    ['Qual meio de transporte voa?','Avião',['Carro','Trem'],'✈️','O avião é um transporte aéreo.'],
    ['Qual transporte não solta fumaça e ainda faz exercício?','Bicicleta',['Carro','Moto'],'🚲','A bicicleta não polui e faz bem para a saúde.'],
    ['Qual transporte leva muitas pessoas pela cidade?','Ônibus',['Bicicleta','Patinete'],'🚌','O ônibus leva muitas pessoas de uma vez.'],
    ['Onde é mais seguro atravessar a rua?','Na faixa de pedestres',['No meio dos carros','Correndo sem olhar'],'🚸','Atravesse na faixa, olhando para os dois lados e de mão dada com um adulto.'],
    ['O sinal vermelho para os carros quer dizer...','Parar',['Acelerar','Buzinar'],'🚦','Vermelho é parar.'],
    ['Qual destes é um meio de comunicação?','Telefone',['Bicicleta','Panela'],'📞','O telefone serve para conversar com quem está longe.'],
    ['Para mandar uma carta, usamos o...','Correio',['Mercado','Hospital'],'📮','O correio leva as cartas.'],
    ['Para saber as notícias, usamos...','Televisão, rádio ou internet',['Geladeira','Fogão'],'📺','TV, rádio e internet trazem as notícias.'],
    ['Qual destes é um transporte terrestre?','Carro',['Navio','Helicóptero'],'🚗','O carro anda na terra, pelas ruas.'],
    ['Quando devemos usar o cinto de segurança?','Sempre que andar de carro',['Só em viagem longa','Nunca'],'🔒','O cinto protege em qualquer viagem, curta ou longa.'],
    ['Onde a criança deve ir no carro?','No banco de trás, na cadeirinha ou no assento',['No colo do motorista','No banco da frente sem cinto'],'💺','Criança vai atrás, presa na cadeirinha ou no assento.'],
    ['Qual transporte é puxado por cavalos?','Carroça',['Metrô','Avião'],'🐴','A carroça é puxada por cavalos.'],
    ['Qual meio de comunicação existe há mais tempo?','Carta',['Celular','Internet'],'✉️','As cartas existem há muito mais tempo que o celular.']]),
  lugares:bk('Lugares e paisagens','confundiu os lugares',[
    ['Onde as crianças estudam?','Na escola',['No hospital','Na padaria'],'🏫','A escola é o lugar de aprender.'],
    ['Onde compramos pão?','Na padaria',['Na farmácia','No correio'],'🥖','O pão é vendido na padaria.'],
    ['Onde cuidamos da saúde?','No posto de saúde ou hospital',['No supermercado','Na praça'],'🏥','Médicos e enfermeiros trabalham no posto e no hospital.'],
    ['Onde pegamos livros emprestados?','Na biblioteca',['Na padaria','No banco'],'📚','A biblioteca empresta livros.'],
    ['Quem apaga incêndios?','Os bombeiros',['Os padeiros','Os carteiros'],'🚒','Os bombeiros apagam o fogo e salvam pessoas.'],
    ['Qual paisagem foi pouco mudada pelas pessoas?','Uma mata',['Uma rua com prédios','Um shopping'],'🌳','A mata é uma paisagem natural.'],
    ['Qual paisagem foi construída pelas pessoas?','Uma cidade com prédios e ruas',['Uma floresta','Uma cachoeira na mata'],'🏙️','Prédios e ruas foram feitos pelas pessoas: é uma paisagem modificada.'],
    ['As casas e ruas perto da sua casa formam o...','Bairro',['Planeta','Oceano'],'🏘️','O bairro é a parte da cidade onde moramos.'],
    ['Londrina fica em qual estado?','Paraná',['São Paulo','Bahia'],'📍','Londrina é uma cidade do Paraná.'],
    ['Qual é a capital do Paraná?','Curitiba',['Londrina','Rio de Janeiro'],'🏛️','A capital do Paraná é Curitiba.'],
    ['Em qual país nós moramos?','Brasil',['Portugal','Japão'],'🇧🇷','Nós moramos no Brasil.'],
    ['Onde deve ir o lixo?','Na lixeira',['Na rua','No rio'],'🗑️','Lixo na lixeira deixa o bairro limpo e o rio saudável.'],
    ['Um mapa mostra os lugares vistos de...','Cima',['Baixo','Dentro'],'🗺️','O mapa desenha os lugares como um passarinho vê lá de cima.'],
    ['Qual destes é um lugar de brincar no bairro?','A praça',['O posto de gasolina','A farmácia'],'🛝','A praça é um lugar de lazer.'],
    ['No campo, o que é comum ter?','Plantações e animais de criação',['Muitos prédios altos','Metrô'],'🐄','O campo tem plantações, sítios e fazendas.']]),
});
const GEO_LESSONS=[
  {id:'lado',titulo:'Direita e esquerda',icone:'↔️',bncc:'EF02GE10',
   slides:[{t:'Levante a mão que você usa para escrever. Agora olhe as setas: ⬅️ é a esquerda e ➡️ é a direita.',v:'<div class="emo" style="font-size:56px">⬅️ ✋ ➡️</div>'},
    {t:'Numa fila, o vizinho da direita é quem está logo do lado da seta ➡️. O da esquerda, do lado da seta ⬅️.',v:'<div class="emo" style="font-size:52px;letter-spacing:10px">🐶 🐱 🌳</div><div class="muted">O gato está à direita do cachorro.</div>'}],
   practice:['lado','lado','lado','lado','lado','lado'],quiz:['lado','lado','lado','lado','lado']},
  {id:'lugares',titulo:'Meu bairro e minha cidade',icone:'🏘️',bncc:'EF02GE01/04',
   slides:[{t:'No bairro tem casas, escola, padaria, posto de saúde e praça. Cada lugar tem uma função.',v:'<div class="emo" style="font-size:52px">🏠 🏫 🥖 🏥 🛝</div>'},
    {t:'Algumas paisagens são naturais, como a mata. Outras foram construídas pelas pessoas, como a cidade.',v:'<div class="emo" style="font-size:52px">🌳🏞️ &nbsp; 🏙️🛣️</div>'},
    {t:'Nós moramos em Londrina, uma cidade do estado do Paraná, no Brasil.',v:'<div class="emo" style="font-size:52px">🏘️ ➡️ 📍 ➡️ 🇧🇷</div>'}],
   practice:['lugares','lugares','lugares','lugares','lugares','lugares'],quiz:['lugares','lugares','lugares','lugares','lugares']},
  {id:'transportes',titulo:'Transportes e comunicação',icone:'🚌',bncc:'EF02GE03',
   slides:[{t:'Os transportes podem andar na terra, na água ou no ar.',v:'<div class="emo" style="font-size:52px">🚗 🚆 &nbsp; ⛵ &nbsp; ✈️</div>'},
    {t:'Os meios de comunicação levam mensagens: carta, telefone, rádio, televisão e internet.',v:'<div class="emo" style="font-size:52px">✉️ 📞 📻 📺</div>'},
    {t:'No trânsito: cinto sempre, criança no banco de trás e atravessar na faixa de mão dada.',v:'<div class="emo" style="font-size:52px">🔒 💺 🚸</div>'}],
   practice:['transportes','transportes','transportes','transportes','transportes','transportes'],quiz:['transportes','transportes','transportes','transportes','transportes']},
];
MISSOES.push(
  {icone:'🕐',materia:'Matemática',texto:'Durante um dia, olhe o relógio 3 vezes e diga a hora em voz alta para alguém conferir.'},
  {icone:'📊',materia:'Matemática',texto:'Pergunte a 5 pessoas qual a fruta preferida delas e desenhe um gráfico com quadradinhos.'},
  {icone:'↔️',materia:'Geografia',texto:'Brinque de "siga o mestre" com direita e esquerda: alguém dá os comandos e você obedece.'},
);

/* ================= LOTE 5 · 18/11/2026 · palavras dos jogos do tempo livre ================= */
/* Temas do caça-palavras e do jogo da memória (jogos.js). Palavras SEM acento e sem Ç, de 3 a 8 letras.
   Para ampliar: JOGO_TEMAS.novoTema={nome:'…',ic:'…',palavras:[['PALAVRA','emoji'],…]} com pelo menos 8 palavras. */
const JOGO_TEMAS={
  animais:{nome:'Animais',ic:'🐾',palavras:[['GATO','🐱'],['PATO','🦆'],['VACA','🐄'],['SAPO','🐸'],['COBRA','🐍'],['URSO','🐻'],['PEIXE','🐟'],['ZEBRA','🦓'],['MACACO','🐒'],['CAVALO','🐴'],['GALINHA','🐔'],['TIGRE','🐯'],['RATO','🐭'],['POLVO','🐙'],['CORUJA','🦉'],['OVELHA','🐑']]},
  frutas:{nome:'Frutas',ic:'🍓',palavras:[['UVA','🍇'],['BANANA','🍌'],['MANGA','🥭'],['PERA','🍐'],['KIWI','🥝'],['MELANCIA','🍉'],['LARANJA','🍊'],['CEREJA','🍒'],['COCO','🥥'],['MORANGO','🍓'],['ABACAXI','🍍']]},
  cores:{nome:'Cores',ic:'🎨',palavras:[['AZUL','🔵'],['VERDE','🟢'],['ROSA','🌸'],['PRETO','⚫'],['BRANCO','⚪'],['ROXO','🟣'],['CINZA','🩶'],['AMARELO','🟡'],['VERMELHO','🔴'],['MARROM','🟤']]},
  escola:{nome:'Escola',ic:'🏫',palavras:[['LIVRO','📘'],['MOCHILA','🎒'],['CADERNO','📓'],['COLA','🧴'],['TESOURA','✂️'],['ESTOJO','👝'],['QUADRO','🖼️'],['GIZ','🖍️'],['MESA','🪑'],['PROVA','📝'],['RECREIO','⚽']]},
  corpo:{nome:'Corpo',ic:'🧍',palavras:[['BOCA','👄'],['NARIZ','👃'],['OLHO','👁️'],['DEDO','☝️'],['PERNA','🦵'],['CABELO','💇'],['ORELHA','👂'],['DENTE','🦷'],['JOELHO','🦿']]},
  casa:{nome:'Casa',ic:'🏠',palavras:[['CAMA','🛏️'],['PORTA','🚪'],['JANELA','🪟'],['CADEIRA','🪑'],['PANELA','🍳'],['COPO','🥤'],['PRATO','🍽️'],['GARFO','🍴'],['ESPELHO','🪞'],['CHUVEIRO','🚿']]},
};

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
      desc:`${r.materia}, semana ${r.semana} (completar: ${ans})`,options:shuffle([{v:ans,label:ans,ok:true,type:null},...ds.map(d=>({v:d,label:d,ok:false,type:'trocou a palavra da memória'}))]),
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

MAT_LESSONS.forEach(l=>l.subject='Matemática');POR_LESSONS.forEach(l=>l.subject='Português');CIE_LESSONS.forEach(l=>l.subject='Ciências');FIN_LESSONS.forEach(l=>l.subject='Dinheiro');LOG_LESSONS.forEach(l=>l.subject='Lógica');EMO_LESSONS.forEach(l=>l.subject='Emoções');HIS_LESSONS.forEach(l=>l.subject='História');GEO_LESSONS.forEach(l=>l.subject='Geografia');
SUBJECTS[0].lessons=MAT_LESSONS;Object.assign(SUBJECTS[1],{lessons:POR_LESSONS,ready:true,ano:'2º ano'});
Object.assign(SUBJECTS[2],{lessons:CIE_LESSONS,ready:true,ano:'2º ano'});
Object.assign(SUBJECTS.find(x=>x.id==='his'),{lessons:HIS_LESSONS,ready:true,ano:'2º ano'});Object.assign(SUBJECTS.find(x=>x.id==='geo'),{lessons:GEO_LESSONS,ready:true,ano:'2º ano'});
SUBJECTS.splice(SUBJECTS.findIndex(x=>x.id==='mem'),0,
  {id:'fin',nome:'Dinheiro',ic:'🪙',ano:'2º ano',ready:true,lessons:FIN_LESSONS},
  {id:'log',nome:'Lógica',ic:'🧩',ano:'2º ano',ready:true,lessons:LOG_LESSONS},
  {id:'emo',nome:'Emoções',ic:'💛',ano:'2º ano',ready:true,lessons:EMO_LESSONS});
const LESSONS=[...MAT_LESSONS,...POR_LESSONS,...CIE_LESSONS,...FIN_LESSONS,...LOG_LESSONS,...EMO_LESSONS,...HIS_LESSONS,...GEO_LESSONS];
const PRAISE=['Muito bem!','Isso aí!','Arrasou!','Perfeito!','Você acertou!'];
