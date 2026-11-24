/* Tezene service worker: çevrimdışı çalışma. Sürüm değişince önbellek yenilenir. */
const ONBELLEK = 'tezene-3.0.0';
const DOSYALAR = ['./', './index.html', './stil.css', './dersler.js', './app.js', './manifest.webmanifest', './ikon.svg', './ikon-192.png', './ikon-512.png', './ikon-maskable-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(ONBELLEK).then(c => c.addAll(DOSYALAR)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== ONBELLEK).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
// Önce ağ (güncel sürüm), ağ yoksa önbellek.
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(new Request(r, { cache: 'no-cache' })).then(yanit => {
      if (yanit && yanit.ok) { const kopya = yanit.clone(); caches.open(ONBELLEK).then(c => c.put(r, kopya)); }
      return yanit;
    }).catch(() => caches.match(r, { ignoreSearch: true }).then(x => x || caches.match('./index.html')))
  );
});
