// api/verify-phone.js
// Vercel Serverless Function - 포트원 휴대폰 본인인증 서버 검증
//
// 흐름:
// 1. 클라이언트가 인증 완료 후 { identityVerificationId } 전송
// 2. 포트원 REST API로 진짜 인증되었는지 조회 (위변조 방지)
// 3. 검증 통과하면 본인인증 정보 반환 (이름, 생년월일, 성별, CI, DI)
// 4. 클라이언트는 이 정보로 회원가입/로그인 진행
//
// ⚠️ 필요 환경변수 (Vercel 대시보드 또는 .env.local):
//    PORTONE_API_SECRET=v2-api-secret-xxx

export default async function handler(req, res) {
  // POST만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { identityVerificationId } = req.body;
  if (!identityVerificationId) {
    return res.status(400).json({ success: false, message: '필수 파라미터 누락' });
  }

  try {
    // 포트원 REST API로 본인인증 정보 조회
    const portoneRes = await fetch(
      `https://api.portone.io/identity-verifications/${encodeURIComponent(identityVerificationId)}`,
      {
        headers: {
          Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
        },
      }
    );

    if (!portoneRes.ok) {
      const text = await portoneRes.text();
      console.error('포트원 본인인증 조회 실패:', text);
      return res.status(400).json({
        success: false,
        message: '본인인증 조회에 실패했습니다.',
      });
    }

    const verification = await portoneRes.json();

    // 인증 상태 확인
    if (verification.status !== 'VERIFIED') {
      return res.status(400).json({
        success: false,
        message: `본인인증이 완료되지 않았습니다 (상태: ${verification.status})`,
      });
    }

    // 본인인증 정보 추출
    const customer = verification.verifiedCustomer;

    // 만 19세 이상 체크 (데이팅 앱 필수)
    const birthDate = new Date(customer.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 19) {
      return res.status(403).json({
        success: false,
        message: '만 19세 이상만 가입할 수 있습니다.',
      });
    }

    // 검증 통과 → 본인인증 정보 반환
    return res.status(200).json({
      success: true,
      customer: {
        verified: true,
        name: customer.name,
        phone: customer.phoneNumber,
        birthDate: customer.birthDate, // YYYY-MM-DD
        gender: customer.gender,        // 'MALE' | 'FEMALE'
        ci: customer.ci,
        di: customer.di,
        age,
      },
    });
  } catch (err) {
    console.error('verify-phone error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || '서버 오류',
    });
  }
}