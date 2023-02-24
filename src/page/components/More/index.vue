<template>
  <el-popover :model-value="visible" placement="top" width="102" trigger="click" popper-class="more-select-popover">
    <slot name="more" :closeMore="close"></slot>
    <template v-slot:reference>
      <div class="button setting button-more">
        <div class="icon"></div>
        <div class="title">更多</div>
      </div>
    </template>
  </el-popover>
</template>
<script>
export default {
  props: [],

  data() {
    return {
      visible: false,
    };
  },
  components: {
  },
  watch: {},
  methods: {
    close() {
      this.visible = false
    },
  },
};
</script>
<style lang="scss">
@import "../../../style/var.scss";

.el-popover__reference-wrapper {
  outline: none;
}

.button.setting.button-more {
  height: 60px;
}

.more-select-popover {
  min-width: 102px !important;
  border: none !important;
  background-color: rgba(51, 51, 51, 0.85) !important;
  padding: 0 !important;

  .el-popper__arrow:before {
    background: rgba(51, 51, 51, 0.85) !important;
    border-color: rgba(51, 51, 51, 0.85) !important;
  }
}

.more-select {
  padding: 8px 0;
  margin: 0;

  dd {
    margin: 0;
    width: 100%;
    height: 32px;
    line-height: 32px;
    color: #fff;
    text-align: center;
    cursor: pointer;

    &:hover {
      background: $primary-color;
    }
  }
}
</style>
