import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import VerifiedBadge from './VerifiedBadge';
import { getBlockedUids, getBlockedByUids } from './reports';

const MBTI_COMPATIBLE = {
  'INTJ': ['ENFP', 'ENTP'], 'INTP': ['ENFJ', 'ENTJ'],
  'ENTJ': ['INFP', 'INTP'], 'ENTP': ['INFJ', 'INTJ'],
  'INFJ': ['ENFP', 'ENTP'], 'INFP': ['ENFJ', 'ENTJ'],
  'ENFJ': ['INFP', 'INTP'], 'ENFP': ['INFJ', 'INTJ'],
  'ISTJ': ['ESFP', 'ESTP'], 'ISFJ': ['ESFP', 'ESTP'],
  'ESTJ': ['ISFP', 'ISTP'], 'ESFJ': ['ISFP', 'ISTP'],
  'ISTP': ['ESFJ', 'ESTJ'], 'ISFP': ['ESFJ', 'ESTJ'],
  'ESTP': ['ISFJ', 'ISTJ'], 'ESFP': ['ISFJ', 'ISTJ'],
};

function calculateScore(profile, userProfile, seenUids) {
  let score = 0; let reasons = [];
  if (profile.region === userProfile.region) { score += 3; reasons.push(`📍 같은 지역 (${profile.region})`); }
  if (profile.hobbies && userProfile.hobbies) {
    const common = profile.hobbies.filter(h => userProfile.hobbies.includes(h));
    if (common.length > 0) { score += common.length * 2; reasons.push(`🎯 공통 취미 ${common.length}개`); }
  }
  if (profile.mbti && userProfile.mbti) {
    const compatible = MBTI_COMPATIBLE[userProfile.mbti] || [];
    if (compatible.includes(profile.mbti)) { score += 2; reasons.push(`✨ MBTI 궁합`); }
  }
  if (!seenUids.includes(profile.uid)) { score += 1; reasons.push('🆕 아직 만나지 않은 분'); }
  if (profile.marriageIntent && userProfile.marriageIntent && profile.marriageIntent === userProfile.marriageIntent) { score += 1; reasons.push('💍 비슷한 연애 의향'); }
  return { score, reasons };
}

function ProfileCard({ profile, userProfile, reasons, user, onMatch }) {
  const [liked, setLiked] = useState(false);
  const [passed, setPassed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleLike = async () => {
    try {
      const likeId = `${user.uid}_${profile.uid}`;
      const reverseId = `${profile.uid}_${user.uid}`;
      await setDoc(doc(db, 'likes', likeId), { from: user.uid, to: profile.uid, createdAt: new Date() });
      const reverseSnap = await getDoc(doc(db, 'likes', reverseId));
      if (reverseSnap.exists()) {
        const matchId = [user.uid, profile.uid].sort().join('_');
        await setDoc(doc(db, 'matches', matchId), { users: [user.uid, profile.uid], createdAt: new Date() });
        onMatch(profile);
      }
      setLiked(true);
    } catch (e) { console.error('오류:', e); }
  };

  if (passed) return null;

  return (
    <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 16px rgba(244,132,95,0.08)', border: '1px solid #FDBCAA', marginBottom: 16 }}>
      <div style={{ position: 'relative', height: 220 }}>
        {profile.photoUrl ? (
          <img src={profile.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#FFF0EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
            {profile.gender === '남성' ? '👨‍🏫' : '👩‍🏫'}
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(61,16,8,0.8))', padding: '30px 16px 14px', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'white', fontFamily: 'Nunito, sans-serif' }}>{profile.name}, {profile.age}</div>
            {profile.verifyStatus === 'approved' && <span style={{ fontSize: 14 }}>✅</span>}
            {profile.isVerified && <VerifiedBadge size={15} />}
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2, fontFamily: 'Nunito, sans-serif' }}>📍 {profile.region} · {profile.level}</div>
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {reasons.slice(0, 2).map((reason, i) => (
            <span key={i} style={{ background: '#FFF0EB', color: '#C23B22', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'Nunito, sans-serif' }}>{reason}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {profile.mbti && <span style={{ background: '#FFF0EB', color: '#C23B22', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: 'Nunito, sans-serif' }}>{profile.mbti}</span>}
          {profile.marriageIntent && <span style={{ background: '#fff3f3', color: '#ff6b6b', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontFamily: 'Nunito, sans-serif' }}>{profile.marriageIntent}</span>}
          {profile.hobbies && profile.hobbies.slice(0, 2).map(h => (
            <span key={h} style={{ background: userProfile.hobbies?.includes(h) ? '#FFF0EB' : '#f5f5f5', color: userProfile.hobbies?.includes(h) ? '#C23B22' : '#555', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: userProfile.hobbies?.includes(h) ? 700 : 400, fontFamily: 'Nunito, sans-serif' }}>{h}{userProfile.hobbies?.includes(h) ? ' ✓' : ''}</span>
          ))}
        </div>
        {profile.bio && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6, background: '#FFFAF8', padding: '10px 12px', borderRadius: 10, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: expanded ? 'unset' : 2, WebkitBoxOrient: 'vertical', fontFamily: 'Nunito, sans-serif' }}>{profile.bio}</div>
            {profile.bio.length > 60 && <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: 'none', color: '#F4845F', fontSize: 12, cursor: 'pointer', fontWeight: 700, padding: '4px 0', fontFamily: 'Nunito, sans-serif' }}>{expanded ? '접기 ▲' : '더보기 ▼'}</button>}
          </div>
        )}
        {liked ? (
          <div style={{ width: '100%', padding: '12px', background: '#FFF0EB', borderRadius: 12, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#C23B22', fontFamily: 'Nunito, sans-serif' }}>🧡 좋아요를 보냈어요!</div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setPassed(true)} style={{ flex: 1, padding: '12px', background: 'white', border: '1.5px solid #FDBCAA', borderRadius: 12, fontSize: 18, cursor: 'pointer' }}>✕</button>
            <button onClick={handleLike} style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, #F4845F, #E8603A)', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>♥ 좋아요!</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Today({ user, userProfile, onMatch }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToday = async () => {
      const snap = await getDocs(collection(db, 'users'));
      let profiles = snap.docs.map(d => d.data()).filter(p => p.uid !== user.uid);
      if (profiles.length === 0) { setLoading(false); return; }

      // 차단한/나를 차단한 사람 가져오기
      const [iBlocked, blockedMe] = await Promise.all([
        getBlockedUids(user.uid),
        getBlockedByUids(user.uid),
      ]);

      // 차단 관계인 사람 제외
      profiles = profiles.filter(p =>
        !iBlocked.includes(p.uid) && !blockedMe.includes(p.uid)
      );

      if (profiles.length === 0) { setLoading(false); return; }

      const likesSnap = await getDocs(collection(db, 'likes'));
      const seenUids = likesSnap.docs.filter(d => d.data().from === user.uid).map(d => d.data().to);
      const scored = profiles.map(profile => {
        const { score, reasons } = calculateScore(profile, userProfile, seenUids);
        return { profile, score, reasons };
      });
      scored.sort((a, b) => b.score - a.score);
      setRecommendations(scored.slice(0, 5));
      setLoading(false);
    };
    fetchToday();
  }, [user, userProfile]);

  const getTimeUntilMidnight = () => {
    const now = new Date(); const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;
    return `${Math.floor(diff / (1000 * 60 * 60))}시간 ${Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))}분`;
  };

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF8F5' }}>
      <div style={{ color: '#9C5A4A', fontSize: 14, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>잘 맞는 선생님을 찾는 중... ✨</div>
    </div>
  );

  if (recommendations.length === 0) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, background: '#FFF8F5' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🌱</div>
      <div style={{ fontSize: 19, fontWeight: 800, color: '#3D1008', marginBottom: 10, fontFamily: 'Nunito, sans-serif' }}>추천을 준비 중이에요</div>
      <div style={{ fontSize: 14, color: '#9C5A4A', textAlign: 'center', lineHeight: 1.8, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
        곧 잘 맞는 선생님을<br />찾아드릴게요!
      </div>
      <div style={{ marginTop: 16, fontSize: 13, color: '#C23B22', fontWeight: 700, fontFamily: 'Nunito, sans-serif', background: '#FFF0EB', padding: '8px 16px', borderRadius: 20 }}>
        조금만 기다려주세요 ✨
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFF8F5' }}>
      <div style={{ background: 'white', padding: '6px 24px', borderBottom: '1px solid #FDBCAA' }}>
        <div style={{ fontSize: 13, color: '#FDBCAA', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>나와 잘 맞는 선생님 {recommendations.length}명을 골라드려요</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {recommendations.map(({ profile, reasons }) => (
          <ProfileCard key={profile.uid} profile={profile} userProfile={userProfile} reasons={reasons} user={user} onMatch={onMatch} />
        ))}
        <div style={{ textAlign: 'center', padding: '8px 0 16px', fontSize: 13, color: '#FDBCAA', fontFamily: 'Nunito, sans-serif' }}>
          다음 추천까지 <span style={{ color: '#F4845F', fontWeight: 700 }}>{getTimeUntilMidnight()}</span>
        </div>
      </div>
    </div>
  );
}

export default Today;