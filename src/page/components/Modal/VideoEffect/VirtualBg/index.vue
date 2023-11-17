<template>
    <div className='virtual-bg'>
        <!-- 不设置虚拟背景 -->
        <UnsetEffect
            @click="setVirtualBg('', '')"
            :class="getItemClassName(!state.selectedId)"
        />

        <!-- 背景虚化 -->
        <div @click="setVirtualBg(VIRTUALIZATION, '')" :class="getItemClassName(state.selectedId === VIRTUALIZATION)">
            <img :src="bg_01" draggable="false" />
        </div>

        <!-- 预置虚拟背景图片 -->
        <div v-for="(item) in state.bgImgList" :key="item.id" @click="handleSelectBg(item)"
            :class="getItemClassName(item.id === state.selectedId)">
            <img
                draggable="false"
                :src="closeIcon"
                class="close-icon"
                @click.stop="() => handleDelBg(item)"
                v-if="item.type !== IVirtualBgType.PRESET"
            />
            <img :src="item.url" />
        </div>

        <!-- 自定义虚拟背景 -->
        <el-tooltip content="上传16:9比例图片效果最佳">
            <label v-if="customNum < MAX_CUSTOM_NUM" class="virtual-bg-item add-item">
                <input hidden type="file" :accept="ALLOW_MIME" @change="addNewBg" />
                <el-icon>
                    <Plus />
                </el-icon>
                <div>添加图片</div>
            </label>
        </el-tooltip>
    </div>
</template>

<script setup>
import xyRTC from '@/utils/xyRTC';
import { ElMessage } from 'element-plus';
import { defineEmits, reactive, onMounted, onBeforeUnmount, computed } from 'vue';
import { VIRTUAL_BG } from '@/utils/enum';
import { IVirtualBgType } from '@/utils/enum';
import { isJPEG, isPNG } from '@/utils/file';
import { VirtualBgMode } from '@xylink/xy-electron-sdk';
import { bgManager } from '@/utils/virtualBgManager';
import UnsetEffect from '../UnsetEffect';

import closeIcon from '../assets/icons/close.png';
// 背景虚化的图片
import bg_01 from '../assets/virtual-bg/vb_01.png';

const message = {
    error: (message) => {
        ElMessage({
            type: "error",
            message,
            duration: 2000,
        });
    },
};

const { VIRTUALIZATION, MAX_IMG_SIZE, ALLOW_MIME, MAX_CUSTOM_NUM } = VIRTUAL_BG;

const emit = defineEmits(['change']);
const state = reactive({
    bgImgList: bgManager.getCacheData(),
    selectedId: bgManager.selectedInfo.selectedId
});

const getMode = (id) => {
    let mode = VirtualBgMode.BG_IMAGE;

    if (!id) {
        mode = VirtualBgMode.NONE;
    } else if (id === VIRTUALIZATION) {
        mode = VirtualBgMode.BG_BLUR;
    }
    return mode;
}

/**
 * 设置虚拟背景图
 * 
 * @param {string} id 虚拟背景 id
 * @param {string} path 虚拟背景图片文件路径
 */
const setVirtualBg = (id, path) => {
    const mode = getMode(id);
    xyRTC.setVirtualBgMode(mode);
    path && xyRTC.setVirtualBgImage(path);

    state.selectedId = id;
    emit('change', mode, path);
}

const getItemClassName = (selectedFlag) => {
    return {
        'virtual-bg-item': true,
        'selected-item': selectedFlag
    };
}

/**
 * 选中虚拟背景图
 * 
 * @param {object} param0 选中的虚拟背景数据
 */
const handleSelectBg = ({ id, filePath }) => {
    setVirtualBg(id, filePath);
}

/**
 * 自定义虚拟背景图的数量
 */
const customNum = computed(() => {
    return state.bgImgList.filter(i => i.type === IVirtualBgType.COSTOM).length;
});

/**
 * 添加图片
 * 1. 判断自定义图片是否已经满了，满了则给提示不让再添加
 * 2. 可以添加时，则把这个图片生成对应的 IBgFileData 数据
 * 3. 把新生成的图片保存到本地，把生成的文件路径和 IBgFileData 一块保存到 electron-store 中
*/
const addNewBg = async (event) => {
    const file = event.target.files?.[0];

    // 清除数据，不然下次再打开相同的文件不会触发 change 事件
    event.target.value = '';

    if (file) {
        const buffer = new Uint8Array(await file.arrayBuffer());
        const isPngOrJpg = isJPEG(buffer) || isPNG(buffer);

        if (!isPngOrJpg) {
            return message.error('检测到该图片不是png或jpg格式');
        }

        // 检查大小
        if ((file.size / 1024 / 1024) > MAX_IMG_SIZE) {
            return message.error(`文件过大，仅支持${MAX_IMG_SIZE}MB以下的图片`);
        }

        try {
            const config = await bgManager.createNewBgByFile(file);
            // 更新状态
            state.bgImgList = [...state.bgImgList, config];
        } catch (error) {
            message.error('异常，请重试');
        }
    }
}

/**
 * 删除背景图
 */
const handleDelBg = (bg) => {
    const { id, url } = bg;

    state.bgImgList = state.bgImgList.filter(i => i.id !== id);
    URL.revokeObjectURL(url);

    if (id === state.selectedId) {
        // 删除当前使用的背景图时，需要重新设置背景图状态
        setVirtualBg('', '');
    }
    bgManager.deleteBg(bg); // 更新 store，并删除图片文件
}

onMounted(() => {
    bgManager.init().then((data) => {
        const { bgFileList, selectedId, selectedFilePath } = data;
        const mode = getMode(selectedId);
        state.bgImgList = bgFileList;
        state.selectedId = selectedId;
        emit('change', mode, selectedFilePath);
    });
});

onBeforeUnmount(() => {
    const { selectedId, bgImgList } = state;
    bgManager.updateBg(selectedId, bgImgList);
});
</script>

<style lang="scss">
@import '~@/style/var.scss';

.virtual-bg {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;

    canvas {
        width: 100%;
        height: 100%;
    }

    &-item, .video-effect-unset-item {
        width: 116px;
        height: 67px;
        cursor: pointer;
        position: relative;
        border-radius: 3px;
        padding: 1px;
        color: rgba(57, 57, 70, 0.6);
        border: 2px solid transparent;

        &:hover {
            border-color: $primary-color;
        }

        &.selected-item {
            color: $primary-color;
            border-color: $primary-color;
        }

        &.default-item {
            display: flex;

            .anticon {
                margin: auto;
                font-size: 24px;
            }

            background-color: #e5e7f1;
        }

        &.add-item {
            font-size: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            &:hover {
                color: $primary-color;
            }

            background-color: #e5e7f1;

            .el-icon {
                font-size: 18px;
                margin-bottom: 4px;
            }
        }

        .close-icon {
            visibility: hidden;
            position: absolute;
            width: 12px;
            height: 12px;
            top: -6px;
            right: -6px;
        }

        &:hover .close-icon {
            visibility: visible;
        }

        img {
            width: 100%;
            height: 100%;
            border-radius: 3px;
        }
    }
}

div.virtual-bg-add-item-tooltip {
    font-size: 12px;
}
</style>
