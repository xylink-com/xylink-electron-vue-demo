# xy-electron-sdk-vue-demo

注意：详细配置方式见 sdk 文档，针对 vue 项目的配置见当前项目。

## Project setup

```
# step1:
$ yarn

# step2:
# 安装完成后，安装32位electron，版本随意
$ yarn add electron@5.0.13 -D --arch=ia32

# step3:
# 使用 yarn 或 npm 安装完成  @xylink/xy-electron-sdk 后，在项目根目录：node_modules -> @xylink -> xy-electron-sdk -> dll 文件夹下，将所有的文件复制到当前项目的根目录上；

# step4:
# 执行完步骤三，项目根目录会存在一个"I420ToARGB.cso"文件，将此文件复制到：node_modules\electron\dist 目录下；
# 注意：步骤四是解决本地开发时，调用摄像头采集crash的问题，打正式包时，此步骤不需要，会自动copy此文件。
```

### Compiles and hot-reloads for development

```
$ yarn dev
```

### Compiles and minifies for production

```
$ yarn build:32
```

### Docs

See our [xy electron sdk docs](https://www.yuque.com/jinghui/xylink/gbi9i5)
