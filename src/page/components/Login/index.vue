<script setup>
import { onMounted, ref, defineEmits, defineProps, computed, toRef } from "vue";
import xyRTC from "@/utils/xyRTC";
import { ipcRenderer } from "electron";
import Store from "electron-store";
import { DEFAULT_PROXY } from "@/config";
import { useCallStateStore } from "@/store/index";
import { ElMessage } from "element-plus";
import "./index.scss";

// 静态数据
const store = new Store();

const proxy = store.get("xyHttpProxy") || DEFAULT_PROXY;
const env = String(proxy).split(".")[0] || "cloud";

const modelList = [
  {
    value: "AUTO",
    label: "自动布局",
  },
  {
    value: "CUSTOM",
    label: "自定义布局",
  },
];
// 响应式数据

const emitUpdate = defineEmits(["toggleProxyModal", "update:model"]);
const props = defineProps(["info", "model"]);

// https://stackoverflow.com/questions/64926354/vue-3-watch-doesn-t-work-if-i-watch-a-destructured-prop
// eslint-disable-next-line vue/no-setup-props-destructure
const info = props.info;
const modelRef = toRef(props, "model");

const callStateStore = useCallStateStore();

const versionRef = ref("");

const callState = computed(() => {
  return callStateStore.callState;
});

onMounted(() => {
  versionRef.value = xyRTC.getVersion();
});

const toggleProxyModal = () => {
  emitUpdate("toggleProxyModal");
};

const switchModel = (val) => {
  console.log("val: ", val);
  store.set("xyLayoutModel", val);
  emitUpdate("update:model", val);
  ipcRenderer.send("relaunch", val);
};

const externalLogin = () => {
  const { extID, extUserId, displayName } = info;

  // displayName中文在mac上可能会导致乱码，需要转成UTF-8
  xyRTC.loginExternalAccount(extID, extUserId, encodeURI(displayName));
};

const onLogout = () => {
  xyRTC.logout();
};

const makeCall = () => {
  // 登录&连接服务器成功，可以入会
  const { meeting, meetingName } = info;

  if (!meeting || !meetingName) {
    ElMessage("请填写入会信息");
    return;
  }

  ipcRenderer.send("check-device-access-privilege");
};
</script>
<template>
  <div>
    <div class="login">
      <span class="version">version: {{ versionRef }}</span>
      <h1 class="xy__demo-title">XY ELECTRON DEV</h1>
      <div class="xy__demo-line">
        <div>
          <span>{{ env }} 环境</span>
          <span @click="toggleProxyModal" class="xy_setting"> [设置] </span>
        </div>
        <div :style="{ marginLeft: '20px' }">
          <span>布局模式：</span>
          <el-select v-model="modelRef" @change="switchModel">
            <el-option
              v-for="item in modelList"
              :value="item.value"
              :key="item.value"
              :label="item.label"
            />
          </el-select>
        </div>
      </div>

      <el-row v-if="callState === 'externalLogin'" justify="center">
        <el-input
          class="text"
          placeholder="extID"
          v-model="info.extID"
          clearable
        ></el-input>

        <el-input
          class="text"
          placeholder="extUserId"
          v-model="info.extUserId"
          clearable
        ></el-input>

        <el-input
          class="text"
          placeholder="displayName"
          v-model="info.displayName"
          clearable
        ></el-input>
        <div>
          <el-button type="primary" @click="externalLogin"
            >第三方登录</el-button
          >
        </div>
      </el-row>

      <el-row v-if="callState === 'logined'" justify="center">
        <el-input
          class="text"
          placeholder="会议号"
          v-model="info.meeting"
          clearable
        ></el-input>

        <el-input
          class="text"
          placeholder="入会密码"
          v-model="info.meetingPassword"
          clearable
        ></el-input>

        <el-input
          class="text"
          placeholder="入会昵称"
          v-model="info.meetingName"
          clearable
        ></el-input>

        <div class="text">
          <el-checkbox v-model="info.video">开启摄像头</el-checkbox>
          <el-checkbox v-model="info.audio">开启麦克风</el-checkbox>
        </div>
        <div>
          <el-button class="xy__login-btn" type="primary" @click="makeCall"
            >呼叫</el-button
          >
        </div>
        <div>
          <span class="login-type" @click="onLogout">注销</span>
        </div>
      </el-row>
    </div>
  </div>
</template>
