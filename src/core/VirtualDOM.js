export class VirtualDOM {
  static createElement(tag, props = {}, children = []) {
    return { tag, props, children: children.flat() };
  }

  static render(vnode, container) {
    if (typeof vnode === 'string') {
      container.appendChild(document.createTextNode(vnode));
      return;
    }
    const element = document.createElement(vnode.tag);
    Object.entries(vnode.props).forEach(([key, value]) => {
      if (key.startsWith('on')) {
        element.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === 'className') {
        element.className = value;
      } else {
        element.setAttribute(key, value);
      }
    });
    vnode.children.forEach(child => this.render(child, element));
    container.appendChild(element);
  }

  static diff(oldVNode, newVNode) {
    if (!oldVNode) return { type: 'CREATE', vnode: newVNode };
    if (!newVNode) return { type: 'REMOVE' };
    if (typeof oldVNode !== typeof newVNode) return { type: 'REPLACE', vnode: newVNode };
    if (typeof oldVNode === 'string') {
      return oldVNode !== newVNode ? { type: 'REPLACE', vnode: newVNode } : null;
    }
    if (oldVNode.tag !== newVNode.tag) return { type: 'REPLACE', vnode: newVNode };
    return { type: 'UPDATE', props: this.diffProps(oldVNode.props, newVNode.props) };
  }

  static diffProps(oldProps, newProps) {
    const patches = {};
    Object.keys(oldProps).forEach(key => {
      if (!(key in newProps)) {
        patches[key] = null;
      } else if (oldProps[key] !== newProps[key]) {
        patches[key] = newProps[key];
      }
    });
    Object.keys(newProps).forEach(key => {
      if (!(key in oldProps)) patches[key] = newProps[key];
    });
    return Object.keys(patches).length > 0 ? patches : null;
  }
}

