import React, { useState, useEffect } from 'react';
import { auth, db, rtdb } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ref, set, onDisconnect, serverTimestamp } from 'firebase/database';
import Profile from './Profile';
import Swipe from './Swipe';
import Chat from './Chat';
import MyProfile from './MyProfile';
import Likes from './Likes';
import Today from './Today';
import Home from './Home';
import { THEMES } from './themes';
import Logo from './Logo';
import './App.css';

function MatchPopup({ matchedUser, userProfile, onClose, onGoChat }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }}>
      <div style={{ background: 'linear-gradient(160deg, #F4845F, #E8603A)', borderRadius: 24, padding: '28px 24px', textAlign: 'center', width: '100%', maxWidth: 320 }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🎉✨🎊</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 4, fontFamily: 'Nunito, sans-serif' }}>매칭됐어요!</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 20, fontFamily: 'Nunito, sans-serif' }}>서로 좋아요를 눌렀어요 💕</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
            {userProfile?.gender === '남성' ? '👨‍🏫' : '👩‍🏫'}
          </div>
          <div style={{ fontSize: 20 }}>💕</div>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
            {matchedUser?.gender === '남성' ? '👨‍🏫' : '👩‍🏫'}
          </div>
        </div>
        <div style={{ color: 'white', fontSize: 14, fontWeight: 700, marginBottom: 16, fontFamily: 'Nunito, sans-serif' }}>{matchedUser?.name} 선생님과 매칭됐어요!</div>
        <div style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 14, padding: '12px 14px', marginBottom: 16, textAlign: 'left' }}>
          <div style={{ fontSize: 11, color: 'white', fontWeight: 800, marginBottom: 6, fontFamily: 'Nunito, sans-serif' }}>💡 첫 메시지 팁</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.9)', lineHeight: 1.8, fontFamily: 'Nunito, sans-serif' }}>
            "안녕하세요! 같은 지역 선생님이시군요 😊"<br/>
            "MBTI가 저랑 잘 맞을 것 같아요!"<br/>
            "어떤 과목 가르치세요?"
          </div>
        </div>
        <button onClick={onGoChat} style={{ width: '100%', padding: '13px', background: 'white', color: '#F4845F', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer', marginBottom: 8, fontFamily: 'Nunito, sans-serif' }}>💬 메시지 보내기</button>
        <button onClick={onClose} style={{ width: '100%', padding: '11px', background: 'transparent', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 12, fontSize: 13, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>계속 둘러보기</button>
      </div>
    </div>
  );
}

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [matchedUser, setMatchedUser] = useState(null);
  const [tab, setTab] = useState('home');
  const [chatBadge, setChatBadge] = useState(0);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');
  const [theme, setTheme] = useState('sunset');

  const t = THEMES[theme];

  const handleThemeChange = (newTheme) => {
    localStorage.setItem('tm_theme', newTheme);
    setTheme(newTheme);
  };

  useEffect(() => {
    document.body.style.background = t.bodyBg;
  }, [theme, t.bodyBg]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) return;
    const userStatusRef = ref(rtdb, `status/${user.uid}`);
    set(userStatusRef, { online: true, lastSeen: serverTimestamp() });
    onDisconnect(userStatusRef).set({ online: false, lastSeen: serverTimestamp() });
    return () => { set(userStatusRef, { online: false, lastSeen: serverTimestamp() }); };
  }, [user]);

  useEffect(() => {
    const handlePopState = () => { setTab('swipe'); };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) setUserProfile(snap.data());
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setCheckingAuth(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (isLogin) await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) {
      if (e.code === 'auth/invalid-credential') setError('이메일 또는 비밀번호가 틀렸어요.');
      else if (e.code === 'auth/email-already-in-use') setError('이미 가입된 이메일이에요.');
      else if (e.code === 'auth/weak-password') setError('비밀번호는 6자리 이상이어요.');
      else setError('오류가 발생했어요. 다시 시도해주세요.');
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    setResetError('');
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
    } catch (e) {
      if (e.code === 'auth/user-not-found') setResetError('가입되지 않은 이메일이에요.');
      else if (e.code === 'auth/invalid-email') setResetError('이메일 형식이 올바르지 않아요.');
      else setResetError('오류가 발생했어요. 다시 시도해주세요.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null); setUserProfile(null);
    setMatchedUser(null); setTab('swipe'); setChatBadge(0);
  };

  if (checkingAuth) return (
    <div className="phone" style={{ background: '#FFF8F5' }}>
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Logo size={28} />
          <span style={{ fontSize: 18, fontWeight: 800, color: '#F4845F', fontFamily: 'Nunito, sans-serif' }}>티처밋</span>
        </div>
      </div>
      <div className="auth-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 40 }}>🍎</div>
        <div style={{ marginTop: 16, color: '#FDBCAA', fontSize: 14, fontFamily: 'Nunito, sans-serif' }}>로딩 중...</div>
      </div>
    </div>
  );

  if (user && !userProfile) return (
    <Profile user={user} onComplete={(p) => setUserProfile(p)} onBack={handleLogout} theme={theme} />
  );

  if (user && userProfile) return (
    <div className="phone" style={{ background: '#FFF8F5' }}>
      {matchedUser && (
        <MatchPopup matchedUser={matchedUser} userProfile={userProfile}
          onClose={() => setMatchedUser(null)}
          onGoChat={() => { setMatchedUser(null); setTab('chat'); setChatBadge(0); }}
        />
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {tab === 'swipe' && (
          <>
            <div className="header">
              <div onClick={() => setTab('home')} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Logo size={28} />
                <span style={{ fontSize: 18, fontWeight: 800, color: '#F4845F', fontFamily: 'Nunito, sans-serif' }}>티처밋</span>
              </div>
              <button onClick={handleLogout} style={{ background: '#FFF0EB', border: 'none', borderRadius: 20, padding: '6px 14px', color: '#F4845F', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>로그아웃</button>
            </div>
            <Swipe user={user} userProfile={userProfile} theme={theme}
              onMatch={(target) => { setMatchedUser(target); if (tab !== 'chat') setChatBadge(prev => prev + 1); }}
              onLogout={handleLogout}
            />
          </>
        )}
        {tab === 'home' && (
          <Home
            user={user}
            userProfile={userProfile}
            onStartMatch={() => setTab('swipe')}
            onGoLikes={() => setTab('likes')}
            onGoToday={() => setTab('today')}
            onGoChat={() => setTab('chat')}
            onLogout={handleLogout}
          />
        )}
        {tab !== 'swipe' && tab !== 'home' && (
          <div style={{ background: 'white', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #FDBCAA' }}>
            <div onClick={() => setTab('home')} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Logo size={28} />
              <span style={{ fontSize: 18, fontWeight: 800, color: '#F4845F', fontFamily: 'Nunito, sans-serif' }}>티처밋</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#FDBCAA', fontFamily: 'Nunito, sans-serif' }}>
              {tab === 'likes' && '좋아요 💜'}
              {tab === 'today' && '추천 ⭐'}
              {tab === 'chat' && '매칭 💬'}
              {tab === 'myprofile' && '프로필 👤'}
            </div>
          </div>
        )}
        {tab === 'likes' && <Likes user={user} theme={theme} onMatch={(target) => { setMatchedUser(target); setChatBadge(prev => prev + 1); }} />}
        {tab === 'today' && <Today user={user} userProfile={userProfile} theme={theme} onMatch={(target) => { setMatchedUser(target); setChatBadge(prev => prev + 1); }} />}
        {tab === 'chat' && <Chat user={user} theme={theme} />}
        {tab === 'myprofile' && (
          <MyProfile
            user={user}
            userProfile={userProfile}
            theme={theme}
            onThemeChange={handleThemeChange}
            onUpdate={(updated) => setUserProfile(updated)}
            onLogout={handleLogout}
          />
        )}
      </div>

      <div style={{ background: 'white', borderTop: '1px solid #FDBCAA', display: 'flex', justifyContent: 'space-around', padding: '10px 0 16px' }}>
        {[
          { id: 'likes', icon: '🧡', label: '좋아요' },
          { id: 'today', icon: '⭐', label: '추천' },
          { id: 'home', icon: null, label: '홈' },
          { id: 'chat', icon: '💬', label: '대화' },
          { id: 'myprofile', icon: '👤', label: '내 프로필' },
        ].map(item => (
          <button key={item.id} onClick={() => {
            setTimeout(() => setTab(item.id), 50);
            if (item.id === 'chat') setChatBadge(0);
          }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 16px', position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              {item.id === 'home' ? (
                <Logo size={34} />
              ) : (
                <span style={{ fontSize: 22 }}>{item.icon}</span>
              )}
              {item.id === 'chat' && chatBadge > 0 && (
                <div style={{ position: 'absolute', top: -4, right: -8, width: 16, height: 16, borderRadius: '50%', background: '#F4845F', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white' }}>{chatBadge}</div>
              )}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Nunito, sans-serif', color: tab === item.id ? '#F4845F' : '#cccccc' }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="phone" style={{ background: 'white' }}>
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Logo size={28} />
          <span style={{ fontSize: 18, fontWeight: 800, color: '#F4845F', fontFamily: 'Nunito, sans-serif' }}>티처밋</span>
        </div>
      </div>
      <div className="auth-container">
        <div className="auth-hero">
          <div className="auth-title">
            {isLogin ? '다시 만나서\n반가워요 👋' : '선생님,\n환영해요 🍎'}
          </div>
          <div className="auth-sub">
            {isLogin ? '교육자 전용 소개팅 앱 티처밋' : '교육자만 가입할 수 있어요\n신분 인증 후 매칭을 시작해요'}
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="input-group">
          <label>이메일</label>
          <input type="email" placeholder="example@school.ac.kr" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="input-group">
          <label>비밀번호</label>
          <input type="password" placeholder="6자리 이상" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>

        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? '처리 중...' : isLogin ? '로그인' : '가입하기'}
        </button>

        {isLogin && (
          <div style={{ textAlign: 'right', marginTop: 8 }}>
            <button onClick={() => { setShowReset(true); setResetSent(false); setResetError(''); setResetEmail(''); }}
              style={{ background: 'none', border: 'none', color: '#FDBCAA', fontSize: 13, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>비밀번호를 잊으셨나요?</button>
          </div>
        )}

        {showReset && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ background: 'white', borderRadius: 24, padding: '32px 28px', width: '100%', maxWidth: 360 }}>
              {resetSent ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#3D1008', marginBottom: 8, fontFamily: 'Nunito, sans-serif' }}>이메일을 보냈어요!</div>
                  <div style={{ fontSize: 14, color: '#FDBCAA', lineHeight: 1.7, marginBottom: 24, fontFamily: 'Nunito, sans-serif' }}>{resetEmail} 으로<br />비밀번호 재설정 링크를 보냈어요</div>
                  <button onClick={() => setShowReset(false)} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #F4845F, #E8603A)', color: 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>확인</button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#3D1008', fontFamily: 'Nunito, sans-serif' }}>비밀번호 찾기</div>
                    <button onClick={() => setShowReset(false)} style={{ background: '#FFF0EB', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                  <div style={{ fontSize: 14, color: '#FDBCAA', marginBottom: 20, lineHeight: 1.6, fontFamily: 'Nunito, sans-serif' }}>가입한 이메일을 입력하면<br />재설정 링크를 보내드려요</div>
                  {resetError && <div className="error-msg">{resetError}</div>}
                  <div className="input-group">
                    <label>이메일</label>
                    <input type="email" placeholder="가입한 이메일 입력" value={resetEmail} onChange={e => setResetEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleResetPassword()} />
                  </div>
                  <button onClick={handleResetPassword} disabled={!resetEmail} style={{ width: '100%', padding: '14px', background: resetEmail ? 'linear-gradient(135deg, #F4845F, #E8603A)' : '#FFF0EB', color: resetEmail ? 'white' : '#FDBCAA', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: resetEmail ? 'pointer' : 'not-allowed', fontFamily: 'Nunito, sans-serif', marginTop: 8 }}>재설정 링크 보내기</button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="divider"><span>또는</span></div>
        <div className="switch-text">
          {isLogin ? '아직 계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? '회원가입' : '로그인'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;