import { EventType } from "@xylink/xy-electron-sdk";
import dayjs from "dayjs";
import { watchEffect, ref, onBeforeUnmount, computed } from "vue";

const secondToMinute = (result) => {
  var m =
    Math.floor(result / 60) < 10
      ? "0" + Math.floor(result / 60)
      : Math.floor((result / 60) % 60);
  var s =
    Math.floor(result % 60) < 10
      ? "0" + Math.floor(result % 60)
      : Math.floor(result % 60);
  return m + ":" + s;
};

export default function useTimer(props) {
  const { duration: defaultDuration, endUtcTime, eventType, endAuto } = props;
  const durationRef = ref(defaultDuration.value);
  let timer;

  watchEffect(() => {
    if (eventType.value === EventType.START && endAuto.value) {
      timer = setInterval(() => {
        durationRef.value -= 1;
      }, 1000);
    } else {
      durationRef.value = 0;
    }
  });

  onBeforeUnmount(() => {
    clearInterval(timer);
    timer = undefined;
  });

  const time = computed(() => {
    if (endAuto.value) {
      return secondToMinute(durationRef.value);
    }
    if (eventType.value === EventType.STOP && endUtcTime.value > 0) {
      return dayjs(endUtcTime.value).format("HH:mm:ss");
    }
    return "";
  });

  return time;
}
