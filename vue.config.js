const path = require("path");

module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      customFileProtocol: "./",
      builderOptions: {
        productName: "小鱼云视频vue",
        appId: "org.xylink.vue",
        files: [],
        nsis: {
          oneClick: false,
          allowElevation: true,
          perMachine: true,
          allowToChangeInstallationDirectory: true,
          createDesktopShortcut: true,
          createStartMenuShortcut: true,
          installerIcon: "assets/logo256.ico",
          installerHeaderIcon: "assets/logo256.ico",
        },
        asar: true,
        protocols: [
          {
            name: "xy-vue-electron",
            schemes: ["xy-vue-electron"],
          },
        ],
        win: {
          icon: "assets/logo256.ico",
          extraFiles: [
            {
              from: "./models",
              to: "./models",
              filter: ["**/*"],
            },
            {
              from: "node_modules/@xylink/xy-electron-sdk/dll",
              to: "./dll",
              filter: ["**/*"],
            },
            {
              from: "node_modules/@xylink/xy-electron-sdk/dll/I420ToARGB.cso",
              to: "./",
              filter: ["**/*"],
            },
            {
              from: "node_modules/@xylink/xy-electron-sdk/build/Release/",
              to: "./resources",
              filter: ["**/*"],
            },
          ],
        },
        mac: {
          category: "xylink.app.category.type",
          gatekeeperAssess: false,
          icon: "assets/logo512.png",
          target: "dmg",
          hardenedRuntime: true,
          entitlements: "assets/entitlements.mac.plist",
          entitlementsInherit: "assets/entitlements.mac.plist",
          extendInfo: {
            NSMicrophoneUsageDescription: "请允许本程序访问您的麦克风",
            NSCameraUsageDescription: "请允许本程序访问您的摄像头",
          },
          extraFiles: [
            {
              from: "./models",
              to: "./Resources",
              filter: ["**/*"],
            },
            {
              from: "node_modules/@xylink/xy-electron-sdk/dll",
              to: "./Frameworks",
              filter: ["**/*"],
            },
            {
              from: "node_modules/@xylink/xy-electron-sdk/build/Release/",
              to: "./resources",
              filter: ["**/*"],
            },
          ],
        },
      },
    },
  },
  chainWebpack: (config) => {
    config.module
      .rule("node")
      .test(/\.node$/)
      .use("native-ext-loader")
      .loader("native-ext-loader")
      .tap(() => {
        const options = {};
        const isPrd = process.env.NODE_ENV === "production";

        options["name"] = "[name].[ext]";
        // 开发环境将.node的寻找路径设置到node_modules目录

        if (!isPrd) {
          options["rewritePath"] = path.resolve(
            __dirname,
            "./node_modules/@xylink/xy-electron-sdk/build/Release/"
          );
        }

        return options;
      })
      .end();
  },
};
