<template>
<Grids :grids="grids" />
</template>
<script>
import Grids from './Grids.vue'
export default {
  created() {
    // let colors = ['green', 'yellow', 'blue', 'grey'];
    // for (let i = 0; i < 200; ++i) {
    //   this.grids.push({
    //     num: i + 1,
    //     color: colors[i % 4]
    //   });
    // }
    eventHub.$on('sendWindowChange', this.sendWindowChangeHandler);
    this.sendWindowChangeHandler([], 0, 0, 0);
  },
  beforeDestroy() {
    eventHub.$off('sendWindowChange', this.sendWindowChangeHandler);
  },
  data() {
    return {
      grids: []
    }
  },
  methods: {
    sendWindowChangeHandler(sendWindow, baseSeqNum, nextSeqNum, slideSize) {
      console.log('sendWindow', sendWindow);
      console.log('slideSize', slideSize)
      let minGridsCnt = 200;
      let grids = [];
      for (let i = 0; i < sendWindow.length; ++i) {
        let message = sendWindow[i];
        let grid = {
          num: message.seqNum
        };
        if (message.seqNum < baseSeqNum) {
          grid.color = 'green';
        } else if (message.seqNum >= baseSeqNum && message.seqNum < nextSeqNum) {
          grid.color = 'yellow'; // 窗口内，已发送
        } else if (message.seqNum === nextSeqNum) {
          grid.color = 'blue';
        } else if (message.seqNum > nextSeqNum && message.seqNum < baseSeqNum + slideSize) {
          grid.color = 'canary';
        } else {
          grid.color = 'grey';
        }
        grids.push(grid);
      }
      if (sendWindow.length != 0 &&
        sendWindow[sendWindow.length - 1].seqNum < nextSeqNum ||
        sendWindow.length === 0) {
        grids.push({
          num: nextSeqNum,
          color: 'blue'
        });
      }
      for (let i = grids.length; i < minGridsCnt; ++i) {
        grids.push({
          num: '',
          color: 'grey'
        });
      }
      this.grids = grids;
    }
  },
  components: {
    Grids
  }
}
</script>
