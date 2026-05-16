// src/eduWallet.js
// EDU 가상화폐 핵심 로직
// - 잔액 조회 (실시간 구독 포함)
// - 소모(spend): 트랜잭션으로 잔액 차감 + 거래내역 기록
// - 거래내역 조회

import { db } from './firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { EDU_REASON_LABELS } from './eduPackages';

/**
 * 내 EDU 잔액 1회 조회
 */
export async function getEduBalance(uid) {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return 0;
  return snap.data().eduBalance || 0;
}

/**
 * 내 EDU 잔액 실시간 구독
 * @returns unsubscribe 함수
 */
export function subscribeEduBalance(uid, callback) {
  const userRef = doc(db, 'users', uid);
  return onSnapshot(userRef, (snap) => {
    if (!snap.exists()) {
      callback(0);
      return;
    }
    callback(snap.data().eduBalance || 0);
  });
}

/**
 * EDU 소모 (슈퍼좋아요, 부스트 등)
 * 트랜잭션으로 잔액 부족 시 throw, 성공 시 거래내역도 함께 기록
 *
 * @param {string} uid - 사용자 UID
 * @param {number} amount - 소모할 EDU (양수)
 * @param {string} reasonCode - EDU_COSTS 키 (예: 'SUPER_LIKE')
 * @param {object} meta - 추가 메타데이터 (예: { targetUid: 'xxx' })
 * @returns {Promise<{newBalance: number, txId: string}>}
 * @throws Error('INSUFFICIENT_EDU') - 잔액 부족 시
 */
export async function spendEdu(uid, amount, reasonCode, meta = {}) {
  if (!uid) throw new Error('NO_UID');
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('INVALID_AMOUNT');

  const userRef = doc(db, 'users', uid);
  const txCol = collection(db, 'eduTransactions');
  const txRef = doc(txCol); // 자동 ID

  const result = await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) throw new Error('USER_NOT_FOUND');

    const currentBalance = userSnap.data().eduBalance || 0;
    if (currentBalance < amount) throw new Error('INSUFFICIENT_EDU');

    const newBalance = currentBalance - amount;

    transaction.update(userRef, { eduBalance: newBalance });
    transaction.set(txRef, {
      uid,
      type: 'spend',
      amount: -amount, // 음수로 기록 (차감)
      balanceAfter: newBalance,
      reasonCode,
      reasonLabel: EDU_REASON_LABELS[reasonCode] || reasonCode,
      meta,
      status: 'completed',
      createdAt: serverTimestamp(),
    });

    return { newBalance, txId: txRef.id };
  });

  return result;
}

/**
 * 내 거래내역 조회 (최근 N건)
 */
export async function getMyTransactions(uid, count = 30) {
  const q = query(
    collection(db, 'eduTransactions'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * 거래내역 실시간 구독
 */
export function subscribeMyTransactions(uid, count, callback) {
  const q = query(
    collection(db, 'eduTransactions'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(count)
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(list);
  });
}

/**
 * 사용처별 EDU가 충분한지 사전 체크 (UI 비활성화용)
 */
export async function hasEnoughEdu(uid, amount) {
  const balance = await getEduBalance(uid);
  return balance >= amount;
}