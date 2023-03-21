import {bus} from '@/components/common/BaseComponent';
import butterchurn, {MilkDropPresetDesc, Visualizer} from 'butterchurn';
import MusicVisual from '@/components/visual/MusicVisual.vue';
import presetList from '@/assets/presets/index';
import wallpaperProperties from '@/utils/env';
import messages from '@/assets/locale/messages';

export default class MusicVisualCore {
  private readonly audioContext: AudioContext;
  private mediaSource: MediaElementAudioSourceNode;
  private readonly visualizer: Visualizer;
  private readonly canvas: HTMLCanvasElement;
  private readonly canvasDraw: HTMLCanvasElement;
  private readonly getDesireCanvasSize: () => [number, number];
  private timeout: number;
  private readonly basePresetList: ReadonlyArray<MilkDropPresetDesc> = presetList;
  private presetList: ReadonlyArray<MilkDropPresetDesc>;
  private randomPresetList: ReadonlyArray<MilkDropPresetDesc>;

  public constructor(musicVisual: MusicVisual, canvas: HTMLCanvasElement, getDesireCanvasSize: () => [number, number]) {
    this.canvas = canvas;
    if ('OffscreenCanvas' in window) {
      this.canvasDraw = new OffscreenCanvas(...getDesireCanvasSize());
    } else {
      this.canvasDraw = document.createElement('canvas');
    }
    this.getDesireCanvasSize = getDesireCanvasSize;

    this.audioContext = new AudioContext();
    this.visualizer = butterchurn.createVisualizer(this.audioContext, this.canvas, {
      width: 0,
      height: 0,
      pixelRatio: bus.visualStyles.displayRatio
    });

    musicVisual.$watch('visualStyles.displayRatio', () => {
      const [width, height] = getDesireCanvasSize();
      this.visualizer.setRendererSize(
        width,
        height,
        {pixelRatio: bus.visualStyles.displayRatio}
      );
    });

    musicVisual.$watch('visualStyles.preset', () => {
      this.loadPreset();
      this.reloadTimeout();
    });

    this.mediaSource = this.audioContext.createMediaElementSource(bus.musicService.audio);
    this.mediaSource.connect(this.audioContext.destination);
    this.visualizer.connectAudio(this.mediaSource);

    this.drawEachFrame = this.drawEachFrame.bind(this);
    this.drawLrcCaption = this.drawLrcCaption.bind(this);
    this.drawLrcCaptionInner = this.drawLrcCaptionInner.bind(this);

    musicVisual.$watch('visualStyles.onlyShowStarPresets', this.loadPresetList.bind(this));
    musicVisual.$watch('visualStyles.interval', this.reloadTimeout.bind(this));
    musicVisual.$watch('visualStyles.lrcMode', this.drawLrcCaption);
    musicVisual.$watch('lrcContext.currentLrcArray', this.drawLrcCaption);

    bus.animationRunner.on(this.drawEachFrame);
    bus.animationRunner.once(this.drawLrcCaption);

    this.loadPresetList();
    this.loadPreset();
    this.reloadTimeout();

    bus.musicVisualCore = this;
  }

  private loadPresetList() {
    this.presetList = bus.visualStyles.onlyShowStarPresets
      ? this.basePresetList.filter(p => bus.visualStyles.starPresets.has(p.name))
      : Array.from(this.basePresetList);
    const presetList = Array.from(this.presetList);
    presetList.shuffle();
    this.randomPresetList = Object.freeze(presetList);
  }

  private loadPreset() {
    const name = bus.visualStyles.preset;
    const preset = this.presetList.find(d => d.name === name) ?? this.presetList[0];
    if (preset) {
      this.visualizer.loadPreset(preset.preset, 2.0);
    } else {
      this.visualizer.loadPreset({}, 2.0);
    }
  }

  private last = performance.now() / 1000;
  private fpsThreshold = 0;

  private limitFps() {
    // Figure out how much time has passed since the last animation
    const now = performance.now() / 1000;
    const dt = Math.min(now - this.last, 1);
    this.last = now;

    // If there is an FPS limit, abort updating the animation if we have reached the desired FPS
    if (wallpaperProperties.fps > 0) {
      this.fpsThreshold += dt;
      if (this.fpsThreshold < 1.0 / wallpaperProperties.fps) {
        return true;
      }
      this.fpsThreshold -= 1.0 / wallpaperProperties.fps;
    }
    return false;
  }

  /* region 绘制 */
  private drawEachFrame() {
    if (this.limitFps()) {
      return;
    }

    const [width, height] = this.getDesireCanvasSize();

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.visualizer.setRendererSize(
        this.canvas.width,
        this.canvas.height,
        {pixelRatio: bus.visualStyles.displayRatio}
      );
    }

    const context2d = this.canvas.getContext('2d');
    context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (bus.visualStyles.lrcMode === 'scroll') {
      this.visualizer.renderer.calcTimeAndFPS();
    } else {
      this.visualizer.render();
    }
    if (bus.visualStyles.lrcMode !== 'caption') {
      this.drawLrcScroll();
    }
    if (bus.visualStyles.showFps) {
      this.drawFps();
    }
  }

  private drawFps() {
    const fontFamily = 'LrcFont';
    const fontSize = 15 * window.devicePixelRatio;
    const context2d = this.canvas.getContext('2d');
    context2d.textBaseline = 'top';
    context2d.font = `${fontSize}px ${fontFamily}`;
    context2d.fillStyle = bus.lrcStyles.pastColor;

    const fps = this.visualizer.renderer.fps.toFixed(3);
    context2d.fillText('FPS: ' + fps, 5 * window.devicePixelRatio, 5 * window.devicePixelRatio);
  }

  private loadNearPreset(nextPresetType: 'prev' | 'next') {
    const list = bus.visualStyles.random ? this.randomPresetList : this.presetList;
    let index = list.findIndex(d => d.name === bus.visualStyles.preset);
    index += nextPresetType === 'prev' ? -1 : 1;
    if (index >= list.length) {
      index = 0;
    } else if (index <= -1) {
      index = list.length - 1;
    }
    bus.visualStyles.preset = list[index].name;
  }

  public prevPreset() {
    this.loadNearPreset('prev');
    this.reloadTimeout();
    bus.$message({message: messages['visual.preset.switch'] + messages.colon + bus.visualStyles.preset, type: 'success'});
  }

  public nextPreset() {
    this.loadNearPreset('next');
    this.reloadTimeout();
    bus.$message({message: messages['visual.preset.switch'] + messages.colon + bus.visualStyles.preset, type: 'success'});
  }

  public reloadTimeout() {
    window.clearTimeout(this.timeout);
    if (bus.visualStyles.interval > 0) {
      this.timeout = window.setTimeout(
        () => this.loadNearPreset('next'),
        1000 * bus.visualStyles.interval
      );
    }
  }

  /* 绘制标题歌词 */
  private drawLrcCaption() {
    if (bus.visualStyles.lrcMode === 'scroll') {
      return;
    }
    bus.animationRunner.once(this.drawLrcCaptionInner);
  }

  private drawLrcCaptionInner() {
    const lines = bus.lrcContext.currentLrcArray.filter(lrc => lrc.content).map(lrc => lrc.content);
    if (lines.length === 0) {
      this.visualizer.launchSongTitleAnim({buffer: null, progress: 0});
      return;
    }

    const width = this.canvas.width * bus.visualStyles.displayRatio;
    const height = this.canvas.height * bus.visualStyles.displayRatio;
    this.canvasDraw.width = width;
    this.canvasDraw.height = height;

    /* region 绘制样式 */

    const fillColor = [
      bus.lrcStyles.defaultColor,
      bus.lrcStyles.pastColor,
      bus.lrcStyles.futureColor
    ][Math.floor(Math.random() * 4)];

    const strokeColor = bus.lrcStyles.strokeColor;

    const fontSize = Math.max(50 * window.devicePixelRatio, Math.min(width, height) * .12);

    const fontFamily = 'LrcFont';

    const margin = 50 * window.devicePixelRatio;

    /* endregion */

    /* region 初始化canvas */

    const context2d = this.canvasDraw.getContext('2d', {willReadFrequently: true});
    context2d.clearRect(0, 0, width, height);
    context2d.fillStyle = fillColor;
    context2d.strokeStyle = strokeColor;
    context2d.textBaseline = 'top';

    /* endregion */

    /* region 计算适合的字体大小 */

    const drawLines = [];
    for (const line of lines) {
      let textWidth, validFontSize;
      for (validFontSize = fontSize; validFontSize > 9; validFontSize--) {
        context2d.font = `${validFontSize}px ${fontFamily}`;
        textWidth = context2d.measureText(line).width;
        if (textWidth < width - 2 * margin) {
          break;
        }
      }
      drawLines.push({text: line, x: (width - textWidth) / 2, y: validFontSize});
    }

    /* endregion */

    /* region 绘制各行 */
    const totalHeight = margin * (lines.length - 1) + drawLines.map(line => line.y).reduce((a, b) => a + b, 0);
    let startY = (height - totalHeight) / 2;
    for (const line of drawLines) {
      context2d.font = `${line.y}px ${fontFamily}`;
      context2d.lineWidth = Math.max(3 * window.devicePixelRatio, line.y / 10);
      context2d.strokeText(line.text, line.x, startY);
      context2d.fillText(line.text, line.x, startY);
      startY += line.y + margin;
    }

    /* endregion */

    /* region 调用渲染方法 */

    this.visualizer.launchSongTitleAnim({
      buffer: context2d.getImageData(0, 0, width, height).data.buffer,
      get progress() {
        /*
         * 0-.9 进入 0-1
         * .9-.95 保持 1
         * .95-1 退出 1-0
         */
        const progress = bus.lrcContext.progress;
        if (progress < .9) {
          return progress / .9;
        } else if (progress >= .9 && progress < .95) {
          return 1;
        } else {
          return (1 - progress) / .05;
        }
      }
    });

    /* endregion */
  }

  private drawLrcScroll() {
    const lrcs = bus.lrcContext.currentLrcArray;
    let align;
    if (lrcs.length > 0) {
      const alignLrc = lrcs[Math.ceil(lrcs.length / 2) - 1];
      align = bus.lrcContext.shownLrc.indexOf(alignLrc);
    } else {
      align = -1;
    }
    const fontSize = 20 * window.devicePixelRatio;
    const margin = 10 * window.devicePixelRatio;
    const {width, height} = this.canvas;
    const context2d = this.canvas.getContext('2d');
    context2d.textBaseline = 'top';
    context2d.font = `${fontSize}px LrcFont`;
    context2d.strokeStyle = bus.lrcStyles.strokeColor;
    if (bus.visualStyles.lrcMode === 'scroll') {
      context2d.fillStyle = bus.lrcStyles.strokeColor;
      context2d.fillRect(0, 0, width, height);
    }

    if (!bus.visualStyles.state.pip) {
      return;
    }

    let startY = height / 2 - fontSize / 2;
    startY -= align * (fontSize + margin);
    for (const lrcTag of bus.lrcContext.shownLrc) {
      if (startY < margin / 2 || startY > height - fontSize - margin / 2) {
        startY += fontSize + margin;
        continue;
      }
      const textWidth = context2d.measureText(lrcTag.content).width;
      if (lrcs.includes(lrcTag)) {
        const gnt = context2d.createLinearGradient(
          (width - textWidth) / 2,
          0,
          textWidth + (width + textWidth) / 2,
          0
        );
        gnt.addColorStop(bus.lrcContext.progress / 2, bus.lrcStyles.pastColor);
        gnt.addColorStop(bus.lrcContext.progress, bus.lrcStyles.futureColor);
        context2d.fillStyle = gnt;
      } else {
        context2d.fillStyle = bus.lrcStyles.defaultColor;
      }
      context2d.strokeText(lrcTag.content, (width - textWidth) / 2, startY);
      context2d.fillText(lrcTag.content, (width - textWidth) / 2, startY);
      startY += fontSize + margin;
    }
  }

  public close() {
    bus.animationRunner.off(this.drawEachFrame);
    bus.visualStyles.state.video = false;
    bus.visualStyles.state.canvas = false;
    if (this.mediaSource) {
      this.visualizer.disconnectAudio(this.mediaSource);
      this.mediaSource.disconnect();
      this.mediaSource = null;
      bus.musicService.createAudioElement();
    }
    this.audioContext.close();
    bus.musicVisualCore = null;
  }
}
