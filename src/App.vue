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
                <mu-slider v-model="speedSlider.value" :min="speedSlider.min" :max="speedSlider.max" style="margin-bottom:0"/>
              </mu-col>
              <mu-col desktop="20" tablet="20" width="5"></mu-col>
            </mu-row>
            <mu-row>
              <mu-col desktop="20" tablet="20" width="5">
                慢
              </mu-col>
              <mu-col desktop="60" tablet="60" width="90">
                速度
              </mu-col>
              <mu-col desktop="20" tablet="20" width="5">
                快
              </mu-col>
            </mu-row>
          </mu-col>
          <mu-col desktop="50" tablet="50" width="50" class="slidebar">
            <mu-row>
              <mu-col desktop="20" tablet="20" width="5">

              </mu-col>
              <mu-col desktop="60" tablet="60" width="90">
                <mu-slider v-model="secInterSlider.value" :min="secInterSlider.min" :max="secInterSlider.max" style="margin-bottom:0"/>
              </mu-col>
              <mu-col desktop="20" tablet="20" width="5"></mu-col>
            </mu-row>
            <mu-row>
              <mu-col desktop="20" tablet="20" width="5">
                小
              </mu-col>
              <mu-col desktop="60" tablet="60" width="90">
                间距
              </mu-col>
              <mu-col desktop="20" tablet="20" width="5">
                大
              </mu-col>
            </mu-row>
          </mu-col>
        </mu-row>
      </div>

    </div>

    <mu-divider/>

    <Timeline :lines="lines" :secInterScale="secInterScale" :timeScale="timeScale"></Timeline>

    <div class="controlbar">
      <mu-row>
        <mu-col desktop="50" tablet="50" width="50">
          <mu-raised-button label="装填" @click="load" class="btn" primary/>
          <mu-raised-button label="设置区间" @click="setTimeRange" class="btn" primary/>
          <mu-raised-button :label="toggleBtnText" @click="toggle" class="btn" primary/>
          <mu-raised-button label="重置" @click="reset" class="btn" primary/>
          <mu-raised-button label="滚动" @click="scroll" class="btn" primary/>
        </mu-col>
      </mu-row>
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
      speedSlider:{  // timeScale = 1000/value
        min:5,
        max:30,
        value:10
      },
      secInterSlider:{
        min:100,
        max:800,
        value:300
      }
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
    timeScale(){
      return 1000 / this.speedSlider.value;
    },
    secInterScale(){
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
    scroll(){
      console.log('scroll');
      eventHub.$emit('TL-scrollTo',500);
    },
    handleTabChange(val) {
      this.activeTab = val;
    },
    handleTimerStateChange(state) {
      this.timerState = state;
    },
    load() {
      function populate() {
        let lineNum = 50;
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
    setTimeRange() {
      console.log('setTimeRange');
      eventHub.$emit('TL-setTimeRange', 0.02, 0.07);
    },
    toggle() {
      if (this.timerState === 'run') {
        eventHub.$emit('TL-pauseTimer');
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
  background-color: slategray;
  height: 60px;
  position: fixed;
  bottom: 0;
  z-index: 99;
  padding-left: calc((60px - 36px) / 2);
}

.controlbar .btn {
  margin-top: calc((60px - 36px) / 2);
}

.controlbar .sidebar {
  margin-top: calc((60px - 24px) / 2);
}
</style>
