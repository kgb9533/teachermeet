import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import VerifiedBadge from './VerifiedBadge';
import { getBlockedUids, getBlockedByUids } from './reports';

function Likes({ user, onMatch }) {
  const [likedMe, setLikedMe] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikes = async () => {
      const snap = await getDocs(collection(db, 'likes'));
      const likes = snap.docs.map(d => d.data()).filter(l => l.to === user.uid);

      // 차단한/나를 차단한 사람 가져오기
      const [iBlocked, blockedMe] = await Promise.all([
        getBlockedUids(user.uid),
        getBlockedByUids(user.uid),
      ]);

      const profiles = await Promise.all(
        likes
          .filter(l => !iBlocked.includes(l.from) && !blockedMe.includes(l.from))
          .map(async l => {
            const profileSnap = await getDoc(doc(db, 'users', l.from));
            return profileSnap.exists() ? { ...profileSnap.data(), likedAt: l.createdAt } : null;
          })
      );
      setLikedMe(profiles.filter(Boolean));
      setLoading(false);
    };
    fetchLikes();
  }, [user]);

  const handleLikeBack = async (profile) => {
    try {
      const likeId = `${user.uid}_${profile.uid}`;
      const reverseId = `${profile.uid}_${user.uid}`;
      await setDoc(doc(db, 'likes', likeId), { from: user.uid, to: profile.uid, createdAt: new Date() });
      const reverseSnap = await getDocs(collection(db, 'likes'));
      const reverse = reverseSnap.docs.find(d => d.id === reverseId);
      if (reverse) {
        const matchId = [user.uid, profile.uid].sort().join('_');
        await setDoc(doc(db, 'matches', matchId), { users: [user.uid, profile.uid], createdAt: new Date() });
        onMatch(profile);
      }
      setLikedMe(prev => prev.filter(p => p.uid !== profile.uid));
    } catch (e) { console.error('좋아요 오류:', e); }
  };

  const handlePass = (uid) => setLikedMe(prev => prev.filter(p => p.uid !== uid));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFF8F5' }}>
      <div style={{ background: 'white', padding: '6px 24px', borderBottom: '1px solid #FDBCAA' }}>
        <div style={{ fontSize: 13, color: '#FDBCAA', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
          {likedMe.length > 0 ? `${likedMe.length}명이 나를 좋아했어요!` : '아직 없어요'}
        </div>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#FDBCAA', fontSize: 14, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>불러오는 중...</div>
        </div>
      ) : likedMe.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🧡</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#3D1008', marginBottom: 8, fontFamily: 'Nunito, sans-serif' }}>아직 없어요</div>
          <div style={{ fontSize: 14, color: '#FDBCAA', textAlign: 'center', lineHeight: 1.7, fontFamily: 'Nunito, sans-serif' }}>
            스와이프를 계속하면<br />나를 좋아하는 사람이 생길 거예요!
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {likedMe.map(profile => (
              <div key={profile.uid} style={{
                background: 'white', borderRadius: 20,
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(244,132,95,0.1)',
                border: '1.5px solid #FDBCAA'
              }}>
                <div style={{ position: 'relative', aspectRatio: '3/4' }}>
                  {profile.photoUrl ? (
                    <img src={profile.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#FFF0EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                      {profile.gender === '남성' ? '👨‍🏫' : '👩‍🏫'}
                    </div>
                  )}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(61,16,8,0.75))',
                    padding: '20px 12px 12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ color: 'white', fontWeight: 800, fontSize: 15, fontFamily: 'Nunito, sans-serif' }}>{profile.name}, {profile.age}</div>
                      {profile.verifyStatus === 'approved' && <span style={{ fontSize: 13 }}>✅</span>}
                      {profile.isVerified && <VerifiedBadge size={14} />}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2, fontFamily: 'Nunito, sans-serif' }}>
                      {profile.region} · {profile.subject}
                    </div>
                    {profile.mbti && (
                      <div style={{ marginTop: 4 }}>
                        <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontFamily: 'Nunito, sans-serif' }}>{profile.mbti}</span>
                      </div>
                    )}
                  </div>
                  <div style={{
                    position: 'absolute', top: 10, right: 10,
                    background: 'rgba(244,132,95,0.9)', borderRadius: 20,
                    padding: '4px 10px', fontSize: 11, color: 'white', fontWeight: 700,
                    fontFamily: 'Nunito, sans-serif'
                  }}>🧡 좋아요</div>
                </div>
                <div style={{ padding: '10px 12px', display: 'flex', gap: 8 }}>
                  <button onClick={() => handlePass(profile.uid)} style={{
                    flex: 1, padding: '10px', background: 'white',
                    border: '1.5px solid #FDBCAA', borderRadius: 12,
                    fontSize: 18, cursor: 'pointer'
                  }}>✕</button>
                  <button onClick={() => handleLikeBack(profile)} style={{
                    flex: 2, padding: '10px',
                    background: 'linear-gradient(135deg, #F4845F, #E8603A)',
                    border: 'none', borderRadius: 12,
                    fontSize: 14, fontWeight: 700, color: 'white',
                    cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
                    whiteSpace: 'nowrap'
                  }}>♥ 좋아요!</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Likes;