const DYN_CACHE = 'otfl_cache_v1';

(() => {
  self.addEventListener('fetch', (e) => {
    e.respondWith(
      fetch(e.request)
        .then((res) => caches.open(DYN_CACHE).then((cache) => {
          if (e.request.url.includes('http')) {
            cache.put(e.request.url, res.clone());
          }
          return res;
        }))
        .catch(() => cache.match(e.request))
    );
  });

  self.addEventListener('install', (e) => {
    e.waitUntil(
      caches.open(DYN_CACHE).then((cache) => {
        return cache.addAll([
          '/archive',
          '/style.css',
          '/favicon.ico',
          '/manifest.json',
          '/images/icons/icon-72x72.png',
          '/images/icons/icon-96x96.png',
          '/images/icons/icon-128x128.png',
          '/images/icons/icon-144x144.png',
          '/images/icons/icon-152x152.png',
          '/images/icons/icon-192x192.png',
          '/images/icons/icon-384x384.png',
          '/images/icons/icon-512x512.png',
        ]);
      }),
    );
  });
})();