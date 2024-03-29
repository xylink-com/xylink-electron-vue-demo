<template>
  <div class="meeting-header">
    <span class="header-time">
      <div :class="signalStyle" @click="toggleInternal" />
      <el-tooltip class="item" placement="bottom-end">
        <template v-slot:content>
          <div>已经使用{{ encrypt }}加密</div>
        </template>
        <span class="icon-encrypt" />
      </el-tooltip>
      <Timer v-if="!isOnhold" />
    </span>

    <span class="header-conference">
      <span class="header-conference-name">
        {{ conferenceInfo.displayName }}
        <template v-if="conferenceInfo.numberType !== 'CONFERENCE'">{{
          conferenceInfo.meetingNumber
        }}</template>
      </span>
      &nbsp;&nbsp;
      <el-popover
        v-if="conferenceInfo.numberType === 'CONFERENCE'"
        placement="bottom"
        width="360"
        trigger="hover"
        popper-class="meeting-popover"
      >
        <div class="meeting-popover-name" :title="conferenceInfo.displayName">
          {{ conferenceInfo.displayName }}
        </div>
        <div class="meeting-popover-number">
          会议号：<span class="number">{{ conferenceInfo.meetingNumber }}</span>
          <span
            v-clipboard:copy="conferenceInfo.meetingNumber"
            v-clipboard:success="onCopySuccess"
            v-clipboard:error="onCopyError"
            class="copy"
          >
            <el-icon><CopyDocument /></el-icon>
            复制会议号
          </span>
        </div>
        <template v-slot:reference>
          <el-icon><InfoFilled /></el-icon>
        </template>
      </el-popover>
    </span>
    <Internals v-if="internalsVisible" :onClose="closeInternal" />
  </div>
</template>

<script>
import { ElMessage as Message } from "element-plus";
import { RECORD_STATE_MAP } from "../../../utils/enum";
import Internals from "../Internals/index.vue";
import Timer from "../Timer/index.vue";
import xyRTC from "../../../utils/xyRTC";
import { useToolbarStore } from "../../../store/index";
export default {
  name: "PromptInfo",
  props: ["conferenceInfo", "holdInfo"],
  data() {
    return {
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

    // 网络状况
    xyRTC.on("NetworkIndicatorLevel", this.levelHandler);

    const { encrypt } = xyRTC.getStatistics() || {};
    this.encrypt = encrypt;
  },
  beforeUnmount() {
    xyRTC.off("NetworkIndicatorLevel", this.levelHandler);
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
    onCopySuccess() {
      Message({
        message: "复制成功",
        type: "success",
      });
    },
    onCopyError() {
      console.log("errro");
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
    isOnhold(){
      console.log('this.holdInfo.isOnhold',this.holdInfo.isOnhold)
      return this.holdInfo.isOnhold
    }
  },
  watch: {
    visible: function (val) {
      this.toolbarStore.canHidden = !val;
    },
  },
};
</script>

<style scoped lang="scss">
@import "../../../style/var.scss";

.meeting-header {
  width: 100%;
  height: 30px;
  text-align: center;
  color: #e7e7e7;
  background: $toolbar-bg-color;
  font-size: 13px;
  z-index: 1001;
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
    background: url("../../../style/img/icon_encrypt.png") no-repeat;
    background-size: 100% 100%;
    cursor: pointer;
    -webkit-app-region: no-drag;
    margin-right: 10px;

    &:hover {
      background: url("../../../style/img/icon_encrypt_hover.png")
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
  width: 360px;
  height: 80px;
  top: 26px !important;
  z-index: 999;
  background: #ffffff;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.26);
  font-size: 12px;
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
    background: url("../../../style/img/signal/signal_#{$type}.png") no-repeat;
    background-size: 100% 100%;
  }
}
</style>
