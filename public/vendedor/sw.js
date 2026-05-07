self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("zkid-v1").then(cache => {
      return cache.addAll([
        "/vendedor.html",
        "/vendedor.css",
        "/vendedor.js",
        "/manifest.json"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
