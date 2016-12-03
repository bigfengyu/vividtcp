export default {
    name: 'TimeTags',
    props: {
        lines: {
            require: true
        },
        nowTime: {
            require: true
        },
        scaleY: {
            require: true
        },
        side: {
            require: true
        }
    },
    computed: {
        direct() {
            return { left: 'lr', right: 'rl' }[this.side];
        }
    },
    methods: {
        isNeedShow(lineData) {
            return (lineData.begTime <= this.nowTime)
                && (lineData.y1);
        },
        calcY(lineData) {
            var svg = document.getElementById('svg');
            if (svg) {
                return svg.clientWidth * lineData.y1 / 100;
            } else {
                return undefined;
            }
        },
        style(lineData) {
            var style = { position: 'absolute' };
            var halfHeightOfTag = 12;
            style['top'] = this.calcY(lineData) - halfHeightOfTag + 'px';
            style[{ left: 'right', right: 'left' }[this.direct]] = '0';
            return style;
        },
        text(lineData) {
            if (this.direct === 'left')
                return lineData.order + ' ' + lineData.begTime;
            else
                return lineData.endTime + ' ' + lineData.order;

        }
    }
}

