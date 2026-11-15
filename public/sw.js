const SCOPE=new URL(self.registration.scope);
const PREFIX='kovo-comms-shell:'+SCOPE.pathname+':';
const CACHE=PREFIX+'v3';
const ASSETS=['./','app.js','logic.js','style.css','icon.svg','icon-180.png','icon-192.png','icon-512.png','manifest.json'].map(path=>new URL(path,SCOPE).href);
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||!ASSETS.includes(e.request.url))return;e.respondWith(fetch(e.request).catch(()=>caches.open(CACHE).then(c=>c.match(e.request))))});
