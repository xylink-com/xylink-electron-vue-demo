import { systemPreferences } from 'electron';

export const checkCameraAccess = async () => {
  const cameraPrivilege = systemPreferences.getMediaAccessStatus('camera');

  console.log('[checkDeviceAccessPrivilege] cameraPrivilege:', cameraPrivilege);

  if (cameraPrivilege !== 'granted') {
    await systemPreferences.askForMediaAccess('camera');
  }
};

export const checkMicrophoneAccess = async () => {
  const micPrivilege = systemPreferences.getMediaAccessStatus('microphone');

  console.log('[checkDeviceAccessPrivilege] micPrivilege:', micPrivilege);

  if (micPrivilege !== 'granted') {
    await systemPreferences.askForMediaAccess('microphone');
  }
};

// 检查设备访问权限
export const checkDeviceAccessPrivilege = async () => {
  await checkCameraAccess();

  await checkMicrophoneAccess();

  const screenPrivilege = systemPreferences.getMediaAccessStatus('screen');

  console.log('[checkDeviceAccessPrivilege] screenPrivilege:', screenPrivilege);
};