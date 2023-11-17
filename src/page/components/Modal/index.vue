<template>
  <el-dialog
    title="设置"
    class="xy__setting-dialog"
    :model-value="visible"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    :before-close="handleCancel"
  >
    <el-tabs tab-position="left">
      <el-tab-pane label="通用设置">
        <CommonSetting
          @ok="handleOk"
          :proxy="value"
          @cancel="handleCancel"
          :dialogVisible="modalVisible"
        />
      </el-tab-pane>
      <el-tab-pane label="虚拟背景和美颜">
        <VideoEffect />
    </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>
<script>
import CommonSetting from './CommonSetting';
import VideoEffect from './VideoEffect';
import { initVideoEffect } from '@/utils/initVideoEffect';

export default {
  props: ["visible", "value", "modalVisible"],
  emits:['cancel', 'ok'],
  components:{
    VideoEffect,
    CommonSetting,
  },
  beforeMount() {
    initVideoEffect.init();
  },
  methods: {
    handleCancel() {
      this.$emit("cancel");
    },

    handleOk(value) {
      this.$emit("ok", value);
    }
  },
};
</script>
<style scoped>

.xy__setting-dialog .el-row .text {
  margin-bottom: 0;
}

.dialog-footer {
  text-align: right;
}

.el-message {
  max-width: 300px !important;
  min-width: 100px !important;
}

.xy__login-btn.el-button--primary {
  margin-bottom: 20px;
}
</style>

<style lang="scss">
  .xy__setting-dialog .el-dialog__body {
    padding: 0;
    height: 66vh;

    .el-tabs--left {
      height: 100%;
    }
  }
</style>
