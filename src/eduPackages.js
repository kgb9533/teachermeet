// src/eduPackages.js
// EDU 충전 패키지 정의
// 정책: 1,000원 = 100 EDU

export const EDU_RATE = 0.1; // 1원당 0.1 EDU

export const EDU_PACKAGES = [
  {
    id: 'edu_500',
    name: '소액 충전',
    edu: 500,
    price: 5000,
    badge: null,
    emoji: '🌱',
  },
  {
    id: 'edu_1000',
    name: '기본 충전',
    edu: 1000,
    price: 10000,
    badge: null,
    emoji: '☕',
  },
  {
    id: 'edu_3000',
    name: '인기 충전',
    edu: 3000,
    price: 30000,
    badge: 'POPULAR',
    emoji: '🔥',
  },
  {
    id: 'edu_5000',
    name: '실속 충전',
    edu: 5000,
    price: 50000,
    badge: null,
    emoji: '💎',
  },
  {
    id: 'edu_10000',
    name: '대용량 충전',
    edu: 10000,
    price: 100000,
    badge: 'BEST',
    emoji: '👑',
  },
];

// EDU 사용처별 소모량 정의 (나중에 자유롭게 조정 가능)
export const EDU_COSTS = {
  SUPER_LIKE: 50,         // 슈퍼좋아요 1회
  BOOST_1H: 100,          // 1시간 부스트
  PROFILE_VIEW: 30,       // 프로필 열람 1회
  SEND_MESSAGE_FIRST: 80, // 매칭 전 메시지 먼저 보내기
  PROFILE_HIGHLIGHT: 200, // 추천 노출 강조 (24시간)
};

// 사용처 라벨 (거래내역 표시용)
export const EDU_REASON_LABELS = {
  charge: '에듀 충전',
  SUPER_LIKE: '슈퍼좋아요 사용',
  BOOST_1H: '1시간 부스트',
  PROFILE_VIEW: '프로필 열람',
  SEND_MESSAGE_FIRST: '메시지 먼저 보내기',
  PROFILE_HIGHLIGHT: '프로필 강조',
  refund: '환불 처리',
  admin_grant: '관리자 지급',
};