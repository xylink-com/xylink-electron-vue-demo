<template>
  <div class="record-time">
    <div :class="timerStyle"></div>
    <div class="record-time">
      云端录制&nbsp;
      {{
        showTimer && !isRecordPaused
          ? timer
          : isRecordPaused
          ? "暂停中"
          : "录制中"
      }}
    </div>
  </div>
</template>
<script>
export default {
  props: ["showTimer", "isRecordPaused"],
  computed: {
    timerStyle() {
      return this.timerCount % 2 === 0 ? "icon" : "icon hide";
    },
    timer() {
      return this.secondToDate(this.timerCount);
    },
  },
  data() {
    return {
      timerCount: 0,
      meetingTimeout: null,
    };
  },
  watch: {
    isRecordPaused: function (val, oldVal) {
      console.log("new: %s, old: %s", val, oldVal);
      if (oldVal && !val) {
        this.onCreateMeetingTimeCount();
      }
    },
  },
  mounted() {
    this.onCreateMeetingTimeCount();
  },
  beforeDestroy() {
    this.meetingTimeout && clearTimeout(this.meetingTimeout);
    this.meetingTimeout = null;
  },
  methods: {
    onCreateMeetingTimeCount() {
      this.meetingTimeout = setTimeout(() => {
        this.meetingTimeout && clearTimeout(this.meetingTimeout);
        this.meetingTimeout = null;
        console.log("this.isRecordPaused", this.isRecordPaused);
        if (!this.isRecordPaused) {
          this.timerCount += 1;
          this.onCreateMeetingTimeCount();
        }
      }, 1000);
    },
    secondToDate(result) {
      var h =
        Math.floor(result / 3600) < 10
          ? "0" + Math.floor(result / 3600)
          : Math.floor(result / 3600);
      var m =
        Math.floor((result / 60) % 60) < 10
          ? "0" + Math.floor((result / 60) % 60)
          : Math.floor((result / 60) % 60);
      var s =
        Math.floor(result % 60) < 10
          ? "0" + Math.floor(result % 60)
          : Math.floor(result % 60);
      return h + ":" + m + ":" + s;
    },
  },
};
</script>
<style scoped lang="scss">
.record-time {
  display: flex;
  align-items: center;
  justify-content: center;
  .icon {
    width: 8px;
    flex: 0 0 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
    background: #fa6a69;
  }
  .icon.hide {
    background: transparent;
  }
}
</style>
