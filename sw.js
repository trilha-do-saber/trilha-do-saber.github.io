/* Trilha do Saber · funciona sem internet.
   Ao publicar uma versão nova, troque o número abaixo para o tablet baixar tudo de novo. */
const VERSAO = 'trilha-v49';
const ARQUIVOS = ['./', 'index.html', 'conteudo.js', 'app.js', 'jogos.js', 'fotos.js', 'robo.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'img/fundo.webp', 'img/robo.webp', 'versao.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('message', e => { if (e.data === 'pular') self.skipWaiting(); });

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* Arquivos do app: tenta a internet primeiro (pega atualizações) e usa a cópia guardada se estiver offline.
   Chamadas para o Apps Script não passam por aqui. */
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request.mode === 'navigate' ? new Request(e.request.url, { cache: 'no-cache' }) : new Request(e.request, { cache: 'no-cache' }))
      .then(r => { const copia = r.clone(); caches.open(VERSAO).then(c => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
