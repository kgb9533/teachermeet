// src/Pricing.js
import React from 'react';
import { EDU_PACKAGES, EDU_COSTS } from './eduPackages';
import { BUSINESS_INFO } from './Footer';

export default function Pricing({ onBack, onCharge }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>요금 안내</h2>
      </div>

      <div style={styles.content}>
        {/* 인트로 */}
        <section style={styles.section}>
          <h3 style={styles.h3}>티처밋 에듀(EDU) 충전 안내</h3>
          <p style={styles.para}>
            티처밋은 회원에게 더 풍부한 매칭 경험을 제공하기 위해 가상화폐 <strong>'EDU'</strong>를 운영합니다.
            EDU는 슈퍼좋아요, 프로필 부스트, 프로필 열람권 등 다양한 프리미엄 기능에 사용할 수 있습니다.
          </p>
          <div style={styles.rateBox}>
            <div style={styles.rateLabel}>기본 충전 비율</div>
            <div style={styles.rateValue}>1,000원 = 100 EDU</div>
            <div style={styles.rateSub}>VAT 포함 / 결제 즉시 충전</div>
          </div>
        </section>

        {/* 충전 패키지 표 */}
        <section style={styles.section}>
          <h3 style={styles.h3}>충전 패키지 (단위: 원, KRW)</h3>
          <table style={styles.table}>
            <thead>
              <tr style={styles.trHead}>
                <th style={styles.th}>패키지</th>
                <th style={styles.th}>충전량</th>
                <th style={styles.th}>가격</th>
                <th style={styles.th}>비고</th>
              </tr>
            </thead>
            <tbody>
              {EDU_PACKAGES.map((pkg) => (
                <tr key={pkg.id} style={styles.tr}>
                  <td style={styles.td}>{pkg.emoji} {pkg.name}</td>
                  <td style={styles.td}>{pkg.edu.toLocaleString()} EDU</td>
                  <td style={{ ...styles.td, fontWeight: 700, color: '#E8603A' }}>
                    {pkg.price.toLocaleString()} 원
                  </td>
                  <td style={styles.td}>
                    {pkg.badge === 'POPULAR' ? '🔥 인기' : pkg.badge === 'BEST' ? '⭐ BEST' : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={styles.notice}>
            * 모든 가격은 부가가치세(VAT)가 포함된 금액입니다.<br />
            * 결제 수단: 신용/체크카드, 카카오페이, 계좌이체 등 (포트원 결제 시스템 이용)
          </p>
        </section>

        {/* EDU 사용처별 가격 */}
        <section style={styles.section}>
          <h3 style={styles.h3}>EDU 사용처</h3>
          <table style={styles.table}>
            <thead>
              <tr style={styles.trHead}>
                <th style={styles.th}>기능</th>
                <th style={styles.th}>소모 EDU</th>
                <th style={styles.th}>환산 가격</th>
              </tr>
            </thead>
            <tbody>
              <tr style={styles.tr}>
                <td style={styles.td}>🧡 슈퍼좋아요 (1회)</td>
                <td style={styles.td}>{EDU_COSTS.SUPER_LIKE} EDU</td>
                <td style={styles.td}>{(EDU_COSTS.SUPER_LIKE * 10).toLocaleString()} 원</td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.td}>🚀 부스트 (1시간 추천 상단 노출)</td>
                <td style={styles.td}>{EDU_COSTS.BOOST_1H} EDU</td>
                <td style={styles.td}>{(EDU_COSTS.BOOST_1H * 10).toLocaleString()} 원</td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.td}>👀 프로필 열람권 (1회)</td>
                <td style={styles.td}>{EDU_COSTS.PROFILE_VIEW} EDU</td>
                <td style={styles.td}>{(EDU_COSTS.PROFILE_VIEW * 10).toLocaleString()} 원</td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.td}>💬 메시지 먼저 보내기 (매칭 전 1회)</td>
                <td style={styles.td}>{EDU_COSTS.SEND_MESSAGE_FIRST} EDU</td>
                <td style={styles.td}>{(EDU_COSTS.SEND_MESSAGE_FIRST * 10).toLocaleString()} 원</td>
              </tr>
              <tr style={styles.tr}>
                <td style={styles.td}>⭐ 프로필 강조 (24시간)</td>
                <td style={styles.td}>{EDU_COSTS.PROFILE_HIGHLIGHT} EDU</td>
                <td style={styles.td}>{(EDU_COSTS.PROFILE_HIGHLIGHT * 10).toLocaleString()} 원</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 충전 버튼 (로그인 사용자만 onCharge가 넘어옴) */}
        {onCharge && (
          <button onClick={onCharge} style={styles.chargeBtn}>
            지금 EDU 충전하기 →
          </button>
        )}

        {/* 약관 안내 */}
        <section style={styles.section}>
          <h3 style={styles.h3}>유효기간 및 환불 안내</h3>
          <ul style={styles.ul}>
            <li>EDU 유효기간: <strong>충전일로부터 5년</strong></li>
            <li>결제 후 7일 이내 미사용 시 <strong>전액 환불 가능</strong></li>
            <li>부분 사용 시 잔여 EDU에 한해 비례 환불 (수수료 차감)</li>
            <li>자세한 환불 기준은 <strong>환불정책</strong> 페이지를 참고해주세요.</li>
          </ul>
        </section>

        {/* 판매자 정보 (PG 봇 인식용) */}
        <section style={styles.section}>
          <h3 style={styles.h3}>판매자 정보</h3>
          <div style={styles.sellerBox}>
            <p style={{ margin: '4px 0' }}><strong>상호:</strong> {BUSINESS_INFO.companyName}</p>
            <p style={{ margin: '4px 0' }}><strong>대표자:</strong> {BUSINESS_INFO.representativeName}</p>
            <p style={{ margin: '4px 0' }}><strong>사업자등록번호:</strong> {BUSINESS_INFO.businessNumber}</p>
            <p style={{ margin: '4px 0' }}><strong>통신판매업 신고번호:</strong> {BUSINESS_INFO.mailOrderNumber}</p>
            <p style={{ margin: '4px 0' }}><strong>주소:</strong> {BUSINESS_INFO.address}</p>
            <p style={{ margin: '4px 0' }}><strong>대표 전화:</strong> {BUSINESS_INFO.phone}</p>
            <p style={{ margin: '4px 0' }}><strong>이메일:</strong> {BUSINESS_INFO.email}</p>
          </div>
        </section>
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
    padding: '20px 16px',
    fontSize: 14,
    lineHeight: 1.7,
  },
  section: {
    marginBottom: 28,
  },
  h3: {
    fontSize: 16,
    color: '#C23B22',
    marginTop: 0,
    marginBottom: 10,
  },
  para: {
    marginBottom: 12,
  },
  rateBox: {
    background: 'linear-gradient(135deg, #F4845F, #E8603A)',
    color: '#fff',
    borderRadius: 14,
    padding: 18,
    textAlign: 'center',
  },
  rateLabel: {
    fontSize: 12,
    opacity: 0.9,
  },
  rateValue: {
    fontSize: 24,
    fontWeight: 800,
    margin: '6px 0',
  },
  rateSub: {
    fontSize: 11,
    opacity: 0.85,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  },
  trHead: {
    background: '#FFF0EB',
  },
  tr: {
    borderBottom: '1px solid #FFF0EB',
  },
  th: {
    textAlign: 'left',
    padding: '10px 8px',
    fontSize: 12,
    color: '#C23B22',
    fontWeight: 700,
  },
  td: {
    padding: '10px 8px',
    fontSize: 13,
  },
  notice: {
    fontSize: 11,
    color: '#9C5A4A',
    marginTop: 10,
    lineHeight: 1.6,
  },
  ul: {
    paddingLeft: 20,
  },
  chargeBtn: {
    display: 'block',
    width: '100%',
    padding: 16,
    background: 'linear-gradient(135deg, #F4845F, #E8603A)',
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    margin: '20px 0',
    boxShadow: '0 4px 12px rgba(232, 96, 58, 0.3)',
  },
  sellerBox: {
    background: '#fff',
    border: '1px solid #FDBCAA',
    borderRadius: 10,
    padding: 14,
    fontSize: 13,
    lineHeight: 1.8,
  },
};