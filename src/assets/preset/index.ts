import {MilkDropPreset} from "@/utils/butterchurn.min.js";

const req = require.context('@/assets/preset/', false, /\.json$/);
export default req.keys().map(k => ({
  name: k.replace('./', '').replace('.json', ''),
  preset: req(k)
})) as Array<{name: string, preset: MilkDropPreset}>;
