import { defineStore } from 'pinia'

export const toolbarStore = defineStore('toolbar', {
  state: () => {
    return {
      enableHidden: true, // 是否启用隐藏
      canHidden: true, // 是否可以隐藏，操作栏打开某些操作/鼠标移入，不可以隐藏、
      show: true, // 是否显示
    }

  },
  getters(){},
  actions: {

  },
})
