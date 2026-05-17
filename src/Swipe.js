// src/Swipe.js
// 데이팅 앱 스와이프 화면
// - 카드 보기 (사진/이름/나이/지역/과목/MBTI/자기소개)
// - 좋아요/패스 버튼 + 드래그 스와이프
// - 슈퍼좋아요 (EDU 50 소모)
// - 매칭 처리
// - 인증 뱃지 (교원 ✅ + 본인 ✓)

import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import VerifiedBadge from './VerifiedBadge';
import { spendEdu, subscribeEduBalance } from './eduWallet';
import { EDU_COSTS } from './eduPackages';
import { getBlockedUids, getBlockedByUids } from './reports';
import { recordProfileView } from './stats';

function Swipe({ user, userProfile, theme, onMatch, onLogout }) {
  const [candidates, setCandidates] = useState([]); // 보여줄 사용자 목록
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [eduBalance, setEduBalance] = useState(0); // 실시간 EDU 잔액

  // 드래그 상태
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef(0);
  const cardRef = useRef(null);

  // 현재 카드
  const currentCard = candidates[currentIndex];

  // ===== 카드 볼 때 조회 기록 =====
  useEffect(() => {
    if (currentCard?.uid && user?.uid) {
      recordProfileView(user.uid, currentCard.uid);
    }
  }, [currentCard, user]);

  // ===== EDU 잔액 실시간 구독 =====
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeEduBalance(user.uid, (balance) => {
      setEduBalance(balance);
    });
    return () => unsub();
  }, [user]);

  // ===== 사용자 목록 불러오기 =====
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        // 1) 모든 사용자 가져오기
        const usersSnap = await getDocs(collection(db, 'users'));
        const allUsers = usersSnap.docs
          .map(d => ({ uid: d.id, ...d.data() }))
          .filter(u => u.uid !== user.uid) // 본인 제외
          .filter(u => u.name && u.age); // 프로필 미완성 제외

        // 2) 이미 좋아요/패스한 사람 가져오기
        const likesSnap = await getDocs(collection(db, 'likes'));
        const myActions = likesSnap.docs
          .map(d => d.data())
          .filter(l => l.from === user.uid)
          .map(l => l.to);

        const passesSnap = await getDocs(collection(db, 'passes'));
        const myPasses = passesSnap.docs
          .map(d => d.data())
          .filter(p => p.from === user.uid)
          .map(p => p.to);

        // 2-1) 차단한 / 나를 차단한 사람 가져오기
        const [iBlocked, blockedMe] = await Promise.all([
          getBlockedUids(user.uid),
          getBlockedByUids(user.uid),
        ]);

        // 3) 제외 처리 (좋아요/패스/차단/나를 차단)
        const filtered = allUsers.filter(u =>
          !myActions.includes(u.uid) &&
          !myPasses.includes(u.uid) &&
          !iBlocked.includes(u.uid) &&
          !blockedMe.includes(u.uid)
        );

        // 4) 셔플 (랜덤 정렬)
        const shuffled = filtered.sort(() => Math.random() - 0.5);
        
        setCandidates(shuffled);
        setLoading(false);
      } catch (e) {
        console.error('사용자 불러오기 오류:', e);
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [user]);

  // ===== 매칭 처리 함수 =====
  const checkMatch = async (targetUid) => {
    // 상대방이 나를 이미 좋아요했는지 확인
    const reverseId = `${targetUid}_${user.uid}`;
    const reverseSnap = await getDoc(doc(db, 'likes', reverseId));
    if (reverseSnap.exists()) {
      // 매칭! matches 컬렉션에 저장
      const matchId = [user.uid, targetUid].sort().join('_');
      await setDoc(doc(db, 'matches', matchId), {
        users: [user.uid, targetUid],
        createdAt: new Date(),
      });
      // App.js에 매칭 알림
      const matchedProfile = candidates[currentIndex];
      onMatch(matchedProfile);
    }
  };

  // ===== 좋아요 =====
  const handleLike = async () => {
    if (!currentCard || actionLoading) return;
    setActionLoading(true);
    try {
      const likeId = `${user.uid}_${currentCard.uid}`;
      await setDoc(doc(db, 'likes', likeId), {
        from: user.uid,
        to: currentCard.uid,
        createdAt: new Date(),
      });
      await checkMatch(currentCard.uid);
      nextCard();
    } catch (e) {
      console.error('좋아요 오류:', e);
    }
    setActionLoading(false);
  };

  // ===== 패스 =====
  const handlePass = async () => {
    if (!currentCard || actionLoading) return;
    setActionLoading(true);
    try {
      const passId = `${user.uid}_${currentCard.uid}`;
      await setDoc(doc(db, 'passes', passId), {
        from: user.uid,
        to: currentCard.uid,
        createdAt: new Date(),
      });
      nextCard();
    } catch (e) {
      console.error('패스 오류:', e);
    }
    setActionLoading(false);
  };

  // ===== 슈퍼좋아요 (EDU 50 소모) =====
  const handleSuperLike = async () => {
    if (!currentCard || actionLoading) return;

    const cost = EDU_COSTS.SUPER_LIKE; // 50

    // EDU 잔액 확인 (실시간 구독값 사용)
    if (eduBalance < cost) {
      alert(`슈퍼좋아요는 ${cost} EDU가 필요해요.\n현재 잔액: ${eduBalance} EDU\n\n충전 후 다시 시도해주세요!`);
      return;
    }

    if (!window.confirm(`🌟 슈퍼좋아요를 보내시겠어요?\n(${cost} EDU 소모 · 잔액: ${eduBalance} EDU)`)) return;

    setActionLoading(true);
    try {
      // 1) EDU 차감 (트랜잭션 - 잔액 부족 시 자동 거부)
      await spendEdu(user.uid, cost, 'SUPER_LIKE', { targetUid: currentCard.uid });

      // 2) 슈퍼좋아요 등록
      const likeId = `${user.uid}_${currentCard.uid}`;
      await setDoc(doc(db, 'likes', likeId), {
        from: user.uid,
        to: currentCard.uid,
        isSuperLike: true,
        createdAt: new Date(),
      });

      // 3) 매칭 체크
      await checkMatch(currentCard.uid);
      nextCard();
    } catch (e) {
      console.error('슈퍼좋아요 오류:', e);
      if (e.message === 'INSUFFICIENT_EDU') {
        alert('EDU가 부족해요. 충전 후 다시 시도해주세요!');
      } else {
        alert('슈퍼좋아요 처리 중 오류가 발생했어요. 다시 시도해주세요.');
      }
    }
    setActionLoading(false);
  };

  // ===== 다음 카드로 =====
  const nextCard = () => {
    setDragX(0);
    setCurrentIndex(prev => prev + 1);
  };

  // ===== 드래그 핸들러 (마우스/터치) =====
  const handleDragStart = (clientX) => {
    setDragging(true);
    dragStartX.current = clientX;
  };

  const handleDragMove = (clientX) => {
    if (!dragging) return;
    setDragX(clientX - dragStartX.current);
  };

  const handleDragEnd = () => {
    if (!dragging) return;
    setDragging(false);

    // 드래그 거리가 100px 이상이면 액션 실행
    if (dragX > 100) {
      handleLike(); // 오른쪽 → 좋아요
    } else if (dragX < -100) {
      handlePass(); // 왼쪽 → 패스
    } else {
      setDragX(0); // 원위치
    }
  };

  // ===== 로딩 화면 =====
  if (loading) {
    return (
      <div style={styles.center}>
        <div style={{ fontSize: 40 }}>💕</div>
        <div style={styles.loadingText}>선생님들을 찾고 있어요...</div>
      </div>
    );
  }

  // ===== 더 이상 볼 사람이 없을 때 =====
  if (currentIndex >= candidates.length) {
    return (
      <div style={styles.center}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <div style={styles.emptyTitle}>오늘은 여기까지!</div>
        <div style={styles.emptyText}>
          모든 선생님을 다 보셨어요.<br />
          내일 새로운 선생님들을 만나보세요 ✨
        </div>
      </div>
    );
  }

  // ===== 메인 스와이프 카드 =====
  const rotation = dragX * 0.05; // 드래그할 때 살짝 기울임
  const opacity = 1 - Math.min(Math.abs(dragX) / 200, 0.5); // 멀어질수록 살짝 투명

  return (
    <div style={styles.container}>
      {/* 카드 영역 */}
      <div style={styles.cardArea}>
        <div
          ref={cardRef}
          style={{
            ...styles.card,
            transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
            opacity,
            transition: dragging ? 'none' : 'all 0.3s ease',
            cursor: dragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseMove={(e) => handleDragMove(e.clientX)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
          onTouchEnd={handleDragEnd}
        >
          {/* 좋아요/패스 라벨 (드래그 시 표시) */}
          {dragX > 30 && (
            <div style={{ ...styles.swipeLabel, ...styles.likeLabel, opacity: Math.min(dragX / 100, 1) }}>
              💕 LIKE
            </div>
          )}
          {dragX < -30 && (
            <div style={{ ...styles.swipeLabel, ...styles.passLabel, opacity: Math.min(-dragX / 100, 1) }}>
              ✕ PASS
            </div>
          )}

          {/* 프로필 사진 */}
          <div style={styles.photo}>
            {currentCard.photoUrl ? (
              <img src={currentCard.photoUrl} alt="" style={styles.photoImg} draggable={false} />
            ) : (
              <div style={styles.photoPlaceholder}>
                {currentCard.gender === '남성' ? '👨‍🏫' : '👩‍🏫'}
              </div>
            )}
            
            {/* 그라디언트 + 정보 오버레이 */}
            <div style={styles.overlay}>
              <div style={styles.nameRow}>
                <span style={styles.name}>{currentCard.name}, {currentCard.age}</span>
                {currentCard.verifyStatus === 'approved' && <span style={{ fontSize: 16 }}>✅</span>}
                {currentCard.isVerified && <VerifiedBadge size={16} />}
              </div>
              <div style={styles.subInfo}>
                {currentCard.region && `${currentCard.region}`}
                {currentCard.subject && ` · ${currentCard.subject}`}
              </div>
              {currentCard.mbti && (
                <div style={styles.tagRow}>
                  <span style={styles.tag}>{currentCard.mbti}</span>
                </div>
              )}
            </div>
          </div>

          {/* 자기소개 (사진 아래) */}
          {currentCard.bio && (
            <div style={styles.bio}>
              <div style={styles.bioLabel}>자기소개</div>
              <div style={styles.bioText}>{currentCard.bio}</div>
            </div>
          )}
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div style={styles.actions}>
        <button
          onClick={handlePass}
          disabled={actionLoading}
          style={{ ...styles.actionBtn, ...styles.passBtn }}
          title="패스"
        >
          ✕
        </button>
        <button
          onClick={handleSuperLike}
          disabled={actionLoading}
          style={{ ...styles.actionBtn, ...styles.superBtn }}
          title="슈퍼좋아요 (50 EDU)"
        >
          🌟
        </button>
        <button
          onClick={handleLike}
          disabled={actionLoading}
          style={{ ...styles.actionBtn, ...styles.likeBtn }}
          title="좋아요"
        >
          💕
        </button>
      </div>

      {/* 진행 상황 + EDU 잔액 */}
      <div style={styles.progress}>
        <span>{currentIndex + 1} / {candidates.length}</span>
        <span style={styles.eduDisplay}>💎 {eduBalance.toLocaleString()} EDU</span>
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
    padding: '12px 16px',
    fontFamily: 'Nunito, sans-serif',
    overflow: 'hidden',
  },
  cardArea: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  card: {
    background: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 360,
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(244,132,95,0.15)',
    border: '1px solid #FDBCAA',
    userSelect: 'none',
    position: 'relative',
  },
  photo: {
    position: 'relative',
    aspectRatio: '3/4',
    background: '#FFF0EB',
  },
  photoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    pointerEvents: 'none',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 80,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(transparent, rgba(61,16,8,0.85))',
    padding: '30px 16px 14px',
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: 'white',
    marginBottom: 4,
  },
  name: {
    fontWeight: 800,
    fontSize: 22,
  },
  subInfo: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginBottom: 8,
  },
  tagRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  tag: {
    background: 'rgba(255,255,255,0.25)',
    color: 'white',
    padding: '4px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 700,
    backdropFilter: 'blur(8px)',
  },
  bio: {
    padding: '14px 16px',
    borderTop: '1px solid #FFF0EB',
  },
  bioLabel: {
    fontSize: 11,
    color: '#C23B22',
    fontWeight: 700,
    marginBottom: 4,
  },
  bioText: {
    fontSize: 13,
    color: '#3D1008',
    lineHeight: 1.6,
  },
  swipeLabel: {
    position: 'absolute',
    top: 30,
    padding: '8px 18px',
    border: '4px solid',
    borderRadius: 12,
    fontSize: 22,
    fontWeight: 900,
    zIndex: 5,
    transform: 'rotate(-15deg)',
  },
  likeLabel: {
    right: 24,
    color: '#22C55E',
    borderColor: '#22C55E',
    background: 'rgba(255,255,255,0.9)',
  },
  passLabel: {
    left: 24,
    color: '#EF4444',
    borderColor: '#EF4444',
    background: 'rgba(255,255,255,0.9)',
    transform: 'rotate(15deg)',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: 16,
    padding: '16px 0 8px',
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    border: 'none',
    fontSize: 26,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'transform 0.2s',
    fontFamily: 'inherit',
  },
  passBtn: {
    background: 'white',
    color: '#EF4444',
    border: '2px solid #EF4444',
  },
  superBtn: {
    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
    color: 'white',
  },
  likeBtn: {
    background: 'linear-gradient(135deg, #F4845F, #E8603A)',
    color: 'white',
  },
  progress: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 11,
    color: '#9C5A4A',
    paddingBottom: 4,
    paddingTop: 4,
    paddingLeft: 8,
    paddingRight: 8,
  },
  eduDisplay: {
    color: '#E8603A',
    fontWeight: 700,
    fontSize: 12,
  },
  center: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    background: '#FFF8F5',
    fontFamily: 'Nunito, sans-serif',
  },
  loadingText: {
    marginTop: 16,
    color: '#C23B22',
    fontSize: 14,
    fontWeight: 600,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: '#3D1008',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9C5A4A',
    textAlign: 'center',
    lineHeight: 1.7,
  },
};

export default Swipe;