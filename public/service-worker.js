// public/service-worker.js
// 티처밋 Service Worker
// - 정적 파일 캐싱 (HTML, CSS, JS, 이미지)
// - 오프라인 지원
// - 새 버전 자동 업데이트

const CACHE_NAME = 'teachermeet-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/apple-touch-icon.png',
];

// 설치: 필수 파일들 캐시
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('티처밋 SW: 캐시 생성');
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// 활성화: 오래된 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 요청 처리: 캐시 우선, 없으면 네트워크
self.addEventListener('fetch', (event) => {
  // Firebase, Cloudinary 등 외부 API는 캐시 안 함
  if (
    event.request.url.includes('firestore.googleapis.com') ||
    event.request.url.includes('firebase') ||
    event.request.url.includes('cloudinary.com') ||
    event.request.url.includes('portone.io') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        // 성공 응답만 캐시
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      });
    }).catch(() => {
      // 오프라인일 때 메인 페이지 반환
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});