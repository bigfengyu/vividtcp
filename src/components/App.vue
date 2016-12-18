<style>
#app {
  height: 100vh;
}

.timeline-cut-mode {
  cursor: url(../assets/cut_cursor.svg) 12 12, auto
}

.top-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
}

.message-window-row {
  padding: 0 20px;
}

/*.message-window-tab .receive-window-col {
  position: relative;
  left: 20px;
}*/

.message-window-wrapper {
  min-height: 119px;
  max-height: 119px;
  overflow-y: auto;;
  /*border: 1px solid #777;*/
}

.message-window-text {
  color: #777;
}


/*.fold-button {
  float: right;
  z-index: 5;
}*/

.fold-button {
  /*position: absolute!important;
  right: 0;
  bottom: 0;*/
  float: right;
}

.clearfix:after {
  clear: both;
  content: '.';
  display: block;
  width: 0;
  height: 0;
  visibility: hidden;
}

.icon-col,
.slidebar {
  text-align: center;
}

.controlbar {
  background-color: #e8e8e8;
  min-width: 759px;
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
  /*vertical-align: middle;*/
}

.controlbar .slider {
  text-align: center;
  width: 120px;
  margin-bottom: 0!;
  margin-top: calc((60px - 45px) / 2);
}

.controlbar .speed-slider {
  margin-right: 10px;
}

.controlbar-right-item {
  float: left!important;
  display: block;
  /*display: inline-block;
  vertical-align: middle;*/
}

.controlbar .btn {
  margin-top: calc((60px - 36px) / 2);
}

.controlbar-right .cut-btn {
  margin-top: calc((60px - 48px) / 2);
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
  <div class="showtcp">

    <div class="top-panel">
      <mu-tabs :value="activeTab" @change="handleTabChange">
        <mu-tab value="features" title="功能" />
        <mu-tab value="show" title="展示" />
      </mu-tabs>

      <div v-if="activeTab === 'show'" class="tab show-tab clearfix">
        <div v-if="onShowTab === 'icons'" class="icons-tab">
          <mu-row gutter>
            <mu-col class="icon-col" desktop="50" tablet="50" width="50" style="padding-top:20px;">
              <img class="client-icon" height="86" src="../assets/server.png" />
              <p style="position:relative;top:4px;">发送方</p>
            </mu-col>
            <mu-col class="icon-col" desktop="50" tablet="50" width="50" style="padding-top:10px;">
              <img class="server-icon" height="100" src="../assets/client.png" />
              <p>接收方</p>
            </mu-col>
          </mu-row>
          <mu-flat-button label="收起" @click="handleTabChange('hide')" class="fold-button" primary/>
        </div>
        <div v-if="onShowTab === 'message-window'" class="message-window-tab">

            <mu-row class="message-window-row" gutter>
              <mu-col class="send-window-col" desktop="50" tablet="50" width="50">
                <h2 class="message-window-text">发送方发送窗口</h2>
                <div class="message-window-wrapper">
                  <send-window></send-window>
                </div>
              </mu-col>
              <mu-col class="receive-window-col" desktop="50" tablet="50" width="50">
                <h2 class="message-window-text">接收方接收窗口</h2>
                <div class="message-window-wrapper">
                  <receive-window></receive-window>
                </div>
              </mu-col>
            </mu-row>

          <mu-flat-button label="收起" @click="handleTabChange('hide')" class="fold-button" primary/>
        </div>
      </div>

      <mu-divider/>
    </div>

    <Timeline :class="{'timeline-cut-mode':cutMode}" :cutMode="cutMode" :position-top="topPanelHeight" :lines="lines" :secInterScale="secInterScale" :timeScale="timeScale" :autoScroll="autoScroll" :breakMode="breakMode"></Timeline>

    <div class="controlbar clearfix">
      <div class="btns controlbar-left">
        <mu-raised-button :label="toggleBtnText" @click="toggle" class="btn" primary/>
        <mu-raised-button label="重置" @click="reset" class="btn" primary/>
        <mu-raised-button label="发报(左)" @click="sendMessage('left')" class="btn" primary/>
        <!-- <mu-raised-button label="发报(右)" @click="sendMessage('right')" class="btn" primary/> -->
      </div>
      <div style="float:right;" class="controlbar-right clearfix">
        <div class="controlbar-right-item slider speed-slider">
          <span style="position:relative;top:8px">速度</span>
          <mu-slider style="margin:0;" v-model="speedSlider.value" :min="speedSlider.min" :max="speedSlider.max" />
        </div>
        <div class="controlbar-right-item slider sec-inter-slider">
          <span style="position:relative;top:8px">间距</span>
          <mu-slider v-model="secInterSlider.value" :min="secInterSlider.min" :max="secInterSlider.max" style="margin-bottom:0" />
        </div>
        <mu-icon-button class="controlbar-right-item cut-btn" :style="{color:cutMode?'#880000':'#777'}" icon="content_cut" @click="toggleCutMode()" />
        <div class="controlbar-right-item switchers">
          <mu-switch label="自动滚动" v-model="autoScroll" class="switcher" />
        </div>
        <div class="controlbar-right-item menus clearfix">
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
import Timeline from './Timeline'
import SendWindow from './windows/SendWindow.vue'
import ReceiveWindow from './windows/ReceiveWindow.vue'
import Snap from 'snapsvg';
import _random from 'lodash/random';
import _map from 'lodash/map'
export default {
  name: 'app',
  components: {
    Timeline,
    SendWindow,
    ReceiveWindow
  },
  props:{
    lines:{
      default(){
        return [];
      }
    }
  },
  data() {
    return {
      msgSegIndex: 0,
      activeTab: 'show',
      onShowTab: 'message-window',
      // lines: [],
      cutMode: false,
      timerState: 'stop',
      speedSlider: { // timeScale = 1000/value
        min: 5,
        max: 30,
        value: 10
      },
      topPanelHeight: 49,
      secInterSlider: {
        min: 300,
        max: 1000,
        value: 500
      },
      autoScroll: true,
      breakMode: 'infinate'
    }
  },
  computed: {
    onShowTab() {
      if (this.timerState === 'stop') {
        return 'icons';
      } else {
        return 'message-window';
      }
    },
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
    eventHub.$on('makeLineLose', this.makeLineLose);
  },
  mounted() {
    // this.load();
    let vm = this;
    this.handleTopPanelHeightChange();
  },
  beforeDestroy() {
    eventHub.$off('timerStateChange', this.handleTimerStateChange);
    eventHub.$off('makeLineLose', this.makeLineLose);
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
    },
    handleTopPanelHeightChange() {
      var vm = this;
      this.$nextTick(function() {
        let topPanel = document.querySelector('.top-panel');
        if (topPanel) {
          vm.topPanelHeight = topPanel.clientHeight;
        } else {
          vm.topPanelHeight = 49;
        }
      });
    },
    handleTimerStateChange(state) {
      this.timerState = state;
    },
    makeLineLose(lineOrder, loseTime) {
      this.lines = _map(this.lines, function(l) {
        if (l.order === lineOrder) {
          l.loseTime = loseTime;
          return l;
        } else {
          return l;
        }
      });
    },
    load() {
      function populate() {
        let lineNum = 20;
        let map = ['lr', 'rl'];
        let lines = [];
        for (let order = 1; order <= lineNum; ++order) {
          let begTime = (order - 1) * 0.02;
          let endTime = begTime + _random(0.010, 0.090);
          let loseTime = _random(0, 1) === 1 ? (endTime + begTime) / 2 : -1;
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
      } else {
        eventHub.$emit('TL-startTimer');
      }
    },
    reset() {
      // this.load();
      eventHub.$emit('TL-resetTimer');
    },
    sendMessage(side){
      eventHub.$emit('sendMessage',side);
    }
  },
  watch: {
    onShowTab() {
      this.handleTopPanelHeightChange();
    },
    activeTab() {
      this.handleTopPanelHeightChange();
    }
  }
}
</script>
