<script setup>
import { useInteractive, useSignIn } from "@/store";
const interactiveState = useInteractive();

// const copywriting = interactiveState.copywriting;
const signInState = useSignIn();


const onSignIn = (e) => {
  e.stopPropagation();
  signInState.$patch({
    modal: true,
    promp: false,
  });
};

</script>
<template>
  <div class="meeting-prompt-box" v-if="signInState.promp">
    {{ interactiveState.copywriting.notifyContent }}
    <template v-if="signInState.isSuccess"> (已签到)</template>
    <div v-else class="lock-btn" @click="onSignIn">
      {{ interactiveState.copywriting.notifyLabel }}
    </div>
  </div>
</template>
