const CACHE = "flydget-ui-cache"

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(c => {
            c.addAll([
                'index.html',
                'logo.png',
                'index.css',
                'app/index.html',
                'app/style.css',
                'app/script.js',
                'app/imgs/mobile_4.jpg',
                'app/imgs/mobile_3.jpg',
                'app/imgs/mobile_2.jpg',
                'app/imgs/mobile_1.jpg',
                'app/imgs/desktop_4.jpg',
                'app/imgs/desktop_3.jpg',
                'app/imgs/desktop_2.jpg',
                'app/imgs/desktop_1.jpg',
                'app/imgs/logo96.png',
                'app/imgs/logo72.png',
                'app/imgs/logo48.png',
                'app/imgs/logo192.png',
                'app/imgs/logo168.png',
                'app/imgs/logo144.png',
            ])
        })
    )
})

function fromCache(request) {
    return caches.open(CACHE).then(c => {
        c.match(request).then(matching => {
            matching || Promise.reject('no-match')
        })
    })
}

function update(request) {
    return caches.open(CACHE).then(c => {
        fetch(request).then(resp => {
            cache.put(request, resp)
        })
    })
}

self.addEventListener('fetch', e => {
    e.respondWith(fromCache(e.request))
    e.waitUntil(update(e.request))
})