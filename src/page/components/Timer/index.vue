<template>
    <span>{{ timer }}</span>
</template>
<script>
export default {
  computed: {
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
  components: {
  },
  watch: {},
  mounted() {
    this.onCreateMeetingTimeCount();
  },
  beforeUnmount() {
    this.meetingTimeout && clearTimeout(this.meetingTimeout);
    this.meetingTimeout = null;
  },
  methods: {
    onCreateMeetingTimeCount() {
      this.meetingTimeout = setTimeout(() => {
        this.meetingTimeout && clearTimeout(this.meetingTimeout);
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
  },
};
</script>
