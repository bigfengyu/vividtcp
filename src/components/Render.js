import { getChildrenTextContent } from './utils'
export default {
  render: function (createElement) {
    var headingId = getChildrenTextContent(this.$slots.default)
      .toLowerCase()
      .replace(/\W+/g, '-')
      .replace(/(^\-|\-$)/g, '')
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
  }
}

