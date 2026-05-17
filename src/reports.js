// src/reports.js
// 신고 / 차단 시스템 헬퍼 함수들

import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

// 신고 사유 옵션
export const REPORT_REASONS = [
  { code: 'inappropriate_photo', label: '부적절한 사진', emoji: '📷' },
  { code: 'inappropriate_message', label: '부적절한 메시지', emoji: '💬' },
  { code: 'fake_profile', label: '허위 정보 / 가짜 프로필', emoji: '🎭' },
  { code: 'spam', label: '광고 / 스팸', emoji: '📢' },
  { code: 'harassment', label: '욕설 / 괴롭힘', emoji: '😡' },
  { code: 'underage', label: '미성년자로 의심됨', emoji: '⚠️' },
  { code: 'fraud', label: '사기 / 금전 요구', emoji: '💰' },
  { code: 'other', label: '기타', emoji: '📝' },
];

// ============================
// 신고 (Report)
// ============================

/**
 * 사용자 신고하기
 * @param {string} reporterUid - 신고하는 사람 UID
 * @param {string} reportedUid - 신고당하는 사람 UID
 * @param {string} reasonCode - REPORT_REASONS의 code
 * @param {string} description - 상세 설명 (선택)
 * @param {object} context - 추가 정보 (예: { source: 'chat', matchId: 'xxx' })
 */
export async function reportUser(reporterUid, reportedUid, reasonCode, description = '', context = {}) {
  if (!reporterUid || !reportedUid) throw new Error('필수 정보 누락');
  if (reporterUid === reportedUid) throw new Error('본인은 신고할 수 없어요');

  // 중복 신고 체크 (같은 사람을 같은 사유로 신고)
  const reportId = `${reporterUid}_${reportedUid}_${reasonCode}`;
  const existingSnap = await getDoc(doc(db, 'reports', reportId));
  if (existingSnap.exists()) {
    throw new Error('이미 같은 사유로 신고하셨어요');
  }

  // 신고 사유 라벨 찾기
  const reason = REPORT_REASONS.find(r => r.code === reasonCode);
  const reasonLabel = reason?.label || '기타';

  await setDoc(doc(db, 'reports', reportId), {
    reporterUid,
    reportedUid,
    reasonCode,
    reasonLabel,
    description,
    context,
    status: 'pending', // pending | reviewing | resolved | dismissed
    createdAt: serverTimestamp(),
  });

  return { success: true };
}

/**
 * 내가 신고한 사람인지 확인
 */
export async function hasReported(reporterUid, reportedUid) {
  const q = query(
    collection(db, 'reports'),
    where('reporterUid', '==', reporterUid),
    where('reportedUid', '==', reportedUid)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

// ============================
// 차단 (Block)
// ============================

/**
 * 사용자 차단하기
 * 차단하면: 스와이프/추천에서 안 보임, 채팅 못함
 */
export async function blockUser(blockerUid, blockedUid) {
  if (!blockerUid || !blockedUid) throw new Error('필수 정보 누락');
  if (blockerUid === blockedUid) throw new Error('본인은 차단할 수 없어요');

  const blockId = `${blockerUid}_${blockedUid}`;
  await setDoc(doc(db, 'blocks', blockId), {
    blockerUid,
    blockedUid,
    createdAt: serverTimestamp(),
  });

  return { success: true };
}

/**
 * 차단 해제
 */
export async function unblockUser(blockerUid, blockedUid) {
  const blockId = `${blockerUid}_${blockedUid}`;
  await deleteDoc(doc(db, 'blocks', blockId));
  return { success: true };
}

/**
 * 내가 차단한 사람들 UID 목록 (스와이프/추천에서 제외용)
 */
export async function getBlockedUids(myUid) {
  const q = query(collection(db, 'blocks'), where('blockerUid', '==', myUid));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data().blockedUid);
}

/**
 * 나를 차단한 사람들 UID 목록 (상대방 화면에서도 안 보이게)
 */
export async function getBlockedByUids(myUid) {
  const q = query(collection(db, 'blocks'), where('blockedUid', '==', myUid));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data().blockerUid);
}

/**
 * 내가 차단한 사람들의 프로필 목록 (BlockList 화면용)
 */
export async function getMyBlockedProfiles(myUid) {
  const blockedUids = await getBlockedUids(myUid);
  if (blockedUids.length === 0) return [];

  const profiles = await Promise.all(
    blockedUids.map(async (uid) => {
      const snap = await getDoc(doc(db, 'users', uid));
      return snap.exists() ? { uid, ...snap.data() } : null;
    })
  );
  return profiles.filter(Boolean);
}

/**
 * A가 B를 차단했는지 확인 (단방향)
 */
export async function isBlocked(blockerUid, blockedUid) {
  const blockId = `${blockerUid}_${blockedUid}`;
  const snap = await getDoc(doc(db, 'blocks', blockId));
  return snap.exists();
}

/**
 * 두 사람 사이에 차단이 있는지 (양방향 체크)
 */
export async function hasBlockBetween(uid1, uid2) {
  const [aBlockedB, bBlockedA] = await Promise.all([
    isBlocked(uid1, uid2),
    isBlocked(uid2, uid1),
  ]);
  return aBlockedB || bBlockedA;
}

// ============================
// 관리자용 (Admin)
// ============================

/**
 * 모든 신고 목록 조회 (관리자용)
 */
export async function getAllReports(status = null, limitCount = 100) {
  let q;
  if (status) {
    q = query(
      collection(db, 'reports'),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
  }
  const snap = await getDocs(q);
  return snap.docs.slice(0, limitCount).map(d => ({ id: d.id, ...d.data() }));
}

/**
 * 신고 상태 변경 (관리자용)
 */
export async function updateReportStatus(reportId, newStatus, adminNote = '') {
  await setDoc(doc(db, 'reports', reportId), {
    status: newStatus,
    adminNote,
    resolvedAt: serverTimestamp(),
  }, { merge: true });
  return { success: true };
}