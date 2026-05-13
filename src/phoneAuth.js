// src/phoneAuth.js
// 포트원 V2 휴대폰 본인인증 호출 모듈
//
// 작동 순서:
// 1. 사용자가 "휴대폰 인증" 클릭 → 포트원 SDK가 다날 인증창 띄움
// 2. 사용자가 PASS 앱 또는 SMS로 인증 완료
// 3. 클라이언트가 서버(/api/verify-phone)로 검증 요청
// 4. 서버가 포트원 REST API로 진짜 인증되었는지 확인
// 5. 본인인증 정보(이름, 생년월일, 성별, CI, DI) 반환
//
// ⚠️ API 키 발급 후 .env에 아래 값 추가 필요:
//    REACT_APP_PORTONE_STORE_ID=store-xxxxxxxx
//    REACT_APP_PORTONE_DANAL_CHANNEL_KEY=channel-key-xxxxxxxx (다날 채널)

// 포트원 V2 SDK 동적 로드
let portoneLoaded = false;
async function loadPortOneSDK() {
  if (portoneLoaded && window.PortOne) return window.PortOne;
  if (window.PortOne) {
    portoneLoaded = true;
    return window.PortOne;
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.portone.io/v2/browser-sdk.js';
    script.async = true;
    script.onload = () => {
      portoneLoaded = true;
      resolve(window.PortOne);
    };
    script.onerror = () => reject(new Error('포트원 SDK 로드 실패'));
    document.head.appendChild(script);
  });
}

/**
 * 휴대폰 본인인증 요청
 *
 * @returns {Promise<{
 *   verified: boolean,
 *   name: string,        // 본인 이름
 *   phone: string,       // 휴대폰 번호
 *   birthDate: string,   // 생년월일 (YYYY-MM-DD)
 *   gender: 'MALE'|'FEMALE',
 *   ci: string,          // 연계정보 (외부 노출 금지)
 *   di: string,          // 중복가입확인정보
 * }>}
 */
export async function requestPhoneVerification() {
  const storeId = process.env.REACT_APP_PORTONE_STORE_ID;
  const channelKey = process.env.REACT_APP_PORTONE_DANAL_CHANNEL_KEY;

  if (!storeId || !channelKey) {
    throw new Error(
      '본인인증 시스템이 아직 준비되지 않았습니다.\n' +
      '(관리자에게 문의해주세요)'
    );
  }

  // 1) SDK 로드
  const PortOne = await loadPortOneSDK();

  // 2) 고유 인증 ID 생성
  const identityVerificationId = `tm_verify_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // 3) 인증창 호출
  const response = await PortOne.requestIdentityVerification({
    storeId,
    channelKey,
    identityVerificationId,
  });

  // 4) 사용자 취소 또는 실패
  if (response.code !== undefined) {
    throw new Error(response.message || '본인인증이 취소되었습니다.');
  }

  // 5) 서버에서 진짜 인증되었는지 검증
  const verifyRes = await fetch('/api/verify-phone', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identityVerificationId }),
  });

  const verifyData = await verifyRes.json();
  if (!verifyRes.ok || !verifyData.success) {
    throw new Error(verifyData.message || '인증 검증에 실패했습니다.');
  }

  return verifyData.customer;
}