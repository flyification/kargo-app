/* Kargo Egitim SW — HTML not cached (encrypted, changes each build) */
const CACHE='kargo-v4';
const ASSETS=['/kargo-app/icon-192.png','/kargo-app/icon-512.png',
              '/kargo-app/manifest.json','/kargo-app/manifest-en.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(/(index|en)\.html?$|\/kargo-app\/?$/.test(e.request.url)){
    e.respondWith(fetch(e.request));return;}
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
