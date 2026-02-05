// public/service-worker.js
const CACHE_NAME = "osv-command-v1";

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