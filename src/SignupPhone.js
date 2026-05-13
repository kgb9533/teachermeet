// src/SignupPhone.js
// 회원가입 화면 - 휴대폰 본인인증 + PIN 설정
// 단계: 1) 약관 동의 → 2) 본인인증 → 3) PIN 설정 → 4) PIN 확인 → 완료

import React, { useState } from 'react';
import { requestPhoneVerification } from './phoneAuth';
import Logo from './Logo';

export default function SignupPhone({ onComplete, onBack }) {
  const [step, setStep] = useState(1); // 1=약관, 2=인증중, 3=PIN설정, 4=PIN확인
  const [verifiedInfo, setVerifiedInfo] = useState(null);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [agreed, setAgreed] = useState({ all: false, terms: false, privacy: false, age: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 약관 전체 동의 토글
  const toggleAll = () => {
    const newVal = !agreed.all;
    setAgreed({ all: newVal, terms: newVal, privacy: newVal, age: newVal });
  };

  // 개별 동의 토글
  const toggleItem = (key) => {
    const newAgreed = { ...agreed, [key]: !agreed[key] };
    newAgreed.all = newAgreed.terms && newAgreed.privacy && newAgreed.age;
    setAgreed(newAgreed);
  };

  // 본인인증 시작
  const handleVerify = async () => {
    if (!agreed.terms || !agreed.privacy || !agreed.age) {
      setError('필수 항목에 모두 동의해주세요.');
      return;
    }
    setError('');
    setLoading(true);
    setStep(2);
    try {
      const customer = await requestPhoneVerification();
      setVerifiedInfo(customer);
      setStep(3); // PIN 설정 단계로
    } catch (e) {
      setError(e.message || '본인인증에 실패했습니다.');
      setStep(1); // 약관 화면으로 돌아감
    }
    setLoading(false);
  };

  // PIN 키패드 입력
  const handlePinInput = (digit) => {
    setError('');
    if (step === 3 && pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        // 4자리 입력되면 자동으로 다음 단계
        setTimeout(() => setStep(4), 200);
      }
    } else if (step === 4 && confirmPin.length < 4) {
      const newConfirm = confirmPin + digit;
      setConfirmPin(newConfirm);
      if (newConfirm.length === 4) {
        setTimeout(() => verifyPinMatch(newConfirm), 200);
      }
    }
  };

  const handlePinDelete = () => {
    if (step === 3) setPin(pin.slice(0, -1));
    else if (step === 4) setConfirmPin(confirmPin.slice(0, -1));
  };

  const verifyPinMatch = (input) => {
    if (input === pin) {
      // PIN 일치 - 회원가입 완료 처리
      onComplete({
        ...verifiedInfo,
        pin: pin, // 실제로는 해시화해서 저장 (다음 단계에서 처리)
      });
    } else {
      setError('PIN이 일치하지 않아요. 다시 시도해주세요.');
      setPin('');
      setConfirmPin('');
      setStep(3);
    }
  };

  return (
    <div className="phone" style={{ background: 'white' }}>
      <div className="header">
        <button onClick={onBack} style={styles.headerBack}>←</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Logo size={28} />
          <span style={styles.headerTitle}>티처밋</span>
        </div>
        <div style={{ width: 28 }} />
      </div>

      <div style={styles.container}>
        {/* 진행 단계 표시 */}
        <div style={styles.stepIndicator}>
          <div style={{ ...styles.stepDot, ...(step >= 1 ? styles.stepActive : {}) }}>1</div>
          <div style={styles.stepLine} />
          <div style={{ ...styles.stepDot, ...(step >= 2 ? styles.stepActive : {}) }}>2</div>
          <div style={styles.stepLine} />
          <div style={{ ...styles.stepDot, ...(step >= 3 ? styles.stepActive : {}) }}>3</div>
        </div>

        {/* STEP 1: 약관 동의 */}
        {step === 1 && (
          <div>
            <div style={styles.title}>약관에 동의해주세요</div>
            <div style={styles.subtitle}>회원가입을 위해 약관 동의가 필요해요</div>

            <div style={styles.allAgreeBox} onClick={toggleAll}>
              <div style={{ ...styles.checkbox, ...(agreed.all ? styles.checkboxActive : {}) }}>
                {agreed.all && '✓'}
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#3D1008' }}>전체 동의</div>
            </div>

            <div style={styles.divider} />

            <div style={styles.agreeItem} onClick={() => toggleItem('age')}>
              <div style={{ ...styles.checkbox, ...(agreed.age ? styles.checkboxActive : {}) }}>
                {agreed.age && '✓'}
              </div>
              <div style={styles.itemText}>
                <span style={styles.required}>[필수]</span> 만 19세 이상입니다
              </div>
            </div>

            <div style={styles.agreeItem} onClick={() => toggleItem('terms')}>
              <div style={{ ...styles.checkbox, ...(agreed.terms ? styles.checkboxActive : {}) }}>
                {agreed.terms && '✓'}
              </div>
              <div style={styles.itemText}>
                <span style={styles.required}>[필수]</span> 이용약관 동의
              </div>
            </div>

            <div style={styles.agreeItem} onClick={() => toggleItem('privacy')}>
              <div style={{ ...styles.checkbox, ...(agreed.privacy ? styles.checkboxActive : {}) }}>
                {agreed.privacy && '✓'}
              </div>
              <div style={styles.itemText}>
                <span style={styles.required}>[필수]</span> 개인정보처리방침 동의
              </div>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button
              onClick={handleVerify}
              disabled={!agreed.terms || !agreed.privacy || !agreed.age}
              style={{
                ...styles.primaryBtn,
                ...((!agreed.terms || !agreed.privacy || !agreed.age) ? styles.btnDisabled : {}),
              }}
            >
              📱 휴대폰 본인인증
            </button>
          </div>
        )}

        {/* STEP 2: 인증 중 */}
        {step === 2 && (
          <div style={styles.centerContent}>
            <div style={{ fontSize: 60, marginBottom: 20 }}>📱</div>
            <div style={styles.title}>인증창이 열렸어요</div>
            <div style={styles.subtitle}>
              {loading ? '인증을 진행해주세요...' : '잠시만 기다려주세요'}
            </div>
          </div>
        )}

        {/* STEP 3: PIN 설정 */}
        {step === 3 && (
          <div>
            <div style={styles.title}>PIN 4자리를 설정해주세요</div>
            <div style={styles.subtitle}>
              로그인할 때 사용할 비밀번호예요<br />
              <span style={{ color: '#E8603A', fontSize: 12 }}>✓ 본인인증 완료: {verifiedInfo?.name}님</span>
            </div>

            <div style={styles.pinDisplay}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ ...styles.pinDot, ...(pin.length > i ? styles.pinDotFilled : {}) }} />
              ))}
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <PinKeypad onInput={handlePinInput} onDelete={handlePinDelete} />
          </div>
        )}

        {/* STEP 4: PIN 확인 */}
        {step === 4 && (
          <div>
            <div style={styles.title}>한 번 더 입력해주세요</div>
            <div style={styles.subtitle}>같은 PIN을 다시 입력해주세요</div>

            <div style={styles.pinDisplay}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ ...styles.pinDot, ...(confirmPin.length > i ? styles.pinDotFilled : {}) }} />
              ))}
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <PinKeypad onInput={handlePinInput} onDelete={handlePinDelete} />
          </div>
        )}
      </div>
    </div>
  );
}

// PIN 입력 키패드 컴포넌트
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
  headerBack: {
    background: 'none',
    border: 'none',
    fontSize: 24,
    color: '#3D1008',
    cursor: 'pointer',
    padding: 4,
  },
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
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: '#FFF0EB',
    color: '#FDBCAA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 800,
  },
  stepActive: {
    background: '#F4845F',
    color: 'white',
  },
  stepLine: {
    width: 32,
    height: 2,
    background: '#FFF0EB',
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
    marginBottom: 28,
    lineHeight: 1.6,
  },
  allAgreeBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    background: '#FFF0EB',
    borderRadius: 12,
    cursor: 'pointer',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    background: '#FDBCAA',
    margin: '12px 0',
  },
  agreeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 4px',
    cursor: 'pointer',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    border: '2px solid #FDBCAA',
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: 14,
    fontWeight: 800,
    flexShrink: 0,
  },
  checkboxActive: {
    background: '#F4845F',
    border: '2px solid #F4845F',
  },
  itemText: {
    fontSize: 14,
    color: '#3D1008',
  },
  required: {
    color: '#E8603A',
    fontWeight: 800,
    marginRight: 4,
  },
  error: {
    background: '#FEE',
    color: '#C23B22',
    padding: '10px 14px',
    borderRadius: 10,
    fontSize: 13,
    marginTop: 16,
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
    marginTop: 24,
    boxShadow: '0 4px 12px rgba(232, 96, 58, 0.3)',
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  centerContent: {
    textAlign: 'center',
    padding: '40px 0',
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
    marginTop: 24,
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
};