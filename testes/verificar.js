/* Verificação automática do conteúdo. Rode: node testes/verificar.js
   Falha (código 1) se alguma questão tiver resposta errada, opções repetidas ou lição quebrada. */
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','conteudo.js'),'utf8');
const ctx={};new Function('ctx',src+';ctx.GEN=GEN;ctx.LESSONS=LESSONS;ctx.SUBJECTS=SUBJECTS;')(ctx);
const {GEN,LESSONS,SUBJECTS}=ctx;const erros=[];
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
    const ok=q.options.filter(o=>o.ok);
    if(ok.length!==1){erros.push(`${k}: ${ok.length} respostas certas em "${q.text}"`);break}
    if(new Set(q.options.map(o=>String(o.label))).size!==q.options.length){erros.push(`${k}: opções repetidas em "${q.text}" ${JSON.stringify(q.options.map(o=>o.label))}`);break}
    if(q.options.length<2){erros.push(`${k}: menos de 2 opções`);break}
  }
}
const prontas=SUBJECTS.filter(s=>s.ready).map(s=>`${s.nome}: ${s.lessons.length}`).join(' · ');
if(erros.length){console.error('FALHOU\n'+[...new Set(erros)].join('\n'));process.exit(1)}
console.log(`OK · ${LESSONS.length} lições · ${Object.keys(GEN).length} geradores · ${prontas}`);
