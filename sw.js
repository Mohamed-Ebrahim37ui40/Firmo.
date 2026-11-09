/* Firmo offline service worker */
const CACHE = 'firmo-v4';
const SHELL = ['./', './index.html', './Firmo.html', 'sw.js'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Cache the page that registered us + common entry points
    const urls = new Set([
      self.registration.scope,
      self.registration.scope.replace(/\/?$/, '/'),
      './',
      './Firmo.html',
      './index.html'
    ]);
    await Promise.all([...urls].map(async (u) => {
      try {
        const req = new Request(u, { cache: 'reload' });
        const res = await fetch(req);
        if (res && res.ok) await cache.put(req, res.clone());
      } catch (e) {}
    }));
    // Also try to cache the document that loaded the SW
    try {
      const clientsList = await self.clients.matchAll({ type: 'window' });
      for (const c of clientsList) {
        try {
          const res = await fetch(c.url, { cache: 'reload' });
          if (res && res.ok) await cache.put(c.url, res.clone());
        } catch (e) {}
      }
    } catch (e) {}
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith((async () => {
    // Prefer network when online, fall back to cache (stale-while-revalidate for HTML)
    const url = new URL(req.url);
    const isNav = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

    try {
      const res = await fetch(req);
      if (res && res.ok && (res.type === 'basic' || res.type === 'cors')) {
        const cache = await caches.open(CACHE);
        cache.put(req, res.clone()).catch(() => {});
        // Also store under scope root for offline navigation
        if (isNav) {
          cache.put(self.registration.scope, res.clone()).catch(() => {});
          cache.put('./', res.clone()).catch(() => {});
        }
      }
      return res;
    } catch (err) {
      const cache = await caches.open(CACHE);
      let cached = await cache.match(req, { ignoreSearch: true });
      if (cached) return cached;
      if (isNav) {
        cached = await cache.match(self.registration.scope) ||
                await cache.match('./') ||
                await cache.match('./Firmo.html') ||
                await cache.match('./index.html');
        if (cached) return cached;
      }
      // Last resort: any cached HTML
      const keys = await cache.keys();
      for (const k of keys) {
        const r = await cache.match(k);
        if (r && (r.headers.get('content-type') || '').includes('text/html')) return r;
      }
      throw err;
    }
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
