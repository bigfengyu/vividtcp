import '../assets/common.css'

export default {
  name: "Transcanvas",
  props: {
    lines: {
      required: true
    },
    nowTime: {
      required: true
    },
    secInterScale: {
      required: true
    },
    hoveredOrder: {
      default: -1
    }
  },
  functional: true,
  render(p, context) {
    // console.log('render Transcanvas');
    let arrowLines = [];
    for (let i = 0; i < context.props.lines.length; ++i) {
      let lineData = context.props.lines[i];
      // console.log('lineData.begTime', lineData.begTime);
      // console.log('context.props.nowTime', context.props.nowTime);

      if (lineData.begTime < context.props.nowTime) {
        let isHovered = lineData.order === context.props.hoveredOrder;
        arrowLines.push(makeArrowLine(
          p,
          lineData,
          context.props.nowTime,
          context.props.secInterScale,
          isHovered));
      }
    }
    // console.log(vnode.getTotalLength());
    // console.log(arrowLines)
    return p(
      'svg', {
        attrs: {
          id: 'svg',
          viewBox: "0 0 100 100",
          preserveAspectRatio: "xMinYMin"
        },
        style: {
          width: '100%',
          height: '100%'
        }
      },
      arrowLines
    );
  }
}

function makeArrowLine(p, lineData, nowTime, secInterScale, isHovered) {
  let maxPercentage = 1;
  let isLosed = false;

  let strokeColor, x1, x2, y1, y2, rotDegree;
  let timeInterval = lineData.endTime - lineData.begTime;

  if (lineData.loseTime && lineData.loseTime != -1 && lineData.loseTime <= nowTime) {
    isLosed = true;
    maxPercentage = (lineData.loseTime - lineData.begTime) / timeInterval;
  }

  // console.log('maxPercentage',maxPercentage);

  let percentage = Math.min(maxPercentage, (nowTime - lineData.begTime) / timeInterval);
  let width = 100;
  let height = (lineData.endTime - lineData.begTime) * secInterScale;

  y1 = lineData.begTime * secInterScale;
  y2 = y1 + height * percentage;


  if (lineData.direct === 'lr') {
    //need swap x1 x2
    strokeColor = "#66bb6a";
    x1 = 0;
    x2 = x1 + width * percentage - 2;
    rotDegree = Math.atan(height / width) / Math.PI * 180 + 90;
  } else {
    strokeColor = "#880000";
    x1 = width;
    x2 = x1 - width * percentage + 2;
    rotDegree = Math.atan(width / height) / Math.PI * 180 + 180;
  }

  if (isHovered) {
    strokeColor = '#777';
  }

  let lineVNode = p('path', {
    class: 'line line' + lineData.order,
    attrs: {
      d: "M" + x1 + "," + y1 + "L" + x2 + "," + y2,
      stroke: strokeColor,
      'stroke-width': 0.5
    }
  });

  // 初始朝上的箭头

  let arrowVNode = p('path', {
    class: 'arrow arrow' + lineData.order,
    attrs: {
      d: 'M-1 0 L0 -2 L1 0 z',
      fill: strokeColor,
      stroke: 'none',
      transform: 'translate(' + x2 + ',' + y2 + ') rotate(' + rotDegree + ')'
    }
  });
  // 叉号
  let XVNode = p('path', {
    class: 'arrow arrow' + lineData.order,
    attrs: {
      d: 'M-1 -1 L1 1 M1 -1 L-1 1 z',
      stroke: strokeColor,
      transform: 'translate(' + x2 + ',' + y2 + ') rotate(' + rotDegree + ')',
      'stroke-width': 0.5
    }
  });

  let endVNode = isLosed ? XVNode : arrowVNode;


  let groupVNode = p('g', {
    class: 'arrowline arrowline' + lineData.order,
    on: {
      mouseover() {
        eventHub.$emit('mouseoverMessage', lineData.order);
      },
      mouseleave() {
        eventHub.$emit('mouseleaveMessage', lineData.order);
      }
    }
  }, [
    lineVNode,
    endVNode
  ])

  return groupVNode;

}
