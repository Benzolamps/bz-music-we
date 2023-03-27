import {Flac} from 'libflacjs';
import {Decoder} from 'libflacjs/src/decoder';
import {encodeWAV} from 'libflacjs/src/utils/wav-utils';
import assert from 'assert';

export default class FlacHandler {
  private readonly flac: Flac = require('libflacjs/dist/libflac.min.wasm');

  public async flacToWav(flacBlob: Blob, title: string) {
    if (!this.flac.isReady()) {
      await new Promise(callback => this.flac.onready = callback);
    }
    const decoder = new Decoder(this.flac, {verify: true, isOgg: false});
    try {
      console.log('开始解码', title);
      const flacData = await new Response(flacBlob).arrayBuffer();
      const binData = new Uint8Array(flacData);
      const result = decoder.decode(binData);
      const metadata = decoder.metadata;
      assert.ok(result && metadata, '解码失败: ' + title);
      const decData = decoder.getSamples(true);
      const dataView = encodeWAV(decData, metadata.sampleRate, metadata.channels, metadata.bitsPerSample);
      const wavData = new Blob([dataView], {type: 'audio/wav'});
      const wavUrl = URL.createObjectURL(wavData);
      console.log('解码完成', title);
      return wavUrl;
    } finally {
      decoder.destroy();
    }
  }

  public destroy() {}
}
