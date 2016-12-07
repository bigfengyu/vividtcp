<style>
.time-indicator {
  margin-left: 20px;
}

.horizontal-line {
  z-index: 5;
  position: absolute;
  width: 100%;
  height: 20px;
}

.horizontal-line {
  pointer-events: none;
}

.horizontal-line .left,
.horizontal-line .right {
  pointer-events: auto;
}

.horizontal-line>.bottom-row>.center {
  border-top: 1px dotted #000000;
}

.horizontal-line:hover>.bottom-row>.center {
  border-top: 1px solid #03a9f4;
}

.horizontal-line>.bottom-row>.left,
.horizontal-line>.bottom-row>.right {
  border-top: 1px dotted #03a9f4;
}

.horizontal-line:hover>.bottom-row>.left,
.horizontal-line:hover>.bottom-row>.right{
  border-top: 1px solid #03a9f4;
}


.horizontal-line div {
  height: 10px;
}



/*.timeline {
  height: calc(100vh - 288px);
  overflow-y: scroll;
  position: relative;
}*/
</style>

<template>
<div class="horizontal-line drabble" id="horizontal-line" :style="hTimelineStyle()">
  <mu-row class="top-row">
    <mu-col desktop="25" tablet="15" width="15" class="left">
    </mu-col>
    <mu-col desktop="50" tablet="70" width="70" class="center"></mu-col>
    <mu-col desktop="25" tablet="15" width="15" class="right"></mu-col>
  </mu-row>
  <mu-row class="bottom-row">
    <mu-col desktop="25" tablet="15" width="15" class="left">
      <span class="time-indicator">{{nowTimeFixed}}</span>
    </mu-col>
    <mu-col desktop="50" tablet="70" width="70" class="center"></mu-col>
    <mu-col desktop="25" tablet="15" width="15" class="right"></mu-col>
  </mu-row>
</div>
</template>

<script>
import Draggable from 'Draggable'
import config from '../config.js'
export default {
  props: {
    nowTime: {
      required: true
    },
    secInterScale: {
      required: true
    },
    timerState: {
      required: true
    },
    svgWidth: {
      required: true,
      default: 1
    },
    svgHeight: {
      required: true,
      default: 1
    }
  },
  data() {
    return {
      // nowTimeCopy: 0,
      isHolding: false
    }
  },
  computed: {
    nowTimeFixed() {
      if (this.nowTime < 0) {
        let zero = 0;
        return zero.toFixed(5);
      } else {
        return this.nowTime.toFixed(5);
      }
    }
  },
  mounted() {
    let vm = this;
    this.$nextTick(function() {
      // console.log('parent',vm.$parent.$el);
      let needResume = false;
      let draggable = Draggable.create('#horizontal-line', {
        type: "top",
        autoScroll: 1,
        bounds: vm.$parent.$el,
        onPress(evnet) {
          // console.log('onPress');
          if (vm.timerState == 'run') {
            eventHub.$emit('TL-pauseTimer');
            needResume = true;
          }
          // vm.nowTimeCopy = vm.nowTime;
          vm.isHolding = true; // 外面的scroll会用到
        },
        onRelease(event) {
          if (needResume) {
            eventHub.$emit('TL-startTimer');
            needResume = false;
          }
          vm.isHolding = false;
        },
        onDrag(event) {
          // console.log('drag');
          var time = vm.y2time(this.y);
          // if(time < 0){
          //   this.
          // }
          // console.log('time', time)
          eventHub.$emit('TL-setTime', Math.max(0, time));
        }
      });
      vm.$el.style.top = "14px";
    })
  },
  methods: {
    y2time(y) {
      return y * 100 / this.svgWidth / this.secInterScale;
    },
    time2y(time) {
      return time * this.secInterScale * this.svgWidth / 100;
    },
    top() {
      return this.time2y(this.nowTime) + 14;
    },
    hTimelineStyle() {
      return {
        top: this.top() + 'px'
      };
    }
  }
}
</script>
