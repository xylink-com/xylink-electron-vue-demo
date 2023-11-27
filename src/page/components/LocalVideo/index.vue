<template>
    <canvas ref="canvas" class="local-video"></canvas>
</template>

<script setup>
    import { ref, watchEffect, onMounted, onBeforeUnmount, defineProps } from 'vue';
    import { Render, xyTimer } from '@xylink/xy-electron-sdk'
    import xyRTC from '@/utils/xyRTC';

    let timer = "local-video-timer";
    const canvas = ref();

    const props = defineProps({
        width: {
            type: Number,
            default() {
                return 320;
            }
        },

        height: {
            type: Number,
            default() {
                return 180;
            }
        },

        ratio: {
            type: Number,
            default() {
                return 16/9;
            }
        },

        stopCameraWhenDestroy: {
            type: Boolean,
            default() {
                return true;
            }
        }
    });

    const updateCanvasSize = () => {
        const { width, height, ratio } = props;
        const w = width || height * ratio;
        const h = w / ratio;
        const canvasElm = canvas.value;
        const dpr = window.devicePixelRatio || 1;

        if (canvasElm) {
            canvasElm.style.width = `${w}px`;
            canvasElm.style.height = `${h}px`;
            canvasElm.width = w * dpr;
            canvasElm.height = h * dpr;
        }
    }

    watchEffect(() => {
        updateCanvasSize();
    });

    onMounted(() => {
        if (!canvas.value)  return;

        updateCanvasSize();

        const render = new Render(canvas.value);

        // 开启摄像头
        xyRTC.startCamera();

        const animationFrame = () => {
            const frame = xyRTC.getVideoFrame('LocalPreviewID', false);

            if (frame.hasData) {
                const { buffer, width, height, rotation } = frame;
                render.draw(buffer, width, height, rotation);
            }
        }

        xyTimer.setInterval(timer, () => animationFrame(), 66.6);
    });

    onBeforeUnmount(() => {
        xyTimer.clearInterval(timer);
        props.stopCameraWhenDestroy && xyRTC.stopCamera();
    });
</script>
