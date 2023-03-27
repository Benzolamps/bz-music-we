import {MilkDropPresetDesc} from 'butterchurn';
import {getFileBaseName} from '@/utils/common_utils';

const req = require.context('butterchurn-presets', false, /^\.\/[^!]*\.json$/);
export default Object.freeze(req.keys().map(k => ({
  name: getFileBaseName(k),
  preset: req(k)
}))) as ReadonlyArray<MilkDropPresetDesc>;
