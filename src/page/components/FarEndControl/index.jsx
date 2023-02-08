import { defineComponent, reactive, computed } from 'vue';
import xyRTC from '@/utils/xyRTC';
import { SDKFECCCommand } from '@xylink/xy-electron-sdk';
import { farEndControlSupport } from '@/utils';
import { ElMessage as Message } from "element-plus";
import { farEndControlStore as useFarEndControlStore } from '@/store/index';
import  plusIcon from '@/style/img/svg/plus.svg';
import  minusIcon from '@/style/img/svg/minus.svg';
import  directionIcon from '@/style/img/svg/direction.svg';
import './index.scss';

export default defineComponent(() => {
  const farEndControlStore = useFarEndControlStore();
  const clickTime = {
    start: 0,
    end: 0
  };

  const directionInfo = reactive({
    isActive: false,
    direction: ''
  });

  const supportStateRef = computed(() => {
    return farEndControlSupport(farEndControlStore.feccOri)
  })

  const onFarEndControl = (command) => {
    const leftTime = clickTime.end - clickTime.start;

    // 超过200ms按持续遥控处理
    if (leftTime > 200) {
      return;
    }

    if (xyRTC) {
      if ([SDKFECCCommand.FECC_STEP_RIGHT, SDKFECCCommand.FECC_STEP_LEFT].includes(command) && !supportStateRef.value.supportHorizontal) {
        return;
      }
      if ([SDKFECCCommand.TILT_CAMERA_STEP_UP, SDKFECCCommand.TILT_CAMERA_STEP_DOWN].includes(command) && !supportStateRef.value.supportVertical) {
        return;
      }
      try {
        xyRTC.farEndHardwareControl(farEndControlStore.callUri, command, 30)
      } catch (error) {
        console.log('farEndHardwareControl error',error)
      }
    }
  }

  const onPress = (isActive, direction, command) => {
    // 记录按下的时间
    clickTime[isActive ? 'start' : 'end'] = new Date().getTime();
    directionInfo.isActive = isActive;
    directionInfo.direction = direction;

    if (xyRTC) {
      if (isActive && [SDKFECCCommand.FECC_TURN_LEFT, SDKFECCCommand.FECC_TURN_RIGHT].includes(command) && !supportStateRef.value.supportHorizontal) {
        Message({
          type: 'info',
          message: "当前没有可以左右转动的摄像头",
        })
        return;
      }
      if (isActive && [SDKFECCCommand.TILT_CAMERA_TURN_UP, SDKFECCCommand.TILT_CAMERA_TURN_DOWN].includes(command) && !supportStateRef.value.supportVertical) {
        Message({
          type: 'info',
          message: "当前没有可以上下转动的摄像头",
        })
        return;
      }
      if (!isActive && command === SDKFECCCommand.FECC_TURN_STOP && !supportStateRef.value.supportHorizontal) {
        return;
      }
      if (!isActive && command === SDKFECCCommand.TILT_CAMERA_TURN_STOP && !supportStateRef.value.supportVertical) {
        return;
      }
      try {
        xyRTC.farEndHardwareControl(farEndControlStore.callUri, command, 30)
      } catch (error) {
        console.log('farEndHardwareControl error',error)
      }
    }
  }
  return () => <div className="far-hard-control">
    {
      supportStateRef.value.supportZoom && <div
        className="item plus"
        onClick={() => onFarEndControl(SDKFECCCommand.FECC_STEP_ZOOM_IN)}
        onMousedown={() => onPress(true, '', SDKFECCCommand.FECC_ZOOM_IN)}
        onMouseup={() => onPress(false, '', SDKFECCCommand.FECC_ZOOM_TURN_STOP)}
      >
        <img class="control-direction" src={plusIcon} />
      </div>
    }
    <div className={directionInfo.isActive ? `control-direction-wrapper ${directionInfo.direction}` : 'control-direction-wrapper'}>
      <div className="top">
        <div
          className="item up"
          onClick={() => onFarEndControl(SDKFECCCommand.TILT_CAMERA_STEP_UP)}
          onMousedown={() => onPress(true, 'up', SDKFECCCommand.TILT_CAMERA_TURN_UP)}
          onMouseup={() => onPress(false, 'up', SDKFECCCommand.TILT_CAMERA_TURN_STOP)}
        >
          <img class="control-direction" src={directionIcon} />
        </div>
      </div>
      <div className="middle">
        <div
          className="item left"
          onClick={() => onFarEndControl(SDKFECCCommand.FECC_STEP_LEFT)}
          onMousedown={() => onPress(true, 'left', SDKFECCCommand.FECC_TURN_LEFT)}
          onMouseup={() => onPress(false, 'left', SDKFECCCommand.FECC_TURN_STOP)}
        >
          <img class="control-direction" src={directionIcon} />
        </div>
        <div
          className="item right"
          onClick={() => onFarEndControl(SDKFECCCommand.FECC_STEP_RIGHT)}
          onMousedown={() => onPress(true, 'right', SDKFECCCommand.FECC_TURN_RIGHT)}
          onMouseup={() => onPress(false, 'right', SDKFECCCommand.FECC_TURN_STOP)}
        >
          <img class="control-direction" src={directionIcon} />
        </div>
      </div>
      <div className="bottom">
        <div
          className="item bottom"
          onClick={() => onFarEndControl(SDKFECCCommand.TILT_CAMERA_STEP_DOWN)}
          onMousedown={() => onPress(true, 'bottom', SDKFECCCommand.TILT_CAMERA_TURN_DOWN)}
          onMouseup={() => onPress(false, 'bottom', SDKFECCCommand.TILT_CAMERA_TURN_STOP)}
        >
          <img class="control-direction" src={directionIcon} />
        </div>
      </div>
    </div>
    {
      supportStateRef.value.supportZoom && <div
        className="item minus"
        onClick={() => onFarEndControl(SDKFECCCommand.FECC_STEP_ZOOM_OUT)}
        onMousedown={() => onPress(true, '', SDKFECCCommand.FECC_ZOOM_OUT)}
        onMouseup={() => onPress(false, '', SDKFECCCommand.FECC_ZOOM_TURN_STOP)}
      >
        <img class="control-direction" src={minusIcon} />
      </div>
    }
  </div>
})