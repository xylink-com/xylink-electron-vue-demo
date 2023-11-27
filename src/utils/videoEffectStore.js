import Store from 'electron-store';
import cloneDeep from 'clone-deep';
import { DEFAULT_VIDEO_EFFECT_CONFIG } from '@/utils/enum';
import { VideoBeautyStyle, VideoFilterStyle } from '@xylink/xy-electron-sdk';

/**
 * 根据用户唯一标识创建 electron store
 * 
 * @param {string} [user] 用户唯一标识
 */
const getElectronStore = (user) => {
    const storeName = `${user ? user + '-' : ''}video-effect-config`;

    const store = new Store({
        watch: true,
        name: storeName,
        encryptionKey: 'Buffer',
        defaults: DEFAULT_VIDEO_EFFECT_CONFIG,
    });
    return store;
}

class VideoEffectStore {
    /**
     * 单例
     * 
     * @type {VideoEffectStore} 实例
    */
    static instance;

    /** electron store */
    electronStore = getElectronStore();

    /**
     * 获取实例
     */
    static getInstance() {
        if (!VideoEffectStore.instance) {
            VideoEffectStore.instance = new VideoEffectStore();
        }
        return VideoEffectStore.instance;
    }

    store = cloneDeep(this.electronStore.store);

    constructor() {}

    /**
     * 获取美颜效果级别
     * 
     * @param {VideoBeautyStyle} style 要获取的美颜效果
     */
    getBeautyLevel(style) {
        // 默认取 25
        const defaultVal = style === VideoBeautyStyle.SMOOTH ? 25 : 0;
        return this.store.beautyMap[style]?.level ?? defaultVal;
    }

    /**
     * 获取滤镜效果级别
     * 
     * @param {VideoFilterStyle} style 要获取的滤镜效果
     */
    getFilterLevel(style) {
        // 默认取 50
        const defaultVal = style === VideoFilterStyle.RETRO ? 100 : 60;
        return this.store.filterMap[style]?.level ?? defaultVal;
    }

    /**
     * 设置用户 id，更新 store
     * 
     * @param {string} userId 用户 id
     */
    setUser(userId) {
        const newStore = getElectronStore(userId);
        this.electronStore = newStore;
        this.store = cloneDeep(newStore.store);
    }

    /**
     * 重新设置虚拟背景列表
     * 
     * @param {object[]} list 重新设置虚拟背景列表的数据
    */
    resetVirtualBgList(list) {
        this.store.virtualBg.list = list;
    }

    /**
     * 删除某个虚拟列表
     * 
     * @param {string} id 要删除的虚拟背景 id
    */
    delVirtualBgById(id) {
        const list = this.store.virtualBg.list || [];
        const newList = list.filter(item => item.id !== id);
        this.resetVirtualBgList(newList);
        this.save();
    }

    /**
     * 添加自定义虚拟列表数据
     * 
     * @param {object} data 新的虚拟背景数据
    */
    addVirtualBg(data) {
        const virtualBgConf = this.store.virtualBg;
        const { list } = virtualBgConf;

        // 在最前面插入
        list.unshift(data);
        virtualBgConf.list = list;
        this.store.virtualBg = virtualBgConf;
    }

    /**
     * 根据虚拟背景 id 获取对应的数据
     * 
     * @param {string} id 虚拟背景 id
    */
    getVirtualBgById(id) {
        return this.virtualBgList.find(item => item.id === id);
    }

    /**
     * 更新选中的背景图
     * 
     * @param {string} id 选中的背景图 id
    */
    updateSelectedVirtualBg(id) {
        this.store.selected.virtualBg = { id };
    }

    /**
     * 更新选中的美颜
     * 
     * @param {VideoBeautyStyle} [style] 要更新的美颜效果
    */
    updateSelectedBeauty(style) {
        this.store.selected.beauty.style = style;
    }

    /**
     * 更新选中的滤镜
     * 
     * @param {VideoFilterStyle} [style] 要更新的滤镜效果
    */
    updateSelectedFilter(style) {
        this.store.selected.filter.style = style;
    }

    /**
     * 更新美颜配置，如果不传 style，则会找选中的 style 更新 level
     * 
     * @param {number} level 美颜效果级别
     * @param {VideoFilterStyle} [style] 要更新的美颜效果
    */
    updateBeautyLevel(level, style) {
        const s = style ?? this.selectedBeauty.style;
        this.store.beautyMap[s] = { level };
        return { level, style: s };
    }

    /**
     * 更新滤镜配置，如果不传 style，则会找选中的 style 更新 level
     * 
     * @param {number} level 滤镜效果级别
     * @param {VideoFilterStyle} [style] 要更新的滤镜效果
    */
    updateFilterLevel(level, style) {
        const s = style ?? this.selectedFilter.style;
        this.store.filterMap[s] = { level };
        return { level, style: s };
    }

    /** 
     * 根据 style 获取美颜的 level 配置，不传 style 会找 selectedStyle
     * 
     * @param {VideoBeautyStyle} [style] 美颜效果
     */
    getBeautyConfig(style) {
        const s = style ?? this.selectedBeauty.style;
        const level = this.getBeautyLevel(s);
        return { style: s, level };
    }

    /** 
     * 根据 style 获取滤镜的 level 配置，不传 style 会找 selectedStyle
     * 
     * @param {VideoFilterStyle} [style] 滤镜效果
     */
    getFilterConfig(style) {
        const s = style ?? this.selectedFilter.style;
        // 获取 level，默认取中间值
        const level = this.getFilterLevel(s);
        return { style: s, level };
    }

    /**
     * 保存配置到 store 中
     */
    save() {
        this.electronStore.set(this.store);
    }

    /**
     * 获取自定义的虚拟列表数据
    */
    get virtualBgList() {
        return this.store.virtualBg.list || [];
    }

    /**
     * 获取选中的虚拟背景 id
    */
    get selectedVirtualBg() {
        return this.store.selected.virtualBg;
    }

    /** 
     * 获取美颜配置
     */
    get selectedBeauty() {
        return this.store.selected.beauty;
    }

    /** 
     * 获取滤镜配置
     */
    get selectedFilter() {
        return this.store.selected.filter;
    }

    /** 
     * 获取美颜效果的列表
     */
    get beautyEffectList() {
        const beautyMap = this.store.beautyMap;
        const effects = [];

        Object.keys(beautyMap).forEach(k => {
            const level = this.getBeautyLevel(k);
            effects.push({ style: Number(k), level });
        });
        return effects;
    }
}

export default VideoEffectStore.getInstance();
