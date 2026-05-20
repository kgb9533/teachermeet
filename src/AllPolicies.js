// src/AllPolicies.js
// 7개 약관 + 사업자 정보를 하나의 아코디언 페이지로 통합
// 기존 약관 컴포넌트들을 그대로 활용 (CSS로 헤더 숨김)

import React, { useState } from 'react';
import Terms from './Terms';
import Privacy from './Privacy';
import Refund from './Refund';
import Youth from './Youth';
import LocationTerms from './LocationTerms';
import Community from './Community';
import BusinessInfo from './BusinessInfo';

const POLICY_SECTIONS = [
  { id: 'terms', emoji: '📋', title: '이용약관', Component: Terms },
  { id: 'privacy', emoji: '🔒', title: '개인정보처리방침', Component: Privacy },
  { id: 'youth', emoji: '🛡️', title: '청소년보호정책', Component: Youth },
  { id: 'location', emoji: '📍', title: '위치기반서비스 이용약관', Component: LocationTerms },
  { id: 'refund', emoji: '💰', title: '결제 및 환불정책', Component: Refund },
  { id: 'community', emoji: '📜', title: '커뮤니티 운영정책', Component: Community },
  { id: 'business', emoji: '🏢', title: '사업자 정보', Component: BusinessInfo },
];

export default function AllPolicies({ onBack }) {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => {
    setOpenId(prev => prev === id ? null : id);
  };

  return (
    <div style={styles.container}>
      {/* 약관 컴포넌트들의 내부 헤더 + container 스타일을 아코디언 안에서 override하기 위한 CSS */}
      <style>{`
        .policy-accordion-body > div {
          min-height: 0 !important;
          background: transparent !important;
          padding-bottom: 0 !important;
        }
        .policy-accordion-body > div > div:first-child {
          display: none !important;
        }
      `}</style>

      {/* 헤더 */}
      <div style={styles.header}>
        <h2 style={styles.title}>약관 및 정책</h2>
      </div>

      <div style={styles.content}>
        <p style={styles.intro}>
          서비스 이용 전 꼭 확인해주세요. <br />
          각 항목을 클릭하면 자세한 내용을 볼 수 있어요.
        </p>

        {/* 아코디언 섹션들 */}
        <div style={styles.accordionList}>
          {POLICY_SECTIONS.map(section => {
            const isOpen = openId === section.id;
            const { Component } = section;
            return (
              <div key={section.id} style={styles.accordionItem}>
                <button
                  onClick={() => toggle(section.id)}
                  style={{
                    ...styles.accordionHeader,
                    background: isOpen ? '#FFF0EB' : 'white',
                    borderBottom: isOpen ? '1px solid #FDBCAA' : 'none',
                  }}
                >
                  <span style={styles.accordionEmoji}>{section.emoji}</span>
                  <span style={styles.accordionTitle}>{section.title}</span>
                  <span style={{
                    ...styles.accordionArrow,
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}>▼</span>
                </button>
                {isOpen && (
                  <div className="policy-accordion-body" style={styles.accordionBody}>
                    <Component />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 마지막 안내 */}
        <p style={styles.footer}>
          궁금한 점은 dbdus1357@naver.com 으로 문의해주세요.
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
    padding: '16px 18px',
  },
  intro: {
    fontSize: 13,
    color: '#9C5A4A',
    lineHeight: 1.7,
    margin: '0 0 18px',
    padding: '14px 16px',
    background: '#FFF0EB',
    borderRadius: 12,
    textAlign: 'center',
  },
  accordionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  accordionItem: {
    border: '1.5px solid #FDBCAA',
    borderRadius: 12,
    overflow: 'hidden',
    background: 'white',
  },
  accordionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '13px 14px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    transition: 'background 0.15s',
  },
  accordionEmoji: {
    fontSize: 17,
  },
  accordionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: 700,
    color: '#3D1008',
  },
  accordionArrow: {
    fontSize: 12,
    color: '#F4845F',
    transition: 'transform 0.2s',
  },
  accordionBody: {
    background: '#FFFAF8',
  },
  footer: {
    marginTop: 24,
    padding: 12,
    fontSize: 12,
    color: '#9C5A4A',
    textAlign: 'center',
    fontWeight: 500,
  },
};