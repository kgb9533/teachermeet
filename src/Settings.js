import React, { useState } from 'react';
import { auth, db } from './firebase';
import { sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';

function Settings({ user, onClose, onLogout }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 3000);
    } catch (e) { alert('오류가 발생했어요. 다시 시도해주세요.'); }
  };

  

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(auth.currentUser);
      onLogout();
    } catch (e) { alert('탈퇴 중 오류가 발생했어요. 다시 로그인 후 시도해주세요.'); }
    setLoading(false);
  };

  const Toggle = ({ value, onChange }) => (
    <div onClick={() => onChange(!value)} style={{ width: 40, height: 22, background: value ? '#F4845F' : '#ddd', borderRadius: 11, position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ width: 18, height: 18, background: 'white', borderRadius: '50%', position: 'absolute', top: 2, left: value ? 20 : 2, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
    </div>
  );

  const Section = ({ title, children }) => (
    <div style={{ background: 'white', border: '1.5px solid #FDBCAA', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', background: '#FFF0EB', fontSize: 11, fontWeight: 800, color: '#C23B22', letterSpacing: '0.5px', fontFamily: 'Nunito, sans-serif' }}>{title}</div>
      {children}
    </div>
  );

  const Item = ({ icon, label, sub, right, onClick, danger }) => (
    <div onClick={onClick} style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #FFF8F5', cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: danger ? '#fff0f0' : '#FFF0EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{icon}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: danger ? '#ff4757' : '#3D1008', fontFamily: 'Nunito, sans-serif' }}>{label}</div>
          {sub && <div style={{ fontSize: 10, color: '#FDBCAA', fontWeight: 600, marginTop: 1, fontFamily: 'Nunito, sans-serif' }}>{sub}</div>}
        </div>
      </div>
      {right}
    </div>
  );

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: '#FFF8F5', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 390, maxHeight: '90vh', overflowY: 'auto' }}>

        {/* 헤더 */}
        <div style={{ background: 'white', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #FDBCAA', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#3D1008', fontFamily: 'Nunito, sans-serif' }}>설정 ⚙️</div>
          <button onClick={onClose} style={{ background: '#FFF0EB', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

          

          {/* 계정 설정 */}
          <Section title="👤 계정 설정">
            <Item icon="🔑" label="비밀번호 변경" sub="이메일로 재설정 링크 발송"
              right={resetSent
                ? <span style={{ fontSize: 11, color: '#4CAF50', fontWeight: 700 }}>전송됨 ✓</span>
                : <span style={{ fontSize: 12, color: '#FDBCAA' }}>→</span>}
              onClick={handlePasswordReset} />
            <Item icon="🗑️" label="계정 탈퇴" sub="탈퇴 시 모든 데이터 삭제" right={<span style={{ fontSize: 12, color: '#FDBCAA' }}>→</span>} onClick={() => setShowDeleteConfirm(true)} danger />
          </Section>

          {/* 앱 정보 */}
          <Section title="ℹ️ 앱 정보">
            <Item icon="📱" label="버전 정보" sub="티처밋 v1.0.0" right={<span style={{ fontSize: 11, color: '#F4845F', fontWeight: 700 }}>최신버전</span>} />
          </Section>

          

        <button onClick={onLogout} style={{ width: '100%', padding: '14px', background: 'white', border: '1.5px solid #FDBCAA', borderRadius: 14, color: '#ff4757', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>로그아웃</button>

          <div style={{ height: 20 }} />
        </div>
      </div>

      

      {/* 계정 탈퇴 확인 모달 */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 24, width: '100%', maxWidth: 360, padding: '28px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>😢</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#3D1008', marginBottom: 8, fontFamily: 'Nunito, sans-serif' }}>정말 탈퇴하시겠어요?</div>
            <div style={{ fontSize: 13, color: '#FDBCAA', lineHeight: 1.7, marginBottom: 24, fontFamily: 'Nunito, sans-serif' }}>탈퇴 시 모든 프로필, 매칭, 채팅 데이터가 삭제되며 복구가 불가능해요.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: '13px', background: 'white', border: '1.5px solid #FDBCAA', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#3D1008', fontFamily: 'Nunito, sans-serif' }}>취소</button>
              <button onClick={handleDeleteAccount} disabled={loading} style={{ flex: 1, padding: '13px', background: '#ff4757', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', color: 'white', fontFamily: 'Nunito, sans-serif' }}>{loading ? '처리 중...' : '탈퇴하기'}</button>
            </div>
          </div>
        </div>
      )}

      

      
    </div>
  );
}

export default Settings;