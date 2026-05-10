import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const ADMIN_EMAIL = 'dbdus1357@naver.com';

function Admin({ user, onBack }) {
  const [tab, setTab] = useState('verify');
  const [verifyList, setVerifyList] = useState([]);
  const [reportList, setReportList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const usersSnap = await getDocs(collection(db, 'users'));
    const pending = usersSnap.docs.map(d => d.data()).filter(u => u.verifyStatus === 'pending');
    setVerifyList(pending);
    const reportsSnap = await getDocs(collection(db, 'reports'));
    const reports = await Promise.all(
      reportsSnap.docs.map(async d => {
        const data = d.data();
        const targetSnap = await getDocs(collection(db, 'users'));
        const target = targetSnap.docs.find(u => u.data().uid === data.to)?.data();
        return { id: d.id, ...data, targetUser: target };
      })
    );
    setReportList(reports);
    setLoading(false);
  };

  const approveVerify = async (uid) => {
    await updateDoc(doc(db, 'users', uid), { verifyStatus: 'approved', verified: true });
    setVerifyList(prev => prev.filter(u => u.uid !== uid));
  };

  const rejectVerify = async (uid) => {
    await updateDoc(doc(db, 'users', uid), { verifyStatus: 'rejected', verifyDocUrl: null });
    setVerifyList(prev => prev.filter(u => u.uid !== uid));
  };

  const deleteReport = async (id) => {
    await deleteDoc(doc(db, 'reports', id));
    setReportList(prev => prev.filter(r => r.id !== id));
  };

  if (user.email !== ADMIN_EMAIL) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#FFF8F5' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#3D1008', marginBottom: 8, fontFamily: 'Nunito, sans-serif' }}>접근 권한이 없어요</div>
      <div style={{ fontSize: 14, color: '#FDBCAA', textAlign: 'center', marginBottom: 24, fontFamily: 'Nunito, sans-serif' }}>관리자만 접근할 수 있어요</div>
      <button onClick={onBack} style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #F4845F, #E8603A)', color: 'white', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>돌아가기</button>
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFF8F5' }}>
      <div style={{ background: 'white', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #FDBCAA' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#F4845F', fontSize: 22, cursor: 'pointer', padding: 0, fontWeight: 700 }}>←</button>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#3D1008', fontFamily: 'Nunito, sans-serif' }}>관리자 페이지</div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #FDBCAA', background: 'white' }}>
        {[
          { id: 'verify', label: `교원 인증 (${verifyList.length})` },
          { id: 'reports', label: `신고 내역 (${reportList.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '14px', background: 'none', border: 'none', borderBottom: tab === t.id ? '2px solid #F4845F' : '2px solid transparent', color: tab === t.id ? '#F4845F' : '#aaa', fontSize: 14, fontWeight: tab === t.id ? 700 : 400, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#FDBCAA', fontSize: 14, fontFamily: 'Nunito, sans-serif' }}>불러오는 중...</div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {tab === 'verify' && (
            verifyList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#FDBCAA' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 14, fontFamily: 'Nunito, sans-serif' }}>대기 중인 인증이 없어요</div>
              </div>
            ) : (
              verifyList.map(u => (
                <div key={u.uid} style={{ background: 'white', margin: '12px 16px', borderRadius: 16, border: '1px solid #FDBCAA', overflow: 'hidden' }}>
                  <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FFF0EB', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                      {u.photoUrl ? <img src={u.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (u.gender === '남성' ? '👨‍🏫' : '👩‍🏫')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#3D1008', fontFamily: 'Nunito, sans-serif' }}>{u.name} <span style={{ fontSize: 12, color: '#aaa', fontWeight: 400 }}>(닉네임)</span></div>
                      <div style={{ fontSize: 12, color: '#aaa', marginTop: 2, fontFamily: 'Nunito, sans-serif' }}>{u.level} · {u.subject} · {u.region}</div>
                    </div>
                  </div>

                  <div style={{ margin: '0 16px 12px', background: '#FFF0EB', border: '1.5px solid #FDBCAA', borderRadius: 12, padding: '14px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#C23B22', marginBottom: 10, fontFamily: 'Nunito, sans-serif' }}>🔐 본인 확인 정보 (관리자만 열람)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {[{ label: '실명', value: u.realName }, { label: '생년월일', value: u.birthDate }, { label: '소속학교', value: u.schoolName }].map(({ label, value }) => (
                        <div key={label} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: '#F4845F', minWidth: 60, fontFamily: 'Nunito, sans-serif' }}>{label}</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#3D1008', fontFamily: 'Nunito, sans-serif' }}>{value || <span style={{ color: '#FDBCAA', fontWeight: 400 }}>미입력</span>}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#F4845F', minWidth: 60, fontFamily: 'Nunito, sans-serif' }}>이메일</span>
                        <span style={{ fontSize: 13, color: '#555', fontFamily: 'Nunito, sans-serif' }}>{u.email}{u.emailVerified && <span style={{ color: '#4CAF50', fontWeight: 700, marginLeft: 4 }}>✓ 인증됨</span>}</span>
                      </div>
                    </div>
                  </div>

                  {u.verifyDocUrl && (
                    <div style={{ padding: '0 16px 12px' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#F4845F', marginBottom: 6, fontFamily: 'Nunito, sans-serif' }}>📄 제출된 재직증명서</div>
                      <img src={u.verifyDocUrl} alt="인증서류" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 12, border: '1px solid #FDBCAA', background: '#FFFAF8', cursor: 'pointer' }} onClick={() => window.open(u.verifyDocUrl, '_blank')} />
                      <div style={{ fontSize: 11, color: '#FDBCAA', textAlign: 'center', marginTop: 4, fontFamily: 'Nunito, sans-serif' }}>이미지 클릭하면 크게 볼 수 있어요</div>
                    </div>
                  )}

                  <div style={{ margin: '0 16px 12px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 12, color: '#92400e', lineHeight: 1.6, fontFamily: 'Nunito, sans-serif' }}>⚠️ <strong>실명·소속학교</strong>가 재직증명서 내용과 일치하는지 확인 후 승인해주세요</div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, padding: '0 16px 16px' }}>
                    <button onClick={() => rejectVerify(u.uid)} style={{ flex: 1, padding: '11px', background: 'white', border: '1.5px solid #FDBCAA', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#ff4757', fontFamily: 'Nunito, sans-serif' }}>거절</button>
                    <button onClick={() => approveVerify(u.uid)} style={{ flex: 2, padding: '11px', background: 'linear-gradient(135deg, #F4845F, #E8603A)', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: 'white', fontFamily: 'Nunito, sans-serif' }}>✅ 승인</button>
                  </div>
                </div>
              ))
            )
          )}

          {tab === 'reports' && (
            reportList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#FDBCAA' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🚨</div>
                <div style={{ fontSize: 14, fontFamily: 'Nunito, sans-serif' }}>신고 내역이 없어요</div>
              </div>
            ) : (
              reportList.map(r => (
                <div key={r.id} style={{ background: 'white', margin: '12px 16px', borderRadius: 16, border: '1px solid #FDBCAA', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fff0f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      {r.targetUser?.photoUrl ? <img src={r.targetUser.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (r.targetUser?.gender === '남성' ? '👨‍🏫' : '👩‍🏫')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#3D1008', fontFamily: 'Nunito, sans-serif' }}>{r.targetUser?.name || '알 수 없음'}</div>
                      <div style={{ fontSize: 12, color: '#ff4757', marginTop: 2, fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>신고 사유: {r.reason}</div>
                    </div>
                  </div>
                  {r.targetUser?.realName && (
                    <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#ff4757', marginBottom: 6, fontFamily: 'Nunito, sans-serif' }}>🔐 신고 대상 본인 확인 정보</div>
                      <div style={{ fontSize: 13, color: '#555', fontFamily: 'Nunito, sans-serif' }}>실명: <strong>{r.targetUser.realName}</strong> · 소속: <strong>{r.targetUser.schoolName || '미입력'}</strong></div>
                    </div>
                  )}
                  <button onClick={() => deleteReport(r.id)} style={{ width: '100%', padding: '10px', background: 'white', border: '1.5px solid #FDBCAA', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#aaa', fontFamily: 'Nunito, sans-serif' }}>신고 처리 완료</button>
                </div>
              ))
            )
          )}
        </div>
      )}
    </div>
  );
}

export default Admin;