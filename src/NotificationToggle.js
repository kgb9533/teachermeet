// src/NotificationToggle.js
// 헤더에 들어가는 PUSH 알림 ON/OFF 토글 (옵션 C - 통합 디자인)
// - userProfile.notificationsEnabled로 현재 상태 표시
// - 클릭하면 권한 요청/해제

import React, { useState } from 'react';
import { enableNotifications, disableNotifications } from './notifications';

function NotificationToggle({ user, userProfile, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const isOn = userProfile?.notificationsEnabled || false;

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (isOn) {
        // OFF로 전환
        await disableNotifications(user.uid);
        onUpdate({ ...userProfile, notificationsEnabled: false });
      } else {
        // ON으로 전환
        await enableNotifications(user.uid);
        onUpdate({ ...userProfile, notificationsEnabled: true });
      }
    } catch (e) {
      alert(e.message || '알림 설정에 실패했어요.');
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      style={{
        background: isOn ? '#FFF0EB' : '#F5F5F5',
        border: `1px solid ${isOn ? '#FDBCAA' : '#D1D5DB'}`,
        borderRadius: 12,
        padding: '3px 4px 3px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        fontFamily: 'Nunito, sans-serif',
        transition: 'all 0.15s',
      }}
      aria-label={isOn ? '푸시 알림 끄기' : '푸시 알림 켜기'}
    >
      <span style={{
        fontSize: 9,
        fontWeight: 800,
        color: isOn ? '#F4845F' : '#B0B0B0',
        letterSpacing: '0.5px',
      }}>
        PUSH
      </span>
      <div style={{
        background: isOn ? '#F4845F' : '#D1D5DB',
        width: 24,
        height: 14,
        borderRadius: 8,
        padding: 2,
        boxSizing: 'border-box',
        transition: 'background 0.2s',
      }}>
        <div style={{
          background: 'white',
          width: 10,
          height: 10,
          borderRadius: '50%',
          marginLeft: isOn ? 10 : 0,
          transition: 'margin-left 0.2s',
        }} />
      </div>
    </button>
  );
}

export default NotificationToggle;