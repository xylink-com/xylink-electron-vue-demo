import store from './videoEffectStore';
import { VIRTUAL_BG } from '@/utils/enum';
import { bgManager } from './virtualBgManager';
import { VideoBeautyStyle, VirtualBgMode } from '@xylink/xy-electron-sdk';
import xyRTC from './xyRTC';

const { VIRTUALIZATION } = VIRTUAL_BG;

class InitVideoEffect {

    /** 是否已经初始化设置过 */
    hasBeenSet = false;

    /**
     * 初始化虚拟背景
     */
    initVirtualBg() {
        return bgManager.init().then(({ selectedFilePath, selectedId }) => {
            if (selectedFilePath) {
                xyRTC.setVirtualBgMode(VirtualBgMode.BG_IMAGE);
                xyRTC.setVirtualBgImage(selectedFilePath);
            }
    
            else if (selectedId === VIRTUALIZATION) {
                xyRTC.setVirtualBgMode(VirtualBgMode.BG_BLUR);
            } else {
                xyRTC.setVirtualBgMode(VirtualBgMode.NONE);
            }
        });
    }

    /**
     * 初始化滤镜
     */
    initFilter() {
        const { style: filterStyle, level: filterLevel } = store.getFilterConfig();
        xyRTC.setVideoFilterEffect(filterStyle, filterLevel);
    }

    /**
     * 初始化美颜
     */
    initBeauty() {
        const { style: beautyStyle } = store.selectedBeauty;

        if (beautyStyle !== VideoBeautyStyle.NONE) {
            const beautyList = store.beautyEffectList;
            beautyList.forEach(effect => {
                xyRTC.setVideoBeautyEffect(effect.style, effect.level);
            });
        } else {
            xyRTC.setVideoBeautyEffect(VideoBeautyStyle.NONE, 100);
        }
    }

    /**
     * 初始化虚拟背景、美颜、滤镜
     */
    init() {
        const { hasBeenSet } = this;

        if(hasBeenSet) return;

        this.initVirtualBg().then(() => {
            this.hasBeenSet = true;
        });
        this.initBeauty();
        this.initFilter();
    }

    /**
     * 重置状态，比如账号绑定时，如果退出登录了，则需要重置，
     * 因为有可能切换别的账号
     */
    reset() {
        this.hasBeenSet = false;
    }
}

export const initVideoEffect = new InitVideoEffect();
