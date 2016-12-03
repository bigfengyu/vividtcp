<template>
  <div class="timeline">
    <div class="h-timeline" :style="hTimelineStyle()">
      <span class="time-indicator">{{nowTimeFixed}}</span>
    </div>
    <mu-row class="timeline-scroll">
      <mu-col desktop="25" tablet="15" width="15" class="timeline-left">
        <time-tags side="left" :lineData="line"></time-tags>
      </mu-col>
      <mu-col desktop="50" tablet="70" width="70" class="canvas-wrapper">
        <Transcanvas 
        :lines="lines"
        :time-scale="timeScale" 
        :sec-inter-scale="secInterScale" 
        :now-time="nowTime" 
        :paddingTop="5"
        />
      </mu-col>
      <mu-col desktop="25" tablet="15" width="15" class="timeline-right">
        <time-tags side="right" :lines="lines"></time-tags>
      </mu-col>
    </mu-row>
  </div>
</template>
<style>
  .time-indicator {
    margin-left: 20px;
  }
  
  .h-timeline {
    z-index: 5;
    position: absolute;
    width: 100%;
    line-height: 1;
    border-bottom: 1px dotted #000000;
  }
  
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
  
  .timeline-scroll {
    width: 100%;
  }
</style>
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
  import _ from 'lodash'
  export default{
    name: 'timeline',
    components: {
      Transcanvas,
      TimeTags
    },
    data(){
      return {
        lines: [],
        nowTime: -1,
        intervalId: undefined,
        secInterScale: 3,
        timeScale: 100,
        leftTags: [],
        rightTags: [],
        preventOrderSet: {},
      }
    },
    computed: {
      nowTimeFixed(){
        return this.nowTime.toFixed(5);
      }
    },
    mounted(){
      var vm = this;
      this.$nextTick(function () {
        vm.nowTime = 0; // 强制vue在svg挂载之后刷新htimeline的高度
      });
    },
    created(){
      // eventHub.$on('tl-addline', this.addline);
      // eventHub.$on('tl-removeline', this.removeline);
      // eventHub.$on('tl-removeLastLine', this.removeLastLine);
      // eventHub.$on('tl-startTimer', this.startTimer);
      // eventHub.$on('tl-pauseTimer', this.pauseTimer);
    },
    beforeDestroy(){
      // eventHub.$off('tl-addline', this.addline);
      // eventHub.$off('tl-removeline', this.removeline);
      // eventHub.$off('tl-removeLastLine', this.removeLastLine);
      // eventHub.$off('tl-startTimer', this.startTimer);
      // eventHub.$off('tl-pauseTimer', this.pauseTimer);
    },
    methods: {
      scaleY: function (y) {
        var svg = document.getElementById('svg');
        if (svg) {
          return svg.clientWidth * y / 100;
        } else {
          return y;
        }
      },
      hTimelineStyle(){
        return {top: this.scaleY(this.nowTime * this.timeScale * this.secInterScale + 5) - 15 + 'px'};
      },
      addline(line) {
        this.lines.push(line);
      },
      removelineByOrder(order){
        function predicator(line) { return line.order != order;}
        var vm = this;
        eventHub.$emit('t-removeline', order);
        vm.preventOrderSet[order] = true;
        this.lines = _.filter(this.lines, predicator);
        this.leftTags = _.filter(this.leftTags, predicator);
        this.rightTags = _.filter(this.rightTags, predicator);
      },
      removeLastLine(){
        if (this.lines.length) {
          this.removeline(this.lines[this.lines.length - 1].order);
        }
      },
      freshTime(interval){
        var seconds = interval / 1000;
        this.nowTime += seconds / this.timeScale;
      },
      startTimer(){
        window.TT = new Date();
        if (!this.intervalId) {
          var vm = this;
          var freshMs = 20;
          this.intervalId = setInterval(function () {
            vm.freshTime(freshMs);
          }, freshMs);
        }
      },
      pauseTimer(){
        if (this.intervalId) {
          console.log('pauseTiemer', this.intervalId);
          this.intervalId = clearInterval(this.intervalId);
          console.log(new Date() - window.TT);
        }
      }
    }

  }
</script>