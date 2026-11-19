/* Trilha do Saber · Lumi, a robô conselheira (img/robo.webp).
   Nome em ROBO_NOME.
   Lê as respostas dela no próprio aparelho, em tempo real (só a 1ª tentativa de cada questão), e:
   1) na tela inicial, mostra um balão com um elogio verdadeiro + UMA coisa para melhorar, com o botão "Treinar agora";
   2) no fim de cada lição, comenta o que acabou de acontecer;
   3) durante a lição, se ela errar 2 vezes o mesmo tipo de coisa, dá uma dica de como pensar (sem dar a resposta);
   4) comemora quando uma habilidade que estava difícil melhora.
   Tudo local: sem IA e sem internet. As dicas são escritas à mão, ligadas ao tipo de erro (type dos distratores). */

/* ---------- dicas por tipo de erro (estratégia, nunca a resposta) ---------- */
const ROBO_DICAS=[
  [/ponteiros|número vizinho|hora cheia/,'O ponteiro pequeno mostra a hora. O grande mostra os minutos: no 12 é hora cheia, no 6 é meia hora.'],
  [/vai um/,'Quando as unidades passam de 9, junte 10 e leve 1 para as dezenas. É o vai um!'],
  [/dezena emprestada|menor do maior na unidade/,'Se em cima tem menos unidades, pegue 10 emprestado da dezena. Depois lembre que a dezena ficou com 1 a menos.'],
  [/dezena com unidade|dezenas errado|unidades errado|montou as/,'Cada barra é uma dezena, um grupo de 10. Os quadradinhos soltos são as unidades. Conte primeiro as barras, de 10 em 10.'],
  [/unidade antes da dezena|escolheu o (menor|maior)/,'Para comparar, olhe primeiro a dezena, que é o número da esquerda. Quem tem mais dezenas é maior.'],
  [/multiplicar|somou 1 em vez de pular|errou o pulo|grupo a (mais|menos)|grupos com os itens/,'Vezes é contar pulando: 3 vezes 4 é dar 3 pulos de 4. Conte os pulos nos dedos.'],
  [/dobro|dobrar|metade|próprio número|dividir|partes diferentes|somou 2/,'Dobro é o número mais ele mesmo. Metade é dividir em duas partes iguais.'],
  [/(somou|subtraiu) em vez|mais em vez de menos|menos em vez de mais|inverteu a ordem/,'Antes da conta, pense: a quantidade vai aumentar ou diminuir? Ganhou ou juntou é de mais. Perdeu, gastou ou comeu é de menos.'],
  [/de 1 em 1|pulou um número|repetiu o próximo/,'Contando pulando, o pulo é sempre do mesmo tamanho. Fale os números em voz alta e conte o pulo nos dedos.'],
  [/antes com depois|pulou uma dezena|repetiu o último/,'Antes é o número que vem atrás, depois é o que vem na frente. Fale a sequência em voz alta.'],
  [/errou por [12]|contou um a (mais|menos)|vizinho de trás|vizinho com dezena/,'Conte bem devagar, apontando com o dedo, um número de cada vez.'],
  [/nas dezenas|nas unidades/,'Faça a conta em duas partes: primeiro as unidades, depois as dezenas.'],
  [/contagem|errou a conta|errou a soma/,'Use os dedos ou desenhe bolinhas no papel para conferir a conta.'],
  [/sílabas a (mais|menos)/,'Bata uma palma para cada pedacinho da palavra. Cada palma é uma sílaba.'],
  [/segunda sílaba|som inicial/,'Fale a palavra devagar e preste atenção só no primeiro pedacinho.'],
  [/ordem das sílabas/,'Fale a palavra devagar e escolha as sílabas na ordem em que você escuta.'],
  [/som final/,'Rima é quando o final das palavras soa igual. Fale as duas e escute só o fim.'],
  [/ponto final|maiúscula/,'Toda frase começa com letra maiúscula e termina com ponto. Nomes de pessoas e lugares também começam com maiúscula.'],
  [/quem faz a ação|o que é feito/,'Leia a frase de novo e pergunte: quem faz? E o que faz?'],
  [/NH|LH|CH/,'Fale a palavra devagar. NH soa como em ninho, LH como em folha e CH como em chuva.'],
  [/alfabeto|primeira letra/,'Olhe a primeira letra de cada palavra e cante o alfabeto para ver qual vem antes.'],
  [/notas em vez dos valores/,'Dinheiro se conta pelo valor escrito na nota ou na moeda, e não pela quantidade.'],
  [/mais caro/,'Compare o preço com o dinheiro que você tem. Só dá para comprar se o preço for menor ou igual.'],
  [/começo também|hora do (fim|começo)/,'Para saber quanto tempo passou, conte os pulos de uma hora até a outra.'],
  [/respondeu o (preço|total|número maior)|só o maior/,'Leia a pergunta de novo, bem devagar. O que ela quer saber?'],
  [/semana a (mais|menos)/,'Conte as semanas nos dedos, uma de cada vez.'],
  [/precisar com querer/,'Precisar é o que faz falta, como comida e remédio. Querer é vontade.'],
  [/repetição/,'Procure o pedaço que se repete e fale em voz alta: um, dois, um, dois.'],
  [/seta/,'Siga cada seta com o dedo antes de responder.'],
  [/ordem dos (passos|fatos)/,'Pense: o que acontece primeiro? E depois? E no fim?'],
  [/ontem|pulou um (dia|mês)|calendário/,'Ontem já passou, amanhã ainda vai chegar. Fale os dias da semana em ordem.'],
  [/formas|lados|cantos|quadrado/,'Passe o dedo em cada lado e conte. O quadrado tem os 4 lados iguais.'],
  [/riscos/,'Na régua, comece no zero e conte os espaços entre os números.'],
  [/gráfico|linha errada|frutas em vez|mais com menos/,'Ponha o dedo no topo da barra e siga reto até o número do lado.'],
  [/texto|porquê/,'Ouça o texto de novo no 🔊 e procure a parte que fala da pergunta.'],
  [/direita com esquerda|vizinho do lado/,'Levante as mãos: o polegar e o dedo indicador da mão esquerda formam um L.'],
  [/R com RR/,'Entre duas vogais, o som forte se escreve com RR, como em carro.'],
  [/S com SS/,'Entre duas vogais, o som de S se escreve com SS, como em pássaro.'],
  [/M antes de P e B/,'Antes de P e de B sempre vem M, como em campo e bombom.'],
  [/pergunta|emoção/,'Pergunta termina com ponto de interrogação. Susto e alegria terminam com exclamação. Uma informação termina com ponto.'],
  [/contrário|parecido|não combina/,'Sinônimo quer dizer quase a mesma coisa. Antônimo é o contrário.'],
  [/aumentativo|com plural/,'Aumentativo deixa grande, como casarão. Diminutivo deixa pequeno, como casinha. Plural é mais de um.'],
  [/terminação|fazer o plural/,'Plural é mais de um: quase sempre a palavra ganha um S no final.'],
  [/última letra|outra palavra/,'Algumas palavras mudam inteiras do masculino para o feminino, como boi e vaca.'],
  [/mapa/,'Ponha o dedo no mapa e procure as pistas: o mar, os rios e o formato do lugar.'],
  [/preposição/,'Leia a frase com cada palavra no lugar e escute qual soa certo.'],
  [/inglês|ouvindo/,'Toque no 🔊 e repita a palavra em inglês em voz alta. Falando, a gente lembra mais.'],
];
const ROBO_DICA_GERAL='Volte na explicação da lição e ouça de novo. Depois tente contar com as suas palavras.';
function roboDica(tipo,skill){const t=String(tipo||'');
  if(t&&t!=='outro erro')for(const [re,d] of ROBO_DICAS)if(re.test(t))return d;
  if(/^Inglês/.test(skill||''))return 'Toque no 🔊 e repita a palavra em inglês em voz alta. Falando, a gente lembra mais.';
  if(/Tabuada/.test(skill||''))return 'Vezes é contar pulando: 3 vezes 4 é dar 3 pulos de 4. Conte os pulos nos dedos.';
  return ROBO_DICA_GERAL}
const ROBO_NOME='Lumi',ROBO_IMG='img/robo.webp';
const roboImg=(px,extra)=>`<img src="${ROBO_IMG}" alt="${ROBO_NOME}, a robô" width="${px}" height="${Math.round(px*1.065)}" style="display:block;${extra||''}">`;
/* a voz não lê os emojis (senão fala "estrela brilhante"); o 🔊 vira "botão de ouvir" */
const roboFalaTxt=t=>String(t||'').replace(/no 🔊/g,'no botão de ouvir').replace(/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\uFE0F\u200D]/gu,'').replace(/\s+([!?.,])/g,'$1').replace(/\s{2,}/g,' ').trim();
const roboFala=t=>speak(roboFalaTxt(t));
/* nome dela: vem das Configurações (S.config.childName, salvo só na planilha particular). Nunca escrever o nome no código.
   Nos textos, "@n" vira ", <primeiro nome>" (ou some, se não houver nome). */
const lumiNome=()=>String((S.config&&S.config.childName)||'').trim().split(/\s+/)[0]||'';
const comNome=t=>String(t).replace(/@n/g,lumiNome()?', '+lumiNome():'');
const roboNome=s=>String(s||'').replace(/^Memória · /,'').replace(/ · /g,': ');

/* ---------- habilidade → geradores (para o treino rápido) ---------- */
let roboMapa=null,roboMapaN=0;
function roboKeys(skill){const n=Object.keys(GEN).length;
  if(!roboMapa||n!==roboMapaN){roboMapa={};roboMapaN=n;
    for(const k of Object.keys(GEN)){try{const q=GEN[k]();if(q&&q.skill)(roboMapa[q.skill]=roboMapa[q.skill]||[]).push(k)}catch(e){}}}
  return roboMapa[skill]||[]}

/* ---------- leitura do desempenho ---------- */
function roboRespostas(dias){const lim=Date.now()-dias*864e5,out=[];
  const ss=[...(S.sessions||[])];if(S.session)ss.push(S.session);
  const vistos=new Set();
  ss.forEach(s=>{if(!s||vistos.has(s.id))return;vistos.add(s.id);(s.answers||[]).forEach(a=>{if(a.ts>=lim&&(a.attempt||1)===1&&a.skill)out.push(a)})});
  return out.sort((a,b)=>a.ts-b.ts)}
const modaTipo=l=>{const c={};l.forEach(a=>{const t=a.type||'outro erro';c[t]=(c[t]||0)+(t==='outro erro'?.5:1)});return Object.entries(c).sort((a,b)=>b[1]-a[1]).map(x=>x[0])[0]};
function roboAnalise(){
  const resp=roboRespostas(30),hoje=today(),porSk={};
  resp.forEach(a=>(porSk[a.skill]=porSk[a.skill]||[]).push(a));
  const lim14=Date.now()-14*864e5,lim3=Date.now()-3*864e5,dHoje=a=>new Date(a.ts).toDateString()===new Date().toDateString();
  let fraca=null,forte=null,melhorou=null;
  const com=LS.get('roboComemorou',{});
  for(const [sk,l] of Object.entries(porSk)){
    const rec=l.filter(a=>a.ts>=lim14);if(!rec.length)continue;
    const u8=rec.slice(-8),e8=u8.filter(a=>!a.ok).length,ac8=1-e8/u8.length,u6=rec.slice(-6),ac6=u6.filter(a=>a.ok).length/u6.length;
    const hojeSk=rec.some(dHoje);
    if(rec.length>=4&&e8>=2&&ac8<.75){const sc=e8+(hojeSk?2:0)+(rec[rec.length-1].ts>=lim3?1:0);if(!fraca||sc>fraca.sc)fraca={sk,sc,tipo:modaTipo(u8.filter(a=>!a.ok)),e8,n8:u8.length}}
    if(u6.length>=5&&ac6>=.83){const sc=(hojeSk?100:0)+rec[rec.length-1].ts/1e12;if(!forte||sc>forte.sc)forte={sk,sc}}
    /* melhorou: antes estava difícil, agora acerta quase tudo */
    const ant=l.slice(0,-6).slice(-8);
    if(u6.length>=6&&u6.filter(a=>a.ok).length>=5&&ant.length>=4&&ant.filter(a=>!a.ok).length>=3&&ant.filter(a=>a.ok).length/ant.length<.6&&(!com[sk]||com[sk]===hoje))
      melhorou={sk,k:u6.filter(a=>a.ok).length};
  }
  if(forte&&fraca&&forte.sk===fraca.sk)forte=null;
  const nHoje=resp.filter(dHoje).length,okHoje=resp.filter(a=>dHoje(a)&&a.ok).length;
  return {fraca,forte,melhorou,nHoje,okHoje,total:resp.length}}

function roboMensagem(){const a=roboAnalise();
  if(!a.total)return {k:'oi',txt:comNome(`Oi@n! Eu sou a ${ROBO_NOME}, a robô da Trilha! 💖 Depois dos exercícios, eu conto o que você está fazendo bem e o que dá para treinar.`)};
  if(a.melhorou){const com=LS.get('roboComemorou',{});if(!com[a.melhorou.sk]){com[a.melhorou.sk]=today();LS.set('roboComemorou',com)}
    return {k:'mel|'+a.melhorou.sk,festa:true,txt:comNome(`Lembra@n que ${roboNome(a.melhorou.sk)} estava difícil? Agora você acertou ${a.melhorou.k} das últimas 6! Você treinou e melhorou! 🎉`)}}
  const elogio=a.forte?comNome(`Você está mandando muito bem em ${roboNome(a.forte.sk)}@n! 🌟`)
    :a.okHoje>=5?comNome(`Você já acertou ${a.okHoje} perguntas hoje. Que esforço@n! 💪`)
    :comNome('Que bom te ver aqui@n! Cada exercício deixa a sua cabeça mais forte. 💪');
  if(!a.fraca)return {k:'ok|'+(a.forte?a.forte.sk:''),txt:elogio+' Hoje não tenho nenhuma dica: continue assim!'};
  const f=a.fraca;
  return {k:'f|'+f.sk+'|'+f.tipo,txt:`${elogio} Agora vamos melhorar ${roboNome(f.sk)}? ${roboDica(f.tipo,f.sk)}`,treino:roboKeys(f.sk).length?f.sk:null}}

/* ---------- visual ---------- */
const ROBO_CSS=`<style id="robo-css">
.robo{display:flex;gap:12px;align-items:flex-start;background:linear-gradient(135deg,#F3EEFF,#FFEAF3);border:3px solid #fff}
.robo .av{width:86px;flex:none;animation:roboBob 2.4s ease-in-out infinite;transform-origin:50% 90%}.robo .nome{display:block;font-size:15px;font-weight:800;color:#C2185B;margin-bottom:2px}
.robo .balao{flex:1;background:#fff;border-radius:18px;padding:12px 14px;position:relative;font-size:19px;font-weight:700;color:var(--ink);box-shadow:0 2px 0 rgba(29,40,70,.08)}
.robo .balao:before{content:'';position:absolute;left:-10px;top:18px;border:10px solid transparent;border-right-color:#fff;border-left:0}
.robo .acoes{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center}
.robo-dica{margin-top:10px;background:#FCEAF3;border-radius:14px;padding:8px 12px;font-size:18px;font-weight:700;color:#8E1650;text-align:left;display:flex;gap:10px;align-items:center}.robo-dica img{flex:none}
button.av.pula img{animation:lumiPula .6s ease}@keyframes lumiPula{0%{transform:translateY(0) scale(1)}30%{transform:translateY(-18px) scale(1.08) rotate(-6deg)}60%{transform:translateY(0) scale(.96)}100%{transform:translateY(0) scale(1)}}
@keyframes roboBob{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-5px) rotate(3deg)}}
@media (prefers-reduced-motion:reduce){.robo .av{animation:none}}
</style>`;
if(!document.getElementById('robo-css'))document.head.insertAdjacentHTML('beforeend',ROBO_CSS);
let ROBO_ATUAL=null;
function roboCardHTML(m,extra){
  return `<div class="card robo"><span class="av">${roboImg(86)}</span><div class="balao"><span class="nome">${ROBO_NOME} diz:</span>${esc(m.txt)}
    <div class="acoes"><button class="speak" data-act="robofala" aria-label="Ouvir a ${ROBO_NOME}">🔊</button>${m.treino?`<button class="btn small okb" data-act="robotreino" data-arg="${esc(m.treino)}">💪 Treinar agora</button>`:''}${extra||''}</div></div></div>`}

/* 1) balão na tela inicial, com interação: humor do dia, curiosidade do dia, toque na Lumi (reação ou adivinha) */
const LUMI_HUMOR={feliz:['😊','Feliz','Que bom@n! Então vamos com tudo hoje! 💖'],
  cansada:['😴','Cansada','Ficar cansada é normal. Beba um pouco de água e respire fundo três vezes. Vamos com calma! 💧'],
  meio:['😐','Mais ou menos','Tudo bem@n, tem dia que é assim. Que tal começar por uma coisa de que você gosta? 🌈'],
  triste:['😢','Triste','Sinto muito que você está triste@n. Que tal dar um abraço no papai ou na mamãe e contar o que aconteceu? Eu fico aqui torcendo por você. 💖']};
let LUMI={modo:null,adiv:null,ver:false,txt:''};
const lumiSaudacao=()=>{const h=new Date().getHours();return h<12?'Bom dia! ☀️':h<18?'Boa tarde! 🌤️':'Boa noite! 🌙'};
const lumiDia=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/864e5);
const lumiCurioDia=()=>(typeof LUMI_CURIOSIDADES!=='undefined'&&LUMI_CURIOSIDADES.length)?LUMI_CURIOSIDADES[(lumiDia()*7)%LUMI_CURIOSIDADES.length]:'';
/* dias seguidos estudando (sábado e domingo sem estudo não quebram a sequência) */
function lumiSequencia(){const dias=new Set((S.sessions||[]).filter(x=>x.phaseReached==='done').map(x=>x.date));
  const ds=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const d=new Date();if(!dias.has(ds(d)))d.setDate(d.getDate()-1);let n=0;
  for(let k=0;k<400;k++){const s=ds(d),fds=d.getDay()===0||d.getDay()===6;if(dias.has(s))n++;else if(!fds)break;d.setDate(d.getDate()-1)}
  return n}
function lumiConteudo(){const m=ROBO_ATUAL,b=(a,arg,t,cls)=>`<button class="btn small ${cls||'ghost'}" data-act="${a}" ${arg?`data-arg="${arg}"`:''}>${t}</button>`;
  const humor=LS.get('lumiHumor:'+today(),null);
  if(!humor&&LUMI.modo!=='reacao'&&LUMI.modo!=='adivinha')return {txt:lumiSaudacao().replace('!',comNome('@n!'))+' Como você está hoje?',
    bts:`<div class="row" style="gap:6px;flex-wrap:wrap">${Object.entries(LUMI_HUMOR).map(([k,[e,t]])=>b('lumihumor',k,`${e} ${t}`)).join('')}</div>`};
  if(LUMI.modo==='humor')return {txt:comNome(LUMI_HUMOR[humor][2]),bts:b('lumivolta','','Continuar ➜','okb')};
  if(LUMI.modo==='curio')return {txt:comNome('💡 Sabia@n? ')+lumiCurioDia(),bts:b('lumivolta','','⬅ Voltar')};
  if(LUMI.modo==='reacao')return {txt:comNome(LUMI.txt),bts:b('lumivolta','','⬅ Voltar')};
  if(LUMI.modo==='adivinha'){const [p,r]=LUMI.adiv;return {txt:LUMI.ver?`${p} ${r} ${comNome('Acertou@n? 🎉')}`:p,bts:LUMI.ver?b('lumivolta','','⬅ Voltar'):b('lumiresp','','🤔 Ver a resposta','okb')}}
  return {txt:m.txt,bts:(m.treino?b('robotreino',esc(m.treino),'💪 Treinar agora','okb'):'')+(lumiCurioDia()?b('lumicurio','','💡 Curiosidade do dia'):'')}}
function lumiHomeHTML(){const c=lumiConteudo(),seq=lumiSequencia();LUMI.falaAtual=c.txt;
  return `<div class="card robo"><button class="av" data-act="lumitoque" aria-label="Tocar na ${ROBO_NOME}" style="background:none;border:0;padding:0;cursor:pointer">${roboImg(86)}</button>
    <div class="balao"><span class="nome">${ROBO_NOME} diz:${seq>=2?` <span class="pill" style="font-size:13px;margin-left:6px">🔥 ${seq} dias seguidos estudando!</span>`:''}</span><span id="lumi-txt">${esc(c.txt)}</span>
    <div class="acoes"><button class="speak" data-act="robofala" aria-label="Ouvir a ${ROBO_NOME}">🔊</button>${c.bts}</div></div></div>`}
function lumiRedraw(falar){const d=document.getElementById('robo-home');if(!d)return;d.innerHTML=lumiHomeHTML();
  if(falar){roboFala(LUMI.falaAtual);const av=d.querySelector('.av');if(av){av.classList.remove('pula');void av.offsetWidth;av.classList.add('pula')}}}
const _renderMapRobo=renderMap;
renderMap=function(){_renderMapRobo.apply(this,arguments);if(S.view!=='map')return;
  let m;try{m=roboMensagem()}catch(e){console.warn('robô',e);return}
  ROBO_ATUAL=m;if(LUMI.modo!=='humor')LUMI.modo=null;
  const d=document.createElement('div');d.id='robo-home';d.style.marginBottom='14px';d.innerHTML=lumiHomeHTML();
  const top=app.querySelector('.top');if(top)top.insertAdjacentElement('afterend',d);else app.prepend(d);
  /* fala sozinha só quando a mensagem é nova (a pergunta do humor, uma vez por dia; os conselhos, quando mudam) */
  const k=LS.get('lumiHumor:'+today(),null)?m.k:'humor|'+today();
  if(S.config.autoRead!==false&&LS.get('roboFalou','')!==k){LS.set('roboFalou',k);setTimeout(()=>{if(S.view==='map'&&document.getElementById('robo-home')){roboFala(LUMI.falaAtual);if(m.festa&&typeof confetti==='function')confetti()}},2600)}};

/* 2) comentário no fim da lição */
function roboFimLicao(s){const l=(s.answers||[]).filter(a=>(a.attempt||1)===1);if(!l.length)return null;
  const ok=l.filter(a=>a.ok).length,porSk={};l.filter(a=>!a.ok).forEach(a=>(porSk[a.skill]=porSk[a.skill]||[]).push(a));
  const pior=Object.entries(porSk).sort((a,b)=>b[1].length-a[1].length)[0];
  const elogio=ok===l.length?comNome(`Uau@n! Você acertou todas as ${ok} de primeira! 🌟`):comNome(`Muito bem@n! Você acertou ${ok} de ${l.length} de primeira. 👏`);
  if(!pior||pior[1].length<2)return {txt:elogio};
  const [sk,erros]=pior;
  return {txt:`${elogio} O que deu mais trabalho foi ${roboNome(sk)}. ${roboDica(modaTipo(erros),sk)}`,treino:roboKeys(sk).length?sk:null}}
const _finishLessonRobo=finishLesson;
finishLesson=function(){
  if(R&&R.lesson&&R.lesson.treino)R.quizOk=R.results.filter(Boolean).length;   // no treino vale o acerto de primeira
  const s=S.session;_finishLessonRobo.apply(this,arguments);
  if(R&&R.lesson&&R.lesson.treino){const qt=document.querySelector('.qcard.result .qtext'),cp=document.querySelector('.qcard.result .cap');if(qt)qt.textContent='Treino feito! 💪';if(cp)cp.remove()}
  let m=null;try{m=s&&roboFimLicao(s)}catch(e){console.warn('robô',e)}
  const box=document.querySelector('.qcard.result');if(!m||!box)return;
  const d=document.createElement('div');d.style.cssText='width:100%;max-width:640px;text-align:left';d.innerHTML=roboCardHTML(m);box.appendChild(d);ROBO_ATUAL=m;
  setTimeout(()=>{if(document.body.contains(box))roboFala(m.txt)},2600)};

/* 3) dica durante a lição: 2 erros do mesmo tipo */
const _handleAnswerRobo=handleAnswer;
handleAnswer=function(ok,given,type,optEl){
  const primeira=R.phase==='practice'&&R.tries===0,q=R.q;
  _handleAnswerRobo.apply(this,arguments);
  if(ok||!S.session)return;
  const ult=S.session.answers[S.session.answers.length-1];if(!ult)return;
  const tipo=ult.type||'outro erro',chave=ult.skill+'|'+tipo;R.roboDicas=R.roboDicas||new Set();
  const iguais=S.session.answers.filter(a=>!a.ok&&a.skill===ult.skill&&(a.type||'outro erro')===tipo).length;
  if(iguais<2||R.roboDicas.has(chave))return;
  R.roboDicas.add(chave);const dica=roboDica(tipo,ult.skill),fb=document.getElementById('fb');if(!fb)return;
  const div=document.createElement('div');div.className='robo-dica';div.innerHTML=`${roboImg(44)}<span><b>Dica da ${ROBO_NOME}:</b> ${esc(dica)}</span>`;
  const row=fb.querySelector('.row');row?fb.insertBefore(div,row):fb.appendChild(div);
  speak((primeira?'Quase! '+q.hint:(q.explainFala||q.explain))+' Dica da '+ROBO_NOME+': '+roboFalaTxt(dica))};

/* 4) treino rápido de uma habilidade */
function roboTreino(skill){const keys=roboKeys(skill);if(!keys.length){toast('Ainda não tenho treino para isso.');return}
  const nome=roboNome(skill);let dica='Leia com calma e, se precisar, toque no 🔊 para ouvir de novo.';
  try{const err=roboRespostas(14).filter(a=>a.skill===skill&&!a.ok).slice(-8);if(err.length)dica=roboDica(modaTipo(err),skill)}catch(e){}
  const l={id:'treino-'+skill.toLowerCase().replace(/[^a-z0-9]+/g,'-'),treino:true,skillTreino:skill,titulo:'Treino: '+nome,icone:'💖',subject:'Revisão',
    slides:[{v:roboImg(170,'margin:0 auto'),t:comNome(`Vamos treinar ${nome}@n! ${dica}`),fala:roboFalaTxt(comNome(`Vamos treinar ${nome}@n! ${dica}`))}],practice:esticar(keys,6),quiz:[]};
  startLessonObj(l,-1,'Revisão')}
Object.assign(ACT,{
  robofala(){if(S.view==='map'&&document.getElementById('robo-home')&&LUMI.falaAtual)roboFala(LUMI.falaAtual);else if(ROBO_ATUAL)roboFala(ROBO_ATUAL.txt)},
  lumihumor(k){if(!LUMI_HUMOR[k])return;LS.set('lumiHumor:'+today(),k);LUMI.modo='humor';lumiRedraw(true)},
  lumivolta(){const f=LUMI.modo==='humor';LUMI.modo=null;LUMI.ver=false;lumiRedraw(f)},
  lumicurio(){LUMI.modo='curio';lumiRedraw(true)},
  lumiresp(){LUMI.ver=true;lumiRedraw(true);if(typeof confetti==='function')confetti()},
  lumitoque(){if(!LS.get('lumiHumor:'+today(),null)&&!LUMI.modo){lumiRedraw(true);return}
    if(Math.random()<.4&&typeof LUMI_ADIVINHAS!=='undefined'){const a=LUMI_ADIVINHAS;let x;do{x=a[Math.floor(Math.random()*a.length)]}while(a.length>1&&LUMI.adiv===x);LUMI.adiv=x;LUMI.ver=false;LUMI.modo='adivinha'}
    else{const r=typeof LUMI_REACOES!=='undefined'?LUMI_REACOES:['Oi! 💖'];let t;do{t=r[Math.floor(Math.random()*r.length)]}while(r.length>1&&t===LUMI.txt);LUMI.txt=t;LUMI.modo='reacao'}
    lumiRedraw(true)},
  robotreino(sk){if(R&&S.session)leaveLesson();R=null;roboTreino(sk)},
});
if(S.view==='map'&&!R)renderMap();
