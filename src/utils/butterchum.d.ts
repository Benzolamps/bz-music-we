declare module '@/utils/butterchurn.min.js' {
  export interface MilkDropPreset {}
  export interface MilkDropPresetDesc {name: string,url: string}

  export type TimeOptions = {
    buffer: ArrayBuffer;
    progress: number;
  } | {
    text: string;
    fontFamily: string;
    fontSize: number;
    margin: number;
    fillColor: string;
    strokeColor: string;
    progress: number;
  }

  export interface Visualizer {
    loadPreset(preset: MilkDropPreset, blendTime = 0);
    launchSongTitleAnim(opts: TimeOptions);
    render();
    setRendererSize(width: number, height: number, opts: {pixelRatio: number});
    connectAudio(audioNode: AudioNode);
    disconnectAudio(audioNode: AudioNode);
    renderer: {
      fps: number,
      calcTimeAndFPS: () => void;
    };
  }

  export default class {
    declare static createVisualizer(audioContext: AudioContext, canvas: HTMLCanvasElement, opts: {
      width: number,
      height: number,
      pixelRatio: number
    }): Visualizer;
  }
}
