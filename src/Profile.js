import React, { useState } from 'react';
import { db, auth } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { sendEmailVerification } from 'firebase/auth';
import { toArray } from './utils';

const SUBJECTS = ['국어', '영어', '수학', '과학', '사회', '역사', '체육', '음악', '미술', '기술', '도덕', '초등 전과목', '기타'];
const REGIONS = ['서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
const LEVELS = ['유치원', '초등학교', '중학교', '고등학교', '대학교', '학원/교습소', '기타'];
const MBTI_LIST = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
const HOBBIES = ['독서', '영화감상', '음악감상', '운동', '요리', '여행', '게임', '등산', '사진', '그림', '악기', '춤', '카페탐방', '맛집탐방', '반려동물', '드라마', '유튜브', '쇼핑', '캠핑', '자전거'];
const FOOD_PREFS = ['한식', '중식', '일식', '양식', '분식', '채식', '해산물', '고기류', '디저트', '뭐든 잘 먹어요'];
const TRAVEL_STYLES = ['계획적인 여행', '즉흥적인 여행', '힐링 여행', '액티비티 여행', '문화탐방', '맛집투어', '혼자 여행 선호', '함께 여행 선호'];
const DRINK_OPTIONS = ['전혀 안 마셔요', '가끔 마셔요', '즐겨 마셔요', '자주 마셔요'];
const SMOKE_OPTIONS = ['비흡연', '흡연', '금연 중'];
const RELIGION_OPTIONS = ['없음', '기독교', '천주교', '불교', '이슬람교', '기타'];
const BODY_TYPES = ['마른 편', '보통', '통통한 편', '근육질', '말하기 불편해요'];
const MARRIAGE_OPTIONS = ['진지한 만남 원해요', '자연스럽게 발전하면 좋겠어요', '아직 잘 모르겠어요', '가벼운 만남도 괜찮아요'];
const DATE_STYLES = ['카페에서 대화', '맛집 탐방', '영화 관람', '산책 / 드라이브', '전시회 / 공연', '액티비티', '집에서 편하게', '상대방에게 맞출게요'];
const WEEKEND_ACTIVITIES = ['집에서 쉬어요', '친구들 만나요', '운동해요', '취미 활동해요', '여행 가요', '맛집 탐방해요', '문화생활 즐겨요', '그때그때 달라요'];
const LOVE_STYLES = ['다정하고 애정표현 많이', '서로 존중하며 자유롭게', '함께하는 시간 중시', '각자의 시간도 중요', '친구같은 연애', '설레는 연애'];

const CLOUD_NAME = 'ds4tdz6ps';
const UPLOAD_PRESET = 'ml_default';

function Profile({ user, onComplete, onBack }) {
  const [step, setStep] = useState(1);
  const [realName, setRealName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [mbti, setMbti] = useState('');
  const [religion, setReligion] = useState('');
  const [drink, setDrink] = useState('');
  const [smoke, setSmoke] = useState('');
  const [marriageIntent, setMarriageIntent] = useState('');
  const [level, setLevel] = useState([]);
  const [subject, setSubject] = useState([]);
  const [region, setRegion] = useState([]);
  const [hobbies, setHobbies] = useState([]);
  const [foodPref, setFoodPref] = useState([]);
  const [travelStyle, setTravelStyle] = useState([]);
  const [weekendActivity, setWeekendActivity] = useState([]);
  const [loveStyle, setLoveStyle] = useState([]);
  const [dateStyle, setDateStyle] = useState([]);
  const [myCharm, setMyCharm] = useState('');
  const [idealType, setIdealType] = useState('');
  const [bio, setBio] = useState('');
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendVerification = async () => {
    setEmailError('');
    try {
      await sendEmailVerification(auth.currentUser);
      setEmailSent(true);
    } catch (e) {
      setEmailError(e.code === 'auth/too-many-requests' ? '잠시 후 다시 시도해주세요.' : '이메일 발송 중 오류가 발생했어요.');
    }
  };

  const handleCheckVerification = async () => {
    setCheckingEmail(true);
    setEmailError('');
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) setEmailVerified(true);
      else setEmailError('아직 인증이 완료되지 않았어요. 이메일을 확인해주세요.');
    } catch (e) { setEmailError('확인 중 오류가 발생했어요.'); }
    setCheckingEmail(false);
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newPhotos = [...photos, ...files].slice(0, 6);
    setPhotos(newPhotos);
    setPhotoPreviews(newPhotos.map(f => URL.createObjectURL(f)));
  };

  const removePhoto = (idx) => {
    const newPhotos = photos.filter((_, i) => i !== idx);
    setPhotos(newPhotos);
    setPhotoPreviews(newPhotos.map(f => URL.createObjectURL(f)));
  };

  const uploadPhotos = async () => {
    if (!photos.length) return [];
    return await Promise.all(photos.map(async (photo) => {
      const formData = new FormData();
      formData.append('file', photo);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('cloud_name', CLOUD_NAME);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      return data.secure_url;
    }));
  };

  const handleSave = async () => {
    setLoading(true); setUploading(true);
    try {
      const photoUrls = await uploadPhotos();
      setUploading(false);
      const profileData = {
        uid: user.uid, email: user.email,
        realName, birthDate, schoolName, emailVerified: true,
        name, age: parseInt(age), gender, height, bodyType, mbti,
        religion, drink, smoke, marriageIntent,
        level, subject, region,
        hobbies, foodPref, travelStyle, weekendActivity,
        loveStyle, dateStyle, myCharm, idealType, bio,
        photoUrl: photoUrls[0] || null, photoUrls,
        createdAt: new Date(), verified: false, verifyStatus: null,
      };
      await setDoc(doc(db, 'users', user.uid), profileData);
      onComplete(profileData);
    } catch (e) { alert('저장 중 오류가 발생했어요.'); setUploading(false); }
    setLoading(false);
  };

  const chipStyle = (selected) => ({
    padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13,
    border: selected ? '2px solid #F4845F' : '1.5px solid #FDBCAA',
    background: selected ? '#FFF0EB' : 'white',
    color: selected ? '#C23B22' : '#aaa',
    fontWeight: selected ? 700 : 400,
    fontFamily: 'Nunito, sans-serif', transition: 'all 0.15s'
  });

  const toggleHobby = (h) => setHobbies(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h]);
  const toggleLevel = (v) => setLevel(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  const toggleSubject = (v) => setSubject(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  const toggleRegion = (v) => setRegion(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  const toggleFoodPref = (v) => setFoodPref(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  const toggleTravelStyle = (v) => setTravelStyle(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  const toggleWeekendActivity = (v) => setWeekendActivity(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  const toggleLoveStyle = (v) => setLoveStyle(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  const toggleDateStyle = (v) => setDateStyle(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  const TOTAL_STEPS = 7;

  return (
    <div className="phone">
      <div className="header">
        <div className="logo" onClick={onBack} style={{ cursor: 'pointer' }}>🍎 티처밋</div>
        <div style={{ fontSize: 13, color: '#FDBCAA', fontWeight: 600, fontFamily: 'Nunito, sans-serif' }}>{step} / {TOTAL_STEPS}</div>
      </div>

      <div style={{ padding: '20px 28px', flex: 1, overflowY: 'auto', background: 'white' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < step ? '#F4845F' : '#FFF0EB', transition: 'background 0.3s' }} />
          ))}
        </div>

        {/* 1단계 - 본인 확인 */}
        {step === 1 && (
          <div>
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#FDBCAA', fontSize: 13, cursor: 'pointer', padding: '0 0 16px 0', fontFamily: 'Nunito, sans-serif', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>← 로그인으로 돌아가기</button>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#3D1008', fontFamily: 'Nunito, sans-serif', marginBottom: 6 }}>본인 확인 🔒</div>
            <div style={{ fontSize: 14, color: '#FDBCAA', marginBottom: 8, lineHeight: 1.6, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>교원 인증 심사에 사용되는 정보예요.<br />앱에는 표시되지 않아요.</div>

            <div style={{ background: '#FFF0EB', border: '1.5px solid #FDBCAA', borderRadius: 14, padding: '14px 16px', marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: '#C23B22', fontWeight: 700, marginBottom: 4, fontFamily: 'Nunito, sans-serif' }}>🔐 개인정보 보호 안내</div>
              <div style={{ fontSize: 12, color: '#F4845F', lineHeight: 1.7, fontFamily: 'Nunito, sans-serif' }}>입력하신 실명·생년월일·소속학교는<br />교원 인증 서류 대조 목적으로만 사용되며<br />다른 사용자에게 공개되지 않아요.</div>
            </div>

            <div className="input-group">
              <label>실명 <span style={{ color: '#ff4757', fontSize: 11 }}>*재직증명서와 동일하게</span></label>
              <input type="text" placeholder="홍길동" value={realName} onChange={e => setRealName(e.target.value)} />
            </div>
            <div className="input-group">
              <label>생년월일 <span style={{ color: '#FDBCAA', fontSize: 11 }}>*신원 확인용</span></label>
              <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} style={{ colorScheme: 'light' }} />
            </div>
            <div className="input-group">
              <label>소속 학교/기관명 <span style={{ color: '#ff4757', fontSize: 11 }}>*재직증명서와 동일하게</span></label>
              <input type="text" placeholder="예: OO초등학교, OO학원" value={schoolName} onChange={e => setSchoolName(e.target.value)} />
            </div>

            <div className="input-group">
              <label>이메일 인증</label>
              <div style={{ background: emailVerified ? '#f0fdf4' : '#FFFAF8', border: `1.5px solid ${emailVerified ? '#86efac' : '#FDBCAA'}`, borderRadius: 14, padding: '16px' }}>
                <div style={{ fontSize: 13, color: '#555', marginBottom: 10, fontFamily: 'Nunito, sans-serif' }}>가입 이메일: <strong>{user.email}</strong></div>
                {emailVerified ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>✅</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#166534', fontFamily: 'Nunito, sans-serif' }}>이메일 인증 완료!</span>
                  </div>
                ) : (
                  <>
                    {!emailSent ? (
                      <button onClick={handleSendVerification} style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg, #F4845F, #E8603A)', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>📧 인증 이메일 보내기</button>
                    ) : (
                      <div>
                        <div style={{ fontSize: 12, color: '#C23B22', marginBottom: 10, lineHeight: 1.6, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>📧 이메일을 보냈어요!<br />받은 편지함에서 인증 링크를 클릭한 후<br />아래 버튼을 눌러주세요.</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={handleCheckVerification} disabled={checkingEmail} style={{ flex: 2, padding: '11px', background: 'linear-gradient(135deg, #F4845F, #E8603A)', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>{checkingEmail ? '확인 중...' : '✓ 인증 확인하기'}</button>
                          <button onClick={handleSendVerification} style={{ flex: 1, padding: '11px', background: 'white', color: '#FDBCAA', border: '1.5px solid #FDBCAA', borderRadius: 10, fontSize: 12, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>재발송</button>
                        </div>
                      </div>
                    )}
                  </>
                )}
                {emailError && <div style={{ fontSize: 12, color: '#ff4757', marginTop: 8, fontFamily: 'Nunito, sans-serif' }}>{emailError}</div>}
              </div>
            </div>

            <button className="btn-primary" onClick={() => setStep(2)} disabled={!realName || !birthDate || !schoolName || !emailVerified} style={{ marginTop: 8 }}>다음 →</button>
            {!emailVerified && <div style={{ fontSize: 12, color: '#FDBCAA', textAlign: 'center', marginTop: 10, fontFamily: 'Nunito, sans-serif' }}>이메일 인증을 완료해야 다음 단계로 넘어갈 수 있어요</div>}
          </div>
        )}

        {/* 2단계 - 사진 */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#3D1008', fontFamily: 'Nunito, sans-serif', marginBottom: 6 }}>사진을 올려주세요 📸</div>
            <div style={{ fontSize: 14, color: '#FDBCAA', marginBottom: 28, lineHeight: 1.6, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>첫인상이 중요해요!<br />선명한 얼굴 사진을 올려주세요</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
              {[0,1,2,3,4,5].map(idx => (
                <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: 16, overflow: 'hidden', background: '#FFF0EB', border: '2px dashed #FDBCAA', cursor: 'pointer' }}
                  onClick={() => !photoPreviews[idx] && document.getElementById('photoInput').click()}>
                  {photoPreviews[idx] ? (
                    <>
                      <img src={photoPreviews[idx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button onClick={(e) => { e.stopPropagation(); removePhoto(idx); }} style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      {idx === 0 && <div style={{ position: 'absolute', bottom: 4, left: 4, background: '#F4845F', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>대표</div>}
                    </>
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 24 }}>📷</span>
                      {idx === 0 && <span style={{ fontSize: 10, color: '#FDBCAA' }}>필수</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <input id="photoInput" type="file" accept="image/*" multiple onChange={handlePhotoChange} style={{ display: 'none' }} />
            <button onClick={() => document.getElementById('photoInput').click()} style={{ width: '100%', padding: '12px', background: '#FFF0EB', border: '1.5px solid #FDBCAA', borderRadius: 14, color: '#C23B22', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>📷 사진 추가하기 ({photoPreviews.length}/6)</button>

            <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #F4845F, #E8603A)', border: 'none', borderRadius: 14, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}><span>이전</span><span>←</span></button>
              <button onClick={() => setStep(3)} style={{ flex: 1, padding: '14px', background: 'white', border: '1.5px solid #FDBCAA', borderRadius: 14, color: '#FDBCAA', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', whiteSpace: 'nowrap' }}>나중에</button>
              <button onClick={() => setStep(3)} disabled={photoPreviews.length === 0} style={{ flex: 1, padding: '14px', background: photoPreviews.length === 0 ? '#FFF0EB' : 'linear-gradient(135deg, #F4845F, #E8603A)', border: 'none', borderRadius: 14, color: photoPreviews.length === 0 ? '#FDBCAA' : 'white', fontSize: 13, fontWeight: 700, cursor: photoPreviews.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'Nunito, sans-serif' }}>다음 →</button>
            </div>
          </div>
        )}

        {/* 3단계 - 기본 정보 */}
        {step === 3 && (
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#3D1008', fontFamily: 'Nunito, sans-serif', marginBottom: 6 }}>기본 정보 ✏️</div>
            <div style={{ fontSize: 14, color: '#FDBCAA', marginBottom: 24, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>나를 소개해볼게요</div>
            <div className="input-group">
              <label>닉네임 <span style={{ color: '#FDBCAA', fontSize: 11 }}>*앱에 표시되는 이름</span></label>
              <input type="text" placeholder="표시될 이름" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="input-group"><label>나이</label><input type="number" placeholder="만 나이" value={age} onChange={e => setAge(e.target.value)} /></div>
            <div className="input-group">
              <label>성별</label>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                {['남성', '여성'].map(g => (
                  <button key={g} onClick={() => setGender(g)} style={{ flex: 1, padding: '13px', borderRadius: 14, cursor: 'pointer', border: gender === g ? '2px solid #F4845F' : '1.5px solid #FDBCAA', background: gender === g ? '#FFF0EB' : 'white', color: gender === g ? '#C23B22' : '#aaa', fontWeight: gender === g ? 700 : 400, fontSize: 15, fontFamily: 'Nunito, sans-serif' }}>{g}</button>
                ))}
              </div>
            </div>
            <div className="input-group"><label>키 (cm)</label><input type="number" placeholder="예: 170" value={height} onChange={e => setHeight(e.target.value)} /></div>
            <div className="input-group"><label>체형</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>{BODY_TYPES.map(b => <button key={b} onClick={() => setBodyType(b)} style={chipStyle(bodyType === b)}>{b}</button>)}</div></div>
            <div className="input-group"><label>MBTI</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>{MBTI_LIST.map(m => <button key={m} onClick={() => setMbti(m)} style={chipStyle(mbti === m)}>{m}</button>)}</div></div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn-secondary" onClick={() => setStep(2)}>← 이전</button>
              <button className="btn-primary" onClick={() => setStep(4)} disabled={!name || !age || !gender}>다음 →</button>
            </div>
          </div>
        )}

        {/* 4단계 - 신상 상세 */}
        {step === 4 && (
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#3D1008', fontFamily: 'Nunito, sans-serif', marginBottom: 6 }}>조금 더 알려주세요 🙋</div>
            <div style={{ fontSize: 14, color: '#FDBCAA', marginBottom: 24, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>상대방이 나를 더 잘 알 수 있어요</div>
            <div className="input-group"><label>음주</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>{DRINK_OPTIONS.map(d => <button key={d} onClick={() => setDrink(d)} style={chipStyle(drink === d)}>{d}</button>)}</div></div>
            <div className="input-group" style={{ marginTop: 16 }}><label>흡연</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>{SMOKE_OPTIONS.map(s => <button key={s} onClick={() => setSmoke(s)} style={chipStyle(smoke === s)}>{s}</button>)}</div></div>
            <div className="input-group" style={{ marginTop: 16 }}><label>종교</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>{RELIGION_OPTIONS.map(r => <button key={r} onClick={() => setReligion(r)} style={chipStyle(religion === r)}>{r}</button>)}</div></div>
            <div className="input-group" style={{ marginTop: 16 }}>
              <label>결혼 의향</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                {MARRIAGE_OPTIONS.map(m => <button key={m} onClick={() => setMarriageIntent(m)} style={{ ...chipStyle(marriageIntent === m), padding: '12px 16px', borderRadius: 14, textAlign: 'left' }}>{m}</button>)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn-secondary" onClick={() => setStep(3)}>← 이전</button>
              <button className="btn-primary" onClick={() => setStep(5)}>다음 →</button>
            </div>
          </div>
        )}

        {/* 5단계 - 근무 정보 */}
        {step === 5 && (
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#3D1008', fontFamily: 'Nunito, sans-serif', marginBottom: 6 }}>근무 정보 🏫</div>
            <div style={{ fontSize: 14, color: '#FDBCAA', marginBottom: 24, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>어떤 선생님인가요?</div>
            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                학교 급별
                <span style={{ fontSize: 9, color: '#9C5A4A', fontWeight: 500, background: '#FFF0EB', padding: '2px 6px', borderRadius: 8 }}>여러 개 가능</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {LEVELS.map(l => <button key={l} onClick={() => toggleLevel(l)} style={chipStyle(level.includes(l))}>{l}</button>)}
              </div>
            </div>
            <div className="input-group" style={{ marginTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                담당 과목
                <span style={{ fontSize: 9, color: '#9C5A4A', fontWeight: 500, background: '#FFF0EB', padding: '2px 6px', borderRadius: 8 }}>여러 개 가능</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {SUBJECTS.map(s => <button key={s} onClick={() => toggleSubject(s)} style={chipStyle(subject.includes(s))}>{s}</button>)}
              </div>
            </div>
            <div className="input-group" style={{ marginTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                근무 지역
                <span style={{ fontSize: 9, color: '#9C5A4A', fontWeight: 500, background: '#FFF0EB', padding: '2px 6px', borderRadius: 8 }}>여러 개 가능</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {REGIONS.map(r => <button key={r} onClick={() => toggleRegion(r)} style={chipStyle(region.includes(r))}>{r}</button>)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn-secondary" onClick={() => setStep(4)}>← 이전</button>
              <button className="btn-primary" onClick={() => setStep(6)} disabled={level.length === 0 || subject.length === 0 || region.length === 0}>다음 →</button>
            </div>
          </div>
        )}

        {/* 6단계 - 라이프스타일 */}
        {step === 6 && (
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#3D1008', fontFamily: 'Nunito, sans-serif', marginBottom: 6 }}>라이프스타일 🌿</div>
            <div style={{ fontSize: 14, color: '#FDBCAA', marginBottom: 24, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>어떤 생활을 즐기세요?</div>
            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                취미
                <span style={{ fontSize: 9, color: '#9C5A4A', fontWeight: 500, background: '#FFF0EB', padding: '2px 6px', borderRadius: 8 }}>여러 개 가능</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {HOBBIES.map(h => <button key={h} onClick={() => toggleHobby(h)} style={chipStyle(hobbies.includes(h))}>{h}</button>)}
              </div>
            </div>
            <div className="input-group" style={{ marginTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                음식 취향
                <span style={{ fontSize: 9, color: '#9C5A4A', fontWeight: 500, background: '#FFF0EB', padding: '2px 6px', borderRadius: 8 }}>여러 개 가능</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {FOOD_PREFS.map(f => <button key={f} onClick={() => toggleFoodPref(f)} style={chipStyle(foodPref.includes(f))}>{f}</button>)}
              </div>
            </div>
            <div className="input-group" style={{ marginTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                여행 스타일
                <span style={{ fontSize: 9, color: '#9C5A4A', fontWeight: 500, background: '#FFF0EB', padding: '2px 6px', borderRadius: 8 }}>여러 개 가능</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {TRAVEL_STYLES.map(tr => <button key={tr} onClick={() => toggleTravelStyle(tr)} style={chipStyle(travelStyle.includes(tr))}>{tr}</button>)}
              </div>
            </div>
            <div className="input-group" style={{ marginTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                주말에 주로
                <span style={{ fontSize: 9, color: '#9C5A4A', fontWeight: 500, background: '#FFF0EB', padding: '2px 6px', borderRadius: 8 }}>여러 개 가능</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {WEEKEND_ACTIVITIES.map(w => <button key={w} onClick={() => toggleWeekendActivity(w)} style={chipStyle(weekendActivity.includes(w))}>{w}</button>)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn-secondary" onClick={() => setStep(5)}>← 이전</button>
              <button className="btn-primary" onClick={() => setStep(7)}>다음 →</button>
            </div>
          </div>
        )}

        {/* 7단계 - 연애 스타일 */}
        {step === 7 && (
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#3D1008', fontFamily: 'Nunito, sans-serif', marginBottom: 6 }}>연애 스타일 💕</div>
            <div style={{ fontSize: 14, color: '#FDBCAA', marginBottom: 24, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>마지막 단계예요!</div>
            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                연애 스타일
                <span style={{ fontSize: 9, color: '#9C5A4A', fontWeight: 500, background: '#FFF0EB', padding: '2px 6px', borderRadius: 8 }}>여러 개 가능</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {LOVE_STYLES.map(l => <button key={l} onClick={() => toggleLoveStyle(l)} style={chipStyle(loveStyle.includes(l))}>{l}</button>)}
              </div>
            </div>
            <div className="input-group" style={{ marginTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                첫 데이트 스타일
                <span style={{ fontSize: 9, color: '#9C5A4A', fontWeight: 500, background: '#FFF0EB', padding: '2px 6px', borderRadius: 8 }}>여러 개 가능</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {DATE_STYLES.map(d => <button key={d} onClick={() => toggleDateStyle(d)} style={chipStyle(dateStyle.includes(d))}>{d}</button>)}
              </div>
            </div>
            <div className="input-group" style={{ marginTop: 16 }}><label>나의 장점</label><input type="text" placeholder="예: 유머감각이 넘쳐요 😄" value={myCharm} onChange={e => setMyCharm(e.target.value)} /></div>
            <div className="input-group"><label>이상형 한 줄 소개</label><input type="text" placeholder="예: 함께 있으면 편한 사람" value={idealType} onChange={e => setIdealType(e.target.value)} /></div>
            <div className="input-group">
              <label>자기소개 (선택)</label>
              <textarea placeholder="자유롭게 자신을 소개해주세요 😊" value={bio} onChange={e => setBio(e.target.value)} style={{ width: '100%', padding: '14px 18px', border: '1.5px solid #FDBCAA', borderRadius: 14, fontSize: 14, outline: 'none', resize: 'none', height: 100, fontFamily: 'Nunito, sans-serif', color: '#3D1008', lineHeight: 1.6, background: '#FFFAF8' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn-secondary" onClick={() => setStep(6)}>← 이전</button>
              <button className="btn-primary" onClick={handleSave} disabled={loading}>
                {uploading ? '사진 업로드 중...' : loading ? '저장 중...' : '프로필 완성! 🎉'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;