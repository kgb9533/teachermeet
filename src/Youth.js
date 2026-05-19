// src/Youth.js
import React from 'react';
import { BUSINESS_INFO } from './Footer';

export default function Youth({ onBack }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>청소년보호정책</h2>
      </div>

      <div style={styles.content}>
        <p style={styles.intro}>
          <strong>{BUSINESS_INFO.companyName}</strong>(이하 "회사")는 청소년이 건전한 인격체로 성장할 수 있도록
          「청소년 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령을 준수하며,
          다음과 같이 청소년보호정책을 수립·시행합니다.
        </p>
        <p style={styles.meta}>시행일: 2026년 5월 14일</p>

        <h3 style={styles.h3}>1. 청소년의 서비스 이용 제한</h3>
        <div style={styles.box}>
          <p style={{ margin: 0, fontWeight: 700, color: '#C23B22', fontSize: 14 }}>
            본 서비스는 만 19세 이상의 성인만 이용할 수 있습니다.
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 13 }}>
            교원 전용 매칭 서비스의 특성상 「청소년 보호법」 제2조에 따른 청소년(만 19세 미만)의
            가입 및 이용을 일체 허용하지 않습니다.
          </p>
        </div>

        <h3 style={styles.h3}>2. 청소년 가입 차단을 위한 조치</h3>
        <p>회사는 청소년의 부적절한 서비스 이용을 방지하기 위해 다음과 같은 기술적·관리적 조치를 시행합니다.</p>
        <ul style={styles.ul}>
          <li>회원가입 시 휴대폰 본인확인(다날 PASS 인증)을 통한 실명·연령 확인</li>
          <li>본인확인 결과 만 19세 미만인 경우 회원가입 자동 차단</li>
          <li>교원 자격증·재직증명서 제출을 통한 추가 신분 검증</li>
          <li>타인의 정보 도용을 통한 우회 가입이 발견되는 경우 즉시 강제 탈퇴</li>
        </ul>

        <h3 style={styles.h3}>3. 청소년 유해정보로부터의 보호</h3>
        <p>회사는 회원이 게시·전송하는 콘텐츠 중 청소년에게 유해할 수 있는 정보의 유통을 방지하기 위해 다음과 같이 조치합니다.</p>
        <ul style={styles.ul}>
          <li>음란물, 폭력성 콘텐츠, 청소년 유해매체물 등록 시 즉시 삭제</li>
          <li>회원 신고 시스템 운영 (8가지 신고 사유)</li>
          <li>신고 접수된 콘텐츠는 24시간 이내 검토 및 조치</li>
          <li>청소년 보호 의무 위반 회원에 대한 영구 이용정지 조치</li>
        </ul>

        <h3 style={styles.h3}>4. 청소년 보호 책임자</h3>
        <div style={styles.cpoBox}>
          <p style={{ margin: '4px 0', fontSize: 13 }}>
            회사는 청소년 보호 업무를 담당하는 책임자를 두고 있으며, 청소년 유해정보로부터
            청소년을 보호하기 위해 노력하고 있습니다.
          </p>
          <div style={{ marginTop: 10, padding: 10, background: 'white', borderRadius: 8 }}>
            <p style={{ margin: '4px 0' }}><strong>책임자:</strong> {BUSINESS_INFO.cpoName}</p>
            <p style={{ margin: '4px 0' }}><strong>이메일:</strong> {BUSINESS_INFO.cpoEmail}</p>
            <p style={{ margin: '4px 0' }}><strong>전화:</strong> {BUSINESS_INFO.phone}</p>
          </div>
        </div>

        <h3 style={styles.h3}>5. 청소년 보호를 위한 신고·상담</h3>
        <p>서비스 이용 중 청소년 관련 문제를 발견하시거나 청소년이 본 서비스에 노출되었을 가능성이 있는 경우 아래로 신고해주시기 바랍니다.</p>
        <ul style={styles.ul}>
          <li>회사 청소년보호 담당: {BUSINESS_INFO.cpoEmail}</li>
          <li>방송통신심의위원회 (kocsc.or.kr / 1377)</li>
          <li>청소년 사이버상담센터 (cyber1388.kr / 1388)</li>
          <li>한국청소년상담복지개발원 (kyci.or.kr / 1388)</li>
        </ul>

        <h3 style={styles.h3}>6. 임직원 교육</h3>
        <p>회사는 청소년 보호의 중요성을 인식하고 임직원 및 위탁 운영자에게 정기적으로 청소년 보호 관련 교육을 실시하며, 청소년 보호 관련 법령 변경 사항을 지속적으로 모니터링합니다.</p>

        <h3 style={styles.h3}>7. 정책의 변경</h3>
        <p>본 청소년보호정책은 법령·정책의 변경에 따라 개정될 수 있으며, 변경 시 시행일자 및 변경 사유를 명시하여 최소 7일 전에 공지합니다.</p>

        <p style={styles.footer}>
          시행일: 2026년 5월 14일<br />
          {BUSINESS_INFO.companyName} | 청소년보호 책임자: {BUSINESS_INFO.cpoName}
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
  box: {
    background: '#FFF0EB',
    padding: 14,
    borderRadius: 10,
    border: '1.5px solid #FDBCAA',
    margin: '10px 0',
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