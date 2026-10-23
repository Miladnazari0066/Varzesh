/* Service worker: cache app shell for offline use */
const CACHE = "hometrain-v1";
const ASSETS = ["./","./index.html","./css/style.css","./manifest.webmanifest",
  "./js/store.js","./js/i18n.js","./js/exercises.js","./js/audio.js","./js/timer.js","./js/routines.js","./js/ui.js","./js/app.js"];
self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate", e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch", e=>{
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res=>{
      const copy = res.clone();
      caches.open(CACHE).then(c=>c.put(e.request, copy));
      return res;
    }).catch(()=>caches.match("./index.html")))
  );
});