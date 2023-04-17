import {bus} from '@/components/common/common';

/**
 * FPS计算类
 */
export class FpsHandle {
  /**
   * 当前帧率
   */
  public fps = 0;

  /**
   * 上一帧的时间戳
   */
  private lastTime = performance.now();

  /**
   * 总时间
   */
  private totalTimes = 0;

  /**
   * 帧率阈值
   */
  private fpsThreshold = 0;

  /**
   * 时间历史记录，用于计算FPS
   */
  private readonly timeHist = [0];

  /**
   * 时间历史记录的最大长度
   */
  private readonly timeHistMax = 120;

  /**
   * 获取帧率限制
   */
  private get fpsLimit() {
    return bus.wallpaperProperties.fps;
  }

  /**
   * 更新FPS值
   */
  public update() {
    /* 计算两次调用之间的时间间隔 */
    const newTime = performance.now();
    const elapsed = Math.min((newTime - this.lastTime) / 1000, 1.0);
    this.lastTime = newTime;
    /* 将时间间隔累加到总时间中 */
    this.totalTimes += elapsed;
    /* 如果当前帧的 FPS 被限制了，计算一个阈值，以确保帧率不超过指定值 */
    if (!limitFps.call(this)) {
      return false;
    }
    /* 将当前时间累加到时间历史记录中，并将时间历史记录限制在一个最大长度 */
    this.timeHist.push(this.totalTimes);
    if (this.timeHist.length > this.timeHistMax) {
      this.timeHist.shift();
    }
    /* 计算当前 FPS 值 */
    const newFps = this.timeHist.length / (this.totalTimes - this.timeHist[0]);
    /* 如果新计算出的 FPS 值与旧值之间的差异小于 3，对新值进行平滑处理，以避免 FPS 值的剧烈变化 */
    if (Math.abs(newFps - this.fps) > 3) {
      this.fps = newFps;
    } else {
      const damping = 0.93;
      this.fps = damping * this.fps + (1.0 - damping) * newFps;
    }
    return true;

    /**
     * 如果当前帧的 FPS 被限制了，计算一个阈值，以确保帧率不超过指定值
     */
    function limitFps(this: FpsHandle) {
      if (!this.fpsLimit) {
        return true;
      }
      this.fpsThreshold += elapsed;
      if (this.fpsThreshold < 1.0 / this.fpsLimit) {
        return false;
      }
      this.fpsThreshold -= 1.0 / this.fpsLimit;
      return true;
    }
  }
}
