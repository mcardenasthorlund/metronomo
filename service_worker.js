// Cached core static resources 
self.addEventListener("install",e=>{
    // e.waitUntil(
    //   caches.open("static").then(cache=>{
    //     return cache.addAll(["./",'assets/img/icons/icon-192x192.png']);
    //   })
    // );
  });
  
  // Fatch resources
  // self.addEventListener("fetch",e=>{
  //   e.respondWith(
  //     caches.match(e.request).then(response=>{
  //       return response||fetch(e.request);
  //     })
  //   );
  // });

  self.addEventListener('fetch', function(event) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
    );
  });