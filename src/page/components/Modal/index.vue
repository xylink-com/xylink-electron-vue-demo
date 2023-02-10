<template>
  <el-dialog
    title="设置"
    class="xy__setting-dialog"
    :model-value="visible"
    :before-close="handleCancel"
  >
    <el-row class="mb15">
      <el-col :span="4" class="center">
        <span>代理地址</span>
      </el-col>
      <el-col :span="16">
        <el-input
          class="text"
          placeholder="Input Proxy..."
          v-model="proxy"
          clearable
          :style="{ width: '300px' }"
        />
      </el-col>
      <el-col :span="4">
        <el-button link @click="handleOk"> 设置 </el-button>
      </el-col>
    </el-row>
    <Device/>
  </el-dialog>
</template>
<script>
import Device from './device.vue'
const DEFAULT_DEVICE = {
  camera: "",
  microphone: "",
  speaker: "",
};
export default {
  props: ["visible", "value"],
  data() {
    return {
      proxy: this.value,
      cameraList: [],
      microphoneList: [],
      speakerList: [],
      selectedDevice: DEFAULT_DEVICE,
      selectedDeviceRef: DEFAULT_DEVICE,
    };
  },
  emits:['cancel','ok'],
  components:{
    Device
  },
  methods: {
    handleCancel() {
      this.$emit("cancel");
    },
    handleOk() {
      if (this.value !== this.proxy) {
        this.$emit("ok", this.proxy);
      } else {
        this.handleCancel();
      }
    },
  },
};
</script>
<style scoped>
.center {
  display: flex !important;
  align-items: center;
  height: 40px;
}

.mb15 {
  margin-bottom: 15px;
}

.el-row {
  max-width: 500px;
  margin: 0 auto 20px;
}

.xy-row {
  margin: 0;
}

.xy__setting-dialog .el-row .text {
  margin-bottom: 0;
}

.dialog-footer {
  text-align: right;
}

.el-dialog__body {
  padding: 0 20px;
}

.el-message {
  max-width: 300px !important;
  min-width: 100px !important;
}

.xy__login-btn.el-button--primary {
  margin-bottom: 20px;
}
</style>
