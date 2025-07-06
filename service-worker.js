const CACHE_NAME = 'kanggadin-taxi-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/select.html',
  '/login-driver.html',
  '/login-passenger.html',
  '/manifest.json',
//  '/manifest-driver.json',
//  '/css/styles.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-passenger-192.png',
  '/icons/icon-passenger-512.png',
  '/icons/icon-driver-192.png',
  '/icons/icon-driver-512.png',
  '/img/taxi_image.png',
  '/img/google_icon.png',
  '/img/kakao_icon.png',
  '/img/naver_icon.png',
  '/img/kanggadin_icon.png',
  '/movie/kanggadin_intro.mp4',
  '/movie/kanggadin_intro2.mp4',
  '/movie/kanggadin_intro3.mp4'
];


// 설치 이벤트 - 지정된 리소스를 캐시합니다.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache).catch((error) => {
          console.error('Failed to cache', error);
          urlsToCache.forEach(async (url) => {
            try {
              const response = await fetch(url);
              if (!response.ok) {
                console.error(`Failed to fetch ${url}: ${response.statusText}`);
              }
            } catch (e) {
              console.error(`Error fetching ${url}: ${e}`);
            }
          });
        });
      })
  );
});



// 활성화 이벤트 - 오래된 캐시를 삭제합니다.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});



// 네트워크 요청 가로채기 - 캐시된 리소스를 제공하거나, 네트워크를 통해 요청합니다.
self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith('chrome-extension')) {
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          (response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        );
      })
  );
});
