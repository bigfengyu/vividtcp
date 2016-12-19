<template>
<div class="abstract-app">
  <App :lines="lines" />
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
  'normal': 0.9,
  'lose': 0.05,
  'deffered': 0.05,
  'corrupt': 0
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
        0.005,
        function(newSegment) { // newTransCallBack
          // console.log('seg', newSegment);
          vm.lines.push(segment2Line(newSegment, lport, rport));
        }
      );
      leftSocket = new TCP(lport, network, [], {
        sendWindowChange: function(sendWindow, baseSeqNum, nextSeqNum) {
          eventHub.$emit('sendWindowChange', sendWindow, baseSeqNum, nextSeqNum);
        },
        receiveWindowChange: function(receiveWindow, nextAckNum) {
        },
        sendMessage: function(message) {
          console.log('L send', message);
        },
        receiveMessage: function(message) {
          console.log('L receive', message);
        },
        timeout: function(startTime, timeoutTime) {
          console.log('L timeout');
        },
        startTimer: function(startTime) {},
        stopTimer: function(stopTime) {}
      });
      rightSocket = new TCP(rport, network, [], {
        sendWindowChange: function(sendWindow, baseSeqNum, nextSeqNum) {},
        receiveWindowChange: function(receiveWindow, nextAckNum) {
          // console.log('receiveWindowChange callback');
          eventHub.$emit('receiveWindowChange', receiveWindow, nextAckNum);
        },
        sendMessage: function(message) {
          console.log('R send', message)
        },
        receiveMessage: function(message) {
          console.log('R receive', message);
        },
        timeout: function(startTime, timeoutTime) {},
        startTimer: function(startTime) {},
        stopTimer: function(stopTime) {}
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
      // console.log('backtime', time);
      let oldsegments = _.filter(network.segments,seg => time >= seg.begTime).map(function(seg){
        seg.hasSent = false;
        return seg;
      })
      network = new Network(
        network.transStatesP,
        network.RTT,
        network.bias,
        network.newTransCallBack,
        oldsegments.length
      );
      network.segments = oldsegments;
      let leftSendWindow = leftSocket.sendWindow;
      let rightSendWindow = rightSocket.sendWindow;
      leftSocket = new TCP(leftSocket.port, network, [], leftSocket.callbacks);
      rightSocket = new TCP(rightSocket.port, network, [], rightSocket.callbacks);

      leftSocket.connect(rightSocket.port);
      rightSocket.connect(leftSocket.port);

      console.log('leftSendWindow', leftSendWindow);

      let nowTime = 0;
      this.updateTime(nowTime);
      do {
        nowTime += 30 / 100000;
        nowTime = Math.min(nowTime, time);
        this.updateTime(nowTime);
        _.remove(leftSendWindow, m => nowTime >= m.data.addTime).forEach(m => leftSocket.send(m.data.rawData));
        _.remove(rightSendWindow, m => nowTime >= m.data.addTime).forEach(m => rightSocket.send(m.data.rawData));
      } while (nowTime < time);
      network.ignoreCnt = 0;
      this.lines = _.filter(this.lines, line => time >= line.begTime);
      eventHub.$emit('sendWindowChange', leftSocket.sendWindow, leftSocket.baseSeqNum, leftSocket.nextSeqNum);
      eventHub.$emit('receiveWindowChange', rightSocket.receiveWindow, rightSocket.nextAckNum);
    }
  }
}
</script>
