# xy-electron-sdk-vue-demo

注意：详细配置方式见 sdk 文档，针对 vue 项目的配置见当前项目。

## 准备工作

### 第一步
安装依赖
```bash
# 安装依赖
$ yarn
```

### 第二步
#### window平台
```bash
# window 安装32位electron，版本随意，此处演示
$ yarn add electron@5.0.13 -D --arch=ia32

# mac平台
$ yarn add electron@5.0.13
```

>注意：mac平台安装需要注释掉`.npmrc`的内容
### 第三步
设置dll路径（可自定义dll加载路径，当前sdk demo指定了dll路径，参考代码如下）

```js
let dllPath = "";

if (process.env.NODE_ENV === "development") {
  dllPath = "node_modules/@xylink/xy-electron-sdk/dll";
} else {
  // 如果win使用scheme调用，需传入绝对路径
  dllPath =
    process.platform === "win32"
      ? path.join(path.dirname(process.execPath), "./dll")
      : "../Frameworks";
}

this.xyRTC = XYRTC.getInstance({
  httpProxy: proxy,
  model: this.model,
  dllPath,
});
```

## 本地开发

```
$ yarn dev
```

### 构建

```bash
# windows
$ yarn build:32

# mac
$ yarn build:mac
```
> 注意： 需在Mac电脑下构建Mac安装包；在windows电脑下构建windows安装包

构建完成后，在release/build目录下可得到对应的包。

### 文档

See our [xy electron sdk docs](https://openapi.xylink.com/common/meeting/doc/description?platform=electron)
