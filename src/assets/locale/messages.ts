import {bus} from '@/components/common/common';

export type LanguageKeys = 'en' | 'zh';

type MusicTip = [string, string];

export interface Message extends Readonly<unknown> {
  'colon': string;
  'preview': string;
  'music.no_music': string;
  'music.no_lrc': string;
  'music.no_lrc_1': string;
  'music.author': string;
  'music.album': string;
  'music.warning': string;
  'music.delete': (content: string) => string;
  'music.confirm': string;
  'music.cancel': string;
  'music.search': string;
  'music.refresh': string;
  'music.clear': string;
  'music.clear.confirm': string;
  'music.playlist.delete': (content: string) => string;
  'music.playlist_manage': string;
  'music.cannot_play': (title: string, error: unknown) => string;
  'music.grant_permission': (name: string) => string;
  'music.pitch': string;
  'music.mute': string;
  'music.unmute': string;
  'music.volume': string;
  'music.mode.sequence': string;
  'music.mode.single': string;
  'music.mode.random': string;
  'music.reset_default': string;
  'music.import.files': string;
  'music.import.folder': string;
  'music.import.start': string;
  'music.import.total': string;
  'music.import.audio': string;
  'music.import.lrc': string;
  'music.import.playlist': string;
  'music.import.retrieving': string;
  'music.import.importing': string;
  'music.import.folder_to_playlist': string;
  'music.import.current_session': string;
  'music.import.file_type': string;
  'music.import.no_proper_files': string;
  'music.import.audio_lrc_count': (audioCount: number, lrcCount: number) => string;
  'music.tips': [
    [MusicTip, MusicTip, MusicTip],
    [MusicTip, MusicTip, MusicTip, MusicTip, MusicTip, MusicTip],
    [MusicTip, MusicTip, MusicTip],
    [MusicTip, MusicTip, MusicTip, MusicTip, MusicTip, MusicTip, MusicTip, MusicTip, MusicTip, MusicTip, MusicTip]
  ];
  'lrc.settings': string;
  'lrc.font': string;
  'lrc.font.file_type': string;
  'lrc.apply_font_success': string;
  'lrc.apply_font_failed': string;
  'lrc.font.custom': string;
  'lrc.color.default': string;
  'lrc.color.future': string;
  'lrc.color.past': string;
  'lrc.color.stroke': string;
  'lrc.editor': string;
  'lrc.editor.insert.tag': string;
  'lrc.editor.delete.tag': string;
  'lrc.editor.clear.tag': string;
  'lrc.editor.sort.tag': string;
  'lrc.editor.metadata': string;
  'lrc.editor.default': string;
  'lrc.editor.save': string;
  'lrc.editor.save.success': string;
  'lrc.editor.save.fail': string;
  'lrc.editor.quit': string;
  'lrc.editor.quit.confirm': string;
  'lrc.editor.follow': (follow: boolean) => string;
  'visual': string;
  'visual.settings': string;
  'visual.start': string;
  'visual.stop': string;
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
  'visual.fullscreen': string;
  'visual.pip': string;
  'visual.fps': string;
  'visual.ftt': string;
  'visual.overlay': string;
  'visual.change_with_music': string;
  'cef.command': string;
  'file.assets': string;
}

type LanguageRecord = Readonly<Record<LanguageKeys, Message>>;

const languages: LanguageRecord = {
  en: {
    'colon': ': ',
    'preview': 'Preview is not supported.',
    'music.no_music': '<No music>',
    'music.no_lrc': 'No lyrics',
    'music.no_lrc_1': '<No lyrics>',
    'music.author': 'Artist',
    'music.album': 'Album',
    'music.warning': 'Warning',
    'music.delete': content => `Confirm to delete "${content}"?`,
    'music.confirm': 'Confirm',
    'music.cancel': 'Cancel',
    'music.search': 'Search',
    'music.refresh': 'Refresh',
    'music.clear': 'Clear',
    'music.clear.confirm': 'Confirm to clear playlist?',
    'music.playlist.delete': content => `Confirm to delete playlist "${content}"?`,
    'music.playlist_manage': 'Playlist Manage',
    'music.cannot_play': (title, error) => `"${title}" cannot be played: ${error}`,
    'music.grant_permission': name => `Please grant permission accessing "${name}".`,
    'music.pitch': 'Speed',
    'music.mute': 'Muted.',
    'music.unmute': 'Unmuted.',
    'music.volume': 'Volume',
    'music.mode.sequence': 'List loop',
    'music.mode.single': 'Single loop',
    'music.mode.random': 'Shuffle',
    'music.reset_default': 'Restore default settings',
    'music.import.files': 'Import files',
    'music.import.folder': 'Import folder',
    'music.import.start': 'Start importing',
    'music.import.total': 'Total',
    'music.import.audio': 'Audio',
    'music.import.lrc': 'Lyrics',
    'music.import.playlist': 'Playlist',
    'music.import.retrieving': 'Retrieving files...',
    'music.import.importing': 'Importing files...',
    'music.import.folder_to_playlist': 'Import folder as playlist',
    'music.import.current_session': 'Available in current session',
    'music.import.file_type': 'Audio/Lyrics File',
    'music.import.no_proper_files': 'There are no proper files.',
    'music.import.audio_lrc_count': (audioCount, lrcCount) => `${audioCount} Audios, ${lrcCount} Lyrics`,
    'music.tips': [
      [
        ['<-', 'Prev track'],
        ['->', 'Next track'],
        ['Space', 'Play/Pause']
      ],
      [
        ['NumPad4', 'Prev preset'],
        ['NumPad6', 'Next preset'],
        ['NumPad5', 'Star/Unstar current preset'],
        ['F8', 'Show overlay info'],
        ['F10', '[Picture in Picture] mode'],
        ['F11', 'Fullscreen mode']
      ],
      [
        ['Swipe Down/Right', 'Prev preset'],
        ['Swipe Left/Up', 'Next preset'],
        ['Long press', 'Star/Unstar current preset']
      ],
      [
        ['NumPad+', 'Insert tag'],
        ['NumPad-', 'Delete tag'],
        ['NumPad4', 'Seek back 5s'],
        ['NumPad6', 'Seek forward 5s'],
        ['NumPad2', 'Seek prev line'],
        ['NumPad5', 'Seek current line'],
        ['NumPad8', 'Seek next line'],
        ['NumPad7', 'Current line time -0.05s'],
        ['NumPad9', 'Current line time +0.05s'],
        ['NumPad*', 'Toggle follow mode'],
        ['NumPad0', 'Play/Pause']
      ]
    ],
    'lrc.settings': 'Lyrics settings',
    'lrc.font': 'Font',
    'lrc.font.file_type': 'Font File',
    'lrc.apply_font_success': 'Font applied',
    'lrc.apply_font_failed': 'Font apply failed',
    'lrc.font.custom': 'Custom',
    'lrc.color.default': 'Default color',
    'lrc.color.future': 'Future color',
    'lrc.color.past': 'Past color',
    'lrc.color.stroke': 'Stroke color',
    'lrc.editor': 'Lyrics editor',
    'lrc.editor.insert.tag': 'Insert tag',
    'lrc.editor.delete.tag': 'Delete tag',
    'lrc.editor.clear.tag': 'Clear tag',
    'lrc.editor.sort.tag': 'Sort tag',
    'lrc.editor.metadata': 'Set metadata',
    'lrc.editor.default': 'Default',
    'lrc.editor.save': 'Save',
    'lrc.editor.save.success': 'Save successfully',
    'lrc.editor.save.fail': 'Save failed: ',
    'lrc.editor.quit': 'Quit',
    'lrc.editor.quit.confirm': 'Confirm to quit?',
    'lrc.editor.follow': follow => `Follow mode ${follow ? 'activated' : 'deactivated'}.`,
    'visual': 'Visualization',
    'visual.settings': 'Visualization settings',
    'visual.start': 'Start',
    'visual.stop': 'Stop',
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
    'visual.lrc_mode.scroll': 'Scrolling Lyrics',
    'visual.lrc_mode.caption': '3D Lyrics',
    'visual.fullscreen': 'Fullscreen mode',
    'visual.pip': '[Picture in Picture] mode',
    'visual.fps': 'Show FPS',
    'visual.ftt': 'Use FTT',
    'visual.overlay': 'Show overlay info',
    'visual.change_with_music': 'Switch with music change',
    'cef.command': 'To play music you selected last time, set the CEF command line <br/>--enable-experimental-web-platform-features',
    'file.assets': 'Please elect the path where the index.html is located'
  },
  zh: {
    'colon': '：',
    'preview': '暂不支持预览',
    'music.no_music': '<暂无歌曲>',
    'music.no_lrc': '无歌词',
    'music.no_lrc_1': '<暂无歌词>',
    'music.author': '演唱',
    'music.album': '专辑',
    'music.warning': '系统提醒',
    'music.delete': content => `确定要删除【${content}】？`,
    'music.confirm': '确定',
    'music.cancel': '取消',
    'music.search': '搜索',
    'music.refresh': '刷新',
    'music.clear': '清空',
    'music.clear.confirm': '确定要清空播放列表吗？',
    'music.playlist.delete': content => `确定要删除播放列表【${content}】？`,
    'music.playlist_manage': '列表管理',
    'music.cannot_play': (title, error) => `无法播放【${title}】：${error}`,
    'music.grant_permission': name => `请对【${name}】进行授权`,
    'music.pitch': '倍速',
    'music.mute': '静音',
    'music.unmute': '取消静音',
    'music.volume': '音量',
    'music.mode.sequence': '列表循环',
    'music.mode.single': '单曲循环',
    'music.mode.random': '随机播放',
    'music.reset_default': '恢复默认设置',
    'music.import.files': '导入文件',
    'music.import.folder': '导入文件夹',
    'music.import.start': '开始导入',
    'music.import.total': '全部',
    'music.import.audio': '歌曲',
    'music.import.lrc': '歌词',
    'music.import.playlist': '播放列表',
    'music.import.retrieving': '正在检索文件',
    'music.import.importing': '正在导入文件',
    'music.import.folder_to_playlist': '将文件夹导入为播放列表',
    'music.import.current_session': '当前会话有效',
    'music.import.file_type': '音频/字体文件',
    'music.import.no_proper_files': '没有符合条件的文件',
    'music.import.audio_lrc_count': (audioCount, lrcCount) => `${audioCount} 歌曲，${lrcCount} 歌词`,
    'music.tips': [
      [
        ['<-', '上一曲'],
        ['->', '下一曲'],
        ['空格', '播放/暂停']
      ],
      [
        ['数字键4', '上一个预设'],
        ['数字键6', '下一个预设'],
        ['数字键5', '收藏/取消收藏当前预设'],
        ['F8', '显示信息'],
        ['F10', '画中画模式'],
        ['F11', '全屏模式']
      ],
      [
        ['右滑/下滑', '上一个预设'],
        ['左滑/上滑', '下一个预设'],
        ['长按', '收藏/取消收藏当前预设']
      ],
      [
        ['数字键+', '添加标签'],
        ['数字键-', '删除标签'],
        ['数字键4', '快退5s'],
        ['数字键6', '快进5s'],
        ['数字键8', '上一行'],
        ['数字键5', '当前行'],
        ['数字键2', '下一行'],
        ['数字键7', '当前行时间-0.05s'],
        ['数字键9', '当前行时间+0.05s'],
        ['数字键*', '切换跟随模式'],
        ['数字键0', '播放/暂停']
      ]
    ],
    'lrc.settings': '歌词设置',
    'lrc.font': '字体',
    'lrc.font.file_type': '字体文件',
    'lrc.apply_font_success': '字体应用成功',
    'lrc.apply_font_failed': '字体应用失败',
    'lrc.font.custom': '自定义',
    'lrc.color.default': '默认颜色',
    'lrc.color.future': '未播放颜色',
    'lrc.color.past': '已播放颜色',
    'lrc.color.stroke': '描边颜色',
    'lrc.editor': '歌词编辑',
    'lrc.editor.insert.tag': '添加标签',
    'lrc.editor.delete.tag': '删除标签',
    'lrc.editor.clear.tag': '清空标签',
    'lrc.editor.sort.tag': '重新排列',
    'lrc.editor.metadata': '设置元数据',
    'lrc.editor.default': '默认',
    'lrc.editor.save': '保存',
    'lrc.editor.save.success': '保存成功',
    'lrc.editor.save.fail': '保存失败',
    'lrc.editor.quit': '退出',
    'lrc.editor.quit.confirm': '确定要退出吗？',
    'lrc.editor.follow': follow => `播放跟随已${follow ? '打开' : '关闭'}`,
    'visual': '可视化',
    'visual.settings': '可视化设置',
    'visual.start': '开启',
    'visual.stop': '关闭',
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
    'visual.lrc_mode.scroll': '滚动歌词',
    'visual.lrc_mode.caption': '3D歌词',
    'visual.fullscreen': '全屏模式',
    'visual.pip': '画中画模式',
    'visual.fps': '显示FPS',
    'visual.ftt': '使用FTT',
    'visual.overlay': '显示信息',
    'visual.change_with_music': '切歌时切换',
    'cef.command': '为了能播放上次选择的歌曲, 请设置CEF命令行为<br/>--enable-experimental-web-platform-features',
    'file.assets': '请选择index.html所在的路径'
  }
};

export default new Proxy(languages.en, {
  get(target: Message, p: keyof Message) {
    const lang = bus?.language;
    const messages = (languages[lang] ?? target) as Message;
    return messages[p] || p;
  }
});
