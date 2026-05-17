// src/notifications.js
// 푸시 알림 (FCM) 헬퍼 함수
// - 권한 요청
// - FCM 토큰 받기 + Firestore에 저장
// - 포그라운드 알림 처리 (앱 켜진 상태)
// - 알림 ON/OFF 관리

import { messaging, VAPID_KEY, db } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

/**
 * 푸시 알림 권한 요청 + FCM 토큰 받기 + Firestore에 저장
 * @returns {Promise<string|null>} 토큰 또는 null
 */
export async function enableNotifications(userId) {
  // 1) 브라우저 지원 체크
  if (!('Notification' in window)) {
    throw new Error('이 브라우저는 알림을 지원하지 않아요.');
  }

  if (!messaging) {
    throw new Error('알림 시스템이 준비되지 않았어요. 잠시 후 다시 시도해주세요.');
  }

  // 2) 권한 요청
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('알림 권한이 거부되었어요. 브라우저 설정에서 변경할 수 있어요.');
  }

  // 3) Service Worker 등록 (이미 등록되어 있으면 그대로 사용)
  let registration;
  try {
    registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;
  } catch (e) {
    console.error('Service Worker 등록 실패:', e);
    throw new Error('알림용 서비스 워커 등록에 실패했어요.');
  }

  // 4) FCM 토큰 받기
  let token;
  try {
    token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
  } catch (e) {
    console.error('FCM 토큰 받기 실패:', e);
    throw new Error('알림 토큰을 받지 못했어요. 다시 시도해주세요.');
  }

  if (!token) {
    throw new Error('알림 토큰이 비어있어요. 권한을 확인해주세요.');
  }

  // 5) Firestore에 토큰 저장 (사용자별로 여러 기기 가능 → 배열)
  await updateDoc(doc(db, 'users', userId), {
    fcmTokens: arrayUnion(token),
    notificationsEnabled: true,
    notificationsUpdatedAt: new Date(),
  });

  console.log('알림 활성화 성공! 토큰:', token.slice(0, 20) + '...');
  return token;
}

/**
 * 알림 비활성화 (토큰 제거)
 */
export async function disableNotifications(userId, token) {
  try {
    if (token) {
      await updateDoc(doc(db, 'users', userId), {
        fcmTokens: arrayRemove(token),
        notificationsEnabled: false,
        notificationsUpdatedAt: new Date(),
      });
    } else {
      // 토큰 없으면 전체 비활성화
      await updateDoc(doc(db, 'users', userId), {
        notificationsEnabled: false,
        notificationsUpdatedAt: new Date(),
      });
    }
  } catch (e) {
    console.error('알림 비활성화 오류:', e);
  }
}

/**
 * 현재 알림 권한 상태 확인
 * @returns 'granted' | 'denied' | 'default' | 'unsupported'
 */
export function getNotificationStatus() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

/**
 * 사용자가 이미 알림을 활성화했는지 확인
 */
export async function isNotificationEnabled(userId) {
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return false;
    const data = snap.data();
    return data.notificationsEnabled === true && (data.fcmTokens?.length || 0) > 0;
  } catch (e) {
    return false;
  }
}

/**
 * 포그라운드 알림 리스너 (앱이 열려있을 때)
 * App.js에서 호출해서 인앱 토스트 표시
 *
 * @param {function} onReceive - 알림 데이터 받았을 때 콜백 (title, body, data 제공)
 * @returns unsubscribe 함수
 */
export function listenForegroundMessages(onReceive) {
  if (!messaging) return () => {};

  const unsub = onMessage(messaging, (payload) => {
    console.log('포그라운드 알림 수신:', payload);
    const title = payload.notification?.title || payload.data?.title || '새 알림';
    const body = payload.notification?.body || payload.data?.body || '';
    const data = payload.data || {};
    onReceive({ title, body, data });
  });

  return unsub;
}