import "ecma-proposal-math-extensions";
import "./presetBase";
import Visualizer from "./visualizer";
import {convertPreset} from '../../milkdrop-preset-converter/dist/milkdrop-preset-converter.min'

export default class Butterchurn {
  static createVisualizer(context, canvas, opts) {
    return new Visualizer(context, canvas, opts);
  }
  
  static convertPreset(text) {
    return convertPreset(text);
  }
}
