// src/stats.js
// 프로필 통계 계산 헬퍼

import { db } from './firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  query,
  where,
} from 'firebase/firestore';

/**
 * 사용자의 프로필 인사이트 계산
 * @param {string} userUid - 내 UID
 * @returns {Object} 통계 객체
 */
export async function calculateInsights(userUid) {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // 1) 좋아요 데이터
    const likesSnap = await getDocs(collection(db, 'likes'));
    const likesData = likesSnap.docs.map(d => d.data());

    const likesReceived = likesData.filter(l => l.to === userUid);
    const likesGiven = likesData.filter(l => l.from === userUid);

    // 이번 주 좋아요 받은 수
    const weeklyLikes = likesReceived.filter(l => {
      const date = l.createdAt?.toDate ? l.createdAt.toDate() : new Date(l.createdAt);
      return date > oneWeekAgo;
    }).length;

    // 2) 인기 시간대 분석 (좋아요 받은 시간대)
    const hourBuckets = new Array(24).fill(0);
    likesReceived.forEach(l => {
      const date = l.createdAt?.toDate ? l.createdAt.toDate() : new Date(l.createdAt);
      const hour = date.getHours();
      hourBuckets[hour]++;
    });

    // 가장 인기 있는 시간대 찾기
    let peakHour = -1;
    let peakCount = 0;
    hourBuckets.forEach((count, hour) => {
      if (count > peakCount) {
        peakCount = count;
        peakHour = hour;
      }
    });

    const peakHourLabel = formatPeakHour(peakHour);

    // 3) 프로필 조회수 (이번 주)
    let weeklyViews = 0;
    try {
      const viewsQuery = query(
        collection(db, 'views'),
        where('viewedUid', '==', userUid)
      );
      const viewsSnap = await getDocs(viewsQuery);
      const viewsData = viewsSnap.docs.map(d => d.data());
      weeklyViews = viewsData.filter(v => {
        const date = v.viewedAt?.toDate ? v.viewedAt.toDate() : new Date(v.viewedAt);
        return date > oneWeekAgo;
      }).length;
    } catch (e) {
      // views 컬렉션이 없으면 0
      weeklyViews = 0;
    }

    // 4) 호감도 계산 (좋아요 받은 수 ÷ 프로필 조회 수)
    // 전체 사용자 대비 상위 N% 계산
    const usersSnap = await getDocs(collection(db, 'users'));
    const totalUsers = usersSnap.docs.length;

    // 전체 사용자별 좋아요 받은 수 분포
    const likeCountsByUser = {};
    likesData.forEach(l => {
      likeCountsByUser[l.to] = (likeCountsByUser[l.to] || 0) + 1;
    });

    const myLikeCount = likesReceived.length;
    const usersWithFewerLikes = Object.values(likeCountsByUser).filter(c => c < myLikeCount).length;
    const percentile = totalUsers > 0
      ? Math.max(1, Math.round(100 - (usersWithFewerLikes / totalUsers) * 100))
      : 99;

    // 5) 매칭 통계
    const matchesSnap = await getDocs(collection(db, 'matches'));
    const myMatches = matchesSnap.docs.filter(d => d.data().users?.includes(userUid));
    const totalMatches = myMatches.length;

    // 매칭 변환율 (좋아요 → 매칭 비율)
    const matchRate = likesGiven.length > 0
      ? Math.round((totalMatches / likesGiven.length) * 100)
      : 0;

    return {
      weeklyLikes,
      totalLikesReceived: likesReceived.length,
      totalLikesGiven: likesGiven.length,
      totalMatches,
      weeklyViews,
      peakHour,
      peakHourLabel,
      percentile,
      matchRate,
      hourBuckets,
    };
  } catch (e) {
    console.error('인사이트 계산 오류:', e);
    return null;
  }
}

/**
 * 시간대를 한국어로 변환
 */
function formatPeakHour(hour) {
  if (hour === -1) return '아직 데이터가 부족해요';
  if (hour >= 6 && hour < 12) return `오전 ${hour}시`;
  if (hour >= 12 && hour < 18) return `오후 ${hour === 12 ? 12 : hour - 12}시`;
  if (hour >= 18 && hour < 24) return `저녁 ${hour - 12}시`;
  return `새벽 ${hour}시`;
}

/**
 * 프로필 조회 기록 (Swipe.js에서 호출)
 * 같은 사람이 24시간 내 여러 번 봐도 1번만 기록
 */
export async function recordProfileView(viewerUid, viewedUid) {
  if (!viewerUid || !viewedUid || viewerUid === viewedUid) return;
  try {
    // 하루 단위 ID로 중복 방지 (한 사람이 하루에 한 번만 기록)
    const today = new Date().toISOString().split('T')[0]; // 2026-05-18
    const viewId = `${viewerUid}_${viewedUid}_${today}`;

    await setDoc(doc(db, 'views', viewId), {
      viewerUid,
      viewedUid,
      viewedAt: new Date(),
      date: today,
    });
  } catch (e) {
    console.error('조회 기록 오류:', e);
  }
}