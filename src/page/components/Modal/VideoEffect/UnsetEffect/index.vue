<template>
    <div :class="`video-effect-unset-item ${props.class}`">
        <el-icon><CircleCloseFilled /></el-icon>
    </div>
</template>

<script setup>
    import { defineProps } from 'vue';
    import './index.scss';
    
    const props = defineProps(['class']);
</script>
