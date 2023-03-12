import wallpaperProperties from '@/utils/env';

export type LanguageKeys = 'en-us' | 'zh-chs' | 'zh-cht';

export interface Message extends Readonly<unknown> {
  'colon': string,
  'preview': string,
  'music.no_music': string;
  'music.no_lrc': string;
  'music.no_lrc_1': string;
  'music.add_files': string;
  'music.add_folder': string;
  'music.warning': string;
  'music.delete': (content: string) => string;
  'music.confirm': string;
  'music.cancel': string;
  'music.no_proper_files': string;
  'music.about_to_import': (audioCount: number, lrcCount: number) => string;
  'music.keep': string;
  'music.do_not_keep': string;
  'music.cancel_import': string;
  'music.import_finish': (audioCount: number, lrcCount: number) => string;
  'music.cannot_play': (title: string, error: unknown) => string;
  'music.pitch': string;
  'music.mute': string;
  'music.unmute': string;
  'music.volume': string;
  'music.mode.sequence': string;
  'music.mode.single': string;
  'music.mode.random': string;
  'music.reset_default': string;
  'lrc.settings': string;
  'lrc.font': string;
  'lrc.apply_font_success': string;
  'lrc.apply_font_failed': string;
  'lrc.font.custom': string;
  'lrc.color.default': string;
  'lrc.color.future': string;
  'lrc.color.past': string;
  'lrc.color.stroke': string;
  'visual.settings': string;
  'visual.display_ratio': string;
  'visual.preset': string;
  'visual.preset.unstar': string;
  'visual.preset.star': string;
  'visual.preset.only_show_stars': string;
  'visual.preset.random': string;
  'visual.preset.config': string;
  'visual.preset.prev': string;
  'visual.preset.next': string;
  'visual.preset.interval': string;
  'visual.preset.switch': string;
  'visual.lrc_mode': string;
  'visual.lrc_mode.scroll': string;
  'visual.lrc_mode.caption': string;
  'visual.lrc_mode.mix': string;
  'visual.pip': string;
  'visual.fps': string;
}

type LanguageRecord = Readonly<Record<LanguageKeys, Message>>;

const languages: LanguageRecord = {
  'en-us': {
    'colon': ': ',
    'preview': 'Preview is not supported.',
    'music.no_music': '<No music>',
    'music.no_lrc': 'No lyrics',
    'music.no_lrc_1': '<No lyrics>',
    'music.add_files': 'Add files',
    'music.add_folder': 'Add folder',
    'music.warning': 'Warning',
    'music.delete': content => `Confirm to delete ${content}?`,
    'music.confirm': 'Confirm',
    'music.cancel': 'Cancel',
    'music.no_proper_files': 'There are no proper files.',
    'music.about_to_import': (audioCount, lrcCount) => `About to import ${audioCount} audio files and ${lrcCount} lyrics files, do you want to keep the existing files in the list?`,
    'music.keep': 'Keep',
    'music.do_not_keep': 'Do not keep',
    'music.cancel_import': 'Cancel import.',
    'music.import_finish': (audioCount, lrcCount) => `${audioCount} audio files and ${lrcCount} lyrics files have been imported.`,
    'music.cannot_play': (title, error) => `${title} cannot be played: ${error}`,
    'music.pitch': 'Speed',
    'music.mute': 'Muted.',
    'music.unmute': 'Unmuted.',
    'music.volume': 'Volume',
    'music.mode.sequence': 'List loop',
    'music.mode.single': 'Single loop',
    'music.mode.random': 'Shuffle',
    'music.reset_default': 'Restore default settings',
    'lrc.settings': 'Lyrics settings',
    'lrc.font': 'Font',
    'lrc.apply_font_success': 'Font applied',
    'lrc.apply_font_failed': 'Font apply failed',
    'lrc.font.custom': 'Custom',
    'lrc.color.default': 'Default color',
    'lrc.color.future': 'Future color',
    'lrc.color.past': 'Past color',
    'lrc.color.stroke': 'Stroke color',
    'visual.settings': 'Visualization settings',
    'visual.display_ratio': 'Display resolution',
    'visual.preset': '[Milk Drop] preset',
    'visual.preset.unstar': 'Unstarred',
    'visual.preset.star': 'Starred',
    'visual.preset.only_show_stars': 'Only show ',
    'visual.preset.random': 'Shuffle',
    'visual.preset.config': 'Config',
    'visual.preset.prev': 'Prev preset',
    'visual.preset.next': 'Next preset',
    'visual.preset.interval': 'Switch interval',
    'visual.preset.switch': 'Switch to',
    'visual.lrc_mode': 'Lyrics view mode',
    'visual.lrc_mode.scroll': 'Scroll',
    'visual.lrc_mode.caption': 'Caption',
    'visual.lrc_mode.mix': 'Mix',
    'visual.pip': '[Picture in Picture] mode',
    'visual.fps': 'Show FPS'
  },
  'zh-chs': {
    'colon': '：',
    'preview': '暂不支持预览',
    'music.no_music': '<暂无歌曲>',
    'music.no_lrc': '无歌词',
    'music.no_lrc_1': '<暂无歌词>',
    'music.add_files': '添加文件',
    'music.add_folder': '添加文件夹',
    'music.warning': '系统提醒',
    'music.delete': content => `确定要删除${content}？`,
    'music.confirm': '确定',
    'music.cancel': '取消',
    'music.no_proper_files': '没有符合条件的文件',
    'music.about_to_import': (audioCount, lrcCount) => `即将导入${audioCount}个音频文件和${lrcCount}个歌词文件，是否保留列表中已有的文件？`,
    'music.keep': '保留',
    'music.do_not_keep': '不保留',
    'music.cancel_import': '取消导入',
    'music.import_finish': (audioCount, lrcCount) => `导入${audioCount}个音频文件和${lrcCount}个歌词文件完成`,
    'music.cannot_play': (title, error) => `无法播放${title}：${error}`,
    'music.pitch': '倍速',
    'music.mute': '静音',
    'music.unmute': '取消静音',
    'music.volume': '音量',
    'music.mode.sequence': '列表循环',
    'music.mode.single': '单曲循环',
    'music.mode.random': '随机播放',
    'music.reset_default': '恢复默认设置',
    'lrc.settings': '歌词设置',
    'lrc.font': '字体',
    'lrc.apply_font_success': '字体应用成功',
    'lrc.apply_font_failed': '字体应用失败',
    'lrc.font.custom': '自定义',
    'lrc.color.default': '默认颜色',
    'lrc.color.future': '未播放颜色',
    'lrc.color.past': '已播放颜色',
    'lrc.color.stroke': '描边颜色',
    'visual.settings': '可视化设置',
    'visual.display_ratio': '展示分辨率',
    'visual.preset': 'Milk Drop 预设',
    'visual.preset.unstar': '已取消收藏',
    'visual.preset.star': '已收藏',
    'visual.preset.only_show_stars': '只显示',
    'visual.preset.random': '随机切换',
    'visual.preset.config': '配置',
    'visual.preset.prev': '上一个',
    'visual.preset.next': '下一个',
    'visual.preset.interval': '切换间隔',
    'visual.preset.switch': '已切换到',
    'visual.lrc_mode': '歌词展示方式',
    'visual.lrc_mode.scroll': '滚动',
    'visual.lrc_mode.caption': '标题',
    'visual.lrc_mode.mix': '组合',
    'visual.pip': '画中画模式',
    'visual.fps': '显示FPS'
  },
  'zh-cht': {
    'colon': '：',
    'preview': '暫不支持預覽',
    'music.no_music': '<暫無歌曲>',
    'music.no_lrc': '無歌詞',
    'music.no_lrc_1': '<暫無歌詞>',
    'music.add_files': '添加文件',
    'music.add_folder': '添加文件夾',
    'music.warning': '系统提醒',
    'music.delete': content => `確定要刪除${content}？`,
    'music.confirm': '确定',
    'music.cancel': '取消',
    'music.no_proper_files': '沒有符合條件的文件',
    'music.about_to_import': (audioCount, lrcCount) => `即將導入${audioCount}個音頻文件和${lrcCount}個歌詞文件，是否保留列表中已有的文件？`,
    'music.keep': '保留',
    'music.do_not_keep': '不保留',
    'music.cancel_import': '取消導入',
    'music.import_finish': (audioCount, lrcCount) => `導入${audioCount}個音頻文件和${lrcCount}個歌詞文件完成`,
    'music.cannot_play': (title, error) => `無法播放${title}：${error}`,
    'music.pitch': '倍速',
    'music.mute': '靜音',
    'music.unmute': '取消靜音',
    'music.volume': '音量',
    'music.mode.sequence': '列表循環',
    'music.mode.single': '單曲循環',
    'music.mode.random': '隨機播放',
    'music.reset_default': '恢復默認設置',
    'lrc.settings': '歌詞設置',
    'lrc.font': '字體',
    'lrc.apply_font_success': '字體應用成功',
    'lrc.apply_font_failed': '字體應用失敗',
    'lrc.font.custom': '自定義',
    'lrc.color.default': '默認顏色',
    'lrc.color.future': '未播放顏色',
    'lrc.color.past': '已播放顏色',
    'lrc.color.stroke': '描邊顏色',
    'visual.settings': '可視化設置',
    'visual.display_ratio': '展示分辨率',
    'visual.preset': 'Milk Drop 預設',
    'visual.preset.unstar': '已取消收藏',
    'visual.preset.star': '已收藏',
    'visual.preset.only_show_stars': '衹顯示',
    'visual.preset.random': '隨機切換',
    'visual.preset.config': '配置',
    'visual.preset.prev': '上一個',
    'visual.preset.next': '下一個',
    'visual.preset.interval': '切換間隔',
    'visual.preset.switch': '已切換到',
    'visual.lrc_mode': '歌詞展示方式',
    'visual.lrc_mode.scroll': '滾動',
    'visual.lrc_mode.caption': '標題',
    'visual.lrc_mode.mix': '組合',
    'visual.pip': '畫中畫模式',
    'visual.fps': '顯示FPS',
  }
};

export default new Proxy(languages['en-us'], {
  get(target: Message, p: keyof Message) {
    const lang = wallpaperProperties.language;
    const messages = (languages[lang] ?? target) as Message;
    return messages[p] || p;
  }
}) as Message;
