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
export default {
  name: "Video",
  props: ["item", "xyRTC"],
  watch: {
    "item.position": {
      handler(newPosition) {
        this.$refs.videoRef.width = newPosition.width;
        this.$refs.videoRef.height = newPosition.height;
      },
      deep: true,
    },
    sourceIdAndStateChange: {
      handler(newData) {
        this.render(newData);
      },
      deep: true,
    },
  },
  mounted() {
    const { position, roster, sourceId } = this.item;
    this.$refs.videoRef.width = position.width;
    this.$refs.videoRef.height = position.height;

    // get video renderer
    this.videoRender = this.xyRTC.getRender(this.$refs.videoRef);
    this.videoRenderTimmer = null;

    this.render({
      sourceId,
      state: roster.state,
      type: "mounted",
    });
  },
  destroyed() {
    if (this.videoRenderTimmer) {
      cancelAnimationFrame(this.videoRenderTimmer);
      this.videoRenderTimmer = null;
    }
  },
  computed: {
    // listener sourceId and state change, then rerender
    sourceIdAndStateChange() {
      const { roster, sourceId } = this.item;

      return {
        sourceId,
        state: roster.state,
        type: "computed",
      };
    },
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
    render(data) {
      const { isContent } = this.item.roster;
      const { sourceId, state } = data;

      // render function
      const renderLoop = () => {
        // frame video frame
        this.xyRTC.drawVideoFrame(this.videoRender, sourceId, isContent);

        this.videoRenderTimmer = window.requestAnimationFrame(renderLoop);
      };

      // start first frame
      if (sourceId && !this.videoRenderTimmer) {
        this.videoRenderTimmer = window.requestAnimationFrame(renderLoop);
      }

      // if video status not equeal 5(can draw), stop timmer
      if ((!sourceId && this.videoRenderTimmer) || state !== 5) {
        cancelAnimationFrame(this.videoRenderTimmer);
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
