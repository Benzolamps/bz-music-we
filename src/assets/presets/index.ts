import {MilkDropPreset} from 'butterchurn';

const req = require.context('@/assets/presets/', false, /\.json$/);
export default req.keys().map(k => ({
  name: k.replace('./', '').replace('.json', ''),
  preset: req(k)
})) as Array<{name: string, preset: MilkDropPreset}>;
