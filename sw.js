/* Increment CACHE_VERSION for every published release. Local data are in IndexedDB, not CacheStorage. */
const CACHE_VERSION='mesa-shell-0.1.1';
const ASSETS=['./','./index.html','./app.css','./app.mjs','./core.mjs','./storage.mjs','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_VERSION).then(cache=>cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('mesa-shell-') && key!==CACHE_VERSION)await caches.delete(key);await self.clients.claim();})());
});
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET' || new URL(req.url).origin!==self.location.origin)return;
  // Serve cached shell offline. Fresh assets deployed with the next CACHE_VERSION.
  event.respondWith((async()=>{
    const cached=await caches.match(req,{ignoreSearch:true});
    if(cached)return cached;
    try{return await fetch(req);}catch(e){if(req.mode==='navigate')return (await caches.match('./index.html'))||Response.error();throw e;}
  })());
});
self.addEventListener('message',event=>{if(event.data==='SKIP_WAITING')self.skipWaiting();});
