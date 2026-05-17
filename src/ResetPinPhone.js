// src/ResetPinPhone.js
// PIN 재설정 화면 - 본인인증 완료 후 새 PIN 입력
// 단계: 1) 새 PIN 입력 → 2) 새 PIN 확인 → 완료

import React, { useState } from 'react';
import Logo from './Logo';

export default function ResetPinPhone({ verifiedCustomer, onComplete, onCancel }) {
  const [step, setStep] = useState(1); // 1=새 PIN 입력, 2=확인
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  // PIN 키패드 입력
  const handlePinInput = (digit) => {
    setError('');
    if (step === 1 && pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => setStep(2), 200);
      }
    } else if (step === 2 && confirmPin.length < 4) {
      const newConfirm = confirmPin + digit;
      setConfirmPin(newConfirm);
      if (newConfirm.length === 4) {
        setTimeout(() => verifyPinMatch(newConfirm), 200);
      }
    }
  };

  const handlePinDelete = () => {
    if (step === 1) setPin(pin.slice(0, -1));
    else if (step === 2) setConfirmPin(confirmPin.slice(0, -1));
  };

  const verifyPinMatch = (input) => {
    if (input === pin) {
      // PIN 일치 - 재설정 완료 처리
      onComplete({
        ...verifiedCustomer,
        pin: pin,
      });
    } else {
      setError('PIN이 일치하지 않아요. 다시 시도해주세요.');
      setPin('');
      setConfirmPin('');
      setStep(1);
    }
  };

  return (
    <div className="phone" style={{ background: 'white' }}>
      <div className="header">
        <button onClick={onCancel} style={styles.headerBack}>←</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Logo size={28} />
          <span style={styles.headerTitle}>티처밋</span>
        </div>
        <div style={{ width: 28 }} />
      </div>

      <div style={styles.container}>
        {/* 진행 단계 표시 */}
        <div style={styles.stepIndicator}>
          <div style={{ ...styles.stepDot, ...styles.stepActive }}>✓</div>
          <div style={{ ...styles.stepLine, background: '#F4845F' }} />
          <div style={{ ...styles.stepDot, ...styles.stepActive }}>{step}</div>
        </div>

        {/* STEP 1: 새 PIN 설정 */}
        {step === 1 && (
          <div>
            <div style={styles.title}>새 PIN 4자리를 설정해주세요</div>
            <div style={styles.subtitle}>
              <span style={{ color: '#E8603A', fontSize: 12 }}>
                ✓ 본인인증 완료: {verifiedCustomer?.name}님
              </span>
              <br />
              <span style={{ fontSize: 12, color: '#9C5A4A' }}>
                로그인할 때 사용할 새로운 PIN이에요
              </span>
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

        {/* STEP 2: PIN 확인 */}
        {step === 2 && (
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

// PIN 키패드 컴포넌트
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
    lineHeight: 1.8,
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