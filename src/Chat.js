import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, getDoc, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import { rtdb } from './firebase';
import { ref, onValue } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import VerifiedBadge from './VerifiedBadge';
import Report from './Report';
import { blockUser } from './reports';

const EMOJIS = {
  '😊': ['😊','😍','🥰','😄','😆','🤗','😎','🥺','😢','😂','🤣','😅','😇','🤩','😋','😜'],
  '❤️': ['❤️','🧡','💕','💝','💖','💗','💓','💞','💘','💟','🥰','😻','💌','💋','🌹','🌸'],
  '👍': ['👍','👏','🙌','🤝','✌️','🤞','👋','🙏','💪','🤜','🤛','👊','✊','🫶','🤙','👌'],
  '🎉': ['🎉','🎊','🎈','🎁','🏆','⭐','✨','🌟','💫','🔥','🎯','🍀','🌈','🎶','🎵','🎤'],
};

function ChatRoom({ user, matchId, otherUser, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState('😊');
  const [uploading, setUploading] = useState(false);
  const [viewImage, setViewImage] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, 'matches', matchId, 'messages'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, async (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
      const unread = snap.docs.filter(d => d.data().from !== user.uid && !d.data().readAt);
      await Promise.all(unread.map(d => updateDoc(d.ref, { readAt: serverTimestamp() })));
    });
    return () => unsub();
  }, [matchId, user.uid]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleBlock = async () => {
    if (!window.confirm(`${otherUser?.name}님을 차단할까요?\n차단하면 다시는 매칭/메시지를 받을 수 없어요.`)) return;
    try {
      await blockUser(user.uid, otherUser?.uid);
      alert('차단했어요. 더 이상 상대방과 연결되지 않아요.');
      onBack();
    } catch (e) {
      alert('차단 처리 중 오류가 발생했어요.');
    }
  };

  const sendMessage = async (text, type = 'text') => {
    if (!text.trim() && type === 'text') return;
    const content = type === 'text' ? text.trim() : text;
    if (type === 'text') setInput('');
    setShowEmoji(false);
    setShowPhoto(false);
    await addDoc(collection(db, 'matches', matchId, 'messages'), {
      text: content, type, from: user.uid, createdAt: new Date(), readAt: null
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setShowPhoto(false);
    try {
      const storage = getStorage();
      const photoRef = storageRef(storage, `chat/${matchId}/${Date.now()}_${file.name}`);
      await uploadBytes(photoRef, file);
      const url = await getDownloadURL(photoRef);
      await sendMessage(url, 'image');
    } catch (e) {
      console.error('사진 업로드 오류:', e);
      alert('사진 업로드 중 오류가 발생했어요.');
    }
    setUploading(false);
  };

  const formatTime = (createdAt) => {
    if (!createdAt) return '';
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 헤더 */}
      <div style={{ background: 'white', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #FDBCAA', position: 'relative' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#F4845F', fontSize: 22, cursor: 'pointer', padding: 0, fontWeight: 700 }}>←</button>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FFF0EB', border: '2px solid #FDBCAA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, overflow: 'hidden' }}>
          {otherUser?.photoUrl ? <img src={otherUser.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (otherUser?.gender === '남성' ? '👨‍🏫' : '👩‍🏫')}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#3D1008', fontFamily: 'Nunito, sans-serif' }}>
            {otherUser?.name}
            {otherUser?.verifyStatus === 'approved' && <span style={{ marginLeft: 4, fontSize: 13 }}>✅</span>}
            {otherUser?.isVerified && <VerifiedBadge size={13} />}
          </div>
          <div style={{ fontSize: 12, color: '#FDBCAA', marginTop: 1, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>{otherUser?.subject} · {otherUser?.region}</div>
        </div>
        {/* ⋮ 메뉴 버튼 */}
        <button onClick={() => setShowMenu(!showMenu)} style={{ background: showMenu ? '#FFF0EB' : 'none', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#9C5A4A' }}>
          ⋮
        </button>
        {/* 드롭다운 메뉴 */}
        {showMenu && (
          <>
            <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} />
            <div style={{ position: 'absolute', top: 60, right: 14, background: 'white', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', border: '1px solid #FDBCAA', zIndex: 999, overflow: 'hidden', minWidth: 160 }}>
              <button
                onClick={() => { setShowMenu(false); setShowReport(true); }}
                style={{ width: '100%', padding: '12px 16px', background: 'white', border: 'none', borderBottom: '1px solid #FFF0EB', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#3D1008', fontFamily: 'Nunito, sans-serif', fontWeight: 600, textAlign: 'left' }}
              >
                🚨 신고하기
              </button>
              <button
                onClick={() => { setShowMenu(false); handleBlock(); }}
                style={{ width: '100%', padding: '12px 16px', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#C23B22', fontFamily: 'Nunito, sans-serif', fontWeight: 600, textAlign: 'left' }}
              >
                🚫 차단하기
              </button>
            </div>
          </>
        )}
      </div>

      {/* 신고 모달 */}
      {showReport && (
        <Report
          user={user}
          targetUser={otherUser}
          context={{ source: 'chat', matchId }}
          onClose={() => setShowReport(false)}
          onComplete={() => { setShowReport(false); onBack(); }}
        />
      )}

      {/* 메시지 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#FFF8F5', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            <div style={{ background: 'white', border: '1.5px solid #FDBCAA', borderRadius: 16, padding: '16px', textAlign: 'center', marginBottom: 4 }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🎉</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#3D1008', marginBottom: 4, fontFamily: 'Nunito, sans-serif' }}>{otherUser?.name} 선생님과 매칭됐어요!</div>
              <div style={{ fontSize: 12, color: '#FDBCAA', lineHeight: 1.6, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>서로 좋아요를 눌렀어요 💕<br />먼저 인사를 건네보세요!</div>
            </div>
            {[
              { icon: '💡', text: '상대방의 공통점으로 대화를 시작해 보세요.' },
              { icon: '🙏', text: '서로 존중하는 대화를 나눠주세요.' },
              { icon: '🚨', text: '부적절한 대화는 신고해주세요.' },
              { icon: '⚠️', text: '익명성에 가려진 공간에서 민감한 개인정보는 주의해주세요. 이로 인해 발생된 사고는 책임지지 않습니다.' },
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#FFF0EB', borderRadius: 12, padding: '10px 12px' }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{tip.icon}</span>
                <span style={{ fontSize: 11, color: '#C23B22', fontWeight: 600, lineHeight: 1.6, fontFamily: 'Nunito, sans-serif' }}>{tip.text}</span>
              </div>
            ))}
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMine = msg.from === user.uid;
          const nextMsg = messages[idx + 1];
          const isLastInGroup = !nextMsg || nextMsg.from !== msg.from;
          const isRead = isMine && msg.readAt;

          return (
            <div key={msg.id}>
              <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 6 }}>
                {isMine && isLastInGroup && (
                  <div style={{ fontSize: 11, color: '#FDBCAA', marginBottom: 2, flexShrink: 0 }}>
                    {isRead ? <span style={{ color: '#F4845F', fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>읽음</span> : <span style={{ fontFamily: 'Nunito, sans-serif' }}>{formatTime(msg.createdAt)}</span>}
                  </div>
                )}

                {/* 이모지 메시지 */}
                {msg.type === 'emoji' ? (
                  <div style={{ fontSize: 36 }}>{msg.text}</div>
                ) : msg.type === 'image' ? (
                  /* 이미지 메시지 */
                  <div style={{ maxWidth: '60%', borderRadius: 16, overflow: 'hidden', border: '1px solid #FDBCAA' }}>
                    <img src={msg.text} alt="사진" style={{ width: '100%', display: 'block', cursor: 'pointer' }} onClick={() => setViewImage(msg.text)} />
                  </div>
                ) : (
                  /* 텍스트 메시지 */
                  <div style={{ maxWidth: '72%', padding: '10px 16px', borderRadius: 20, fontSize: 14, lineHeight: 1.5, background: isMine ? 'linear-gradient(135deg, #F4845F, #E8603A)' : 'white', color: isMine ? 'white' : '#3D1008', borderBottomRightRadius: isMine ? 4 : 20, borderBottomLeftRadius: isMine ? 20 : 4, boxShadow: isMine ? '0 2px 8px rgba(244,132,95,0.3)' : '0 1px 4px rgba(0,0,0,0.06)', fontFamily: 'Nunito, sans-serif', fontWeight: 600, border: isMine ? 'none' : '1px solid #FDBCAA' }}>
                    {msg.text}
                  </div>
                )}

                {!isMine && isLastInGroup && (
                  <div style={{ fontSize: 11, color: '#FDBCAA', marginBottom: 2, flexShrink: 0, fontFamily: 'Nunito, sans-serif' }}>{formatTime(msg.createdAt)}</div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* 이미지 팝업 뷰어 */}
      {viewImage && (
        <div onClick={() => setViewImage(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <button onClick={() => setViewImage(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 40, height: 40, color: 'white', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          <img src={viewImage} alt="사진" style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: 16, objectFit: 'contain' }} onClick={e => e.stopPropagation()} />
          <a href={viewImage} download target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: 30, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 20, padding: '10px 20px', color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none', fontFamily: 'Nunito, sans-serif' }}>⬇️ 사진 저장</a>
        </div>
      )}

      {/* 이모티콘 패널 */}
      {showEmoji && (
        <div style={{ background: 'white', borderTop: '1px solid #FDBCAA', padding: '10px 12px' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {Object.keys(EMOJIS).map(cat => (
              <button key={cat} onClick={() => setEmojiCategory(cat)} style={{ fontSize: 18, padding: '4px 8px', borderRadius: 10, cursor: 'pointer', border: 'none', background: emojiCategory === cat ? '#F4845F' : '#FFF0EB' }}>
                {cat}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6 }}>
            {EMOJIS[emojiCategory].map(emoji => (
              <button key={emoji} onClick={() => sendMessage(emoji, 'emoji')} style={{ fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: 8, lineHeight: 1 }}>
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 사진 패널 */}
      {showPhoto && (
        <div style={{ background: 'white', borderTop: '1px solid #FDBCAA', padding: '12px 16px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#C23B22', marginBottom: 10, fontFamily: 'Nunito, sans-serif' }}>사진 전송</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => fileInputRef.current?.click()} style={{ flex: 1, padding: '14px', background: '#FFF0EB', border: '2px dashed #FDBCAA', borderRadius: 14, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 28 }}>📷</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#C23B22', fontFamily: 'Nunito, sans-serif' }}>갤러리에서 선택</span>
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          {uploading && (
            <div style={{ textAlign: 'center', marginTop: 10, color: '#FDBCAA', fontSize: 13, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>사진 업로드 중...</div>
          )}
        </div>
      )}

      {/* 입력창 */}
      <div style={{ background: 'white', borderTop: '1px solid #FDBCAA', padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => { setShowEmoji(!showEmoji); setShowPhoto(false); }} style={{ width: 36, height: 36, borderRadius: '50%', background: showEmoji ? '#F4845F' : '#FFF0EB', border: 'none', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>😊</button>
        <button onClick={() => { setShowPhoto(!showPhoto); setShowEmoji(false); }} style={{ width: 36, height: 36, borderRadius: '50%', background: showPhoto ? '#F4845F' : '#FFF0EB', border: 'none', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>📷</button>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage(input)} placeholder="메시지 입력..."
          style={{ flex: 1, border: '1.5px solid #FDBCAA', borderRadius: 24, padding: '10px 16px', fontSize: 14, outline: 'none', fontFamily: 'Nunito, sans-serif', color: '#3D1008', background: '#FFFAF8' }} />
        <button onClick={() => sendMessage(input)} style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #F4845F, #E8603A)', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(244,132,95,0.35)', flexShrink: 0 }}>↑</button>
      </div>
    </div>
  );
}

function Chat({ user, onGoSwipe }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [onlineStatus, setOnlineStatus] = useState({});

  useEffect(() => {
    const fetchMatches = async () => {
      const snap = await getDocs(collection(db, 'matches'));
      const myMatches = snap.docs.filter(d => d.data().users.includes(user.uid)).map(d => ({ id: d.id, ...d.data() }));
      const matchesWithProfiles = await Promise.all(myMatches.map(async (match) => {
        const otherUid = match.users.find(uid => uid !== user.uid);
        const profileSnap = await getDoc(doc(db, 'users', otherUid));
        return { ...match, otherUser: profileSnap.data() };
      }));
      setMatches(matchesWithProfiles);
      setLoading(false);
      matchesWithProfiles.forEach(match => {
        const otherUid = match.users.find(uid => uid !== user.uid);
        const statusRef = ref(rtdb, `status/${otherUid}`);
        onValue(statusRef, (snap) => {
          const data = snap.val();
          setOnlineStatus(prev => ({ ...prev, [otherUid]: data?.online || false }));
        });
      });
      matchesWithProfiles.forEach(match => {
        const q = query(collection(db, 'matches', match.id, 'messages'), orderBy('createdAt', 'asc'));
        onSnapshot(q, (snap) => {
          const unread = snap.docs.filter(d => d.data().from !== user.uid && !d.data().readAt).length;
          setUnreadCounts(prev => ({ ...prev, [match.id]: unread }));
        });
      });
    };
    fetchMatches();
  }, [user]);

  if (selectedMatch) return (
    <ChatRoom user={user} matchId={selectedMatch.id} otherUser={selectedMatch.otherUser}
      onBack={() => { setSelectedMatch(null); setUnreadCounts(prev => ({ ...prev, [selectedMatch.id]: 0 })); }}
    />
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFF8F5' }}>
      <div style={{ background: 'white', padding: '6px 24px', borderBottom: '1px solid #FDBCAA' }}>
        <div style={{ fontSize: 13, color: '#FDBCAA', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>매칭된 선생님들이에요 🧡</div>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#FDBCAA', fontSize: 14, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>불러오는 중...</div>
        </div>
      ) : matches.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>💌</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: '#3D1008', marginBottom: 10, fontFamily: 'Nunito, sans-serif' }}>아직 대화 상대가 없어요</div>
          <div style={{ fontSize: 14, color: '#9C5A4A', textAlign: 'center', lineHeight: 1.8, fontFamily: 'Nunito, sans-serif', fontWeight: 600, marginBottom: 24 }}>
            스와이프에서 좋아요를 누르고<br />서로 매칭되면 여기서 만나요!
          </div>
          {onGoSwipe && (
            <button
              onClick={onGoSwipe}
              style={{
                background: 'linear-gradient(135deg, #F4845F, #E8603A)',
                color: 'white',
                border: 'none',
                borderRadius: 14,
                padding: '14px 28px',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'Nunito, sans-serif',
                boxShadow: '0 4px 12px rgba(232, 96, 58, 0.3)',
              }}
            >
              💝 스와이프 시작하기
            </button>
          )}
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', background: 'white' }}>
          {matches.map(match => (
            <div key={match.id} onClick={() => { setUnreadCounts(prev => ({ ...prev, [match.id]: 0 })); setSelectedMatch(match); }}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px', borderBottom: '1px solid #FFF8F5', cursor: 'pointer', background: 'white' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#FFF0EB', border: '2px solid #FDBCAA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, overflow: 'hidden', flexShrink: 0 }}>
                  {match.otherUser?.photoUrl ? <img src={match.otherUser.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (match.otherUser?.gender === '남성' ? '👨‍🏫' : '👩‍🏫')}
                </div>
                {onlineStatus[match.users.find(u => u !== user.uid)] && (
                  <div style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: '50%', background: '#4CAF50', border: '2px solid white' }} />
                )}
                {unreadCounts[match.id] > 0 && (
                  <div style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: '#F4845F', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white' }}>{unreadCounts[match.id]}</div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#3D1008', fontFamily: 'Nunito, sans-serif' }}>{match.otherUser?.name}</div>
                  {match.otherUser?.verifyStatus === 'approved' && <span style={{ fontSize: 13 }}>✅</span>}
                  {match.otherUser?.isVerified && <VerifiedBadge size={13} />}
                </div>
                <div style={{ fontSize: 13, color: '#FDBCAA', marginTop: 2, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>{match.otherUser?.subject} · {match.otherUser?.region}</div>
              </div>
              {unreadCounts[match.id] > 0 && (
                <div style={{ background: 'linear-gradient(135deg, #F4845F, #E8603A)', color: 'white', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>{unreadCounts[match.id]}개 안읽음</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Chat;