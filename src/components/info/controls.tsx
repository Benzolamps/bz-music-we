import {modes} from '@/components/service/core';
import {Component} from 'vue-property-decorator';
import BaseComponent from '@/components/common/BaseComponent';

@Component
export class MusicMode extends BaseComponent {
  public override render() {
    return (
      <div class="popover-content">
        {Object.values(modes).map(m => <span
          style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}}
          onClick={() => this.musicService.setMode(m)}>
          <svg-icon
            iconName={`music_${m.key}`}
            class={{'popover-icon': true, 'active': this.musicService.mode.key === m.key}}
            style={{marginRight: '5px'}}
          />
          <span class={{'popover-text': true, 'active': this.musicService.mode.key === m.key}}>
            {this.messages['music.mode.' + m.key]}
          </span>
        </span>
        )}
      </div>
    );
  }
}

@Component
export class MusicVolume extends BaseComponent {
  public override render() {
    return (
      <div class="popover-content">
        <svg-icon
          iconName={`music_${this.musicService.muted ? 'muted' : 'volume'}`}
          on={{click: this.musicService.toggleMuted}}
          class="popover-icon"
          style={{cursor: 'pointer'}}
        />
        <el-slider
          value={this.musicService.volume}
          props={{min: 0, max: 1, step: 0.01, showTooltip: false}}
          on={{input: this.musicService.setVolume}}
          class="popover-slider"
        />
      </div>
    );
  }
}

@Component
export class MusicPitch extends BaseComponent {
  public override render() {
    return (
      <div class="popover-content">
        <span class="popover-text">{this.messages['music.pitch']}</span>
        <el-slider
          value={this.musicService.pitch}
          props={{min: 0, max: 2, step: 0.25, showStops: true, showTooltip: false}}
          on={{input: this.musicService.setPitch}}
          class="popover-slider"
        />
      </div>
    );
  }
}
