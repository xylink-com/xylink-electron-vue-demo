<template>
  <div id="app">
    <div class="container">
      <SettingModal
        :model-value="visible"
        :value="proxy"
        @cancel="toggleProxyModal"
        @ok="onSettingProxy"
      />
      <Login
        :info="info"
        @toggleProxyModal="toggleProxyModal"
        v-model:model="model"
      />
      <div class="loading" v-if="callState === 'calling'">
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
        v-if="callState === 'meeting'"
        :conferenceInfo="conferenceInfo"
        :holdInfo="holdInfo"
      />

      <div v-if="callState === 'meeting' && !holdInfo.isOnhold">
        <div class="meeting-content">
          <PromptInfo
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
              :templateModel="templateModel"
              :toggleForceFullScreen="() => toggleForceFullScreen(val.id)"
            ></Video>
          </div>

          <Barrage
            v-if="subTitle.content && subTitle.action === 'push'"
            :subTitle="subTitle"
          />

          <InOutReminder :reminders="inOutReminders" />
          <SignIn v-if="1 === interactiveStore.processType" />
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
            <LayoutSelect
                :contentPartCount="cacheConfInfo.contentPartCount"
                :templateModel="templateModel"
                @switchLayout="switchLayout"
              />
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
            <More>
              <template #more="{ closeMore }">
                <dl class="more-select" @click="closeMore">
                  <dd @click="switchCallMode">
                    {{ callMode === "AudioOnly" ? "退出语音模式" : "语音模式" }}
                  </dd>
                  <NmberKeyBoard>
                    <template #keyBoardBtn="{ open }">
                      <dd @click="open">键盘</dd>
                    </template>
                  </NmberKeyBoard>
                  <!-- <dd @click="sendExternalMsg">
                  {{ isExternal ? "关闭外接" : "打开外接" }}
                </dd> -->
                  <dd @click="toggleProxyModal">设置</dd>
                  <dd @click="onFarEndControl">
                    {{ farEndShow ? "退出遥控模式" : "遥控摄像头" }}
                  </dd>
                </dl>
              </template>
            </More>
          </div>
          <div class="right">
            <div class="button end_call" @click="hangup">
              <div class="icon"></div>
              <div class="title">挂断</div>
            </div>
          </div>
        </div>
        <FarEndControl v-if="showFarEnd" />
      </div>
      <Hold
        v-if="holdInfo.isOnhold"
        :conferenceInfo="conferenceInfo"
        :stopMeeting="hangup"
      />

      <ContentSharingDialog />
    </div>
  </div>
</template>

<script>
import xyRTC from "../utils/xyRTC";
import Store from "electron-store";
import { ipcRenderer } from "electron";
import remote from "@electron/remote";
import { USER_INFO, RECORD_STATE_MAP } from "../utils/enum";
import { DEFAULT_PROXY } from "../config";
import { TEMPLATE } from "../utils/template";
import { getScreenInfo, farEndControlSupport, debounce } from "../utils/index";
import { SDK_ERROR_MAP, KICK_OUT_MAP } from "../utils/error";
import { ElMessage as Message } from "element-plus";
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
import {
  useCallStateStore,
  farEndControlStore,
  useInteractive,
  useSignIn,
  useContentSharing,
  useCloudRecordInfo
} from "../store/index";
import { mapStores, mapWritableState } from "pinia";
import FarEndControl from "./components/FarEndControl/index.vue";
import Login from "./components/Login/index.vue";
import SignIn from "./components/SignIn/index.vue";
import LayoutSelect from "./components/LayoutSelect/index.vue";
import ContentSharingDialog from './components/ContentSharing/index.vue';
import { RecordStatus } from '@xylink/xy-electron-sdk';

const store = new Store();

const message = {
  info: (message) => {
    Message({
      type: "info",
      message,
      duration: 2000,
    });
  },
};
const proxy = store.get("xyHttpProxy") || DEFAULT_PROXY;
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
    FarEndControl,
    Login,
    SignIn,
    LayoutSelect,
    ContentSharingDialog,
  },
  data() {
    return {
      cacheStream: [],
      proxy,
      visible: false,
      info: store.get("xyUserInfo") || USER_INFO,
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
      disableAudio: false,
      handStatus: false, // 举手状态
      conferenceInfo: {},
      confMgmtUrl: "",
      holdInfo: {},
      shareContentStatus: 0,
      setting: false,
      model: MODEL,
      micLevel: 0,
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
      confCanRecord: false,
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
        button: true,
        camera: this.video === "unmuteVideo",
        mute_camera: this.video !== "unmuteVideo",
        "disabled-button": this.callMode === "AudioOnly",
      };
    },
    audioStatus() {
      let audioClass = this.audio === "unmute" ? "mic_aec" : "mute_mic";
      let disabledMute = "";

      let audioStatus = "静音";

      if (this.audio === "unmute") {
        audioStatus = this.disableAudio ? "结束发言" : "静音";

        if (this.disableAudio) {
          audioClass = "hand_end";
        }
      } else if (this.audio === "mute") {
        if (this.disableAudio) {
          audioStatus = this.handStatus ? "取消举手" : "举手发言";
          audioClass = this.handStatus ? "hand_down" : "hand_up";
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
      console.log('disabled record', this.confCanRecord, this.recordStatus,this.isSelfRecord)
      // 会控禁用录制， 录制状态时disable, 别人正在处理录制中或者暂停状态，这三种情况禁止操作录制
      if (
        !this.confCanRecord ||
        this.recordStatus === RecordStatus.DISABLE ||
        ([RecordStatus.ACTING_BY_OTHERS, RecordStatus.PAUSE_BY_OTHERS].includes(
          this.recordStatus
        ) &&
          !this.isSelfRecord)
      ) {
        return true;
      }

      return false;
    },
    isLocalRecording() {
      // 本人正在录制或暂停中
      return (this.recordStatus === RecordStatus.ACTING ||
        RecordStatus.ACTING_BY_OTHERS === this.recordStatus ||
        this.recordStatus === RecordStatus.PAUSE_BY_OTHERS) &&
        this.isSelfRecord;
    },
    recordStyle() {
      return `button ${
        this.isLocalRecording
          ? "pause_record"
          : "record"
      } ${this.disableRecord ? "disabled-button" : ""}`;
    },
    recordText() {
      return this.isLocalRecording
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
    ...mapWritableState(useCallStateStore, ["callState"]),
    ...mapWritableState(useCloudRecordInfo, ['isSelfRecord', 'recordStatus']),
    ...mapWritableState(farEndControlStore, {
      farEndCallUri: "callUri",
      farEndShow: "show",
      farEndFeccOri: "feccOri",
    }),
    ...mapStores(useInteractive, useSignIn, useContentSharing),
    showFarEnd() {
      return this.farEndShow && !!this.farEndCallUri;
    },
  },
  created() {
    this.debounceVideoStreamLayout = debounce(
      this.calcCustomVideoStreamLayout,
      150,
      100
    );
  },
  mounted() {
    // xyRTC.enableAECMode(false);

    xyRTC.on("TemplateModelChanged", (e) => {
      this.templateModel = e;
    });

    xyRTC.on("ForceFullScreen", (id) => {
      console.log("Event forceFullScreen id:", id);
      this.forceFullScreenId = id;
    });

    xyRTC.on("PageInfo", (e) => {
      console.log("PageInfo: ", e);
      this.pageInfo = e;
    });

    xyRTC.on("ConferenceInfo", (e) => {
      console.log("ConferenceInfo: ", e);
      this.conferenceInfo = e;
    });

    // call status event
    xyRTC.on("CallState", (e) => {
      const { state, reason, error } = e;

      if (state === "Connected") {
        if (this.callState !== "meeting") {
          // start render
          this.callState = "meeting";

          Message({
            type: "success",
            message: "入会成功",
          });
        }
      } else if (state === "Disconnected") {
        if (error !== 'XYSDK:969001') {
          message.info(SDK_ERROR_MAP[error] || reason);

          // token过期退出登录
          if (error === 'XYSDK:964104') {
            xyRTC.logout();
          }
        } else {
          message.info(reason);
        }
        this.hangup();
      } else if (state === "Connecting" || state === "Disconnecting") {
        return;
      }
    });

    // login status event
    xyRTC.on("LoginState", (e) => {
      console.log("LoginState", e);
      if (e.state === "Logined") {
        Message({
          type: "success",
          message: "登录成功",
        });

        this.callState = "logined";
      } else if (e.state === "Logouted") {
        this.callState = "externalLogin";

        if (e.error === 'XYSDK:969001') {
          return;
        } else {
          message.info(SDK_ERROR_MAP[e.error] || '服务异常');
        }
      }
    });

    // video streams change event
    xyRTC.on("VideoStreams", (e) => {
      this.cacheStream = e;
      if (this.model === "CUSTOM") {
        this.calcCustomVideoStreamLayout();
      } else {
        this.layout = cloneDeep(e);
      }

      // 在 Electron 9 之后的版本,发送非标准的 JavaScript 类型比如 DOM 对象或者特殊的 Electron 类型也会抛出错误 不要发对象
      ipcRenderer.send("externalLayout", JSON.stringify(this.layout));
    });

    xyRTC.on("KickOut", (e) => {
      console.log("demo get kick out message: ", e);

      xyRTC.logout();

      message.info(`账号异常：${KICK_OUT_MAP[e] || "未知异常，重新登录"}`);
    });

    // screen size change event
    xyRTC.on("ScreenInfo", (e) => {
      this.screenInfo = e;
    });

    // content status event
    xyRTC.on("ContentState", (e) => {
      console.log("demo get content state message: ", e);
      const lastShareContentStatus = this.shareContentStatus;
      
      // 0: IDEL；1：SENDING；2：RECEIVEING
      if (e === 0 || e === 1 || e === 2) {
        this.shareContentStatus = e;
      }
      // SENDING，正在发送
      if (e === 1) {
        message.info(`您正在分享Content内容`);
      } else if (e === 0 && lastShareContentStatus !== 0) {
        message.info(`已结束分享内容`);
        this.contentSharingStore.$patch({
          isPaused: false,
          isManualPaused: false,
          type: -1
        });
        // 防止远端顶掉共享导致没有停止捕获
        this.stopShareContent();
      }
    });

    xyRTC.on('AppWindowCaptureState', (e) => {
      console.log('AppWindowCaptureState:', e);

      if (e.isClosed) { // app 如果被关闭，则停止共享
        xyRTC.stopSendContent();
        message.info('由于共享应用已被关闭，屏幕共享已停止');
      } else {
        const { isManualPaused } = this.contentSharingStore;
        // 如果手动暂停了，则不处理终端下发的暂停状态
        if (!isManualPaused) {
          this.contentSharingStore.isPaused = e.isPaused;
        }
      }
    });

    // 会控取消举手 回调
    xyRTC.on("ConfHandupCancelled", () => {
      this.handStatus = false;
    });

    // local 音频状态
    xyRTC.on("AudioStatusChanged", (e) => {
      console.log("local audio status changed: ", e);

      const { muteMic } = e;

      if (muteMic === "mute") {
        this.audio = "mute";
      } else if (muteMic === "unmute") {
        this.audio = "unmute";
      }
    });

    // 实时获取麦克风声量大小（0-100）
    xyRTC.on("MicEnergyReported", (value) => {
      this.micLevel = value;
    });

    // 会议控制消息
    // 可以通过此消息获取：会控播放地址/主会场callUri/麦克风状态/是否是强制静音麦克风
    // 自定义布局模式下，主会场callUri需要记录下来，后续requestLayout计算需要使用
    xyRTC.on("ConfControl", (e) => {
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

      this.confCanRecord = !disableRecord;

      this.disableContent = disableContent;

      // 会控触发主会场
      this.chirmanUri = chirmanUri;
      this.confMgmtUrl = confMgmtUrl;
    });

    // 会议信息发生变化，会推送此消息，开始计算请求layout
    xyRTC.on("ConfInfoChanged", (e) => {
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
        xyRTC.stopExternal();
      }
    });

    ipcRenderer.on("check-device-finished", (event, isFinished) => {
      if (isFinished) {
        this.joinMeeting();
      }
    });

    // 字幕
    xyRTC.on("SubTitle", (e) => {
      this.subTitle = e;
    });

    // 出入会
    xyRTC.on("InOutReminder", (e) => {
      this.inOutReminders = e;
    });

    //  是否检测到啸叫
    xyRTC.on("HowlingDetected", (e) => {
      console.log("HowlingDetected:", e);
      if (e) {
        message.info("已检测到回声，可能您离终端太近!");
      }
    });

    // 本地开始录制状态改变
    xyRTC.on("RecordingStateChanged", (e) => {
      // 录制过程中，由于本人和会控都有可能操作，所以需要自己区分是否是本人在录制
      let isSelfRecord;
      if (e.recordState === RecordStatus.ACTING) {
        isSelfRecord = true;
      } else if (e.recordState === RecordStatus.IDLE || e.recordState === RecordStatus.IDLE_BY_OTHERS) {
        isSelfRecord = false;
      }

      this.isSelfRecord = isSelfRecord ?? this.isSelfRecord;
      this.recordStatus = e.recordState;

      if (e.recordState === RecordStatus.IDLE) {
        Message({
          type: "success",
          message: "云端录制完成，录制视频已保存到云会议室管理员的文件夹中",
        });
      }
    });

    // 等候室信息
    xyRTC.on("OnHold", (e) => {
      this.holdInfo = e;
    });

    xyRTC.on("InteractiveToolInfo", (e) => {
      console.log("onInteractiveToolInfo", e);
      this.interactiveStore.$patch(e);
    });

    xyRTC.on('HostMeetingUrl', (e) => {
      console.log('HostMeetingUrl: ', e);
      const { members } = e;
      // 会控链接
      const { meetingNumber = "" } = this.conferenceInfo;

      if (members) {
        ipcRenderer.send("meetingControlWin", { url: members, meetingNumber });
      }
    });
  },
  methods: {
    calcCustomVideoStreamLayout() {
      const e = this.cacheStream;

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
    },
    onFarEndControl() {
      if (!this.farEndShow && !this.farEndCallUri) {
        message.info("当前没有可以控制的摄像头");
        return;
      }

      this.farEndShow = !this.farEndShow;
    },
    logout() {
      xyRTC.logout();
    },
    onSettingProxy(value) {
      store.set("xyHttpProxy", value);
      ipcRenderer.send("relaunch", proxy);

      this.toggleProxyModal();
    },
    toggleProxyModal() {
      this.visible = !this.visible;
    },
    makeCall() {
      // 登录&连接服务器成功，可以入会
      const { meeting, meetingName } = this.info;

      if (!meeting || !meetingName) {
        message.info("请填写入会信息");
        return;
      }

      ipcRenderer.send("check-device-access-privilege");
    },
    joinMeeting() {
      const { meeting, meetingPassword, meetingName, video, audio } = this.info;

      xyRTC.setLocalPreviewResolution(2); // 设置本地画面采集分辨率（360P）

      const result = xyRTC.makeCall(
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

        this.callState = "calling";
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
      this.callState = "logined";
      this.subTitle = {
        action: "cancel",
        content: "",
      };
      this.inOutReminders = [];
      this.isSelfRecord = false;
      this.recordStatus = RecordStatus.IDLE;
      this.confCanRecord = true;
      this.farEndShow = false;
      this.interactiveStore.$reset();
      this.signInStore.$reset();
      xyRTC.endCall();
      // 结束共享
      if (this.shareContentStatus === 1) {
        this.stopShareContent();
      }
    },
    async switchLayout() {
      if (this.shareContentStatus === 1) {
        return;
      }

      try {
        const result = await xyRTC.switchLayout();

        console.log("result: ", result);
      } catch (err) {
        console.log("err: ", err);
        message.info(err?.msg || "切换失败");
      }
    },
    setForceFullScreen(id = "") {
      try {
        xyRTC.forceFullScreen(this.forceFullScreenId ? "" : id);
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
    // 停止共享
    stopShareContent() {
      this.contentSharingStore.$patch({
        isPaused: false,
        isManualPaused: false,
      });
      xyRTC.stopSendContent();
    },
    // 开始共享
    shareContent() {
      if (this.disableContent) {
        message.info("没有双流分享权限");
        return;
      }
      // 弹出共享窗口
      this.contentSharingStore.$patch({
        dialogVisible: true
      });
    },
    // 麦克风操作
    async onAudioOperate() {
      try {
        if (this.audio === "unmute") {
          this.audio = "mute";
          Message({
            type: "success",
            message: "麦克风已静音",
          });

          xyRTC.muteMic(true);
        } else {
          this.audio = "unmute";
          xyRTC.muteMic(false);
        }
      } catch (err) {
        message.info("操作失败");
      }
    },
    // 麦克风操作
    async audioOperate() {
      if (this.audio === "mute" && this.disableAudio && !this.handStatus) {
        xyRTC.sendSpeakingRequest();

        this.handStatus = true;
        Message({
          type: "success",
          message: "发言请求已发送",
        });

        return;
      }

      if (this.audio === "mute" && this.disableAudio && this.handStatus) {
        xyRTC.cancelSpeakingRequest();

        this.handStatus = false;
        return;
      }

      if (this.audio === "unmute" && this.disableAudio) {
        xyRTC.sendSpeakingEnd();

        this.handStatus = false;
        return;
      }

      this.onAudioOperate();
    },
    videoOperate() {
      if (this.callMode === "AudioOnly") {
        return;
      }
      if (this.video === "unmuteVideo") {
        this.video = "muteVideo";

        xyRTC.muteCamera(true);
      } else {
        this.video = "unmuteVideo";
        xyRTC.muteCamera(false);
      }
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

      xyRTC.requestLayout(reqList, maxSize, currentPage);
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

        xyRTC.switchPage(targetPage).then(
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

      console.log("switch page: ", this.cachePageInfo);

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
          if (msg && xyRTC) {
            this.isExternal = true;

            // 关闭原始屏的视频流渲染
            xyRTC.stopAllVideoRender();

            ipcRenderer.send("externalLayout", JSON.stringify(this.layout));

            // 传递回调函数，在remote上设置id对应的videoFrame
            xyRTC.startAllExternal(({ id, videoFrame }) => {
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

      xyRTC.switchCallMode(mode);

      if (this.video === "unmuteVideo") {
        xyRTC.muteCamera(isAudioMode);
      }
    },

    // 开始/停止录制
    recordOperate() {
      if (this.disableRecord) {
        return;
      }

      // 录制空闲时可以开启录制
      if ([RecordStatus.IDLE, RecordStatus.IDLE_BY_OTHERS].includes(this.recordStatus)) {
        xyRTC.startCloudRecord();
      } else if (this.isSelfRecord) {
        // 本人录制中
        xyRTC.stopCloudRecord();
      }
    },
    openMeetingControlWin() {
      xyRTC.getConfMgmtUrl();
    },
  },
  watch: {
    info: {
      handler(newValue) {
        store.set("xyUserInfo", newValue);
      },
      deep: true,
    },
    layout: {
      handler(newValue) {
        const term = newValue.find((item) => {
          const isSupportFarControl = farEndControlSupport(
            item.roster.feccOri
          ).supportSome;
          const isInBigScreen =
            item.position.width > (this.screenInfo.layoutWidth || 0) * 0.5;
          return isSupportFarControl && isInBigScreen;
        });

        console.log("term", term);

        this.farEndCallUri = term?.roster.callUri || "";
        this.farEndFeccOri = term?.roster.feccOri;

        console.log("this.farEndCallUri", this.farEndCallUri);
      },
      deep: true,
    },
    callState(newVal) {
      // 自定义布局处理窗口事件
      if (newVal === "meeting" && this.model === "CUSTOM") {
        window.addEventListener("resize", this.debounceVideoStreamLayout);
      } else {
        window.removeEventListener("resize", this.debounceVideoStreamLayout);
      }
    },
  },
};
</script>

<style scoped>
.el-row {
  max-width: 500px;
  margin: 30px auto 20px;
  flex-direction: column;
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
