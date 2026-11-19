/* Trilha do Saber · "Minhas fotos e figurinhas": um álbum dela, separado dos estudos.
   Ela tira uma foto ou escolhe uma imagem e escreve sobre ela.
   As fotos ficam SÓ neste aparelho (IndexedDB), não vão para a planilha nem para o repositório, que é público. */
const FOTOS_DB='trilha-fotos';
function fotosDB(){return new Promise((ok,erro)=>{const r=indexedDB.open(FOTOS_DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('fotos',{keyPath:'id'});r.onsuccess=()=>ok(r.result);r.onerror=()=>erro(r.error)})}
async function fotosTx(modo,fn){const db=await fotosDB();return new Promise((ok,erro)=>{const tx=db.transaction('fotos',modo),st=tx.objectStore('fotos'),res=fn(st);tx.oncomplete=()=>ok(res&&res.result);tx.onerror=()=>erro(tx.error)})}
const fotosTodas=async()=>((await fotosTx('readonly',st=>st.getAll()))||[]).sort((a,b)=>b.ts-a.ts);
const fotoSalvar=f=>fotosTx('readwrite',st=>st.put(f));
const fotoApagar=id=>fotosTx('readwrite',st=>st.delete(id));
let FOTOS_CACHE=[],FOTO_ATUAL=null,FOTO_APAGAR=null;
async function fotosCarregar(){try{FOTOS_CACHE=await fotosTodas()}catch(e){FOTOS_CACHE=[]}return FOTOS_CACHE}
/* diminui a imagem (até 1024 px) para caber bem no aparelho */
function fotoReduzir(file){return new Promise((ok,erro)=>{const rd=new FileReader();rd.onerror=erro;rd.onload=()=>{const im=new Image();im.onerror=erro;im.onload=()=>{
  const m=1024,k=Math.min(1,m/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);
  c.getContext('2d').drawImage(im,0,0,c.width,c.height);ok(c.toDataURL('image/jpeg',.82))};im.src=rd.result};rd.readAsDataURL(file)})}

function fotosCardHTML(){const n=FOTOS_CACHE.length;
  return `<div style="margin-top:22px"><button class="mini" data-act="fotos" style="width:100%;text-align:left;background:linear-gradient(135deg,#E8F4FF,#FDE7F3)">
    <span class="ic">📸</span><span style="flex:1"><b>Minhas fotos e figurinhas</b><small>${n?`${n} foto${n>1?'s':''} no meu álbum`:'Tire uma foto e escreva sobre ela!'}</small>
    ${n?`<span style="display:flex;gap:6px;margin-top:6px">${FOTOS_CACHE.slice(0,4).map(f=>`<img src="${f.img}" alt="" style="width:52px;height:52px;object-fit:cover;border-radius:10px;border:2px solid #fff">`).join('')}</span>`:''}</span></button></div>`}
const _renderMapOriginal=renderMap;
renderMap=function(){_renderMapOriginal.apply(this,arguments);if(S.view!=='map')return;const d=document.createElement('div');d.id='fotos-card';d.innerHTML=fotosCardHTML();app.appendChild(d);
  fotosCarregar().then(()=>{const c=document.getElementById('fotos-card');if(c&&S.view==='map')c.innerHTML=fotosCardHTML()})};

async function renderFotos(){S.view='fotos';FOTO_ATUAL=null;FOTO_APAGAR=null;await fotosCarregar();
  const dt=ts=>new Date(ts).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'});
  app.innerHTML=`<div class="top"><button class="btn ghost small" data-act="home">⬅ Início</button><h1 class="hello" style="font-size:26px">📸 Minhas fotos e figurinhas</h1><div class="spacer"></div></div>
  <div class="card col" style="gap:10px;align-items:center;text-align:center;margin-top:10px">
    <div class="row" style="gap:10px;justify-content:center;flex-wrap:wrap">
      <label class="btn okb" style="cursor:pointer">📷 Tirar foto<input type="file" accept="image/*" capture="environment" data-foto-input style="display:none"></label>
      <label class="btn" style="cursor:pointer">🖼️ Escolher imagem<input type="file" accept="image/*" data-foto-input style="display:none"></label></div>
    <small class="muted">As fotos ficam guardadas só neste aparelho.</small></div>
  ${FOTOS_CACHE.length?`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-top:14px">${FOTOS_CACHE.map(f=>`
    <button data-act="fotoabrir" data-arg="${f.id}" style="background:#fff;border:3px solid #fff;border-radius:16px;padding:6px;box-shadow:0 4px 0 rgba(29,40,70,.12);transform:rotate(${(f.ts%5)-2}deg);text-align:left;display:flex;flex-direction:column;gap:4px">
      <img src="${f.img}" alt="" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:10px">
      <small style="font-weight:700;color:var(--ink);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${f.texto?esc(f.texto):'<span class="muted">Sem descrição</span>'}</small>
      <small class="muted">${dt(f.ts)}</small></button>`).join('')}</div>`
   :`<div class="note" style="margin-top:14px;text-align:center;font-size:18px">Seu álbum está vazio. Tire a primeira foto! 📷</div>`}`;window.scrollTo(0,0)}

function fotoDetalheHTML(f,nova){
  return `<div class="top"><button class="btn ghost small" data-act="fotos">⬅ Álbum</button><h1 class="hello" style="font-size:24px">${nova?'✨ Foto nova':'📸 Minha foto'}</h1><div class="spacer"></div></div>
  <div class="card col" style="gap:12px;align-items:center;margin-top:10px">
    <img src="${f.img}" alt="" style="max-width:100%;max-height:60vh;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,.15)">
    <label for="foto-txt" style="align-self:stretch;font-weight:800">${nova?'Escreva sobre a sua foto:':'O que tem nesta foto?'}
      <textarea id="foto-txt" rows="3" maxlength="400" placeholder="O que é? Onde foi? Por que você gostou?" style="width:100%;border-radius:12px;border:2px solid #D5DDEE;padding:10px;font:inherit;font-size:20px;margin-top:6px">${esc(f.texto||'')}</textarea></label>
    <div class="row" style="gap:10px;flex-wrap:wrap;justify-content:center">
      <button class="btn okb" data-act="fotosalvar">💾 Salvar</button>
      <button class="speak" data-act="fotoler" aria-label="Ouvir o que eu escrevi">🔊</button>
      ${nova?'':`<button class="btn ghost small" data-act="fotoapagar">${FOTO_APAGAR===f.id?'Toque de novo para apagar':'🗑️ Apagar'}</button>`}</div>
  </div>`}
document.addEventListener('change',async e=>{const inp=e.target.closest&&e.target.closest('[data-foto-input]');if(!inp||!inp.files||!inp.files[0])return;
  try{toast('Preparando a foto…');const img=await fotoReduzir(inp.files[0]);FOTO_ATUAL={id:'f'+Date.now().toString(36),ts:Date.now(),img,texto:'',nova:true};
    try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(_){}
    app.innerHTML=fotoDetalheHTML(FOTO_ATUAL,true);window.scrollTo(0,0);setTimeout(()=>speak('Que foto legal! Agora escreva sobre ela.'),300)}
  catch(err){toast('Não consegui abrir essa imagem. Tente outra.')}});
Object.assign(ACT,{
  fotos(){renderFotos()},
  fotoabrir(id){const f=FOTOS_CACHE.find(x=>x.id===id);if(!f)return;FOTO_ATUAL={...f};FOTO_APAGAR=null;app.innerHTML=fotoDetalheHTML(FOTO_ATUAL,false);window.scrollTo(0,0)},
  async fotosalvar(){if(!FOTO_ATUAL)return;const t=document.getElementById('foto-txt');const f={id:FOTO_ATUAL.id,ts:FOTO_ATUAL.ts,img:FOTO_ATUAL.img,texto:(t&&t.value||'').trim()};
    try{await fotoSalvar(f);toast('Foto guardada no álbum! 📸');if(FOTO_ATUAL.nova&&typeof confetti==='function')confetti();renderFotos()}catch(e){toast('Não deu para guardar: o aparelho pode estar sem espaço.')}},
  fotoler(){const t=document.getElementById('foto-txt');speak(t&&t.value.trim()?t.value:'Você ainda não escreveu nada.')},
  async fotoapagar(){if(!FOTO_ATUAL)return;if(FOTO_APAGAR!==FOTO_ATUAL.id){FOTO_APAGAR=FOTO_ATUAL.id;app.innerHTML=fotoDetalheHTML(FOTO_ATUAL,false);return}
    await fotoApagar(FOTO_ATUAL.id);toast('Foto apagada.');renderFotos()},
});
if(S.view==='map'&&!R)renderMap();
