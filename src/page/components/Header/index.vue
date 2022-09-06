<template>
  <div class="meeting-header">
    <span class="header-time">
      <div :class="signalStyle" @click="toggleInternal" />
      <el-tooltip class="item" effect="dark" placement="left-end">
        <div slot="content">已经使用{{ encrypt }}加密</div>
        <span class="icon-encrypt" />
      </el-tooltip>

      <Timer v-if="!holdInfo.isOnhold" />
    </span>

    <span class="header-conference">
      <span class="header-conference-name">
        {{ conferenceInfo.displayName }}
        {{
          conferenceInfo.numberType !== "CONFERENCE" &&
          conferenceInfo.meetingNumber
        }}
      </span>
      <el-popover
        v-if="conferenceInfo.numberType === 'CONFERENCE'"
        placement="bottom"
        width="200"
        trigger="hover"
      >
        <div class="meeting-popover-name" :title="conferenceInfo.displayName">
          {{ conferenceInfo.displayName }}
        </div>
        <div class="meeting-popover-number">
          会议号：<span class="number">{{ conferenceInfo.meetingNumber }}</span>
          <span
            class="copy"
            id="copyBtn"
            :data-clipboard-text="conferenceInfo.meetingNumber"
          >
            <i class="el-icon-document-copy"></i>
            复制会议号
          </span>
        </div>
        <i slot="reference" class="el-icon-info"></i>
      </el-popover>
    </span>
    <Internals v-if="internalsVisible" onClose="closeInternal" />
  </div>
</template>

<script>
import ClipboardJS from "clipboard";
import { Message } from "element-ui";
import { RECORD_STATE_MAP } from "../../../utils/enum";
import { throttle } from "../../../utils/index";
import Internals from "../Internals/index.vue";
import Timer from "../Timer/index.vue";
import XYRTC from "../../../utils/xyRTC";
import { useToolbarStore } from "../../../store/index";

export default {
  name: "PromptInfo",
  props: ["conferenceInfo", "holdInfo"],
  data() {
    return {
      xyRTC: null,
      level: 4,
      encrypt: "",
      internalsVisible: false,
      visible: false,
      clipboard: null,
      toolbarStore: useToolbarStore(),
    };
  },

  components: {
    Internals,
    Timer,
  },
  mounted() {
    this.xyRTC = XYRTC.getInstance();

    // 网络状况
    this.xyRTC.on("NetworkIndicatorLevel", this.levelHandler);

    const { encrypt } = this.xyRTC.getStatistics() || {};
    this.encrypt = encrypt;

    if (this.visible) {
      this.clipboard = new ClipboardJS("#copyBtn");
      this.clipboard.on(
        "success",
        throttle(() => {
          Message.success("复制成功", 2);
        }, 2000)
      );
    }
  },
  beforeDestroy() {
    this.xyRTC.off("NetworkIndicatorLevel", this.levelHandler);
  },
  methods: {
    levelHandler(e) {
      this.level = e;
    },
    toggleInternal() {
      this.internalsVisible = true;
    },
    closeInternal() {
      this.internalsVisible = false;
    },
  },

  computed: {
    showTimer() {
      return RECORD_STATE_MAP.acting === this.recordStatus;
    },
    signalStyle() {
      return {
        "header-signal": true,
        ["signal_" + this.level]: true,
      };
    },
  },
  watch: {
    visible: function (val) {
      this.toolbarStore.canHidden = !val;
    },
  },
};
</script>

<style scoped lang="scss">
@import "../../../assets/style/var.scss";

.meeting-header {
  width: 100%;
  height: 30px;
  text-align: center;
  color: #e7e7e7;
  background: $toolbar-bg-color;
  font-size: 13px;
  z-index: 100;
  position: fixed;
  top: 0;
  left: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  .header-time {
    position: absolute;
    left: 16px;
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .header-signal {
    width: 19px;
    height: 19px;
    margin-right: 10px;
    -webkit-app-region: no-drag;
    cursor: pointer;
  }

  .icon-encrypt {
    width: 19px;
    height: 19px;
    background: url("../../../assets/img/icon/icon_encrypt.png") no-repeat;
    background-size: 100% 100%;
    cursor: pointer;
    -webkit-app-region: no-drag;
    margin-right: 10px;

    &:hover {
      background: url("../../../assets/img/icon/icon_encrypt_hover.png")
        no-repeat;
      background-size: 100% 100%;
    }
  }

  .meeting-stats-switch {
    width: 16px;
    height: 16px;
    margin-left: -4px;
    margin-top: -4px;
    fill: #97c264;
  }
  .online {
    fill: #86b952;
  }
  .offline {
    fill: #fff;
  }

  .header-conference {
    display: flex;
    align-items: center;
    justify-content: center;

    &-name {
      max-width: 200px;
      @include text-ellipsis;
    }
  }

  .info-icon {
    transform: rotatez(180deg);
    margin-left: 8px;
    -webkit-app-region: no-drag;
  }
}

.header-name {
  margin-right: 10px;
}

.meeting-popover {
  top: 26px !important;
  z-index: 999;
  .ant-popover-arrow {
    display: none;
  }
  .ant-popover-inner {
    width: 360px;
    height: 80px;
    background: #ffffff;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.26);
    font-size: 12px;
    .ant-popover-inner-content {
      padding: 14px 16px;
    }
  }
  .upload-icon {
    position: absolute;
    right: 12px;
    top: 16px;
    cursor: pointer;
    .svg-icon {
      width: 16px;
      height: 16px;
      fill-opacity: 0.8;
      fill: #393946;
    }
    &:hover {
      .svg-icon {
        fill-opacity: 0.6;
      }
    }
  }
  &-name {
    font-size: 14px;
    color: #393946;
    margin-bottom: 12px;
    margin-right: 30px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &-number {
    display: flex;
    align-items: center;
    line-height: 18px;
    color: rgba(57, 57, 70, 0.6);
    .number {
      color: #393946;
    }
    .copy {
      display: inline-flex;
      align-items: center;
      color: rgba(56, 118, 255, 1);
      margin-left: 12px;
      cursor: pointer;
      .svg-icon {
        width: 16px;
        height: 16px;
        margin-left: 4px;
      }
    }
  }
}

$signalType: "1", "2", "3", "4";

@each $type in $signalType {
  .signal_#{$type} {
    display: block;
    width: 16px;
    height: 16px;
    background: url("../../../assets/img/signal/signal_#{$type}.png") no-repeat;
    background-size: 100% 100%;
  }
}
</style>
