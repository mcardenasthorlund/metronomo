// --- CACHE VERSIONING AND CONFIGURATION ---
// IMPORTANT: Incrementing this version string will trigger a complete cache update
// and remove all old caches upon service worker activation.
const CACHE_VERSION = 'v1.0.3';
const CACHE_NAME = `my-app-cache-${CACHE_VERSION}`;

// List of all essential resources to cache on installation.
// This includes the root file, and all files/directories specified in the task.
const ASSETS_TO_CACHE = [
    '/', // Caches index.html (or the root file)
    'index.html',
    // All files in the /html folder (requires listing specific files for precaching,
    // as service workers cannot cache an entire directory structure dynamically during install.
    // Assuming for this example, we cache an example file and the directory itself if it is a valid path.
    // In a real application, you'd list all specific files like '/html/about.html', '/html/contact.html', etc.
    '/html/bases.html', 
    '/html/cante.html',
    '/html/cantes.html',
    '/html/compas.html',
    '/html/metro.html',
    '/html/reproductor.html',
    // All files in the /assets folder (example files representing different types)
    '/assets/css/modern.css',
    '/assets/data/bases.json',
    '/assets/data/cantes.json',
    '/assets/data/compases.json',
    '/assets/js/afinador.js',
    '/assets/js/bases.js',
    '/assets/js/cantes.js',
    '/assets/js/compases.js',
    '/assets/js/howler.min.js',
    '/assets/js/index.js',
    '/assets/js/reloj.js',
    'app.js'
];
// Note: For a real-world scenario with many files, a build process (like Webpack or Workbox) 
// would generate this list automatically (the "precaching manifest"). 
// The list above is illustrative based on the requirements.


// --- INSTALL EVENT: PRE-CACHING ESSENTIAL ASSETS ---
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install Event: Caching static assets.');
    // `waitUntil` ensures the service worker is not installed until all files are cached.
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Pre-caching all essential app shell assets:', ASSETS_TO_CACHE);
                // `addAll` attempts to fetch and cache all resources in the list.
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch((error) => {
                // If any file fails to cache, the entire installation fails.
                console.error('[Service Worker] Pre-caching failed during install:', error);
            })
    );
});


// --- ACTIVATE EVENT: CLEAN UP OLD CACHES ---
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate Event: Cleaning up old caches.');
    // `waitUntil` ensures the service worker is active only after cleanup is done.
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                // Filter out all cache names that do NOT match the current CACHE_NAME.
                cacheNames.filter((cacheName) => {
                    // Check if the cache name starts with our app prefix and is NOT the current version.
                    return cacheName.startsWith('my-app-cache-') && cacheName !== CACHE_NAME;
                }).map((cacheName) => {
                    // Delete the old cache.
                    console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
                    return caches.delete(cacheName);
                })
            );
        })
    );
    // This immediately takes control of any open pages without requiring a page reload.
    return self.clients.claim();
});


// --- FETCH EVENT: NETWORK-FIRST STRATEGY WITH CACHE FALLBACK ---
self.addEventListener('fetch', (event) => {
    // We only want to intercept standard HTTP(S) requests, not extension calls or others.
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            // 1. Attempt to fetch from the **NETWORK** first.
            fetch(event.request)
                .then((response) => {
                    // Check if we received a valid response (e.g., status 200)
                    if (response && response.status === 200) {
                        // IMPORTANT: Clone the response. The response body can only be 
                        // consumed once (by the browser to display, or by the cache to store).
                        const responseClone = response.clone();
                        
                        // We can cache successful network requests dynamically here if needed,
                        // but for the required precaching strategy, we just return the network response.
                        // If you wanted to dynamically update the cache with fresh network content:
                        /*
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                        */

                        console.log(`[Service Worker] Network-First: Served from Network: ${event.request.url}`);
                        return response;
                    }

                    // If network fetch fails (e.g., status 404/500), or if the response is invalid,
                    // we fall through to the .catch() block to attempt cache fallback.
                    throw new Error('Network fetch failed or invalid response.');
                })
                .catch(() => {
                    // 2. If the network attempt fails (e.g., offline or network error), 
                    //    attempt to fetch from the **CACHE**.
                    console.log(`[Service Worker] Network failed. Falling back to Cache: ${event.request.url}`);
                    return caches.match(event.request)
                        .then((cachedResponse) => {
                            // If a cached version exists, return it.
                            if (cachedResponse) {
                                console.log(`[Service Worker] Cache Fallback: Served from Cache: ${event.request.url}`);
                                return cachedResponse;
                            }
                            
                            // If no response in cache, it's a true failure.
                            // In a real app, you might serve an 'offline.html' page here instead.
                            console.warn(`[Service Worker] Resource not found in cache and network failed: ${event.request.url}`);
                            return new Response('Application is offline and resource is not available in cache.', {
                                status: 503,
                                statusText: 'Service Unavailable (Offline)',
                                headers: new Headers({
                                    'Content-Type': 'text/plain'
                                })
                            });
                        });
                })
        );
    }
});