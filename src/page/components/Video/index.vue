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
              <div class="displayName">
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
import { ipcRenderer } from "electron";
import { Render } from "@xylink/xy-electron-sdk";

export default {
  name: "Video",
  props: ["item", "xyRTC", "renderMap", "isExternalDrawLocalVideo"],
  data() {
    return {
      rendererRef: null,
    };
  },
  watch: {
    "item.position": {
      handler(newPosition) {
        // 建议根据设备像素比 设置 video的 width 和 height，以防止有锯齿问题
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
  },
  mounted() {
    const { position, sourceId } = this.item;

    this.setPosition(position);

    // 正常模式下，直接调用setVideoRender方法进行渲染画面即可
    if (!this.isExternalDrawLocalVideo) {
      this.render({ sourceId });
    } else {
      // 初始化Render WebGL渲染器
      // Local画面因为接收的主窗口IPC传递过来的YUV数据，需要自行渲染
      // 外接屏幕的所有远端画面，不需要通过此方式处理
      this.rendererRef = new Render(this.$refs.videoRef);

      // 监听主窗口IPC传递过来的Local YUV Buffer数据
      ipcRenderer.on("localVideoStream", this.onLocalVideoStream);
    }
  },
  destroyed() {
    ipcRenderer.removeListener("localVideoStream", this.onLocalVideoStream);
  },
  computed: {
    // calculate video status
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
    // 更新canvas 宽高属性和style样式
    setPosition(position) {
      this.$refs.videoRef.style.width = position.width + "px";
      this.$refs.videoRef.style.height = position.height + "px";

      const dpr = window.devicePixelRatio || 1;

      this.$refs.videoRef.width = position.width * dpr;
      this.$refs.videoRef.height = position.height * dpr;
    },
    /**
     *  副屏渲染Local画面，正常模式下，不需要执行
     */
    onLocalVideoStream(event, msg) {
      const { buffer } = msg;
      const { width, height, rotation } = msg.videoFrame;

      // 调用渲染器绘画画面
      this.rendererRef.draw(buffer, width, height, rotation);
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

.video .video-model .displayName {
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
