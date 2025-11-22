const CACHE_NAME = 'interiowale-v2';
const STATIC_CACHE_NAME = 'interiowale-static-v2';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/_next/static/css/',
  '/_next/static/chunks/',
  '/fonts/',
  '/images/',
  '/favicon.ico',
  '/site.webmanifest',
];

// API endpoints to cache with network-first strategy
const API_CACHE = [
  '/api/user/profile',
  '/api/products',
  '/api/ai/credits',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  // Skip waiting to activate immediately
  self.skipWaiting();

  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS)
          .catch((error) => {
            console.warn('Some assets failed to cache:', error);
            // Continue even if some assets fail to cache
            return Promise.resolve();
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  // Take control immediately
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Strategy 1: Static assets - cache first
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname === '/favicon.ico' ||
    url.pathname === '/site.webmanifest'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Strategy 2: API endpoints - network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Strategy 3: External images (CDN) - cache first with short TTL
  if (
    url.hostname.includes('cdn.sanity.io') ||
    url.hostname.includes('images.unsplash.com')
  ) {
    event.respondWith(cacheFirst(request, 60 * 60)); // 1 hour
    return;
  }

  // Strategy 4: Everything else - network first
  event.respondWith(networkFirst(request));
});

// Cache first strategy
async function cacheFirst(request, maxAge = 60 * 60 * 24 * 30) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    // Check if cached response is still valid
    const cachedDate = cached.headers.get('date');
    if (cachedDate) {
      const age = (Date.now() - new Date(cachedDate).getTime()) / 1000;
      if (age < maxAge) {
        return cached;
      }
    }
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache the successful response
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
    }
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    return cached || new Response('Offline', { status: 503 });
  }
}

// Network first strategy
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache the successful response
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/') || new Response('Offline', { status: 503 });
    }

    return new Response('Offline', { status: 503 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Handle background sync
async function doBackgroundSync() {
  // Implement background sync logic here
  // For example: sync offline actions like form submissions, etc.
  console.log('Background sync completed');
}

// Handle push notifications (if needed)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text(),
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'interiowale-notification',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification('Interiowale', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});