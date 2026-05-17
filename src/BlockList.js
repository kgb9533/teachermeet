// src/BlockList.js
// 내가 차단한 사람들 목록 + 차단 해제 기능
// 사용 예: <BlockList user={user} onBack={() => setShow(false)} />

import React, { useState, useEffect } from 'react';
import { getMyBlockedProfiles, unblockUser } from './reports';

export default function BlockList({ user, onBack }) {
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState(null);

  useEffect(() => {
    loadBlocked();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadBlocked = async () => {
    setLoading(true);
    try {
      const list = await getMyBlockedProfiles(user.uid);
      setBlocked(list);
    } catch (e) {
      console.error('차단 목록 불러오기 오류:', e);
    }
    setLoading(false);
  };

  const handleUnblock = async (blockedUid, name) => {
    if (!window.confirm(`${name}님의 차단을 해제할까요?\n해제하면 다시 매칭에서 만날 수 있어요.`)) return;
    setUnblocking(blockedUid);
    try {
      await unblockUser(user.uid, blockedUid);
      setBlocked(prev => prev.filter(p => p.uid !== blockedUid));
    } catch (e) {
      alert('차단 해제 중 오류가 발생했어요.');
    }
    setUnblocking(null);
  };

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>←</button>
        <div style={styles.headerTitle}>차단한 사람</div>
        <div style={{ width: 32 }} />
      </div>

      {/* 콘텐츠 */}
      <div style={styles.content}>
        {loading ? (
          <div style={styles.centerMsg}>
            <div style={styles.loadingText}>불러오는 중...</div>
          </div>
        ) : blocked.length === 0 ? (
          <div style={styles.centerMsg}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🌸</div>
            <div style={styles.emptyTitle}>차단한 사람이 없어요</div>
            <div style={styles.emptyText}>
              불편한 사용자가 있다면<br />언제든 차단할 수 있어요
            </div>
          </div>
        ) : (
          <>
            <div style={styles.countInfo}>총 {blocked.length}명을 차단했어요</div>
            <div style={styles.list}>
              {blocked.map(profile => (
                <div key={profile.uid} style={styles.item}>
                  <div style={styles.avatar}>
                    {profile.photoUrl ? (
                      <img src={profile.photoUrl} alt="" style={styles.avatarImg} />
                    ) : (
                      <span style={{ fontSize: 24 }}>
                        {profile.gender === '남성' ? '👨‍🏫' : '👩‍🏫'}
                      </span>
                    )}
                  </div>
                  <div style={styles.info}>
                    <div style={styles.name}>
                      {profile.name || '이름 없음'}
                      {profile.age && `, ${profile.age}`}
                    </div>
                    <div style={styles.subInfo}>
                      {profile.region && `${profile.region}`}
                      {profile.subject && ` · ${profile.subject}`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnblock(profile.uid, profile.name)}
                    disabled={unblocking === profile.uid}
                    style={{
                      ...styles.unblockBtn,
                      ...(unblocking === profile.uid ? styles.btnDisabled : {}),
                    }}
                  >
                    {unblocking === profile.uid ? '...' : '해제'}
                  </button>
                </div>
              ))}
            </div>
            <div style={styles.warning}>
              ⚠️ 차단 해제 후에는 매칭/메시지를 다시 받을 수 있어요. 신중히 결정해주세요.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: '#FFF8F5',
    fontFamily: 'Nunito, sans-serif',
    height: '100%',
  },
  header: {
    background: 'white',
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #FDBCAA',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    fontSize: 22,
    color: '#F4845F',
    cursor: 'pointer',
    padding: 0,
    fontWeight: 700,
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: '#3D1008',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '0',
  },
  countInfo: {
    padding: '14px 20px',
    fontSize: 13,
    color: '#9C5A4A',
    background: 'white',
    borderBottom: '1px solid #FDBCAA',
    fontWeight: 600,
  },
  list: {
    background: 'white',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 20px',
    borderBottom: '1px solid #FFF8F5',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: '#FFF0EB',
    border: '2px solid #FDBCAA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 14,
    fontWeight: 700,
    color: '#3D1008',
  },
  subInfo: {
    fontSize: 12,
    color: '#9C5A4A',
    marginTop: 2,
  },
  unblockBtn: {
    padding: '8px 16px',
    background: 'white',
    color: '#E8603A',
    border: '1.5px solid #E8603A',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    flexShrink: 0,
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  centerMsg: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: 400,
  },
  loadingText: {
    color: '#FDBCAA',
    fontSize: 14,
    fontWeight: 600,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: '#3D1008',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9C5A4A',
    textAlign: 'center',
    lineHeight: 1.7,
  },
  warning: {
    margin: '20px',
    padding: '12px 14px',
    background: '#FFF0EB',
    borderRadius: 10,
    fontSize: 11,
    color: '#9C5A4A',
    lineHeight: 1.6,
  },
};