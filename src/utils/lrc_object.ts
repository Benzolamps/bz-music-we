/* eslint-disable no-dupe-class-members */

import {formatDelta, parseDelta} from '@/utils/common_utils';

const metaReg = /\[(ti|ar|al|by):[^\]]*]/g;
const timeReg = /\[[0-9][0-9]:[0-9][0-9].?[0-9]*]/g;

export interface LrcTag {
  time: number;
  content: string;
}

export interface MetaTag {
  key: string;
  value: string;
}

export default class LrcObject {
  _metaArray: Array<MetaTag> = [];
  _lrcArray: Array<LrcTag> = [];
  _dirtyLines: Array<string> = [];
  _combineString = '';
  _metaString = '';
  _lrcString = '';
  _lrcText = '';

  public get dirtyLines() {
    return this._dirtyLines;
  }

  public get lrcArray() {
    return this._lrcArray;
  }

  public get metaArray() {
    return this._metaArray;
  }

  public get combineString() {
    return this._combineString;
  }

  public get metaString() {
    return this._metaString;
  }

  public set metaString(value) {
    this._metaString = value;
  }

  public get lrcString() {
    return this._lrcString;
  }

  public set lrcString(value) {
    this._lrcString = value;
  }

  public get lrcText() {
    return this._lrcText;
  }

  public constructor(content = '') {
    if (content) {
      this._combineString = content;
      this.evalAllTags();
      this.formatAllTags();
    }
  }

  public toString() {
    return this._combineString;
  }

  public refresh() {
    this._combineString = (this._metaString.trim() + '\n' + this._lrcString.trim()).trim();
    this.evalAllTags();
    this.formatAllTags();
  }

  public evalAllTags() {
    this._metaArray = [];
    this._lrcArray = [];
    this._dirtyLines = [];
    for (let lrc of this._combineString.split('\n')) {
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

  public formatAllTags() {
    if (this._metaArray.length > 0 || this.lrcArray.length > 0 || this.dirtyLines.length > 0) {
      this._metaString = this._metaArray.map(m => this.parseMetaTag(m.key, m.value)).join('\n').trim() + '\n';
      this._lrcString = this._lrcArray.map(lrc => this.appendTimeTag(lrc.time, lrc.content)).join('\n').trim() + '\n';
      this._lrcText = this._lrcArray.map(lrc => lrc.content).join('\n').trim() + '\n';

      if (this._dirtyLines.length > 0) {
        this._lrcString += '\n' + this._dirtyLines.join('\n').trim() + '\n';
        this._lrcText += '\n' + this._dirtyLines.join('\n').trim() + '\n';
      }

      this._lrcString = this._lrcString.trim() + '\n';
      this._metaString = this._metaString.trim() + '\n';
      this._combineString = (this._metaString + '\n' + this._lrcString).trim() + '\n';
      this._lrcText = this._lrcText.trim() + '\n';
    } else {
      this._combineString = '';
      this._metaString = '';
      this._lrcString = '';
      this._lrcText = '';
    }
  }

  public parseMetaTag(key = '', value = '') {
    return '[' + key + ':' + value + ']';
  }

  public evalMetaTag(lrc: string): Array<MetaTag> | false {
    const metaArr = lrc.match(metaReg);
    if (metaArr) {
      return metaArr.map(m => {
        const [key, value] = m.substring(1, m.length - 1).split(':');
        return {key, value};
      });
    }
    return false;
  }

  public appendTimeTag(time: number, lrc = '') {
    return '[' + formatDelta(time) + ']' + lrc.trim();
  }

  public deleteTimeTag(lrc: string): string {
    return lrc.replace(new RegExp(timeReg, ''), '').trim();
  }

  public deleteAllTimeTag(lrc: string): string {
    return lrc.replaceAll(timeReg, '').trim();
  }

  public evalTimeTag(lrc: string): Array<LrcTag> | false {
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
