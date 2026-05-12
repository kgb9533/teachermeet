import React, { useState } from 'react';
import { auth, db } from './firebase';
import { sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { doc, deleteDoc, getDocs, collection, query, where } from 'firebase/firestore';

function Settings({ user, onClose, onLogout, onGoEdu }) {
  const [notiLike, setNotiLike] = useState(true);
  const [notiChat, setNotiChat] = useState(true);
  const [notiMatch, setNotiMatch] = useState(false);
  const [blockedList, setBlockedList] = useState([]);
  const [showBlocked, setShowBlocked] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
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

  const handleShowBlocked = async () => {
    const snap = await getDocs(query(collection(db, 'blocks'), where('from', '==', user.uid)));
    const list = await Promise.all(snap.docs.map(async d => {
      const userSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', d.data().to)));
      return userSnap.docs[0]?.data() || null;
    }));
    setBlockedList(list.filter(Boolean));
    setShowBlocked(true);
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

          {/* 알림 설정 */}
          <Section title="🔔 알림 설정">
            <Item icon="🧡" label="좋아요 알림" sub="누군가 나를 좋아요 했을 때" right={<Toggle value={notiLike} onChange={setNotiLike} />} />
            <Item icon="💬" label="채팅 알림" sub="새 메시지가 왔을 때" right={<Toggle value={notiChat} onChange={setNotiChat} />} />
            <Item icon="💕" label="매칭 알림" sub="새 매칭이 됐을 때" right={<Toggle value={notiMatch} onChange={setNotiMatch} />} />
          </Section>

          {/* 계정 설정 */}
          <Section title="👤 계정 설정">
            <Item icon="🔑" label="비밀번호 변경" sub="이메일로 재설정 링크 발송"
              right={resetSent
                ? <span style={{ fontSize: 11, color: '#4CAF50', fontWeight: 700 }}>전송됨 ✓</span>
                : <span style={{ fontSize: 12, color: '#FDBCAA' }}>→</span>}
              onClick={handlePasswordReset} />
            <Item icon="🚫" label="차단 목록" sub="차단한 선생님 관리" right={<span style={{ fontSize: 12, color: '#FDBCAA' }}>→</span>} onClick={handleShowBlocked} />
            <Item icon="🗑️" label="계정 탈퇴" sub="탈퇴 시 모든 데이터 삭제" right={<span style={{ fontSize: 12, color: '#FDBCAA' }}>→</span>} onClick={() => setShowDeleteConfirm(true)} danger />
          </Section>

          {/* 앱 정보 */}
          <Section title="ℹ️ 앱 정보">
            <Item icon="📄" label="이용약관" right={<span style={{ fontSize: 12, color: '#FDBCAA' }}>→</span>} onClick={() => setShowTerms(true)} />
            <Item icon="🔒" label="개인정보처리방침" right={<span style={{ fontSize: 12, color: '#FDBCAA' }}>→</span>} onClick={() => setShowPrivacy(true)} />
            <Item icon="📱" label="버전 정보" sub="티처밋 v1.0.0" right={<span style={{ fontSize: 11, color: '#F4845F', fontWeight: 700 }}>최신버전</span>} />
          </Section>

          <div style={{ background: 'white', border: '1.5px solid #FDBCAA', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', background: '#FFF0EB', fontSize: 11, fontWeight: 800, color: '#C23B22', fontFamily: 'Nunito, sans-serif' }}>🎓 에듀</div>
          <div onClick={onGoEdu} style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: '#FFF0EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🎓</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#3D1008', fontFamily: 'Nunito, sans-serif' }}>에듀 충전하기</div>
                <div style={{ fontSize: 10, color: '#FDBCAA', fontWeight: 600, marginTop: 1, fontFamily: 'Nunito, sans-serif' }}>티처밋 전용 포인트</div>
              </div>
            </div>
            <span style={{ fontSize: 12, color: '#FDBCAA' }}>→</span>
          </div>
        </div>

        <button onClick={onLogout} style={{ width: '100%', padding: '14px', background: 'white', border: '1.5px solid #FDBCAA', borderRadius: 14, color: '#ff4757', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>로그아웃</button>

          <div style={{ height: 20 }} />
        </div>
      </div>

      {/* 차단 목록 모달 */}
      {showBlocked && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 24, width: '100%', maxWidth: 360, padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#3D1008', fontFamily: 'Nunito, sans-serif' }}>차단 목록 🚫</div>
              <button onClick={() => setShowBlocked(false)} style={{ background: '#FFF0EB', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            {blockedList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#FDBCAA', fontSize: 14, fontFamily: 'Nunito, sans-serif' }}>차단한 선생님이 없어요</div>
            ) : (
              blockedList.map(u => (
                <div key={u.uid} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #FFF0EB' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FFF0EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{u.gender === '남성' ? '👨‍🏫' : '👩‍🏫'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#3D1008', fontFamily: 'Nunito, sans-serif' }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: '#FDBCAA', fontFamily: 'Nunito, sans-serif' }}>{u.region} · {u.level}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

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

      {/* 이용약관 모달 */}
      {showTerms && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 24, width: '100%', maxWidth: 360, maxHeight: '80vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#3D1008', fontFamily: 'Nunito, sans-serif' }}>이용약관 📄</div>
              <button onClick={() => setShowTerms(false)} style={{ background: '#FFF0EB', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.8, fontFamily: 'Nunito, sans-serif' }}>
              <p style={{ fontWeight: 700, color: '#3D1008', marginBottom: 8 }}>제1조 (목적)</p>
              <p style={{ marginBottom: 16 }}>본 약관은 티처밋 서비스의 이용 조건 및 절차, 이용자와 회사 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.</p>
              <p style={{ fontWeight: 700, color: '#3D1008', marginBottom: 8 }}>제2조 (서비스 이용)</p>
              <p style={{ marginBottom: 16 }}>티처밋은 교원 자격을 보유한 사용자만 이용 가능하며, 허위 정보 등록 시 서비스 이용이 제한될 수 있습니다.</p>
              <p style={{ fontWeight: 700, color: '#3D1008', marginBottom: 8 }}>제3조 (금지 행위)</p>
              <p style={{ marginBottom: 16 }}>타인에 대한 허위 사실 유포, 음란물 게시, 개인정보 무단 수집 등의 행위를 금지합니다.</p>
              <p style={{ fontWeight: 700, color: '#3D1008', marginBottom: 8 }}>제4조 (서비스 변경 및 중단)</p>
              <p>회사는 서비스 내용을 변경하거나 중단할 수 있으며, 이 경우 사전 공지합니다.</p>
            </div>
          </div>
        </div>
      )}

      {/* 개인정보처리방침 모달 */}
      {showPrivacy && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 24, width: '100%', maxWidth: 360, maxHeight: '80vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#3D1008', fontFamily: 'Nunito, sans-serif' }}>개인정보처리방침 🔒</div>
              <button onClick={() => setShowPrivacy(false)} style={{ background: '#FFF0EB', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.8, fontFamily: 'Nunito, sans-serif' }}>
              <p style={{ fontWeight: 700, color: '#3D1008', marginBottom: 8 }}>수집하는 개인정보</p>
              <p style={{ marginBottom: 16 }}>이름, 이메일, 생년월일, 소속학교, 프로필 사진, 위치 정보 등을 수집합니다.</p>
              <p style={{ fontWeight: 700, color: '#3D1008', marginBottom: 8 }}>개인정보 이용 목적</p>
              <p style={{ marginBottom: 16 }}>수집된 정보는 교원 인증 및 매칭 서비스 제공 목적으로만 사용됩니다.</p>
              <p style={{ fontWeight: 700, color: '#3D1008', marginBottom: 8 }}>개인정보 보관 기간</p>
              <p style={{ marginBottom: 16 }}>회원 탈퇴 시 즉시 삭제되며, 관련 법령에 따라 일정 기간 보관될 수 있습니다.</p>
              <p style={{ fontWeight: 700, color: '#3D1008', marginBottom: 8 }}>개인정보 제3자 제공</p>
              <p>이용자의 동의 없이 제3자에게 개인정보를 제공하지 않습니다.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;