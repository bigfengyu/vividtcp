import {
  Message
} from './Message.js'

import _ from 'lodash';

class TimeData {
  constructor(addTime, data) {
    this.addTime = addTime;
    this.rawData = data;
  }
}

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
    //   _.map(datas, data => new TimeData(this.nowTime, data)) : [];

    this.receiveWindow = [];

    this.nextAckNum = 0;
    this.nextSeqNum = 0;
    this.baseSeqNum = 0;

    this.slideSize = 10;
    this.sendWindow = [];

    for (let i = 0; i < datas.length; ++i) {
      this.sendWindow.push(this.messageFactory(
        i, -1,
        new TimeData(this.nowTime, datas[i])));
    }

    this.send_next = 0;

  }

  send(data) {
    this.sendWindow.push(this.messageFactory(
      this.sendWindow.length, -1,
      new TimeData(this.nowTime, data)));
    this.callbacks.sendWindowChange(this.sendWindow, this.baseSeqNum, this.nextSeqNum);
    this.sendNextAllData();
  }

  wait(func, delay) {
    this.waits.push(new TimeFunction(this.nowTime + delay, func));
  }

  triggerWaits() {
    while (this.waits.length != 0) {
      let waitfuntion = this.waits[0];
      if (this.nowTime >= waitfuntion.time) {
        this.waits.shift();
        waitfuntion.callback();
      } else {
        break;
      }
    }
  }

  messageFactory(seqNum, ackNum, timedata) {
    let message = new Message();
    message.srcPort = this.port;
    message.distPort = this.toPort;
    message.seqNum = seqNum;
    message.ackNum = ackNum;
    message.data = timedata;
    return message;
  }


  udt_send(message) {
    // console.log(this.port,'***',message);
    this.callbacks.sendMessage(message);
    this.network.send(message);
  }

  update() {
    this.triggerTimeout();
    this.triggerWaits();
    this.sendNextAllData();
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
    let i = 0;
    while (this.sendNextData()) {
      i += 1;
    }
    return i;
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
      // let data = this.dataBuffer[this.nextDataNum].rawData;
      // let message = this.messageFactory(this.nextSeqNum, this.nextAckNum, data);
      // // console.log('nextdata message',message);
      // // console.log(this.port + '  sendData ' + '  seqNum=' + message.seqNum + '  ackNum=' + message.ackNum);
      // this.sendWindow[this.nextSeqNum] = message;
      let message = this.sendWindow[this.nextSeqNum];
      message.ackNum = this.nextAckNum;
      this.udt_send(message);
      this.nextSeqNum += 1;
      this.callbacks.sendWindowChange(this.sendWindow, this.baseSeqNum, this.nextSeqNum);
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
    this.callbacks.sendWindowChange(this.sendWindow, this.baseSeqNum, this.nextSeqNum);
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
