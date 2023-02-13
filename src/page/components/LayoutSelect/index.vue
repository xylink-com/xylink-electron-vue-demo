<script setup>
import { ref, defineEmits, defineProps, computed, toRefs } from "vue";
import { LAYOUT_MODEL_MAP } from "@/utils/enum";

import "./index.scss";

const { normal, content } = LAYOUT_MODEL_MAP;

const props = defineProps(["contentPartCount", "templateModel"]);
const emitUpdate = defineEmits(["switchLayout"]);

const { contentPartCount, templateModel } = toRefs(props);

const visibleRef = ref(false);

const layoutMap = computed(() => {
  return contentPartCount.value > 0 ? content : normal;
});

const switchLayout = (key) => {
  if (key === templateModel.value) {
    return;
  }

  emitUpdate("switchLayout", key);
};

const onSetVisible = (visible) => {
  visibleRef.value = visible;
};

const onClickIcon = (e) => {
  e.stopPropagation();
};

</script>
<template>
  <el-popover
    @show="onSetVisible(true)"
    @hide="onSetVisible(false)"
    placement="top"
    title=""
    trigger="click"
    popper-class="layout-select-popover"
  >
    <template #reference>
      <el-icon class="layout-select-icon" @click="onClickIcon" >
        <CaretTop v-show="!visibleRef"/>
        <CaretBottom v-show="visibleRef" />
      </el-icon>
    </template>
    <div class="layout__select">
      <div class="layout__select-head">窗口布局</div>
      <div class="layout__select-content">
        <div
          class="section"
          v-for="(layoutList, index) in layoutMap"
          :key="'layout_' + index"
        >
          <div
            v-for="item in layoutList"
            class="item"
            :key="item.key"
            @click="switchLayout(item.key)"
          >
            <img
              class="layout__select-icon"
              :src="
                require(`../../../style/img/svg/${
                  templateModel === item.key ? item.key + '_active' : item.key
                }.svg`)
              "
              alt=""
            />
            <div :class="{ text: true, active: templateModel === item.key }">
              {{ item.text }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-popover>
</template>
