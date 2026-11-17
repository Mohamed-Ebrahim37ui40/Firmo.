/* Firmo Service Worker – offline shell */
const CACHE = 'firmo-v4-2026-11-17';
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './sw.js',
  './icons/favicon-32.png',
  './icons/favicon-64.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('Firmo SW precache', err))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isNavigation(req) {
  return req.mode === 'navigate' ||
    (req.method === 'GET' && req.headers.get('accept') && req.headers.get('accept').includes('text/html'));
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // only same-origin
  if (url.origin !== self.location.origin) return;

  // App shell: network-first with cache fallback (so updates apply when online)
  if (isNavigation(req) || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', copy)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches.match('./index.html').then((r) => r || caches.match(req))
        )
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.ok && (url.pathname.includes('/icons/') || url.pathname.endsWith('.webmanifest') || url.pathname.endsWith('sw.js'))) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => cached);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
