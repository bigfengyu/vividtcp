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

export class FakeTCP {
  constructor(port, network, datas, callbacks) {
    this.init(port, network, datas, callbacks);
  }

  init(port, network, datas, callbacks) {
    this.innerInterval = 0.04;
    this.timeoutInterval = network.RTT + 2 * network.bias;
    this.port = port;
    this.toPort = undefined;
    this.callbacks = {
      sendWindowChange: function(sendWindow, baseSeqNum, nextSeqNum) {},
      receiveWindowChange: function(receiveWindow, nextAckNum) {},
      sendMessage: function(message) {},
      receiveMessage: function(message) {},
      timeout:function(startTime,timeoutTime){},
      startTimer:function(startTime){},
      stopTimer:function(stopTime){}
    }
    this.callbacks = _.mapValues(this.callbacks, (f, key) => _.isFunction(callbacks[key]) ? callbacks[key] : f);
    this.network = network;
    network.accept(this);

    this.startTime = -1;
    this.nowTime = 0;
    this.dataBuffer = _.isArray(datas) ?
      _.map(datas, data => new TimeData(this.nowTime, data)) : [];
    this.nextDataNum = 0;

    this.receive_window_size = 1000;
    this.receiveWindow = _.map(_.range(this.receive_window_size), () => undefined);

    this.nextAckNum = 0;
    this.nextSeqNum = 0;
    this.baseSeqNum = 0;

    this.send_window_size = 1000;
    this.sendWindow = _.map(_.range(this.send_window_size), () => undefined);
    this.send_next = 0;
  }

  send(data) {
    this.dataBuffer.push(new TimeData(this.nowTime, data));
    this.sendNextAllData();
  }



  messageFactory(seqNum, ackNum, data) {
    let message = new Message();
    message.srcPort = this.port;
    message.distPort = this.toPort;
    message.seqNum = seqNum;
    message.ackNum = ackNum;
    message.data = data;
    return message;
  }


  udt_send(message) {
    // console.log(this.port,'***',message);
    this.callbacks.sendMessage(message);
    this.network.send(message);
  }

  update() {
    if (this.startTime != -1 &&
      this.nowTime - this.startTime > this.timeoutInterval) {
      this.timeout();
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
    let i = 0;
    while (this.sendNextData()) {
      i += 1;
    }
    return i;
  }

  sendNextData() {
    if (this.nextDataNum >= this.dataBuffer.length) {
      // buffer里没数据发送了
      return false;
    }

    if (this.nextSeqNum < this.baseSeqNum + this.send_window_size) {
      if (this.baseSeqNum === this.nextSeqNum) { // 第一次发送
        this.startTimer();
      }
      let data = this.dataBuffer[this.nextDataNum].rawData;
      let message = this.messageFactory(this.nextSeqNum, this.nextAckNum, data);
      // console.log('nextdata message',message);
      // console.log(this.port + '  sendData ' + '  seqNum=' + message.seqNum + '  ackNum=' + message.ackNum);
      this.sendWindow[this.nextSeqNum] = message;
      this.callbacks.sendWindowChange(this.sendWindow, this.baseSeqNum, this.nextSeqNum);
      this.udt_send(message);
      this.nextSeqNum += 1;
      this.nextDataNum += 1;
      return true;
    } else {
      return false; // 窗口满了
    }
  }

  timeout() {
    // console.log(this.port, 'timeout');
    this.callbacks.timeout(this.startTime,this.nowTime);
    this.startTimer();
    for (let i = this.baseSeqNum; i < this.nextSeqNum; ++i) {
      this.udt_send(this.sendWindow[i]);
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
    this.callbacks.sendWindowChange(this.sendWindow,this.baseSeqNum,this.nextSeqNum);
  }

  receive(message) {
    // console.log(this.port, 'receive message', message);
    this.callbacks.receiveMessage(message);
    if (this.isCorrupt(message)) {
      this.sendAck();
    } else {
      this.slideSendWindowTo(message.ackNum);
      if (this.baseSeqNum === this.nextSeqNum) {
        this.stopTimer();
        // console.log('stopTimer', this.startTime);
      } else {
        // console.log('startTimer');
        this.startTimer();
      }
      if (message.data && message.data != '') { // 非 pure Ack 才需要回应
        if (message.seqNum === this.nextAckNum) {
          // console.log(this.port,'valid message');
          this.receiveWindow[this.nextAckNum] = message;
          this.callbacks.receiveWindowChange(this.receiveWindow,this.nextAckNum);
          this.nextAckNum += 1;
          this.sendAck();
          this.sendNextAllData();
        } else {
          // console.log(this.port,'notvalid message');
          this.sendAck();
        }
      } else {
        // console.log(this.port,'pure Ack message');
      }

    }
  }
}
