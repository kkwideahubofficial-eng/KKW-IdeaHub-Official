const CACHE_NAME = "pwa-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
//   "/style.css", // Vite usually embeds css or hashes it, so explicit caching might be tricky without dynamic injection, but keeping as user requested for now.
//   "/app.js" // Vite main entry is not app.js, but let's keep the structure the user asked for generally. 
  // Ideally for Vite we cache the build output, but this static list is what was requested. 
  // I will add a few common things that might exist or just keep it simple to avoid errors if 404.
];

// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});
