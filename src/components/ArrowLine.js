export default {
    name: 'ArrowLine',
    functional: true,
    updated() {
        //getTotalLength
        Math.ceil(line.getTotalLength())
    },
    render(p, context) {
        function makeArrowLine(p, lineData, nowTime, timeAnimateScale, secInterScale) {
            var x1 = 0, x2 = 98;
            var strokeColor = "#66bb6a";
            if (lineData.direct === 'rl') {
                x1 = 100;
                x2 = 2;
                strokeColor = "#880000";
            }
            var y1 = lineData.begTime * timeAnimateScale * secInterScale + 5;
            var y2 = lineData.endTime * timeAnimateScale * secInterScale + 5;

            var lineElement = p('path', {
                attrs: {
                    d: "M" + x1 + "," + y1 + "L" + x2 + "," + y2,
                }
            });

            var arrowElement = p('path', {
                attrs: {
                    d: 'M-1 0 L0 -2 L1 0 z',
                    fill: strokeColor,
                    stroke: 'none',
                    class: 'arrow arrow' + lineData.order
                }
            });
        }
    }
}