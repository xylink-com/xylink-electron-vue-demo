<template>
    <slot name="keyBoardBtn" :open="open"></slot>
    <el-dialog
      class="xy__setting-modal keyboard-modal"
      v-model="visible"
      :before-close="onClose"
      :modal="false"
      :append-to-body="true"
    >
      <div class="keyboard-box">
        <div class="keyboard-input"><span dir="ltr">{{ number }}</span></div>
        <ul class="keyboard-number">
          <li
            v-for="(val, index) in numArray"
            :key="val + index"
            @click="() => sendDtmf(val)"
          >
            {{ val }}
          </li>
        </ul>
      </div>
    </el-dialog>
</template>
<script>
import xyRTC from "../../../utils/xyRTC";

export default {
  computed: {
    timer() {
      return this.secondToDate(this.timerCount);
    },
  },
  data() {
    return {
      visible: false,
      number: "",
      numArray: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"],
    };
  },
  components: {
  },
  watch: {},
  beforeUnmount() {},
  methods: {
    sendDtmf(value) {
      // eslint-disable-next-line no-debugger
      const newNumber = this.number + value;
      this.number = newNumber;
      xyRTC.sendDtmf(newNumber);
    },
    onClose(done) {
      this.number = "";
      done();
    },
    open() {
      this.visible = true;
    },
  },
};
</script>
<style lang="scss">
@import "../../../style/var.scss";

.keyboard {
  &-modal {
    width: 300px !important;
    .el-dialog__body {
      padding: 0;
    }
  }

  &-header {
    height: 30px;
    background: rgba(44, 53, 64, 1);
    border-top-right-radius: 3px;
    border-top-left-radius: 3px;
  }

  &-close {
    width: 12px;
    height: 12px;
    position: absolute;
    right: 6px;
    top: 6px;
    cursor: pointer;
    .svg-icon {
      fill: #fff;
      fill-opacity: 0.8;
      fill-rule: evenodd;
      width: 14px;
      height: auto;
    }

    &:hover {
      .svg-icon {
        fill: $svg-danger-color;
        fill-opacity: 1;
      }
    }
  }

  &-input {
    height: 80px;
    background: #fff;
    border-bottom: 1px solid #ccc;
    font-size: 30px;
    line-height: 80px;
    text-align: center;
    direction: rtl;
    padding: 0 10px;
    @include text-ellipsis;
  }

  &-number {
    display: flex;
    flex-flow: wrap;
    background: #fff;
    list-style: none;
    padding: 0;
    li {
      list-style: none;
      width: 100px;
      height: 50px;
      text-align: center;
      line-height: 50px;
      font-size: 22px;
      padding: 0;
      cursor: pointer;
      &:hover {
        background: rgba(42, 46, 51, 0.1);
      }
    }
  }
}
</style>
