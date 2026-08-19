const CACHE = 'flydget-ui-cache-v1';

const FILES = [
    '/',
    '/index.html',
    '/logo.png',
    '/index.css',
    '/manifest.json',

    '/app/index.html',
    '/app/style.css',
    '/app/script.js',
    '/app/chart.js',
    '/app/localforage.min.js',

    '/app/imgs/mobile_4.jpg',
    '/app/imgs/mobile_3.jpg',
    '/app/imgs/mobile_2.jpg',
    '/app/imgs/mobile_1.jpg',

    '/app/imgs/desktop_4.jpg',
    '/app/imgs/desktop_3.jpg',
    '/app/imgs/desktop_2.jpg',
    '/app/imgs/desktop_1.jpg',

    '/app/imgs/logo48.png',
    '/app/imgs/logo72.png',
    '/app/imgs/logo96.png',
    '/app/imgs/logo144.png',
    '/app/imgs/logo168.png',
    '/app/imgs/logo192.png',
    '/app/imgs/logo512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE)
            .then(cache => cache.addAll(FILES))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE)
                    .map(key => caches.delete(key))
            )
        )
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                if (cached) {
                    return cached;
                }
                return fetch(event.request);
            })
    );
});