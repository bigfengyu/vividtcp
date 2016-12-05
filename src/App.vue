<style>
.top-panel {
  height: 228px;
}

.icons {
  width: 100%;
  background-color: white;
}

.icon-col,
.slidebar {
  text-align: center;
}

@media (max-width: 480px) {
  .timeline {
    height: calc(90vh - 179px);
  }
  .server-icon,
  .client-icon {
    height: 64px;
  }
}

.controlbar {
  width: 100%;
  background-color: #e8e8e8;
  /*border-top: 1px solid #ff4081;*/
  height: 60px;
  position: fixed;
  bottom: 0;
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

.controlbar .menu {
  text-align: left;
  /*margin-bottom: calc((60px - 48px) / 2);*/
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
<div id="app">
  </mu-appbar>
  <div class="showtcp">

    <div class="top-panel">

      <mu-tabs :value="activeTab" @change="handleTabChange">
        <mu-tab value="basic" title="展示" />
        <mu-tab value="window" title="窗口" />
      </mu-tabs>
      <div v-show="activeTab == 'basic'" class="basic-tab">
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

        <mu-divider/>

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
      </div>

    </div>

    <mu-divider/>

    <Timeline :lines="lines" :secInterScale="secInterScale" :timeScale="timeScale" :autoScroll="autoScroll" :breakMode="breakMode">
    </Timeline>


    <div class="controlbar">
      <div class="btns">
        <mu-raised-button label="装填" @click="load" class="btn" primary/>
        <mu-raised-button :label="toggleBtnText" @click="toggle" class="btn" primary/>
        <mu-raised-button label="重置" @click="reset" class="btn" primary/>
      </div>
      <div style="float:right;">

        <div class="switchers" style="float:right;">
          <mu-switch label="自动滚动" v-model="autoScroll" class="switcher" />
        </div>
        <div class="menus" style="float:right;">
          <!-- <span style="display:inline-block;vertical-align:center;">暂停模式：</span> -->
          <mu-dropDown-menu :value="breakMode" @change="handleBreakModeChange" class="menu">
            <mu-menu-item value="until-end" title="画完" />
            <mu-menu-item value="single-step" title="单次" />
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
      timerState: 'stop',
      speedSlider: { // timeScale = 1000/value
        min: 5,
        max: 30,
        value: 10
      },
      secInterSlider: {
        min: 100,
        max: 800,
        value: 300
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
  beforeDestroy() {
    eventHub.$off('timerStateChange', this.handleTimerStateChange);
  },
  methods: {
    handleBreakModeChange(val) {
      this.breakMode = val;
    },
    handleTabChange(val) {
      this.activeTab = val;
    },
    handleTimerStateChange(state) {
      this.timerState = state;
    },
    load() {
      function populate() {
        let lineNum = 5;
        let map = ['lr', 'rl'];
        let lines = [];
        for (let order = 1; order <= lineNum; ++order) {
          let line = {
            order: order,
            begTime: (order - 1) * 0.02, // second
            endTime: order * 0.02, // second
            loseTime: -1,
            direct: map[(order - 1) % 2],
          };
          lines.push(line);
        }
        return lines;
      }
      eventHub.$emit('TL-load', populate());
    },
    toggle() {
      if (this.timerState === 'run') {
        eventHub.$emit('TL-pauseTimer');
      } else if(this.timerState === 'stop'){
        eventHub.$emit('TL-resetTimer');
        eventHub.$emit('TL-startTimer');
      } else {
        eventHub.$emit('TL-startTimer');
      }
    },
    reset() {
      eventHub.$emit('TL-resetTimer');
    }

  }

}
</script>
