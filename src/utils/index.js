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

export const debounce = function (fn, delay, atleast) {
  let timer;
  let previous;
  return function (...args) {
    const now = +new Date();
    const context = this;

    timer && clearTimeout(timer);
    if (!previous) {
      previous = now;
    }

    if (now - previous >= atleast) {
      fn.apply(context, args);
      previous = now;
    } else {
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
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


/**
 * argb图片转rgba
 * 
 * @param {ArrayBuffer} src argb array buffer
 * @param {boolean} convertAlpha 是否转换 alpha 通道
 * @returns {Uint8Array} 转换后的 rgba 数据
 */
export const argbToRgba = (src, convertAlpha = false) => {
  const uint8Arr = new Uint8Array(src);
  for (let i = 0; i < uint8Arr.byteLength; i += 4) {
    const b = uint8Arr[i];
    const g = uint8Arr[i + 1];
    const r = uint8Arr[i + 2];
    const a = uint8Arr[i + 3];
    uint8Arr[i] = r;
    uint8Arr[i + 1] = g;
    uint8Arr[i + 2] = b;
    uint8Arr[i + 3] = convertAlpha ? a || 255 : a;
  }
  return uint8Arr;
}

/**
 * 判断图片数据是不是有问题的图片，
 * alpha 通道是 0，alpha 通道是 255，rgb 都是 0
 * 
 * @param {ArrayBuffer} array argb or rgba array buffer
 * @returns {boolean} true: 图片有问题；false：正常的图片
*/
export const isBlackImg = (array) => {
  let isBlack = true;
  const uint8Arr = array instanceof Uint8Array ? array : new Uint8Array(array);
  for (let i = 0; i < uint8Arr.byteLength; i += 4) {
    const c1 = uint8Arr[i];
    const c2 = uint8Arr[i + 1];
    const c3 = uint8Arr[i + 2];
    const c4 = uint8Arr[i + 3];
    const sum = c1 + c2 + c3 + c4;
    const flag = sum === 0 || (sum === 255 && c4 == 255);
  
    if (!flag) {
      isBlack = false;
    }
  }
  return isBlack;
};
