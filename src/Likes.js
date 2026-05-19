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
      <div style={{ background: 'white', padding: '14px 20px', borderBottom: '1px solid #FDBCAA' }}>
        {likedMe.length > 0 ? (
          <div style={{
            background: 'linear-gradient(135deg, #F4845F, #E8603A)',
            borderRadius: 14,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            boxShadow: '0 4px 12px rgba(232, 96, 58, 0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>💕</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'white', fontFamily: 'Nunito, sans-serif', lineHeight: 1.3 }}>
                  {likedMe.length}명의 선생님이
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'white', fontFamily: 'Nunito, sans-serif', lineHeight: 1.3 }}>
                  당신을 좋아해요!
                </div>
              </div>
            </div>
            <div style={{
              background: 'white',
              color: '#E8603A',
              fontSize: 11,
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: 12,
              fontFamily: 'Nunito, sans-serif',
              flexShrink: 0,
            }}>
              NEW
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: '#9C5A4A', fontFamily: 'Nunito, sans-serif', fontWeight: 600, textAlign: 'center', padding: '4px 0' }}>
            💝 새로운 좋아요를 기다리는 중...
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#FDBCAA', fontSize: 14, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>불러오는 중...</div>
        </div>
      ) : likedMe.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>💝</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: '#3D1008', marginBottom: 10, fontFamily: 'Nunito, sans-serif' }}>아직 좋아요가 없어요</div>
          <div style={{ fontSize: 14, color: '#9C5A4A', textAlign: 'center', lineHeight: 1.8, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
            매력적인 프로필을 완성하고<br />스와이프를 계속해보세요 ✨
          </div>
          <div style={{ marginTop: 16, fontSize: 13, color: '#C23B22', fontWeight: 700, fontFamily: 'Nunito, sans-serif', background: '#FFF0EB', padding: '8px 16px', borderRadius: 20 }}>
            당신을 좋아할 사람이 분명 있어요 💕
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {likedMe.map(profile => (
              <div key={profile.uid} style={{
                background: 'white',
                borderRadius: 18,
                overflow: 'hidden',
                boxShadow: '0 6px 20px rgba(232,96,58,0.12)',
                position: 'relative',
              }}>
                {/* 사진 영역 (정사각형) */}
                <div style={{ position: 'relative', aspectRatio: '1/1', background: 'linear-gradient(135deg, #FFE5D9, #FFF0EB)' }}>
                  {profile.photoUrl ? (
                    <img src={profile.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>
                      {profile.gender === '남성' ? '👨‍🏫' : '👩‍🏫'}
                    </div>
                  )}
                  {/* 우측 상단 좋아함 뱃지 */}
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'linear-gradient(135deg, #F4845F, #E8603A)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: 12,
                    fontSize: 9,
                    fontWeight: 800,
                    boxShadow: '0 2px 6px rgba(244,132,95,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    fontFamily: 'Nunito, sans-serif',
                  }}>
                    <span>💕</span><span>좋아함</span>
                  </div>
                </div>

                {/* 정보 영역 */}
                <div style={{ padding: '12px 12px 10px' }}>
                  {/* 이름·나이 + 인증 뱃지 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#3D1008', fontFamily: 'Nunito, sans-serif' }}>{profile.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#9C5A4A', fontFamily: 'Nunito, sans-serif' }}>{profile.age}</span>
                    {profile.verifyStatus === 'approved' && <span style={{ fontSize: 12 }}>✅</span>}
                    {profile.isVerified && <VerifiedBadge size={13} />}
                  </div>

                  {/* 정보 태그들 */}
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                    {profile.region && (
                      <span style={{ background: '#FFF0EB', color: '#C23B22', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>
                        📍 {profile.region}
                      </span>
                    )}
                    {profile.subject && (
                      <span style={{ background: '#FFF0EB', color: '#C23B22', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>
                        📚 {profile.subject}
                      </span>
                    )}
                    {profile.mbti && (
                      <span style={{ background: '#FFF0EB', color: '#C23B22', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>
                        {profile.mbti}
                      </span>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handlePass(profile.uid)} style={{
                      flex: 1,
                      padding: '8px 4px',
                      background: 'white',
                      border: '1.5px solid #FDBCAA',
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#9C5A4A',
                      cursor: 'pointer',
                      fontFamily: 'Nunito, sans-serif',
                      whiteSpace: 'nowrap',
                    }}>🙏</button>
                    <button onClick={() => handleLikeBack(profile)} style={{
                      flex: 2,
                      padding: '8px 4px',
                      background: 'linear-gradient(135deg, #F4845F, #E8603A)',
                      border: 'none',
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'white',
                      cursor: 'pointer',
                      fontFamily: 'Nunito, sans-serif',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 6px rgba(244,132,95,0.3)',
                    }}>♥ 좋아요</button>
                  </div>
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