// Small Hours — offline keeper.
// Everything the house needs is saved on the device the first time it opens,
// so every room works with no internet. Only the radio reaches outside.
const VERSION = 'sh-v49';
const CORE = ["./", "courtyard.html", "css/courtyard.css", "css/desk.css", "css/doorstep.css", "css/home.css", "css/house.css", "css/library.css", "css/listening.css", "css/quiet.css", "css/roof.css", "css/shell.css", "css/window.css", "data/cities.js", "data/land.js", "data/posterfonts.js", "data/sky.js", "data/snd-birds.js", "data/snd-cafe.js", "data/snd-fire.js", "data/snd-night.js", "data/snd-rain.js", "data/snd-storm.js", "data/snd-stream.js", "data/snd-train.js", "data/snd-waves.js", "data/snd-wind.js", "desk.html", "doorstep.html", "fonts/amiri-arabic-400-normal.woff2", "fonts/amiri-arabic-700-normal.woff2", "fonts/cormorant-garamond-latin-300-italic.woff2", "fonts/cormorant-garamond-latin-400-italic.woff2", "fonts/cormorant-garamond-latin-400-normal.woff2", "fonts/cormorant-garamond-latin-500-normal.woff2", "fonts/courier-prime-latin-400-normal.woff2", "fonts/courier-prime-latin-700-normal.woff2", "fonts/eb-garamond-latin-400-italic.woff2", "fonts/eb-garamond-latin-400-normal.woff2", "fonts/eb-garamond-latin-500-normal.woff2", "fonts/goudy-bookletter-1911-latin-400-normal.woff2", "fonts/ibm-plex-mono-latin-400-normal.woff2", "fonts/ibm-plex-mono-latin-500-normal.woff2", "fonts/im-fell-english-latin-400-italic.woff2", "fonts/im-fell-english-latin-400-normal.woff2", "fonts/im-fell-english-sc-latin-400-normal.woff2", "fonts/libre-baskerville-latin-400-italic.woff2", "fonts/libre-baskerville-latin-400-normal.woff2", "fonts/nanum-pen-script-latin-400-normal.woff2", "fonts/noto-kufi-arabic-arabic-400-normal.woff2", "fonts/noto-kufi-arabic-arabic-500-normal.woff2", "fonts/special-elite-latin-400-normal.woff2", "fonts/vt323-latin-400-normal.woff2", "house.html", "icons/apple-touch-icon.png", "icons/favicon-32.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/icon-maskable.svg", "icons/icon.svg", "index.html", "install.html", "js/courtyard.js", "js/desk.js", "js/doorstep.js", "js/home.js", "js/index.js", "js/install.js", "js/library.js", "js/listening.js", "js/plan.js", "js/quiet.js", "js/roof.js", "js/vendor/astronomy.min.js", "js/window.js", "library.html", "listening.html", "manifest.webmanifest", "plan.html", "quiet.html", "roof.html", "window.html"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return; // radio streams and anything outside: straight to the network
  // Stale-while-revalidate: answer from the device at once, refresh quietly in the background.
  e.respondWith(caches.open(VERSION).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const res = await net;
    if (res) return res;
    if (req.mode === 'navigate') return (await cache.match('index.html')) || Response.error();
    return Response.error();
  }));
});
