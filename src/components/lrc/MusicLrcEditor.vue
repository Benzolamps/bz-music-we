<template>
  <section class="music-lrc-editor">
    <header class="music-lrc-editor-buttons">
      <music-carousel v-if="view.portable" style="line-height: 40px; width: calc(100% - 10px); margin-left: 10px;"/>
      <template>
        <el-button v-if="!platform.mobile" round icon="el-icon-right" @click="insertTag">
          {{messages['lrc.editor.insert.tag']}}
          <span class="code-font" ref="currentTime">{{ lrcObj.appendTimeTag(0, '') }}</span>
        </el-button>
        <el-button v-if="!platform.mobile" round icon="el-icon-back" @click="deleteTag">
          {{messages['lrc.editor.delete.tag']}}
        </el-button>
        <el-button round icon="el-icon-close" @click="clearTag">
          {{messages['lrc.editor.clear.tag']}}
        </el-button>
        <el-button round icon="el-icon-sort" @click="sortTag">
          {{messages['lrc.editor.sort.tag']}}
        </el-button>
        <el-button round icon="el-icon-paperclip" @click="openMeta">
          {{messages['lrc.editor.metadata']}}
        </el-button>
        <el-button round icon="el-icon-document-checked" @click="save">
          {{messages['lrc.editor.save']}}
        </el-button>
        <el-button round icon="el-icon-document-checked" @click="page = 'MusicPlayer'">
          {{messages['lrc.editor.quit']}}
        </el-button>
      </template>
    </header>
    <main class="el-card is-always-shadow">
      <el-scrollbar style="width: 100%; height: 100%;">
        <div class="music-lrc-editor-content">
          <text-editor ref="textEditor" v-model="lrcString" lang="lrc" :class="view.portable || 'large-font'"/>
        </div>
      </el-scrollbar>
    </main>
    <footer>
      <table v-if="platform.mobile" class="music-lrc-editor-controller">
        <tr>
          <td/>
          <td>
            <el-button type="primary" icon="el-icon-top" size="large" round plain @click="prevLine"/>
          </td>
          <td/>
          <td>
            <el-button type="primary" circle plain size="large" icon="el-icon-back" @click="textEditor.undo()"/>
            <el-button type="primary" circle plain size="large" icon="el-icon-right" style="margin-right: 25px;" @click="textEditor.redo()"/>
          </td>
        </tr>
        <tr>
          <td>
            <el-button type="primary" icon="el-icon-back" size="large" round plain @click="backSlight"/>
          </td>
          <td>
            <el-button type="warning" icon="el-icon-aim" size="large" round plain @click="currentLine"/>
          </td>
          <td>
            <el-button type="primary" icon="el-icon-right" size="large" round plain @click="forwardSlight"/>
          </td>
          <td>
            <el-button type="danger" round plain size="large" icon="el-icon-back" style="width: 140px;" @click="deleteTag">
              {{messages['lrc.editor.delete.tag']}}
            </el-button>
          </td>
        </tr>
        <tr>
          <td/>
          <td>
            <el-button type="primary" icon="el-icon-bottom" size="large" round plain @click="nextLine"/>
          </td>
          <td/>
          <td>
            <el-button type="primary" round plain size="medium" icon="el-icon-right" style="width: 140px;" @click="insertTag">
              {{messages['lrc.editor.insert.tag']}}
            </el-button>
          </td>
        </tr>
      </table>

      <!-- 音乐播放控制 -->
      <music-control/>

      <el-drawer
        :visible.sync="showMeta"
        :wrapper-closable="platform.mobile"
        :with-header="!platform.mobile"
        :direction="platform.mobile ? 'ttb' : 'rtl'"
        :size="platform.mobile ? '30%' : '480px'"
        :append-to-body="true"
        :modal-append-to-body="true"
      >
        <div style="width: 100%; height: 100%; padding: 20px; display: flex; flex-direction: column;">
          <el-button round icon="el-icon-bottom" @click="defaultMeta">默认</el-button>
          <div class="el-card is-always-shadow" style="flex: 1; padding: 10px; margin-top: 10px;">
            <div style="height: 100%; overflow: auto;">
              <text-editor ref="textEditorMeta" v-model="lrcObj.metaString" lang="lrc" :class="view.portable || 'large-font'"/>
            </div>
          </div>
        </div>
      </el-drawer>
    </footer>
  </section>
</template>

<script lang="ts">
import MusicCarousel from '@/components/info/MusicCarousel.vue';
import MusicControl from '@/components/info/MusicControl.vue';
import LrcObject from '@/utils/lrc_object';
import TextEditor from '@/components/common/TextEditor.vue';
import {KeyMapping, keyMappings} from '@/utils/common_utils';
import BaseComponent from '@/components/common/BaseComponent';
import {Component, Ref, Watch} from 'vue-property-decorator';

@Component({components: {MusicControl, MusicCarousel, TextEditor}})
export default class MusicLrcEditor extends BaseComponent {
  private showMeta = false;
  private follow = true;
  private lrcObj = new LrcObject();

  @Ref('textEditor')
  private readonly textEditor: TextEditor;

  @Ref('textEditorMeta')
  private readonly textEditorMeta: TextEditor;

  private get music() {
    return this.musicService.music;
  }

  private get lrcString() {
    return this.lrcObj.lrcString;
  }

  private set lrcString(value) {
    this.lrcObj.lrcString = value;
  }

  public override mounted() {
    this.mapKey();
    if (this.music) {
      this.readLrc();
    }
    this.animationRunner.once(this.updateTime);
  }

  private mapKey() {
    const mappings: Array<KeyMapping> = [
      {type: 'keydown', code: /^Numpad.+$/, handler: () => 0},
      {type: 'keyup', code: 'NumpadAdd', handler: this.insertTag},
      {type: 'keyup', code: 'NumpadSubtract', handler: this.deleteTag},
      {
        type: 'keyup',
        code: 'NumpadMultiply',
        handler: () => {
          this.follow = !this.follow;
          this.$toast(this.messages['lrc.editor.follow'](this.follow));
        }
      },
      {type: 'keyup', code: 'Numpad4', handler: () => this.musicService.seekBackward(5)},
      {type: 'keyup', code: 'Numpad6', handler: () => this.musicService.seekForward(5)},
      {type: 'keyup', code: 'Numpad2', handler: this.nextLine},
      {type: 'keyup', code: 'Numpad5', handler: this.currentLine},
      {type: 'keyup', code: 'Numpad8', handler: this.prevLine},
      {type: 'keyup', code: 'Numpad7', handler: this.backSlight},
      {type: 'keyup', code: 'Numpad9', handler: this.forwardSlight},
      {type: 'keyup', code: 'Numpad0', handler: this.musicService.playOrPause},
      {type: 'keydown', code: 'KeyS', ctrlKey: true, handler: this.save}
    ];
    mappings.forEach(e => keyMappings.add(e));
    this.$once('hook:beforeDestroy', () => mappings.forEach(e => keyMappings.delete(e)));
  }

  private async insertTag() {
    const index = this.textEditor.getSelectionRange()[0];
    let line = this.textEditor.getLineAt(index);
    const text = this.lrcObj.appendTimeTag(this.musicService.currentTime, line.text);
    await this.textEditor.setRangeText([line.from, line.to], text);
    const lineIndex = Math.min(line.number + 1, this.textEditor.getLineCount());
    line = this.textEditor.getLine(lineIndex);
    await this.textEditor.setSelectionRange([line.from, line.to]);
  }

  private async deleteTag() {
    const index = this.textEditor.getSelectionRange()[0];
    let line = this.textEditor.getLineAt(index);
    const text = this.lrcObj.deleteTimeTag(line.text);
    await this.textEditor.setRangeText([line.from, line.to], text);
    line = this.textEditor.getLine(line.number);
    await this.textEditor.setSelectionRange([line.from, line.to]);
  }

  private async clearTag() {
    this.lrcString = this.lrcObj.deleteAllTimeTag(this.lrcString).trim() + '\n';
    await this.$nextTick();
    await this.textEditor.setSelectionRange([0, this.lrcString.length]);
  }

  private async prevLine() {
    const index = this.textEditor.getSelectionRange()[0];
    let line = this.textEditor.getLineAt(index);
    const lineIndex = Math.max(1, line.number - 1);
    line = this.textEditor.getLine(lineIndex);
    await this.textEditor.setSelectionRange([line.from, line.to]);
    if (this.follow) {
      const timeTags = this.lrcObj.evalTimeTag(line.text);
      timeTags && this.musicService.seek(timeTags[0].time);
    }
  }

  private async currentLine() {
    const index = this.textEditor.getSelectionRange()[0];
    const line = this.textEditor.getLineAt(index);
    const timeTags = this.lrcObj.evalTimeTag(line.text);
    timeTags && this.musicService.seek(timeTags[0].time);
    await this.textEditor.setSelectionRange([line.from, line.to]);
  }

  private async nextLine() {
    const index = this.textEditor.getSelectionRange()[0];
    let line = this.textEditor.getLineAt(index);
    const lineIndex = Math.min(line.number + 1, this.textEditor.getLineCount());
    line = this.textEditor.getLine(lineIndex);
    await this.textEditor.setSelectionRange([line.from, line.to]);
    if (this.follow) {
      const timeTags = this.lrcObj.evalTimeTag(line.text);
      timeTags && this.musicService.seek(timeTags[0].time);
    }
  }

  private async backSlight() {
    const index = this.textEditor.getSelectionRange()[0];
    const line = this.textEditor.getLineAt(index);
    const timeTags = this.lrcObj.evalTimeTag(line.text);
    if (timeTags) {
      const time = Math.max(timeTags[0].time - 0.05, 0);
      const text = this.lrcObj.appendTimeTag(Math.max(time, 0), this.lrcObj.deleteTimeTag(line.text));
      await this.textEditor.setRangeText([line.from, line.to], text);
      this.musicService.seek(time);
    }
    await this.textEditor.setSelectionRange([line.from, line.to]);
  }

  private async forwardSlight() {
    const index = this.textEditor.getSelectionRange()[0];
    const line = this.textEditor.getLineAt(index);
    const timeTags = this.lrcObj.evalTimeTag(line.text);
    if (timeTags) {
      const time = Math.min(timeTags[0].time + 0.05, this.musicService.duration);
      const text = this.lrcObj.appendTimeTag(time, this.lrcObj.deleteTimeTag(line.text));
      await this.textEditor.setRangeText([line.from, line.to], text);
      this.musicService.seek(time);
    }
    await this.textEditor.setSelectionRange([line.from, line.to]);
  }

  private async sortTag() {
    this.lrcObj.refresh();
    await this.$nextTick();
    await this.textEditor.setSelectionRange([0, this.lrcString.length]);
  }

  private async defaultMeta() {
    const meta: ReadonlyArray<[string, string]> = [
      ['ti', this.music.title],
      ['ar', ''],
      ['al', ''],
      ['by', '']
    ];
    this.lrcObj.metaString = meta.map(e => this.lrcObj.parseMetaTag(...e)).join('\n') + '\n';
    await this.$nextTick();
    await this.textEditorMeta.setSelectionRange([0, this.lrcObj.metaString.length]);
  }

  private openMeta() {
    this.showMeta = true;
  }

  private async save() {
    await this.sortTag();
    const lrcText = this.lrcObj.toString().replaceAll(/\r?\n/g, '\r\n');
    this.music.lrcProvider = new Blob([lrcText], {type: 'text/plain'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(this.music.lrcProvider);
    link.download = this.music.title + '.lrc';
    link.click();
  }

  /* 读取歌词 */
  private async readLrc() {
    const lrcContent = await this.music.lrcProvider.text();
    this.lrcObj = new LrcObject(lrcContent);
    await this.$nextTick();
    this.textEditor.reset();
    await this.textEditor.setSelectionRange([0, 0]);
    this.textEditorMeta?.reset();
    await this.textEditorMeta?.setSelectionRange([0, 0]);
  }

  /* 更新时间 */
  private updateTime() {
    const element = this.$refs.currentTime as HTMLElement;
    element.innerText = this.lrcObj.appendTimeTag(this.musicService.currentTime, '');
  }

  @Watch('music.id')
  private watchMusic() {
    if (this.music) {
      this.readLrc();
    }
  }

  @Watch('musicService.duration')
  @Watch('musicService.currentTime')
  private watchCurrentTime() {
    this.animationRunner.once(this.updateTime);
  }
}
</script>

<style lang="scss">
.music-lrc-editor {
  background-image: linear-gradient(
    to bottom,
    #ffff calc(100% - 80px),
    #fff0 calc(100% - 80px)
  );
  width: 100%;
  height: 100%;
  padding: 20px;

  [client]:not([fullscreen]) & {
    padding-top: 50px;
  }

  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  .music-lrc-editor-buttons {
    z-index: 1;
    display: flex;
    flex-wrap: wrap;

    > .el-button {
      margin: 5px !important;
    }

    .menu {
      width: 100%;
      height: 0;
      pointer-events: none;
      position: relative;

      > * {
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        position: absolute;
      }
    }
  }

  main {
    overflow: hidden;
    padding: 10px;
    margin-top: 10px;
    flex: 1;

    .music-lrc-editor-content {
      overflow: auto;
      height: 100%;
      width: 100%;
      display: flex;
      flex-wrap: wrap;

      .text-editor {
        flex: 1;
        padding: 0 10px;
      }
    }
  }

  footer {
    margin-top: 20px;
    margin-bottom: 75px;

    .music-lrc-editor-controller {
      td:not(:last-child) {
        width: 45px;
        height: 45px;
      }

      td:last-child {
        width: 100%;
        text-align: right;
      }
    }
  }
}
</style>
