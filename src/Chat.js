import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, getDoc, getDocs, updateDoc, serverTimestamp, deleteDoc, writeBatch } from 'firebase/firestore';
import { rtdb } from './firebase';
import { ref, onValue } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
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

  const handleLeaveChat = async () => {
    const confirmMsg = '채팅방을 나가시겠어요?\n\n' +
      '• 매칭이 끊기고 더 이상 대화할 수 없어요\n' +
      '• 모든 메시지가 삭제돼요\n' +
      '• 이 작업은 되돌릴 수 없어요';
    if (!window.confirm(confirmMsg)) return;

    try {
      // 1) 메시지 전부 삭제 (배치 처리로 한번에)
      const messagesSnap = await getDocs(collection(db, 'matches', matchId, 'messages'));
      const batch = writeBatch(db);
      messagesSnap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();

      // 2) 매칭 자체 삭제
      await deleteDoc(doc(db, 'matches', matchId));

      // 3) 채팅 목록으로 돌아가기
      alert('채팅방을 나갔어요.');
      onBack();
    } catch (e) {
      console.error('채팅방 나가기 오류:', e);
      alert('채팅방 나가기 중 오류가 발생했어요. 다시 시도해주세요.');
    }
  };

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

  // 날짜 구분선 표시용 (오늘 · 5월 17일 / 어제 · 5월 16일 / 5월 10일)
  const formatDateDivider = (createdAt) => {
    if (!createdAt) return '';
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((today - msgDay) / (1000 * 60 * 60 * 24));

    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];

    if (diffDays === 0) return `오늘 · ${month}월 ${day}일 ${weekday}요일`;
    if (diffDays === 1) return `어제 · ${month}월 ${day}일 ${weekday}요일`;
    return `${date.getFullYear()}년 ${month}월 ${day}일 ${weekday}요일`;
  };

  // 두 메시지가 같은 날인지 확인
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = date1.toDate ? date1.toDate() : new Date(date1);
    const d2 = date2.toDate ? date2.toDate() : new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
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
                style={{ width: '100%', padding: '12px 16px', background: 'white', border: 'none', borderBottom: '1px solid #FFF0EB', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#C23B22', fontFamily: 'Nunito, sans-serif', fontWeight: 600, textAlign: 'left' }}
              >
                🚫 차단하기
              </button>
              <button
                onClick={() => { setShowMenu(false); handleLeaveChat(); }}
                style={{ width: '100%', padding: '12px 16px', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#9C5A4A', fontFamily: 'Nunito, sans-serif', fontWeight: 600, textAlign: 'left' }}
              >
                🚪 채팅방 나가기
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {/* 메인 매칭 카드 */}
            <div style={{
              background: 'linear-gradient(135deg, #FFF0EB, #FFE5D9)',
              border: '1.5px solid #FDBCAA',
              borderRadius: 20,
              padding: '24px 20px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#C23B22', marginBottom: 6, fontFamily: 'Nunito, sans-serif' }}>
                {otherUser?.name} 선생님과 매칭됐어요!
              </div>
              <div style={{ fontSize: 13, color: '#9C5A4A', lineHeight: 1.6, fontWeight: 600, fontFamily: 'Nunito, sans-serif' }}>
                서로 좋아요를 눌렀어요 💕
              </div>
              <div style={{
                background: 'white',
                border: '1px solid #FDBCAA',
                borderRadius: 14,
                padding: '10px 14px',
                marginTop: 14,
                fontSize: 12,
                color: '#C23B22',
                fontWeight: 700,
                fontFamily: 'Nunito, sans-serif',
              }}>
                💬 먼저 인사를 건네보세요!
              </div>
            </div>

            {/* 대화 시작 팁 */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9C5A4A', marginBottom: 6, padding: '0 4px', fontFamily: 'Nunito, sans-serif' }}>
                ✨ 대화 시작 팁
              </div>
              <div style={{
                background: 'white',
                border: '1px solid #FDBCAA',
                borderRadius: 12,
                padding: '12px 14px',
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
                <span style={{ fontSize: 12, color: '#3D1008', fontWeight: 600, lineHeight: 1.6, fontFamily: 'Nunito, sans-serif' }}>
                  공통점이나 상대방 프로필에서 발견한 점으로 자연스럽게 시작해보세요
                </span>
              </div>
            </div>

            {/* 안전 가이드 */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9C5A4A', marginBottom: 6, padding: '0 4px', fontFamily: 'Nunito, sans-serif' }}>
                🛡️ 안전 가이드
              </div>
              <div style={{
                background: '#FFFAF8',
                border: '1px solid #FDBCAA',
                borderRadius: 12,
                padding: '12px 14px',
              }}>
                {[
                  { icon: '🙏', text: '서로 존중하는 대화를 나눠주세요' },
                  { icon: '🚨', text: '부적절한 대화는 우측 상단 ⋮ 메뉴로 신고할 수 있어요' },
                  { icon: '🔒', text: '개인정보(연락처·주소 등) 공유는 신중히 결정해주세요' },
                ].map((tip, i, arr) => (
                  <div key={i} style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    marginBottom: i < arr.length - 1 ? 8 : 0,
                  }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{tip.icon}</span>
                    <span style={{ fontSize: 11, color: '#9C5A4A', fontWeight: 600, lineHeight: 1.6, fontFamily: 'Nunito, sans-serif' }}>{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMine = msg.from === user.uid;
          const nextMsg = messages[idx + 1];
          const prevMsg = messages[idx - 1];
          const isLastInGroup = !nextMsg || nextMsg.from !== msg.from;
          const isRead = isMine && msg.readAt;
          // 이전 메시지와 날짜가 다르면 날짜 구분선 표시
          const showDateDivider = !prevMsg || !isSameDay(prevMsg.createdAt, msg.createdAt);

          return (
            <div key={msg.id}>
              {showDateDivider && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
                  <div style={{
                    background: 'white',
                    border: '1px solid #FDBCAA',
                    borderRadius: 14,
                    padding: '4px 14px',
                    fontSize: 11,
                    color: '#9C5A4A',
                    fontWeight: 700,
                    fontFamily: 'Nunito, sans-serif',
                  }}>
                    {formatDateDivider(msg.createdAt)}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 6 }}>
                {isMine && isLastInGroup && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, marginBottom: 2, flexShrink: 0 }}>
                    {isRead && (
                      <span style={{ fontSize: 10, color: '#E8603A', fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>✓ 읽음</span>
                    )}
                    <span style={{ fontSize: 10, color: '#9C5A4A', fontWeight: 600, fontFamily: 'Nunito, sans-serif' }}>{formatTime(msg.createdAt)}</span>
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
                  <div style={{ maxWidth: '72%', padding: '11px 16px', borderRadius: 20, fontSize: 14, lineHeight: 1.5, background: isMine ? 'linear-gradient(135deg, #F4845F, #E8603A)' : 'white', color: isMine ? 'white' : '#3D1008', borderBottomRightRadius: isMine ? 6 : 20, borderBottomLeftRadius: isMine ? 20 : 6, boxShadow: isMine ? '0 2px 8px rgba(244,132,95,0.3)' : '0 1px 3px rgba(0,0,0,0.04)', fontFamily: 'Nunito, sans-serif', fontWeight: 600, border: isMine ? 'none' : '1px solid #FFD7C8' }}>
                    {msg.text}
                  </div>
                )}

                {!isMine && isLastInGroup && (
                  <div style={{ fontSize: 10, color: '#9C5A4A', fontWeight: 600, marginBottom: 2, flexShrink: 0, fontFamily: 'Nunito, sans-serif' }}>{formatTime(msg.createdAt)}</div>
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
        {/* 이모지/사진 버튼 */}
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          <button
            onClick={() => { setShowEmoji(!showEmoji); setShowPhoto(false); }}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: showEmoji ? '#FFF0EB' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9C5A4A',
              transition: 'background 0.15s',
            }}
          >
            😊
          </button>
          <button
            onClick={() => { setShowPhoto(!showPhoto); setShowEmoji(false); }}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: showPhoto ? '#FFF0EB' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9C5A4A',
              transition: 'background 0.15s',
            }}
          >
            📷
          </button>
        </div>

        {/* 입력창 + 전송 버튼 통합 */}
        <div style={{
          flex: 1,
          background: '#FFFAF8',
          border: '1.5px solid #FFD7C8',
          borderRadius: 22,
          padding: '4px 6px 4px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="메시지를 입력하세요..."
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              padding: '8px 0',
              fontSize: 14,
              outline: 'none',
              fontFamily: 'Nunito, sans-serif',
              color: '#3D1008',
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: input.trim()
                ? 'linear-gradient(135deg, #F4845F, #E8603A)'
                : '#FDBCAA',
              border: 'none',
              color: 'white',
              fontSize: 16,
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: input.trim() ? '0 2px 6px rgba(244,132,95,0.4)' : 'none',
              transition: 'all 0.15s',
              fontWeight: 700,
            }}
          >
            ↑
          </button>
        </div>
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
  const [lastMessages, setLastMessages] = useState({});

  // 메시지 시간 사용자 친화적으로 변환 (오후 9:42, 어제, 3일 전, ...)
  const formatLastTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const msgDate = date.toDate ? date.toDate() : new Date(date);
    const diff = now - msgDate;
    const diffMin = Math.floor(diff / (1000 * 60));
    const diffDay = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffMin < 1) return '방금';
    if (diffMin < 60) return `${diffMin}분 전`;
    // 오늘이면 시간 표시
    if (msgDate.toDateString() === now.toDateString()) {
      const hour = msgDate.getHours();
      const min = msgDate.getMinutes();
      const period = hour < 12 ? '오전' : '오후';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${period} ${displayHour}:${String(min).padStart(2, '0')}`;
    }
    if (diffDay === 1) return '어제';
    if (diffDay < 7) return `${diffDay}일 전`;
    // 일주일 넘으면 날짜
    return `${msgDate.getMonth() + 1}/${msgDate.getDate()}`;
  };

  // 마지막 메시지 텍스트 만들기
  const getLastMessageText = (msg) => {
    if (!msg) return null;
    if (msg.type === 'image') return '📷 사진';
    if (msg.type === 'emoji') return msg.text || '🌟 이모티콘';
    return msg.text || '';
  };

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
          // 안 읽음 개수
          const unread = snap.docs.filter(d => d.data().from !== user.uid && !d.data().readAt).length;
          setUnreadCounts(prev => ({ ...prev, [match.id]: unread }));

          // 마지막 메시지
          if (snap.docs.length > 0) {
            const lastDoc = snap.docs[snap.docs.length - 1];
            const lastData = lastDoc.data();
            setLastMessages(prev => ({
              ...prev,
              [match.id]: {
                text: getLastMessageText(lastData),
                from: lastData.from,
                createdAt: lastData.createdAt,
              },
            }));
          }
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
      <div style={{ background: 'white', padding: '14px 20px', borderBottom: '1px solid #FDBCAA' }}>
        {matches.length > 0 ? (
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
              <div style={{ fontSize: 28, flexShrink: 0 }}>💬</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'white', fontFamily: 'Nunito, sans-serif', lineHeight: 1.3 }}>
                  {matches.length}분의 선생님과
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'white', fontFamily: 'Nunito, sans-serif', lineHeight: 1.3 }}>
                  대화 중이에요!
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
              CHAT
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: '#9C5A4A', fontFamily: 'Nunito, sans-serif', fontWeight: 600, textAlign: 'center', padding: '4px 0' }}>
            💬 매칭된 선생님과 대화해보세요
          </div>
        )}
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
          {matches.map(match => {
            const otherUid = match.users.find(u => u !== user.uid);
            const lastMsg = lastMessages[match.id];
            const hasUnread = unreadCounts[match.id] > 0;
            const isMyMessage = lastMsg?.from === user.uid;
            return (
              <div key={match.id} onClick={() => { setUnreadCounts(prev => ({ ...prev, [match.id]: 0 })); setSelectedMatch(match); }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid #FFF8F5', cursor: 'pointer', background: hasUnread ? '#FFFAF8' : 'white', transition: 'background 0.15s' }}>
                {/* 프로필 사진 + 온라인 표시 */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#FFF0EB', border: '2px solid #FDBCAA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, overflow: 'hidden' }}>
                    {match.otherUser?.photoUrl ? <img src={match.otherUser.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (match.otherUser?.gender === '남성' ? '👨‍🏫' : '👩‍🏫')}
                  </div>
                  {onlineStatus[otherUid] && (
                    <div style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: '50%', background: '#4CAF50', border: '2px solid white' }} />
                  )}
                </div>

                {/* 가운데 정보 영역 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* 윗줄: 이름 · 직업 정보 + 시간 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, flex: 1 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#3D1008', fontFamily: 'Nunito, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{match.otherUser?.name}</span>
                      {match.otherUser?.verifyStatus === 'approved' && <span style={{ fontSize: 13, flexShrink: 0 }}>✅</span>}
                      
                      <span style={{ fontSize: 10, color: '#9C5A4A', fontWeight: 600, fontFamily: 'Nunito, sans-serif', flexShrink: 0, marginLeft: 2 }}>· {match.otherUser?.subject}·{match.otherUser?.region}</span>
                    </div>
                    {lastMsg && (
                      <div style={{ fontSize: 11, color: '#9C5A4A', fontWeight: 600, fontFamily: 'Nunito, sans-serif', flexShrink: 0 }}>
                        {formatLastTime(lastMsg.createdAt)}
                      </div>
                    )}
                  </div>
                  {/* 아랫줄: 마지막 메시지 + 안 읽음 카운트 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      fontSize: 13,
                      color: lastMsg ? '#9C5A4A' : '#FDBCAA',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: hasUnread ? 700 : 500,
                      fontStyle: lastMsg ? 'normal' : 'italic',
                      flex: 1,
                    }}>
                      {lastMsg
                        ? (isMyMessage ? `너: ${lastMsg.text}` : lastMsg.text)
                        : '💌 매칭됐어요! 먼저 인사를 건네보세요'}
                    </div>
                    {hasUnread && (
                      <div style={{
                        background: '#E8603A',
                        color: 'white',
                        borderRadius: '50%',
                        minWidth: 20,
                        height: 20,
                        padding: '0 6px',
                        fontSize: 11,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontFamily: 'Nunito, sans-serif',
                      }}>
                        {unreadCounts[match.id]}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Chat;