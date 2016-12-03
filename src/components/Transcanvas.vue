<template>
  <svg id="svg" viewBox="0 0 100 100" preserveAspectRatio="xMinYMin">
    <!--<line x1="0" y1="0" x2="100" y2="5"-->
    <!--style="stroke:rgb(99,99,99);stroke-width:0.5"/>-->
  </svg>
</template>
<style>
  #svg {
    width: 100%;
    height: 100%;
  }
  
  .arrowline:hover .line {
    stroke: #777
  }
  
  .arrowline:hover .arrow {
    fill: #777
  }
</style>
<script>
  import TweenLite from 'TweenLite'
  import Snap from 'snapsvg';
  import _ from 'lodash';
  export default{
    props: ['timeAnimateScale', 'secInterScale','preventOrderSet'],
    data(){
      return {
        paper: undefined
      }
    },
    mounted: function () {
      this.paper = Snap("#svg");
    },
    created: function () {
      eventHub.$on('t-drawline', this.drawline);
      eventHub.$on('t-removeline', this.removeline);
      eventHub.$on('testsvg', this.testsvg);
    },
    beforeDestroy: function () {
      eventHub.$off('t-drawline', this.drawline);
      eventHub.$off('t-removeline', this.removeline);
      eventHub.$off('testsvg', this.testsvg);
    },
    methods: {
      drawline: function (lineData) {
        delete this.preventOrderSet[lineData.order];
        var vm = this;
        var paper = this.paper;
        var timeAnimateScale = this.timeAnimateScale;
        var secInterScale = this.secInterScale;
        var x1 = 0, x2 = 98;
        var strokeColor = "#66bb6a";
        if (lineData.direct === 'rl') {
          x1 = 100;
          x2 = 2;
          strokeColor = "#880000";
        }
        var y1 = lineData.begTime * timeAnimateScale * secInterScale + 5;
        var y2 = lineData.endTime * timeAnimateScale * secInterScale + 5;


        lineData['y1'] = y1;
        lineData['y2'] = y2;

        var line = paper.path("M" + x1 + "," + y1 + "L" + x2 + "," + y2);

        this.$nextTick(function () {
          this.$emit('begindrawline', lineData, 'beg');
        });

        line.attr({
          stroke: strokeColor,
          strokeWidth: 0.5,
          class: 'line line' + lineData.order
        });
        var linelen = Math.ceil(line.getTotalLength());
        line.attr({
          strokeDasharray: linelen,
          strokeDashoffset: linelen
        });
        var arrow = paper.path('M-1 0 L0 -2 L1 0 z').attr({
          fill: strokeColor,
          stroke: 'none',
          class: 'arrow arrow' + lineData.order
        });
        
        var group = paper.g(line,arrow).attr("class","arrowline arrowline"+lineData.order);

        group.hover(function () {
          eventHub.$emit('lineHoverIn',group.node,lineData);
        },function () {
          eventHub.$emit('lineHoverOut',group.node,lineData);
        });

        var tweenTarget = {value: linelen};
        var animateTime = (lineData.endTime - lineData.begTime) * timeAnimateScale;
        TweenLite.to(tweenTarget, animateTime, {
          value: 0,
          ease: Linear.easeNone,
          onUpdate: onUpdate,
          onComplete: function () {
            vm.$emit('enddrawline', lineData, 'end');
          }
        });
        function onUpdate() {
          if(vm.preventOrderSet[lineData.order]){
            this.kill();
            delete vm.preventOrderSet[lineData.order];
          }
          var pos = tweenTarget.value;
          var point = line.getPointAtLength(linelen - pos);
          var rot = (point.alpha < 360 ? 180 + point.alpha : point.alpha) + 90;
          line.attr({strokeDashoffset: pos});
          if (rot != 360) {
            arrow.transform('translate(' + point.x + ',' + point.y + ') rotate(' + rot + ',0,0)');
          }
        }

      },
      removeline:function (order) {
        Snap.selectAll('.arrowline'+order).remove();
      },
    },

  }
</script>