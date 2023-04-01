<template>
  <el-drawer
    :visible="retrieveContext.state !== 'finish'"
    :with-header="!view.portable"
    direction="btt"
    :size="view.portable ? '90%' : '100%'"
    :append-to-body="true"
    :modal-append-to-body="true"
    @closed="playlist = true; type = 'total'"
    @close="retrieveContext.reject()"
    @opened="onCurrentChange(1)"
    class="retrieve-drawer"
  >
    <div class="retrieve-container">
      <el-tabs class="retrieve-tabs" v-model="type" type="card" v-if="shownItems.length">
        <el-tab-pane :label="`全部 (${shownInfo.total})`" name="total"/>
        <el-tab-pane :label="`歌曲 (${shownInfo.audio})`" name="audio"/>
        <el-tab-pane :label="`歌词 (${shownInfo.lrc})`" name="lrc"/>
        <el-tab-pane v-if="retrieveContext.dirPlaylists.size > 0" :label="`播放列表 (${shownInfo.directory})`" name="directory"/>
      </el-tabs>
      <b-scroll ref="scroll" style="flex: 1; overflow: hidden; margin-bottom: 10px;">
        <el-table :data="shownItemPage"
          :show-header="false"
          :empty-text="emptyText"
          v-loading="retrieveContext.state !== 'ready'"
          :element-loading-text="emptyText"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(255, 255, 255, 0.7)"
          style="min-height: 100%;"
        >
          <el-table-column width="70" type="index" prop="index" :index="index => index + 1 + pageSize * (currentPage - 1)"/>
          <el-table-column width="100">
            <template v-slot="scope">
              <el-tag v-if="getType(scope.row) === 'audio'" type="success">歌曲</el-tag>
              <el-tag v-else-if="getType(scope.row) === 'lrc'" type="warning">歌词</el-tag>
              <el-tag v-else-if="getType(scope.row) === 'directory'" type="">播放列表</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="path"/>
          <el-table-column width="250">
            <template v-slot="scope">
              <span v-if="scope.row.type === 'directory'">{{ getDirectoryInfo(scope.row) }}</span>
              <span v-else>
                {{ scope.row.size | fileSize }}
                <el-tag type="warning" style="float: right;" :disable-transitions="true">当前会话有效</el-tag>
              </span>
            </template>
          </el-table-column>
        </el-table>
      </b-scroll>
      <el-pagination
        background
        small
        layout="prev,pager,next"
        hide-on-single-page
        :total="shownItemsFiltered.length"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="onCurrentChange"
        style="margin-bottom: 10px;"
      />
      <div style="padding-bottom: 10px;" v-show="retrieveContext.dirPlaylists.size > 0">
        <el-checkbox v-model="playlist">是否将文件夹导入为播放列表</el-checkbox>
      </div>
      <div>
        <el-button type="primary" @click="retrieveContext.resolve(playlist)" :disabled="!shownItems.length">开始导入</el-button>
        <el-button type="warning" @click="retrieveContext.reject()">取消</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts">
import BaseComponent from '@/components/common/BaseComponent';
import BScroll from '@/components/common/BScroll.vue';
import {getType} from '@/components/service/data';
import {formatFileSize} from '@/utils/common_utils';
import {FileEntity} from '@/utils/file_handle';
import {Component, Ref, Watch} from 'vue-property-decorator';

@Component({components: {BScroll}, methods: {getType}})
export default class FileImporter extends BaseComponent {
  /* 页大小 */
  private readonly pageSize = 50;
  /* 当前页 */
  private currentPage = 1;

  private readonly playlist = true;

  @Ref('scroll')
  private readonly scroll: BScroll;

  private readonly type: ReturnType<typeof getType> | 'total' = 'total';

  private get retrieveContext() {
    return this.musicStorage.retrieveContext;
  }
  
  private get emptyText() {
    if (this.retrieveContext.state === 'pending') {
      return '正在检索文件';
    }
    if (this.retrieveContext.state === 'processing') {
      return '正在导入文件';
    }
    if (this.shownItems.length === 0) {
      return '没有符合条件的文件';
    }
    return '暂无数据';
  }

  private get shownItems() {
    if (this.retrieveContext.state !== 'ready') {
      return [];
    }
    const {defaultPlaylist, dirPlaylists} = this.retrieveContext;
    let result: Array<FileEntity>;
    if (this.playlist) {
      const {audioEntities, lrcEntities, dirEntities} = defaultPlaylist;
      result = [audioEntities, lrcEntities, dirEntities].flat();
    } else {
      result = [defaultPlaylist, ...dirPlaylists.values()].map(e => [e.audioEntities, e.lrcEntities]).flat(2);
    }
    return result.sort((a, b) => a.path.localeCompare(b.path));
  }

  private get shownItemPage() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = this.currentPage * this.pageSize;
    return this.shownItemsFiltered.slice(start, end);
  }

  private get shownItemsFiltered() {
    this.$nextTick(() => this.onCurrentChange(1));
    return this.shownItems.filter(t => this.type === 'total' || this.type === getType(t));
  }

  private get shownInfo() {
    const shownItems = this.shownItems;
    return {
      total: shownItems.length,
      audio: shownItems.filter(t => getType(t) === 'audio').length,
      lrc: shownItems.filter(t => getType(t) === 'lrc').length,
      directory: shownItems.filter(t => getType(t) === 'directory').length
    };
  }

  private getDirectoryInfo(dir: FileEntity) {
    const playlist = this.retrieveContext.dirPlaylists.get(dir);
    const size = [playlist.audioEntities, playlist.lrcEntities].flat().map(e => e.size).reduce((a, b) => a + b, 0);
    return formatFileSize(size) + ` (${playlist.audioEntities.length}歌曲, ${playlist.lrcEntities.length}歌词)`;
  }

  private getAtPage(index: number) {
    return Math.floor((index + 1) / this.pageSize) + Math.sign((index + 1) % this.pageSize);
  }

  /* 换页 */
  private async onCurrentChange(page: number) {
    const maxPage = this.getAtPage(this.shownItemsFiltered.length - 1);
    this.currentPage = Math.max(1, Math.min(maxPage, page));
    await this.$nextTick();
    this.scroll?.refresh();
  }
}
</script>

<style lang="scss">
.retrieve-drawer {
  padding: 0 calc(50% - 500px);
  .retrieve-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px;
    .retrieve-tabs {
      margin-bottom: -10px;
    }
  }
}
</style>
