import {getFileBaseName} from '@/utils/common_utils';

const req = require.context('@/assets/fonts/lrc/', true, /\.ttf$/);
export default req.keys().map(k => ({
  name: getFileBaseName(k),
  url: req(k)
})) as Array<{name: string, url: string}>;
