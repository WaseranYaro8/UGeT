const CACHE='uget-20261121-searchfix';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys()){
      if(k!==CACHE)await caches.delete(k);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  if(u.pathname.includes('/api/')||u.pathname.endsWith('backend.json'))return;
  e.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    if(e.request.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('.html')){
      try{
        const net=await fetch(e.request,{cache:'no-store'});
        cache.put(e.request,net.clone());
        return net;
      }catch(err){
        const c=await cache.match(e.request);
        return c||Response.error();
      }
    }
    const c=await cache.match(e.request);
    const f=fetch(e.request).then(n=>{
      if(n&&n.status===200)cache.put(e.request,n.clone());
      return n;
    }).catch(()=>c);
    return c||f;
  })());
});
