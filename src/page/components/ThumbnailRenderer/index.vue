<script setup>
import { defineProps, ref, watchEffect, toRefs } from "vue";

const props = defineProps({
    width: Number,
    height: Number,
    buffer: Uint8Array,
});
const { width, height } = toRefs(props);
const canvas = ref(null);

watchEffect(() => {
    const canvasElm = canvas.value;
    const ctx = canvasElm?.getContext('2d');
    if (ctx) {
        ctx.clearRect(0, 0, canvasElm.width, canvasElm.height);
        const array = new Uint8ClampedArray(props.buffer);
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