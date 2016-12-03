<template>
  <div id="app">
    </mu-appbar>
    <div class="showtcp">


      <div class="top-panel">

        <mu-tabs :value="activeTab" @change="handleTabChange">
          <mu-tab value="basic" title="基本" />
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

          <mu-row class="infos" gutter>

            <mu-col class="info-col" desktop="50" tablet="50" width="50">
              <mu-raised-button label="设置" ref="button" @click="" />

              <!--<mu-popover :trigger="trigger" :open="open" @close="handleClose">-->
              <!--<mu-menu>-->
              <!--<mu-menu-item>-->
              <!--<mu-text-field hintText="发送窗口长度" type="number" icon="backup"/>-->
              <!--</mu-menu-item>-->
              <!--<mu-menu-item>-->
              <!--<mu-text-field hintText="接收窗口长度" type="number" icon="get_app"/>-->
              <!--</mu-menu-item>-->
              <!--</mu-menu>-->
              <!--</mu-popover>-->
            </mu-col>

            <mu-col class="info-col" desktop="50" tablet="50" width="50">
              <mu-raised-button label="设置" ref="button" @click="" />
            </mu-col>

          </mu-row>
        </div>

      </div>

      <mu-divider/>

      <Timeline :lines="lines"></Timeline>

      <div class="controlbar">
        <mu-raised-button label="画线" @click="drawline" class="demo-raised-button btn" primary/>
        <mu-raised-button label="上一步" @click="lastStep" class="demo-raised-button btn" primary/>
        <mu-raised-button label="删除1" @click="remove" class="demo-raised-button btn" primary/>
        <mu-raised-button label="开始计时" @click="startTimer" class="demo-raised-button btn" primary/>
        <mu-raised-button label="暂停计时" @click="pauseTimer" class="demo-raised-button btn" primary/>
      </div>
    </div>
  </div>
</template>

<script>

  import Timeline from './components/TimelineNew'
  import Snap from 'snapsvg';
  export default {
    name: 'app',
    components: {
      Timeline
    },
    data(){
      return {
        msgSegIndex: 0,
        activeTab: 'basic',
        lines: []
      }
    },
    methods: {
      handleTabChange: function (val) {
        this.activeTab = val;
      },
      remove: function () {
        eventHub.$emit('tl-removeline', 1);
      },
      drawline: function () {
        var lineNum = 10;
        var order = 1;
        var map = ['lr', 'rl'];
        eventHub.$emit('tl-startTimer');
        for (; order <= lineNum; ++order) {
          (function (order) {
            setTimeout(function () {
              var line = {
                order: order,
                begTime: (order - 1) * 0.02,  // second
                endTime: order * 0.02,  // second
                lose: false,
                direct: map[(order - 1) % 2]
              };
              eventHub.$emit('tl-addline', line);
            }, (order - 1) * 0.02*1000*100);
          }(order));
        }
      },
      lastStep(){
        eventHub.$emit('tl-removeLastLine');
      },
      startTimer(){
        eventHub.$emit('tl-startTimer');

      },
      pauseTimer(){
        eventHub.$emit('tl-pauseTimer');
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
  .info-col {
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

  .controlbar > .btn {
    margin-top: calc((60px - 36px) / 2);
  }
</style>
