/* eslint-disable no-dupe-class-members */

import {parseDelta} from '@/utils/common_utils';

const metaReg = /\[(ti|ar|al|by):[^\]]*]/g;
const timeReg = /\[[0-9][0-9]:[0-9][0-9].?[0-9]*]/g;

export interface LrcTag {
  time: number,
  content: string
}
export interface MetaTag {
  key: string,
  value: string
}

export default class LrcObject {
  _metaArray: MetaTag[] = [];
  _lrcArray: LrcTag[] = [];
  _dirtyLines: string[] = [];
  content = '';

  public get dirtyLines() {
    return this._dirtyLines;
  }

  public get lrcArray() {
    return this._lrcArray;
  }

  public get metaArray() {
    return this._metaArray;
  }

  public constructor(content = '') {
    if (content) {
      this.content = content;
      this.evalAllTags();
    }
  }

  public toString() {
    return this.content;
  }

  public evalAllTags() {
    this._metaArray = [];
    this._lrcArray = [];
    this._dirtyLines = [];
    for (let lrc of this.content.split('\n')) {
      lrc = lrc.trim();
      if (lrc === '') {
        continue;
      }
      const metaTag = this.evalMetaTag(lrc);
      if (metaTag) {
        this._metaArray.push(...metaTag);
      } else {
        const timeTag = this.evalTimeTag(lrc);
        if (timeTag) {
          this._lrcArray.push(...timeTag);
        } else {
          this._dirtyLines.push(lrc);
        }
      }
    }
    this._lrcArray = this._lrcArray.sort((a, b) => a.time - b.time);
    this._metaArray = this._metaArray.sort((a, b) => metaReg.toString().indexOf(a.key) - metaReg.toString().indexOf(b.key));
  }

  public evalMetaTag(lrc: string): MetaTag[] | false {
    const metaArr = lrc.match(metaReg);
    if (metaArr) {
      return metaArr.map(m => {
        const [key, value] = m.substring(1, m.length - 1).split(':');
        return {key, value};
      });
    }
    return false;
  }

  public evalTimeTag(lrc: string): LrcTag[] | false {
    const timeArr = lrc.match(timeReg);
    const content = lrc.replaceAll(timeReg, '').trim();
    if (timeArr) {
      return timeArr.map(t => ({
        time: parseDelta(t.substring(1, t.length - 1)),
        content
      }));
    }
    return false;
  }
}
