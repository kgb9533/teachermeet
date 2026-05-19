// src/BusinessInfo.js
import React from 'react';
import { BUSINESS_INFO } from './Footer';

export default function BusinessInfo({ onBack }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>사업자 정보</h2>
      </div>

      <div style={styles.content}>
        <p style={styles.intro}>
          <strong>{BUSINESS_INFO.companyName}</strong>의 사업자 정보를 안내해드립니다.
          본 정보는 「전자상거래 등에서의 소비자보호에 관한 법률」 제10조에 따라 공개됩니다.
        </p>
        <p style={styles.meta}>최종 업데이트: 2026년 5월 14일</p>

        {/* 회사 정보 카드 */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>🏢 회사 정보</div>
          <table style={styles.table}>
            <tbody>
              <tr style={styles.tr}>
                <td style={styles.tdLabel}>상호명</td>
                <td style={styles.tdValue}>{BUSINESS_INFO.companyName}</td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.tdLabel}>서비스명</td>
                <td style={styles.tdValue}>티처밋 (TeacherMeet)</td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.tdLabel}>대표자</td>
                <td style={styles.tdValue}>{BUSINESS_INFO.representativeName}</td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.tdLabel}>사업자등록번호</td>
                <td style={styles.tdValue}>{BUSINESS_INFO.businessNumber}</td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.tdLabel}>통신판매업 신고번호</td>
                <td style={styles.tdValue}>{BUSINESS_INFO.mailOrderNumber}</td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.tdLabel}>업태</td>
                <td style={styles.tdValue}>정보통신업</td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.tdLabel}>종목</td>
                <td style={styles.tdValue}>응용 소프트웨어 개발 및 공급업</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 연락처 카드 */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>📞 연락처</div>
          <table style={styles.table}>
            <tbody>
              <tr style={styles.tr}>
                <td style={styles.tdLabel}>사업장 주소</td>
                <td style={styles.tdValue}>{BUSINESS_INFO.address}</td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.tdLabel}>대표 전화</td>
                <td style={styles.tdValue}>
                  <a href={`tel:${BUSINESS_INFO.phone}`} style={styles.link}>{BUSINESS_INFO.phone}</a>
                </td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.tdLabel}>고객 문의 이메일</td>
                <td style={styles.tdValue}>
                  <a href={`mailto:${BUSINESS_INFO.email}`} style={styles.link}>{BUSINESS_INFO.email}</a>
                </td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.tdLabel}>운영시간</td>
                <td style={styles.tdValue}>평일 10:00 ~ 18:00<br />(점심시간 12:00 ~ 13:00 / 주말·공휴일 휴무)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 책임자 카드 */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>🛡️ 책임자 정보</div>
          <table style={styles.table}>
            <tbody>
              <tr style={styles.tr}>
                <td style={styles.tdLabel}>개인정보보호책임자</td>
                <td style={styles.tdValue}>{BUSINESS_INFO.cpoName}</td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.tdLabel}>위치정보관리책임자</td>
                <td style={styles.tdValue}>{BUSINESS_INFO.cpoName}</td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.tdLabel}>청소년보호책임자</td>
                <td style={styles.tdValue}>{BUSINESS_INFO.cpoName}</td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.tdLabel}>책임자 이메일</td>
                <td style={styles.tdValue}>
                  <a href={`mailto:${BUSINESS_INFO.cpoEmail}`} style={styles.link}>{BUSINESS_INFO.cpoEmail}</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 결제 및 환불 카드 */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>💳 결제 및 환불</div>
          <p style={styles.cardText}>
            본 서비스의 유료 결제는 PG사(KG이니시스·카카오페이)를 통해 안전하게 처리되며,
            결제 및 환불 관련 자세한 사항은 <strong>「결제 및 환불정책」</strong>을 참고해주세요.
          </p>
          <ul style={styles.ul}>
            <li>결제 수단: 신용·체크카드, 카카오페이</li>
            <li>충전 비율: 1,000원 = 100 EDU (VAT 포함)</li>
            <li>청약 철회: 결제일로부터 7일 이내, 미사용 EDU에 한해 전액 환불</li>
          </ul>
        </div>

        {/* 호스팅 및 위탁 카드 */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>🌐 인프라 및 위탁업체</div>
          <table style={styles.table}>
            <tbody>
              <tr style={styles.tr}>
                <td style={styles.tdLabel}>호스팅 제공자</td>
                <td style={styles.tdValue}>Vercel Inc. (미국)</td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.tdLabel}>데이터베이스·인증</td>
                <td style={styles.tdValue}>Google Firebase</td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.tdLabel}>이미지 저장</td>
                <td style={styles.tdValue}>Cloudinary</td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.tdLabel}>본인인증</td>
                <td style={styles.tdValue}>다날 (DANAL)</td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.tdLabel}>결제 대행</td>
                <td style={styles.tdValue}>포트원, KG이니시스, 카카오페이</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 도메인 정보 */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>🔗 공식 도메인</div>
          <p style={styles.cardText}>
            티처밋은 다음의 공식 도메인을 통해서만 서비스를 제공합니다. 유사 도메인 주의!
          </p>
          <ul style={styles.ul}>
            <li><a href="https://www.teachermeet.co.kr" style={styles.link} target="_blank" rel="noopener noreferrer">www.teachermeet.co.kr</a></li>
            <li><a href="https://teachermeet.vercel.app" style={styles.link} target="_blank" rel="noopener noreferrer">teachermeet.vercel.app</a></li>
          </ul>
        </div>

        {/* 사업자 정보 확인 안내 */}
        <div style={styles.verifyBox}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#C23B22', marginBottom: 8 }}>
            ✓ 사업자 정보 확인 안내
          </div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7 }}>
            본 사업자의 정보는 국세청 홈택스(<a href="https://www.hometax.go.kr" style={styles.link} target="_blank" rel="noopener noreferrer">hometax.go.kr</a>)
            에서 사업자등록번호로 조회할 수 있으며, 통신판매업 신고 정보는 공정거래위원회 사업자정보 조회 시스템
            (<a href="https://www.ftc.go.kr/bizCommPop.do" style={styles.link} target="_blank" rel="noopener noreferrer">ftc.go.kr</a>)
            에서 확인하실 수 있습니다.
          </p>
        </div>

        <p style={styles.footer}>
          최종 업데이트: 2026년 5월 14일<br />
          © 2026 {BUSINESS_INFO.companyName}. All rights reserved.
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
  card: {
    background: 'white',
    border: '1.5px solid #FDBCAA',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#C23B22',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottom: '1px solid #FDBCAA',
  },
  cardText: {
    fontSize: 13,
    lineHeight: 1.7,
    margin: '0 0 10px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  tr: {
    borderBottom: '1px solid #FFF0EB',
  },
  tdLabel: {
    padding: '8px 4px',
    color: '#9C5A4A',
    fontWeight: 600,
    width: '40%',
    verticalAlign: 'top',
    fontSize: 12,
  },
  tdValue: {
    padding: '8px 4px',
    color: '#3D1008',
    verticalAlign: 'top',
    lineHeight: 1.6,
  },
  ul: {
    paddingLeft: 20,
    margin: '8px 0 0',
    fontSize: 13,
    lineHeight: 1.8,
  },
  link: {
    color: '#E8603A',
    textDecoration: 'none',
    fontWeight: 600,
  },
  verifyBox: {
    background: '#FFF0EB',
    padding: 14,
    borderRadius: 10,
    border: '1.5px solid #FDBCAA',
    margin: '20px 0',
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