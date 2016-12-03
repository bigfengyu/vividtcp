import { getChildrenTextContent } from './utils'
export default {
    functional: true,
    render: function (createElement, context) {
        var headingId = getChildrenTextContent(context.children)
            .toLowerCase()
            .replace(/\W+/g, '-')
            .replace(/(^\-|\-$)/g, '');
        return createElement(
            'h' + this.level,
            [
                createElement('a', {
                    attrs: {
                        name: headingId,
                        href: '#' + headingId
                    }
                }, this.$slots.default)
            ]
        );
    },
    props: {
        level: {
            type: Number,
            required: true
        }
    },
}


