// Web Audio API sound synthesis — no external files needed
let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(freq, duration, type = 'sine', gainVal = 0.15) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) { /* silent fail */ }
}

export function playSound(type) {
  switch (type) {
    case 'success':
      playTone(523, 0.1); // C5
      setTimeout(() => playTone(659, 0.1), 100); // E5
      setTimeout(() => playTone(784, 0.2), 200); // G5
      break;
    case 'error':
      playTone(220, 0.15, 'sawtooth', 0.1);
      setTimeout(() => playTone(185, 0.25, 'sawtooth', 0.08), 150);
      break;
    case 'info':
      playTone(440, 0.12, 'sine', 0.1);
      break;
    case 'warning':
      playTone(349, 0.1);
      setTimeout(() => playTone(349, 0.1), 150);
      break;
    case 'click':
      playTone(880, 0.05, 'sine', 0.05);
      break;
    case 'login':
      playTone(659, 0.08, 'sine', 0.08);
      setTimeout(() => playTone(784, 0.15, 'sine', 0.06), 100);
      break;
  }
}
