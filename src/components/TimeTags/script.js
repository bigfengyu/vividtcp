import Tag from '../Tag'
import config from '../../config.js'
export default {
  name: 'TimeTags',
  components: {
    Tag
  },
  data() {
    return {

    }
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
    timeScale: {
      require: true
    },
    secInterScale: {
      require: true
    }
  },
  computed: {
    direct() {
      return {
        left: 'lr',
        right: 'rl'
      }[this.side];
    },
    color() {
      return {
        'left': 'green',
        'right': 'red'
      }[this.side];
    }
  },
  methods: {
    lineFinishedSVGPos(lineData) {
      let pos = {};
      let nowTime = this.nowTime;
      let timeScale = this.timeScale;
      let secInterScale = this.secInterScale;
      pos['y1'] = lineData.begTime * timeScale * secInterScale;
      pos['y2'] = lineData.endTime * timeScale * secInterScale;
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
      // console.log('isNeedShow', lineData);

      if (this.side === 'left') {
        if (lineData.direct === 'lr') {
          return lineData.begTime < this.nowTime;
        } else {
          return lineData.endTime < this.nowTime;
        }
      } else {
        if (lineData.direct === 'lr') {
          return lineData.endTime < this.nowTime;
        } else {
          return lineData.begTime < this.nowTime;
        }
      }

    },
    calcY(lineData, pos) {
      var svg = document.getElementById('svg');
      if (svg) {
        // console.log('pos', pos);
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
        // console.log('y', y);
        return svg.clientWidth * y / 100;
      } else {
        return undefined;
      }
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
      }[this.side][lineData.direct];
    }
  }
}
