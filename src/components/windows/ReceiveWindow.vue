<template>
<Grids :grids="grids" />
</template>
<script>
import Grids from './Grids.vue'
export default {
  created() {
    eventHub.$on('receiveWindowChange', this.receiveWindowChangeHandler);
    this.receiveWindowChangeHandler([],0);
  },
  beforeDestroy() {
    eventHub.$off('receiveWindowChange', this.receiveWindowChangeHandler);
  },
  data() {
    return {
      grids: []
    }
  },
  methods: {
    receiveWindowChangeHandler(receiveWindow, nextAckNum) {
      let minGridsCnt = 200;
      let grids = [];
      for (let i = 0; i < receiveWindow.length; ++i) {
        grids.push({
          num: receiveWindow[i].seqNum,
          color: 'green'
        });
      }
      grids.push({
        num: nextAckNum,
        color: 'blue'
      });
      for (let i = grids.length; i < minGridsCnt; ++i) {
        grids.push({
          num: '-',
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
