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
    eventHub.$on('receiveWindowChange',this.receiveWindowChangeHandler);
  },
  beforeDestroy(){
    eventHub.$off('receiveWindowChange',this.receiveWindowChangeHandler);
  },
  data() {
    return {
      grids: []
    }
  },
  methods:{
    receiveWindowChangeHandler(receiveWindow,nextAckNum){
      console.log('receiveWindowChangeHandler');
    }
  },
  components: {
    Grids
  }
}
</script>
