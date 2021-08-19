const path = require("path");

module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: "小鱼云视频vue",
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
            "./concrt140.dll",
            "./d3dx9_43.dll",
            "./I420ToARGB.cso",
            "./Magnification.dll",
            "./msvcp140.dll",
            "./NemoSDK.dll",
            "./openjp2.dll",
            "./swresample-3.dll",
            "./swscale-5.dll",
            "./ucrtbase.dll",
            "./vccorlib140.dll",
            "./vcruntime140.dll",
            "./xin265_32.dll",
            // 将node_moduels里xy-electron-sdk包中的node包复制到resources目录上，方便打包调用
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
        // 开发环境将.node的寻找路径设置到node_modules目录，发布环境设置为resources目录上。
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
