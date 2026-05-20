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
};