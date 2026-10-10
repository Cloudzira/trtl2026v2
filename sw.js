// SMAIT FaceCheck AI - Service Worker (mode offline otomatis)
const V = 'smait-facecheck-v2';
const SHELL = [
  './', './index.html',
  'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.11/dist/face-api.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800&display=swap'
];
const CDN = ['cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;                       // POST ke Apps Script tidak disentuh
  const same = u.origin === location.origin;
  if (!same && !CDN.includes(u.host)) return;
  e.respondWith(caches.open(V).then(async c => {
    const hit = await c.match(r, { ignoreSearch: same });
    if (hit && !same) return hit;                       // library & model AI: cache dulu
    try {                                               // halaman aplikasi: terbaru saat online
      const res = await fetch(r);
      if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone());
      return res;
    } catch { return hit || new Response('Offline', { status: 503 }); }
  }));
});
