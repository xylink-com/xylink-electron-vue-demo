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

          <el-row v-if="meetingStore.callState === 'externalLogin'">
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

          <el-row v-if="meetingStore.callState === 'logined'">
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

      <div class="loading" v-if="meetingStore.callState === 'calling'">
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

      <MeetingHeader
        v-if="meetingStore.callState === 'meeting'"
        :conferenceInfo="conferenceInfo"
        :holdInfo="holdInfo"
      />

      <div v-if="meetingStore.callState === 'meeting' && !holdInfo.isOnhold">
        <div class="meeting-content">
          <PromptInfo
            :recordPermission="recordPermission"
            :isRecordPaused="isRecordPaused"
            :recordStatus="recordStatus"
            :forceFullScreenId="forceFullScreenId"
            :setForceFullScreen="setForceFullScreen"
            :isLocalShareContent="shareContentStatus === 1"
            :chirmanUri="chirmanUri"
            :content="contentInfo"
          />

          <div class="meeting-layout" :style="layoutStyle">
            <Video
              v-for="val in layoutList"
              :key="val.key"
              :item="val"
              :xyRTC="xyRTC"
              :templateModel="templateModel"
              :toggleForceFullScreen="() => toggleForceFullScreen(val.id)"
            ></Video>
          </div>

          <Barrage
            v-if="subTitle.content && subTitle.action === 'push'"
            :subTitle="subTitle"
          />

          <InOutReminder :reminders="inOutReminders" />
        </div>

        <div class="meeting-footer">
          <div class="middle">
            <div @click="switchPage('previous')" class="button previous">
              <div class="icon"></div>
              <div class="title">上一页（{{ pageInfo.currentPage }}）</div>
            </div>

            <div @click="switchPage('next')" class="button next">
              <div class="icon"></div>
              <div class="title">下一页</div>
            </div>

            <div @click="switchLayout" class="button layout">
              <div class="icon"></div>
              <div class="title">窗口布局</div>
            </div>
            <div @click="openMeetingControlWin" class="button meeting_host">
              <div class="icon"></div>
              <div class="title">
                参会者({{ cacheConfInfo.visibleEpCount || 1 }})
              </div>
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

            <div @click="recordOperate" :class="recordStyle">
              <div class="icon"></div>
              <div class="title">
                {{ recordText }}
              </div>
            </div>

            <div
              @click="videoOperate"
              :class="videoOperateClass"
            >
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
            <More #more="{ closeMore }">
              <dl class="more-select" @click="closeMore">
                <dd @click="switchCallMode">
                  {{ callMode === "AudioOnly" ? "退出语音模式" : "语音模式" }}
                </dd>
                <NmberKeyBoard #keyBoardBtn="{ open }">
                  <dd @click="open">键盘</dd>
                </NmberKeyBoard>
                <!-- <dd @click="sendExternalMsg">
                  {{ isExternal ? "关闭外接" : "打开外接" }}
                </dd> -->
                <dd @click="toggleProxyModal">设置</dd>
              </dl>
            </More>
          </div>
          <div class="right">
            <div class="button end_call" @click="hangup">
              <div class="icon"></div>
              <div class="title">挂断</div>
            </div>
          </div>
        </div>
      </div>
      <Hold
        v-if="holdInfo.isOnhold"
        :conferenceInfo="conferenceInfo"
        :stopMeeting="hangup"
      />
    </div>
  </div>
</template>

<script>
// import { XYRTC } from "@xylink/xy-electron-sdk";
import XYRTC from "../utils/xyRTC";
import Store from "electron-store";
import { ipcRenderer, remote } from "electron";
import { USER_INFO, DEFAULT_PROXY, RECORD_STATE_MAP } from "../utils/enum";
import { TEMPLATE } from "../utils/template";
import { getScreenInfo } from "../utils/index";
import { Message } from "element-ui";
import cloneDeep from "clone-deep";
import Video from "./components/Video/index.vue";
import SettingModal from "./components/Modal/index.vue";
import InOutReminder from "./components/InOutReminder/index.vue";
import Barrage from "./components/Barrage/index.vue";
import PromptInfo from "./components/PromptInfo/index.vue";
import MeetingHeader from "./components/Header/index.vue";
import NmberKeyBoard from "./components/NumberKeyBoard/index.vue";
import Hold from "./components/Hold/index.vue";
import More from "./components/More/index.vue";
import { useCallStateStore } from "../store/index";
import path from "path";

const store = new Store();

const message = {
  info: (message) => {
    Message.success({ message, duration: 2000, center: true });
  },
};
const proxy = store.get("xyHttpProxy") || DEFAULT_PROXY;
const env = String(proxy).split(".")[0] || "cloud";
const MODEL = store.get("xyLayoutModel") || "CUSTOM";

const maxSize = 4;
const defaultPageInfo = {
  currentPage: 0,
  // 建议每页请求8位以下的数据，如果设定的值大于8位，那么SDK会自动截断至8位
  totalPage: 0,
  maxSize,
};

export default {
  name: "App",
  components: {
    Video,
    SettingModal,
    Barrage,
    InOutReminder,
    PromptInfo,
    MeetingHeader,
    NmberKeyBoard,
    Hold,
    More,
  },
  data() {
    return {
      version: "",
      env,
      proxy,
      visible: false,
      info: store.get("xyUserInfo") || USER_INFO,
      xyRTC: null,
      templateModel: "SPEAKER",
      forceFullScreenId: "",
      disableContent: false,
      chirmanUri: "",
      screenInfo: {
        layoutWidth: 0,
        layoutHeight: 0,
      },
      // xyLogin/externalLogin/logined/calling/meeting
      status: "externalLogin",
      layout: [],
      audio: "mute",
      video: "muteVideo",
      meetingStore: useCallStateStore(),
      disableAudio: false,
      handStatus: false, // 举手状态
      conferenceInfo: {},
      confMgmtUrl: "",
      holdInfo: {},
      shareContentStatus: 0,
      setting: false,
      model: MODEL,
      modelList: [
        {
          value: "AUTO",
          label: "自动布局",
        },
        {
          value: "CUSTOM",
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
      subTitle: { action: "cancel", content: "" }, // 字幕
      inOutReminders: [], // 出入会通知
      callMode: "AudioVideo",
      recordStatus: RECORD_STATE_MAP.idel, // 本地录制状态
      isRecordPaused: false, // 其它端是否录制暂停中
      recordPermission: {
        // 录制权限相关
        isStartRecord: false, // 是否其他人已经开始录制
        canRecord: true, // 录制开关
        confCanRecord: true, // 会控中开启关闭录制权限
      },
      unmuteCamera: false,
      unmuteMic: false,
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

      return {
        button:true,
        camera: this.video === "unmuteVideo",
        mute_camera: this.video !== "unmuteVideo",
        'disabled-button': this.callMode === 'AudioOnly'
      }
    },
    audioStatus() {
      const audioClass = this.audio === "unmute" ? "mic_aec" : "mute_mic";
      let disabledMute = "";

      let audioStatus = "静音";

      if (this.audio === "unmute") {
        audioStatus = this.disableAudio ? "结束发言" : "静音";
      } else if (this.audio === "mute") {
        if (this.disableAudio) {
          audioStatus = this.handStatus ? "取消举手" : "举手发言";
        } else {
          audioStatus = "取消静音";
        }
      }

      const className = `button ${audioClass} ${disabledMute}`;

      return {
        status: audioStatus,
        className,
      };
    },
    disableRecord() {
      const { isStartRecord, canRecord, confCanRecord } = this.recordPermission;

      if (
        (isStartRecord && this.recordStatus !== RECORD_STATE_MAP.acting) ||
        !canRecord ||
        !confCanRecord
      ) {
        return true;
      }

      if (
        ![RECORD_STATE_MAP.idel, RECORD_STATE_MAP.acting].includes(
          this.recordStatus
        )
      ) {
        return true;
      }

      return false;
    },
    recordStyle() {
      return `button ${
        this.recordStatus === RECORD_STATE_MAP.acting
          ? "pause_record"
          : "record"
      } ${this.disableRecord ? "disabled-button" : ""}`;
    },
    recordText() {
      return this.recordStatus === RECORD_STATE_MAP.acting
        ? "停止录制"
        : "开始录制";
    },
    recordTipStatus() {
      return !(
        !this.recordPermission.isStartRecord &&
        RECORD_STATE_MAP.acting !== this.recordStatus
      );
    },
    showTimer() {
      return RECORD_STATE_MAP.acting === this.recordStatus;
    },
    contentInfo() {
      const { contentPartCount } = this.cacheConfInfo;
      console.log("contentPartCount", contentPartCount);
      if (contentPartCount < 1) {
        return null;
      }

      const contentInfo = this.layoutList.find((item) => item.roster.isContent);
      console.log("contentInfo", contentInfo);
      return contentInfo;
    },
    disabledPage() {
      if (this.model === "CUSTOM") {
        return false;
      }

      const { participantCount, chairManUrl } = this.cacheConfInfo;
      const localLayout = this.layoutList.find(
        (item) => item.sourceId === "LocalPreviewID"
      );
      const isRemoteManUrl =
        chairManUrl && chairManUrl !== localLayout?.roster.callUri;
      // 1. 主会场出现 2. local+远端content 3. 本地共享content 4. 只有一个人
      return (
        this.shareContentStatus === 1 ||
        isRemoteManUrl ||
        participantCount === 1
      );
    },
  },
  mounted() {
    if (this.xyRTC) {
      console.log("mounted======================");
    }

    const dllPath =
      process.env.NODE_ENV === "production"
        ? path.join(path.dirname(process.execPath), "./dll")
        : "node_modules/@xylink/xy-electron-sdk/dll";

    this.xyRTC = XYRTC.getInstance({
      httpProxy: proxy,
      model: this.model,
      dllPath,
    });

    const version = this.xyRTC.getVersion();

    this.version = version;

    // this.xyRTC.enableAECMode(false);

    this.xyRTC.on("TemplateModelChanged", (e) => {
      this.templateModel = e;
    });

    this.xyRTC.on("ForceFullScreen", (id) => {
      console.log("Event forceFullScreen id:", id);
      this.forceFullScreenId = id;
    });

    this.xyRTC.on("PageInfo", (e) => {
      console.log("PageInfo: ", e);
      this.pageInfo = e;
    });

    this.xyRTC.on("ConferenceInfo", (e) => {
      console.log("ConferenceInfo: ", e);
      this.conferenceInfo = e;
    });

    // call status event
    this.xyRTC.on("CallState", (e) => {
      const { state, reason } = e;

      if (state === "Connected") {
        if (this.meetingStore.callState !== "meeting") {
          // start render
          this.meetingStore.callState = "meeting";

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
      console.log("LoginState", e);
      if (e.state === "Logined") {
        message.info("登录成功");

        this.meetingStore.callState = "logined";
      } else if (e.state === "Logouted") {
        if (e.error === 1013 || e.error === 1014 || e.error === 1031) {
          message.info("用户名或密码错误");
        } else if (e.error === 1030) {
          message.info("密码验证超时");
        } else {
          message.info("注销成功");
        }

        this.meetingStore.callState = "externalLogin";
      }
    });

    // video streams change event
    this.xyRTC.on("VideoStreams", (e) => {
      if (this.model === "CUSTOM") {
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

    // 会控取消举手 回调
    this.xyRTC.on("ConfHandupCancelled", () => {
      this.handStatus = false;
    });

    // local 音频状态
    this.xyRTC.on("AudioStatusChanged", (e) => {
      console.log("local audio status changed: ", e);

      const { muteMic } = e;

      if (muteMic === "mute") {
        this.audio = "mute";
      } else if (muteMic === "unmute") {
        this.audio = "unmute";
      }
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
      console.log("meeting control message: ", e);

      const {
        disableMute,
        muteMic,
        disableRecord,
        chirmanUri,
        disableContent,
        confMgmtUrl,
      } = e;
      this.disableAudio = disableMute;

      let info = "";

      if (muteMic === "mute" && disableMute) {
        info = "主持人已强制静音，如需发言，请点击“举手发言”";

        this.handStatus = false;
      } else if (muteMic === "mute" && !disableMute) {
        info = "您已被主持人静音";
      } else if (muteMic === "unmute" && disableMute) {
        info = "主持人已允许您发言";
        this.handStatus = false;
      } else if (muteMic === "unmute" && !disableMute) {
        info = "您已被主持人取消静音";
      }

      // 在等候室时，不做提示
      if (!this.holdInfo.isOnhold && info) {
        message.info(info);
      }

      // 会控控制录制权限
      this.recordPermission = {
        ...this.recordPermission,
        confCanRecord: !disableRecord,
      };

      this.disableContent = disableContent;

      // 会控触发主会场
      this.chirmanUri = chirmanUri;
      this.confMgmtUrl = confMgmtUrl;
    });

    // 会议信息发生变化，会推送此消息，开始计算请求layout
    this.xyRTC.on("ConfInfoChanged", (e) => {
      console.log("react conf info change:", e);

      this.cacheConfInfo = { ...e };

      if (this.model === "AUTO") {
        // 自动布局内部计算了layout请流，不需要外部处理
        return;
      }

      const { participantCount, contentPartCount } = e;

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

    // 字幕
    this.xyRTC.on("SubTitle", (e) => {
      this.subTitle = e;
    });

    // 出入会
    this.xyRTC.on("InOutReminder", (e) => {
      this.inOutReminders = e;
    });

    //  是否检测到啸叫
    this.xyRTC.on("HowlingDetected", (e) => {
      console.log("HowlingDetected:", e);
      if (e) {
        message.info("已检测到回声，可能您离终端太近!");
      }
    });

    // 别人开启或关闭云端录制
    this.xyRTC.on("RecordStatusNotification", (e) => {
      this.recordPermission = {
        ...this.recordPermission,
        isStartRecord: e.isStart,
      };

      if (e.status) {
        // 这种是是录制状态改变暂停或录制中，可以是本地或者远端
        // RECORDING_STATE_ACTING/RECORDING_STATE_PAUSED
        this.isRecordPaused = e.status === "RECORDING_STATE_PAUSED";
      }
    });

    // 自己开始录制状态改变
    this.xyRTC.on("RecordingStateChanged", (e) => {
      // 本地开启关闭录制后，RecordStatusNotification没有最后一次上报，因此只能手动处理了
      // RecordingStateChanged触发，远端肯定没有开始录制
      this.recordPermission = {
        ...this.recordPermission,
        isStartRecord: false,
      };

      // 本地开启关闭录制后，RecordStatusNotification没有最后一次上报，因此只能手动处理了
      // RecordingStateChanged触发，远端肯定没有录制暂停
      this.isRecordPaused = false;
      // 无权限
      if (e.reason === "XYSDK:963902") {
        this.recordPermission = {
          ...this.recordPermission,
          canRecord: false,
        };

        return;
      }

      this.recordStatus = e.recordState;

      if (e.reason !== "STATE:200") {
        message.info(e.message);
        return;
      }

      if (e.recordState === RECORD_STATE_MAP.idel) {
        message.info("云端录制完成，录制视频已保存到云会议室管理员的文件夹中");
      }
    });

    // 等候室信息
    this.xyRTC.on("OnHold", (e) => {
      this.holdInfo = e;
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
      const { meeting, meetingPassword, meetingName, video, audio } = this.info;

      if (!meeting || !meetingName) {
        message.info("请填写入会信息");
        return;
      }

      this.xyRTC.setLocalPreviewResolution(2); // 设置本地画面采集分辨率（360P）

      const result = this.xyRTC.makeCall(
        meeting,
        meetingPassword,
        meetingName,
        !video,
        !audio
      );

      if (result.code === 3002) {
        message.info("请登录后发起呼叫");
      } else {
        this.video = this.info.video ? "unmuteVideo" : "muteVideo";
        this.audio = this.info.audio ? "unmute" : "mute";

        this.meetingStore.callState = "calling";
      }
    },
    hangup() {
      // 挂断会议时，关闭外接屏
      if (this.isExternal) {
        ipcRenderer.send("closeExternalWindow", true);
        this.isExternal = false;
      }

      // 关闭会控弹框
      ipcRenderer.send("meetingControlWin", false);

      this.audio = "unmute";
      this.video = "unmuteVideo";
      this.meetingStore.callState = "logined";
      this.subTitle = {
        action: "cancel",
        content: "",
      };
      this.inOutReminders = [];

      this.isRecordPaused = false;
      this.recordStatus = RECORD_STATE_MAP.idel;
      this.recordPermission = {
        isStartRecord: false,
        canRecord: true,
        confCanRecord: true,
      };

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
    setForceFullScreen(id = "") {
      try {
        this.xyRTC.forceFullScreen(this.forceFullScreenId ? "" : id);
      } catch (error) {
        console.log("强制全屏error: ", error);
      }
    },
    toggleForceFullScreen(id) {
      console.log("toggleForceFullScreen", id);
      // 分页大于1，即使只显示一个画面，也可以全屏
      if (
        this.layoutList.length === 1 &&
        this.pageInfo.currentPage <= 1 &&
        !this.forceFullScreenId
      ) {
        return;
      }

      this.setForceFullScreen(this.forceFullScreenId ? "" : id);
    },
    stopShareContent() {
      this.xyRTC.stopSendContent();
    },
    shareContent() {
      if (this.disableContent) {
        message.info("没有双流分享权限");
        return;
      }

      this.xyRTC.startSendContent(true);
    },

    // 麦克风操作
    async onAudioOperate() {
      try {
        if (this.audio === "unmute") {
          this.audio = "mute";
          message.info("麦克风已静音");

          this.xyRTC.muteMic(true);
        } else {
          this.audio = "unmute";
          this.xyRTC.muteMic(false);
        }
      } catch (err) {
        message.info("操作失败");
      }
    },
    // 麦克风操作
    async audioOperate() {
      if (this.audio === "mute" && this.disableAudio && !this.handStatus) {
        this.xyRTC.sendSpeakingRequest();

        this.handStatus = true;
        message.info("发言请求已发送");

        return;
      }

      if (this.audio === "mute" && this.disableAudio && this.handStatus) {
        this.xyRTC.cancelSpeakingRequest();

        this.handStatus = false;
        return;
      }

      if (this.audio === "unmute" && this.disableAudio) {
        this.xyRTC.sendSpeakingEnd();

        this.handStatus = false;
        return;
      }

      this.onAudioOperate();
    },
    videoOperate() {
      if(this.callMode === 'AudioOnly'){
        return;
      }
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

      if (this.model === "AUTO") {
        const { currentPage } = this.pageInfo;
        const targetPage =
          type === "next"
            ? currentPage + 1
            : type === "previous"
            ? currentPage - 1
            : type === "home"
            ? 0
            : type;

        this.xyRTC.switchPage(targetPage).then(
          (res) => console.log("switch page success: ", res),
          (err) => console.log("switch page fail: ", err)
        );
        return;
      }

      const { currentPage, totalPage } = this.cachePageInfo;
      let nextPage = currentPage;

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
          if (msg && this.xyRTC) {
            this.isExternal = true;

            // 关闭原始屏的视频流渲染
            this.xyRTC.stopAllVideoRender();

            ipcRenderer.send("externalLayout", {
              layout: this.layout,
            });

            // 传递回调函数，在remote上设置id对应的videoFrame
            this.xyRTC.startAllExternal(({ id, videoFrame }) => {
              if (videoFrame && videoFrame.hasData) {
                const temp = remote.getGlobal("sharedObject").videoFrames;

                if (temp[id]) {
                  remote.getGlobal("sharedObject").videoFrames[id] = videoFrame;
                } else {
                  remote.getGlobal("sharedObject").videoFrames = {
                    ...temp,
                    [id]: {},
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

    // 切换语音模式
    switchCallMode() {
      const mode = this.callMode === "AudioVideo" ? "AudioOnly" : "AudioVideo";

      const isAudioMode = mode === "AudioOnly";

      this.callMode = mode;

      this.xyRTC.switchCallMode(mode);

      if (this.video === "unmuteVideo") {
        this.xyRTC.muteCamera(isAudioMode);
      }
    },

    // 开始/停止录制
    recordOperate() {
      if (this.disableRecord) {
        return;
      }

      if (this.recordStatus === RECORD_STATE_MAP.idel) {
        this.xyRTC.startCloudRecord();
      } else if (this.recordStatus === RECORD_STATE_MAP.acting) {
        this.xyRTC.stopCloudRecord();
      }
    },
    openMeetingControlWin() {
      // 会控链接
      // const { pc } = this.xyRTC.getConfMgmtUrl();
      const pc = this.confMgmtUrl;
      console.log("pc", pc);

      const { meetingNumber = "" } = this.conferenceInfo;

      if (pc) {
        ipcRenderer.send("meetingControlWin", { url: pc, meetingNumber });
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
