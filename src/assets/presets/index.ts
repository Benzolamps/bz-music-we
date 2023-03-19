import {MilkDropPreset} from 'butterchurn';
import {getFileBaseName} from '@/utils/common_utils';

const req = require.context('butterchurn-presets', false, /^\.\/[^!]*\.json$/);
export default req.keys().map(k => ({
  name: getFileBaseName(k),
  preset: req(k)
})) as Array<{name: string, preset: MilkDropPreset}>;
