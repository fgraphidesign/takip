const CACHE_NAME = 'proje-takip-v1';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// App shell: cache-first. Everything else (Firestore, CDN libs): network, so live data always stays fresh.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isShell = SHELL.some((s) => url.pathname.endsWith(s.replace('./', '/')) || s === './');
  if (event.request.method !== 'GET') return;
  if (isShell) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
