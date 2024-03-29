<template>
  <div class="meeting-prompt">
    <div class="meeting-prompt-box" v-if="!hideCloudRecordStatus">
      <CloudRecordStatus
        :showTimer="showTimer"
        :isRecordPaused="recordStatus === RecordStatus.PAUSE_BY_OTHERS"
      />
    </div>
    <div class="meeting-prompt-box" v-if="chirmanUri">主会场模式</div>
    <div class="meeting-prompt-box" v-if="forceFullScreenId">
      主屏已锁定
      <div class="lock-btn" @click="setForceFullScreen">解锁</div>
    </div>
    <!-- 共享状态 -->
    <div class="meeting-prompt-box" v-if="isLocalShareContent">
      {{ sharingState.isPaused ? '共享已暂停' : '本地共享中' }}
      <div class="lock-btn" size="small" @click.stop="switchContentSharingState">
        {{ sharingState.isPaused ? '恢复' : '暂停' }}
      </div>
    </div>

    <div class="meeting-prompt-box" v-if="appSharingIsPaused && isLocalShareContent">
      共享已暂停，请保持被共享应用在屏幕最上方
    </div>

    <div class="meeting-prompt-box" v-if="content">
      <span v-text="content.roster.displayName" />
      正在共享
    </div>
    <SignInStatus/>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { defineProps, onMounted, computed, toRefs } from 'vue';
import { useContentSharing, useCloudRecordInfo } from "@/store";
import {  SharingType } from '@/utils/enum';
import CloudRecordStatus from "../CloudRecordStatus/index.vue";
import SignInStatus from "./signInPromp.vue";
import xyRTC from '@/utils/xyRTC';
import {RecordStatus} from '@xylink/xy-electron-sdk'

const props = defineProps({
  isLocalShareContent: Boolean,
  content: Object,
  chirmanUri: String,
  forceFullScreenId: String,
  setForceFullScreen: Function
});
const {
  content,
  chirmanUri,
  setForceFullScreen,
  forceFullScreenId,
  isLocalShareContent,
} = toRefs(props);

const sharingState = useContentSharing();
const { isPaused } = storeToRefs(sharingState);

const cloudRecordInfoState = useCloudRecordInfo();
const { recordStatus, isSelfRecord } = storeToRefs(cloudRecordInfoState);

onMounted(() => {
  console.log('content', content);
});

const hideCloudRecordStatus = computed(() => {
  return [RecordStatus.IDLE, RecordStatus.IDLE_BY_OTHERS, RecordStatus.DISABLE].includes(recordStatus.value)
});

const appSharingIsPaused = computed(() => {
  return sharingState.type === SharingType.APP && sharingState.isPaused;
});

const showTimer = computed(() => {
  return RecordStatus.ACTING === recordStatus.value ||  (RecordStatus.ACTING_BY_OTHERS === recordStatus.value && isSelfRecord.value);
});

const switchContentSharingState = () => {
  const prevPausedState = isPaused.value;

  sharingState.$patch({
    isPaused: !prevPausedState,
    isManualPaused: !prevPausedState,
  });
  // 点击按钮之前是暂停共享的状态，就重新恢复共享，否则暂停共享
  prevPausedState ? xyRTC.resumeContentCapture() : xyRTC.pauseContentCapture();
}
</script>

<style lang="scss">
.meeting-prompt {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
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
