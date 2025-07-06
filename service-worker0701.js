self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
    event.waitUntil(
        caches.open('static-v1').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/login.html',
                '/manifest.json',
                '/css/styles.css',
                '/movie/kanggadinIntro2Plus.mp4',
                '/img/taxi_image.png',
                '/img/google_icon.png',
                '/img/kakao_icon.png',
                '/img/naver_icon.png',
                '/img/kanggadin_icon.png',
                // 다른 필요한 파일들
            ]);
        })
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating.');
    // 필요에 따라 이전 캐시 정리
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});



