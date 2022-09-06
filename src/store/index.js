import { defineStore } from 'pinia'

export const useToolbarStore = defineStore('toolbar', {
  state: () => {
    return {
      enableHidden: true, // 是否启用隐藏
      canHidden: true, // 是否可以隐藏，操作栏打开某些操作/鼠标移入，不可以隐藏、
      show: true, // 是否显示
    }

  },
  getters() { },
  actions: {

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
