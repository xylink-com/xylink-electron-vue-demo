<template>
  <div id="app">
    <div class="container">
      <SettingModal
        :visible="visible"
        :xyRTC="xyRTC"
        :value="proxy"
        :deviceChangeType="deviceChangeType"
        @Cancel="toggleProxyModal"
        @Ok="onSettingProxy"
      />

      <div>
        <div class="login">
          <span class="version">version: {{ version }}</span>
          <h1 class="xy__demo-title">XY ELECTRON DEV</h1>
          <div class="xy__demo-line">
            <div>
              <span>{{ env }} 环境</span>
              <span @click="toggleProxyModal" class="xy_setting"> [设置] </span>
            </div>
            <div :style="{ marginLeft: '20px' }">
              <span>布局模式：</span>
              <el-select v-model="model" @change="switchModel">
                <el-option
                  v-for="item in modelList"
                  :value="item.value"
                  :key="item.value"
                  :label="item.label"
                />
              </el-select>
            </div>
          </div>

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
            <img src="../style/img/end-call.png" alt="end-call" />
          </div>
          <audio autoPlay loop src="../style/ring.ogg"></audio>
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
              :item="val"
              :xyRTC="xyRTC"
            ></Video>
          </div>
        </div>

        <div class="meeting-footer">
          <div class="middle">
            <div @click="switchPage('previous')" class="button layout">
              <div className="icon"></div>
              <div className="title">上一页（{{ pageInfo.currentPage }}）</div>
            </div>

            <div @click="switchPage('next')" class="button layout">
              <div class="icon"></div>
              <div class="title">下一页</div>
            </div>

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
                <div
                  class="aec_content"
                  :style="{ transform: `translateY(-${micLevel}%)` }"
                />
              </div>

              <div class="title">{{ audioStatus.status }}</div>
            </div>

            <div @click="toggleProxyModal" class="button setting">
              <div class="icon"></div>
              <div class="title">设置</div>
            </div>
            <div @click="sendExternalMsg" class="button setting">
              <div class="icon"></div>
              <div class="title">
                {{ isExternal ? "关闭外接" : "打开外接" }}
              </div>
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
import { ipcRenderer, remote } from "electron";
import { USER_INFO, DEFAULT_PROXY } from "../utils/enum";
import { TEMPLATE } from "../utils/template";
import { getScreenInfo } from "../utils/index";
import { Message } from "element-ui";
import cloneDeep from "clone-deep";
import Video from "./components/Video/index.vue";
import SettingModal from "./components/Modal/index.vue";

const store = new Store();

const message = {
  info: (message) => {
    Message.success({ message, duration: 2000, center: true });
  },
};
const proxy = store.get("xyHttpProxy") || DEFAULT_PROXY;
const env = String(proxy).split(".")[0] || "cloud";
const MODEL = store.get("xyLayoutModel") || "custom";

const maxSize = 4;
const defaultPageInfo = {
  currentPage: 0,
  // 建议每页请求8位以下的数据，如果设定的值大于8位，那么SDK会自动截断至8位
  totalPage: 0,
  maxSize,
};

export default {
  name: "App",
  components: { Video, SettingModal },
  data() {
    return {
      version: "",
      env,
      proxy,
      visible: false,
      info: store.get("xyUserInfo") || USER_INFO,
      xyRTC: null,
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
      model: MODEL,
      modelList: [
        {
          value: "auto",
          label: "自动布局",
        },
        {
          value: "custom",
          label: "自定义布局",
        },
      ],
      micLevel: 0,
      deviceChangeType: "",
      pageInfo: defaultPageInfo,
      cachePageInfo: defaultPageInfo,
      cacheConfInfo: {
        contentPartCount: 0,
        participantCount: 0,
        chairManUrl: "",
      },
      isExternal: false, // 是否已经打开了外接屏幕
    };
  },
  computed: {
    layoutList() {
      const localLayout = this.isExternal ? [] : this.layout;

      const newLayoutList = localLayout.map((val) => {
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
    this.xyRTC = XYRTC.getXYInstance({
      httpProxy: proxy,
      model: this.model,
    });

    const version = this.xyRTC.getVersion();

    this.version = version;

    // call status event
    this.xyRTC.on("CallState", (e) => {
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
    this.xyRTC.on("LoginState", (e) => {
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
    this.xyRTC.on("VideoStreams", (e) => {
      if (this.model === "custom") {
        // 每次推送都会携带local数据，如果分页不需要展示，则移除local数据
        if (this.cachePageInfo.currentPage !== 0) {
          const localIndex = e.findIndex(
            (item) => item.sourceId === "LocalPreviewID"
          );

          if (localIndex >= 0) {
            e.splice(localIndex, 1);
          }
        }

        const nextTemplateRate = TEMPLATE.GALLERY.rate[e.length] || 0.5625;
        // 此处无id是container的容器，则使用document.body的size计算screen
        this.cacheScreenInfo = getScreenInfo("app", nextTemplateRate, [92, 0]);

        const nextLayout = this.calculateBaseLayoutList(e);

        this.layout = nextLayout;
      } else {
        this.layout = cloneDeep(e);
      }

      ipcRenderer.send("externalLayout", {
        layout: this.layout,
      });
    });

    this.xyRTC.on("KickOut", (e) => {
      console.log("demo get kick out message: ", e);
      const errorMap = {
        4000: "多个重复长连接建立",
        4001: "用户在另一台设备登录",
        4003: "登录过期",
      };

      this.onLogout();

      message.info(`账号异常：${errorMap[e] || "未知异常，重新登录"}`);
    });

    // screen size change event
    this.xyRTC.on("ScreenInfo", (e) => {
      this.screenInfo = e;
    });

    // content status event
    this.xyRTC.on("ContentState", (e) => {
      if (e === 1) {
        message.info(`您正在分享Content内容`);
      } else if (e === 0) {
        message.info(`已结束分享内容`);
      }

      this.shareContentStatus = e;
    });

    // 实时获取麦克风声量大小（0-100）
    this.xyRTC.on("MicEnergyReported", (value) => {
      this.micLevel = value;
    });

    // 麦克风/摄像头设备变化事件
    this.xyRTC.on("MediaDeviceEvent", (value) => {
      console.log("device change type:", value);
      this.deviceChangeType = value;
    });

    // 会议控制消息
    // 可以通过此消息获取：会控播放地址/主会场callUri/麦克风状态/是否是强制静音麦克风
    // 自定义布局模式下，主会场callUri需要记录下来，后续requestLayout计算需要使用
    this.xyRTC.on("ConfControl", (e) => {
      console.log("metting control message: ", e);

      const { disableMute, muteMic } = e;
      this.disableAudio = disableMute;
      if (muteMic === "mute") {
        this.audio = "mute";
      } else if (muteMic === "unmute") {
        this.audio = "unmute";
      }
    });

    // 会议信息发生变化，会推送此消息，开始计算请求layout
    this.xyRTC.on("ConfInfoChanged", (e) => {
      console.log("react conf info change:", e);

      if (this.model === "auto") {
        // 自动布局内部计算了layout请流，不需要外部处理
        return;
      }

      const { participantCount, contentPartCount } = e;
      this.cacheConfInfo = e;

      const { maxSize } = this.cachePageInfo;
      // 会议产生变动，那么就重新计算总页数
      // participantCount + contentPartCount 代表people + content的总个数
      let totalPage = Math.ceil(
        (participantCount + contentPartCount) / maxSize
      );
      totalPage = totalPage > 0 ? totalPage : 0;

      const nextPageInfo = { ...this.cachePageInfo };

      nextPageInfo.totalPage = totalPage;

      // 如果当前的页码大于最新最大的页码，就更新到最后一页
      if (nextPageInfo.currentPage > totalPage) {
        nextPageInfo.currentPage = totalPage;
      }

      console.log("next page info: ", nextPageInfo);

      // 缓存页码信息
      this.cachePageInfo = nextPageInfo;

      this.startRequestLayout();
    });

    // 监听外屏窗口是否已经关闭
    ipcRenderer.on("closedExternalWindow", (event, msg) => {
      if (msg) {
        this.isExternal = false;
        remote.getGlobal("sharedObject").videoFrames = {};
        this.xyRTC.stopExternal();
      }
    });
  },
  methods: {
    logout() {
      this.xyRTC.logout();
    },
    onSettingProxy(value) {
      store.set("xyHttpProxy", value);
      ipcRenderer.send("relaunch", proxy);

      this.toggleProxyModal();
    },
    toggleProxyModal() {
      this.visible = !this.visible;
    },
    externalLogin() {
      const { extID, extUserId, displayName } = this.info;

      this.xyRTC.loginExternalAccount(extID, extUserId, displayName);
    },
    onLogout() {
      this.xyRTC.logout();
    },
    makeCall() {
      // 登录&连接服务器成功，可以入会
      const { meeting, meetingPassword, meetingName } = this.info;

      if (!meeting || !meetingName) {
        message.info("请填写入会信息");
        return;
      }

      const result = this.xyRTC.makeCall(meeting, meetingPassword, meetingName);

      if (result.code === 3002) {
        message.info("请登录后发起呼叫");
      } else {
        this.status = "calling";
      }
    },
    hangup() {
      // 挂断会议时，关闭外接屏
      if (this.isExternal) {
        ipcRenderer.send("closeExternalWindow", true);
        this.isExternal = false;
      }

      this.audio = "unmute";
      this.video = "unmuteVideo";
      this.status = "logined";

      this.xyRTC.endCall();
    },
    async switchLayout() {
      try {
        const result = await this.xyRTC.switchLayout();

        console.log("result: ", result);
      } catch (err) {
        console.log("err: ", err);
        message.info(err?.msg || "切换失败");
      }
    },
    stopShareContent() {
      this.xyRTC.stopSendContent();
    },
    shareContent() {
      this.xyRTC.startSendContent();
    },
    audioOperate() {
      if (this.audio === "mute" && this.disableAudio) {
        return;
      }

      if (this.audio === "unmute") {
        this.audio = "mute";
        message.info("麦克风已静音");

        this.xyRTC.muteMic(true);
      } else {
        this.audio = "unmute";
        this.xyRTC.muteMic(false);
      }
    },
    videoOperate() {
      if (this.video === "unmuteVideo") {
        this.video = "muteVideo";

        this.xyRTC.muteCamera(true);
      } else {
        this.video = "unmuteVideo";
        this.xyRTC.muteCamera(false);
      }
    },
    switchModel(val) {
      console.log("val: ", val);
      store.set("xyLayoutModel", val);
      this.model = val;
      ipcRenderer.send("relaunch", val);
    },
    calculateBaseLayoutList(list) {
      const { rateHeight, rateWidth } = this.cacheScreenInfo;

      this.screenInfo = {
        layoutHeight: rateHeight,
        layoutWidth: rateWidth,
      };

      let positionStyle = {
        left: "0px",
        top: "0px",
        width: "0px",
        height: "0px",
      };
      const positionInfo = TEMPLATE.GALLERY.temp[list.length];

      const layoutList = list.map((item, index) => {
        const [x, y, w, h] = positionInfo[index].position;
        let layoutX = Math.round(rateWidth * x);
        let layoutY = Math.round(rateHeight * y);
        let layoutWidth = Math.round(rateWidth * w);
        let layoutHeight = Math.round(rateHeight * h);

        positionStyle = {
          left: `${layoutX}px`,
          top: `${layoutY}px`,
          width: `${layoutWidth}px`,
          height: `${layoutHeight}px`,
        };

        const position = {
          width: layoutWidth,
          height: layoutHeight,
        };

        return { ...item, positionStyle, position };
      });

      return layoutList;
    },
    startRequestLayout() {
      console.log("request layout cacheConfInfo: ", this.cacheConfInfo);

      // resolution: 0:90, 1: 180, 2:360, 3: 720, 4: 1080
      // quality: 0: low, 1: normal, 2: high
      const {
        contentPartCount = 0,
        participantCount = 0,
        chairManUrl = "",
      } = this.cacheConfInfo;
      const { maxSize, currentPage } = this.cachePageInfo;
      const reqList = [];
      // 存在主会场，那么需要指定callUri字段
      // 如果有content，那么content会上大屏，分辨率请高一些
      // 如果无content，那么content可以请高分辨率的
      // 第0页请求主会场数据，其他分页数据请求people数据
      if (chairManUrl && currentPage === 0) {
        reqList.push({
          isContent: false,
          callUri: chairManUrl,
          resolution: contentPartCount ? 2 : 3,
          quality: 1,
        });
      }

      // 如果有分享content，那么就请高分辨率的content画面
      // callUri可以无需指定
      if (contentPartCount > 0 && currentPage === 0) {
        reqList.push({
          isContent: true,
          callUri: "",
          resolution: 4,
          quality: 2,
        });
      }

      // 如果participantCount的数据大于0，则说明会中有participantCount个人
      // 那么就基于participantCount来做分页请流
      // requestLayout需要指定三个参数：
      // @param reqList 请流列表
      // @param maxViewCount 每页最多可请求多少数据流，最大可设定位8位
      // @param pageIndex：页码，指定请求第几页数据
      if (participantCount > 0) {
        // 第0页和第1页是相同的数据，请求保持一致
        const page = currentPage - 1 <= 0 ? 0 : currentPage - 1;
        let i = page * maxSize;
        let endSize = (page + 1) * maxSize;
        // 如果最大的size大于成员总数，那么就以成员总数为结尾
        let realSize = participantCount >= endSize ? endSize : participantCount;

        for (i; i < realSize; i++) {
          if (reqList.length === 0 && currentPage === 0) {
            reqList.push({
              isContent: false,
              callUri: "",
              resolution: 3,
              quality: 1,
            });
          } else {
            reqList.push({
              isContent: false,
              callUri: "",
              resolution: 1,
              quality: 0,
            });
          }
        }
      }

      console.log("custom request layout: ", reqList);

      // 更新页码信息
      this.pageInfo = { ...this.cachePageInfo };

      this.xyRTC.requestLayout(reqList, maxSize, currentPage);
    },
    switchPage(type) {
      console.log("cachePageInfo: ", this.cachePageInfo);
      const { currentPage, totalPage } = this.cachePageInfo;
      let nextPage = currentPage;

      if (this.model === "auto") {
        message.info("自动布局不支持分页显示");
        return;
      }

      if (this.shareContentStatus === 1) {
        message.info("正在分享content，不允许分页");
        return;
      }

      if (type === "next") {
        if (currentPage + 1 > totalPage) {
          message.info("已经在最后一页啦");
          return;
        } else {
          nextPage = currentPage + 1;
        }

        // 缓存页码信息
        this.cachePageInfo.currentPage = nextPage;
      } else if (type === "previous") {
        if (currentPage - 1 < 0) {
          message.info("已经在首页啦");
          return;
        } else {
          nextPage = currentPage - 1;
        }

        // 缓存页码信息
        this.cachePageInfo.currentPage = nextPage;
      }

      console.log("switch paage: ", this.cachePageInfo);

      this.startRequestLayout();
    },
    sendExternalMsg() {
      if (!this.isExternal) {
        // 打开外接屏
        ipcRenderer.send("openWindow", {
          title: "外接屏幕",
        });
        // 监听页面是否加载完成
        ipcRenderer.on("domReady", (event, msg) => {
          if (msg) {
            this.isExternal = true;

            // 关闭原始屏的视频流渲染
            this.xyRTC.stopAllVideoRender();

            ipcRenderer.send("externalLayout", {
              layout: this.layout,
            });

            // 传递回调函数，在remote上设置sourceId对应的videoFrame
            this.xyRTC.startExternal(({ sourceId, videoFrame }) => {
              if (videoFrame && videoFrame.hasData) {
                const temp = remote.getGlobal("sharedObject").videoFrames;

                if (temp[sourceId]) {
                  remote.getGlobal("sharedObject").videoFrames[
                    sourceId
                  ] = videoFrame;
                } else {
                  remote.getGlobal("sharedObject").videoFrames = {
                    ...temp,
                    [sourceId]: {},
                  };
                }
              }
            });
          }
        });
        // 监听是否有外接屏
        ipcRenderer.on("secondWindow", (event, msg) => {
          if (!msg) {
            message.info("请连接外接屏");
          }
        });
      } else {
        ipcRenderer.send("closeExternalWindow", true);
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

.login .el-row .text,
.login .xy-row .text {
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
