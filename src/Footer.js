// src/Footer.js
import React, { useState } from 'react';

export const BUSINESS_INFO = {
  companyName: '티처밋',
  representativeName: '김규보',
  businessNumber: '111-25-97394',
  mailOrderNumber: '신청 예정',
  address: '경기도 남양주시 별내면 청학로114번길 17, 104동 504호',
  phone: '010-5260-9533',
  email: 'dbdus1357@naver.com',
  cpoName: '김규보',
  cpoEmail: 'dbdus1357@naver.com',
};

export default function Footer({ onNavigate }) {
  const [expanded, setExpanded] = useState(false);

  const go = (page) => {
    if (onNavigate) onNavigate(page);
  };

  return (
    <footer style={styles.footer}>
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

      <button onClick={() => setExpanded(!expanded)} style={styles.companyToggle}>
        {BUSINESS_INFO.companyName} 사업자 정보 {expanded ? '▲' : '▼'}
      </button>

      {expanded && (
        <div style={styles.businessInfo}>
          <div style={styles.infoRow}>
            <span style={styles.label}>상호명</span>
            <span>{BUSINESS_INFO.companyName}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>대표자</span>
            <span>{BUSINESS_INFO.representativeName}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>사업자등록번호</span>
            <span>{BUSINESS_INFO.businessNumber}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>통신판매업 신고</span>
            <span>{BUSINESS_INFO.mailOrderNumber}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>주소</span>
            <span>{BUSINESS_INFO.address}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>대표전화</span>
            <span>{BUSINESS_INFO.phone}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>이메일</span>
            <span>{BUSINESS_INFO.email}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>개인정보보호책임자</span>
            <span>{BUSINESS_INFO.cpoName} ({BUSINESS_INFO.cpoEmail})</span>
          </div>
        </div>
      )}

      <div style={styles.crawlerRow}>
        {BUSINESS_INFO.companyName} | 대표: {BUSINESS_INFO.representativeName} |
        사업자등록번호: {BUSINESS_INFO.businessNumber} |
        주소: {BUSINESS_INFO.address} |
        문의: {BUSINESS_INFO.email} {BUSINESS_INFO.phone}
      </div>

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
    padding: '20px 16px 24px',
    fontFamily: 'Nunito, sans-serif',
    fontSize: 12,
    color: '#3D1008',
    marginTop: 40,
  },
  linkRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 14,
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
  divider: { color: '#FDBCAA', fontSize: 11 },
  companyToggle: {
    display: 'block',
    margin: '0 auto 8px',
    background: 'none',
    border: '1px solid #FDBCAA',
    borderRadius: 14,
    padding: '4px 12px',
    fontSize: 11,
    color: '#C23B22',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  businessInfo: {
    maxWidth: 500,
    margin: '0 auto 12px',
    padding: 14,
    background: '#fff',
    border: '1px solid #FDBCAA',
    borderRadius: 10,
    fontSize: 12,
    lineHeight: 1.7,
  },
  infoRow: {
    display: 'flex',
    gap: 10,
    marginBottom: 2,
  },
  label: {
    minWidth: 100,
    color: '#C23B22',
    fontWeight: 600,
  },
  crawlerRow: {
    textAlign: 'center',
    color: '#9C5A4A',
    fontSize: 11,
    lineHeight: 1.6,
    padding: '0 8px',
    marginBottom: 8,
  },
  copyright: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9C5A4A',
    marginTop: 8,
  },
};