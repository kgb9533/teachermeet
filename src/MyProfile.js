import React, { useState } from 'react';
import { db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Verify from './Verify';
import Admin from './Admin';
import VerifiedBadge from './VerifiedBadge';
import { requestPhoneVerification } from './phoneAuth';
import BlockList from './BlockList';
import { enableNotifications, disableNotifications } from './notifications';
import Terms from './Terms';
import Privacy from './Privacy';
import Refund from './Refund';
import Youth from './Youth';
import LocationTerms from './LocationTerms';
import Community from './Community';
import BusinessInfo from './BusinessInfo';

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

function SectionTitle({ title, isOpen, onToggle }) {
  return (
    <div onClick={onToggle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', marginTop: 12, marginBottom: isOpen ? 12 : 0, background: '#FFF0EB', borderRadius: 14, cursor: 'pointer', border: '1.5px solid #FDBCAA' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#C23B22', fontFamily: 'Nunito, sans-serif' }}>{title}</div>
      <div style={{ fontSize: 16, color: '#F4845F', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</div>
    </div>
  );
}

function MyProfile({ user, userProfile, onUpdate, onLogout }) {
  const [name, setName] = useState(userProfile.name || '');
  // 본인인증 정보에서 나이 계산 (생년월일 → 만 나이)
  const calculateAgeFromBirth = (birthStr) => {
    if (!birthStr) return null;
    const year = parseInt(birthStr.substring(0, 4));
    const month = parseInt(birthStr.substring(4, 6));
    const day = parseInt(birthStr.substring(6, 8));
    if (isNaN(year)) return null;
    const today = new Date();
    let calculatedAge = today.getFullYear() - year;
    const m = today.getMonth() + 1 - month;
    if (m < 0 || (m === 0 && today.getDate() < day)) calculatedAge--;
    return calculatedAge;
  };

  // 본인인증 완료 시: verified 정보 우선. 미완료 시: 사용자 입력값 또는 기존 저장값
  const verifiedAge = userProfile.isVerified ? calculateAgeFromBirth(userProfile.verifiedBirth) : null;
  const initialAge = userProfile.isVerified && verifiedAge ? verifiedAge : (userProfile.age || '');
  const initialGender = userProfile.isVerified && userProfile.verifiedGender ? userProfile.verifiedGender : (userProfile.gender || '');

  const [age, setAge] = useState(initialAge);
  const [gender, setGender] = useState(initialGender);
  const [height, setHeight] = useState(userProfile.height || '');
  const [bodyType, setBodyType] = useState(userProfile.bodyType || '');
  const [mbti, setMbti] = useState(userProfile.mbti || '');
  const [religion, setReligion] = useState(userProfile.religion || '');
  const [drink, setDrink] = useState(userProfile.drink || '');
  const [smoke, setSmoke] = useState(userProfile.smoke || '');
  const [marriageIntent, setMarriageIntent] = useState(userProfile.marriageIntent || '');
  const [level, setLevel] = useState(userProfile.level || '');
  const [subject, setSubject] = useState(userProfile.subject || '');
  const [region, setRegion] = useState(userProfile.region || '');
  const [hobbies, setHobbies] = useState(userProfile.hobbies || []);
  const [foodPref, setFoodPref] = useState(userProfile.foodPref || '');
  const [travelStyle, setTravelStyle] = useState(userProfile.travelStyle || '');
  const [weekendActivity, setWeekendActivity] = useState(userProfile.weekendActivity || '');
  const [loveStyle, setLoveStyle] = useState(userProfile.loveStyle || '');
  const [dateStyle, setDateStyle] = useState(userProfile.dateStyle || '');
  const [myCharm, setMyCharm] = useState(userProfile.myCharm || '');
  const [idealType, setIdealType] = useState(userProfile.idealType || '');
  const [bio, setBio] = useState(userProfile.bio || '');
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState(userProfile.photoUrls || (userProfile.photoUrl ? [userProfile.photoUrl] : []));
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showBlockList, setShowBlockList] = useState(false);
  const [policyPage, setPolicyPage] = useState(null);
  const [notifLoading, setNotifLoading] = useState(false);
  const [openSections, setOpenSections] = useState({ '기본 정보': false, '신상 상세': false, '근무 정보': false, '라이프스타일': false, '연애 스타일': false });

  const toggleHobby = (h) => setHobbies(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h]);
  const toggleSection = (title) => setOpenSections(prev => ({ ...prev, [title]: !prev[title] }));

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const existingUrls = photoPreviews.filter(p => p.startsWith('http'));
    const newPreviews = files.map(f => URL.createObjectURL(f));
    const combined = [...existingUrls, ...newPreviews].slice(0, 6);
    setPhotos(prev => [...prev, ...files].slice(0, 6 - existingUrls.length));
    setPhotoPreviews(combined);
  };

  const removePhoto = (idx) => {
    const newPreviews = photoPreviews.filter((_, i) => i !== idx);
    setPhotoPreviews(newPreviews);
    if (!photoPreviews[idx].startsWith('http')) setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const uploadPhotos = async () => {
    const existingUrls = photoPreviews.filter(p => p.startsWith('http'));
    if (!photos.length) return existingUrls;
    const newUrls = await Promise.all(photos.map(async (photo) => {
      const formData = new FormData();
      formData.append('file', photo);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('cloud_name', CLOUD_NAME);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      return data.secure_url;
    }));
    return [...existingUrls, ...newUrls].slice(0, 6);
  };
// ===== 알림 켜기 =====
  const handleEnableNotifications = async () => {
    setNotifLoading(true);
    try {
      await enableNotifications(user.uid);
      onUpdate({ ...userProfile, notificationsEnabled: true });
      alert('알림이 켜졌어요! 🔔\n매칭, 메시지 알림을 받을 수 있어요.');
    } catch (e) {
      alert(e.message || '알림 켜기에 실패했어요.');
    }
    setNotifLoading(false);
  };

  // ===== 알림 끄기 =====
  const handleDisableNotifications = async () => {
    if (!window.confirm('알림을 끄시겠어요?\n매칭/메시지 알림을 받을 수 없게 돼요.')) return;
    setNotifLoading(true);
    try {
      await disableNotifications(user.uid);
      onUpdate({ ...userProfile, notificationsEnabled: false });
      alert('알림을 껐어요.');
    } catch (e) {
      alert('알림 끄기에 실패했어요.');
    }
    setNotifLoading(false);
  };


  const handleSave = async () => {
    setLoading(true);
    try {
      const photoUrls = await uploadPhotos();
      let lat = userProfile.lat || null; let lng = userProfile.lng || null;
      if (navigator.geolocation) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition((pos) => { lat = pos.coords.latitude; lng = pos.coords.longitude; resolve(); }, () => resolve());
        });
      }
      const updated = { name, age: parseInt(age), gender, height, bodyType, mbti, religion, drink, smoke, marriageIntent, level, subject, region, hobbies, foodPref, travelStyle, weekendActivity, loveStyle, dateStyle, myCharm, idealType, bio, photoUrl: photoUrls[0] || null, photoUrls, ...(lat && { lat }), ...(lng && { lng }) };
      await updateDoc(doc(db, 'users', user.uid), updated);
      onUpdate({ ...userProfile, ...updated });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { alert('저장 중 오류가 발생했어요.'); }
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

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: '#FFF8F5' }}>
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ background: 'linear-gradient(135deg, #F4845F 0%, #E8603A 100%)', borderRadius: 14, padding: '13px 16px', color: 'white', boxShadow: '0 4px 12px rgba(232, 96, 58, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: 'rgba(255,255,255,0.28)', padding: '3px 10px', borderRadius: 12, fontSize: 10, fontWeight: 800, letterSpacing: '0.5px', fontFamily: 'Nunito, sans-serif' }}>PROFILE</div>
            <span style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Nunito, sans-serif' }}>내 프로필</span>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 12, opacity: 0.92, fontWeight: 500, fontFamily: 'Nunito, sans-serif' }}>정보를 채울수록 운명의 만남이 가까워져요 💫</p>
        </div>
      </div>

      <div style={{ padding: '24px 24px 40px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#C23B22', letterSpacing: '0.5px', marginBottom: 4, fontFamily: 'Nunito, sans-serif' }}>프로필 사진 (최대 6장)</div>
          <div style={{ fontSize: 11, color: '#9C5A4A', marginBottom: 12, fontFamily: 'Nunito, sans-serif' }}>첫 번째 사진이 대표사진으로 표시돼요 ✨</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
            {[0,1,2,3,4,5].map(idx => (
              <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: 16, overflow: 'hidden', background: '#FFF0EB', border: '2px dashed #FDBCAA', cursor: 'pointer' }}
                onClick={() => !photoPreviews[idx] && document.getElementById('editPhotoInput').click()}>
                {photoPreviews[idx] ? (
                  <>
                    <img src={photoPreviews[idx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button onClick={(e) => { e.stopPropagation(); removePhoto(idx); }} style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    {idx === 0 && <div style={{ position: 'absolute', bottom: 4, left: 4, background: '#F4845F', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>대표</div>}
                  </>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 24 }}>📷</span>
                    {idx === 0 && <span style={{ fontSize: 10, color: '#F4845F', fontWeight: 700, marginTop: 2 }}>대표사진</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
          <input id="editPhotoInput" type="file" accept="image/*" multiple onChange={handlePhotoChange} style={{ display: 'none' }} />
          <button onClick={() => document.getElementById('editPhotoInput').click()} style={{ width: '100%', padding: '12px', background: '#FFF0EB', border: '1.5px solid #FDBCAA', borderRadius: 14, color: '#C23B22', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>📷 사진 추가하기 ({photoPreviews.length}/6)</button>
        </div>

        <SectionTitle title="기본 정보" isOpen={openSections['기본 정보']} onToggle={() => toggleSection('기본 정보')} />
        {openSections['기본 정보'] && (
          <div>
            <div className="input-group"><label>닉네임</label><input type="text" value={name} onChange={e => setName(e.target.value)} /></div>
            {/* 나이 - 본인인증 여부에 따라 잠금/자유 */}
            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                나이
                {userProfile.isVerified && <span style={{ fontSize: 12 }}>🔒</span>}
              </label>
              {userProfile.isVerified ? (
                <div style={{
                  background: '#F5EEEA',
                  border: '1.5px solid #E8D5CC',
                  borderRadius: 14,
                  padding: '13px 18px',
                  fontSize: 15,
                  color: '#9C5A4A',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 700,
                }}>
                  <span>{age}{age && '세'}</span>
                  <span style={{ fontSize: 13 }}>🔒</span>
                </div>
              ) : (
                <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="예: 30" />
              )}
              <div style={{
                marginTop: 6,
                fontSize: 11,
                color: userProfile.isVerified ? '#1DA1F2' : '#9C5A4A',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 500,
              }}>
                {userProfile.isVerified ? '✓ 본인인증 정보예요' : '📱 본인인증하면 자동으로 적용돼요'}
              </div>
            </div>

            {/* 성별 - 본인인증 여부에 따라 잠금/자유 */}
            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                성별
                {userProfile.isVerified && <span style={{ fontSize: 12 }}>🔒</span>}
              </label>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                {['남성', '여성'].map(g => {
                  const isSelected = gender === g;
                  const isLocked = userProfile.isVerified;
                  return (
                    <button
                      key={g}
                      onClick={() => !isLocked && setGender(g)}
                      disabled={isLocked}
                      style={{
                        flex: 1,
                        padding: '13px',
                        borderRadius: 14,
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        border: isSelected
                          ? (isLocked ? '2px solid #E8D5CC' : '2px solid #F4845F')
                          : '1.5px solid #FDBCAA',
                        background: isSelected
                          ? (isLocked ? '#F5EEEA' : '#FFF0EB')
                          : (isLocked ? '#FAFAFA' : 'white'),
                        color: isSelected
                          ? (isLocked ? '#9C5A4A' : '#C23B22')
                          : (isLocked ? '#C5B5AC' : '#aaa'),
                        fontWeight: isSelected ? 700 : 400,
                        fontSize: 15,
                        fontFamily: 'Nunito, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      {g}
                      {isSelected && isLocked && <span style={{ fontSize: 11 }}>🔒</span>}
                    </button>
                  );
                })}
              </div>
              <div style={{
                marginTop: 6,
                fontSize: 11,
                color: userProfile.isVerified ? '#1DA1F2' : '#9C5A4A',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 500,
              }}>
                {userProfile.isVerified ? '✓ 본인인증 정보예요' : '📱 본인인증하면 자동으로 적용돼요'}
              </div>
            </div>
            <div className="input-group"><label>키 (cm)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="예: 170" /></div>
            <div className="input-group"><label>체형</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>{BODY_TYPES.map(b => <button key={b} onClick={() => setBodyType(b)} style={chipStyle(bodyType === b)}>{b}</button>)}</div></div>
            <div className="input-group"><label>MBTI</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>{MBTI_LIST.map(m => <button key={m} onClick={() => setMbti(m)} style={chipStyle(mbti === m)}>{m}</button>)}</div></div>
          </div>
        )}

        <SectionTitle title="신상 상세" isOpen={openSections['신상 상세']} onToggle={() => toggleSection('신상 상세')} />
        {openSections['신상 상세'] && (
          <div>
            <div className="input-group"><label>음주</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>{DRINK_OPTIONS.map(d => <button key={d} onClick={() => setDrink(d)} style={chipStyle(drink === d)}>{d}</button>)}</div></div>
            <div className="input-group" style={{ marginTop: 16 }}><label>흡연</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>{SMOKE_OPTIONS.map(s => <button key={s} onClick={() => setSmoke(s)} style={chipStyle(smoke === s)}>{s}</button>)}</div></div>
            <div className="input-group" style={{ marginTop: 16 }}><label>종교</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>{RELIGION_OPTIONS.map(r => <button key={r} onClick={() => setReligion(r)} style={chipStyle(religion === r)}>{r}</button>)}</div></div>
            <div className="input-group" style={{ marginTop: 16 }}>
              <label>결혼 의향</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                {MARRIAGE_OPTIONS.map(m => <button key={m} onClick={() => setMarriageIntent(m)} style={{ ...chipStyle(marriageIntent === m), padding: '12px 16px', borderRadius: 14, textAlign: 'left' }}>{m}</button>)}
              </div>
            </div>
          </div>
        )}

        <SectionTitle title="근무 정보" isOpen={openSections['근무 정보']} onToggle={() => toggleSection('근무 정보')} />
        {openSections['근무 정보'] && (
          <div>
            <div className="input-group"><label>학교 급별</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>{LEVELS.map(l => <button key={l} onClick={() => setLevel(l)} style={chipStyle(level === l)}>{l}</button>)}</div></div>
            <div className="input-group" style={{ marginTop: 16 }}><label>담당 과목</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>{SUBJECTS.map(s => <button key={s} onClick={() => setSubject(s)} style={chipStyle(subject === s)}>{s}</button>)}</div></div>
            <div className="input-group" style={{ marginTop: 16 }}><label>근무 지역</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>{REGIONS.map(r => <button key={r} onClick={() => setRegion(r)} style={chipStyle(region === r)}>{r}</button>)}</div></div>
          </div>
        )}

        <SectionTitle title="라이프스타일" isOpen={openSections['라이프스타일']} onToggle={() => toggleSection('라이프스타일')} />
        {openSections['라이프스타일'] && (
          <div>
            <div className="input-group"><label>취미</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>{HOBBIES.map(h => <button key={h} onClick={() => toggleHobby(h)} style={chipStyle(hobbies.includes(h))}>{h}</button>)}</div></div>
            <div className="input-group" style={{ marginTop: 16 }}><label>음식 취향</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>{FOOD_PREFS.map(f => <button key={f} onClick={() => setFoodPref(f)} style={chipStyle(foodPref === f)}>{f}</button>)}</div></div>
            <div className="input-group" style={{ marginTop: 16 }}><label>여행 스타일</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>{TRAVEL_STYLES.map(tr => <button key={tr} onClick={() => setTravelStyle(tr)} style={chipStyle(travelStyle === tr)}>{tr}</button>)}</div></div>
            <div className="input-group" style={{ marginTop: 16 }}><label>주말에 주로</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>{WEEKEND_ACTIVITIES.map(w => <button key={w} onClick={() => setWeekendActivity(w)} style={chipStyle(weekendActivity === w)}>{w}</button>)}</div></div>
          </div>
        )}

        <SectionTitle title="연애 스타일" isOpen={openSections['연애 스타일']} onToggle={() => toggleSection('연애 스타일')} />
        {openSections['연애 스타일'] && (
          <div>
            <div className="input-group"><label>연애 스타일</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>{LOVE_STYLES.map(l => <button key={l} onClick={() => setLoveStyle(l)} style={chipStyle(loveStyle === l)}>{l}</button>)}</div></div>
            <div className="input-group" style={{ marginTop: 16 }}><label>첫 데이트 스타일</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>{DATE_STYLES.map(d => <button key={d} onClick={() => setDateStyle(d)} style={chipStyle(dateStyle === d)}>{d}</button>)}</div></div>
            <div className="input-group" style={{ marginTop: 16 }}><label>나의 장점</label><input type="text" value={myCharm} onChange={e => setMyCharm(e.target.value)} placeholder="예: 유머감각이 넘쳐요 😄" /></div>
            <div className="input-group"><label>이상형 한 줄 소개</label><input type="text" value={idealType} onChange={e => setIdealType(e.target.value)} placeholder="예: 함께 있으면 편한 사람" /></div>
            <div className="input-group">
              <label>자기소개</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="자유롭게 자신을 소개해주세요 😊" style={{ width: '100%', padding: '14px 18px', border: '1.5px solid #FDBCAA', borderRadius: 14, fontSize: 14, outline: 'none', resize: 'none', height: 110, fontFamily: 'Nunito, sans-serif', color: '#3D1008', lineHeight: 1.6, background: '#FFFAF8' }} />
            </div>
          </div>
        )}

        <div style={{ borderTop: '1px solid #FDBCAA', paddingTop: 24, marginTop: 8 }}>
          {/* 알림 설정 영역 */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#C23B22', letterSpacing: '0.5px', marginBottom: 12, fontFamily: 'Nunito, sans-serif' }}>
              알림 설정
            </div>
            {userProfile.notificationsEnabled ? (
              <div style={{ background: '#FFFAF8', border: '1.5px solid #FDBCAA', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>🔔</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#3D1008', fontFamily: 'Nunito, sans-serif' }}>
                      알림 받기 활성화됨
                    </div>
                    <div style={{ fontSize: 11, color: '#9C5A4A', marginTop: 2, fontFamily: 'Nunito, sans-serif' }}>
                      매칭, 메시지 알림을 받고 있어요
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleDisableNotifications}
                  disabled={notifLoading}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'white',
                    color: '#9C5A4A',
                    border: '1.5px solid #FDBCAA',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: notifLoading ? 'not-allowed' : 'pointer',
                    fontFamily: 'Nunito, sans-serif',
                    opacity: notifLoading ? 0.5 : 1,
                  }}
                >
                  {notifLoading ? '처리 중...' : '알림 끄기'}
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handleEnableNotifications}
                  disabled={notifLoading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'linear-gradient(135deg, #F4845F, #E8603A)',
                    border: 'none',
                    borderRadius: 14,
                    color: 'white',
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: notifLoading ? 'not-allowed' : 'pointer',
                    fontFamily: 'Nunito, sans-serif',
                    boxShadow: '0 4px 12px rgba(232, 96, 58, 0.3)',
                    opacity: notifLoading ? 0.6 : 1,
                  }}
                >
                  {notifLoading ? '권한 요청 중...' : '🔔 알림 받기'}
                </button>
                <div style={{ fontSize: 11, color: '#9C5A4A', marginTop: 8, lineHeight: 1.6, fontFamily: 'Nunito, sans-serif' }}>
                  매칭됐을 때, 메시지가 왔을 때 폰으로 알림을 받을 수 있어요!
                </div>
              </>
            )}
          </div>

          {/* 휴대폰 본인인증 영역 */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#C23B22', letterSpacing: '0.5px', marginBottom: 12, fontFamily: 'Nunito, sans-serif' }}>
              본인인증
            </div>
            {userProfile.isVerified ? (
              <div style={{ background: '#F0F9FF', border: '1.5px solid #1DA1F2', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <VerifiedBadge size={20} style={{ marginLeft: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1DA1F2', fontFamily: 'Nunito, sans-serif' }}>
                    본인인증 완료
                  </div>
                  <div style={{ fontSize: 11, color: '#666', marginTop: 2, fontFamily: 'Nunito, sans-serif' }}>
                    {userProfile.verifiedName ? `${userProfile.verifiedName}님 인증 완료` : '휴대폰 본인인증 완료'}
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={async () => {
                  try {
                    const customer = await requestPhoneVerification();
                    await updateDoc(doc(db, 'users', user.uid), {
                      isVerified: true,
                      verifiedName: customer.name,
                      verifiedBirth: customer.birthDate,
                      verifiedGender: customer.gender,
                      verifiedCI: customer.ci,
                      verifiedDI: customer.di,
                      phone: customer.phone,
                      verifiedAt: new Date(),
                    });
                    onUpdate({ ...userProfile, isVerified: true, verifiedName: customer.name });
                    alert('본인인증이 완료되었어요! ✓');
                  } catch (e) {
                    alert(e.message || '본인인증에 실패했어요.');
                  }
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #4FC3F7, #1DA1F2)',
                  border: 'none',
                  borderRadius: 14,
                  color: 'white',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'Nunito, sans-serif',
                  boxShadow: '0 4px 12px rgba(29, 161, 242, 0.3)',
                }}
              >
                📱 휴대폰으로 본인인증하기
              </button>
            )}
            <div style={{ fontSize: 11, color: '#9C5A4A', marginTop: 8, lineHeight: 1.6, fontFamily: 'Nunito, sans-serif' }}>
              본인인증을 받으면 프로필에 파란 인증 마크가 표시되어 더 신뢰감을 줄 수 있어요!
            </div>
          </div>

          {/* 교원 인증 영역 (기존) */}
          <Verify user={user} userProfile={userProfile} onUpdate={onUpdate} />
        </div>

        <button className="btn-primary" onClick={handleSave} disabled={loading} style={{ marginTop: 24 }}>
          {loading ? '저장 중...' : saved ? '저장됐어요 ✓' : '저장하기'}
        </button>

        {showAdmin && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'white', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
            <Admin user={user} onBack={() => setShowAdmin(false)} />
          </div>
        )}
        {showBlockList && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'white', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
            <BlockList user={user} onBack={() => setShowBlockList(false)} />
          </div>
        )}
        {/* 정책 및 약관 섹션 */}
        <div style={{ marginTop: 24, marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#C23B22', letterSpacing: '0.5px', marginBottom: 12, fontFamily: 'Nunito, sans-serif' }}>
            정책 및 약관
          </div>
          <div style={{ background: 'white', border: '1.5px solid #FDBCAA', borderRadius: 14, overflow: 'hidden' }}>
            {[
              { emoji: '📋', label: '이용약관', page: 'terms' },
              { emoji: '🔒', label: '개인정보처리방침', page: 'privacy' },
              { emoji: '🛡️', label: '청소년보호정책', page: 'youth' },
              { emoji: '📍', label: '위치기반서비스 이용약관', page: 'location' },
              { emoji: '💰', label: '결제 및 환불정책', page: 'refund' },
              { emoji: '📜', label: '커뮤니티 운영정책', page: 'community' },
              { emoji: '🏢', label: '사업자 정보', page: 'business' },
            ].map((item, idx, arr) => (
              <button
                key={item.page}
                onClick={() => setPolicyPage(item.page)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '14px 16px',
                  background: 'white',
                  border: 'none',
                  borderBottom: idx === arr.length - 1 ? 'none' : '0.5px solid #FDBCAA',
                  cursor: 'pointer',
                  fontFamily: 'Nunito, sans-serif',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 18 }}>{item.emoji}</span>
                <span style={{ flex: 1, fontSize: 14, color: '#3D1008', fontWeight: 600 }}>{item.label}</span>
                <span style={{ color: '#FDBCAA', fontSize: 18, fontWeight: 400 }}>›</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: '4px 4px', fontSize: 11, color: '#9C5A4A', lineHeight: 1.7, textAlign: 'center', fontFamily: 'Nunito, sans-serif' }}>
            <div style={{ fontWeight: 700, color: '#C23B22', fontSize: 12 }}>티처밋 · 대표 김규보</div>
            <div>사업자등록번호 111-25-97394</div>
            <div>고객문의 dbdus1357@naver.com</div>
            <div style={{ fontSize: 10, opacity: 0.7, marginTop: 6 }}>© 2026 TeacherMeet. All rights reserved.</div>
          </div>
        </div>

        {/* 약관 모달 (오버레이) */}
        {policyPage && (
          <div
            onClick={() => setPolicyPage(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: 20,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#FFF8F5',
                borderRadius: 20,
                width: '100%',
                maxWidth: 420,
                maxHeight: '85vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setPolicyPage(null)}
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  background: '#FFF0EB',
                  border: '1px solid #FDBCAA',
                  borderRadius: '50%',
                  width: 34,
                  height: 34,
                  cursor: 'pointer',
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#3D1008',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 99999,
                  fontFamily: 'Nunito, sans-serif',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
              >
                ✕
              </button>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {policyPage === 'terms' && <Terms onBack={() => setPolicyPage(null)} />}
                {policyPage === 'privacy' && <Privacy onBack={() => setPolicyPage(null)} />}
                {policyPage === 'refund' && <Refund onBack={() => setPolicyPage(null)} />}
                {policyPage === 'youth' && <Youth onBack={() => setPolicyPage(null)} />}
                {policyPage === 'location' && <LocationTerms onBack={() => setPolicyPage(null)} />}
                {policyPage === 'community' && <Community onBack={() => setPolicyPage(null)} />}
                {policyPage === 'business' && <BusinessInfo onBack={() => setPolicyPage(null)} />}
              </div>
            </div>
          </div>
        )}

        <button onClick={() => setShowBlockList(true)} style={{ width: '100%', padding: '14px', background: 'white', border: '1.5px solid #FDBCAA', borderRadius: 14, color: '#9C5A4A', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', marginTop: 10 }}>🚫 차단한 사람 관리</button>
        {user.email === 'dbdus1357@naver.com' && (
          <button onClick={() => setShowAdmin(true)} style={{ width: '100%', padding: '14px', background: 'white', border: '1.5px solid #FDBCAA', borderRadius: 14, color: '#F4845F', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', marginTop: 10 }}>🔧 관리자 페이지</button>
        )}
        <button onClick={onLogout} style={{ width: '100%', padding: '14px', background: 'white', border: '1.5px solid #FDBCAA', borderRadius: 14, color: '#aaa', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', marginTop: 10 }}>로그아웃</button>
      </div>
    </div>
  );
}

export default MyProfile;