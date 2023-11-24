<template>
    <el-space :size="0" direction="vertical" class="video-effect-container">
        <div class="video-view">
            <LocalVideo
                :width="434"
                :height="244"
                :stopCameraWhenDestroy="stopCameraWhenDestroy"
            />

            <!-- 美颜、滤镜设置有效范围 -->
            <div class="video-effect-level" v-show="state.showLevelslider">
                <el-slider :debounce="66" size="small" v-model="state.level" @change="updateEffect" />

                <div @mousedown="switchToNoEffect" :class="{
                    'video-effect-contrast-btn': true,
                    'video-effect-contrast-btn-disabled': state.level === 0
                }"></div>
            </div>
        </div>

        <el-tabs v-model="state.selectedTab">
            <el-tab-pane label="虚拟背景" :name="VIRTUAL_BG">
                <VirtualBgEffect @change="onVirtualBgChange" />
            </el-tab-pane>
            <el-tab-pane label="美颜" :name="BEAUTY">
                <BeautyEffect @change="onBeautyChange" />
            </el-tab-pane>
            <el-tab-pane label="滤镜" :name="FILTER">
                <FilterEffect @change="onFilterChange" />
            </el-tab-pane>
        </el-tabs>

    </el-space>
</template>

<script setup>
import { reactive, onBeforeUnmount, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
import { useCallStateStore } from '@/store';
import { VideoBeautyStyle, VirtualBgMode, VideoFilterStyle } from '@xylink/xy-electron-sdk';
import { VideoEffectTabKey } from '@/utils/enum';
import store from '@/utils/videoEffectStore';
import { initVideoEffect } from '@/utils/initVideoEffect'
import LocalVideo from '../../LocalVideo';
import xyRTC from '@/utils/xyRTC';
import VirtualBgEffect from './VirtualBg';
import BeautyEffect from './Beauty';
import FilterEffect from './Filter';

const callStateStore = useCallStateStore();
const { VIRTUAL_BG, FILTER, BEAUTY } = VideoEffectTabKey;
const stopCameraWhenDestroy = callStateStore.callState !== 'meeting';

let isMouseDown = false;
let prevLevel = -1;
let virtualBgFile = { mode: VirtualBgMode.NONE, filePath: "" };

const state = reactive({
    level: 0,
    showLevelslider: true,
    selectedTab: VIRTUAL_BG,
});

/** 当前的视频效果 level */
const currentLevel = computed(() => {
    const { selectedTab } = state;

    if (selectedTab === BEAUTY) {
        return { ...store.getBeautyConfig() };
    }

    if (selectedTab === FILTER) {
        return { ...store.getFilterConfig() };
    }

    return { style: 0, level: 0 };
});

const updateState = () => {
    const { style, level } = currentLevel.value;
    state.level = level;
    state.showLevelslider = !!style && state.selectedTab !== VIRTUAL_BG;
}

watchEffect(() => {
    updateState();
});

const updateEffect = (level) => {
    const { selectedTab } = state;

    if (selectedTab === BEAUTY) {
        const { style } = store.updateBeautyLevel(level);
        xyRTC.setVideoBeautyEffect(style, level);
    }

    else if (selectedTab === FILTER) {
        const { style } = store.updateFilterLevel(level);
        xyRTC.setVideoFilterEffect(style, level);
    }
};

const switchToNoEffect = () => {
    isMouseDown = true;
    const { selectedTab } = state;

    if (selectedTab === VIRTUAL_BG) {
        xyRTC.setVirtualBgMode(VirtualBgMode.NONE);
    }

    if (prevLevel !== 0) {
        updateEffect(0);
        prevLevel = 0;
    }
}

const onVirtualBgChange = (mode, filePath = '') => {
    virtualBgFile = { mode, filePath };
}

const onBeautyChange = (style, level) => {
    const isNoneStyle = style === VideoBeautyStyle.NONE;
    state.showLevelslider = !isNoneStyle;
    state.level = isNoneStyle ? 0 : level;
}

const onFilterChange = (style, level) => {
    const isNoneStyle = style === VideoFilterStyle.NONE;
    state.showLevelslider = !isNoneStyle;
    state.level = isNoneStyle ? 0 : level;
}

const switchToCurrentEffect = () => {
    if (!isMouseDown) return;

    const { level, selectedTab } = state;

    if (selectedTab === VIRTUAL_BG) {
        const { mode, filePath } = virtualBgFile;
        xyRTC.setVirtualBgMode(mode);
        filePath && xyRTC.setVirtualBgImage(filePath);
    }

    if (prevLevel !== level && prevLevel >= 0) {
        updateEffect(level);
        prevLevel = level;
    }

    isMouseDown = false;
}

onBeforeMount(() => {
    initVideoEffect.init();
});

onMounted(() => {
    updateState();
    document.addEventListener('mouseup', switchToCurrentEffect);
});

onBeforeUnmount(() => {
    store.save();
    document.removeEventListener('mouseup', switchToCurrentEffect);
});

</script>

<style lang="scss">
@import '~@/style/var.scss';

.video-effect-container {
    width: 100%;

    .video-view {
        position: relative;
        width: fit-content;

        canvas {
            background-color: #000;
        }

        .video-effect-contrast-btn {
            width: 24px;
            height: 24px;
            cursor: pointer;
            border-radius: $border-radius;
            background-image: url(./assets/icons/originImage_normal.png);
            background-repeat: no-repeat;
            background-size: contain;
            margin-left: 12px;

            &-disabled {
                cursor: default;
                background-image: url(./assets/icons/originImage_disable.png);
            }

            &:not(&-disabled) {
                &:hover {
                    background-image: url(./assets/icons/originImage_hover.png);
                }

                &:active {
                    background-image: url(./assets/icons/originImage_selected.png);
                }
            }
        }

        &:hover .video-effect-level {
            display: flex;
        }

        .video-effect-level {
            display: flex;
            position: absolute;
            bottom: 8px;
            width: 300px;
            left: 50%;
            padding: 0 12px;
            border-radius: $border-radius;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.5);
            // display: none;
            align-items: center;
            justify-content: space-between;

            .el-slider__button {
                width: 16px;
                height: 16px;
                border-color: transparent;
            }
        }
    }

    .el-space__item {
        width: 100%;

        .ant-tabs-tab-btn {
            font-size: 13px;
        }

        .el-tabs__content {
            height: 124px;
            overflow: auto;
            padding-right: 16px;
            padding-bottom: 24px;

            &::-webkit-scrollbar {
                width: 4px;
            }

            &::-webkit-scrollbar-thumb {
                border-radius: 2px;
                background-color: #e5e7f1;
            }
        }
    }

    .el-tabs {
        height: 160px;
    }

    // 视频镜像
    .local-video {
        transform: rotateY(180deg);
    }

    .el-tabs .el-tabs-nav {
        margin-bottom: 0;
    }

    .el-tabs-tab {
        padding: 8px 0;
    }
}
</style>
