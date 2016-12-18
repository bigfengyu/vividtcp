<style>
.timeline {
  position: fixed;
  bottom: 60px;
  left: 0;
  right: 0;
  overflow: auto;
}

.canvas-wrapper {
  border-left: 3px dotted #66bb6a;
  border-right: 3px dotted #880000;
}

.timeline-left,
.canvas-wrapper,
.timeline-right {
  position: relative;
  padding-top: 20px;
}

.timeline-scroll {
  width: 100%;
}
</style>

<template>
<div class="timeline" :style="{top:positionTop + 'px'}">
  <mu-row class="timeline-scroll">
    <TimeIndicator ref="timeIndicator" :now-time="nowTime" :sec-inter-scale="secInterScale" :timer-state="timerState" :svg-width="svgWidth" :svg-height="svgHeight"></TimeIndicator>
    <mu-col desktop="25" tablet="15" width="15" class="timeline-left">
      <time-tags side="left" :lines="lines" :now-time="nowTime" :sec-inter-scale="secInterScale" :svg-width="svgWidth" :hoveredOrder="hoveredOrder"></time-tags>
    </mu-col>
    <mu-col desktop="50" tablet="70" width="70" class="canvas-wrapper" :style="canvasWrapperStyle()">
      <Transcanvas id="svg" :lines="lines" :sec-inter-scale="secInterScale" :now-time="nowTime" :hoveredOrder="hoveredOrder" />
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
//      loseTime:
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
import config from '../config'
export default {
  name: 'Timeline',
  components: {
    Transcanvas,
    TimeTags,
    TimeIndicator
  },
  props: {
    lines: {
      required: true
    },
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
    },
    positionTop: {
      default: 249
    },
    cutMode: {
      default: false


    }
  },
  data() {
    return {
      hoveredOrder: -1,
      nowTime: 0,
      intervalId: undefined,
      leftTags: [],
      rightTags: [],
      preventOrderSet: {},
      svgWidth: 0,
      svgHeight: 0,
      timerState: 'stop',
      breakPoints: [],
      lastBreakPointIndex: -1,
      freshMs: 30
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
    eventHub.$on('TL-startTimer', this.startTimer);
    eventHub.$on('TL-pauseTimer', this.pauseTimer);
    eventHub.$on('TL-setTime', this.setTime);
    eventHub.$on('TL-resetTimer', this.resetTimer);
    eventHub.$on('mouseoverMessage', this.setHoveredOrder);
    eventHub.$on('mouseleaveMessage', this.clearHoveredOrder);
    eventHub.$on('clickMessage', this.handleClickMessage);
  },
  beforeDestroy() {
    eventHub.$off('TL-startTimer', this.startTimer);
    eventHub.$off('TL-pauseTimer', this.pauseTimer);
    eventHub.$off('TL-setTime', this.setTime);
    eventHub.$off('TL-resetTimer', this.resetTimer);
    eventHub.$off('mouseoverMessage', this.setHoveredOrder);
    eventHub.$off('mouseleaveMessage', this.clearHoveredOrder);
    eventHub.$off('clickMessage', this.handleClickMessage);
  },
  methods: {
    canvasWrapperStyle() {
      let indicator = this.$refs.timeIndicator;
      let height = this.svgWidth * 2;
      if (indicator) {
        // console.log(indicator.$el.style.top);
        let timelineHeight = this.$el.offsetHeight
        height += (_.round(indicator.$el.offsetTop / timelineHeight) + 2) * timelineHeight;

      }
      this.svgHeight = height - config.timelinePadTop;
      return {
        height: height + 'px'
      }
    },
    scrollTo(y, time) {
      var vm = this;
      TweenLite.to(vm.$el, time, {
        scrollTo: y
      });
    },
    handleClickMessage(event, lineData) {
      if (this.cutMode) {
        let x = event.layerX;
        let percentage = x / this.svgWidth;
        if (lineData.direct === 'rl') {
          percentage = 1 - percentage;
        }
        let time = lineData.begTime + (lineData.endTime - lineData.begTime) * percentage;
        this.nowTime = time;
        eventHub.$emit('makeLineLose', lineData.order, time);
      }
    },
    handleResize(event) {
      let svg = document.getElementById('svg');
      this.svgWidth = svg.clientWidth;
      this.svgHeight = svg.clientHeight;
    },
    setHoveredOrder(order) {
      this.hoveredOrder = order;
    },
    clearHoveredOrder() {
      this.hoveredOrder = -1;
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
      eventHub.$emit('updateTime', this.nowTime);
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
      // 仅供信号槽使用
      // 设置时间会更新 lastBreakPointIndex 为当前时间前的中断点索引
      this.nowTime = time;
      if (this.timerState === 'stop') {
        this.setTimerState('pause'); // 画完之后向上滚时间线
      }
      this.lastBreakPointIndex = _.sortedIndexBy(this.breakPoints, {
        time: time
      }, 'time') - 1;
    },
    resetTimer() {
      this.stopTimer();
      this.nowTime = 0;
      this.lastBreakPointIndex = -1;
      eventHub.$emit('resetNet');
      this.scrollTo(0, 0.2);
    },
    handleAutoScroll() {
      if (this.autoScroll) {
        let height = this.$el.offsetHeight;
        let indicator = this.$refs.timeIndicator.$el;
        let top = indicator.offsetTop;
        let percent = (top - this.$el.scrollTop) / height;
        if (this.timerState === 'run' && !indicator.isHolding && percent > 0.8 && percent < 1) {
          this.scrollTo(top, 0.5);
        }
      }
    },
    handleBreakPoint(time) {
      // 当拨动时间指示器的时候，不做断点处理
      if (this.$refs.timeIndicator.isHolding) {
        return;
      }
      // let offset = this.freshMs / 1000 / this.timeScale;
      // let breakTime = _.find(this.breakPoints, (t) => time < t + offset && time > t);
      let timeLeIndex = _.sortedIndexBy(this.breakPoints, {
        time: time
      }, 'time'); // [index-1] < time <= [index]
      if (timeLeIndex === 0) {
        return;
      }
      let breakPointIndex = timeLeIndex - 1;
      // 避免反复暂停，向上拖动过该把this.lastBreakPointIndex变成-1
      if (breakPointIndex <= this.lastBreakPointIndex) {
        return;
      }
      let breakPoint = this.breakPoints[breakPointIndex];
      if (this.breakMode === 'single-step') {
        this.hoveredOrder = breakPoint.order;
        this.lastBreakPointIndex = breakPointIndex;
        this.pauseTimer();
      } else if (this.breakMode == 'until-end') {
        this.nowTime = breakPoint.time;
        this.pauseTimer();
      }
    },
    setBreakPoints(mode) {
      if (this.lines.length === 0) {
        return;
      }
      if (mode === 'single-step') {
        this.breakPoints =
          _.sortBy(
            _.map(this.lines,
              function(lineData) {
                if (lineData.loseTime && lineData.loseTime != -1) {
                  return {
                    order: lineData.order,
                    time: lineData.loseTime
                  };
                } else {
                  return {
                    order: lineData.order,
                    time: lineData.endTime
                  };
                }
              }),
            'time');
      } else if (mode === 'until-end') {
        let endBreakPoint = _.reduce(this.lines, function(breakPoint, curr) {
          if (curr.loseTime && curr.loseTime != -1) {
            if (curr.loseTime <= breakPoint.time) {
              return breakPoint;
            } else {
              return {
                order: curr.order,
                time: curr.loseTime
              };
            }
          } else if (curr.endTime > breakPoint.time) {
            return {
              order: curr.order,
              time: curr.endTime
            };
          } else {
            return breakPoint;
          }
        }, {
          order: 0,
          time: 0
        });
        this.breakPoints = [endBreakPoint];
        // console.log(this.breakPoints);
      } else {
        // infinate
        this.breakPoints = [];
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
