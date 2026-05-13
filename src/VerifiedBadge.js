// src/VerifiedBadge.js
// 본인인증 완료 뱃지 (파란 체크 아이콘)
// 사용법:
//   <VerifiedBadge />           기본 사이즈
//   <VerifiedBadge size={20} /> 큰 사이즈
//   <VerifiedBadge size={12} /> 작은 사이즈

import React from 'react';

export default function VerifiedBadge({ size = 16, style = {} }) {
  return (
    <span
      title="본인인증 완료"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#1DA1F2',
        color: 'white',
        fontSize: Math.round(size * 0.65),
        fontWeight: 800,
        verticalAlign: 'middle',
        marginLeft: 4,
        flexShrink: 0,
        ...style,
      }}
    >
      ✓
    </span>
  );
}