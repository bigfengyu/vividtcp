import {
  Message
} from './Message.js'

import _ from 'lodash';


class TimeFunction {
  constructor(triggerTime, callback) {
    this.time = triggerTime;
    this.callback = callback;
  }
}

export class FakeTCP {
  constructor(port, network, datas, callbacks) {
    this.init(port, network, datas, callbacks);
  }

  init(port, network, datas, callbacks) {
    this.cacheDisorderedMessage = false;
    this.innerInterval = 0.01;
    this.timeoutInterval = network.RTT + 2 * network.bias;
    this.port = port;
    this.toPort = undefined;
    this.callbacks = {
      sendWindowChange: function(sendWindow, baseSeqNum, nextSeqNum) {},
      receiveWindowChange: function(receiveWindow, nextAckNum) {},
      sendMessage: function(message) {},
      receiveMessage: function(message) {},
      timeout: function(startTime, timeoutTime) {},
      startTimer: function(startTime) {},
      stopTimer: function(stopTime) {}
    }

    this.waits = []; // TimeFunction

    this.callbacks = _.mapValues(this.callbacks, (f, key) => _.isFunction(callbacks[key]) ? callbacks[key] : f);
    this.network = network;
    network.accept(this);

    this.startTime = -1;
    this.nowTime = 0;
    // this.dataBuffer = _.isArray(datas) ?
    //   _.map(datas, data => new FakeData(this.nowTime, data)) : [];

    this.receiveWindow = [];

    this.nextAckNum = 0;
    this.nextSeqNum = 0;
    this.baseSeqNum = 0;

    this.slideSize = 10;
    this.sendWindow = [];

    for (let i = 0; i < datas.length; ++i) {
      this.sendWindow.push(this.messageFactory(
        i, -1,
        datas[i]));
    }

    this.send_next = 0;

  }

  send(data) {
    this.sendWindow.push(this.messageFactory(
      this.sendWindow.length, -1,
      data));
    this.callbacks.sendWindowChange(this.sendWindow, this.baseSeqNum, this.nextSeqNum, this.slideSize);
    // this.sendNextAllData();
  }

  wait(func, delay) {
    console.log('this.nowTime + delay', this.nowTime + delay);
    this.waits.push(new TimeFunction(this.nowTime + delay, func));
  }

  triggerWaits() {
    let triggerCnt = 0;
    while (this.waits.length != 0) {
      let waitfuntion = this.waits[0];
      if (this.nowTime >= waitfuntion.time) {
        this.waits.shift();
        triggerCnt += 1;
        waitfuntion.callback();
      } else {
        break;
      }
    }
    return triggerCnt;
  }

  messageFactory(seqNum, ackNum, fakeData) {
    let message = new Message();
    message.srcPort = this.port;
    message.distPort = this.toPort;
    message.seqNum = seqNum;
    message.ackNum = ackNum;
    message.data = fakeData;
    return message;
  }


  udt_send(message) {
    // console.log(this.port,'***',message);
    this.callbacks.sendMessage(message);
    this.network.send(message);
    if (message.data) {
      message.data.transState = 'random';
    }
  }

  update() {
    this.triggerTimeout();
    if (this.waits.length != 0) {
      this.triggerWaits();
    } else {
      this.sendNextAllData();
    }
  }

  connect(port) {
    this.toPort = port;
  }

  startTimer() {
    // console.log('*****S');
    this.callbacks.startTimer(this.nowTime);
    this.startTime = this.nowTime;
  }

  stopTimer() {
    this.callbacks.stopTimer(this.nowTime);
    this.startTime = -1;
  }

  sendNextAllData() {
    let that = this;

    function waitSend() {
      if (that.sendNextData()) {
        that.wait(waitSend, that.innerInterval);
      }
    }
    waitSend();
  }

  sendNextData() {
    if (this.nextSeqNum >= this.sendWindow.length) {
      // sendWindow 内没数据了
      return false;
    }

    if (this.nextSeqNum < this.baseSeqNum + this.slideSize) {
      if (this.baseSeqNum === this.nextSeqNum) { // 第一次发送
        this.startTimer();
      }
      let message = this.sendWindow[this.nextSeqNum];
      message.ackNum = this.nextAckNum;
      this.udt_send(message);
      this.nextSeqNum += 1;
      this.callbacks.sendWindowChange(this.sendWindow, this.baseSeqNum, this.nextSeqNum, this.slideSize);
      return true;
    } else {
      return false; // 窗口满了
    }
  }
  triggerTimeout() {
    if (this.startTime != -1 &&
      this.nowTime - this.startTime > this.timeoutInterval) {
      this.timeout();
    }
  }
  timeout() {
    // console.log(this.port, 'timeout');
    this.callbacks.timeout(this.startTime, this.nowTime);
    this.startTimer();
    let that = this;
    for (let i = this.baseSeqNum, j = 0; i < this.nextSeqNum; ++i, ++j) {
      let message = this.sendWindow[i];
      this.wait(function() {
        that.udt_send(message);
      }, this.innerInterval * j);
    }
  }



  isCorrupt(message) {
    return message.checksum === 'unmatch';
  }

  sendAck() {
    if (!this.sendNextData()) { // 企图夹带传送一个ack，如果没有能发的东西，就发一个pure ack
      let seqNum = this.nextSeqNum === 0 ? 0 : this.nextSeqNum - 1;
      let ack = this.messageFactory(seqNum, this.nextAckNum);
      this.udt_send(ack);
      // console.log(this.port + ' sendACK ' + '  seqNum=' + ack.seqNum + '  ackNum=' + ack.ackNum);
    }
  }

  slideSendWindowTo(base) {
    this.baseSeqNum = base;
    this.callbacks.sendWindowChange(this.sendWindow, this.baseSeqNum, this.nextSeqNum, this.slideSize);
  }

  receive(message) {
    // console.log(this.port, 'receive message', message);
    this.callbacks.receiveMessage(message);
    if (this.isCorrupt(message)) {
      this.sendAck();
    } else {
      if (message.ackNum > this.baseSeqNum) {
        this.slideSendWindowTo(message.ackNum);
      }
      if (this.baseSeqNum === this.nextSeqNum) {
        this.stopTimer();
      } else {
        this.startTimer();
      }
      if (message.data && message.data != '') { // 非 pure Ack 才需要回应
        if (message.seqNum === this.nextAckNum) {
          this.receiveWindow.push(message);
          this.nextAckNum += 1;
          this.sendAck();
          this.callbacks.receiveWindowChange(this.receiveWindow, this.nextAckNum);
          console.log(this.port, 'valid message', message.seqNum, this.nextAckNum);
        } else {
          console.log(this.port, 'notvalid message', message.seqNum, this.nextAckNum);
          this.sendAck();
        }
      } else {
        console.log(this.port, 'pure Ack message');
      }

    }
  }
}
