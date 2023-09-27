import { defineStore } from "pinia";
import { EventType, ProcessType } from "@xylink/xy-electron-sdk";

export const useToolbarStore = defineStore("toolbar", {
  state: () => {
    return {
      enableHidden: true, // 是否启用隐藏
      canHidden: true, // 是否可以隐藏，操作栏打开某些操作/鼠标移入，不可以隐藏、
      show: true, // 是否显示
    };
  },
});

// 'XY' = 'xyLogin',
//   'EXTERNAL' = 'externalLogin',
//   'CALLING' = 'calling',
//   'MEETING' = 'meeting',
export const useCallStateStore = defineStore("callState", {
  state: () => {
    return {
      callState: "externalLogin",
    };
  },
});

/**
 * 遥控摄像头参数
 *
 * @property {boolean} show - 是否展示遥控操作按钮
 * @property {string} callUri - 支持遥控摄像头的终端标识
 * @property {number} feccOri - 支持遥控摄像头的终端的指令标识
 */
export const farEndControlStore = defineStore("farEndControl", {
  state: () => {
    return {
      show: false, // 是否显示
      callUri: "",
      feccOri: "",
    };
  },
});

/**
 * 会控互动工具相关数据，兼容签到、答题、投票等
 *
 * @property {ICopywriting} copywriting - 弹窗内容、左侧顶部状态栏内容
 * @property {EventType} eventType - 互动事件 start end publish RESULT_CLOSE
 * @property {ProcessType} processType - 互动工具业务类型：签到 答题 投票 评价
 * @property {string} questionnaireId - 业务id
 * @property {boolean} endAuto - 是否自动结束（有倒计时），还是手动结束
 * @property {number}} duration - 期限，比如签到剩余时间
 * @property {webViewUrl} webViewUrl - h5页面url
 * @property {number} endUtcTime - 结束时间
 */
export const useInteractive = defineStore("interactive", {
  state: () => {
    return {
      copywriting: {
        dialogContent: "",
        dialogLabel: "",
        dialogSubContent: "",
        dialogTitle: "",
        notifyContent: "",
        notifyLabel: "",
      },
      duration: 0,
      endAuto: false,
      endUtcTime: 0,
      eventType: EventType.RESULT_CLOSE,
      meetingId: "",
      processType: ProcessType.NONE,
      webViewUrl: "",
      questionnaireId: "",
      business: "",
    };
  },
});

/**
 * 签到状态维护
 *
 * @property {boolean} modal - 签到弹窗是否关闭
 * @property {boolean} promp - 左上角签到状态栏是否关闭
 * @property {boolean} isSuccess - 是否已经签到成功
 *
 */
export const useSignIn = defineStore("signIn", {
  state: () => {
    return {
      modal: false,
      promp: false,
      isSuccess: false,
    };
  },
});

/**
 * 共享状态（暂停、开启、共享类型）
 */
export const useContentSharing = defineStore('contentSharing', {
  state: () => {
    return {
      isPaused: false,
      // -1: INVALID
      type: -1,
      dialogVisible: false,
      isManualPaused: false
    }
  }
});
