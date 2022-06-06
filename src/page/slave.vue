<template>
  <div id="app">
    <div class="container">
      <div class="meeting-header">
        <span>副屏画面</span>
      </div>

      <div class="meeting-content">
        <div class="meeting-layout" :style="layoutStyle">
          <Video
            v-for="val in layoutList"
            :key="val.key"
            :item="val"
            :xyRTC="xyRTC"
            :isExternalDrawLocalVideo="val.isLocal"
          ></Video>
        </div>
      </div>

      <div class="meeting-footer">
        <div class="middle"></div>
        <div class="right">
          <div class="button end_call" @click="onStopSlave">
            <div class="icon"></div>
            <div class="title">关闭</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ipcRenderer } from "electron";
import Video from "./components/Video";
import cloneDeep from "clone-deep";
import { getScreenInfo } from "../utils/index";
import { TEMPLATE } from "../utils/template";
import { XYRenderRTC } from "@xylink/xy-electron-sdk";

export default {
  name: "Slave",
  components: { Video },
  computed: {
    layoutList() {
      const localLayout = this.layout;

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
  },
  data() {
    return {
      layout: [],
      screenInfo: {
        layoutWidth: 0,
        layoutHeight: 0,
      },
      xyRTC: null,
      // ------------以下是变量值，不影响UI变化-------------
      layoutRef: [],
      localInfoRef: null,
      cacheScreenInfo: {
        rateWidth: 0,
        rateHeight: 0,
      },
    };
  },
  mounted() {
    console.log("layoutRef: ", this.layoutRef);
    this.initMainWindowEvent();

    console.log("start init start");

    this.xyRTC = XYRenderRTC.getXYInstance({
      // 动态设置环境，当构建正式包时，dll从当前程序的dll目录加载，dev开发时，从sdk目录加载
      dllPath: "./dll",
    });

    this.xyRTC.setLogLevel("NONE");

    // 此处收到videoStreams回调是因为主窗口启动了外接屏幕渲染模式
    // 启动之后，requestLayout请求远端视频流时，需要携带外接屏幕deviceId
    // 指定deviceId之后，返回的视频流会通过底层跨渲染进行传输到外接屏幕下，直接通过Video组件调用setVideoRender渲染即可；
    // 注意：此处数据不包含Local数据，当前的做法是通过主窗口ipcRenderer传递到外接窗口下，然后合并数据显示画面；
    this.xyRTC.on("VideoStreams", (e) => {
      console.log("demo get video streams: ", e);

      this.layoutRef = e;
      this.createLayout();
    });

    console.log("xyRTC.current: ", this.xyRTC);
    this.startSlave();
  },
  methods: {
    createLayout() {
      const layoutList = cloneDeep(this.layoutRef);
      const localInfo = this.localInfoRef;
      // 将local数据补充到layoutList的首位，通过模板动态创建布局画面
      layoutList.unshift(localInfo);
      const nextTemplateRate =
        TEMPLATE.GALLERY.rate[layoutList.length] || 0.5625;
      // 第一个参数为空，会使用document.body的size计算screen信息，如需指定elementId，配置第一个参数即可
      this.cacheScreenInfo = getScreenInfo("", nextTemplateRate, [92, 0]);
      const nextLayout = this.calculateBaseLayoutList(layoutList);

      console.log("nextLayout:", nextLayout);

      this.layout = nextLayout;
    },
    initMainWindowEvent() {
      // 接收主窗口推送的local roster信息
      // 此处缓存local信息，并配合videoStreams回调返回所有远端信息计算最新的layout数据，并渲染画面
      ipcRenderer.on("localInfo", this.onLocalInfo);
      // 监听外接屏幕关闭事件，当关闭后，需要销毁所有资源和事件
      ipcRenderer.on("closedExternalWindow", this.onClosedExternalWindow);
    },
    async onStopSlave() {
      // 通知主进程关闭外接屏幕窗口，由主进程统一向主窗口和副窗口发送关闭事件，销毁资源
      ipcRenderer.send("closeExternalWindow", true);
    },
    startSlave() {
      // 注册副屏窗口，deviceID可以自行指定
      // 指定后，在主sdk上可以收到外接屏幕事件，之后可以在请流时，reqList列表数据中指定deviceId即可在副屏接收到视频流videoStreams回调
      this.xyRTC.startSlave({ deviceID: "ex_screen_1" });
    },

    onClosedExternalWindow() {
      console.log("close external window...");

      this.closeExternalScreen();
    },

    closeExternalScreen() {
      console.log("close external screen in ex");

      this.xyRTC.stopSlave();
      this.layout = [];
      ipcRenderer.removeListener("localInfo", this.onLocalInfo);
      ipcRenderer.removeListener(
        "closedExternalWindow",
        this.onClosedExternalWindow
      );
    },

    onLocalInfo(event, msg) {
      console.log("local layout info: ", msg);

      this.localInfoRef = msg;
      this.createLayout();
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
  },
};
</script>
<style scoped></style>
