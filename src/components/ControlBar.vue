<style>
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
</template>

<script>
export default {
  name: 'ControlBar',
  data() {
    return {
      cutMode: false,
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
      breakMode: 'infinate'
    }
  },
  methods: {
    toggle() {
      if (this.timerState === 'run') {
        eventHub.$emit('TL-pauseTimer');
      } else {
        eventHub.$emit('TL-startTimer');
      }
    },
    reset() {
      eventHub.$emit('TL-resetTimer');
    },
    sendMessage(side) {
      eventHub.$emit('sendMessage', side);
    },
    handleBreakModeChange(val) {
      this.breakMode = val;
    },
    timeScale() {
      return 1000 / this.speedSlider.value;
    },
    secInterScale() {
      return this.secInterSlider.value;
    },
    toggleCutMode() {
      this.cutMode = !this.cutMode;
    },
  }
}
</script>
