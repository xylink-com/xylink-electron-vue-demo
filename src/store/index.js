import { defineStore } from 'pinia'

export const useToolbarStore = defineStore('toolbar', {
  state: () => {
    return {
      enableHidden: true, // 是否启用隐藏
      canHidden: true, // 是否可以隐藏，操作栏打开某些操作/鼠标移入，不可以隐藏、
      show: true, // 是否显示
    }

  },
})

// 'XY' = 'xyLogin',
//   'EXTERNAL' = 'externalLogin',
//   'CALLING' = 'calling',
//   'MEETING' = 'meeting',
export const useCallStateStore = defineStore('callState', {
  state: () => {
    return {
      callState:'externalLogin'
    }
  }
});

/**
 * 遥控摄像头参数
 *
 * @property {boolean} show - 是否展示遥控操作按钮
 * @property {string} callUri - 支持遥控摄像头的终端标识
 * @property {number} feccOri - 支持遥控摄像头的终端的指令标识
 */
export const farEndControlStore = defineStore('farEndControl', {
  state: () => {
    return {
      show: false, // 是否显示
      callUri: '',
      feccOri: ''
    }
  }
});
