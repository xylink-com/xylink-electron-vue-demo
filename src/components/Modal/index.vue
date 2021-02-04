<template>
  <el-dialog
    title="设置"
    custom-class="xy__setting-dialog"
    :visible="visible"
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
        <el-button type="text" @click="handleOk"> 设置 </el-button>
      </el-col>
    </el-row>

    <el-row class="mb15">
      <el-col :span="4" class="center">
        <span>摄像头</span>
      </el-col>
      <el-col :span="20">
        <el-select
          :style="{ width: '300px' }"
          v-model="selectedDevice.camera"
          @select="onSelectCamera"
        >
          <el-option
            v-for="item in cameraList"
            :key="item.devId"
            :value="item.devId"
          >
            {{ item.devName }}
          </el-option>
        </el-select>
      </el-col>
    </el-row>

    <el-row class="mb15">
      <el-col :span="4" class="center">
        <span>麦克风</span>
      </el-col>
      <el-col :span="20">
        <el-select
          :style="{ width: '300px' }"
          v-model="selectedDevice.microphone"
          @select="onSelectMicrophone"
        >
          <el-option
            v-for="item in microphoneList"
            :key="item.devId"
            :value="item.devId"
          >
            {{ item.devName }}
          </el-option>
        </el-select>
      </el-col>
    </el-row>

    <el-row class="mb15">
      <el-col :span="4" class="center">
        <span>扬声器</span>
      </el-col>
      <el-col :span="20">
        <el-select
          :style="{ width: '300px' }"
          v-model="selectedDevice.speaker"
          @select="onSelectSpeaker"
        >
          <el-option
            v-for="item in speakerList"
            :key="item.devId"
            :value="item.devId"
          >
            {{ item.devName }}
          </el-option>
        </el-select>
      </el-col>
    </el-row>

    <div class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleOk">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>
const DEFAULT_DEVICE = {
  camera: "",
  microphone: "",
  speaker: "",
};
export default {
  props: ["visible", "value", "xyRTC", "deviceChangeType"],
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
  mounted() {
    this.updateDevices();
  },
  methods: {
    handleCancel() {
      this.$emit("Cancel");
    },
    handleOk() {
      if (this.value !== this.proxy) {
        this.$emit("Ok", this.proxy);
      } else {
        this.handleCancel();
      }
    },
    async updateDevices() {
      await this.updateCameraDevices();
      await this.updateMicrophoneDevices();
      await this.updateSpeakerDevices();

      this.selectedDevice = this.selectedDeviceRef;
    },
    async updateCameraDevices() {
      if (!this.xyRTC) {
        return;
      }

      const camera = await this.xyRTC.getDeviceList("camera");
    
      const selectedId = this.updateSelectedDevice(camera);

      this.cameraList = camera;

      if (selectedId !== this.selectedDevice.camera) {
        this.onSwitchCamera(selectedId);
      }

      this.selectedDeviceRef = {
        ...this.selectedDeviceRef,
        camera: selectedId,
      };
    },

    async updateMicrophoneDevices() {
      if (!this.xyRTC) {
        return;
      }

      const microphone = await this.xyRTC.getDeviceList("microphone");
      const selectedId = this.updateSelectedDevice(microphone);

      this.microphoneList = microphone;

      if (selectedId !== this.selectedDevice.microphone) {
        this.onSwitchMicrophone(selectedId);
      }

      this.selectedDeviceRef = {
        ...this.selectedDeviceRef,
        microphone: selectedId,
      };
    },

    async updateSpeakerDevices() {
      if (!this.xyRTC) {
        return;
      }

      const speaker = await this.xyRTC.getDeviceList("speaker");
      const selectedId = this.updateSelectedDevice(speaker);

      this.speakerList = speaker;

      if (selectedId !== this.selectedDevice.speaker) {
        this.onSwitchSpeaker(selectedId);
      }

      this.selectedDeviceRef = {
        ...this.selectedDeviceRef,
        speaker: selectedId,
      };
    },

    updateSelectedDevice(list) {
      let selectedId = "";
      const selectedDevice = list.filter((item) => item.isSelected);

      if (selectedDevice.length > 0) {
        selectedId = selectedDevice[0].devId;
      } else if (list.length > 0) {
        selectedId = list[0].devId;
      }

      return selectedId;
    },

    async onSwitchCamera(val) {
      try {
        await this.xyRTC.switchDevice("camera", val);
      } catch (err) {
        console.log("switch camera device error: ", err);
      }
    },

    async onSwitchMicrophone(val) {
      try {
        await this.xyRTC.switchDevice("microphone", val);
      } catch (err) {
        console.log("switch microphone device error: ", err);
      }
    },

    async onSwitchSpeaker(val) {
      try {
        await this.xyRTC.switchDevice("speaker", val);
      } catch (err) {
        console.log("switch speaker device error: ", err);
      }
    },

    async onSelectCamera(val) {
      this.selectedDevice = {
        ...this.selectedDevice,
        camera: val,
      };

      this.onSwitchCamera(val);
    },

    async onSelectMicrophone(val) {
      this.selectedDevice = {
        ...this.selectedDevice,
        microphone: val,
      };

      this.onSwitchMicrophone(val);
    },

    async onSelectSpeaker(val) {
      this.selectedDevice = {
        ...this.selectedDevice,
        speaker: val,
      };

      this.onSwitchSpeaker(val);
    },
  },
  watch: {
    visible:{
      handler(newValue){
        if(newValue){
          this.updateDevices();
        }
      }
    }
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