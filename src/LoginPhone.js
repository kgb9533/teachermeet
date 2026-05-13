// src/LoginPhone.js
// 로그인 화면 - 휴대폰 번호 + PIN
// PIN 잊어버리면 휴대폰 재인증으로 재설정 가능

import React, { useState } from 'react';
import { requestPhoneVerification } from './phoneAuth';
import Logo from './Logo';

export default function LoginPhone({ onLogin, onSignup, onResetPin }) {
  const [step, setStep] = useState(1); // 1=휴대폰입력, 2=PIN입력
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // 휴대폰 번호 포맷팅 (010-1234-5678)
  const formatPhone = (value) => {
    const numbers = value.replace(/[^0-9]/g, '').slice(0, 11);
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  };

  const handlePhoneSubmit = () => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 11) {
      setError('휴대폰 번호 11자리를 입력해주세요.');
      return;
    }
    if (!cleanPhone.startsWith('010')) {
      setError('010으로 시작하는 번호를 입력해주세요.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handlePinInput = (digit) => {
    setError('');
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        // 4자리 입력되면 자동 로그인 시도
        setTimeout(() => handleLogin(newPin), 200);
      }
    }
  };

  const handlePinDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleLogin = async (inputPin) => {
    setLoading(true);
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      // onLogin 콜백에 휴대폰번호와 PIN 전달
      // App.js에서 Firestore에 매칭되는 사용자가 있는지 검증
      await onLogin(cleanPhone, inputPin);
    } catch (e) {
      setError(e.message || '로그인에 실패했습니다.');
      setPin('');
    }
    setLoading(false);
  };

  // PIN 재설정 - 휴대폰 재인증
  const handleResetPin = async () => {
    setError('');
    setShowResetModal(false);
    try {
      const customer = await requestPhoneVerification();
      // onResetPin 콜백에 재인증 정보 전달
      await onResetPin(customer);
    } catch (e) {
      setError(e.message || '인증에 실패했습니다.');
    }
  };

  return (
    <div className="phone" style={{ background: 'white' }}>
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Logo size={28} />
          <span style={styles.headerTitle}>티처밋</span>
        </div>
      </div>

      <div style={styles.container}>
        {/* STEP 1: 휴대폰 번호 입력 */}
        {step === 1 && (
          <div>
            <div style={styles.hero}>
              <div style={styles.heroTitle}>
                다시 만나서<br />반가워요 👋
              </div>
              <div style={styles.heroSub}>
                휴대폰 번호로 로그인해주세요
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>휴대폰 번호</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="010-1234-5678"
                onKeyDown={(e) => e.key === 'Enter' && handlePhoneSubmit()}
                style={styles.input}
                autoFocus
              />
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button
              onClick={handlePhoneSubmit}
              disabled={phone.replace(/[^0-9]/g, '').length !== 11}
              style={{
                ...styles.primaryBtn,
                ...(phone.replace(/[^0-9]/g, '').length !== 11 ? styles.btnDisabled : {}),
              }}
            >
              다음
            </button>

            <div style={styles.divider}><span>또는</span></div>

            <button onClick={onSignup} style={styles.secondaryBtn}>
              회원가입
            </button>
          </div>
        )}

        {/* STEP 2: PIN 입력 */}
        {step === 2 && (
          <div>
            <button onClick={() => { setStep(1); setPin(''); setError(''); }} style={styles.backLink}>
              ← 휴대폰 번호 다시 입력
            </button>

            <div style={styles.title}>PIN 4자리를 입력해주세요</div>
            <div style={styles.subtitle}>{phone}</div>

            <div style={styles.pinDisplay}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ ...styles.pinDot, ...(pin.length > i ? styles.pinDotFilled : {}) }} />
              ))}
            </div>

            {loading && (
              <div style={{ textAlign: 'center', color: '#9C5A4A', fontSize: 13, marginBottom: 12 }}>
                로그인 중...
              </div>
            )}

            {error && <div style={styles.error}>{error}</div>}

            <PinKeypad onInput={handlePinInput} onDelete={handlePinDelete} />

            <button
              onClick={() => setShowResetModal(true)}
              style={styles.forgotBtn}
            >
              PIN을 잊어버리셨나요?
            </button>
          </div>
        )}

        {/* PIN 재설정 안내 모달 */}
        {showResetModal && (
          <div
            onClick={() => setShowResetModal(false)}
            style={styles.modalOverlay}
          >
            <div onClick={(e) => e.stopPropagation()} style={styles.modal}>
              <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 12 }}>🔒</div>
              <div style={styles.modalTitle}>PIN 재설정</div>
              <div style={styles.modalText}>
                휴대폰 본인인증을 다시 진행하시면<br />
                새 PIN을 설정할 수 있어요.
              </div>
              <button onClick={handleResetPin} style={styles.primaryBtn}>
                📱 휴대폰 인증하기
              </button>
              <button onClick={() => setShowResetModal(false)} style={styles.cancelBtn}>
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// PIN 키패드 (SignupPhone과 동일한 컴포넌트)
function PinKeypad({ onInput, onDelete }) {
  return (
    <div style={styles.keypad}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
        <button key={n} onClick={() => onInput(n)} style={styles.keypadBtn}>{n}</button>
      ))}
      <div />
      <button onClick={() => onInput(0)} style={styles.keypadBtn}>0</button>
      <button onClick={onDelete} style={{ ...styles.keypadBtn, fontSize: 14 }}>←</button>
    </div>
  );
}

const styles = {
  headerTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: '#F4845F',
    fontFamily: 'Nunito, sans-serif',
  },
  container: {
    padding: '24px 24px 40px',
    fontFamily: 'Nunito, sans-serif',
  },
  hero: {
    textAlign: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: '#3D1008',
    lineHeight: 1.3,
    marginBottom: 12,
  },
  heroSub: {
    fontSize: 14,
    color: '#9C5A4A',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 700,
    color: '#3D1008',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: 16,
    border: '1.5px solid #FDBCAA',
    borderRadius: 12,
    fontFamily: 'inherit',
    background: '#FFF8F5',
    color: '#3D1008',
    outline: 'none',
    boxSizing: 'border-box',
  },
  backLink: {
    background: 'none',
    border: 'none',
    color: '#9C5A4A',
    fontSize: 13,
    cursor: 'pointer',
    marginBottom: 20,
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
    fontSize: 14,
    color: '#E8603A',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 700,
  },
  error: {
    background: '#FEE',
    color: '#C23B22',
    padding: '10px 14px',
    borderRadius: 10,
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  primaryBtn: {
    width: '100%',
    padding: 16,
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
  secondaryBtn: {
    width: '100%',
    padding: 14,
    background: 'white',
    color: '#E8603A',
    border: '1.5px solid #E8603A',
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  divider: {
    textAlign: 'center',
    margin: '24px 0',
    color: '#FDBCAA',
    fontSize: 13,
    position: 'relative',
  },
  pinDisplay: {
    display: 'flex',
    justifyContent: 'center',
    gap: 16,
    margin: '32px 0',
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: '2px solid #FDBCAA',
    background: 'white',
  },
  pinDotFilled: {
    background: '#F4845F',
    border: '2px solid #F4845F',
  },
  keypad: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
  },
  keypadBtn: {
    padding: '18px 0',
    background: '#FFF0EB',
    border: 'none',
    borderRadius: 14,
    fontSize: 22,
    fontWeight: 700,
    color: '#3D1008',
    cursor: 'pointer',
    fontFamily: 'Nunito, sans-serif',
  },
  forgotBtn: {
    display: 'block',
    width: '100%',
    background: 'none',
    border: 'none',
    color: '#9C5A4A',
    fontSize: 13,
    cursor: 'pointer',
    marginTop: 20,
    textDecoration: 'underline',
    fontFamily: 'inherit',
  },
  modalOverlay: {
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
    padding: 24,
  },
  modal: {
    background: 'white',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 320,
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: '#3D1008',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#9C5A4A',
    textAlign: 'center',
    lineHeight: 1.6,
    marginBottom: 20,
  },
  cancelBtn: {
    width: '100%',
    padding: 12,
    background: 'transparent',
    color: '#9C5A4A',
    border: 'none',
    fontSize: 14,
    cursor: 'pointer',
    marginTop: 8,
    fontFamily: 'inherit',
  },
};