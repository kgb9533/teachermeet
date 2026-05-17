import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCNAcwUQAGe8zomG9F6UVj5nZwl1yU2jBQ",
  authDomain: "teachermeet-975aa.firebaseapp.com",
  projectId: "teachermeet-975aa",
  storageBucket: "teachermeet-975aa.firebasestorage.app",
  messagingSenderId: "544085879920",
  appId: "1:544085879920:web:a3a20f254598ee999b98b5"
};

// 푸시 알림용 VAPID 키 (Firebase Console > 클라우드 메시징 > 웹 푸시 인증서)
export const VAPID_KEY = "BIhCDLcznrgn1SE0ndBrK5UvEGVdxuhxX5IS6lKSyKH6yM7EKH_jkYrpQTLQA62s2DjmTFKvtbzv0dbhBtgkZps";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);

// Firebase Messaging (FCM)
// 브라우저가 푸시 알림을 지원하는 경우에만 초기화
export let messaging = null;
isSupported().then((supported) => {
  if (supported) {
    try {
      messaging = getMessaging(app);
    } catch (e) {
      console.warn('FCM 초기화 실패:', e);
    }
  } else {
    console.log('이 브라우저는 푸시 알림을 지원하지 않아요.');
  }
});