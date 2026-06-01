/* Kargo Egitim — Service Worker v3
   HTML = network-first  → gate always loads fresh, updates instant
   Assets = cache-first  → icons/manifests work offline
*/
const CACHE   = 'kargo-v3';
const BASE    = '/kargo-app/';
const HTML_RE = /\.html?$|\/kargo-app\/?$/;
const ASSETS  = [
  BASE + 'icon-192.png',
  BASE + 'icon-512.png',
  BASE + 'manifest.json',
  BASE + 'manifest-en.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // HTML files — network first (so password gate / content updates show immediately)
  if (HTML_RE.test(url)) {
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return resp;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Everything else — cache first, network fallback
  e.respondWith(
    caches.match(e.request)
      .then(r => r || fetch(e.request).then(resp => {
        caches.open(CACHE).then(c => c.put(e.request, resp.clone()));
        return resp;
      }))
  );
});
