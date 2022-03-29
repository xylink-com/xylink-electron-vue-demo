<template>
  <div class="wrap-video" :style="item.positionStyle">
    <div class="video">
      <div class="video-content">
        <div class="video-model">
          <div class="video-bg" v-if="status.isPause">
            <div class="center">
              <div>视频暂停</div>
            </div>
            <div class="video-status">
              <div :class="videoStatusClass"></div>
              <div class="name">
                {{ item.roster.displayName || "Local" }}
              </div>
            </div>
          </div>

          <div class="video-bg" v-if="status.isRequesting">
            <div class="center">
              <div>视频请求中...</div>
            </div>
            <div class="video-status">
              <div :class="videoStatusClass"></div>
              <div class="name">
                {{ item.roster.displayName || "Local" }}
              </div>
            </div>
          </div>

          <div class="video-bg" v-if="status.isOnlyAudio">
            <div class="center">
              <div class="displayname">
                {{ item.roster.displayName || "" }}
              </div>
              <div>语音通话中</div>
            </div>
          </div>

          <div class="video-status" v-if="status.isShowAudioStatus">
            <div :class="videoStatusClass"></div>
            <div class="name">
              {{ item.roster.displayName || "Local" }}
            </div>
          </div>
        </div>
      </div>

      <canvas ref="videoRef" />
    </div>
  </div>
</template>

<script>
import { remote } from "electron";
import { Render, xyTimer } from "@xylink/xy-electron-sdk";

export default {
  name: "Video",
  props: ["item", "xyRTC", "renderMap", "isExternal"],
  data() {
    return {
      videoRenderTimmer: 0, // 视频流渲染定时器
    };
  },
  watch: {
    "item.position": {
      handler(newPosition) {
        /**
         *  建议根据设备像素比 设置 video的 width 和 height，以防止有锯齿问题
         */

        this.setPosition(newPosition);
      },
      deep: true,
    },
    "item.sourceId": {
      handler(newSourceId, previewSourceId) {
        if (!this.isExternal && newSourceId !== previewSourceId) {
          this.render({ sourceId: newSourceId });
        }
      },
      deep: true,
    },
    item: {
      handler(newItem) {
        if (this.isExternal) {
          this.externalRender(newItem);
        }
      },
      deep: true,
    },
  },
  mounted() {
    const { position, sourceId, id} = this.item;

    this.setPosition(position);

    if (this.isExternal) {
      // 建立自己的render。
      this.setRender(id);
      // 开始渲染
      this.externalRender(this.item);
    } else {
      this.render({ sourceId });
    }
  },
  computed: {
    // calcaulate video status
    status() {
      const { state = 0 } = this.item.roster;
      const pauseList = [0, 1, 3, 4, 8];
      const requestingList = [2];
      const onlyAudioList = [6, 7];
      const isPause = pauseList.includes(state);
      const isOnlyAudio = onlyAudioList.includes(state);
      const isRequesting = requestingList.includes(state);
      // 如果不是上述状态，则需要将mic的状态单独展示
      const isShowAudioStatus = !(isPause || isOnlyAudio || isRequesting);

      const status = {
        isPause,
        isOnlyAudio,
        isRequesting,
        isShowAudioStatus,
      };

      return status;
    },
    videoStatusClass() {
      return this.item.roster.audioMute
        ? "audio-muted-status"
        : "audio-unmuted-status";
    },
  },
  methods: {
    // sourceId变化时，需要重新执行setVideoRender方法
    render(data) {
      const { sourceId } = data;
      this.xyRTC.setVideoRender(sourceId, this.$refs.videoRef);
    },
    // [external] 建立自己的render
    setRender(id) {
      if (id && !this.renderMap.get(id)) {
        const render = new Render(this.$refs.videoRef);
        this.renderMap.set(id, render);
      }
    },
    setPosition(position) {
      this.$refs.videoRef.style.width = position.width + 'px';
      this.$refs.videoRef.style.height = position.height + 'px';

      const dpr = window.devicePixelRatio || 1;

      this.$refs.videoRef.width = position.width * dpr;
      this.$refs.videoRef.height = position.height * dpr;
    },
    // [external] 外接屏
    externalRender(data) {
      const { sourceId, roster, id} = data;
      const { state } = roster;

      if (!this.videoRenderTimmer && state === 5) {
        // 每秒30帧渲染
        this.videoRenderTimmer = xyTimer.setInterval(
          id,
          () => {
            this.drawBySourceId(id);
          },
          33.33
        );
      }

      if (!sourceId || state !== 5) {
        this.clearTimer();

        remote.getGlobal("sharedObject").videoFrames[id] = null;
      }
    },
    // [external] 外接屏 渲染
    drawExternalVideoFrame(id, videoFrame) {
      const render = this.renderMap.get(id);

      if (render) {
        render.draw(
          videoFrame.buffer,
          videoFrame.width,
          videoFrame.height,
          videoFrame.rotation
        );
      }
    },
    //[external] 获取当前sourceId的videoFrame, 通过render进行渲染
    drawBySourceId() {
      const arr = Array.prototype.slice.call(arguments);
      const id = arr[0];
      const videoFrame = remote.getGlobal("sharedObject").videoFrames[id];

      videoFrame?.hasData && this.drawExternalVideoFrame(id, videoFrame);
    },
    // [external] 清除videoRenderTimmer
    clearTimer() {
      if (this.videoRenderTimmer) {
        xyTimer.clearInterval(this.videoRenderTimmer.key);
        this.videoRenderTimmer = null;
      }
    },
  },
};
</script>

<style scoped>
.wrap-video {
  position: absolute;

  background: #000;
  user-select: none;
  overflow: hidden;
}

.video {
  width: 100%;
  height: 100%;
  user-select: none;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video .video-content {
  width: 100%;
  height: 100%;

  position: absolute;
  top: 0px;
  left: 0px;
  z-index: 10;
}

.video .video-content:hover .operate-icon {
  opacity: 1;
}

.video canvas {
  overflow: hidden;
}

.video .video-model {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  color: #ddd;
  font-size: 12px;

  display: flex;
  align-items: center;
  justify-content: center;
}

.video .video-model .video-status {
  position: absolute;
  bottom: 4px;
  left: 4px;
  background-color: rgba(42, 46, 51, 0.8);
  border-radius: 3px;
  display: flex;
  align-items: center;
  max-width: 90%;
}

.video .video-model .name {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-right: 6px;
}

.video .video-model .video-bg {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  background: url("./img/meeting_bg.png") center center no-repeat;
  background-size: cover;
}

.video .video-model .center {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.video .video-model .displayname {
  margin-bottom: 5px;
}

.video .video-model .audio-muted-status,
.video .video-model .audio-unmuted-status {
  width: 26px;
  height: 24px;
  margin: 0 -2px;
}
.video .video-model .audio-muted-status {
  background: url("./img/audio_mute.png") center center no-repeat;
  background-size: 60%;
}
.video .video-model .audio-unmuted-status {
  background: url("./img/audio_unmute.png") center center no-repeat;
  background-size: 60%;
}
</style>
