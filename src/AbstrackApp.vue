<template>
<div class="abstract-app">
  <App :lines="lines"/>
</div>
</template>

<script>
import App from './components/App.vue'
import _ from 'lodash'
import {
  FakeNetwork as Network
} from './tcp/FakeNetwork.js'

import {
  Message
} from './tcp/Message.js'

import {
  segment2Line,
  segments2Lines
} from './tcp/controller.js'

import {
  FakeTCP as TCP
} from './tcp/TCP.js'



let transStatesP = {
  'normal': 0.5,
  'lose': 0.2,
  'deffered': 0.2,
  'corrupt': 0.1
}

const SingleState = {
  normal: {
    normal: 1
  },
  lose: {
    lose: 1
  },
  deffered: {
    deffered: 1
  },
  corrupt: {
    corrupt: 1
  }
}

let transStatesLose = {
  'lose': 1
}


let NormalAndLose = {
  'normal': 0.2,
  'lose': 0.8
}


let lport = 123,
  rport = 456;
let network, leftSocket, rightSocket;
export default {
  name: 'AbstractApp',
  components: {
    App
  },
  data() {
    return {
      lines: [],
    }
  },
  created() {
    let vm = this;
    eventHub.$on('updateTime', this.updateTime);
    eventHub.$on('backTime', this.backTime);
    eventHub.$on('resetNet', this.init);
    eventHub.$on('sendMessage', this.sendMessage);
    this.init();
  },
  methods: {
    updateTime(time) {
      network.nowTime = time;
      leftSocket.nowTime = time;
      rightSocket.nowTime = time;
      network.update();
      leftSocket.update();
      rightSocket.update();
    },
    init() {
      console.log('**init**');
      this.lines = [];
      let vm = this;
      network = new Network(
        transStatesP,
        0.08,
        0.02,
        function(newSegment) { // newTransCallBack
          console.log('seg', newSegment);
          vm.lines.push(segment2Line(newSegment, lport, rport));
        }
      );
      leftSocket = new TCP(lport, network, [], {
        sendWindowChange: function(sendWindow, baseSeqNum, nextSeqNum) {
          eventHub.$emit('sendWindowChange', sendWindow, baseSeqNum, nextSeqNum);
        },
        receiveWindowChange: function(receiveWindow, nextAckNum) {
          eventHub.$emit('receiveWindowChange', receiveWindow, nextAckNum);
        },
        sendMessage: function(message) {},
        receiveMessage: function(message) {},
        timeout: function(startTime, timeoutTime) {},
        startTimer: function(startTime) {},
        stopTimer: function(stopTime) {}
      });
      rightSocket = new TCP(rport, network, [], function(message) {
        console.log('right receive message', message);
      });
      leftSocket.connect(rport);
      rightSocket.connect(lport);
    },
    sendMessage(side) {
      if (side === 'left') {
        leftSocket.send('LEFT MESSAGE');
      } else if (side === 'right') {
        rightSocket.send('RIGHT MESSAGE');
      }
    },
    backTime(time) {
      let oldsegments = network.segments;
      network = new Network(
        network.transStatesP,
        network.RTT,
        network.bias,
        network.newTransCallBack,
        oldsegments.length
      );
      network.segments = oldsegments;
      let leftDatas = leftSocket.dataBuffer;
      let rightDatas = rightSocket.dataBuffer;
      leftSocket = new TCP(lport, network, [], leftSocket.receiveCallback);
      rightSocket = new TCP(rport, network, [], rightSocket.receiveCallback);

      leftSocket.connect(rport);
      rightSocket.connect(lport);

      let nowTime = 0;
      this.updateTime(nowTime);
      do {
        nowTime += 30 / 100000;
        nowTime = Math.min(nowTime, time);
        this.updateTime(nowTime);
        _.remove(leftDatas, d => nowTime >= d.addTime).forEach(d => leftSocket.send(d.rawData));
        _.remove(rightDatas, d => nowTime >= d.addTime).forEach(d => rightSocket.send(d.rawData));
      } while (nowTime < time);
      network.ignoreCnt = 0;
    }
  }
}
</script>
