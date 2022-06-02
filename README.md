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
安装完成  @xylink/xy-electron-sdk 后，进入项目根目录 -> node_modules -> @xylink -> xy-electron-sdk -> dll 文件夹下，将所有的文件复制到当前项目的根路径的 dll 目录下（可自定义dll加载路径，当前sdk demo指定了dll路径，参加`src\page\index.vue Line:352`，代码如下）；

```js
this.xyRTC = XYRTC.getXYInstance({
  ...,
  dllPath: "./dll"
});
```

### 第四步
执行完步骤三，项目dll目录会存在一个"I420ToARGB.cso"文件，将此文件复制到：node_modules\electron\dist 目录下；

> 注意：步骤四是解决本地开发时，调用摄像头采集crash的问题，打正式包时，此步骤不需要，需进行第五步配置。

### 第五步
打正式包时，需将"I420ToARGB.cso"文件放置在运行程序的根目录。改写打包配置，将"I420ToARGB.cso"文件配置成
```
{
   from: "./dll/I420ToARGB.cso",
   to: "./",
   filter: ["**/*"],
}
```

## 本地开发

```
$ yarn dev
```

### 构建

```
$ yarn build:32
```

### 文档

See our [xy electron sdk docs](https://openapi.xylink.com/common/meeting/doc/description?platform=electron)
