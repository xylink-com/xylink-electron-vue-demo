const path = require("path");

module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: "小鱼云视频",
        appId: "org.xylink.vue",
        files: [],
        win: {
          target: ["nsis"],
          extraFiles: [
            "./avcodec-58.dll",
            "./avdevice-58.dll",
            "./avfilter-7.dll",
            "./avformat-58.dll",
            "./avutil-56.dll",
            "./NemoSdk.dll",
            "./openjp2.dll",
            "./swresample-3.dll",
            "./swscale-5.dll",
            "./xin265_32.dll",
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
      .tap((item) => {
        const options = {};
        const isPrd = process.env.NODE_ENV === "production";

        options["name"] = "[name].[ext]";
        options["rewritePath"] = isPrd
          ? "./resources"
          : path.resolve(
              __dirname,
              "./node_modules/@xylink/xy-electron-sdk/build/Release/"
            );

        return options;
      })
      .end();
  },
};
