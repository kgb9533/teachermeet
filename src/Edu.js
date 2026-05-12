import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';

const PACKAGES = [
  { id: 1, amount: 10, bonus: 0, price: 1000, label: '기본 패키지', popular: false },
  { id: 2, amount: 30, bonus: 3, price: 2500, label: '+3개 보너스', popular: false },
  { id: 3, amount: 70, bonus: 10, price: 5000, label: '+10개 보너스', popular: true },
  { id: 4, amount: 150, bonus: 30, price: 9900, label: '+30개 보너스', popular: false },
];

const HOW_TO_USE = [
  { icon: '🧡', text: '추가 좋아요 (하루 5번 초과시)', cost: 1 },
  { icon: '⭐', text: '슈퍼라이크', cost: 3 },
  { icon: '✅', text: '교원인증 우선심사', cost: 5 },
  { icon: '🔝', text: '프로필 상단 노출', cost: 10 },
];

function Edu({ user, onBack }) {
  const [eduBalance, setEduBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChargeAlert, setShowChargeAlert] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) setEduBalance(snap.data().eduBalance || 0);

        const historySnap = await getDocs(
          query(collection(db, 'eduHistory'),
            where('uid', '==', user.uid),
            orderBy('createdAt', 'desc')
          )
        );
        setHistory(historySnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error('에듀 데이터 오류:', e); }
      setLoading(false);
    };
    fetchData();
  }, [user.uid]);

  const handleCharge = (pkg) => {
    setSelectedPkg(pkg);
    setShowChargeAlert(true);
  };

  const formatDate = (createdAt) => {
    if (!createdAt) return '';
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFF8F5', overflowY: 'auto' }}>
      {/* 헤더 */}
      <div style={{ background: 'white', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #FDBCAA', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#F4845F', fontSize: 22, cursor: 'pointer', fontWeight: 700 }}>←</button>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#3D1008', fontFamily: 'Nunito, sans-serif' }}>🎓 에듀 충전</div>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* 잔액 카드 */}
        <div style={{ background: 'linear-gradient(135deg, #F4845F, #E8603A)', borderRadius: 20, padding: 20, textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 600, marginBottom: 6, fontFamily: 'Nunito, sans-serif' }}>보유 에듀</div>
          <div style={{ fontSize: 40, fontWeight: 800, marginBottom: 4, fontFamily: 'Nunito, sans-serif' }}>🎓 {loading ? '...' : eduBalance}</div>
          <div style={{ fontSize: 11, opacity: 0.75, fontFamily: 'Nunito, sans-serif' }}>1 에듀 = 100원 상당</div>
        </div>

        {/* 충전 패키지 */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#3D1008', marginBottom: 10, fontFamily: 'Nunito, sans-serif' }}>충전 패키지</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PACKAGES.map(pkg => (
              <div key={pkg.id} onClick={() => handleCharge(pkg)} style={{ background: pkg.popular ? '#FFF0EB' : 'white', border: `1.5px solid ${pkg.popular ? '#F4845F' : '#FDBCAA'}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>🎓</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#3D1008', fontFamily: 'Nunito, sans-serif' }}>에듀 {pkg.amount}개</span>
                      {pkg.popular && <span style={{ background: '#F4845F', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>인기</span>}
                    </div>
                    <div style={{ fontSize: 10, color: '#F4845F', fontWeight: 700, marginTop: 2, fontFamily: 'Nunito, sans-serif' }}>
                      {pkg.bonus > 0 ? `+${pkg.bonus}개 보너스` : '기본 패키지'}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#F4845F', fontFamily: 'Nunito, sans-serif' }}>{pkg.price.toLocaleString()}원</div>
              </div>
            ))}
          </div>
        </div>

        {/* 에듀 사용처 */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#3D1008', marginBottom: 10, fontFamily: 'Nunito, sans-serif' }}>에듀 사용처</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {HOW_TO_USE.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', border: '1px solid #FDBCAA', borderRadius: 12, padding: '10px 14px' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#3D1008', flex: 1, fontFamily: 'Nunito, sans-serif' }}>{item.text}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#F4845F', flexShrink: 0, fontFamily: 'Nunito, sans-serif' }}>🎓 {item.cost}개</span>
              </div>
            ))}
          </div>
        </div>

        {/* 사용 내역 */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#3D1008', marginBottom: 10, fontFamily: 'Nunito, sans-serif' }}>최근 사용 내역</div>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#FDBCAA', fontSize: 13, padding: 20, fontFamily: 'Nunito, sans-serif' }}>불러오는 중...</div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, background: 'white', borderRadius: 14, border: '1px solid #FDBCAA' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎓</div>
              <div style={{ fontSize: 13, color: '#FDBCAA', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>아직 사용 내역이 없어요</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {history.map(item => (
                <div key={item.id} style={{ background: 'white', border: '1px solid #FDBCAA', borderRadius: 12, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#3D1008', fontFamily: 'Nunito, sans-serif' }}>{item.title}</div>
                    <div style={{ fontSize: 10, color: '#FDBCAA', marginTop: 2, fontFamily: 'Nunito, sans-serif' }}>{formatDate(item.createdAt)}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: item.type === 'charge' ? '#4CAF50' : '#ff4757', fontFamily: 'Nunito, sans-serif' }}>
                    {item.type === 'charge' ? '+' : '-'}{item.amount} 🎓
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ height: 20 }} />
      </div>

      {/* 충전 확인 팝업 */}
      {showChargeAlert && selectedPkg && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 24, padding: '28px 24px', width: '100%', maxWidth: 320, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎓</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#3D1008', marginBottom: 8, fontFamily: 'Nunito, sans-serif' }}>에듀 {selectedPkg.amount + selectedPkg.bonus}개 충전</div>
            <div style={{ fontSize: 13, color: '#FDBCAA', lineHeight: 1.7, marginBottom: 8, fontFamily: 'Nunito, sans-serif' }}>
              {selectedPkg.amount}개 {selectedPkg.bonus > 0 ? `+ 보너스 ${selectedPkg.bonus}개` : ''}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#F4845F', marginBottom: 24, fontFamily: 'Nunito, sans-serif' }}>{selectedPkg.price.toLocaleString()}원</div>
            <div style={{ background: '#FFF0EB', border: '1px solid #FDBCAA', borderRadius: 12, padding: '12px', marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#C23B22', fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>💡 결제 기능 준비 중이에요!</div>
              <div style={{ fontSize: 11, color: '#F4845F', marginTop: 4, lineHeight: 1.6, fontFamily: 'Nunito, sans-serif' }}>곧 토스페이먼츠 결제가 연동될 예정이에요. 조금만 기다려 주세요 😊</div>
            </div>
            <button onClick={() => setShowChargeAlert(false)} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #F4845F, #E8603A)', color: 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>확인</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Edu;