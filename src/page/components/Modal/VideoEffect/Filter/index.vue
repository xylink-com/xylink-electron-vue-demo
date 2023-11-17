<template>
    <div className='video-filter-wrapper'>
        <div
            @click="handleSelect(NONE, $event)"
            :class="getItemClassName(state.style === NONE)"
        >
            <div class="video-filter-item-inner">
                <UnsetEffect />
            </div>
            <div className='video-filter-item-label'>无</div>
        </div>

        <div
            v-for="({ value, img, label }) in effectList"
            :key="value"
            @click="handleSelect(value, $event)"
            :class="getItemClassName(state.style === value)"
        >
            <div class="video-filter-item-inner">
                <img draggable="false" v-if="(typeof img === 'string')" :src="img" :alt="label" />
            </div>
            <div className='video-filter-item-label'>{{ label }}</div>
        </div>
    </div>

</template>

<script setup>
import { reactive, defineEmits } from 'vue';
import xyRTC from '@/utils/xyRTC';
import { VideoFilterStyle } from '@xylink/xy-electron-sdk';
import store from '@/utils/videoEffectStore';
import UnsetEffect from '../UnsetEffect';
import { effectList } from './config';

const emit = defineEmits(['change']);

const { NONE } = VideoFilterStyle;

const state = reactive({...store.selectedFilter});

const getItemClassName = (selected) => {
    return {
        'video-filter-item': true,
        'selected-item': selected
    };
}

const handleSelect = (style) => {
    const { level } = store.getFilterConfig(style);

    store.updateSelectedFilter(style);
    state.style = style;
    // 获取当前的 level
    emit('change', style, level);
    store.save();
    // 下发更新视频效果
    xyRTC.setVideoFilterEffect(style, level);
}
</script>

<style lang="scss">
@import '~@/style/var.scss';

.video-filter-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.video-filter-item {
    cursor: pointer;
    text-align: center;
    color: $lighter-color;
    font-size: 12px;

    &-label {
        padding-top: 4px;
    }

    &:hover &-inner {
        border-color: $primary-color;
    }

    &.selected-item {
        color: $primary-color;
        
        .video-filter-item-inner {
            border-color: $primary-color;
        }
    }

    &-inner {
        height: 54px;
        width: 54px;
        border-radius: 3px;
        overflow: hidden;
        display: flex;
        border: 2px solid transparent;

        img, .video-effect-unset-item {
            height: 48px;
            width: 48px;
            margin: auto;
        }
    }
}
</style>
