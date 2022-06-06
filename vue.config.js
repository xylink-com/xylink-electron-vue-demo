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
            "./models/*",
            {
              from: "./dll/",
              to: "./dll",
              filter: ["**/*"],
            },
            // 将node_modules里xy-electron-sdk包中的node包复制到resources目录上，方便打包调用
            {
              from: "node_modules/@xylink/xy-electron-sdk/build/Release/",
              to: "./resources",
              filter: ["**/*"],
            },
            {
              from: "./dll/I420ToARGB.cso",
              to: "./",
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
