/**
 * enum tools
 *
 * @author jinghui-Luo
 *
 * Created at     : 2020-08-24 16:11:04
 * Last modified  : 2022-06-02 15:15:01
 */
import { ACCOUNT } from '../config';

export const USER_INFO = {
  phone: "+86-",
  password: "",
  meeting: "",
  meetingPassword: "",
  meetingName: "",
  extID: ACCOUNT.extId,
  extUserId: "",
  displayName: "",
  video: false,
  audio: false
};

export const RECORD_STATE_MAP = {
  idel: 0, // 空闲 录制完成
  starting: 1, // 开始录制中
  acting: 2, // 正在录制中
  stoping: 3, // 停止录制中
  inact: 4 // 暂未使用 暂停录制相关，暂时用不到
}