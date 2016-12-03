export default {
    name: "Transcanvas",
    props: {
        lines: {
            required: true
        },
        nowTime: {
            required: true
        },
        timeScale: {
            required: true
        },
        secInterScale: {
            required: true
        },
        paddingTop: {
            default: 5
        }
    },
    functional: true,
    render: function (p, context) {
        let arrowLines = [];
        for (let i = 0; i < context.props.lines.length; ++i) {
            let lineData = context.props.lines[i];
            // console.log('lineData.begTime', lineData.begTime);
            // console.log('context.props.nowTime', context.props.nowTime);


            if (lineData.begTime <= context.props.nowTime) {
                arrowLines.push(makeArrowLine(p,
                    lineData,
                    context.props.nowTime,
                    context.props.timeScale,
                    context.props.secInterScale,
                    context.props.paddingTop));
            }
        }
        // console.log(vnode.getTotalLength());
        // console.log(arrowLines)
        return p(
            'svg',
            {
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

function makeArrowLine(p, lineData, nowTime, timeScale, secInterScale, paddingTop) {
    let strokeColor, x1, x2, y1, y2, rotDegree;
    let timeInterval = lineData.endTime - lineData.begTime;
    let percentage = Math.min(1, (nowTime - lineData.begTime) / timeInterval);
    let width = 100;
    let height = (lineData.endTime - lineData.begTime) * timeScale * secInterScale;

    y1 = lineData.begTime * timeScale * secInterScale + paddingTop;
    y2 = y1 + height * percentage;

    Vue.set(lineData, 'x1', x1);
    Vue.set(lineData, 'x2', x2);
    Vue.set(lineData, 'y1', y1);
    Vue.set(lineData, 'y2', y2);


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

    let groupVNode = p('g',
        {
            class: 'arrowline arrowline' + lineData.order,
        },
        [
            lineVNode,
            arrowVNode
        ]
    )

    return groupVNode;

}