// public/firebase-messaging-sw.js
// 백그라운드 알림 처리 Service Worker
// 앱이 꺼져있거나 다른 탭에 있을 때, 폰의 알림 센터에 푸시 알림 표시

// Firebase SDK 가져오기 (Service Worker에서는 importScripts 사용)
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Firebase 설정 (firebase.js와 동일)
firebase.initializeApp({
  apiKey: "AIzaSyCNAcwUQAGe8zomG9F6UVj5nZwl1yU2jBQ",
  authDomain: "teachermeet-975aa.firebaseapp.com",
  projectId: "teachermeet-975aa",
  storageBucket: "teachermeet-975aa.firebasestorage.app",
  messagingSenderId: "544085879920",
  appId: "1:544085879920:web:a3a20f254598ee999b98b5"
});

const messaging = firebase.messaging();

// 백그라운드에서 메시지 받았을 때 처리
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] 백그라운드 메시지 수신:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || '티처밋';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: payload.data?.tag || 'teachermeet-notification',
    data: payload.data || {},
    // 클릭 시 어떻게 동작할지
    actions: [],
    requireInteraction: false,
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 시 동작
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // 알림 데이터에서 URL 추출 (예: 매칭 → /chat, 메시지 → /chat)
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 이미 열린 창이 있으면 그것을 포커스
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // 없으면 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});