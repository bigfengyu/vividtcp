<style>
.timeline {
  height: calc(100vh - 288px);
  overflow-y: scroll;
  position: relative;
}

.canvas-wrapper {
  border-left: 3px dotted #66bb6a;
  border-right: 3px dotted #880000;
}

.timeline-left,
.canvas-wrapper,
.timeline-right {
  height: 2000px;
  position: relative;
}

.canvas-wrapper {
  padding-top: 20px;
}

.timeline-scroll {
  width: 100%;
}
</style>

<template>
<div class="timeline">
  <mu-row class="timeline-scroll">
    <TimeIndicator :now-time="nowTime" :time-scale="timeScale" :sec-inter-scale="secInterScale" :timer-state="timerState" :svg-width="svgWidth" :svg-height="svgHeight"></TimeIndicator>
    <mu-col desktop="25" tablet="15" width="15" class="timeline-left">
      <time-tags side="left" :lines="lines" :now-time="nowTime" :time-scale="timeScale" :sec-inter-scale="secInterScale" :svg-width="svgWidth"></time-tags>
    </mu-col>
    <mu-col desktop="50" tablet="70" width="70" class="canvas-wrapper">
      <Transcanvas :lines="lines" :time-scale="timeScale" :sec-inter-scale="secInterScale" :now-time="nowTime" :paddingTop="5" />
    </mu-col>
    <mu-col desktop="25" tablet="15" width="15" class="timeline-right">
      <time-tags side="right" :lines="lines" :now-time="nowTime" :time-scale="timeScale" :sec-inter-scale="secInterScale" :svg-width="svgWidth"></time-tags>
    </mu-col>
  </mu-row>
</div>
</template>

<script>
//  let lines = [
//    {
//      order:0
//      begTime:3,  // second
//      endTime:4,  // second
//      loseTime:0
//       direct:'lr'
//      y1:undefined
//      y2:undefined
//    }
//  ];
import TimeTags from './TimeTags/index'
import Transcanvas from './Transcanvas.js'
import TimeIndicator from './TimeIndicator'
import _ from 'lodash'
export default {
  name: 'Timeline',
  components: {
    Transcanvas,
    TimeTags,
    TimeIndicator
  },
  data() {
    return {
      lines: [],
      nowTime: 0,
      intervalId: undefined,
      secInterScale: 3,
      timeScale: 100,
      leftTags: [],
      rightTags: [],
      preventOrderSet: {},
      svgWidth: 0,
      svgHeight: 0,
      timeRangeHigh: -1,
      timerState:'stop'
    }
  },
  computed: {

  },
  mounted() {
    let vm = this;
    this.$nextTick(function() {
      // vm.nowTime = 0; // 强制vue在svg挂载之后刷新h-timeline的高度
      window.addEventListener('resize', vm.handleResize);
      vm.handleResize();
    });
  },
  created() {
    eventHub.$on('TL-load', this.load);
    eventHub.$on('TL-startTimer', this.startTimer);
    eventHub.$on('TL-pauseTimer', this.pauseTimer);
    eventHub.$on('TL-resetTimer', this.resetTimer);
    eventHub.$on('TL-setTime', this.setTime);
    eventHub.$on('TL-setTimeRange', this.setTimeRange);
  },
  beforeDestroy() {
    eventHub.$off('TL-load', this.addline);
    eventHub.$off('TL-startTimer', this.setTime);
    eventHub.$off('TL-pauseTimer', this.pauseTimer);
    eventHub.$off('TL-setTime', this.setTime);
    eventHub.$off('TL-resetTimer', this.resetTimer);
    eventHub.$off('TL-setTimeRange', this.setTimeRange);
  },
  methods: {
    handleResize(event) {
      let svg = document.getElementById('svg');
      this.svgWidth = svg.clientWidth;
      this.svgHeight = svg.clientHeight;
    },
    load: function(lines) {
      console.log('lines', lines);
      this.lines = lines;
    },
    addline(line) {
      this.lines.push(line);
    },
    removelineByOrder(order) {
      function predicator(line) {
        return line.order != order;
      }
      let vm = this;
      eventHub.$emit('t-removeline', order);
      vm.preventOrderSet[order] = true;
      this.lines = _.filter(this.lines, predicator);
      this.leftTags = _.filter(this.leftTags, predicator);
      this.rightTags = _.filter(this.rightTags, predicator);
    },
    removeLastLine() {
      if (this.lines.length) {
        this.removeline(this.lines[this.lines.length - 1].order);
      }
    },
    freshTime(interval) {
      let seconds = interval / 1000;
      this.nowTime += seconds / this.timeScale;
    },
    setTimerState(state){
      if(this.timerState != state){
        this.timerState = state;
        eventHub.$emit('timerStateChange', state);
      }
    },
    startTimer() {
      let vm = this;
      let freshMs = 10;
      this.setTimerState('run');

      this.intervalId = setInterval(function() {
        if (vm.timeRangeHigh != -1 && vm.nowTime >= vm.timeRangeHigh) {
          vm.nowTime = vm.timeRangeHigh;
          vm.intervalId = clearInterval(vm.intervalId);
          vm.setTimerState('stop');
        } else {
          vm.freshTime(freshMs);
        }
      }, freshMs);

    },
    setTimeRange(low, high) {
      if (low) {
        this.timeNow = low;
      } else {
        this.timeNow = 0
      }
      if (high) {
        this.timeRangeHigh = high;
      } else {
        this.timeRangeHigh = -1;
      }
    },
    pauseTimer() {
      if (this.intervalId) {
        this.intervalId = clearInterval(this.intervalId);
      }
      this.setTimerState('pause');
    },
    setTime(time) {
      if(time > this.timeRangeHigh){
        this.timeRangeHigh = -1;
      }
      this.nowTime = time;
    },
    resetTimer() {
      if (this.intervalId) {
        this.intervalId = clearInterval(this.intervalId);
      }
      this.nowTime = 0;
      this.setTimerState('stop');
    }
  }

}
</script>
