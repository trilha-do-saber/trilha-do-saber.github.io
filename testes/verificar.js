/* Verificação automática do conteúdo. Rode: node testes/verificar.js
   Falha (código 1) se alguma questão tiver resposta errada, opções repetidas ou lição quebrada. */
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','conteudo.js'),'utf8');
const ctx={};new Function('ctx',src+';ctx.GEN=GEN;ctx.LESSONS=LESSONS;ctx.SUBJECTS=SUBJECTS;ctx.NIVEL=NIVEL;')(ctx);
const {GEN,LESSONS,SUBJECTS}=ctx;
const HAB_NIVEL=eval((fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8').match(/const HAB_NIVEL=(\[[^\]]*\])/)||[])[1]||'[]');const erros=[];
/* Memória: testa o construtor com frases de exemplo inventadas (as reais ficam só na planilha da família) */
const EXEMPLO=[{ciclo:'1',semana:1,materia:'História',texto:'Pedro Álvares Cabral chegou ao Brasil em 1500.'},{ciclo:'1',semana:1,materia:'Ciências',texto:'As plantas precisam de luz, água e ar.'},
  {ciclo:'1',semana:2,materia:'Geografia',texto:'O Brasil fica na América do Sul.'},{ciclo:'1',semana:2,materia:'Matemática',texto:'Dois vezes três é igual a seis.'},{ciclo:'1',semana:3,materia:'Linha do tempo',texto:'Descobrimento, Independência, República.'}];
const memLessons=new Function('ctx','rows',src+';return buildMemoria(rows).map(l=>({l,gens:[...new Set([...l.practice,...l.quiz])].map(k=>[k,GEN[k]])}))')(ctx,EXEMPLO);
if(memLessons.length!==4)erros.push('memória: esperava 4 lições, veio '+memLessons.length);
for(const {l,gens} of memLessons)for(const [k,g] of gens){if(!g){erros.push('memória: gerador faltando '+k);continue}
  for(let i=0;i<300;i++){const q=g();if(!q){erros.push('memória: questão nula em '+k);break}
    if(q.kind==='syll'){if(q.parts.join('')!==q.word){erros.push('memória: ordem inconsistente');break}continue}
    if(q.options.filter(o=>o.ok).length!==1||new Set(q.options.map(o=>o.label)).size!==q.options.length){erros.push(`memória: opções ruins em ${k} ${JSON.stringify(q.options.map(o=>o.label))}`);break}}}
if(buildMemoriaVazio())erros.push('memória: planilha vazia deveria gerar 0 lições');
function buildMemoriaVazio(){return new Function(src+';return buildMemoria([]).length')()}
const ids=new Set();
for(const l of LESSONS){
  if(ids.has(l.id))erros.push('id repetido: '+l.id);ids.add(l.id);
  if(!l.subject)erros.push('lição sem matéria: '+l.id);
  if(!l.slides||!l.slides.length)erros.push('lição sem explicação: '+l.id);
  for(const k of [...l.practice,...l.quiz])if(!GEN[k])erros.push(`gerador inexistente "${k}" em ${l.id}`);
}
for(const [k,g] of Object.entries(GEN)){
  for(let i=0;i<500;i++){
    let q;try{q=g()}catch(e){erros.push(`${k}: erro ${e.message}`);break}
    if(!q.text||!q.skill||!q.explain){erros.push(`${k}: faltam campos`);break}
    if(q.kind==='build'){if(q.t*10+q.u!==q.target){erros.push(`${k}: montar inconsistente`);break}continue}
    if(q.kind==='syll'){if(q.parts.join('')!==q.word){erros.push(`${k}: sílabas inconsistentes`);break}continue}
    if(q.num&&(typeof q.answer!=='number'||q.answer!==q.options.find(o=>o.ok).v)){erros.push(`${k}: resposta digitada inconsistente`);break}
    const ok=q.options.filter(o=>o.ok);
    if(ok.length!==1){erros.push(`${k}: ${ok.length} respostas certas em "${q.text}"`);break}
    if(new Set(q.options.map(o=>String(o.label))).size!==q.options.length){erros.push(`${k}: opções repetidas em "${q.text}" ${JSON.stringify(q.options.map(o=>o.label))}`);break}
    if(q.options.length<2){erros.push(`${k}: menos de 2 opções`);break}
  }
}
const versaoSw=(fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8').match(/VERSAO = '([^']+)'/)||[])[1],
  versaoApp=(fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8').match(/APP_VERSAO='([^']+)'/)||[])[1],
  versaoJson=JSON.parse(fs.readFileSync(path.join(__dirname,'..','versao.json'),'utf8')).versao;
if(!(versaoSw&&versaoSw===versaoApp&&versaoApp===versaoJson))erros.push(`versões diferentes: sw.js=${versaoSw} app.js=${versaoApp} versao.json=${versaoJson} (devem ser iguais)`);
/* variedade: cada gerador precisa render (no tamanho médio de lição) pelo menos tantas perguntas diferentes quanto é usado na lição (níveis 1 e 3) */
for(const nivel of [1,3]){
  for(const h of HAB_NIVEL)ctx.NIVEL[h]=nivel;
  /* tamanho médio das lições: 9 para praticar + 7 no desafio + 2 exemplos resolvidos (ver TAMANHOS em app.js) */
  const estica=(ks,n)=>{ks=ks.filter(k=>GEN[k]);const o=[];for(let i=0;ks.length&&i<Math.max(n,ks.length);i++)o.push(ks[i%ks.length]);return o};
  for(const l of LESSONS){const uso={};[...estica(l.practice,9),...estica(l.quiz,7)].forEach(k=>uso[k]=(uso[k]||0)+1);[...new Set(l.practice)].slice(0,2).forEach(k=>uso[k]=(uso[k]||0)+1);
    for(const [k,n] of Object.entries(uso)){if(!GEN[k])continue;const ids=new Set();for(let i=0;i<800;i++){const q=GEN[k]();ids.add(q.skill+'|'+(q.desc||q.text))}
      if(ids.size<n)erros.push(`pouca variedade: ${k} gera ${ids.size} perguntas diferentes, mas ${l.id} usa ${n} (nível ${nivel})`)}}
}
const prontas=SUBJECTS.filter(s=>s.ready).map(s=>`${s.nome}: ${s.lessons.length}`).join(' · ');
if(erros.length){console.error('FALHOU\n'+[...new Set(erros)].join('\n'));process.exit(1)}
console.log(`OK · ${LESSONS.length} lições · ${Object.keys(GEN).length} geradores · ${prontas}`);
