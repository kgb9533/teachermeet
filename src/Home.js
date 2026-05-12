import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import Settings from './Settings';
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';

const QUOTES = [
  { text: "사랑은 서로 마주 보는 것이 아니라, 함께 같은 방향을 바라보는 것이다.", author: "생텍쥐페리" },
  { text: "진정한 사랑은 상대방이 있는 그대로의 모습으로 성장할 수 있게 해준다.", author: "에리히 프롬" },
  { text: "사랑하는 사람과 함께라면, 어디든 고향이 된다.", author: "테오필 고티에" },
  { text: "사랑은 눈으로 보지 않고 마음으로 본다.", author: "셰익스피어" },
  { text: "인연이 있는 사람은 천 리를 떨어져 있어도 만난다.", author: "한국 속담" },
  { text: "두 사람이 함께 걸으면, 길은 두 배로 아름다워진다.", author: "한국 속담" },
  { text: "좋은 사람을 만나는 것이 인생에서 가장 큰 행운이다.", author: "작자 미상" },
  { text: "사랑은 작은 것에서 시작된다. 미소, 손길, 그리고 따뜻한 말 한마디.", author: "작자 미상" },
  { text: "당신이 웃을 때, 세상이 더 아름다워진다.", author: "작자 미상" },
  { text: "사랑은 우리가 서로를 위해 할 수 있는 가장 위대한 모험이다.", author: "작자 미상" },
  { text: "가장 행복한 사람은 가장 많이 사랑하는 사람이다.", author: "작자 미상" },
  { text: "사랑은 시간이 지나도 변하지 않는 유일한 것이다.", author: "작자 미상" },
];

function Home({ user, userProfile, onStartMatch, onGoLikes, onGoToday, onGoChat, onLogout }) {
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [stats, setStats] = useState({ total: 0, online: 0, weeklyMatch: 0 });
  const [myStats, setMyStats] = useState({ likedMe: 0, matched: 0, iLiked: 0, todayRec: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [todayProfile, setTodayProfile] = useState(null);
  const [liked, setLiked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 전체 사용자 수
        const usersSnap = await getDocs(collection(db, 'users'));
        const total = usersSnap.docs.length;

        // 나를 좋아한 사람
        const likesSnap = await getDocs(collection(db, 'likes'));
        const likedMe = likesSnap.docs.filter(d => d.data().to === user.uid).length;
        const iLiked = likesSnap.docs.filter(d => d.data().from === user.uid).length;

        // 매칭 수
        const matchesSnap = await getDocs(collection(db, 'matches'));
        const myMatches = matchesSnap.docs.filter(d => d.data().users.includes(user.uid)).length;

        // 이번주 매칭
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklyMatch = matchesSnap.docs.filter(d => {
          const data = d.data();
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          return createdAt > oneWeekAgo;
        }).length;

        setStats({ total, online: Math.floor(total * 0.3) || 0, weeklyMatch });
        setMyStats({ likedMe, matched: myMatches, iLiked, todayRec: 5 });

        // 최근 활동
        const activities = [];
        const recentLikes = likesSnap.docs
          .filter(d => d.data().to === user.uid)
          .slice(0, 2);

        for (const likeDoc of recentLikes) {
          const profileSnap = await getDoc(doc(db, 'users', likeDoc.data().from));
          if (profileSnap.exists()) {
            const p = profileSnap.data();
            activities.push({
              type: 'like',
              icon: '🧡',
              title: `${p.name} 선생님이 좋아요를 눌렀어요`,
              sub: `${p.region} · ${p.level} · ${p.subject}`,
              badge: 'new',
              onClick: onGoLikes
            });
          }
        }

        if (myMatches > 0) {
          activities.push({
          type: 'match',
          icon: '💬',
          title: `${myMatches}명의 선생님과 매칭됐어요`,
          sub: '채팅을 시작해보세요!',
          badge: 'normal',
          onClick: onGoChat
        });
        }

        activities.push({
          type: 'today',
          icon: '⭐',
          title: '오늘의 추천이 도착했어요',
          sub: '나와 잘 맞는 선생님을 만나보세요',
          badge: 'normal',
          onClick: onGoToday
        });

        setRecentActivity(activities);

        // 오늘의 추천 선생님 1명
        const profiles = usersSnap.docs
          .map(d => d.data())
          .filter(p => p.uid !== user.uid);

        const seenUids = likesSnap.docs
          .filter(d => d.data().from === user.uid)
          .map(d => d.data().to);

        const unseen = profiles.filter(p => !seenUids.includes(p.uid));
        if (unseen.length > 0) {
          const sameRegion = unseen.filter(p => p.region === userProfile.region);
          setTodayProfile(sameRegion.length > 0 ? sameRegion[0] : unseen[0]);
        }

      } catch (e) {
        console.error('홈 데이터 오류:', e);
      }
    };
    fetchData();
  }, [user.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLike = async () => {
    if (!todayProfile || liked) return;
    try {
      await setDoc(doc(db, 'likes', `${user.uid}_${todayProfile.uid}`), {
        from: user.uid, to: todayProfile.uid, createdAt: new Date()
      });
      setLiked(true);
    } catch (e) { console.error('좋아요 오류:', e); }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFF8F5', overflowY: 'auto' }}>
      {/* 헤더 */}
      <div style={{ background: 'white', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #FDBCAA' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Logo size={28} />
          <span style={{ fontSize: 18, fontWeight: 800, color: '#F4845F', fontFamily: 'Nunito, sans-serif' }}>티처밋</span>
        </div>
        <button onClick={() => setShowSettings(true)} style={{ background: '#FFF0EB', border: 'none', borderRadius: 20, padding: '6px 12px', fontSize: 16, cursor: 'pointer' }}>⚙️</button>
      </div>
      {showSettings && <Settings user={user} onClose={() => setShowSettings(false)} onLogout={onLogout} />}

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* 히어로 카드 */}
        <div style={{ background: 'linear-gradient(135deg, #F4845F, #E8603A)', borderRadius: 20, padding: 20, color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, marginBottom: 4, fontFamily: 'Nunito, sans-serif' }}>
                안녕하세요, {userProfile.name} 선생님 👋
              </div>
            </div>
            <Logo size={44} />
          </div>

          {/* 랜덤 명언 */}
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: '12px 14px', marginBottom: 10, border: '1px solid rgba(255,255,255,0.25)' }}>
            <div style={{ fontSize: 16, opacity: 0.7, marginBottom: 4 }}>"</div>
            <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.7, color: 'white', fontFamily: 'Nunito, sans-serif' }}>
              {quote.text}
            </div>
            <div style={{ fontSize: 10, opacity: 0.75, marginTop: 6, textAlign: 'right', fontFamily: 'Nunito, sans-serif' }}>
              — {quote.author}
            </div>
          </div>

          {myStats.likedMe > 0 && (
            <div style={{ fontSize: 11, opacity: 0.9, background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: 10, display: 'inline-block', marginBottom: 10, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
              🧡 나를 좋아한 선생님이 {myStats.likedMe}명 있어요!
            </div>
          )}

          <button onClick={onStartMatch} style={{ background: 'white', color: '#F4845F', border: 'none', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 800, cursor: 'pointer', width: '100%', fontFamily: 'Nunito, sans-serif', marginTop: 4 }}>
            💝 지금 바로 매칭 시작하기
          </button>
        </div>

        {/* 플랫폼 통계 */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { num: stats.total, label: '가입 선생님' },
            { num: stats.online, label: '오늘 접속중' },
            { num: stats.weeklyMatch, label: '이번주 매칭' },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, background: 'white', border: '1.5px solid #FDBCAA', borderRadius: 14, padding: '10px 6px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#F4845F', fontFamily: 'Nunito, sans-serif' }}>{s.num}</div>
              <div style={{ fontSize: 9, color: '#FDBCAA', fontWeight: 600, marginTop: 2, fontFamily: 'Nunito, sans-serif' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* 내 활동 현황 */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#3D1008', marginBottom: 10, fontFamily: 'Nunito, sans-serif' }}>내 활동 현황</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { num: myStats.likedMe, label: '나를 좋아해요', hint: '확인해보세요!', onClick: onGoLikes },
              { num: myStats.matched, label: '매칭됐어요', hint: '채팅해보세요!', onClick: onGoChat },
              { num: myStats.iLiked, label: '내가 좋아했어요', hint: '설레는 기다림 중', onClick: null },
              { num: myStats.todayRec, label: '오늘 추천', hint: '새 인연 만나요', onClick: onGoToday },
            ].map((s, i) => (
              <div key={i} onClick={s.onClick} style={{ background: 'white', border: '1.5px solid #FDBCAA', borderRadius: 14, padding: 14, cursor: s.onClick ? 'pointer' : 'default' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#F4845F', fontFamily: 'Nunito, sans-serif' }}>{s.num}</div>
                <div style={{ fontSize: 11, color: '#FDBCAA', fontWeight: 600, marginTop: 2, fontFamily: 'Nunito, sans-serif' }}>{s.label}</div>
                <div style={{ fontSize: 10, color: '#C23B22', fontWeight: 600, marginTop: 4, fontFamily: 'Nunito, sans-serif' }}>{s.hint}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 최근 활동 */}
        {recentActivity.length > 0 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#3D1008', marginBottom: 10, fontFamily: 'Nunito, sans-serif' }}>최근 활동</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentActivity.map((act, i) => (
                <div key={i} style={{ background: 'white', border: '1.5px solid #FDBCAA', borderRadius: 14, padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FFF0EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{act.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#3D1008', fontFamily: 'Nunito, sans-serif' }}>{act.title}</div>
                    <div style={{ fontSize: 10, color: '#FDBCAA', fontWeight: 600, marginTop: 2, fontFamily: 'Nunito, sans-serif' }}>{act.sub}</div>
                  </div>
                  <div onClick={act.onClick} style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 10, flexShrink: 0,
                    background: act.badge === 'new' ? 'linear-gradient(135deg, #F4845F, #E8603A)' : '#FFF0EB',
                    color: act.badge === 'new' ? 'white' : '#C23B22',
                    fontFamily: 'Nunito, sans-serif',
                    cursor: act.onClick ? 'pointer' : 'default'
                  }}>{act.badge === 'new' ? 'NEW' : '보기'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 오늘의 추천 선생님 */}
        {todayProfile && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#3D1008', marginBottom: 10, fontFamily: 'Nunito, sans-serif' }}>오늘의 추천 선생님 ⭐</div>
            <div style={{ background: 'white', border: '1.5px solid #FDBCAA', borderRadius: 16, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#FFF0EB', border: '2px solid #FDBCAA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, overflow: 'hidden' }}>
                {todayProfile.photoUrl
                  ? <img src={todayProfile.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (todayProfile.gender === '남성' ? '👨‍🏫' : '👩‍🏫')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#3D1008', fontFamily: 'Nunito, sans-serif' }}>
                  {todayProfile.name}, {todayProfile.age}
                  {todayProfile.verifyStatus === 'approved' && ' ✅'}
                </div>
                <div style={{ fontSize: 11, color: '#FDBCAA', fontWeight: 600, marginTop: 2, fontFamily: 'Nunito, sans-serif' }}>
                  {todayProfile.region} · {todayProfile.level} · {todayProfile.subject}
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                  {todayProfile.mbti && <span style={{ background: '#FFF0EB', color: '#C23B22', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, fontFamily: 'Nunito, sans-serif' }}>{todayProfile.mbti}</span>}
                  {todayProfile.hobbies && todayProfile.hobbies.slice(0, 2).map(h => (
                    <span key={h} style={{ background: '#FFF0EB', color: '#C23B22', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, fontFamily: 'Nunito, sans-serif' }}>{h}</span>
                  ))}
                </div>
              </div>
              <button onClick={handleLike} style={{ background: liked ? '#FFF0EB' : 'linear-gradient(135deg, #F4845F, #E8603A)', color: liked ? '#C23B22' : 'white', border: 'none', borderRadius: 12, padding: '10px 14px', fontSize: 16, cursor: 'pointer', flexShrink: 0 }}>
                {liked ? '✓' : '♥'}
              </button>
            </div>
          </div>
        )}

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}

export default Home;