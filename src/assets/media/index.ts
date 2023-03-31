import {getFileBaseName} from '@/utils/common_utils';

const reqMp3 = require.context('@/assets/media/', true, /\.mp3$/);
export const audios: Array<{name: string, url: string}> = reqMp3.keys().map(k => ({
  name: getFileBaseName(k),
  url: reqMp3(k)
}));

const reqLrc = require.context('@/assets/media/', true, /\.lrc$/);
export const lrcs: Array<{name: string, text: string}> = reqLrc.keys().map(k => ({
  name: getFileBaseName(k),
  text: reqLrc(k).default
}));
