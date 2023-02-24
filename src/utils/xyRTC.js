import { XYRTC } from '@xylink/xy-electron-sdk';
import Store from "electron-store";
import { DEFAULT_PROXY, ACCOUNT } from "../config";

const store = new Store();
const proxy = store.get("xyHttpProxy") || DEFAULT_PROXY;
const MODEL = store.get("xyLayoutModel") || "CUSTOM";

let dllPath = "";

if (process.env.NODE_ENV === "development") {
  dllPath = "node_modules/@xylink/xy-electron-sdk/dll";
} else {
  // 如果windows使用scheme调用，需传入绝对路径, 例：path.join(path.dirname(process.execPath)
  dllPath = process.platform === "win32" ? "./dll" : "../Frameworks";
}

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

console.log('xyRTC get instance');

export default RTC.getInstance({
  clientId: ACCOUNT.clientId,
  clientSecret: ACCOUNT.clientSecret,
  httpProxy: proxy,
  model: MODEL,
  dllPath,
});
