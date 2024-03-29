﻿import {bus} from '@/components/common/common';
import {FpsHandle} from '@/components/visual/fps-handle';
import BaseClass from '@/utils/base_class';
import butterchurn, {MilkDropPresetDesc, Visualizer} from 'butterchurn';
import blankPreset from 'butterchurn/blankPreset';
import MusicVisual from '@/components/visual/MusicVisual.vue';
import presetList from '@/assets/presets/index';
import messages from '@/assets/locale/messages';

export default class MusicVisualCore extends BaseClass {
  private mediaSource: MediaElementAudioSourceNode;
  private readonly visualizer: Visualizer;
  private readonly canvas: HTMLCanvasElement;
  private readonly canvasDraw: HTMLCanvasElement;
  private readonly getDesireCanvasSize: () => [number, number];
  private timeout: number;
  private readonly basePresetList: ReadonlyArray<MilkDropPresetDesc> = presetList;
  private presetList: ReadonlyArray<MilkDropPresetDesc>;
  private randomPresetList: ReadonlyArray<MilkDropPresetDesc>;
  private readonly fpsHandle = new FpsHandle();

  public constructor(musicVisual: MusicVisual, canvas: HTMLCanvasElement, getDesireCanvasSize: () => [number, number]) {
    super();
    this.canvas = canvas;
    if ('OffscreenCanvas' in window) {
      this.canvasDraw = new OffscreenCanvas(...getDesireCanvasSize());
    } else {
      this.canvasDraw = document.createElement('canvas');
    }
    this.getDesireCanvasSize = getDesireCanvasSize;

    bus.audioContext.resume();
    this.visualizer = butterchurn.createVisualizer(bus.audioContext, this.canvas, {
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
    musicVisual.$watch('visualStyles.onlyShowStarPresets', this.loadPresetList);
    musicVisual.$watch('visualStyles.interval', this.reloadTimeout);
    musicVisual.$watch('visualStyles.changeWithMusic', this.reloadTimeout);
    musicVisual.$watch('visualStyles.lrcMode', this.drawLrcCaption);
    musicVisual.$watch('visualStates.ftt', this.handleFtt);
    musicVisual.$watch('lrcContext.currentLrcArray', this.drawLrcCaption);
    musicVisual.$watch('music.id', () => musicVisual.visualStyles.changeWithMusic && this.loadNearPreset('next'));

    this.handleFtt();

    bus.animationRunner.on(this.drawEachFrame);
    bus.animationRunner.once(this.drawLrcCaption);

    this.loadPresetList();
    this.loadPreset();
    this.reloadTimeout();
    bus.musicVisualCore = this;
  }

  private loadPresetList() {
    this.presetList = Object.freeze(bus.visualStyles.onlyShowStarPresets
      ? this.basePresetList.filter(p => bus.visualStyles.starPresets.has(p.name))
      : Array.from(this.basePresetList));
    const presetList = Array.from(this.presetList);
    presetList.shuffle();
    this.randomPresetList = Object.freeze(presetList);
  }

  private loadPreset() {
    const preset = this.presetList.find(d => d.name === bus.visualStyles.preset);
    if (preset) {
      this.visualizer.loadPreset(preset.preset, 2.0);
    } else {
      this.visualizer.loadPreset(blankPreset, 2.0);
    }
  }

  /* region 绘制 */
  private drawEachFrame() {
    if (!this.fpsHandle.update()) {
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

    if (bus.visualStyles.lrcMode !== 'scroll') {
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

    const fps = this.fpsHandle.fps.toFixed(3);
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
    bus.$message({
      message: messages['visual.preset.switch'] + messages.colon + bus.visualStyles.preset,
      type: 'success'
    });
  }

  public nextPreset() {
    this.loadNearPreset('next');
    this.reloadTimeout();
    bus.$message({
      message: messages['visual.preset.switch'] + messages.colon + bus.visualStyles.preset,
      type: 'success'
    });
  }

  public reloadTimeout() {
    window.clearTimeout(this.timeout);
    if (!bus.visualStyles.changeWithMusic && bus.visualStyles.interval > 0) {
      this.timeout = window.setTimeout(
        () => this.loadNearPreset('next'),
        1000 * bus.visualStyles.interval
      );
    }
  }

  private handleFtt() {
    if (bus.visualStates.ftt) {
      this.mediaSource = bus.audioContext.createMediaElementSource(bus.musicService.audio);
      this.mediaSource.connect(bus.audioContext.destination);
      this.visualizer.connectAudio(this.mediaSource);
    } else {
      if (this.mediaSource) {
        this.visualizer.disconnectAudio(this.mediaSource);
        this.mediaSource.disconnect();
        this.mediaSource = null;
        bus.musicService.createAudioElement();
      }
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
    ][Math.floor(Math.random() * 3)];

    const strokeColor = bus.lrcStyles.strokeColor;

    const fontSize = Math.min(width, height) * .12;
    const fontFamily = 'LrcFont';

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
        if (textWidth < width - 2 * fontSize) {
          break;
        }
      }
      drawLines.push({text: line, x: (width - textWidth) / 2, y: validFontSize});
    }

    /* endregion */

    /* region 绘制各行 */
    const totalHeight = fontSize * (lines.length - 1) / 2 + drawLines.map(line => line.y).reduce((a, b) => a + b, 0);
    let startY = (height - totalHeight) / 2;
    for (const line of drawLines) {
      context2d.font = `${line.y}px ${fontFamily}`;
      if (strokeColor) {
        context2d.lineWidth = line.y * 0.05;
        context2d.strokeText(line.text, line.x, startY);
      }
      context2d.fillText(line.text, line.x, startY);
      startY += line.y + fontSize / 2;
    }

    /* endregion */

    /* region 调用渲染方法 */

    this.visualizer.launchSongTitleAnim({
      buffer: context2d.getImageData(0, 0, width, height).data.buffer,
      get progress() {
        return bus.lrcContext.progressForCaption;
      }
    });

    /* endregion */
  }

  private drawLrcScroll() {
    const {width, height} = this.canvas;
    const context2d = this.canvas.getContext('2d');
    if (bus.visualStyles.lrcMode === 'scroll') {
      context2d.strokeStyle = bus.lrcStyles.strokeColor;
      context2d.fillStyle = bus.lrcStyles.strokeColor;
      context2d.fillRect(0, 0, width, height);
    }

    if (bus.visualStates.pip) {
      this.drawLrcScrollInner();
      context2d.drawImage(this.canvasDraw, 0, 0);
    }
  }

  private align = 0;
  private targetAlign = 0;
  private time = 0;

  private drawLrcScrollInner() {
    const fontSize = 20 * window.devicePixelRatio;
    const margin = 10 * window.devicePixelRatio;
    const width = this.canvas.width;
    const height = this.canvas.height;
    this.canvasDraw.width = width;
    this.canvasDraw.height = height;
    const context2d = this.canvasDraw.getContext('2d', {willReadFrequently: true});
    context2d.textBaseline = 'top';
    context2d.font = `${fontSize}px LrcFont`;
    context2d.strokeStyle = bus.lrcStyles.strokeColor;
    const lrcs = bus.lrcContext.currentLrcArray;
    let align: number;
    if (lrcs.length > 0) {
      const alignLrc = lrcs[Math.ceil(lrcs.length / 2) - 1];
      align = bus.lrcContext.shownLrc.indexOf(alignLrc);
    } else {
      align = 0;
    }

    if (align !== this.targetAlign) {
      this.targetAlign = align;
      this.time = performance.now();
    }

    const damping = Math.min(1, (performance.now() - this.time) / 700);
    this.align = damping * align + (1.0 - damping) * this.align;

    let startY = height / 2 - fontSize / 2;
    startY -= this.align * (fontSize + margin);
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
      let x = (width - textWidth) / 2;
      if (x < margin && lrcs.includes(lrcTag)) {
        x = 2 * (x - margin) * bus.lrcContext.progressForOverflow + margin;
      }
      context2d.strokeText(lrcTag.content, x, startY);
      context2d.fillText(lrcTag.content, x, startY);
      startY += fontSize + margin;
    }

    let number = Math.floor((height - margin) / (fontSize + margin));
    number = number % 2 ? number : number - 1;
    number = Math.max(1, number);
    const maxHeight = number * (fontSize + margin);
    const delta = (height - margin - maxHeight) / 2;
    context2d.clearRect(0, 0, width, delta);
    context2d.clearRect(0, height - delta, width, delta);
    context2d.clearRect(0, 0, margin, height);
    context2d.clearRect(width - margin, 0, margin, height);
  }

  public close() {
    bus.animationRunner.off(this.drawEachFrame);
    bus.visualStates.video = false;
    bus.visualStates.canvas = false;
    if (this.mediaSource) {
      this.visualizer.disconnectAudio(this.mediaSource);
      this.mediaSource.disconnect();
      this.mediaSource = null;
      bus.musicService.createAudioElement();
    }
    bus.musicVisualCore = null;
  }
}
