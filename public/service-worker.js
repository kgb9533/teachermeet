// public/service-worker.js
// 티처밋 Service Worker
//
// 캐시 전략: "네트워크 우선, 캐시 폴백"
// - 항상 최신 파일 받으려 시도 (배포한 새 버전 즉시 적용)
// - 네트워크 실패 시에만 캐시 사용 (오프라인 지원)
// - HTML/JS는 캐시 안 함 (배포 시 404 방지)

const CACHE_NAME = 'teachermeet-v2';
const PRECACHE_URLS = [
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/apple-touch-icon.png',
];

// 설치: 정적 자원만 미리 캐시
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('티처밋 SW v2: 캐시 생성');
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
          .map((name) => {
            console.log('오래된 캐시 삭제:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// 요청 처리
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. 외부 API/리소스는 SW가 손대지 않음
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('cloudinary.com') ||
    url.hostname.includes('portone.io') ||
    url.protocol === 'chrome-extension:' ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // 2. HTML, JS, CSS는 "네트워크 우선" (배포 시 최신 보장)
  const isHTML = event.request.mode === 'navigate' || url.pathname.endsWith('.html');
  const isJS = url.pathname.endsWith('.js');
  const isCSS = url.pathname.endsWith('.css');

  if (isHTML || isJS || isCSS) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 네트워크 성공: 응답을 캐시에도 저장 (오프라인 대비)
          if (response && response.status === 200 && response.type === 'basic') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // 네트워크 실패: 캐시에서 가져오기 (오프라인)
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            // HTML 요청이면 메인 페이지 반환
            if (isHTML) return caches.match('/');
          });
        })
    );
    return;
  }

  // 3. 이미지 등 정적 자원은 "캐시 우선" (성능 최우선)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      });
    })
  );
});