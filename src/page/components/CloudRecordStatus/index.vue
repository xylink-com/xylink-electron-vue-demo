<template>
 <div class="status-item record-status">
   <div :class='timerStyle'></div>
    <div class="record-time">
      云端录制&nbsp;
      {{ showTimer ? timer : isRecordPaused ? "暂停中" : "录制中" }}
    </div>
 </div>
</template>
<script>
export default {
  props: ['showTimer', 'isRecordPaused'],
  computed: {
    timerStyle() {
      return this.timerCount % 2 === 0 ? "timer-icon" : "timer-icon hide"
    },
    timer() {
      return this.secondToDate(this.timerCount)
    }
  },
  data() {
    return {
      timerCount: 0,
      meetingTimeout: null
    }
  },
  mounted(){
    this.onCreateMeetingTimeCount()
  },
  beforeDestroy() {
    clearTimeout(this.meetingTimeout);
    this.meetingTimeout = null;
  },
  methods: {
    onCreateMeetingTimeCount() {
      this.meetingTimeout = setTimeout(() => {
        clearTimeout(this.meetingTimeout);
        this.meetingTimeout = null;

        this.timerCount += 1;

        this.onCreateMeetingTimeCount();
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
  }
}
</script>
<style scoped>
</style>