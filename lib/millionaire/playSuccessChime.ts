/**
 * One reward path: owner cheer + light claps + sparkle.
 * Audio failures never block gameplay.
 */

type AudioContextCtor = typeof AudioContext;

const CHEER_URL = "/gfa/audio/millionaire-reward-cheer.m4a";
const CLAP_TIMES = [0.14, 0.3, 0.46];
const CHEER_PEAK_TARGET = 0.32;

let sharedContext: AudioContext | null = null;
let cheerBuffer: AudioBuffer | null = null;
let cheerLoad: Promise<AudioBuffer | null> | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: AudioContextCtor })
      .webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedContext || sharedContext.state === "closed") {
    sharedContext = new AudioCtx();
  }
  return sharedContext;
}

async function loadCheerBuffer(
  audioContext: AudioContext,
): Promise<AudioBuffer | null> {
  if (cheerBuffer) return cheerBuffer;
  if (!cheerLoad) {
    cheerLoad = (async () => {
      const response = await fetch(CHEER_URL);
      if (!response.ok) return null;
      const bytes = await response.arrayBuffer();
      const decoded = await audioContext.decodeAudioData(bytes.slice(0));
      cheerBuffer = decoded;
      return decoded;
    })().catch(() => {
      cheerLoad = null;
      return null;
    });
  }
  return cheerLoad;
}

function measureWindowPeak(
  data: Float32Array,
  start: number,
  end: number,
): number {
  let peak = 0;
  const last = Math.min(end, data.length);
  for (let i = Math.max(0, start); i < last; i += 1) {
    const value = Math.abs(data[i] ?? 0);
    if (value > peak) peak = value;
  }
  return peak;
}

function findAudibleRange(buffer: AudioBuffer): {
  offset: number;
  duration: number;
  peak: number;
} {
  const data = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  const window = Math.max(1, Math.floor(sampleRate * 0.01));
  const threshold = 0.02;
  let start = 0;
  let end = data.length;

  for (let i = 0; i < data.length; i += window) {
    if (measureWindowPeak(data, i, i + window) > threshold) {
      start = i;
      break;
    }
  }

  for (let i = data.length - window; i >= start; i -= window) {
    if (measureWindowPeak(data, i, i + window) > threshold) {
      end = Math.min(data.length, i + window * 4);
      break;
    }
  }

  return {
    offset: start / sampleRate,
    duration: Math.max(0.05, (end - start) / sampleRate),
    peak: measureWindowPeak(data, start, end),
  };
}

function scheduleClaps(audioContext: AudioContext, origin: number) {
  CLAP_TIMES.forEach((delay, index) => {
    const duration = 0.045;
    const frames = Math.max(1, Math.floor(audioContext.sampleRate * duration));
    const noise = audioContext.createBuffer(1, frames, audioContext.sampleRate);
    const channel = noise.getChannelData(0);
    for (let i = 0; i < frames; i += 1) {
      channel[i] = (Math.random() * 2 - 1) * Math.exp(-i / (frames * 0.18));
    }

    const source = audioContext.createBufferSource();
    source.buffer = noise;
    const filter = audioContext.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1400 + index * 180;
    filter.Q.value = 0.85;
    const gain = audioContext.createGain();
    const startAt = origin + delay;
    gain.gain.setValueAtTime(0.001, startAt);
    gain.gain.linearRampToValueAtTime(0.09, startAt + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    source.start(startAt);
    source.stop(startAt + duration);
  });
}

function scheduleSparkle(audioContext: AudioContext, startAt: number) {
  const notes = [1318.51, 1975.53, 2637.02];
  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    const noteStart = startAt + index * 0.07;
    const noteStop = noteStart + 0.16;
    gain.gain.setValueAtTime(0.001, noteStart);
    gain.gain.linearRampToValueAtTime(0.07, noteStart + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, noteStop);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(noteStart);
    oscillator.stop(noteStop);
  });
}

function playCheerFallback() {
  const element = new Audio(CHEER_URL);
  element.volume = 0.55;
  void element.play().catch(() => undefined);
}

export async function playCelebrationSound(): Promise<void> {
  try {
    const audioContext = getAudioContext();
    if (!audioContext) {
      playCheerFallback();
      return;
    }

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }
    if (audioContext.state !== "running") {
      playCheerFallback();
      return;
    }

    const cheer = await loadCheerBuffer(audioContext);
    const origin = audioContext.currentTime;

    if (cheer) {
      const range = findAudibleRange(cheer);
      const cheerGainValue =
        range.peak > 0
          ? Math.min(0.72, CHEER_PEAK_TARGET / range.peak)
          : 0.5;
      const source = audioContext.createBufferSource();
      source.buffer = cheer;
      const gain = audioContext.createGain();
      gain.gain.setValueAtTime(cheerGainValue, origin);
      const fadeStart = origin + Math.max(0, range.duration - 0.05);
      gain.gain.setValueAtTime(cheerGainValue, fadeStart);
      gain.gain.linearRampToValueAtTime(0.001, origin + range.duration);
      source.connect(gain);
      gain.connect(audioContext.destination);
      source.start(origin, range.offset, range.duration);

      scheduleClaps(audioContext, origin);
      scheduleSparkle(
        audioContext,
        origin + Math.min(Math.max(range.duration - 0.18, 0.7), 1.2),
      );
      return;
    }

    playCheerFallback();
    scheduleClaps(audioContext, origin);
    scheduleSparkle(audioContext, origin + 0.85);
  } catch {
    try {
      playCheerFallback();
    } catch {
      /* gameplay continues */
    }
  }
}
