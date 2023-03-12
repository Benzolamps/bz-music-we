const locale = require('element-ui/lib/locale/index.js');
const zhChsLang = require('element-ui/lib/locale/lang/zh-CN.js').default;
const zhChtLang = require('element-ui/lib/locale/lang/zh-TW.js').default;
const enLang = require('element-ui/lib/locale/lang/en.js').default;
const wallpaperProperties = {
  fps: 0,
  _language: '',
  set language(value: string) {
    this._language = value;
    if (value === 'zh-chs') {
      locale.use(zhChsLang);
    } else if (value === 'zh-cht') {
      locale.use(zhChtLang);
    } else {
      locale.use(enLang);
    }
  },
  get language() {
    return this._language;
  },
  taskbar_position: 'bottom' as 'bottom' | 'top' | 'left' | 'right',
  taskbar_length: 0
};

window['wallpaperPropertyListener'] = {
  applyGeneralProperties(props: typeof wallpaperProperties) {
    for (const propsKey in props) {
      wallpaperProperties[propsKey] = props[propsKey];
    }
  },
  applyUserProperties(props: typeof wallpaperProperties) {
    for (const propsKey in props) {
      wallpaperProperties[propsKey] = props[propsKey].value;
    }
  },
};

export default wallpaperProperties;
