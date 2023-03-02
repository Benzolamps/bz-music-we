const req = require.context('@/assets/fonts/lrc/', false, /\.ttf$/);
export default req.keys().map(k => ({
  name: k.replace('./', '').replace('.ttf', ''),
  url: req(k)
})) as Array<{name: string, url: string}>;
