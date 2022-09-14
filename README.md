# xy-electron-sdk-vue-demo

注意：详细配置方式见 sdk 文档，针对 vue 项目的配置见当前项目。

## 准备工作
在开始系统集成开发之前，您需要完成相应的 [准备工作](https://openapi.xylink.com/common/meeting/doc/ready_work?platform=electron)，包括开通云视讯 API 服务、注册应用，了解系统架构。

上述操作完成后，将获取到的`extId`、`clientId`、`clientSecret`配置到 [src/config/index.js](src/config/index.js) 文件中
```js
export const ACCOUNT = {
  extId: '',
  clientId: '',
  clientSecret: '',
};
```

## 集成开发
### 第一步
安装依赖之前，检查`.npmrc`中配置

windows环境下配置如下
```bash
arch=ia32
platform=win32
```
mac环境下，需要注释掉上述配置
```bash
# arch=ia32
# platform=win32
```
### 第二步
安装依赖
```bash
# 安装依赖
$ yarn
```

### 第三步
electron包安装，版本随意，此处演示
```bash
# window 安装32位electron
$ yarn add electron@5.0.13 -D --arch=ia32

# mac平台
$ yarn add electron@5.0.13
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

构建完成后，在dist_electron目录下可得到对应的包。

### 文档

See our [xy electron sdk docs](https://openapi.xylink.com/common/meeting/doc/description?platform=electron)
