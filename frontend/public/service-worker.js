// public/service-worker.js
/*const CACHE_NAME = "osv-command-v1";

self.addEventListener("install", (event) => {
  console.log("Service Worker installing");
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating");
});

self.addEventListener("fetch", (event) => {
  // Network-first strategy
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
*/
// public/service-worker.js
const CACHE_NAME = "osv-command-v1";
const API_URLS = [
  'https://osv-backend.onrender.com/api/',
  'https://osv-backend.onrender.com/auth/'
];

self.addEventListener("install", (event) => {
  console.log("Service Worker installing");
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating");
  // Claim clients immediately
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Skip API requests
  const url = new URL(event.request.url);
  const isApiRequest = API_URLS.some(apiUrl => url.href.startsWith(apiUrl));
  
  if (isApiRequest) {
    // Don't cache API requests, just fetch them
    event.respondWith(fetch(event.request));
    return;
  }
  
  // For non-API requests, use network-first strategy
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache static assets
        if (event.request.method === 'GET' && 
            response.status === 200 &&
            !url.href.includes('/api/') &&
            !url.href.includes('/auth/')) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});