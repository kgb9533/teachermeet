import React from 'react';
import { THEMES } from './themes';

function ThemeSelector({ currentTheme, onThemeChange }) {
  return (
    <div style={{ borderTop: '1px solid #E0F4FF', paddingTop: 24, marginTop: 24 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#0077B6', marginBottom: 16, fontFamily: 'Nunito, sans-serif' }}>
        🎨 테마 선택
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {Object.entries(THEMES).map(([key, themeObj]) => (
          <button
            key={key}
            onClick={() => onThemeChange(key)}
            style={{
              padding: '12px 8px', borderRadius: 14, cursor: 'pointer',
              border: currentTheme === key ? `2px solid ${themeObj.primary}` : '1.5px solid #E0F4FF',
              background: currentTheme === key ? themeObj.primaryLight : 'white',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              transition: 'all 0.2s'
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: themeObj.gradient }} />
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: currentTheme === key ? themeObj.primary : '#aaa',
              fontFamily: 'Nunito, sans-serif', textAlign: 'center', lineHeight: 1.3
            }}>
              {themeObj.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ThemeSelector;