<template>
  <div class="meeting-prompt">
    <div class="meeting-prompt-box" v-if="!hideCloudRecordStatus">
      <CloudRecordStatus
        :showTimer="showTimer"
        :isRecordPaused="isRecordPaused"
      />
    </div>
    <div class="meeting-prompt-box" v-if="chirmanUri">主会场模式</div>
    <div class="meeting-prompt-box" v-if="forceFullScreenId">
      主屏已锁定
      <div class="lock-btn" @click="setForceFullScreen">解锁</div>
    </div>
    <div class="meeting-prompt-box" v-if="isLocalShareContent">本地共享中</div>
    <div class="meeting-prompt-box" v-if="content">
      <span v-text="content.roster.displayName" />
      正在共享
    </div>
  </div>
</template>

<script>
import { RECORD_STATE_MAP } from '../../../utils/enum';
import CloudRecordStatus from "../CloudRecordStatus/index.vue";


export default {
  name: "PromptInfo",
  props: [
    "recordPermission",
    "isRecordPaused",
    "isLocalShareContent",
    "content",
    "chirmanUri",
    "recordStatus",
    "forceFullScreenId",
    "setForceFullScreen",
  ],
   components: {
    CloudRecordStatus,
  },
  mounted(){
    console.log('this.content',this.content)
  },

  computed: {
    hideCloudRecordStatus(){
      return !this.recordPermission.isStartRecord &&
      RECORD_STATE_MAP.acting !== this.recordStatus
    },
    showTimer(){
      return RECORD_STATE_MAP.acting === this.recordStatus
    }
  }
};
</script>

<style scoped lang="scss">
.meeting-prompt {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 99;
  display: flex;
  align-items: flex-start;
  flex-direction: column;

  &-box {
    display: flex;
    align-items: center;
    background: #000;
    padding: 6px 12px;
    color: #fff;
    border-radius: 3px;
    font-size: 12px;
    margin-bottom: 8px;
  }
  &-up {
    top: 8px;
  }
}
.lock-btn {
  display: inline-block;
  width: 56px;
  height: 20px;
  background: #3876ff;
  border-radius: 3px;
  font-size: 12px;
  color: #fff;
  line-height: 20px;
  margin-left: 12px;
  cursor: pointer;
  text-align: center;
}
.icon-mute-speaker {
  width: 16px;
  margin-right: 8px;
}

.remote-record-content {
  display: inline-flex;
  align-items: center;
  span {
    margin-right: 6px;
  }
}
</style>
