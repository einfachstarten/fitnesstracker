const CACHE_VERSION = '20250726-' + Date.now();
const CACHE_NAME = 'fitness-tracker-v' + CACHE_VERSION;
const urlsToCache = [
  './',
  './index.html',
  './archive/benni-specialized.html',
  './css/tailwind.css',
  './manifest.json',
  `./css/theme.css?v=${CACHE_VERSION}`,
  `./css/app-responsive.css?v=${CACHE_VERSION}`,
  `./src/core/App.js?v=${CACHE_VERSION}`
];

// Installation des Service Workers
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Cache complete');
        return self.skipWaiting();
      })
  );
});

// Aktivierung des Service Workers
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName.startsWith('fitness-tracker-v') && cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch-Events abfangen (Offline-Funktionalität)
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  
  // Skip chrome-extension requests
  if (requestUrl.protocol === 'chrome-extension:') {
    return;
  }
  
  // Skip POST requests (API calls)
  if (event.request.method !== 'GET') {
    console.log('Service Worker: Skipping non-GET request:', event.request.url);
    return;
  }
  
  // Skip external CDN requests (let them load normally)
  if (requestUrl.hostname === 'cdn.tailwindcss.com') {
    return;
  }
  
  console.log('Service Worker: Fetching:', event.request.url);
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          console.log('Service Worker: Found in cache:', event.request.url);
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Only cache same-origin requests
          if (requestUrl.origin !== location.origin) {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // Network failed, try to get from cache
          return caches.match('./index.html');
        });
      })
  );
});

// Push-Benachrichtigungen (optional für später)
self.addEventListener('push', event => {
  const options = {
    body: 'Zeit für Ihr nächstes Training! 💪',
    icon: './icon-192.png',
    badge: './icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Fitness Tracker', options)
  );
});