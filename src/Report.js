// src/Report.js
// 사용자 신고 모달 - 사유 선택 + 상세 설명
// 사용 예: <Report user={user} targetUser={profile} context={{ source: 'chat' }} onClose={...} />

import React, { useState } from 'react';
import { reportUser, blockUser, REPORT_REASONS } from './reports';

export default function Report({ user, targetUser, context = {}, onClose, onComplete }) {
  const [selectedReason, setSelectedReason] = useState(null);
  const [description, setDescription] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(true); // 신고 후 자동 차단
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: 사유선택, 2: 상세입력, 3: 완료

  const handleSubmit = async () => {
    if (!selectedReason) return;
    setSubmitting(true);
    try {
      // 1) 신고 등록
      await reportUser(
        user.uid,
        targetUser.uid,
        selectedReason.code,
        description.trim(),
        context
      );

      // 2) 신고 후 자동 차단 (옵션)
      if (alsoBlock) {
        await blockUser(user.uid, targetUser.uid);
      }

      setStep(3);
    } catch (e) {
      alert(e.message || '신고 처리 중 오류가 발생했어요.');
    }
    setSubmitting(false);
  };

  const handleClose = () => {
    onClose && onClose();
    if (step === 3 && onComplete) onComplete();
  };

  return (
    <div onClick={handleClose} style={styles.overlay}>
      <div onClick={(e) => e.stopPropagation()} style={styles.modal}>
        {/* 닫기 버튼 */}
        <button onClick={handleClose} style={styles.closeBtn}>✕</button>

        {/* STEP 1: 사유 선택 */}
        {step === 1 && (
          <>
            <div style={styles.title}>🚨 신고하기</div>
            <div style={styles.subtitle}>
              <strong>{targetUser?.name}</strong>님을 신고하는 이유를 선택해주세요
            </div>
            <div style={styles.reasonList}>
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason.code}
                  onClick={() => setSelectedReason(reason)}
                  style={{
                    ...styles.reasonBtn,
                    ...(selectedReason?.code === reason.code ? styles.reasonBtnActive : {}),
                  }}
                >
                  <span style={{ fontSize: 18 }}>{reason.emoji}</span>
                  <span>{reason.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!selectedReason}
              style={{
                ...styles.primaryBtn,
                ...((!selectedReason) ? styles.btnDisabled : {}),
              }}
            >
              다음
            </button>
          </>
        )}

        {/* STEP 2: 상세 설명 */}
        {step === 2 && (
          <>
            <button onClick={() => setStep(1)} style={styles.backBtn}>← 사유 다시 선택</button>
            <div style={styles.title}>📝 상세 설명</div>
            <div style={styles.subtitle}>
              선택한 사유: <strong>{selectedReason.emoji} {selectedReason.label}</strong>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="자세한 상황을 알려주세요. (선택사항)&#10;예: 매칭 후 다른 SNS로 유도하며 금전을 요구했어요."
              maxLength={500}
              style={styles.textarea}
            />
            <div style={styles.charCount}>{description.length} / 500</div>

            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={alsoBlock}
                onChange={(e) => setAlsoBlock(e.target.checked)}
                style={styles.checkboxInput}
              />
              <span>신고 후 이 사용자를 차단할게요 (추천)</span>
            </label>

            <div style={styles.info}>
              ℹ️ 신고는 익명으로 처리되며, 운영팀이 24시간 내에 검토합니다.
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                ...styles.primaryBtn,
                ...(submitting ? styles.btnDisabled : {}),
              }}
            >
              {submitting ? '제출 중...' : '🚨 신고 제출'}
            </button>
          </>
        )}

        {/* STEP 3: 완료 */}
        {step === 3 && (
          <>
            <div style={{ fontSize: 60, textAlign: 'center', marginBottom: 16 }}>✅</div>
            <div style={styles.title}>신고가 접수됐어요</div>
            <div style={styles.completeText}>
              운영팀이 빠르게 검토할게요.<br />
              {alsoBlock && <>이 사용자는 차단되어 더 이상 보이지 않아요.<br /></>}
              안전한 티처밋을 만들어주셔서 감사해요 🙏
            </div>
            <button onClick={handleClose} style={styles.primaryBtn}>
              확인
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: 20,
    fontFamily: 'Nunito, sans-serif',
  },
  modal: {
    background: 'white',
    borderRadius: 20,
    padding: '28px 24px',
    width: '100%',
    maxWidth: 380,
    maxHeight: '85vh',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    background: '#FFF0EB',
    border: '1px solid #FDBCAA',
    borderRadius: '50%',
    width: 32,
    height: 32,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 700,
    color: '#3D1008',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#9C5A4A',
    fontSize: 13,
    cursor: 'pointer',
    marginBottom: 12,
    padding: 0,
    fontFamily: 'inherit',
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: '#3D1008',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#9C5A4A',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 1.6,
  },
  reasonList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 20,
  },
  reasonBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 16px',
    background: 'white',
    border: '1.5px solid #FDBCAA',
    borderRadius: 12,
    cursor: 'pointer',
    fontSize: 14,
    color: '#3D1008',
    fontFamily: 'inherit',
    textAlign: 'left',
    transition: 'all 0.15s',
  },
  reasonBtnActive: {
    background: '#FFF0EB',
    border: '2px solid #E8603A',
    fontWeight: 700,
    color: '#C23B22',
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    border: '1.5px solid #FDBCAA',
    borderRadius: 12,
    fontSize: 14,
    fontFamily: 'inherit',
    color: '#3D1008',
    background: '#FFFAF8',
    resize: 'none',
    height: 100,
    outline: 'none',
    boxSizing: 'border-box',
    lineHeight: 1.6,
  },
  charCount: {
    fontSize: 11,
    color: '#9C5A4A',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 16,
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 14px',
    background: '#FFF0EB',
    borderRadius: 12,
    fontSize: 13,
    color: '#3D1008',
    cursor: 'pointer',
    marginBottom: 12,
  },
  checkboxInput: {
    width: 16,
    height: 16,
    accentColor: '#E8603A',
    cursor: 'pointer',
  },
  info: {
    fontSize: 11,
    color: '#9C5A4A',
    background: '#FFFAF8',
    padding: '10px 12px',
    borderRadius: 10,
    marginBottom: 16,
    lineHeight: 1.6,
  },
  primaryBtn: {
    width: '100%',
    padding: 14,
    background: 'linear-gradient(135deg, #F4845F, #E8603A)',
    color: 'white',
    border: 'none',
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 12px rgba(232, 96, 58, 0.3)',
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  completeText: {
    fontSize: 14,
    color: '#9C5A4A',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 1.7,
  },
};