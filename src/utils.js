// src/utils.js
// 다중 선택 호환을 위한 헬퍼 함수들
// 기존 단일값 데이터와 새 배열값 데이터 모두 자연스럽게 처리

/**
 * 어떤 값이든 배열로 변환
 * - 배열이면 그대로
 * - 문자열이면 [문자열]
 * - null/undefined/빈문자열이면 []
 * 
 * 예시:
 *   toArray("서울")       → ["서울"]
 *   toArray(["서울", "경기"]) → ["서울", "경기"]
 *   toArray("")            → []
 *   toArray(null)          → []
 */
export const toArray = (val) => {
  if (Array.isArray(val)) return val;
  if (val === null || val === undefined || val === '') return [];
  return [val];
};

/**
 * 배열/단일값을 화면 표시용 문자열로 변환
 * - 빈 값이면 빈 문자열 ""
 * - 배열이면 separator로 구분 (기본값: ", ")
 * 
 * 예시:
 *   displayList(["서울", "경기"])     → "서울, 경기"
 *   displayList("서울")               → "서울"
 *   displayList(["서울", "경기"], " · ") → "서울 · 경기"
 *   displayList(null)                 → ""
 */
export const displayList = (val, separator = ', ') => {
  return toArray(val).join(separator);
};

/**
 * 두 값(배열 또는 단일값)에서 공통 항목 찾기
 * - 양쪽 모두 자동으로 배열 변환 후 교집합 계산
 * 
 * 예시:
 *   commonItems(["서울", "경기"], ["경기", "인천"]) → ["경기"]
 *   commonItems("서울", "서울")                      → ["서울"]
 *   commonItems("서울", ["서울", "경기"])             → ["서울"]
 *   commonItems(null, ["서울"])                       → []
 */
export const commonItems = (a, b) => {
  const arrA = toArray(a);
  const arrB = toArray(b);
  return arrA.filter(item => arrB.includes(item));
};

/**
 * 값이 비어있는지 확인 (배열이든 단일값이든)
 * 
 * 예시:
 *   isEmpty([])         → true
 *   isEmpty("")         → true
 *   isEmpty(null)       → true
 *   isEmpty(["서울"])    → false
 *   isEmpty("서울")      → false
 */
export const isEmpty = (val) => {
  return toArray(val).length === 0;
};

/**
 * 짧게 표시 (3개까지만 보이고 나머지는 "외 N")
 * - 카드 같은 좁은 공간에서 유용
 * 
 * 예시:
 *   displayShort(["서울", "경기", "인천", "부산"])     → "서울, 경기, 인천 외 1"
 *   displayShort(["서울"])                            → "서울"
 *   displayShort(["서울", "경기"])                    → "서울, 경기"
 *   displayShort(["서울", "경기", "인천"])             → "서울, 경기, 인천"
 */
export const displayShort = (val, maxItems = 3) => {
  const arr = toArray(val);
  if (arr.length === 0) return '';
  if (arr.length <= maxItems) return arr.join(', ');
  return arr.slice(0, maxItems).join(', ') + ` 외 ${arr.length - maxItems}`;
}
/**
 * 두 좌표 사이의 거리 계산 (km)
 * Haversine 공식 사용
 */
export function getDistance(lat1, lng1, lat2, lng2) {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null;
  const R = 6371; // 지구 반지름 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 거리(km)를 카테고리 라벨로 변환
 * @returns { label, emoji, bgColor, textColor } 또는 null (위치 없으면)
 */
export function getDistanceLabel(km) {
  if (km === null || km === undefined) return null;
  if (km < 10) {
    return {
      label: '가까워요',
      emoji: '🏃',
      bgColor: '#DCFCE7',
      textColor: '#166534',
    };
  }
  if (km < 30) {
    return {
      label: '차로 30분',
      emoji: '🚗',
      bgColor: '#FEF3C7',
      textColor: '#92400E',
    };
  }
  if (km < 100) {
    return {
      label: '같은 권역',
      emoji: '🚄',
      bgColor: '#FFF0EB',
      textColor: '#C23B22',
    };
  }
  return {
    label: '멀어요',
    emoji: '✈️',
    bgColor: '#FEE2E2',
    textColor: '#991B1B',
  };
}

/**
 * 두 사용자 프로필 사이의 거리 뱃지 정보를 한 번에 반환
 * 둘 중 하나라도 위치 정보 없으면 null
 */
export function getDistanceBadge(myProfile, theirProfile) {
  if (!myProfile?.lat || !myProfile?.lng) return null;
  if (!theirProfile?.lat || !theirProfile?.lng) return null;
  const km = getDistance(myProfile.lat, myProfile.lng, theirProfile.lat, theirProfile.lng);
  return getDistanceLabel(km);
}