declare module 'butterchurn' {
  export interface MilkDropPreset {}

  export interface MilkDropPresetDesc {
    name: string;
    preset: MilkDropPreset;
  }

  export interface TimeOptions {
    buffer: ArrayBuffer;
    progress: number;
  }

  export interface Visualizer {
    loadPreset(preset: MilkDropPreset, blendTime = 0);
    launchSongTitleAnim(opts: TimeOptions);
    render();
    setRendererSize(width: number, height: number, opts: {pixelRatio: number});
    connectAudio(audioNode: AudioNode);
    disconnectAudio(audioNode: AudioNode);
  }

  export default class {
    static createVisualizer(audioContext: AudioContext, canvas: HTMLCanvasElement, opts: {
      width: number;
      height: number;
      pixelRatio: number;
    }): Visualizer;
  }
}

declare module 'butterchurn/blankPreset' {
  export default {} as MilkDropPreset;
}
