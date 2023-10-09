<script setup>
import { reactive, onBeforeUnmount, watchEffect } from "vue";
import xyRTC from "@/utils/xyRTC";
import { SharingType } from "@/utils/enum";
import { useContentSharing } from "@/store";
import ThumbnailRenderer from "@/page/components/ThumbnailRenderer/index.vue";

const sharingState = useContentSharing();

const state = reactive({
    contentList: []
});

const thumbnailsMap = new Map();
let loopTimer = 0;

/** 关闭弹窗 */
const onClose = () => {
    sharingState.$patch({
        dialogVisible: false
    });
}

/** 开始共享 */
const startContent = (content) => {
    console.log('startContent: ', content);
    
    const { type, info } = content;
    const payload = {
        contentCaptureType: type,
        /** audioStream and videoStream */
        contentStreamMode: 3,
        contentInfo: {
            source: '',
            /** 共享时是否采集电脑声音 */
            withAudio: true,
            /** 是否视频流畅度优先 */
            enableFluentMode: false,
            localContentPreview: false,
        },
    };

    if (type === SharingType.APP) {
        payload.contentInfo.viewId = info.hwnd;
        xyRTC.startSendContent(payload);
    } else if (type === SharingType.SCREEN) {
        payload.contentInfo.source = info.monitorName;
        xyRTC.startSendContent(payload);
    }
    sharingState.$patch({
        type,
        dialogVisible: false,
    });
}

/** 获取缩略图列表 */
const getThumbnailList = () => {
    const thumbnails = [];
    /** 获取屏幕缩略图 */
    const monitorNameList = xyRTC.getMonitorList();

    monitorNameList.forEach((monitorName, index) => {
        const monitor = thumbnailsMap.get(monitorName);

        if (monitor) {
            thumbnails.push(monitor);
        }
        else {
            /** 获取缩略图，创建新的缩略图数据 */
            const monitorThumb = xyRTC.getMonitorThumbnail(monitorName);

            if (monitorThumb.hasData) {
                const info = {
                    info: monitorThumb,
                    key: monitorName,
                    name: index === 0 ? '当前屏幕' : `共享屏幕${index}`,
                    type: SharingType.SCREEN
                };
                thumbnails.push(info);
                thumbnailsMap.set(info.key, info);
            }
        }
    });

    /** 获取 app 缩略图 */
    const appInfoList = xyRTC.getAppList();

    for (let appInfo of appInfoList) {
        const { hwnd, appName } = appInfo;
        const appContentInfo = thumbnailsMap.get(hwnd);

        if (appContentInfo) {
            thumbnails.push(appContentInfo);
        } else {
            const appData = { ...xyRTC.getAppThumbnail(hwnd), ...appInfo };

            // 有些应用可能获取的缩略图有问题，比如任务管理器，需要判断一下是是不是有问题的图片，
            // 如果有问题则使用 icon 代替
            !appData.hasData && Object.assign(appData, xyRTC.getAppIcon(hwnd));

            if (!appData.hasData) continue; // 如果缩略图和 icon 都拿不到，则直接过滤掉
            const content = {
                info: appData,
                key: hwnd,
                type: SharingType.APP,
                name: appName.split(' - ')[0],
            }
            thumbnails.push(content);
            thumbnailsMap.set(content.key, content);
        }
    }
    return thumbnails;
}

const setThumbList = (thumbnails) => {
    state.contentList = thumbnails;
}

const startLoop = () => {
    if (!sharingState.dialogVisible) return stopLoop();
    const thumbnails = getThumbnailList();
    setThumbList(thumbnails);
    loopTimer = window.setTimeout(startLoop, 2000);
}

const stopLoop = () => {
    window.clearTimeout(loopTimer);
    setThumbList([]);
}

/** 轮询获取列表 */
watchEffect(() => {
    sharingState.dialogVisible ? startLoop() : stopLoop();
});

onBeforeUnmount(() => {
    window.clearTimeout(loopTimer);
});

</script>

<template>
    <el-dialog
        width="600px"
        @close="onClose"
        top="60px"
        :close-on-click-modal="false"
        modal-class="sharing-thumbnail-modal"
        title="内容共享"
        v-model="sharingState.dialogVisible"
    >
        <div class="thumbnail-list">
            <div class="thumbnail-item" v-for="(item) in state.contentList" :key="item.key" @click="startContent(item)">
                <div class="thumbnail-item-inner">
                    <ThumbnailRenderer :height="item.info.height" :width="item.info.width" :buffer="item.info.buffer" />
                </div>
                <div class="thumbnail-item__label">{{ item.name }}</div>
            </div>
        </div>
    </el-dialog>
</template>

<style scoped lang="scss">
.thumbnail-list {
    display: flex;
    flex-wrap: wrap;
}

.thumbnail-item {
    width: 180px;
    height: 120px;
    display: flex;
    align-items: center;
    flex-direction: column;
    margin-bottom: 16px;

    &-inner {
    height: 90px;
    width: 144px;
    cursor: pointer;
    overflow: hidden;
    display: flex;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.1);

        canvas {
            max-width: 100%;
            max-width: 100%;
        }
    }

    &__label {
        max-width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        padding-top: 8px;
    }
}
</style>

<style lang="scss">
    .sharing-thumbnail-modal .el-dialog__body {
        max-height: 360px;
        overflow-y: auto;
    }
</style>
