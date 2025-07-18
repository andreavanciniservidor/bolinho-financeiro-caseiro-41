// This is a placeholder service worker file
// The actual service worker will be generated by vite-plugin-pwa
// This file is needed to register the service worker in the app

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Default fetch handler
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // If fetch fails (offline), try to serve from cache
        return caches.match(event.request);
      })
  );
});