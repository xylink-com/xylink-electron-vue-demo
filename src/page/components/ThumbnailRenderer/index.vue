<script setup>
import { defineProps, ref, watchEffect, computed, toRefs } from "vue";
import { argbToRgba } from '@/utils';

const props = defineProps({
    width: Number,
    height: Number,
    buffer: Uint8Array,
    toRGBA: Boolean,
});
const { width, height } = toRefs(props);
const canvas = ref(null);

const toUint8Buf = (buf) => {
    return buf instanceof Uint8Array ? buf : new Uint8Array(buf);
}

const rgbaBuffer = computed(() => {
    const { toRGBA, buffer } = props;
    return toRGBA ? argbToRgba(buffer.slice(0)) : toUint8Buf(buffer);
});

watchEffect(() => {
    const canvasElm = canvas.value;
    const ctx = canvasElm?.getContext('2d');
    if (ctx) {
        ctx.clearRect(0, 0, canvasElm.width, canvasElm.height);
        const array = new Uint8ClampedArray(rgbaBuffer.value.buffer);
        const image = new ImageData(array, width.value, height.value);
        ctx.putImageData(image, 0, 0);
    }
});
</script>

<template>
    <canvas
        v-if="width && height"
        :width="width"
        :height="height"
        ref="canvas"
    ></canvas>
</template>