const CACHE = 'firmo-v7';
const SHARE_CACHE = 'firmo-shared';
const ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png',
  './icons/maskable-192.png', './icons/maskable-512.png',
  './icons/apple-touch-icon.png', './icons/favicon-32.png', './icons/favicon-64.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== SHARE_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first: يفتح فورًا بدون إنترنت، ويحدّث النسخة في الخلفية
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // استقبال ملفات المشاركة (واتساب / الملفات) -> تُحفظ مؤقتًا ثم يفتحها التطبيق
  if (e.request.method === 'POST' && url.pathname.endsWith('/share-target')) {
    e.respondWith((async () => {
      try {
        const fd = await e.request.formData();
        const files = fd.getAll('files').filter(f => f && typeof f === 'object' && 'name' in f);
        const c = await caches.open(SHARE_CACHE);
        for (const k of await c.keys()) await c.delete(k);
        let i = 0;
        for (const f of files) {
          await c.put(new Request(self.registration.scope + '__shared/' + (i++)),
            new Response(f, { headers: { 'x-name': encodeURIComponent(f.name || 'file'), 'content-type': f.type || 'application/octet-stream' } }));
        }
      } catch (err) {}
      return Response.redirect(new URL('./index.html?shared=1', self.registration.scope).href, 303);
    })());
    return;
  }
  if (e.request.method !== 'GET') return;
  if (url.origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(res => {
      if (res && res.ok && !url.search) cache.put(e.request, res.clone());
      return res;
    }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const res = await net;
    if (res) return res;
    if (e.request.mode === 'navigate') return (await cache.match('./index.html')) || (await cache.match('./'));
    return Response.error();
  })());
});
