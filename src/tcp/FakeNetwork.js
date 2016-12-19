import _ from 'lodash'
import Message from './Message.js'

const transStates = ['normal', 'lose', 'deffered', 'corrupt'];

function weightedRand(spec) {
  var i, sum = 0,
    r = Math.random();
  for (i in spec) {
    sum += spec[i];
    if (r <= sum) return i;
  }
}

export class FakeSegment {
  constructor(order, message, begTime, endTime, loseTime, transState) {
    this.order = order;
    this.message = message;
    this.begTime = begTime;
    this.endTime = endTime;
    this.loseTime = loseTime;
    this.transState = transState;
    this.hasSent = false;
  }
}





export class FakeNetwork {
  constructor(transStatesP, RTT, bias, newTransCallBack, ignoreCnt) {
    this.nowTime = 0;
    this.segments = [];
    this.segmentsState = [];
    this.sockets = {};
    this.RTT = RTT;
    this.bias = bias;
    this.newTransCallBack = newTransCallBack;
    this.ignoreCnt = typeof ignoreCnt === 'number' ? ignoreCnt : 0;
    this.transStatesP = _.pick(transStatesP, transStates);
  }

  accept(socket) {
    this.sockets[socket.port] = socket;
  }




  update() {
    this.deliever();
  }

  deliever() {
    let sockets = this.sockets;
    let segments = this.segments;
    _.filter(segments, seg => !seg.hasSent && this.nowTime >= seg.endTime)
      .forEach(
        function(segment) {
          if (segment.transState != 'lose') {
            let message = segment.message;
            if (_.has(sockets, message.distPort)) {
              segment.hasSent = true;
              sockets[message.distPort].receive(message);
            }
          } else {
            segment.hasSent = true;
          }
        }
      );
  }

  makeLoseSegment(message, order) {
    let interval = (this.RTT + _.random(-this.bias, this.bias, true)) / 2;
    // console.log('interval',interval);
    let loseTime = this.nowTime + _.random(0, interval, true);
    // console.log('loseTime',loseTime);
    let segment = new FakeSegment(
      order,
      message,
      this.nowTime,
      this.nowTime + interval,
      loseTime,
      'lose'
    );

    return segment;

  }

  makeDefferedSegment(message, order) {
    let interval = this.RTT / 2 * _.random(1.5, 2.5, true);

    let segment = new FakeSegment(
      order,
      message,
      this.nowTime,
      this.nowTime + interval, -1,
      'deffered'
    );

    return segment;

  }


  makeCorruptSegment(message, order) {
    message.checksum = 'unmatch';

    let interval = (this.RTT + _.random(-this.bias, this.bias)) / 2;

    let segment = new FakeSegment(
      order,
      message,
      this.nowTime,
      this.nowTime + interval, -1,
      'corrupt'
    );

    return segment;
  }

  makeNormalSegment(message, order) {
    let interval = (this.RTT + _.random(-this.bias, this.bias)) / 2;
    let segment = new FakeSegment(
      order,
      message,
      this.nowTime,
      this.nowTime + interval, -1,
      'normal'
    );
    return segment;
  }

  send(message) {
    let that = this;
    // console.log('network-1',message);
    // console.log('ignoreCnt',this.ignoreCnt);
    if (this.ignoreCnt > 0) {
      this.ignoreCnt -= 1;
      return;
    }

    // console.log('network-2',message);

    let makers = {
      normal: that.makeNormalSegment.bind(that),
      lose: that.makeLoseSegment.bind(that),
      deffered: that.makeDefferedSegment.bind(that),
      corrupt: that.makeCorruptSegment.bind(that)
    }


    // console.log('state:',state);

    // console.log('FK state', state)
    let state =
      message.data && message.data.transState != 'random' ?
      message.data.transState :
      weightedRand(this.transStatesP);
    // console.log('&&&&', message, 'state', state);
    let segment = makers[state](message, this.segments.length);
    this.newTransCallBack(segment);

    // console.log('FK segment',segment);

    // console.log('FK nowTime',this.nowTime);

    this.segments.push(segment);

    // console.log(message.srcPort,'segment:',segment);


  }

}
