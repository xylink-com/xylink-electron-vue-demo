<template>
  <div class="debug">
    <div class="debug__container">
      <div class="close-icon" @click="onClose" />
      <h4>网络探测</h4>
      <table class="table" cellPadding="0" cellSpacing="0" border="0">
        <thead>
          <tr class="table-title">
            <th>通道名称</th>
            <th>网络带宽(kbps)</th>
            <th>丢包率(%)</th>
            <th>往返延时(ms)</th>
            <th>抖动(ms)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>发送</td>
            <td>{{ network.txDetectBw || 0 }}</td>
            <td>{{ network.txLost || 0 }}</td>
            <td>{{ network.rtt || 0 }}</td>
            <td>{{ network.txJitter || 0 }}</td>
          </tr>
          <tr>
            <td>接收</td>
            <td>{{ network.rxDetectBw || 0 }}</td>
            <td>{{ network.rxLost || 0 }}</td>
            <td>{{ network.rtt || 0 }}</td>
            <td>{{ network.rxJitter || 0 }}</td>
          </tr>
        </tbody>
      </table>

      <br />
      <h4>媒体加密</h4>
      <table class="table">
        <thead>
          <tr class="table-title">
            <th>加密算法</th>
            <th>{{ statistics ? statistics.encrypt : "" }}</th>
          </tr>
        </thead>
      </table>

      <Fragment v-if="isContent">
        <br />
        <h4>内容共享</h4>
        <table class="table">
          <Fragment>
            <thead>
              <tr class="table-title">
                <th>通道名称</th>
                <th>Codec</th>
                <th>分辨率</th>
                <th>帧率(fps)</th>
                <th>码率(kbps)</th>
              </tr>
            </thead>
            <tbody>
              <tr
                :key="'audioTx' + index"
                v-for="(item, index) in content.audioTxInfo"
              >
                <td>音频发送</td>
                <td>{{ item.codecType }}</td>
                <td>----</td>
                <td>0</td>
                <td>{{ item.actBw }}</td>
              </tr>
              <tr
                :key="'audioRx' + index"
                v-for="(item, index) in content.audioRxInfo"
              >
                <td>音频接收</td>
                <td>{{ item.codecType }}</td>
                <td>----</td>
                <td>0</td>
                <td>{{ item.actBw }}</td>
              </tr>
              <tr
                :key="'videoTx' + index"
                v-for="(item, index) in content.videoTxInfo"
              >
                <td>视频发送</td>
                <td>{{ item.codecType }}</td>
                <td>{{ item.resolution }}</td>
                <td>{{ item.frameRate }}</td>
                <td>{{ item.actBw }}</td>
              </tr>
              <tr
                :key="'videoRx' + index"
                v-for="(item, index) in content.videoRxInfo"
              >
                <td>{{ Base64.decode(item.displayName) }}</td>
                <td>{{ item.codecType }}</td>
                <td>{{ item.resolution }}</td>
                <td>{{ item.frameRate }}</td>
                <td>{{ item.actBw }}</td>
              </tr>
            </tbody>
          </Fragment>
        </table>
      </Fragment>

      <br />
      <h4>与会者</h4>
      <table class="table">
        <Fragment>
          <thead>
            <tr class="table-title">
              <th>名称</th>
              <th>通道名称</th>
              <th>Codec</th>
              <th>分辨率</th>
              <th>帧率(fps)</th>
              <th>码率(kbps)</th>
            </tr>
          </thead>
          <tbody>
            <tr
              :key="'audioTx' + index"
              v-for="(item, index) in people.audioTxInfo"
            >
              <td>音频发送</td>
              <td>{{ item.codecType }}</td>
              <td>----</td>
              <td>0</td>
              <td>{{ item.actBw }}</td>
            </tr>
            <tr
              :key="'audioRx' + index"
              v-for="(item, index) in people.audioRxInfo"
            >
              <td>音频接收</td>
              <td>{{ item.codecType }}</td>
              <td>----</td>
              <td>0</td>
              <td>{{ item.actBw }}</td>
            </tr>
            <tr
              :key="'videoTx' + index"
              v-for="(item, index) in people.videoTxInfo"
            >
              <td>视频发送</td>
              <td>{{ item.codecType }}</td>
              <td>{{ item.resolution }}</td>
              <td>{{ item.frameRate }}</td>
              <td>{{ item.actBw }}</td>
            </tr>
            <tr
              :key="'videoRx' + index"
              v-for="(item, index) in people.videoRxInfo"
            >
              <td>{{ Base64.decode(item.displayName) }}</td>
              <td>{{ item.codecType }}</td>
              <td>{{ item.resolution }}</td>
              <td>{{ item.frameRate }}</td>
              <td>{{ item.actBw }}</td>
            </tr>
          </tbody>
        </Fragment>
      </table>
    </div>
  </div>
</template>
<script>
import { Fragment } from "vue-fragment";
import XYRTC from "../../../utils/xyRTC";
import { Base64 } from 'js-base64';
export default {
  props: ["onClose"],
  computed: {
    network() {
      return (
        this.statistics?.network || {
          rtt: 0,
          rxDetectBw: 0,
          rxJitter: 0,
          rxLost: 0,
          txDetectBw: 0,
          txJitter: 0,
          txLost: 0,
        }
      );
    },
    people() {
      return (
        this.statistics?.people || {
          audioTxInfo: [],
          audioRxInfo: [],
          videoRxInfo: [],
          videoTxInfo: [],
        }
      );
    },
    content() {
      return (
        this.statistics?.content || {
          audioTxInfo: [],
          audioRxInfo: [],
          videoRxInfo: [],
          videoTxInfo: [],
        }
      );
    },
    isContent() {
      return (
        (this.content?.audioTxInfo || []).length > 0 ||
        (this.content?.audioRxInfo || []).length > 0 ||
        (this.content?.videoRxInfo || []).length > 0 ||
        (this.content?.videoTxInfo || []).length > 0
      );
    },
  },
  data() {
    return {
      statistics: null,
      timer: null,
      Base64
    };
  },
  components: {
    Fragment,
  },
  watch: {},
  mounted() {
    const xyRTC = XYRTC.getInstance();
    this.timer = setInterval(() => {
      this.statistics = xyRTC.getStatistics();
    }, 500);
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
};
</script>
<style scoped lang="scss">
.debug {
  position: fixed;
  top: 0;
  left: 0px;
  width: 100%;
  height: 100%;
  background-color: rgba(51, 51, 51, 0.85);
  z-index: 1000;
  padding: 20px;
  text-align: left;
  user-select: auto;
  color: #fff;

  h4 {
    color: #fff;
  }

  .close-icon {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 22px;
    height: 22px;
    background: url("../../../assets/img/icon/close.png") no-repeat;
    background-size: 100% 100%;
    cursor: pointer;
    z-index: 999;
  }

  &__container {
    width: 100%;
    height: 100%;
    overflow: auto;

    .line {
      display: flex;

      span {
        margin-right: 10px;
        width: 180px;
        text-align: left;
      }
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      background-color: rgba(100, 99, 105, 0.65);
      border-radius: 4px;

      th {
        padding: 6px;
        text-align: center;
        border-right: 1px solid rgba(22, 22, 29, 0.8);
        border-bottom: 1px solid rgba(22, 22, 29, 0.8);
        &:last-child {
          border-right: 0;
        }
        font-weight: normal;
      }

      tr,
      td {
        border-collapse: collapse;
        padding: 6px;
        text-align: left;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: center;
        font-weight: normal;
      }

      tr {
        &:last-child {
          td {
            border-bottom: 0;
          }
        }
      }

      td {
        border-right: 1px solid rgba(22, 22, 29, 1);
        border-bottom: 1px solid rgba(22, 22, 29, 1);
      }
    }

    &::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 1em;
      background: rgba(50, 50, 50, 0.3);
    }
    &::-webkit-scrollbar-track {
      border-radius: 1em;
      background: rgba(50, 50, 50, 0.1);
    }
  }
}
</style>
