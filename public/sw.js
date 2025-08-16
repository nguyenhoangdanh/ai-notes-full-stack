// AI Notes Service Worker
const CACHE_NAME = 'ai-notes-v1'
const API_CACHE_NAME = 'ai-notes-api-v1'

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/main.css',
  '/manifest.json',
  '/icon.svg'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell')
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        // Ensure the current service worker takes control immediately
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle same-origin requests
  if (url.origin === location.origin) {
    // For navigation requests (HTML pages)
    if (request.mode === 'navigate') {
      event.respondWith(
        fetch(request)
          .catch(() => {
            // If network fails, serve the cached index.html
            return caches.match('/index.html')
          })
      )
      return
    }

    // For static assets
    if (request.destination === 'script' || 
        request.destination === 'style' || 
        request.destination === 'image' ||
        request.destination === 'manifest') {
      event.respondWith(
        caches.match(request)
          .then((cached) => {
            if (cached) {
              return cached
            }
            return fetch(request)
              .then((response) => {
                // Cache successful responses
                if (response.status === 200) {
                  const responseClone = response.clone()
                  caches.open(CACHE_NAME)
                    .then((cache) => {
                      cache.put(request, responseClone)
                    })
                }
                return response
              })
          })
      )
      return
    }
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful GET requests
          if (request.method === 'GET' && response.status === 200) {
            const responseClone = response.clone()
            caches.open(API_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone)
              })
          }
          return response
        })
        .catch(() => {
          // For failed requests, try to serve from cache
          if (request.method === 'GET') {
            return caches.match(request)
          }
          // For non-GET requests that fail, return a meaningful response
          return new Response(
            JSON.stringify({ 
              error: 'Network unavailable', 
              offline: true 
            }),
            {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'application/json' }
            }
          )
        })
    )
    return
  }

  // For all other requests, try network first, then cache
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request)
      })
  )
})

// Background sync for offline operations
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Trigger sync operations when connectivity is restored
      self.registration.sync.register('notes-sync')
    )
  }
})

// Push notifications for reminders and updates
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1
      },
      actions: [
        {
          action: 'explore',
          title: 'View Note',
          icon: '/icon-192.png'
        },
        {
          action: 'close',
          title: 'Dismiss',
          icon: '/icon-192.png'
        }
      ]
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'AI Notes', options)
    )
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'explore') {
    // Open the app to the specific note
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Message handling for communication with the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})