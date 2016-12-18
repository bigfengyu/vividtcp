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
    eventHub.$on('sendWindowChange',this.sendWindowChangeHandler);
  },
  beforeDestroy(){
    eventHub.$off('sendWindowChange',this.sendWindowChangeHandler);
  },
  data() {
    return {
      grids: []
    }
  },
  methods:{
    sendWindowChangeHandler(sendWindow,baseSeqNum,nextSeqNum){
      console.log('sendWindowChangeHandler');
    }
  },
  components: {
    Grids
  }
}
</script>
