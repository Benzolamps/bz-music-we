<template>
  <div class="text-editor"/>
</template>

<script lang="ts">
import BaseComponent from '@/components/common/BaseComponent';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {basicSetup} from 'codemirror';
import {EditorState, EditorStateConfig, Line, StateField} from '@codemirror/state';
import {EditorView} from '@codemirror/view';
import {StreamLanguage} from '@codemirror/language';
import {yaml} from '@codemirror/legacy-modes/mode/yaml';
import {json} from '@codemirror/lang-json';
import {undo, redo} from '@codemirror/commands';

@Component
export default class TextEditor extends BaseComponent {
  @Prop({default: ''})
  private readonly value: string;

  @Prop({default: false})
  private readonly readonly: boolean;

  @Prop({default: ''})
  private readonly lang: 'json' | 'lrc' | 'yaml' | '';

  public cmView: EditorView;

  public override mounted() {
    this.cmView = new EditorView({parent: this.$el});
    this.reset();
  }

  public reset() {
    this.cmView.setState(EditorState.create(this.editorStateConfig));
  }

  private get editorStateConfig(): EditorStateConfig {
    const readonlyWatcher = StateField.define({
      create: () => this.readonly,
      update: () => this.readonly
    });
    return {
      doc: this.value,
      extensions: [
        basicSetup,
        EditorView.updateListener.of(v => this.$emit('input', v.state.doc.toString())),
        EditorState.readOnly.from(readonlyWatcher),
        readonlyWatcher,
        this.lang === 'lrc' && StreamLanguage.define({
          name: 'lrc',
          token(stream) {
            const ch = stream.peek();
            if (ch === '[') {
              if (stream.skipTo(']')) {
                stream.next();
                return 'comment';
              } else {
                stream.skipToEnd();
                return 'error';
              }
            }
            stream.skipToEnd();
            return '';
          }
        }),
        this.lang === 'json' && json(),
        this.lang === 'yaml' && StreamLanguage.define(yaml),
        EditorState.tabSize.of(2)
      ].filter(v => v)
    };
  }

  public getLineAt(index: number) {
    return this.cmView.state.doc.lineAt(index);
  }

  public getLine(index: number) {
    return this.cmView.state.doc.line(index);
  }

  public getLineCount() {
    return this.cmView.state.doc.lines;
  }

  public getLines() {
    const result: Array<Line> = [];
    for (let i = 0; i < this.cmView.state.doc.lines; i++) {
      result.push(this.cmView.state.doc.line(i + 1));
    }
    return result;
  }

  public setRangeText(range: [number, number], text: string) {
    return new Promise(resolve => {
      this.animationRunner.once(() => {
        this.cmView.dispatch({
          changes: {from: range[0], to: range[1], insert: text},
          scrollIntoView: true
        });
        resolve(Promise.resolve());
      });
    });
  }

  public setSelectionRange(range: [number, number]) {
    return new Promise(resolve => {
      this.animationRunner.once(() => {
        this.cmView.dispatch({
          selection: {anchor: range[0], head: range[1]},
          scrollIntoView: true
        });
        resolve(Promise.resolve());
      });
    });
  }

  public undo() {
    this.animationRunner.once(() => undo(this.cmView));
  }

  public redo() {
    this.animationRunner.once(() => redo(this.cmView));
  }

  public getSelectionRange(): [number, number] {
    const {from, to} = this.cmView.state.selection.main;
    return [from, to];
  }

  public override beforeDestroy() {
    this.cmView.destroy();
  }

  @Watch('value')
  private watchValue() {
    if (this.cmView?.state.doc.toString() !== this.value) {
      this.animationRunner.once(() => {
        this.cmView.dispatch({
          changes: {from: 0, to: this.cmView.state.doc.length, insert: this.value},
          scrollIntoView: true
        });
      });
    }
  }

  @Watch('readonly')
  private watchReadonly() {
    this.animationRunner.once(() => this.cmView.dispatch({}));
  }
}
</script>

<style lang="scss">
.text-editor {
  font-size: 12px;
  line-height: 22px;
  text-align: left;

  &.large-font {
    font-size: 20px;
    line-height: 40px;
  }

  .cm-editor * {
    font-size: inherit;
    line-height: inherit;
  }
}

.text-editor iframe, .text-editor-textarea {
  width: 100%;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.text-editor-textarea {
  resize: none;
  font-size: 20px;
  text-align: left;

  background-color: transparent;

  &::selection {
    background-color: #b8d9ff;
  }
}
</style>
