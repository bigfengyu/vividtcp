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
//  var lines = [
//    {
//      order:0
//      begTime:3,  // second
//      endTime:4,  // second
//      lose:true
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
      svgHeight: 0
    }
  },
  computed: {
    timerState() {
      if (this.intervalId) {
        return 'run';
      } else {
        return 'stop';
      }
    }
  },
  mounted() {
    var vm = this;
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
  },
  beforeDestroy() {
    eventHub.$off('TL-load', this.addline);
    eventHub.$off('TL-startTimer', this.setTime);
    eventHub.$off('TL-pauseTimer', this.pauseTimer);
    eventHub.$off('TL-setTime', this.setTime);
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
      var vm = this;
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
      var seconds = interval / 1000;
      this.nowTime += seconds / this.timeScale;
    },
    startTimer() {
      window.TT = new Date();
      if (!this.intervalId) {
        var vm = this;
        var freshMs = 10;
        this.intervalId = setInterval(function() {
          vm.freshTime(freshMs);
        }, freshMs);
      }
    },
    pauseTimer() {
      if (this.intervalId) {
        this.intervalId = clearInterval(this.intervalId);
      }
    },
    setTime(time) {
      console.log('setTime');
      this.nowTime = time;
    },
    resetTimer() {
      this.pauseTimer();
      this.nowTime = 0;
      // console.log('nowTime',nowTime);
    }
  }

}
</script>
