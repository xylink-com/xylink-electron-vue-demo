<script setup>
import { reactive, onMounted, onBeforeUnmount } from "vue";
import xyRTC from "@/utils/xyRTC";
import './device.css'
import { useCallStateStore } from "@/store/index";

const callStateStore = useCallStateStore();

const deviceList = reactive({
  camera: [],
  microphone: [],
  speaker: [],
});

const selectDevice = reactive({
  camera: "",
  microphone: "",
  speaker: "",
});

const currentDeviceCallback = (currentDevice) => {
  console.log("currentDeviceCallback currentDevice: ", currentDevice);

  Object.keys(currentDevice).forEach((key) => {
    selectDevice[key] = currentDevice[key];
  });

   // 会外使用麦克风需要用户自己处理麦克风采集，设备更新需要重新捕获麦克风
   if(currentDevice.microphone && callStateStore.callState !== 'meeting'){
      xyRTC.startAudioCapture();
    }
};
const deviceCallback = (list) => {
  console.log("deviceCallback deviceList: ", list);

  Object.keys(list).forEach((key) => {
    deviceList[key] = list[key];
  });
};

onMounted(() => {
  xyRTC.getDeviceList().then((res) => {
    deviceList.camera = res.camera;
    deviceList.microphone = res.microphone;
    deviceList.speaker = res.speaker;
  });
  xyRTC.getCurrentDevice().then((res) => {
    selectDevice.camera = res.camera;
    selectDevice.microphone = res.microphone;
    selectDevice.speaker = res.speaker;
  });

  xyRTC.on("Device", deviceCallback);
  xyRTC.on("CurrentDevice", currentDeviceCallback);
  
  // 会外使用麦克风需要用户自己处理麦克风采集
  if(callStateStore.callState !== 'meeting'){
    xyRTC.startAudioCapture();
  }
});

onBeforeUnmount(() => {
  xyRTC.removeListener("Device", deviceCallback);
  xyRTC.removeListener("CurrentDevice", currentDeviceCallback);
  
  // 会外 离开此页面时，释放音频
  if(callStateStore.callState !== 'meeting'){
    xyRTC.stopAudioCapture();
  }
});

const switchDevice = (type, devId) => {
  console.log("demo switchDevice", type, devId);
  xyRTC.switchDevice(type, devId);
};
</script>
<template>
  <el-row class="mb15">
    <el-col :span="4" class="center">
      <span>摄像头</span>
    </el-col>
    <el-col :span="20">
      <el-select
        :style="{ width: '300px' }"
        v-model="selectDevice.camera"
        @change="(val)=>switchDevice('camera',val)"
      >
        <el-option
          v-for="item in deviceList.camera"
          :key="item.devId"
          :value="item.devId"
          :label="item.devName"
        />
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
        v-model="selectDevice.microphone"
        @change="(val)=>switchDevice('microphone',val)"
      >
        <el-option
          v-for="item in deviceList.microphone"
          :key="item.devId"
          :value="item.devId"
          :label="item.devName"
        />
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
        v-model="selectDevice.speaker"
        @change="(val)=>switchDevice('speaker',val)"
      >
        <el-option
          v-for="item in deviceList.speaker"
          :key="item.devId"
          :value="item.devId"
          :label="item.devName"
        />
      </el-select>
    </el-col>
  </el-row>
</template>
