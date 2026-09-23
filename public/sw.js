// Nunca armazena páginas autenticadas, respostas de API ou fotos da loja.
const CACHE='carolla-offline-v1';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.add('/offline.html')));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('carolla-offline-')&&k!==CACHE).map(k=>caches.delete(k))))]));});
self.addEventListener('fetch',event=>{if(event.request.mode==='navigate'&&event.request.method==='GET')event.respondWith(fetch(event.request).catch(()=>caches.match('/offline.html')));});
