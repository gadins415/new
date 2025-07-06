const CACHE_NAME = 'kanggadin-taxi-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/login.html',
    '/driver.html',
    '/passenger.html',
  '/manifest.json',
  '/css/styles.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512-512.png',
  '/img/taxi_image.png',
  '/img/google_icon.png',
  '/img/kakao_icon.png',
  '/img/naver_icon.png',
  '/img/kanggadin_icon.png',
  '/movie/kanggadin_intro.mp4',
  '/movie/kanggadin_intro2.mp4',
  '/movie/kanggadin_intro3.mp4'
];



self.addEventListener('install', event => {
    console.log('Service Worker installing.');
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('Opened cache');
          return cache.addAll(urlsToCache);
        })
        .catch(error => {
          console.error('Failed to cache resources:', error);
        })
    );
  });

  self.addEventListener('fetch', event => {
      console.log('Service Worker fetching.');
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request);
        })
    );
  });


