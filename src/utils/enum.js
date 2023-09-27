/**
 * enum tools
 *
 * @author jinghui-Luo
 *
 * Created at     : 2020-08-24 16:11:04
 * Last modified  : 2022-06-02 15:15:01
 */
import { ACCOUNT } from "../config";
import { TemplateModel } from "@xylink/xy-electron-sdk";

export const USER_INFO = {
  phone: "+86-",
  password: "",
  meeting: "",
  meetingPassword: "",
  meetingName: "",
  extID: ACCOUNT.extId,
  extUserId: "",
  displayName: "",
  video: false,
  audio: false,
};

export const RECORD_STATE_MAP = {
  idel: 0, // 空闲 录制完成
  starting: 1, // 开始录制中
  acting: 2, // 正在录制中
  stoping: 3, // 停止录制中
  inact: 4, // 暂未使用 暂停录制相关，暂时用不到
};

/**
 * 布局视图分类
 *
 * @value normal 无content布局
 * @value content 有content布局
 */
export const LAYOUT_MODEL_MAP = {
  normal: [
    [
      {
        key: TemplateModel.SPEAKER,
        text: "缩略视图",
      },
    ],
    [
      {
        key: TemplateModel.GALLERY,
        text: "宫格视图",
      },
    ],
  ],
  content: [
    [
      {
        key: TemplateModel.MULTI_PIC_CONTENT_HIGH_PRIORITY,
        text: "缩略视图",
      },
      {
        key: TemplateModel.MULTI_PIC_ACTIVE_HIGH_PRIORITY,
        text: "缩略共享",
      },
      {
        key: TemplateModel.TWO_PIC_PIP,
        text: "共享视图",
      },
      {
        key: TemplateModel.CONTENT_ONLY,
        text: "共享全视图",
      },
      {
        key: TemplateModel.TWO_PIC_SYMMETRIC,
        text: "共享+演讲",
      },
    ],
    [
      {
        key: TemplateModel.GALLERY,
        text: "宫格视图",
      },
    ],
  ],
};

/**
 * 共享类型
 */
export const SharingType = {
  /** app */
  APP: 1,
  /** 屏幕共享 */
  SCREEN: 0,
}
