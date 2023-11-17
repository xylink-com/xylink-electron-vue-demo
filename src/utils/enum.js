/**
 * enum tools
 *
 * @author jinghui-Luo
 *
 * Created at     : 2020-08-24 16:11:04
 * Last modified  : 2022-06-02 15:15:01
 */
import { ACCOUNT } from "../config";
import { TemplateModel, VideoBeautyStyle, VideoFilterStyle } from "@xylink/xy-electron-sdk";

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
};

/**
 * 设置弹窗中的菜单
 */
export const SettingMenu = {
  /** 常规设置 */
  COMMON: 1,
  /** 虚拟背景和美颜 */
  VIDEO_EFFECT: 2,
};

/**
 * 美颜、滤镜、虚拟背景 tab key
 */
export const VideoEffectTabKey = {
  VIRTUAL_BG: 'virtual-bg',
  FILTER: 'filter',
  BEAUTY: 'beauty',
};

/**
 * 虚拟背景类型，自定义和预置
 */
export const IVirtualBgType = {
  PRESET: 'preset',
  CUSTOM: 'custom',
};


/**
 * 虚拟背景配置
 * 
 * @param {string} VIRTUALIZATION - 背景虚化
 * @param {number} MAX_IMG_SIZE - 图片最大值，10MB
 * @param {string} ALLOW_MIME - 允许上传的图片类型
 * @param {number} MAX_CUSTOM_NUM - 最大自定义图片数量
 */
export const VIRTUAL_BG = {
  VIRTUALIZATION: 'VIRTUALIZATION',
  MAX_IMG_SIZE: 10,
  ALLOW_MIME: 'image/jpeg, image/png',
  MAX_CUSTOM_NUM: 10,
};

/** 保存自定义背景图的目录名，在 userData 目录下会新建这个目录 */
export const VIRTUAL_BG_DIR = 'virtual-bg';

/**
 * 虚拟背景/美颜/滤镜 默认配置
 */
export const DEFAULT_VIDEO_EFFECT_CONFIG = {
  selected: {
    beauty: { style: VideoBeautyStyle.NONE },
    filter: { style: VideoFilterStyle.NONE },
  },

  beautyMap: {},
  filterMap: {},

  virtualBg: {
    list: []
  },
}
