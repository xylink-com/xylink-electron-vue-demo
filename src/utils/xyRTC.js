import { XYRTC } from '@xylink/xy-electron-sdk';
// import store from './store';

class RTC {
  static instance = null;

  static getInstance(config) {
    if (!RTC.instance) {
      if(!config){
        throw new Error('无配置参数');
      }

      RTC.instance = XYRTC.getXYInstance(config);
    }

    return RTC.instance;
  }
}

export default RTC;
