/* Kargo Egitim — Service Worker (offline cache) */
const CACHE = 'kargo-v2';
const BASE  = '/kargo-app/';
const FILES = [
  BASE,
  BASE + 'index.html',
  BASE + 'en.html',
  BASE + 'manifest.json',
  BASE + 'manifest-en.json',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png',
  BASE + 'sw.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
      .then(r => r || fetch(e.request).then(resp => {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return resp;
      }))
      .catch(() => caches.match(BASE + 'index.html'))
  );
});
