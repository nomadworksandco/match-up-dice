type AudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfx: GainNode | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor = window.AudioContext || (window as AudioWindow).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor({ latencyHint: "interactive" });
  master = ctx.createGain();
  sfx = ctx.createGain();
  sfx.connect(master);
  master.connect(ctx.destination);
  master.gain.value = muted ? 0 : 0.7;
  sfx.gain.value = 0.9;
  return ctx;
}

export function unlockAudio() {
  const audio = getCtx();
  if (!audio) return;
  if (audio.state === "suspended") void audio.resume();
}

export function setMuted(next: boolean) {
  muted = next;
  if (master && ctx) {
    master.gain.setTargetAtTime(next ? 0 : 0.7, ctx.currentTime, 0.02);
  }
}

function envGain(duration: number, peak: number) {
  const audio = getCtx();
  if (!audio || !sfx) return null;
  const g = audio.createGain();
  g.connect(sfx);
  const now = audio.currentTime;
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(peak, now + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  return { g, now, audio };
}

function tone(freq: number, duration: number, type: OscillatorType, peak: number) {
  const env = envGain(duration, peak);
  if (!env) return;
  const osc = env.audio.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, env.now);
  osc.connect(env.g);
  osc.start(env.now);
  osc.stop(env.now + duration);
  osc.onended = () => {
    osc.disconnect();
    env.g.disconnect();
  };
}

function noiseBurst(duration: number, peak: number, hpFreq: number) {
  const env = envGain(duration, peak);
  if (!env) return;
  const length = Math.floor(env.audio.sampleRate * duration);
  const buffer = env.audio.createBuffer(1, length, env.audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  const src = env.audio.createBufferSource();
  src.buffer = buffer;
  const filter = env.audio.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = hpFreq;
  src.connect(filter);
  filter.connect(env.g);
  src.start(env.now);
  src.stop(env.now + duration);
  src.onended = () => {
    src.disconnect();
    filter.disconnect();
    env.g.disconnect();
  };
}

export function playDiceRoll() {
  unlockAudio();
  const n = 5;
  for (let i = 0; i < n; i++) {
    window.setTimeout(() => {
      noiseBurst(0.07 + Math.random() * 0.04, 0.22, 400 + Math.random() * 800);
      tone(90 + Math.random() * 40, 0.05, "triangle", 0.08);
    }, i * 70);
  }
}

export function playMatch() {
  unlockAudio();
  tone(523.25, 0.12, "triangle", 0.18);
  window.setTimeout(() => tone(659.25, 0.16, "triangle", 0.16), 70);
}

export function playMiss() {
  unlockAudio();
  tone(196, 0.12, "sine", 0.1);
}

export function playWin() {
  unlockAudio();
  const notes = [392, 523.25, 659.25, 783.99];
  notes.forEach((freq, i) => {
    window.setTimeout(() => tone(freq, 0.22, "triangle", 0.2), i * 90);
  });
}

export function playPerfect() {
  unlockAudio();
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    window.setTimeout(() => tone(freq, 0.28, "triangle", 0.22), i * 80);
  });
}

export function playTap() {
  unlockAudio();
  tone(640, 0.05, "square", 0.04);
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") unlockAudio();
  });
}
