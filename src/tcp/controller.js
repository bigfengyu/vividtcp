// class Line {
//   order;
//   begTime;
//   endTime;
//   loseTime = -1;
//   direct = 'lr';
// }

import _ from 'lodash'


export function segments2Lines(segments, lport, rport) {
  return _.map(segments, (line) => segment2Line(line,lport,rport));
}

export function segment2Line(segment, lport, rport) {
  let line = {};
  line.order = segment.order;
  line.begTime = segment.begTime;
  line.endTime = segment.endTime;
  line.loseTime = segment.loseTime;
  if (segment.message.srcPort === lport) {
    line.direct = 'lr';
  } else if (segment.message.srcPort === rport) {
    line.direct = 'rl';
  } else {
    line.direct = undefined;
  }
  return line;

}
