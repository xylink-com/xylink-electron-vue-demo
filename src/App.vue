<template>
  <div id="app">
    <div class="container">
      <el-dialog
        title="修改代理"
        :visible="visible"
        width="350"
        :before-close="toggleProxyModal"
      >
        <el-row class="xy-row">
          <el-input
            class="text"
            placeholder="Input Proxy..."
            v-model="proxy"
            clearable
          ></el-input>
        </el-row>
        <div class="dialog-footer">
          <el-button @click="toggleProxyModal">取消</el-button>
          <el-button type="primary" @click="settingProxy">确定</el-button>
        </div>
      </el-dialog>

      <div>
        <div class="login">
          <span class="version">version: {{ version }}</span>
          <h1 class="xy__demo-title">XY ELECTRON DEV</h1>
          <h3 class="xy__demo-title">
            <span>{{ env }} 环境</span>
            <span @click="toggleProxyModal" class="xy_setting">
              [设置]
            </span>
          </h3>

          <el-row v-if="status === 'externalLogin'">
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
            <el-button type="primary" @click="externalLogin"
              >第三方登录</el-button
            >
          </el-row>

          <el-row v-if="status === 'logined'">
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

      <div class="loading" v-if="status === 'calling'">
        <div class="loading-content">
          <div class="avatar">
            <img
              src="https://cdn.xylink.com/wechatMP/images/device_cm_ios%402x.png"
              alt="nemo-avatar"
            />
          </div>
          <div class="name">正在呼叫</div>
          <div class="stop" @click="hangup">
            <img src="./style/img/end-call.png" alt="end-call" />
          </div>
          <audio autoPlay loop src="./style/ring.ogg"></audio>
        </div>
      </div>

      <div v-if="status === 'meeting'">
        <div class="meeting-header">
          <span>{{ info.meeting }}</span>
        </div>

        <div class="meeting-content">
          <div class="meeting-layout" :style="layoutStyle">
            <Video
              v-for="val in layoutList"
              :key="val.key"
              :index="val.key"
              :width="val.position.width"
              :height="val.position.height"
              :item="val"
              :xyRTC="xyRTC"
            ></Video>
          </div>
        </div>

        <div class="meeting-footer">
          <div class="middle">
            <div @click="switchLayout" class="button layout">
              <div class="icon"></div>
              <div class="title">窗口布局</div>
            </div>

            <div
              v-if="shareContentStatus === 1"
              @click="stopShareContent"
              class="button share"
            >
              <div class="icon"></div>
              <div class="title">结束共享</div>
            </div>
            <div v-else @click="shareContent" class="button share">
              <div class="icon"></div>
              <div class="title">共享</div>
            </div>

            <div @click="videoOperate" :class="videoOperateClass">
              <div class="icon"></div>
              <div class="title">
                {{ video === "unmuteVideo" ? "关闭摄像头" : "开启摄像头" }}
              </div>
            </div>

            <div @click="audioOperate" :class="audioStatus.className">
              <div class="icon"></div>
              <div class="aec" v-if="audio === 'unmute'">
                <div class="aec_content" style="transform: translateY(-0%)" />
              </div>

              <div class="title">{{ audioStatus.status }}</div>
            </div>
          </div>
          <div class="right">
            <div class="button end_call" @click="hangup">
              <div class="icon"></div>
              <div class="title">挂断</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { XYRTC } from "@xylink/xy-electron-sdk";
import Store from "electron-store";
import { ipcRenderer } from "electron";
import { USER_INFO, DEFAULT_PROXY } from "./utils/enum";
import { Message } from "element-ui";
import cloneDeep from "clone-deep";
import Video from "./components/Video/index.vue";

const store = new Store();
let xyRTC;

const message = {
  info: (message) => {
    Message.success({ message, duration: 2000, center: true });
  },
};
const proxy = store.get("xyHttpProxy") || DEFAULT_PROXY;
const env = String(proxy).split(".")[0] || "cloud";

export default {
  name: "App",
  components: { Video },
  data() {
    return {
      version: "",
      env,
      proxy,
      visible: false,
      info: store.get("xyUserInfo") || USER_INFO,
      screenInfo: {
        layoutWidth: 0,
        layoutHeight: 0,
      },
      // xyLogin/externalLogin/logined/calling/meeting
      status: "externalLogin",
      layout: [],
      audio: "unmute",
      video: "unmuteVideo",
      disableAudio: false,
      shareContentStatus: 0,
      setting: false,
    };
  },
  computed: {
    xyRTC() {
      return xyRTC;
    },
    layoutList() {
      const newLayoutList = this.layout.map((val) => {
        const { isContent, callUri } = val.roster;
        const mediagroupid = isContent ? 1 : 0;
        // 记录key值，此值必须为callUri + mediagroupId之加，否则，无法判断是content还是people设备
        const key = callUri + mediagroupid;
        const { height, left, top, width } = val.positionStyle;
        // 将对象style重写为string style样式，方式给vue使用
        const positionStyle = `left: ${left}; top: ${top}; height: ${height}; width: ${width}`;

        return {
          ...val,
          key,
          positionStyle,
        };
      });

      return newLayoutList;
    },
    layoutStyle() {
      const { layoutWidth, layoutHeight } = this.screenInfo;
      const layoutStyle = `width:${layoutWidth}px; height:${layoutHeight}px`;

      return layoutStyle;
    },
    videoOperateClass() {
      let classList = "button ";

      classList += this.video === "unmuteVideo" ? "camera" : "mute_camera";

      return classList;
    },
    audioStatus() {
      const audioClass = this.audio === "unmute" ? "mic_aec" : "mute_mic";
      let disabledMute = "";

      let audioStatus = "静音";

      if (this.audio === "unmute") {
        audioStatus = "静音";
      } else if (this.audio === "mute" && this.disableAudio) {
        audioStatus = "强制静音";

        disabledMute = "disabled_mute";
      } else if (this.audio === "mute" && !this.disableAudio) {
        audioStatus = "取消静音";
      }

      const className = `button ${audioClass} ${disabledMute}`;

      return {
        status: audioStatus,
        className,
      };
    },
  },
  mounted() {
    xyRTC = XYRTC.getXYInstance({
      httpProxy: proxy,
      model: "auto",
    });

    const version = xyRTC.getVersion();

    this.version = version;

    // call status event
    xyRTC.on("CallState", (e) => {
      const { state, reason } = e;

      if (state === "Connected") {
        if (status !== "meeting") {
          // start render
          this.status = "meeting";

          message.info("入会成功");
        }
      } else if (state === "Disconnected") {
        message.info(reason);
        this.hangup();
      } else if (state === "Connecting" || state === "Disconnecting") {
        return;
      }
    });

    // login status event
    xyRTC.on("LoginState", (e) => {
      if (e.state === "Logined") {
        message.info("登录成功");

        this.status = "logined";
      } else if (e.state === "Logouted") {
        if (e.error === 1013 || e.error === 1014 || e.error === 1031) {
          message.info("用户名或密码错误");
        } else if (e.error === 1030) {
          message.info("密码验证超时");
        } else {
          message.info("注销成功");
        }

        this.status = "externalLogin";
      }
    });

    // video streams change event
    xyRTC.on("VideoStreams", (e) => {
      this.layout = cloneDeep(e);
    });

    // screen size change event
    xyRTC.on("ScreenInfo", (e) => {
      this.screenInfo = e;
    });

    // content status event
    xyRTC.on("ContentState", (e) => {
      if (e === 1) {
        message.info(`您正在分享Content内容`);
      } else if (e === 0) {
        message.info(`已结束分享内容`);
      }

      this.shareContentStatus = e;
    });
  },
  methods: {
    logout() {
      xyRTC.logout();
    },
    settingProxy() {
      store.set("xyHttpProxy", this.proxy);
      ipcRenderer.send("relaunch", this.proxy);

      this.visible = false;
    },
    toggleProxyModal() {
      this.visible = !this.visible;
    },
    externalLogin() {
      const { extID, extUserId, displayName } = this.info;

      xyRTC.loginExternalAccount(extID, extUserId, displayName);
    },
    onLogout() {
      xyRTC.logout();
    },
    makeCall() {
      // 登录&连接服务器成功，可以入会
      const { meeting, meetingPassword, meetingName } = this.info;

      if (!meeting || !meetingName) {
        message.info("请填写入会信息");
        return;
      }

      const result = xyRTC.makeCall(meeting, meetingPassword, meetingName);

      if (result.code === 3002) {
        message.info("请登录后发起呼叫");
      } else {
        this.status = "calling";
      }
    },
    hangup() {
      this.audio = "unmute";
      this.video = "unmuteVideo";
      this.status = "logined";

      xyRTC.endCall();
    },
    switchLayout() {
      xyRTC.switchLayout();
    },
    stopShareContent() {
      xyRTC.stopSendContent();
    },
    shareContent() {
      xyRTC.startSendContent();
    },
    audioOperate() {
      if (this.audio === "unmute") {
        this.audio = "mute";
        message.info("麦克风已静音");

        xyRTC.muteMic(true);
      } else {
        this.audio = "unmute";
        xyRTC.muteMic(false);
      }
    },
    videoOperate() {
      if (this.video === "unmuteVideo") {
        this.video = "muteVideo";

        xyRTC.muteCamera(true);
      } else {
        this.video = "unmuteVideo";
        xyRTC.muteCamera(false);
      }
    },
  },
  watch: {
    info: {
      handler(newValue) {
        store.set("xyUserInfo", newValue);
      },
      deep: true,
    },
  },
};
</script>

<style>
.el-row {
  max-width: 500px;
  margin: 30px auto 20px;
}

.xy-row {
  margin: 0;
}

.el-row .text,
.xy-row .text {
  margin-bottom: 15px;
}

.dialog-footer {
  text-align: right;
}

.el-dialog__body {
  padding: 20px;
}

.el-message {
  max-width: 300px !important;
  min-width: 100px !important;
}

.xy__login-btn.el-button--primary {
  margin-bottom: 20px;
}
</style>
