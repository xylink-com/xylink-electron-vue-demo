<script setup>
import { computed, onMounted, onBeforeUnmount,watchEffect } from "vue";
import { storeToRefs } from "pinia";
import xyRTC from "@/utils/xyRTC";

import xss from "xss";
import { EventType } from "@xylink/xy-electron-sdk";
import { useInteractive, useSignIn } from "@/store";
import useTimer from "./useTimer";
import { ElMessage } from "element-plus";

const interactiveState = useInteractive();

const copywriting = interactiveState.copywriting;

const signInState = useSignIn();
const {
  duration,
  endUtcTime,
  webViewUrl,
  questionnaireId,
  eventType,
  endAuto,
} = storeToRefs(interactiveState);

const time = useTimer({
  endUtcTime,
  eventType,
  duration,
  endAuto,
});

const onSignIn = () => {
  if (eventType.value === EventType.START) {
    xyRTC.signIn(webViewUrl.value, questionnaireId.value);
  } else if (eventType.value === EventType.STOP) {
    interactiveState.$reset();
    signInState.$reset();
  }
};

const onCancel = (done) => {
  console.log("onCancel");
  if (eventType.value === EventType.START) {
    signInState.$patch({
      modal: false,
      promp: true,
    });
  } else {
    signInState.$reset();
    interactiveState.$reset();
  }
  done();
};

// 用watchEffect，signInState变化也会触发
// watch(eventType, (newVal) => {
//   if (newVal === EventType.START || newVal === EventType.STOP) {
//     console.log("watchEffect");
//     signInState.$patch({
//       modal: true,
//       promp: false,
//     });
//   }
// });

watchEffect(()=>{
    if (eventType.value === EventType.START || eventType.value === EventType.STOP) {
    console.log("watchEffect");
    // 这里别用$patch
    signInState.modal = true;
    signInState.promp = false;
  }
})

const dialogSubContent = computed(() => {
  let content = "请点击下方按钮，完成签到";
  if (eventType.value === EventType.STOP || endAuto.value) {
    content = copywriting.dialogSubContent.replace(
      "{0}",
      time.value ? `<span class="mark">${time.value}</span>` : ""
    );
  }

  return content;
});

const createDesc = computed(() => {
  return xss(dialogSubContent.value, {
    whiteList: {
      span: ["class"],
    },
  });
});

const onSubmitSignatureInfosResult = (e) => {
  console.log("SubmitSignatureInfosResult:", e);
  if (e.code !== 0) {
    ElMessage("签到失败，请稍候重试");
    return;
  }

  signInState.$patch({
    promp: true,
    modal: e.code !== 0,
    isSuccess: e.code === 0,
  });

  ElMessage("签到成功");
};

// const onInteractiveToolInfo = (e) => {
//   console.log("onInteractiveToolInfo", e);
//   interactiveState.$patch(e);
// };

onMounted(() => {
  // 互动工具回调
  //   xyRTC.on("InteractiveToolInfo", onInteractiveToolInfo);
  // 签到结果
  xyRTC.on("SubmitSignatureInfosResult", onSubmitSignatureInfosResult);
});

onBeforeUnmount(() => {
  //   xyRTC.removeListener("InteractiveToolInfo", onInteractiveToolInfo);
  xyRTC.removeListener(
    "SubmitSignatureInfosResult",
    onSubmitSignatureInfosResult
  );
});
</script>

<template>
  <el-dialog
    v-model="signInState.modal"
    :title="copywriting.dialogTitle"
    :before-close="onCancel"
    width="40%"
  >
    <span style="font-size: 16px; margin-bottom: 10px">{{
      copywriting.dialogContent
    }}</span
    ><br />
    <span v-html="createDesc"></span>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="onSignIn">
          {{ copywriting.dialogLabel }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
