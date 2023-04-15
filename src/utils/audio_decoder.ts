import {bus} from '@/components/common/common';
import platform from '@/utils/platform';

export default async function createAudioUrl(src: Blob, reverse: boolean) {
  if (!(platform.ios && src.type.endsWith('flac') || reverse)) {
    return URL.createObjectURL(src);
  }
  const audioBuffer = await bus.audioContext.decodeAudioData(await src.arrayBuffer());
  const {numberOfChannels: channels, sampleRate, length} = audioBuffer;
  const channelData = Array.from({length: channels}, (_, index) => {
    const data = audioBuffer.getChannelData(index);
    if (reverse) {
      data.reverse();
    }
    return data;
  });
  const wavRes = new Float32Array(length * channels);
  for (let i = 0; i < length; i++) {
    for (let j = 0; j < channels; j++) {
      wavRes[i * channels + j] = channelData[j][i];
    }
  }
  const blob = encodeWav(new Uint8Array(wavRes.buffer), sampleRate, channels);
  return URL.createObjectURL(blob);
}

const header = new ArrayBuffer(44);
const headerView = new DataView(header);

function encodeWav(samples: ArrayBuffer, sampleRate: number, channels: number) {
  const bytePerSample = 4;

  /* RIFF identifier */
  writeString(headerView, 0, 'RIFF');
  /* file length */
  headerView.setUint32(4, 36 + samples.byteLength, true);
  /* RIFF type */
  writeString(headerView, 8, 'WAVE');
  /* format chunk identifier */
  writeString(headerView, 12, 'fmt ');
  /* format chunk length */
  headerView.setUint32(16, 16, true);
  /* sample format (raw) */
  headerView.setUint16(20, 3, true);
  /* channel count */
  headerView.setUint16(22, channels, true);
  /* sample rate */
  headerView.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  headerView.setUint32(28, sampleRate * channels * bytePerSample, true);
  /* block align (channel count * bytes per sample) */
  headerView.setUint16(32, channels * bytePerSample, true);
  /* bits per sample */
  headerView.setUint16(34, 8 * bytePerSample, true);
  /* data chunk identifier */
  writeString(headerView, 36, 'data');
  /* data chunk length */
  headerView.setUint32(40, samples.byteLength, true);
  const result = new Uint8Array(header.byteLength + samples.byteLength);
  result.set(new Uint8Array(header), 0);
  result.set(new Uint8Array(samples), header.byteLength);
  return new Blob([result], {type: 'audio/wav'});
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
