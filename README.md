# xy-electron-sdk-vue-demo

注意：详细配置方式见 sdk 文档，针对 vue 项目的配置见当前项目。

## 准备工作

### 第一步
安装依赖
```bash
# 安装依赖
$ yarn
```

### 第二步（可选）
Demo默认安装最新32位Electron版本；
```bash
# 安装32位electron，版本随意，此处演示
$ yarn add electron@5.0.13 -D --arch=ia32
```

### 第三步
安装完成  @xylink/xy-electron-sdk 后，进入项目根目录 -> node_modules -> @xylink -> xy-electron-sdk -> dll 文件夹下，将dll目录复制到当前项目的根路径下（可自定义dll加载路径，当前sdk demo指定了dll路径，参见`src\page\index.vue`，代码如下）；

```js
this.xyRTC = XYRTC.getXYInstance({
  ...,
  dllPath: "./dll"
});
```

### 第四步
执行完步骤三，项目根目录的dll目录下会存在一个"I420ToARGB.cso"文件，将此文件复制到：node_modules\electron\dist 目录下；

> 注意：步骤四是解决本地开发时，调用摄像头采集crash的问题，打正式包时，此步骤不需要，会自动copy此文件。


## 本地开发

```
$ yarn dev
```

### 构建32位应用

```
$ yarn build:32
```

### Docs

See our [xy electron sdk docs](https://openapi.xylink.com/common/meeting/doc/description?platform=electron)

### 说明
1. 此版本支持外接屏幕渲染画面