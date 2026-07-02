/**
 * Generates a pleasant, premium-sounding musical ringtone (music box / marimba style)
 * as a WAV file.
 * The WAV is written to android/app/src/main/res/raw/order_ringtone.wav
 */
const fs = require("fs");
const path = require("path");

const SAMPLE_RATE = 22050; // Hz
const NUM_CHANNELS = 1;    // Mono
const BITS_PER_SAMPLE = 16;
const BYTES_PER_SAMPLE = BITS_PER_SAMPLE / 8;

// Define note frequencies
const NOTE_FREQS = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  G4: 392.00,
  A4: 440.00,
  C5: 523.25,
  E5: 659.25,
  G5: 783.99,
  A5: 880.00,
  C6: 1046.50
};

// Simple upbeat music box arpeggio melody
// Each note has a start time (in seconds), duration (in seconds), and frequency
const MELODY = [
  { time: 0.0,  freq: NOTE_FREQS.C4,  dur: 0.4, amp: 0.3 },
  { time: 0.2,  freq: NOTE_FREQS.E4,  dur: 0.4, amp: 0.3 },
  { time: 0.4,  freq: NOTE_FREQS.G4,  dur: 0.4, amp: 0.3 },
  { time: 0.6,  freq: NOTE_FREQS.C5,  dur: 0.8, amp: 0.4 },
  
  { time: 1.0,  freq: NOTE_FREQS.G4,  dur: 0.4, amp: 0.3 },
  { time: 1.2,  freq: NOTE_FREQS.A4,  dur: 0.4, amp: 0.3 },
  { time: 1.4,  freq: NOTE_FREQS.C5,  dur: 0.4, amp: 0.3 },
  { time: 1.6,  freq: NOTE_FREQS.E5,  dur: 0.8, amp: 0.4 },

  { time: 2.0,  freq: NOTE_FREQS.C5,  dur: 0.4, amp: 0.3 },
  { time: 2.2,  freq: NOTE_FREQS.E5,  dur: 0.4, amp: 0.3 },
  { time: 2.4,  freq: NOTE_FREQS.G5,  dur: 0.4, amp: 0.3 },
  { time: 2.6,  freq: NOTE_FREQS.C6,  dur: 1.0, amp: 0.5 },

  // Silence at the end for natural spacing
  { time: 4.0,  freq: 0,              dur: 1.0, amp: 0.0 }
];

const TOTAL_DURATION = 5.0; // seconds
const TOTAL_SAMPLES = Math.floor(TOTAL_DURATION * SAMPLE_RATE);
const samples = new Float32Array(TOTAL_SAMPLES);

// Synthesize melody notes with a music box envelope (fast attack, exponential decay)
for (const note of MELODY) {
  if (note.freq === 0) continue;
  
  const startSample = Math.floor(note.time * SAMPLE_RATE);
  const noteSamples = Math.floor(note.dur * SAMPLE_RATE);
  
  for (let i = 0; i < noteSamples; i++) {
    const idx = startSample + i;
    if (idx >= TOTAL_SAMPLES) break;
    
    const t = i / SAMPLE_RATE;
    
    // Base wave: Mix sine and a bit of triangle for a warmer music box tone
    const sine = Math.sin(2 * Math.PI * note.freq * t);
    const triangle = Math.abs((i % Math.floor(SAMPLE_RATE / note.freq)) / (SAMPLE_RATE / note.freq) - 0.5) * 4 - 1;
    let wave = sine * 0.7 + triangle * 0.3;
    
    // Add a gentle second harmonic for richness
    const harmonic = Math.sin(2 * Math.PI * (note.freq * 2) * t);
    wave = wave * 0.85 + harmonic * 0.15;

    // Amplitude envelope: fast attack (5ms), exponential decay
    const attackSamples = Math.floor(0.005 * SAMPLE_RATE);
    let envelope = 0;
    if (i < attackSamples) {
      envelope = i / attackSamples;
    } else {
      const decayTime = t - 0.005;
      envelope = Math.exp(-4.5 * decayTime); // Adjust decay speed
    }
    
    samples[idx] += wave * envelope * note.amp;
  }
}

// Normalize samples to prevent clipping and convert to 16-bit PCM
const intSamples = new Int16Array(TOTAL_SAMPLES);
let maxVal = 0;
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  if (Math.abs(samples[i]) > maxVal) {
    maxVal = Math.abs(samples[i]);
  }
}

// Normalize scaling factor
const scale = maxVal > 0 ? 0.95 / maxVal : 1;

for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const scaled = samples[i] * scale;
  intSamples[i] = Math.max(-32768, Math.min(32767, Math.round(scaled * 32767)));
}

// Write WAV header and data
const dataSize = TOTAL_SAMPLES * BYTES_PER_SAMPLE;
const headerSize = 44;
const fileSize = headerSize + dataSize;

const buffer = Buffer.alloc(fileSize);
let offset = 0;

// RIFF header
buffer.write("RIFF", offset); offset += 4;
buffer.writeUInt32LE(fileSize - 8, offset); offset += 4;
buffer.write("WAVE", offset); offset += 4;

// fmt chunk
buffer.write("fmt ", offset); offset += 4;
buffer.writeUInt32LE(16, offset); offset += 4;             // Chunk size
buffer.writeUInt16LE(1, offset); offset += 2;              // Mono format
buffer.writeUInt16LE(NUM_CHANNELS, offset); offset += 2;
buffer.writeUInt32LE(SAMPLE_RATE, offset); offset += 4;
buffer.writeUInt32LE(SAMPLE_RATE * NUM_CHANNELS * BYTES_PER_SAMPLE, offset); offset += 4; // byte rate
buffer.writeUInt16LE(NUM_CHANNELS * BYTES_PER_SAMPLE, offset); offset += 2; // block align
buffer.writeUInt16LE(BITS_PER_SAMPLE, offset); offset += 2;

// data chunk
buffer.write("data", offset); offset += 4;
buffer.writeUInt32LE(dataSize, offset); offset += 4;

for (let i = 0; i < TOTAL_SAMPLES; i++) {
  buffer.writeInt16LE(intSamples[i], offset);
  offset += 2;
}

const outPath = path.join(__dirname, "..", "android", "app", "src", "main", "res", "raw", "order_ringtone.wav");
fs.writeFileSync(outPath, buffer);
console.log(`✅  Beautiful musical order_ringtone.wav generated at: ${outPath}`);
console.log(`    Duration: ${TOTAL_DURATION}s | Size: ${(fileSize / 1024).toFixed(1)} KB`);
