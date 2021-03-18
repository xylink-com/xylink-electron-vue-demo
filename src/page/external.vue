<template>
  <div className="meeting-content">
    <div className="meeting-layout">
      <Video
        v-for="item in layoutList"
        :key="item.key"
        :item="item"
        :isExternal="true"
        :renderMap="renderMap"
      ></Video>
    </div>
  </div>
</template>
<script>
import { ipcRenderer } from "electron";
import Video from "./components/Video";

export default {
  name: "External",
  components: { Video },
  computed: {
    layoutList() {
      const localLayout = this.layout;

      const newLayoutList = localLayout.map((val) => {
        const { isContent, callUri } = val.roster;
        const mediagroupid = isContent ? 1 : 0;
        const key = callUri + mediagroupid;
        const { height, left, top, width } = val.positionStyle;
        const positionStyle = `left: ${left}; top: ${top}; height: ${height}; width: ${width}`;

        return {
          ...val,
          key,
          positionStyle,
        };
      });

      return newLayoutList;
    },
  },
  data() {
    return {
      layout: [],
      renderMap: new Map(),
    };
  },
  mounted() {
    const _this = this;
    ipcRenderer.on("externalLayout", function(event, msg) {
      _this.layout = msg.layout;
    });
  },
  methods: {},
  watch: {
    layout: {
      handler(newValue) {
        // 清理缓存
        this.renderMap.forEach((value, key) => {
          const index = newValue.findIndex((item) => item.sourceId === key);
          if (index === -1) {
            this.renderMap.delete(key);
          }
        });
      },
      deep: true,
    },
  },
};
</script>
<style scoped></style>
