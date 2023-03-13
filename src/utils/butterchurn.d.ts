declare module 'butterchurn' {
  export interface MilkDropPreset {}
  export interface MilkDropPresetDesc {
    name: string;
    preset: MilkDropPreset;
  }

  export type TimeOptions = {
    buffer: ArrayBuffer;
    progress: number;
  };

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
