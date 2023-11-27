<template>
    <div class="video-beauty-wrapper">
        <div
            @click="handleSelect(NONE, $event)"
            :class="getItemClassName(state.style === NONE)"
        >
            <div class="video-beauty-item-inner">
                <UnsetEffect />
            </div>
            <div class="video-beauty-item-label">无</div>
        </div>

        <div
            :key="value"
            :class="getItemClassName(value === state.style)"
            v-for="({ label, value, img, activeImg }) in effectList"
            @click="handleSelect(value, $event)"
        >
            <div class="video-beauty-item-inner">
                <div>
                    <img draggable="false" :src="state.style === value ? activeImg : img" :alt="label" />
                </div>
            </div>
            <div class="video-beauty-item-label">{{ label }}</div>
        </div>
    </div>
</template>

<script setup>
import { defineEmits, reactive } from 'vue';
import { VideoBeautyStyle } from '@xylink/xy-electron-sdk';
import store from '@/utils/videoEffectStore';
import xyRTC from '@/utils/xyRTC';
import UnsetEffect from '../UnsetEffect';
import { effectList } from './config';
import './index.scss';

const { NONE } = VideoBeautyStyle;
const emit = defineEmits(['change']);
const state = reactive({ ...store.selectedBeauty });

const getItemClassName = (selected) => {
    return {
        'video-beauty-item': true,
        'selected-item': selected
    };
}

const handleSelect = (value) => {
    store.updateSelectedBeauty(value);
    state.style = value;

    // 获取当前的 level
    const { level } = store.getBeautyConfig(value);
    emit('change', value, level);
    store.save();

    // 下发更新视频效果
    xyRTC.setVideoBeautyEffect(value, level);
}
</script>
