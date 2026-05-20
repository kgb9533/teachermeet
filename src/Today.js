import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import VerifiedBadge from './VerifiedBadge';
import { getBlockedUids, getBlockedByUids } from './reports';
import { toArray, displayShort, commonItems } from './utils';

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

  // 1) 공통 지역 (다중 선택 지원, 개수×점수)
  const commonRegions = commonItems(profile.region, userProfile.region);
  if (commonRegions.length > 0) {
    score += commonRegions.length * 3;
    reasons.push(`📍 공통 지역 ${commonRegions.length}개`);
  }

  // 2) 공통 과목 (다중 선택 지원, 개수×점수)
  const commonSubjects = commonItems(profile.subject, userProfile.subject);
  if (commonSubjects.length > 0) {
    score += commonSubjects.length * 2;
    reasons.push(`📚 공통 과목 ${commonSubjects.length}개`);
  }

  // 3) 공통 학교 급별 (다중 선택 지원, 개수×점수)
  const commonLevels = commonItems(profile.level, userProfile.level);
  if (commonLevels.length > 0) {
    score += commonLevels.length * 2;
    reasons.push(`🏫 같은 학교급 ${commonLevels.length}개`);
  }

  // 4) 공통 취미 (다중 선택 지원, 개수×점수)
  const commonHobbies = commonItems(profile.hobbies, userProfile.hobbies);
  if (commonHobbies.length > 0) {
    score += commonHobbies.length * 2;
    reasons.push(`🎯 공통 취미 ${commonHobbies.length}개`);
  }

  // 5) 공통 라이프스타일 (음식 취향, 여행 스타일, 주말 활동 - 다중 선택 지원)
  const commonFood = commonItems(profile.foodPref, userProfile.foodPref);
  if (commonFood.length > 0) {
    score += commonFood.length * 1;
    reasons.push(`🍽️ 공통 음식 취향 ${commonFood.length}개`);
  }
  const commonTravel = commonItems(profile.travelStyle, userProfile.travelStyle);
  if (commonTravel.length > 0) {
    score += commonTravel.length * 1;
    reasons.push(`✈️ 비슷한 여행 스타일 ${commonTravel.length}개`);
  }
  const commonWeekend = commonItems(profile.weekendActivity, userProfile.weekendActivity);
  if (commonWeekend.length > 0) {
    score += commonWeekend.length * 1;
    reasons.push(`🌿 비슷한 주말 활동 ${commonWeekend.length}개`);
  }

  // 6) 공통 연애 스타일 (다중 선택 지원)
  const commonLove = commonItems(profile.loveStyle, userProfile.loveStyle);
  if (commonLove.length > 0) {
    score += commonLove.length * 2;
    reasons.push(`💕 비슷한 연애 스타일 ${commonLove.length}개`);
  }
  const commonDate = commonItems(profile.dateStyle, userProfile.dateStyle);
  if (commonDate.length > 0) {
    score += commonDate.length * 1;
    reasons.push(`☕ 비슷한 데이트 스타일 ${commonDate.length}개`);
  }

  // 7) MBTI 궁합 (단일값 그대로)
  if (profile.mbti && userProfile.mbti) {
    const compatible = MBTI_COMPATIBLE[userProfile.mbti] || [];
    if (compatible.includes(profile.mbti)) { score += 2; reasons.push(`✨ MBTI 궁합`); }
  }

  // 8) 결혼 의향 (단일값 그대로)
  if (profile.marriageIntent && userProfile.marriageIntent && profile.marriageIntent === userProfile.marriageIntent) {
    score += 1;
    reasons.push('💍 비슷한 연애 의향');
  }

  // 9) 아직 안 만난 분 보너스
  if (!seenUids.includes(profile.uid)) {
    score += 1;
    reasons.push('🆕 아직 만나지 않은 분');
  }

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
    <div style={{
      background: 'white',
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(232,96,58,0.15)',
      marginBottom: 16,
      position: 'relative',
    }}>
      {/* 사진 영역 */}
      <div style={{ position: 'relative', height: 200, background: 'linear-gradient(135deg, #FFE5D9, #FFF0EB)' }}>
        {profile.photoUrl ? (
          <img src={profile.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>
            {profile.gender === '남성' ? '👨‍🏫' : '👩‍🏫'}
          </div>
        )}
        {/* 그라데이션 오버레이 + 이름 */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(61,16,8,0.85))',
          padding: '36px 16px 14px',
          color: 'white',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 19, fontWeight: 800, fontFamily: 'Nunito, sans-serif' }}>{profile.name}</span>
            <span style={{ fontSize: 15, fontWeight: 600, opacity: 0.85, fontFamily: 'Nunito, sans-serif' }}>{profile.age}</span>
            {profile.verifyStatus === 'approved' && <span style={{ fontSize: 13, marginLeft: 2 }}>✅</span>}
            {profile.isVerified && <VerifiedBadge size={14} />}
          </div>
          <div style={{ fontSize: 12, opacity: 0.9, fontWeight: 600, fontFamily: 'Nunito, sans-serif' }}>
            📍 {displayShort(profile.region, 2)}
            {!toArray(profile.level).length || !toArray(profile.region).length ? '' : ' · '}
            {displayShort(profile.level, 2)}
          </div>
        </div>
      </div>

      {/* 정보 영역 */}
      <div style={{ padding: '14px 16px 0' }}>
        {/* 잘 맞는 이유 카드 */}
        {reasons && reasons.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #FFF0EB, #FFE5D9)',
            borderRadius: 14,
            padding: '10px 12px',
            marginBottom: 12,
          }}>
            <div style={{
              fontSize: 10,
              fontWeight: 800,
              color: '#9C5A4A',
              marginBottom: 6,
              letterSpacing: '0.5px',
              fontFamily: 'Nunito, sans-serif',
            }}>
              ✨ 잘 맞는 이유
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {reasons.slice(0, 3).map((reason, i) => (
                <span key={i} style={{
                  background: 'white',
                  color: '#C23B22',
                  padding: '3px 9px',
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'Nunito, sans-serif',
                }}>
                  {reason}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 추가 정보 태그들 */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
          {toArray(profile.subject).length > 0 && (
            <span style={{
              background: '#FFFAF8',
              color: '#9C5A4A',
              padding: '3px 9px',
              borderRadius: 10,
              fontSize: 10,
              fontWeight: 700,
              border: '1px solid #FFD7C8',
              fontFamily: 'Nunito, sans-serif',
            }}>
              📚 {displayShort(profile.subject, 2)}
            </span>
          )}
          {profile.mbti && (
            <span style={{
              background: '#FFFAF8',
              color: '#9C5A4A',
              padding: '3px 9px',
              borderRadius: 10,
              fontSize: 10,
              fontWeight: 700,
              border: '1px solid #FFD7C8',
              fontFamily: 'Nunito, sans-serif',
            }}>
              {profile.mbti}
            </span>
          )}
          {toArray(profile.hobbies).slice(0, 2).map(h => {
            const isCommon = toArray(userProfile.hobbies).includes(h);
            return (
              <span key={h} style={{
                background: isCommon ? '#FFF0EB' : '#FFFAF8',
                color: isCommon ? '#C23B22' : '#9C5A4A',
                padding: '3px 9px',
                borderRadius: 10,
                fontSize: 10,
                fontWeight: 700,
                border: isCommon ? '1px solid #FDBCAA' : '1px solid #FFD7C8',
                fontFamily: 'Nunito, sans-serif',
              }}>
                {h}{isCommon ? ' ✓' : ''}
              </span>
            );
          })}
          {profile.marriageIntent && (
            <span style={{
              background: '#FFFAF8',
              color: '#9C5A4A',
              padding: '3px 9px',
              borderRadius: 10,
              fontSize: 10,
              fontWeight: 700,
              border: '1px solid #FFD7C8',
              fontFamily: 'Nunito, sans-serif',
            }}>
              💍 {profile.marriageIntent}
            </span>
          )}
        </div>

        {/* 자기소개 */}
        {profile.bio && (
          <div style={{ marginBottom: 12 }}>
            <div style={{
              background: '#FFFAF8',
              border: '1px solid #FFD7C8',
              padding: '10px 12px',
              borderRadius: 12,
            }}>
              <div style={{
                fontSize: 9,
                fontWeight: 800,
                color: '#C23B22',
                marginBottom: 4,
                letterSpacing: '0.5px',
                fontFamily: 'Nunito, sans-serif',
              }}>
                💬 자기소개
              </div>
              <div style={{
                fontSize: 13,
                color: '#3D1008',
                lineHeight: 1.6,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: expanded ? 'unset' : 2,
                WebkitBoxOrient: 'vertical',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
              }}>
                {profile.bio}
              </div>
            </div>
            {profile.bio.length > 60 && (
              <button onClick={() => setExpanded(!expanded)} style={{
                background: 'none',
                border: 'none',
                color: '#F4845F',
                fontSize: 11,
                cursor: 'pointer',
                fontWeight: 700,
                padding: '6px 0 0',
                fontFamily: 'Nunito, sans-serif',
              }}>
                {expanded ? '접기 ▲' : '더보기 ▼'}
              </button>
            )}
          </div>
        )}

        {/* 액션 버튼 */}
        {liked ? (
          <div style={{
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(135deg, #FFF0EB, #FFE5D9)',
            borderRadius: 12,
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 800,
            color: '#C23B22',
            fontFamily: 'Nunito, sans-serif',
            marginBottom: 12,
          }}>
            💕 좋아요를 보냈어요!
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button onClick={() => setPassed(true)} style={{
              flex: 1,
              padding: '12px',
              background: 'white',
              border: '1.5px solid #FDBCAA',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              color: '#9C5A4A',
              cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif',
              whiteSpace: 'nowrap',
            }}>
              🙏 괜찮아요
            </button>
            <button onClick={handleLike} style={{
              flex: 2,
              padding: '12px',
              background: 'linear-gradient(135deg, #F4845F, #E8603A)',
              border: 'none',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              color: 'white',
              cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(244,132,95,0.35)',
            }}>
              ♥ 좋아요
            </button>
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

  const getCountdown = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    // 진행률: 하루 24시간 중 얼마나 지났는지 (0~100%)
    const totalDayMs = 24 * 60 * 60 * 1000;
    const elapsed = totalDayMs - diff;
    const percent = Math.min(100, Math.max(0, (elapsed / totalDayMs) * 100));
    return { hours, minutes, percent };
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
      <div style={{ background: 'white', padding: '14px 20px', borderBottom: '1px solid #FDBCAA' }}>
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
            <div style={{ fontSize: 28, flexShrink: 0 }}>⭐</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'white', fontFamily: 'Nunito, sans-serif', lineHeight: 1.3 }}>
                잘 맞는 선생님 {recommendations.length}명을
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'white', fontFamily: 'Nunito, sans-serif', lineHeight: 1.3 }}>
                골라드렸어요!
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
            TODAY
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {recommendations.map(({ profile, reasons }) => (
          <ProfileCard key={profile.uid} profile={profile} userProfile={userProfile} reasons={reasons} user={user} onMatch={onMatch} />
        ))}
        {(() => {
          const cd = getCountdown();
          return (
            <div style={{ padding: '12px 4px 20px' }}>
              <div style={{ background: 'white', border: '1.5px solid #FDBCAA', borderRadius: 16, padding: '14px 18px', fontFamily: 'Nunito, sans-serif' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16 }}>⏰</span>
                    <span style={{ fontSize: 12, color: '#9C5A4A', fontWeight: 700 }}>다음 추천 카운트다운</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#E8603A', fontFeatureSettings: "'tnum'" }}>
                    {String(cd.hours).padStart(2, '0')}:{String(cd.minutes).padStart(2, '0')}
                  </div>
                </div>
                <div style={{ background: '#FFF0EB', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    background: 'linear-gradient(90deg, #F4845F, #E8603A)',
                    height: '100%',
                    width: `${cd.percent}%`,
                    borderRadius: 4,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default Today;