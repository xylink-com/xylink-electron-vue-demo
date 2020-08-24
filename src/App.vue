<template>
  <div id="app">
    <h1>hello world, version: {{ version }}</h1>
    <h1 @click="login">login</h1>
    <h1 @click="logout">logout</h1>
  </div>
</template>

<script>
import { XYRTC } from "@xylink/xy-electron-sdk";

let xyRTC;

export default {
  name: "App",
  data() {
    return {
      version: "",
    };
  },
  components: {},
  created() {
    console.log("XYRTC: ", XYRTC);

    xyRTC = XYRTC.getXYInstance({
      httpProxy: "cloud.xylink.com",
    });

    xyRTC.on("CallState", (e) => {
      console.log("call state e: ", e);
    });

    xyRTC.on("LoginState", (e) => {
      console.log("login state: ", e);
    });

    xyRTC.on("VideoStreams", (e) => {
      console.log("video streams:", e);
    });

    xyRTC.on("ScreenInfo", (e) => {
      console.log("screen info: ", e);
    });

    const version = xyRTC.getVersion();

    this.version = version;
  },
  methods: {
    login: () => {
      console.log("login");
      xyRTC.login("+86-15353622534", "111111");
    },
    logout: () => {
      xyRTC.logout();
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
