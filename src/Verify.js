import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const CLOUD_NAME = 'ds4tdz6ps';
const UPLOAD_PRESET = 'ml_default';

function Verify({ user, userProfile, onUpdate }) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [liveStatus, setLiveStatus] = useState(userProfile?.verifyStatus || '');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setLiveStatus(data.verifyStatus || '');
          if (onUpdate && data.verifyStatus !== userProfile?.verifyStatus) onUpdate({ ...userProfile, ...data });
        }
      } catch (e) { console.error('상태 조회 오류:', e); }
    };
    fetchStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f); setFileName(f.name); setError('');
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('업로드 실패');
      const data = await res.json();
      if (!data.secure_url) throw new Error('URL 없음');
      await updateDoc(doc(db, 'users', user.uid), { verifyDocUrl: data.secure_url, verifyStatus: 'pending' });
      setLiveStatus('pending');
      if (onUpdate) onUpdate({ ...userProfile, verifyDocUrl: data.secure_url, verifyStatus: 'pending' });
      setDone(true);
    } catch (e) {
      console.error('인증 오류:', e);
      setError('업로드 중 오류가 발생했어요. 다시 시도해주세요.');
    }
    setUploading(false);
  };

  return (
    <div style={{ padding: '0' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#C23B22', letterSpacing: '0.5px', marginBottom: 16, fontFamily: 'Nunito, sans-serif' }}>교원 인증</div>

      {liveStatus === 'approved' ? (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 16, padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#166534', marginBottom: 4, fontFamily: 'Nunito, sans-serif' }}>인증 완료!</div>
          <div style={{ fontSize: 13, color: '#4ade80', fontFamily: 'Nunito, sans-serif' }}>교원 인증이 완료되었어요</div>
        </div>
      ) : liveStatus === 'pending' ? (
        <div style={{ background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: 16, padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>⏳</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#92400e', marginBottom: 4, fontFamily: 'Nunito, sans-serif' }}>검토 중이에요</div>
          <div style={{ fontSize: 13, color: '#d97706', fontFamily: 'Nunito, sans-serif' }}>1~2일 내로 검토 후 승인해드릴게요</div>
        </div>
      ) : (
        <div>
          <div style={{ background: '#FFF0EB', borderRadius: 16, padding: '16px', marginBottom: 20, border: '1.5px solid #FDBCAA' }}>
            <div style={{ fontSize: 14, color: '#C23B22', fontWeight: 700, marginBottom: 6, fontFamily: 'Nunito, sans-serif' }}>📋 인증 방법</div>
            <div style={{ fontSize: 13, color: '#F4845F', lineHeight: 1.7, fontFamily: 'Nunito, sans-serif' }}>재직증명서 또는 교원자격증, 이 외에 인증이 어려운 경우 최근 근무하고 계신 근무지의 급여내역을 올려주세요.<br />개인정보는 안전하게 보호하는 목적으로만 사용됩니다.</div>
          </div>

          <div onClick={() => document.getElementById('verifyFileInput').click()} style={{ border: '2px dashed #FDBCAA', borderRadius: 16, padding: '32px', textAlign: 'center', cursor: 'pointer', background: fileName ? '#FFF0EB' : 'white', marginBottom: 16 }}>
            {fileName ? (
              <div>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#C23B22', fontFamily: 'Nunito, sans-serif' }}>{fileName}</div>
                <div style={{ fontSize: 12, color: '#FDBCAA', marginTop: 4, fontFamily: 'Nunito, sans-serif' }}>탭해서 다시 선택</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📎</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#C23B22', marginBottom: 4, fontFamily: 'Nunito, sans-serif' }}>파일 선택하기</div>
                <div style={{ fontSize: 12, color: '#FDBCAA', fontFamily: 'Nunito, sans-serif' }}>JPG, PNG, PDF 가능</div>
              </div>
            )}
          </div>
          <input id="verifyFileInput" type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: 'none' }} />

          {error && <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', color: '#cc0000', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 12 }}>{error}</div>}

          <button onClick={handleUpload} disabled={!file || uploading || done} style={{ width: '100%', padding: '15px', background: file && !done && !uploading ? 'linear-gradient(135deg, #F4845F, #E8603A)' : '#FFF0EB', color: file && !done && !uploading ? 'white' : '#FDBCAA', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: file && !done ? 'pointer' : 'not-allowed', fontFamily: 'Nunito, sans-serif' }}>
            {uploading ? '⏳ 업로드 중...' : done ? '제출 완료 ✓' : '인증 서류 제출하기'}
          </button>
        </div>
      )}
    </div>
  );
}

export default Verify;