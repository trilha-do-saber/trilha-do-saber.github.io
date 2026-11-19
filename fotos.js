/* Trilha do Saber · "Meu mural de fotos e figurinhas": o mural dela, separado dos estudos.
   Ela (no tablet) ou o papai (no telefone) tiram ou escolhem uma foto e escrevem sobre ela.
   Cada foto fica guardada no aparelho (IndexedDB) e é sincronizada com uma pasta PRIVADA do Google Drive do Pedro
   (ações muralSalvar / muralListar / muralFoto / muralApagar do Apps Script, aba Mural). Assim os dois aparelhos veem o mesmo mural.
   Nunca enviar essas fotos para o repositório, que é público. */
const FOTOS_DB='trilha-fotos';
function fotosDB(){return new Promise((ok,erro)=>{const r=indexedDB.open(FOTOS_DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('fotos',{keyPath:'id'});r.onsuccess=()=>ok(r.result);r.onerror=()=>erro(r.error)})}
async function fotosTx(modo,fn){const db=await fotosDB();return new Promise((ok,erro)=>{const tx=db.transaction('fotos',modo),st=tx.objectStore('fotos'),res=fn(st);tx.oncomplete=()=>ok(res&&res.result);tx.onerror=()=>erro(tx.error)})}
const fotosTodasBruto=async()=>(await fotosTx('readonly',st=>st.getAll()))||[];
const fotoSalvar=f=>fotosTx('readwrite',st=>st.put(f));
const fotoApagar=id=>fotosTx('readwrite',st=>st.delete(id));
let FOTOS_CACHE=[],FOTO_ATUAL=null,FOTO_APAGAR=null;
async function fotosCarregar(){try{FOTOS_CACHE=(await fotosTodasBruto()).filter(f=>!f.apagar).sort((a,b)=>b.ts-a.ts)}catch(e){FOTOS_CACHE=[]}return FOTOS_CACHE}
const muralAutor=()=>LS.get('muralAutor','ela');
const AUTORES={ela:'👧 Eu',papai:'👨 Papai'};
/* diminui a imagem (até 1024 px) para caber bem no aparelho e no Drive */
function fotoReduzir(file){return new Promise((ok,erro)=>{const rd=new FileReader();rd.onerror=erro;rd.onload=()=>{const im=new Image();im.onerror=erro;im.onload=()=>{
  const m=1024,k=Math.min(1,m/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);
  c.getContext('2d').drawImage(im,0,0,c.width,c.height);ok(c.toDataURL('image/jpeg',.82))};im.src=rd.result};rd.readAsDataURL(file)})}

/* ---------- sincronização com o Drive (pelo Apps Script) ---------- */
let muralSincronizando=false,muralUltimo=0;
async function muralEnviar(f){
  const base={id:f.id,ts:f.ts,autor:f.autor||'ela',texto:f.texto||'',editado:f.editado||f.ts};
  try{await api('muralSalvar',f.enviado?base:{...base,img:f.img})}
  catch(e){if(e&&e.code==='sem_imagem')await api('muralSalvar',{...base,img:f.img});else throw e}   // o servidor perdeu a foto: manda de novo
  await fotoSalvar({...f,sync:'ok',enviado:true})}
async function muralSync(forcar){
  if(!API.url||muralSincronizando||!navigator.onLine)return;
  if(!forcar&&Date.now()-muralUltimo<60000)return;
  muralSincronizando=true;muralUltimo=Date.now();let mudou=false;
  try{
    const locais=await fotosTodasBruto();
    for(const f of locais.filter(f=>f.apagar)){await api('muralApagar',{id:f.id});await fotoApagar(f.id);mudou=true}
    for(const f of locais.filter(f=>!f.apagar&&f.sync!=='ok')){await muralEnviar(f);mudou=true}
    const remotos=(await api('muralListar'))||[],ids=new Set(remotos.map(r=>String(r.id))),porId={};
    (await fotosTodasBruto()).forEach(f=>porId[f.id]=f);
    for(const r of remotos){const l=porId[r.id];
      if(!l){try{const fo=await api('muralFoto',{id:r.id});await fotoSalvar({id:String(r.id),ts:Number(r.ts),autor:r.autor||'ela',texto:r.texto||'',editado:Number(r.editado)||0,img:fo.img,sync:'ok',enviado:true});mudou=true}
        catch(e){if(!(e&&e.code==='foto_nao_encontrada'))throw e}}
      else if((Number(r.editado)||0)>(l.editado||0)&&l.sync==='ok'&&!l.apagar){await fotoSalvar({...l,texto:r.texto||'',autor:r.autor||l.autor,editado:Number(r.editado)});mudou=true}}
    for(const l of Object.values(porId))if(l.enviado&&l.sync==='ok'&&!l.apagar&&!ids.has(l.id)){await fotoApagar(l.id);mudou=true}   // apagada no outro aparelho
    LS.set('muralServidor','ok');
  }catch(e){if(e&&e.code==='acao_desconhecida'){if(LS.get('muralServidor','')!=='antigo')mudou=true;LS.set('muralServidor','antigo')}}
  finally{muralSincronizando=false}
  if(mudou){await fotosCarregar();
    if(S.view==='fotos'&&!FOTO_ATUAL)renderFotos(true);
    else{const c=document.getElementById('fotos-card');if(c&&S.view==='map')c.innerHTML=fotosCardHTML()}}
}

function fotosCardHTML(){const n=FOTOS_CACHE.length;
  return `<div style="margin-top:22px"><button class="mini" data-act="fotos" style="width:100%;text-align:left;background:linear-gradient(135deg,#E8F4FF,#FDE7F3)">
    <span class="ic">📸</span><span style="flex:1"><b>Meu mural de fotos e figurinhas</b><small>${n?`${n} foto${n>1?'s':''} no meu mural`:'Tire uma foto e escreva sobre ela!'}</small>
    ${n?`<span style="display:flex;gap:6px;margin-top:6px">${FOTOS_CACHE.slice(0,4).map(f=>`<img src="${f.img}" alt="" style="width:52px;height:52px;object-fit:cover;border-radius:10px;border:2px solid #fff">`).join('')}</span>`:''}</span></button></div>`}
const _renderMapOriginal=renderMap;
renderMap=function(){_renderMapOriginal.apply(this,arguments);if(S.view!=='map')return;const d=document.createElement('div');d.id='fotos-card';d.innerHTML=fotosCardHTML();app.appendChild(d);
  fotosCarregar().then(()=>{const c=document.getElementById('fotos-card');if(c&&S.view==='map')c.innerHTML=fotosCardHTML();muralSync()})};

async function renderFotos(semSync){S.view='fotos';FOTO_ATUAL=null;FOTO_APAGAR=null;await fotosCarregar();
  const dt=ts=>new Date(ts).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'});
  const antigo=LS.get('muralServidor','')==='antigo',nuvem=API.url&&!antigo;
  app.innerHTML=`<div class="top"><button class="btn ghost small" data-act="home">⬅ Início</button><h1 class="hello" style="font-size:26px">📸 Meu mural de fotos e figurinhas</h1><div class="spacer"></div></div>
  <div class="card col" style="gap:10px;align-items:center;text-align:center;margin-top:10px">
    <div class="row" style="gap:10px;justify-content:center;flex-wrap:wrap">
      <label class="btn okb" style="cursor:pointer">📷 Tirar foto<input type="file" accept="image/*" capture="environment" data-foto-input style="display:none"></label>
      <label class="btn" style="cursor:pointer">🖼️ Escolher imagem<input type="file" accept="image/*" data-foto-input style="display:none"></label></div>
    <small class="muted">${nuvem?'☁️ O mural aparece no tablet e no telefone do papai.':antigo&&API.url?'As fotos estão só neste aparelho. Para aparecer nos dois, o papai precisa atualizar o servidor.':'As fotos ficam guardadas só neste aparelho.'}</small></div>
  ${FOTOS_CACHE.length?`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-top:14px">${FOTOS_CACHE.map(f=>`
    <button data-act="fotoabrir" data-arg="${f.id}" style="background:#fff;border:3px solid #fff;border-radius:16px;padding:6px;box-shadow:0 4px 0 rgba(29,40,70,.12);transform:rotate(${(f.ts%5)-2}deg);text-align:left;display:flex;flex-direction:column;gap:4px;position:relative">
      ${f.autor==='papai'?'<span class="pill" style="position:absolute;top:10px;left:10px;font-size:12px;background:#fff">👨 Papai</span>':''}
      <img src="${f.img}" alt="" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:10px">
      <small style="font-weight:700;color:var(--ink);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${f.texto?esc(f.texto):'<span class="muted">Sem descrição</span>'}</small>
      <small class="muted">${dt(f.ts)}${nuvem&&f.sync!=='ok'?' · ⏳':''}</small></button>`).join('')}</div>`
   :`<div class="note" style="margin-top:14px;text-align:center;font-size:18px">Seu mural está vazio. Tire a primeira foto! 📷</div>`}`;
  if(!semSync){window.scrollTo(0,0);muralSync(true)}}

function fotoDetalheHTML(f,nova){const au=f.autor||muralAutor();
  return `<div class="top"><button class="btn ghost small" data-act="fotos">⬅ Mural</button><h1 class="hello" style="font-size:24px">${nova?'✨ Foto nova':'📸 Minha foto'}</h1><div class="spacer"></div></div>
  <div class="card col" style="gap:12px;align-items:center;margin-top:10px">
    <img src="${f.img}" alt="" style="max-width:100%;max-height:60vh;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,.15)">
    <div class="row" style="gap:8px;align-items:center;flex-wrap:wrap;justify-content:center"><span class="muted">Quem postou:</span>${Object.entries(AUTORES).map(([k,t])=>`<button class="btn small ${au===k?'':'ghost'}" data-act="fotoautor" data-arg="${k}">${t}</button>`).join('')}</div>
    <label for="foto-txt" style="align-self:stretch;font-weight:800">${nova?'Escreva sobre a foto:':'O que tem nesta foto?'}
      <textarea id="foto-txt" rows="3" maxlength="400" placeholder="O que é? Onde foi? Por que você gostou?" style="width:100%;border-radius:12px;border:2px solid #D5DDEE;padding:10px;font:inherit;font-size:20px;margin-top:6px">${esc(f.texto||'')}</textarea></label>
    <div class="row" style="gap:10px;flex-wrap:wrap;justify-content:center">
      <button class="btn okb" data-act="fotosalvar">💾 Salvar</button>
      <button class="speak" data-act="fotoler" aria-label="Ouvir o que está escrito">🔊</button>
      ${nova?'':`<button class="btn ghost small" data-act="fotoapagar">${FOTO_APAGAR===f.id?'Toque de novo para apagar':'🗑️ Apagar'}</button>`}</div>
  </div>`}
document.addEventListener('change',async e=>{const inp=e.target.closest&&e.target.closest('[data-foto-input]');if(!inp||!inp.files||!inp.files[0])return;
  try{toast('Preparando a foto…');const img=await fotoReduzir(inp.files[0]);
    FOTO_ATUAL={id:'f'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),ts:Date.now(),img,texto:'',autor:muralAutor(),nova:true};
    try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(_){}
    app.innerHTML=fotoDetalheHTML(FOTO_ATUAL,true);window.scrollTo(0,0);setTimeout(()=>speak('Que foto legal! Agora escreva sobre ela.'),300)}
  catch(err){toast('Não consegui abrir essa imagem. Tente outra.')}});
Object.assign(ACT,{
  fotos(){renderFotos()},
  fotoabrir(id){const f=FOTOS_CACHE.find(x=>x.id===id);if(!f)return;FOTO_ATUAL={...f};FOTO_APAGAR=null;app.innerHTML=fotoDetalheHTML(FOTO_ATUAL,false);window.scrollTo(0,0)},
  fotoautor(k){if(!FOTO_ATUAL||!AUTORES[k])return;const t=document.getElementById('foto-txt');if(t)FOTO_ATUAL.texto=t.value;FOTO_ATUAL.autor=k;LS.set('muralAutor',k);app.innerHTML=fotoDetalheHTML(FOTO_ATUAL,!!FOTO_ATUAL.nova)},
  async fotosalvar(){if(!FOTO_ATUAL)return;const t=document.getElementById('foto-txt'),{nova,...base}=FOTO_ATUAL;
    const f={...base,texto:(t&&t.value||'').trim(),autor:FOTO_ATUAL.autor||muralAutor(),editado:Date.now(),sync:'pendente'};
    try{await fotoSalvar(f);toast('Foto guardada no mural! 📸');if(nova&&typeof confetti==='function')confetti();await renderFotos(true);window.scrollTo(0,0);muralSync(true)}
    catch(e){toast('Não deu para guardar: o aparelho pode estar sem espaço.')}},
  fotoler(){const t=document.getElementById('foto-txt');speak(t&&t.value.trim()?t.value:'Ainda não tem nada escrito.')},
  async fotoapagar(){if(!FOTO_ATUAL)return;if(FOTO_APAGAR!==FOTO_ATUAL.id){FOTO_APAGAR=FOTO_ATUAL.id;app.innerHTML=fotoDetalheHTML(FOTO_ATUAL,false);return}
    const f=FOTOS_CACHE.find(x=>x.id===FOTO_ATUAL.id)||FOTO_ATUAL;
    if(f.enviado)await fotoSalvar({...f,apagar:true});else await fotoApagar(f.id);   // se já está no Drive, apaga lá na sincronização
    toast('Foto apagada.');await renderFotos(true);muralSync(true)},
});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&(S.view==='map'||S.view==='fotos'))muralSync()});
if(S.view==='map'&&!R)renderMap();
