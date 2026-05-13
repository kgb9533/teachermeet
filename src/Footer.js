// src/Footer.js
import React from 'react';

export const BUSINESS_INFO = {
  companyName: '티처밋',
  representativeName: '김규보',
  businessNumber: '111-25-97394',
  mailOrderNumber: '신청 예정',
  address: '경기도 남양주시 별내면 청학로114번길 17',
  phone: '010-5260-9533',
  email: 'dbdus1357@naver.com',
  cpoName: '김규보',
  cpoEmail: 'dbdus1357@naver.com',
};

export default function Footer({ onNavigate }) {
  const go = (page) => {
    if (onNavigate) onNavigate(page);
  };

  return (
    <footer style={styles.footer}>
      {/* 정책 링크 */}
      <div style={styles.linkRow}>
        <button onClick={() => go('terms')} style={styles.link}>이용약관</button>
        <span style={styles.divider}>|</span>
        <button onClick={() => go('privacy')} style={{ ...styles.link, fontWeight: 700 }}>
          개인정보처리방침
        </button>
        <span style={styles.divider}>|</span>
        <button onClick={() => go('refund')} style={styles.link}>환불정책</button>
        <span style={styles.divider}>|</span>
        <button onClick={() => go('pricing')} style={styles.link}>요금안내</button>
      </div>

      {/* 사업자 정보 (한눈에) */}
      <div style={styles.bizInfo}>
        <div style={styles.companyName}>{BUSINESS_INFO.companyName}</div>
        <div style={styles.bizRow}>
          대표자 {BUSINESS_INFO.representativeName} · 사업자등록번호 {BUSINESS_INFO.businessNumber}
        </div>
        <div style={styles.bizRow}>
          통신판매업: {BUSINESS_INFO.mailOrderNumber}
        </div>
        <div style={styles.bizRow}>
          {BUSINESS_INFO.address}
        </div>
        <div style={styles.bizRow}>
          대표전화 {BUSINESS_INFO.phone} · {BUSINESS_INFO.email}
        </div>
      </div>

      {/* 카피라이트 */}
      <div style={styles.copyright}>
        © {new Date().getFullYear()} {BUSINESS_INFO.companyName}. All rights reserved.
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: '#FFF0EB',
    borderTop: '1px solid #FDBCAA',
    padding: '24px 20px',
    fontFamily: 'Nunito, sans-serif',
    color: '#3D1008',
    marginTop: 40,
  },
  linkRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 18,
  },
  link: {
    background: 'none',
    border: 'none',
    color: '#3D1008',
    fontSize: 12,
    cursor: 'pointer',
    padding: '4px 6px',
    fontFamily: 'inherit',
  },
  divider: {
    color: '#FDBCAA',
    fontSize: 11,
  },
  bizInfo: {
    maxWidth: 400,
    margin: '0 auto',
    fontSize: 11,
    lineHeight: 1.9,
    color: '#5A2818',
    textAlign: 'center',
  },
  companyName: {
    fontWeight: 700,
    color: '#C23B22',
    fontSize: 12,
    marginBottom: 8,
  },
  bizRow: {
    fontSize: 11,
  },
  copyright: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9C5A4A',
    marginTop: 14,
    paddingTop: 12,
    borderTop: '1px solid #FDBCAA',
  },
};