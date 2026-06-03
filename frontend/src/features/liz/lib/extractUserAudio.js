/**
 * extractUserAudio
 * ----------------
 * Builds a user-only WAV blob from a Liz session: takes the raw mic recording
 * (captured in parallel while ElevenLabs Liz was speaking too) plus the
 * transcript turns returned by /api/liz_eleven/finalize (each turn carries
 * `role: 'user' | 'agent'` + `time_in_call_secs`), and returns a 16 kHz mono
 * PCM WAV containing only the spans where the user was speaking.
 *
 * Why we need this:
 *   Word-level pronunciation feedback (Azure Pronunciation Assessment) needs
 *   clean user audio. If Liz's TTS bleeds in, phoneme scoring gets confused.
 *   The raw recording always contains both speakers, so we cut the agent
 *   spans out by aligning ElevenLabs' turn timing with our recorder clock
 *   (the recorder is started exactly when SDK status flips to 'connected',
 *   matching ElevenLabs' time_in_call_secs origin).
 *
 * Output format:
 *   16 kHz mono 16-bit PCM WAV — Azure pronunciation's preferred input.
 *   Caller can ship it straight to /api/speaking/evaluate as `audio_file`.
 */

const TARGET_SAMPLE_RATE = 16000;

function buildUserSpans(turns, totalDurationSecs) {
  // Each turn only carries a start timestamp; treat the next turn's start as
  // the current turn's end (and clamp the final turn at totalDurationSecs).
  const sorted = (turns || [])
    .filter((t) => typeof t.time_in_call_secs === 'number')
    .slice()
    .sort((a, b) => a.time_in_call_secs - b.time_in_call_secs);
  const spans = [];
  for (let i = 0; i < sorted.length; i++) {
    const t = sorted[i];
    if (t.role !== 'user') continue;
    const start = Math.max(0, t.time_in_call_secs);
    const next = sorted[i + 1];
    const end = next ? next.time_in_call_secs : totalDurationSecs;
    if (typeof end === 'number' && end > start) {
      spans.push({ start, end });
    }
  }
  return spans;
}

function writeAscii(view, offset, str) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

function encodeWav(samples, sampleRate) {
  const numSamples = samples.length;
  const byteSize = 44 + numSamples * 2;
  const buffer = new ArrayBuffer(byteSize);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeAscii(view, 8, 'WAVE');

  // fmt sub-chunk
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate (mono * 16-bit)
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample

  // data sub-chunk
  writeAscii(view, 36, 'data');
  view.setUint32(40, numSamples * 2, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

function mixdownToMono(audioBuffer) {
  const channels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  if (channels === 1) return audioBuffer.getChannelData(0).slice();
  const mono = new Float32Array(length);
  for (let ch = 0; ch < channels; ch++) {
    const data = audioBuffer.getChannelData(ch);
    for (let i = 0; i < length; i++) mono[i] += data[i] / channels;
  }
  return mono;
}

/**
 * @param {Blob} rawBlob — raw MediaRecorder output (audio/webm or audio/ogg)
 * @param {Array<{role:string,time_in_call_secs:number}>} transcriptTurns
 * @param {number} [durationSecs] — server-reported call duration (fallback
 *   to AudioBuffer duration if absent). Used as the end of the last span.
 * @returns {Promise<Blob|null>} — 16 kHz mono WAV with user-only audio, or
 *   null if there are no user turns / decoding failed.
 */
export async function extractUserAudio({ rawBlob, transcriptTurns, durationSecs } = {}) {
  if (!rawBlob || !(transcriptTurns && transcriptTurns.length)) return null;

  // Decode the raw recording.
  const arrayBuffer = await rawBlob.arrayBuffer();
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  const decodeCtx = new Ctx();
  let audioBuffer;
  try {
    audioBuffer = await decodeCtx.decodeAudioData(arrayBuffer.slice(0));
  } catch (_e) {
    try { decodeCtx.close(); } catch (_x) {}
    return null;
  }
  try { decodeCtx.close(); } catch (_x) {}

  const sourceRate = audioBuffer.sampleRate;
  const totalDur = durationSecs || audioBuffer.duration;
  const spans = buildUserSpans(transcriptTurns, totalDur);

  // Mixdown to mono and concat user spans at source sample rate.
  const mono = mixdownToMono(audioBuffer);
  let totalSamples = 0;
  const slices = [];
  for (const { start, end } of spans) {
    const s = Math.max(0, Math.floor(start * sourceRate));
    const e = Math.min(mono.length, Math.floor(end * sourceRate));
    if (e > s) {
      slices.push(mono.subarray(s, e));
      totalSamples += (e - s);
    }
  }

  // Fallback: if turn timing gave no usable user spans (missing/misaligned
  // time_in_call_secs is common), DON'T drop the recording — re-encode the
  // whole conversation. It includes Liz's voice (a slightly noisier transcript)
  // but that is far better than losing Part 1/3 entirely. The clean
  // user_transcript still comes from the turns separately.
  let concat;
  if (totalSamples > 0) {
    concat = new Float32Array(totalSamples);
    let off = 0;
    for (const slice of slices) {
      concat.set(slice, off);
      off += slice.length;
    }
  } else if (mono.length > 0) {
    concat = mono.slice();
  } else {
    return null;
  }

  // Resample to 16 kHz via OfflineAudioContext (rendered through native sample
  // rate conversion; cheaper and higher-quality than a hand-rolled resampler).
  const targetLength = Math.max(1, Math.ceil(concat.length * TARGET_SAMPLE_RATE / sourceRate));
  const offlineCtx = new OfflineAudioContext(1, targetLength, TARGET_SAMPLE_RATE);
  const srcBuffer = offlineCtx.createBuffer(1, concat.length, sourceRate);
  srcBuffer.copyToChannel(concat, 0);
  const src = offlineCtx.createBufferSource();
  src.buffer = srcBuffer;
  src.connect(offlineCtx.destination);
  src.start(0);
  const rendered = await offlineCtx.startRendering();
  return encodeWav(rendered.getChannelData(0), TARGET_SAMPLE_RATE);
}

/**
 * Helper for callers that want just the user transcript text (no agent lines).
 */
export function userTranscriptFromTurns(transcriptTurns) {
  if (!transcriptTurns?.length) return '';
  return transcriptTurns
    .filter((t) => t.role === 'user')
    .map((t) => (t.message || '').trim())
    .filter(Boolean)
    .join(' ');
}
