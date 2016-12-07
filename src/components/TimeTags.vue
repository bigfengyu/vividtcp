

<template>
<div class="vtags">
  <Tag
  v-for="(item,index) in lines"
  v-if="needShow(item)"
  :class="['tag'+item.order]"
  :text="text(item)"
  :color="color(item)"
  :direct="direct"
  :style="style(item)"
  @mouseover.native="onMouseover(item)"
  @mouseleave.native="onMouseleave(item)"
  >
  </Tag>
</div>
</template>

<script>
import Tag from './Tag'
import config from '../config.js'
export default {
  name: 'TimeTags',
  components: {
    Tag
  },
  props: {
    lines: {
      require: true
    },
    nowTime: {
      require: true
    },
    side: {
      require: true
    },
    secInterScale: {
      require: true
    },
    svgWidth: {
      require: true,
      default: 1
    },
    hoveredOrder: {
      default: -1
    }
  },
  computed: {
    direct() {
      return {
        left: 'lr',
        right: 'rl'
      }[this.side];
    }
  },
  methods: {
    onMouseover(lineData) {
      eventHub.$emit('mouseoverMessage', lineData.order);
    },
    onMouseleave(lineData) {
      eventHub.$emit('mouseleaveMessage', lineData.order);
    },
    lineFinishedSVGPos(lineData) {
      let pos = {};
      let nowTime = this.nowTime;
      let secInterScale = this.secInterScale;
      pos['y1'] = lineData.begTime * secInterScale;
      pos['y2'] = lineData.endTime * secInterScale;
      if (lineData.direct === 'lr') {
        pos['x1'] = 0;
        pos['x2'] = 98;
      } else {
        pos['x1'] = 100;
        pos['x2'] = 2;
      }
      return pos;
    },
    needShow(lineData) {
      let isLosed = false;
      if(lineData.loseTime && lineData.loseTime != -1){
        isLosed = true;
      }
      if (this.side === 'left') {
        if (lineData.direct === 'lr') {
          return lineData.begTime < this.nowTime;
        } else  {
          if(isLosed) return false;
          return lineData.endTime <= this.nowTime;
        }
      } else {
        if (lineData.direct === 'lr') {
          if(isLosed) return false;
          return lineData.endTime <= this.nowTime;
        } else {
          return lineData.begTime < this.nowTime;
        }
      }

    },
    calcY(lineData, pos) {
      let y = {
        left: {
          lr: pos.y1,
          rl: pos.y2
        },
        right: {
          lr: pos.y2,
          rl: pos.y1
        }
      }[this.side][lineData.direct];
      return this.svgWidth * y / 100;
    },
    style(lineData) {
      var style = {
        position: 'absolute'
      };
      var halfHeightOfTag = 12;
      style['top'] =
        this.calcY(lineData, this.lineFinishedSVGPos(lineData)) -
        halfHeightOfTag +
        config.timelinePadTop + 'px';
      style[{
        left: 'right',
        right: 'left'
      }[this.side]] = '0';
      if (lineData.order === this.hoveredOrder) {
        style['z-index'] = 4;
      }
      // console.log('style', style);
      return style;
    },
    text(lineData) {
      return {
        left: {
          lr: lineData.begTime,
          rl: lineData.endTime
        },
        right: {
          lr: lineData.endTime,
          rl: lineData.begTime
        }
      }[this.side][lineData.direct].toFixed(5);
    },
    color(lineData) {
      if (lineData.order === this.hoveredOrder) {
        return 'grey';
      } else if (this.side === 'left') {
        return 'green';
      } else {
        return 'red';
      }
    }
  }
}
</script>
