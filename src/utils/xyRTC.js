import { XYRTC } from '@xylink/xy-electron-sdk';
// import store from './store';

class RTC {
  static instance = null;

  static getInstance(config) {
    if (!RTC.instance) {
      if(!config){
        throw new Error('无配置参数');
      }
      // const settingInfo = store.get('xySettingInfo') || {};

      // const {
      //   clientId = '',
      //   clientSecret = '',
      //   proxy = 'cloud.xylink.com',
      //   model = LayoutModel.AUTO,
      // } = settingInfo;

      // const platformName = process.platform === 'win32' ? 'win32' : 'mac';
      // const dllPrdPath =
      //   process.platform === 'win32' ? './dll' : '../Frameworks';

      const instanceConfig = config ;
      // || {
      //   clientId,
      //   clientSecret,
      //   httpProxy: proxy,
      //   model,
      //   // 动态设置环境，当构建正式包时，dll从当前程序的dll目录加载，dev开发时，从sdk目录加载
      //   dllPath:
      //     process.env.NODE_ENV === 'development'
      //       ? `../cpp_sdk/${platformName}/dll`
      //       : dllPrdPath,
      //   // logPath,
      //   container: {
      //     elementId: 'container',
      //   },
      // };\
      RTC.instance = XYRTC.getXYInstance(instanceConfig);
    }

    return RTC.instance;
  }
}

export default RTC;
