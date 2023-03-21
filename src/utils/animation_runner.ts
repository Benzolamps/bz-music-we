export default class AnimationRunner {
  private readonly alwaysCallbacks = new Set<FrameRequestCallback>();
  private readonly onceCallbacks = new Set<FrameRequestCallback>();

  private animation = 0;

  public constructor() {
    this.run = this.run.bind(this);
    this.animation = window.requestAnimationFrame(this.run);
  }

  private run(timestamp: number) {
    this.animation = window.requestAnimationFrame(this.run);
    this.alwaysCallbacks.forEach(safeCallback);
    this.onceCallbacks.forEach(safeCallback);
    this.onceCallbacks.clear();

    function safeCallback(callback: FrameRequestCallback) {
      try {
        callback(timestamp);
      } catch (e) {
        console.error(e);
      }
    }
  }

  public on(callback: FrameRequestCallback) {
    this.alwaysCallbacks.add(callback);
  }

  public off(callback: FrameRequestCallback) {
    this.alwaysCallbacks.delete(callback);
  }

  public once(callback: FrameRequestCallback) {
    this.onceCallbacks.add(callback);
  }

  public destroy() {
    window.cancelAnimationFrame(this.animation);
  }
}
