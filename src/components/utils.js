/**
 * Created by fengyu on 2016/12/1.
 */

export function getChildrenTextContent(children) {
  return children.map(function (node) {
    return node.children
      ? getChildrenTextContent(node.children)
      : node.text
  }).join('');
};
