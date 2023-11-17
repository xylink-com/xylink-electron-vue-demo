<template>
    <div :class="`video-effect-unset-item ${props.class}`">
        <el-icon><CircleCloseFilled /></el-icon>
    </div>
</template>

<script setup>
    import { defineProps } from 'vue';
    
    const props = defineProps(['class']);
</script>

<style lang="scss">
.video-effect-unset-item {
    display: flex;
    .el-icon {
        margin: auto;
        font-size: 20px;
    }
    background-color: #e5e7f1;
}
</style>
