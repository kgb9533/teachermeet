// src/Privacy.js
import React from 'react';
import { BUSINESS_INFO } from './Footer';

export default function Privacy({ onBack }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>개인정보처리방침</h2>
      </div>

      <div style={styles.content}>
        <p style={styles.intro}>
          <strong>{BUSINESS_INFO.companyName}</strong>(이하 "회사")는 「개인정보 보호법」 등 관련 법령을 준수하며,
          이용자(이하 "회원")의 개인정보 보호 및 권익 보호를 위해 다음과 같이 개인정보처리방침을 수립·공개합니다.
        </p>
        <p style={styles.meta}>시행일: 2026년 5월 14일</p>

        <h3 style={styles.h3}>1. 수집하는 개인정보 항목 및 수집 방법</h3>
        <p>회사는 다음의 개인정보 항목을 수집합니다.</p>
        <ul style={styles.ul}>
          <li><strong>회원가입·본인확인:</strong> 이메일, 비밀번호, 휴대전화번호, 성명, 생년월일, 성별</li>
          <li><strong>프로필:</strong> 닉네임, 소속 학교/교과목, 거주지역, 프로필 사진, 자기소개, 관심사</li>
          <li><strong>교원 인증:</strong> 교원자격증, 재직증명서, 학생증 등 신분 증빙 자료 (민감정보)</li>
          <li><strong>결제·EDU 충전:</strong> 결제 수단 정보, 결제 내역, 거래 ID</li>
          <li><strong>자동 수집:</strong> 접속 IP, 쿠키, 서비스 이용기록, 기기정보(OS, 브라우저), 푸시 토큰</li>
        </ul>
        <p>수집 방법: 회원가입·인증·결제 과정의 직접 입력, 서비스 이용 중 자동 생성·수집</p>

        <h3 style={styles.h3}>2. 개인정보의 수집 및 이용 목적</h3>
        <ul style={styles.ul}>
          <li>회원 식별 및 본인 확인, 부정 가입·이용 방지</li>
          <li>교원 신분 확인을 통한 서비스 가입자격 검증</li>
          <li>매칭 추천, 채팅, 알림 등 서비스 제공</li>
          <li>EDU 충전·소모 및 결제, 거래 분쟁 대응, 환불 처리</li>
          <li>고객 문의 응대, 공지사항 전달</li>
          <li>서비스 개선, 신규 기능 개발을 위한 통계 분석(개인 식별 불가능한 형태)</li>
          <li>법령 또는 약관 위반 행위에 대한 조치</li>
        </ul>

        <h3 style={styles.h3}>3. 개인정보의 보유 및 이용기간</h3>
        <p>회사는 회원의 개인정보를 원칙적으로 회원 탈퇴 시 즉시 파기합니다. 다만, 관련 법령에 따라 보존이 필요한 경우 아래 기간 동안 보관합니다.</p>
        <ul style={styles.ul}>
          <li>계약 또는 청약철회 등에 관한 기록: <strong>5년</strong> (전자상거래법)</li>
          <li>대금결제 및 재화 등의 공급에 관한 기록: <strong>5년</strong> (전자상거래법)</li>
          <li>소비자 불만 또는 분쟁 처리에 관한 기록: <strong>3년</strong> (전자상거래법)</li>
          <li>표시·광고에 관한 기록: <strong>6개월</strong> (전자상거래법)</li>
          <li>웹사이트 방문 기록: <strong>3개월</strong> (통신비밀보호법)</li>
          <li>부정이용 기록: <strong>1년</strong> (재가입 차단 목적)</li>
        </ul>

        <h3 style={styles.h3}>4. 민감정보의 처리</h3>
        <p>회사는 교원 인증을 위해 자격증·재직증명서 등 민감정보를 수집하며, 다음과 같이 처리합니다.</p>
        <ul style={styles.ul}>
          <li>수집 즉시 암호화 저장, 인증 담당자 외 접근 불가</li>
          <li>인증 완료 후 <strong>30일 이내 원본 파기</strong> (인증 결과만 보관)</li>
          <li>회원 탈퇴 시 즉시 파기</li>
        </ul>

        <h3 style={styles.h3}>5. 개인정보의 제3자 제공</h3>
        <p>회사는 회원의 개인정보를 본 방침에서 고지한 범위 내에서 사용하며, 회원의 사전 동의 없이는 제3자에게 제공하지 않습니다. 단, 다음의 경우는 예외로 합니다.</p>
        <ul style={styles.ul}>
          <li>회원이 사전에 동의한 경우</li>
          <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차에 따라 수사기관의 요구가 있는 경우</li>
        </ul>

        <h3 style={styles.h3}>6. 개인정보 처리의 위탁</h3>
        <p>회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다.</p>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tr}>
              <th style={styles.th}>수탁사</th>
              <th style={styles.th}>위탁 업무</th>
            </tr>
          </thead>
          <tbody>
            <tr style={styles.tr}><td style={styles.td}>Google Firebase</td><td style={styles.td}>회원정보 저장, 인증, 데이터베이스 운영</td></tr>
            <tr style={styles.tr}><td style={styles.td}>Cloudinary</td><td style={styles.td}>프로필 사진 등 이미지 저장 및 전송</td></tr>
            <tr style={styles.tr}><td style={styles.td}>포트원(PortOne)</td><td style={styles.td}>결제 처리 및 결제 정보 검증</td></tr>
            <tr style={styles.tr}><td style={styles.td}>KG이니시스, 카카오페이</td><td style={styles.td}>신용카드·간편결제 처리</td></tr>
            <tr style={styles.tr}><td style={styles.td}>Vercel</td><td style={styles.td}>웹 호스팅 및 서비스 운영</td></tr>
          </tbody>
        </table>

        <h3 style={styles.h3}>7. 회원의 권리와 행사 방법</h3>
        <p>회원은 언제든지 다음의 권리를 행사할 수 있습니다.</p>
        <ul style={styles.ul}>
          <li>개인정보 열람·정정·삭제·처리정지 요청</li>
          <li>회원 탈퇴 (서비스 내 설정 메뉴 또는 {BUSINESS_INFO.email})</li>
          <li>본인 동의 철회</li>
        </ul>

        <h3 style={styles.h3}>8. 개인정보의 파기 절차 및 방법</h3>
        <ul style={styles.ul}>
          <li>전자적 파일: 복구 불가능한 방법으로 영구 삭제</li>
          <li>출력물: 분쇄 또는 소각</li>
          <li>법령 보존 기간이 경과한 경우 지체 없이 파기</li>
        </ul>

        <h3 style={styles.h3}>9. 개인정보의 안전성 확보 조치</h3>
        <ul style={styles.ul}>
          <li>관리적: 개인정보 처리 직원 최소화, 정기 교육 실시</li>
          <li>기술적: 비밀번호 암호화 저장, 전송구간 SSL/TLS 적용, 접근권한 관리, 침입탐지 시스템 운영</li>
          <li>물리적: 데이터센터 출입 통제 (Firebase·Vercel·Cloudinary 인프라 활용)</li>
        </ul>

        <h3 style={styles.h3}>10. 쿠키의 운영</h3>
        <p>회사는 로그인 유지, 서비스 이용 통계 등을 위해 쿠키를 사용합니다. 회원은 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 일부 서비스 이용에 제한이 있을 수 있습니다.</p>

        <h3 style={styles.h3}>11. 개인정보보호책임자</h3>
        <div style={styles.cpoBox}>
          <p style={{ margin: '4px 0' }}><strong>책임자:</strong> {BUSINESS_INFO.cpoName}</p>
          <p style={{ margin: '4px 0' }}><strong>이메일:</strong> {BUSINESS_INFO.cpoEmail}</p>
          <p style={{ margin: '4px 0' }}><strong>전화:</strong> {BUSINESS_INFO.phone}</p>
        </div>

        <h3 style={styles.h3}>12. 권익침해 구제 방법</h3>
        <p>개인정보 침해로 인한 신고나 상담이 필요한 경우 아래 기관에 문의할 수 있습니다.</p>
        <ul style={styles.ul}>
          <li>개인정보분쟁조정위원회 (kopico.go.kr / 1833-6972)</li>
          <li>개인정보침해신고센터 (privacy.kisa.or.kr / 국번없이 118)</li>
          <li>대검찰청 사이버수사과 (spo.go.kr / 1301)</li>
          <li>경찰청 사이버수사국 (ecrm.cyber.go.kr / 국번없이 182)</li>
        </ul>

        <h3 style={styles.h3}>13. 개인정보처리방침의 변경</h3>
        <p>본 방침은 시행일로부터 적용되며, 법령·정책 또는 보안기술의 변경에 따라 내용의 추가·삭제 및 수정이 있을 시에는 변경되는 개인정보처리방침을 시행하기 최소 7일 전에 공지합니다.</p>

        <p style={styles.footer}>
          시행일: 2026년 5월 14일<br />
          {BUSINESS_INFO.companyName}
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#FFF8F5',
    fontFamily: 'Nunito, sans-serif',
    color: '#3D1008',
    paddingBottom: 80,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    background: '#fff',
    borderBottom: '1px solid #FDBCAA',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    fontSize: 24,
    cursor: 'pointer',
    color: '#3D1008',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 700,
    margin: 0,
  },
  content: {
    padding: '20px 18px',
    fontSize: 14,
    lineHeight: 1.7,
  },
  intro: {
    background: '#FFF0EB',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
    color: '#9C5A4A',
    marginBottom: 24,
  },
  h3: {
    fontSize: 15,
    color: '#C23B22',
    marginTop: 28,
    marginBottom: 8,
  },
  ul: {
    paddingLeft: 20,
    margin: '8px 0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    margin: '10px 0',
    fontSize: 13,
  },
  tr: {
    borderBottom: '1px solid #FDBCAA',
  },
  th: {
    textAlign: 'left',
    padding: 8,
    background: '#FFF0EB',
    color: '#C23B22',
  },
  td: {
    padding: 8,
    verticalAlign: 'top',
  },
  cpoBox: {
    background: '#FFF0EB',
    padding: 14,
    borderRadius: 10,
    fontSize: 13,
  },
  footer: {
    marginTop: 40,
    padding: 14,
    background: '#FFF0EB',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 13,
  },
};