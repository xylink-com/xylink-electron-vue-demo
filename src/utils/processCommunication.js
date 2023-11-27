import path from 'path';
import { ipcRenderer } from 'electron';
import { isExist, createDir } from './file';

/** 
 * 在 electron userData 目录下新增一个文件夹并返回文件路径
 * 
 * @param {string} dirname 要创建的子目录
 */
export function createUserDataChildDir(dirname) {
    return new Promise((resolve, reject) => {
        ipcRenderer.send('getUserDataDir');
        ipcRenderer.once('getUserDataDir', async (_, userDataPath) => {
            const assetDir = path.resolve(userDataPath, dirname);
            // 如果没有这个文件夹，则创建文件夹
            try {
                const exist = await isExist(assetDir);
                
                if (!exist) {
                    await createDir(assetDir);
                }
                resolve(assetDir);
            } catch (error) {
                reject(error);
            }
        });
    });
}

/**
 * 获取 userData 文件夹路径
 */
export function getAssetsDir() {
    return new Promise((resolve) => {
        ipcRenderer.send('getAssetsDir');
        ipcRenderer.once('getAssetsDir', async (_, asset) => {
            resolve(asset);
        });
    });
}
