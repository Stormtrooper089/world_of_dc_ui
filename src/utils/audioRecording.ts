/**
 * Microphone capture for Bhashini cloud speech-to-text.
 *
 * MediaRecorder's native output (webm/opus, or ogg on Firefox) isn't what
 * Bhashini's ASR models expect — they want 16kHz mono 16-bit PCM WAV (see
 * BhashiniClient.java on the backend). So instead of MediaRecorder, this
 * captures raw PCM samples directly via a ScriptProcessorNode (deprecated in
 * favor of AudioWorklet, but used here deliberately: it needs no separate
 * worklet module file to load, and remains broadly supported including on
 * Safari), then downsamples and WAV-encodes it in-browser.
 */

export interface CloudRecording {
  /** Stops capture and returns a base64-encoded 16kHz mono PCM16 WAV clip. */
  stop(): Promise<string>;
  /** Stops capture and releases the microphone without returning audio. */
  cancel(): void;
}

const TARGET_SAMPLE_RATE = 16000;

export async function startCloudRecording(): Promise<CloudRecording> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext: AudioContext = new AudioContextCtor();
  const source = audioContext.createMediaStreamSource(stream);
  const processor = audioContext.createScriptProcessor(4096, 1, 1);

  // A ScriptProcessorNode only fires onaudioprocess while connected into a
  // live graph reaching the destination; route through a silent gain node so
  // capture works without the mic audio actually playing back (which would
  // otherwise echo through the citizen's speakers).
  const silentGain = audioContext.createGain();
  silentGain.gain.value = 0;

  const chunks: Float32Array[] = [];
  processor.onaudioprocess = (event: AudioProcessingEvent) => {
    chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
  };

  source.connect(processor);
  processor.connect(silentGain);
  silentGain.connect(audioContext.destination);

  const teardown = () => {
    processor.onaudioprocess = null;
    source.disconnect();
    processor.disconnect();
    silentGain.disconnect();
    stream.getTracks().forEach((track) => track.stop());
  };

  return {
    async stop() {
      teardown();
      const sampleRate = audioContext.sampleRate;
      await audioContext.close();

      const merged = mergeChunks(chunks);
      const downsampled = downsampleBuffer(merged, sampleRate, TARGET_SAMPLE_RATE);
      const wavBuffer = encodeWavPcm16(downsampled, TARGET_SAMPLE_RATE);
      return arrayBufferToBase64(wavBuffer);
    },
    cancel() {
      teardown();
      audioContext.close();
    },
  };
}

function mergeChunks(chunks: Float32Array[]): Float32Array {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Float32Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}

function downsampleBuffer(buffer: Float32Array, inputSampleRate: number, outputSampleRate: number): Float32Array {
  if (outputSampleRate >= inputSampleRate) {
    return buffer;
  }
  const ratio = inputSampleRate / outputSampleRate;
  const outputLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(outputLength);

  let outputIndex = 0;
  let inputIndex = 0;
  while (outputIndex < outputLength) {
    const nextInputIndex = Math.round((outputIndex + 1) * ratio);
    let sum = 0;
    let count = 0;
    for (let i = inputIndex; i < nextInputIndex && i < buffer.length; i++) {
      sum += buffer[i];
      count++;
    }
    result[outputIndex] = count > 0 ? sum / count : 0;
    inputIndex = nextInputIndex;
    outputIndex++;
  }
  return result;
}

function encodeWavPcm16(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample; // mono
  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // byte rate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * bytesPerSample, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }
  return buffer;
}

function writeString(view: DataView, offset: number, value: string): void {
  for (let i = 0; i < value.length; i++) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const CHUNK_SIZE = 0x8000; // avoid call-stack blowup from String.fromCharCode(...bytes) on large clips
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK_SIZE));
  }
  return btoa(binary);
}
