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
  /*height: 2000px;*/
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
<!-- <div class="timeline" style="timelineStyle"> -->
<div class="timeline">
  <mu-row class="timeline-scroll">
    <TimeIndicator ref="timeIndicator" :now-time="nowTime" :sec-inter-scale="secInterScale" :timer-state="timerState" :svg-width="svgWidth" :svg-height="svgHeight"></TimeIndicator>
    <mu-col desktop="25" tablet="15" width="15" class="timeline-left">
      <time-tags side="left" :lines="lines" :now-time="nowTime" :sec-inter-scale="secInterScale" :svg-width="svgWidth" :hoveredOrder="hoveredOrder"></time-tags>
    </mu-col>
    <mu-col desktop="50" tablet="70" width="70" class="canvas-wrapper" :style="canvasWrapperStyle()">
      <Transcanvas :lines="lines" :sec-inter-scale="secInterScale" :now-time="nowTime" :hoveredOrder="hoveredOrder" />
    </mu-col>
    <mu-col desktop="25" tablet="15" width="15" class="timeline-right">
      <time-tags side="right" :lines="lines" :now-time="nowTime" :sec-inter-scale="secInterScale" :svg-width="svgWidth" :hoveredOrder="hoveredOrder"></time-tags>
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
import TimeTags from './TimeTags'
import Transcanvas from './Transcanvas.js'
import TimeIndicator from './TimeIndicator'
import Scroll from 'ScrollToPlugin'
import TweenLite from 'TweenLite'
import _ from 'lodash'
export default {
  name: 'Timeline',
  components: {
    Transcanvas,
    TimeTags,
    TimeIndicator
  },
  props: {
    secInterScale: {
      default: 300
    },
    timeScale: {
      default: 100
    },
    autoScroll: {
      default: true
    },
    breakMode: { // 'single-step' 'until-end'  'infinate'
      default: 'until-end'
    }
  },
  data() {
    return {
      lines: [],
      hoveredOrder: -1,
      nowTime: 0,
      intervalId: undefined,
      leftTags: [],
      rightTags: [],
      preventOrderSet: {},
      svgWidth: 0,
      svgHeight: 0,
      timelineHeight: 0,
      timerState: 'stop',
      breakPoints: [],
      lastBreakPointIndex: -1,
      freshMs: 20
    }
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
    eventHub.$on('TL-setTime', this.setTime);
    eventHub.$on('TL-resetTimer', this.resetTimer);
    eventHub.$on('mouseoverMessage', this.setHoveredOrder);
    eventHub.$on('mouseleaveMessage', this.clearHoveredOrder);
  },
  beforeDestroy() {
    eventHub.$off('TL-load', this.addline);
    eventHub.$off('TL-startTimer', this.setTime);
    eventHub.$off('TL-pauseTimer', this.pauseTimer);
    eventHub.$off('TL-setTime', this.setTime);
    eventHub.$off('TL-resetTimer', this.resetTimer);
    eventHub.$off('mouseoverMessage', this.setHoveredOrder);
    eventHub.$off('mouseleaveMessage', this.clearHoveredOrder);
  },
  methods: {
    canvasWrapperStyle() {
      let indicator = this.$refs.timeIndicator;
      let top = this.timelineHeight;
      if (indicator) {
        // console.log(indicator.$el.style.top);
        top = (_.round(indicator.$el.offsetTop / this.timelineHeight) + 2) * this.timelineHeight;
      }
      return {
        height: top + 'px'
      }
    },
    scrollTo(y, time) {
      var vm = this;
      TweenLite.to(vm.$el, time, {
        scrollTo: y
      });
    },
    handleResize(event) {
      let svg = document.getElementById('svg');
      let timeline = document.querySelector('.timeline');
      this.svgWidth = svg.clientWidth;
      this.svgHeight = svg.clientHeight;
      this.timelineHeight = timeline.clientHeight;
    },
    setHoveredOrder(order) {
      this.hoveredOrder = order;
    },
    clearHoveredOrder() {
      this.hoveredOrder = -1;
    },
    load: function(lines) {
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
    setTimerState(state) {
      if (this.timerState != state) {
        this.timerState = state;
        eventHub.$emit('timerStateChange', state);
      }
    },
    startTimer() {
      let vm = this;
      this.setTimerState('run');
      this.intervalId = setInterval(function() {
        vm.freshTime(vm.freshMs);
      }, vm.freshMs);
      this.hoveredOrder = -1; // clear single-step hover
    },
    pauseTimer() {
      if (this.intervalId) {
        this.intervalId = clearInterval(this.intervalId);
      }
      this.setTimerState('pause');
    },
    stopTimer() {
      if (this.intervalId) {
        this.intervalId = clearInterval(this.intervalId);
      }
      this.setTimerState('stop');
    },
    setTime(time) {
      this.nowTime = time;
    },
    resetTimer() {
      this.stopTimer();
      this.nowTime = 0;
      this.scrollTo(0, 0.2);
    },
    handleAutoScroll() {
      if (this.autoScroll) {
        let height = this.$el.offsetHeight;
        let indicator = this.$refs.timeIndicator.$el;
        let top = indicator.offsetTop;
        let percent = (top - this.$el.scrollTop) / height;
        if (this.timerState === 'run' && !indicator.isHolding && percent > 0.7 && percent < 1) {
          this.scrollTo(top, 0.5);
        }
      }
    },
    handleBreakPoint(time) {
      let offset = this.freshMs / 1000 / this.timeScale;
      // let breakTime = _.find(this.breakPoints, (t) => time < t + offset && time > t);
      let timeLeIndex = _.sortedIndex(this.breakPoints, time); // [index-1] < time <= [index]
      // console.log(geIndex,time,this.breakPoints);
      if(timeLeIndex === 0){
        return;
      }
      let bpIndex = timeLeIndex - 1;
      if (bpIndex <= this.lastBreakPointIndex) {
        return;
      }
      console.log('bpIndex',bpIndex);
      let breakTime = this.breakPoints[bpIndex];
      if (this.breakMode === 'single-step') {
        this.nowTime = breakTime;
        this.hoveredOrder = _.find(this.lines, {
          'endTime': breakTime
        }).order;
        this.lastBreakPointIndex = bpIndex;
        this.pauseTimer();
      } else if (this.breakMode == 'until-end') {
        this.nowTime = breakTime;
        this.stopTimer();
      }

    },
    setBreakPoints(mode) {
      if (this.lines.length === 0) {
        return;
      }
      if (mode === 'single-step') {
        this.breakPoints = _.sortBy(_.map(this.lines, _.property('endTime')));
        console.log(this.breakPoints);
      } else if (mode === 'until-end') {
        this.breakPoints = [_.maxBy(this.lines, 'endTime').endTime];
        console.log(this.breakPoints);
      } else {;
      }
    }
  },
  watch: {
    nowTime(newVal, oldVal) {
      this.handleAutoScroll();
      this.handleBreakPoint(newVal);
    },
    lines() {
      this.setBreakPoints(this.breakMode);
    },
    breakMode() {
      this.setBreakPoints(this.breakMode);
    },
    secInterScale() {
      if (this.autoScroll) {
        let height = this.$el.offsetHeight;
        let indicator = this.$refs.timeIndicator;
        let top = indicator.top();
        let percent = (top - this.$el.scrollTop) / height;
        if (this.timerState === 'run' && !indicator.isHolding) {
          this.scrollTo(top, 0.5);
        }
      }
    }
  }
}
</script>
