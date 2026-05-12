import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, getDoc, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import { rtdb } from './firebase';
import { ref, onValue } from 'firebase/database';

function ChatRoom({ user, matchId, otherUser, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

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

  const sendMessage = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    await addDoc(collection(db, 'matches', matchId, 'messages'), { text, from: user.uid, createdAt: new Date(), readAt: null });
  };

  const formatTime = (createdAt) => {
    if (!createdAt) return '';
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ background: 'white', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #FDBCAA' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#F4845F', fontSize: 22, cursor: 'pointer', padding: 0, fontWeight: 700 }}>←</button>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FFF0EB', border: '2px solid #FDBCAA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, overflow: 'hidden' }}>
          {otherUser?.photoUrl ? <img src={otherUser.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (otherUser?.gender === '남성' ? '👨‍🏫' : '👩‍🏫')}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#3D1008', fontFamily: 'Nunito, sans-serif' }}>
            {otherUser?.name}
            {otherUser?.verifyStatus === 'approved' && <span style={{ marginLeft: 4, fontSize: 13 }}>✅</span>}
          </div>
          <div style={{ fontSize: 12, color: '#FDBCAA', marginTop: 1, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>{otherUser?.subject} · {otherUser?.region}</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#FFF8F5', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#FDBCAA', fontSize: 13, marginTop: 40, lineHeight: 1.7, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
            🧡 매칭됐어요!<br />먼저 인사해보세요
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
                <div style={{ maxWidth: '72%', padding: '10px 16px', borderRadius: 20, fontSize: 14, lineHeight: 1.5, background: isMine ? 'linear-gradient(135deg, #F4845F, #E8603A)' : 'white', color: isMine ? 'white' : '#3D1008', borderBottomRightRadius: isMine ? 4 : 20, borderBottomLeftRadius: isMine ? 20 : 4, boxShadow: isMine ? '0 2px 8px rgba(244,132,95,0.3)' : '0 1px 4px rgba(0,0,0,0.06)', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
                  {msg.text}
                </div>
                {!isMine && isLastInGroup && (
                  <div style={{ fontSize: 11, color: '#FDBCAA', marginBottom: 2, flexShrink: 0, fontFamily: 'Nunito, sans-serif' }}>{formatTime(msg.createdAt)}</div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ background: 'white', borderTop: '1px solid #FDBCAA', padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="메시지 입력..."
          style={{ flex: 1, border: '1.5px solid #FDBCAA', borderRadius: 24, padding: '11px 18px', fontSize: 14, outline: 'none', fontFamily: 'Nunito, sans-serif', color: '#3D1008', background: '#FFFAF8' }} />
        <button onClick={sendMessage} style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #F4845F, #E8603A)', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(244,132,95,0.35)' }}>↑</button>
      </div>
    </div>
  );
}

function Chat({ user }) {
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
          <div style={{ fontSize: 56, marginBottom: 16 }}>💬</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#3D1008', marginBottom: 8, fontFamily: 'Nunito, sans-serif' }}>아직 매칭이 없어요</div>
          <div style={{ fontSize: 14, color: '#FDBCAA', textAlign: 'center', lineHeight: 1.7, fontFamily: 'Nunito, sans-serif' }}>스와이프해서 마음에 드는<br />선생님을 찾아보세요!</div>
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