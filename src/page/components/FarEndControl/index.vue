
<script setup>
import { reactive, computed } from 'vue';
import xyRTC from '@/utils/xyRTC';
import { SDKFECCCommand } from '@xylink/xy-electron-sdk';
import { farEndControlSupport } from '@/utils';
import { ElMessage as Message } from "element-plus";
import { farEndControlStore as useFarEndControlStore } from '@/store/index';
import plusIcon from '@/style/img/svg/plus.svg';
import minusIcon from '@/style/img/svg/minus.svg';
import directionIcon from '@/style/img/svg/direction.svg';
import './index.scss';

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
            console.log('farEndHardwareControl error', error)
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
            console.log('farEndHardwareControl error', error)
        }
    }
}
</script>
<template>
    <div class="far-hard-control">
        <div v-if="supportStateRef.supportZoom" class="item plus" @click="() =>
        onFarEndControl(SDKFECCCommand.FECC_STEP_ZOOM_IN)"
            @mousedown="() => onPress(true, '', SDKFECCCommand.FECC_ZOOM_IN)"
            @mouseup="() => onPress(false, '', SDKFECCCommand.FECC_ZOOM_TURN_STOP)">
            <img class="control-direction" :src="plusIcon" />
        </div>
        <div :class="{ 'control-direction-wrapper': true, [directionInfo.direction]: directionInfo.isActive }">
            <div class="top">
                <div class="item up" @click="() => onFarEndControl(SDKFECCCommand.TILT_CAMERA_STEP_UP)"
                    @mousedown="() => onPress(true, 'up', SDKFECCCommand.TILT_CAMERA_TURN_UP)"
                    @mouseup="() => onPress(false, 'up', SDKFECCCommand.TILT_CAMERA_TURN_STOP)">
                    <img class="control-direction" :src="directionIcon" />
                </div>
            </div>
            <div class="middle">
                <div class="item left" @click="() => onFarEndControl(SDKFECCCommand.FECC_STEP_LEFT)"
                    @mousedown="() => onPress(true, 'left', SDKFECCCommand.FECC_TURN_LEFT)"
                    @mouseup="() => onPress(false, 'left', SDKFECCCommand.FECC_TURN_STOP)">
                    <img class="control-direction" :src="directionIcon" />
                </div>
                <div class="item right" @click="() => onFarEndControl(SDKFECCCommand.FECC_STEP_RIGHT)"
                    @mousedown="() => onPress(true, 'right', SDKFECCCommand.FECC_TURN_RIGHT)"
                    @mouseup="() => onPress(false, 'right', SDKFECCCommand.FECC_TURN_STOP)">
                    <img class="control-direction" :src="directionIcon" />
                </div>
            </div>
            <div class="bottom">
                <div class="item bottom" @click="() => onFarEndControl(SDKFECCCommand.TILT_CAMERA_STEP_DOWN)"
                    @mousedown="() => onPress(true, 'bottom', SDKFECCCommand.TILT_CAMERA_TURN_DOWN)"
                    @mouseup="() => onPress(false, 'bottom', SDKFECCCommand.TILT_CAMERA_TURN_STOP)">
                    <img class="control-direction" :src="directionIcon" />
                </div>
            </div>
        </div>
        <div v-if="supportStateRef.supportZoom" class="item minus" @click="() =>
        onFarEndControl(SDKFECCCommand.FECC_STEP_ZOOM_OUT)"
            @mousedown="() => onPress(true, '', SDKFECCCommand.FECC_ZOOM_OUT)"
            @mouseup="() => onPress(false, '', SDKFECCCommand.FECC_ZOOM_TURN_STOP)">
            <img class="control-direction" :src="minusIcon" />
        </div>
    </div>
</template>