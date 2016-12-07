<style>
#app {
  height: 100vh;
}

.app-cut-mode {
  cursor: url(./assets/cut_cursor.svg) 16 16,auto
}

.top-panel {
  /*position: absolute;*/
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
}

.fold-button {
  float: right;
  z-index: 5;
}

.top-panel :after,
.menus :after {
  clear: both;
  content: '.';
  display: block;
  width: 0;
  height: 0;
  visibility: hidden;
}

.icons {
  width: 100%;
  background-color: white;
}

.icon-col,
.slidebar {
  text-align: center;
}


/*@media (max-width: 480px) {
  .timeline {
    height: calc(90vh - 179px);
  }
  .server-icon,
  .client-icon {
    height: 64px;
  }
}*/

.controlbar {
  background-color: #e8e8e8;
  /*border-top: 1px solid #ff4081;*/
  height: 60px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
  padding: 0 calc((60px - 36px) / 2);
}

.controlbar>div {
  display: inline-block;
  vertical-align: middle;
}

.controlbar .btn {
  margin-top: calc((60px - 36px) / 2);
}


/*.controlbar .menu {
  text-align: left;
  /*margin-bottom: calc((60px - 48px) / 2);
}*/

.controlbar-right .cut-btn {
  margin-top: calc((60px - 48px) / 2);
  /*cursor: none!important;*/
}

.controlbar .switchers {
  margin-top: calc((60px - 25px) / 2);
}

.slider-text>.left {
  text-align: right;
}

.slider-text>.center {
  text-align: center;
}

.slider-text>.right {
  text-align: left;
}
</style>

<template>
<div id="app" :class="{'app-cut-mode':cutMode}">
  <div class="showtcp">

    <div class="top-panel">
      <mu-tabs :value="activeTab" @change="handleTabChange">
        <mu-tab value="basic" title="展示" />
        <mu-tab value="window" title="窗口" />
      </mu-tabs>
      <div v-if="activeTab == 'basic'" class="tab basic-tab">
        <mu-row class="icons" gutter>
          <mu-col class="icon-col" desktop="50" tablet="50" width="50">
            <img class="client-icon" height="64" src="./assets/computer.png" />
            <p>客户端(接收方)</p>
          </mu-col>
          <mu-col class="icon-col" desktop="50" tablet="50" width="50">
            <img class="server-icon" height="64" src="./assets/server.png" style="position: relative;top:10px" />
            <p style="position: relative;bottom:0px">服务器(发送方)</p>
          </mu-col>
        </mu-row>
        <mu-row class="sliders" gutter>
          <mu-col desktop="50" tablet="50" width="50" class="slidebar">
            <mu-row>
              <mu-col desktop="20" tablet="20" width="5">
              </mu-col>
              <mu-col desktop="60" tablet="60" width="90">
                <mu-slider v-model="speedSlider.value" :min="speedSlider.min" :max="speedSlider.max" style="margin-bottom:0" />
              </mu-col>
              <mu-col desktop="20" tablet="20" width="5"></mu-col>
            </mu-row>
            <mu-row class="slider-text">
              <mu-col class="left" desktop="20" tablet="20" width="10">
                慢
              </mu-col>
              <mu-col class="center" desktop="60" tablet="60" width="80">
                速度
              </mu-col>
              <mu-col class="right" desktop="20" tablet="20" width="10">
                快
              </mu-col>
            </mu-row>
          </mu-col>
          <mu-col desktop="50" tablet="50" width="50" class="slidebar">
            <mu-row>
              <mu-col desktop="20" tablet="20" width="5">

              </mu-col>
              <mu-col desktop="60" tablet="60" width="90">
                <mu-slider v-model="secInterSlider.value" :min="secInterSlider.min" :max="secInterSlider.max" style="margin-bottom:0" />
              </mu-col>
              <mu-col desktop="20" tablet="20" width="5"></mu-col>
            </mu-row>
            <mu-row class="slider-text">
              <mu-col class="left" desktop="20" tablet="20" width="10">
                小
              </mu-col>
              <mu-col class="center" desktop="60" tablet="60" width="80">
                间距
              </mu-col>
              <mu-col class="right" desktop="20" tablet="20" width="10">
                大
              </mu-col>
            </mu-row>
          </mu-col>
        </mu-row>
        <mu-flat-button label="收起" @click="handleTabChange('hide')" class="fold-button" primary/>
      </div>
      <mu-divider/>
    </div>


    <Timeline :position-top="topPanelHeight" :lines="lines" :secInterScale="secInterScale" :timeScale="timeScale" :autoScroll="autoScroll" :breakMode="breakMode"></Timeline>

    <div class="controlbar">
      <div class="btns controlbar-left">
        <!-- <mu-raised-button label="装填" @click="load" class="btn" primary/> -->
        <mu-raised-button :label="toggleBtnText" @click="toggle" class="btn" primary/>
        <mu-raised-button label="重置" @click="reset" class="btn" primary/>
      </div>
      <div style="float:right;" class="controlbar-right">
        <mu-icon-button :style="{color:cutMode?'black':'#777'}" icon="content_cut" class="cut-btn" @click="toggleCutMode()" />
        <div class="switchers" style="float:right;">
          <mu-switch label="自动滚动" v-model="autoScroll" class="switcher" />
        </div>
        <div class="menus" style="float:right;">
          <!-- <span style="display:inline-block;vertical-align:center;">暂停模式：</span> -->
          <mu-dropDown-menu :value="breakMode" @change="handleBreakModeChange" class="menu">
            <mu-menu-item value="until-end" title="画完" />
            <mu-menu-item value="single-step" title="单步" />
            <mu-menu-item value="infinate" title="无尽" />
          </mu-dropDown-menu>
        </div>
      </div>

    </div>
  </div>
</div>
</template>

<script>
import Timeline from './components/Timeline'
import Snap from 'snapsvg';
import random from 'lodash/random';
export default {
  name: 'app',
  components: {
    Timeline
  },
  data() {
    return {
      msgSegIndex: 0,
      activeTab: 'basic',
      lines: [],
      cutMode: false,
      topPanelHeight: 0,
      timerState: 'stop',
      speedSlider: { // timeScale = 1000/value
        min: 5,
        max: 30,
        value: 10
      },
      secInterSlider: {
        min: 300,
        max: 1000,
        value: 500
      },
      autoScroll: true,
      breakMode: 'until-end'
    }
  },
  computed: {
    toggleBtnText() {
      return {
        'run': '暂停',
        'stop': '开始',
        'pause': '继续'
      }[this.timerState];
    },
    timeScale() {
      return 1000 / this.speedSlider.value;
    },
    secInterScale() {
      return this.secInterSlider.value;
    }
  },
  created() {
    eventHub.$on('timerStateChange', this.handleTimerStateChange);
  },
  mounted() {
    this.load();
    let vm = this;
    this.handleTabChange(this.activeTab);
  },
  beforeDestroy() {
    eventHub.$off('timerStateChange', this.handleTimerStateChange);
  },
  methods: {
    toggleCutMode() {
      this.cutMode = !this.cutMode;
    },
    handleBreakModeChange(val) {
      this.breakMode = val;
    },
    handleTabChange(val) {
      this.activeTab = val;
      var vm = this;
      this.$nextTick(function() {
        if (val === 'hide') {
          vm.topPanelHeight = 49;
        } else {
          let tab = document.querySelector('.tab');
          if (tab) {
            vm.topPanelHeight = tab.clientHeight + 49;
          } else {
            vm.topPanelHeight = 49;
          }
        }
      });
    },
    handleTimerStateChange(state) {
      this.timerState = state;
    },
    load() {
      function populate() {
        let lineNum = 20;
        let map = ['lr', 'rl'];
        let lines = [];
        for (let order = 1; order <= lineNum; ++order) {
          let begTime = order * 0.02 + random(0.002, 0.010);
          let endTime = begTime + random(0.010, 0.090);
          let loseTime = random(0, 1) === 1 ? (endTime + begTime) / 2 : -1;
          // let loseTime = -1;
          let line = {
            order: order,
            begTime: begTime, // second
            endTime: endTime, // second
            loseTime: loseTime,
            direct: map[(order - 1) % 2],
          };
          lines.push(line);
        }
        return lines;
      }
      this.lines = populate();
    },
    toggle() {
      if (this.timerState === 'run') {
        eventHub.$emit('TL-pauseTimer');
      } else if (this.timerState === 'stop') {
        eventHub.$emit('TL-resetTimer');
        eventHub.$emit('TL-startTimer');
      } else {
        eventHub.$emit('TL-startTimer');
      }
    },
    reset() {
      this.load();
      eventHub.$emit('TL-resetTimer');
    }
  }
}
</script>
