import {bus} from '@/components/common/common';
import platform from '@/utils/platform';

export default async function createAudioUrl(src: Blob, reverse: boolean) {
  if (!(platform.ios && src.type === 'audio.flac' || reverse)) {
    return URL.createObjectURL(src);
  }
  const audioBuffer = await bus.audioContext.decodeAudioData(await src.arrayBuffer());
  const {numberOfChannels: channels, sampleRate, length} = audioBuffer;
  const channelData: Array<Float32Array> = [];
  for (let i = 0; i < channels; i++) {
    channelData.push(audioBuffer.getChannelData(i));
  }
  const wavRes = new Float32Array(length * channels);
  for (let i = 0; i < length; i++) {
    for (let j = 0; j < channels; j++) {
      wavRes[i * channels + j] = channelData[j][reverse ? length - i : i];
    }
  }
  const blob = encodeWav(new Uint8Array(wavRes.buffer), sampleRate, channels);
  return URL.createObjectURL(blob);
}

function encodeWav(samples: ArrayBuffer, sampleRate: number, channels: number) {
  const bytePerSample = 4;
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + samples.byteLength, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 3, true);
  /* channel count */
  view.setUint16(22, channels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * channels * bytePerSample, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, channels * bytePerSample, true);
  /* bits per sample */
  view.setUint16(34, 8 * bytePerSample, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, length, true);
  const result = new Uint8Array(header.byteLength + samples.byteLength);
  result.set(new Uint8Array(header), 0);
  result.set(new Uint8Array(samples), 44);
  return new Blob([result], {type: 'audio/wav'});
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
