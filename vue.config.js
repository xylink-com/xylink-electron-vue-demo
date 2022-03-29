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
            "./dll/avcodec-58.dll",
            "./dll/avdevice-58.dll",
            "./dll/avfilter-7.dll",
            "./dll/avformat-58.dll",
            "./dll/avutil-56.dll",
            "./dll/concrt140.dll",
            "./dll/d3dx9_43.dll",
            "./I420ToARGB.cso",
            "./dll/Magnification.dll",
            "./dll/msvcp140.dll",
            "./dll/NemoSDK.dll",
            "./dll/openjp2.dll",
            "./dll/swresample-3.dll",
            "./dll/swscale-5.dll",
            "./dll/ucrtbase.dll",
            "./dll/vccorlib140.dll",
            "./dll/vcruntime140.dll",
            "./dll/xin265_32.dll",
            "./dll/websokcet_mg.dll",
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
