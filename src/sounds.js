// src/sounds.js
// 알림 사운드 - Web Audio API로 직접 생성
// 파일 다운로드 불필요, 모든 브라우저에서 작동

let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
  }
  return audioContext;
}

/**
 * 단일 톤 재생 (한 음)
 */
function playTone(frequency, duration, volume = 0.3, type = 'sine', delay = 0) {
  try {
    const ctx = getAudioContext();
    const startTime = ctx.currentTime + delay;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type; // 'sine' (부드러움), 'square' (디지털), 'triangle', 'sawtooth'
    oscillator.frequency.value = frequency;

    // 부드럽게 시작해서 부드럽게 끝남 (클릭 노이즈 방지)
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  } catch (e) {
    console.warn('사운드 재생 오류:', e);
  }
}

/**
 * 매칭 성공 알림 - "딩~동~딩!" 3음 화음 (밝고 명랑)
 */
export function playMatchSound() {
  // C5 - E5 - G5 (도-미-솔 화음, 메이저)
  playTone(523.25, 0.15, 0.3, 'sine', 0);     // 도
  playTone(659.25, 0.15, 0.3, 'sine', 0.12);  // 미
  playTone(783.99, 0.3, 0.35, 'sine', 0.24);  // 솔 (길게)
}

/**
 * 메시지 알림 - 짧은 "띵!" (가벼움)
 */
export function playMessageSound() {
  playTone(880, 0.15, 0.2, 'sine', 0);
}

/**
 * 좋아요 받음 알림 - "두딩~" (귀여움)
 */
export function playLikeSound() {
  playTone(587.33, 0.1, 0.25, 'sine', 0);     // 레
  playTone(880, 0.2, 0.3, 'sine', 0.08);      // 라
}