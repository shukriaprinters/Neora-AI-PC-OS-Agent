const CACHE_NAME = 'neora-dashboard-cache-v1';

// Check if we are in development mode based on hostname
const isDev = typeof self !== 'undefined' && (
  self.location.hostname.includes('localhost') ||
  self.location.hostname.includes('127.0.0.1') ||
  self.location.hostname.includes('-dev-')
);

const ASSETS_TO_CACHE = isDev ? [] : [
  '/',
  '/index.html',
  '/favicon.ico'
];

// Install Event
self.addEventListener('install', (event) => {
  if (isDev) {
    console.log('[Service Worker] Dev mode detected: skipping asset caching');
    self.skipWaiting();
    return;
  }
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching critical assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - immediately claim client and clear caches if in dev mode
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          // If in dev mode, delete ALL caches to prevent stale React builds
          if (isDev || cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network-First, falling back to cache
self.addEventListener('fetch', (event) => {
  // Only handle HTTP/HTTPS, skip browser extensions or chrome-extension://
  if (!event.request.url.startsWith('http')) return;

  // In development, or for API calls, always go directly to network
  if (isDev || event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If valid response, clone and cache it
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If not in cache and it's a page navigation, return index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
