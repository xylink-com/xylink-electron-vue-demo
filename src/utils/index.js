/**
 * Tools lib
 * @authors Luo-jinghui (luojinghui424@gmail.com)
 * @date  2020-04-28 17:26:40
 */

// CUSTOM 自定义布局时，需要自行计算Layout容器信息
export const getScreenInfo = (elementId, nextTemplateRate, offset = [0,0]) => {
  let { clientHeight, clientWidth } =
    document.getElementById(elementId) || document.body;

  clientHeight = clientHeight - offset[0];
  clientWidth = clientWidth - offset[1];

  const rateHeight = Math.floor(clientWidth * nextTemplateRate);
  const rateWidth = Math.floor(clientHeight / nextTemplateRate);
  const screenInfoObj = { rateHeight: 0, rateWidth: 0 };

  // 高充足，以屏幕宽计算高
  if (clientHeight > rateHeight) {
    screenInfoObj.rateHeight = rateHeight;
    screenInfoObj.rateWidth = clientWidth;
  } else {
    // 否则，以比例宽计算高
    screenInfoObj.rateHeight = clientHeight;
    screenInfoObj.rateWidth = rateWidth;
  }

  console.log('getScreenInfo:',screenInfoObj);
  return screenInfoObj;
};
/**
 * 防抖函数
 *
 * @param fn Event function
 * @param wait 等待多少毫秒触发
 */
export const throttle = function (fn, wait) {
  let lastTime = 0;

  return function () {
    const nowTime = +new Date();
    // @ts-ignore
    const context = this;
    const args = arguments;

    if (nowTime - lastTime > wait || !lastTime) {
      fn.apply(context, args);
      lastTime = nowTime;
    }
  };
};


/**
 * 判断终端是否支持遥控摄像头
 * 当前摄像头所支持的指令集, onVideoStreamChanged#SDKVideoStreamInfo.feccOri
 * (feccOri & 1 << 1) != 0 : 支持水平方向上的转动 (左右)
 * (feccOri & 1 << 2) != 0 : 支持垂直方向上的转动 (上下)
 * (feccOri & 1 << 4) != 0 : 支持缩放
 *
 * @param {number | undefined} feccOri 终端指令
 * @return {object} 是否支持水平、垂直、缩放、前三种全部支持
 */
export const farEndControlSupport = (feccOri) => {
  if (typeof feccOri !== 'number') {
    return {
      supportHorizontal: false,
      supportVertical: false,
      supportZoom: false,
      supportSome: false
    }
  }
  const supportHorizontal = (feccOri & 1 << 1) != 0;
  const supportVertical = (feccOri & 1 << 2) != 0;
  const supportZoom = (feccOri & 1 << 4) != 0;
  const supportSome = supportHorizontal || supportVertical || supportZoom;
  return {
    supportHorizontal,
    supportVertical,
    supportZoom,
    supportSome
  }
}
