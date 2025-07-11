export class VirtualDOM {
  static createElement(tag, props = {}, children = []) {
    return { tag, props, children: children.flat().filter(Boolean) };
  }

  static render(vnode, container) {
    if (!vnode) return;

    if (typeof vnode === 'string' || typeof vnode === 'number') {
      container.appendChild(document.createTextNode(String(vnode)));
      return;
    }

    if (vnode.tag) {
      const element = document.createElement(vnode.tag);

      // Simple attribute setting
      Object.entries(vnode.props || {}).forEach(([key, value]) => {
        if (key.startsWith('on') && typeof value === 'function') {
          const eventName = key.slice(2).toLowerCase();
          element.addEventListener(eventName, value);
        } else if (key === 'className') {
          element.className = value;
        } else if (key === 'style' && typeof value === 'string') {
          element.style.cssText = value;
        } else if (key === 'value') {
          element.value = value;
        } else if (key === 'disabled') {
          element.disabled = value;
        } else if (key === 'placeholder') {
          element.placeholder = value;
        } else if (key === 'type') {
          element.type = value;
        } else if (key === 'min' || key === 'max') {
          element.setAttribute(key, value);
        } else if (value !== null && value !== undefined) {
          element.setAttribute(key, value);
        }
      });

      // Render children
      (vnode.children || []).forEach(child => {
        this.render(child, element);
      });

      container.appendChild(element);
      return element;
    }

    console.warn('Unknown vnode type:', vnode);
  }

  static diff(oldVNode, newVNode) {
    if (!oldVNode) return { type: 'CREATE', vnode: newVNode };
    if (!newVNode) return { type: 'REMOVE' };
    if (typeof oldVNode !== typeof newVNode) return { type: 'REPLACE', vnode: newVNode };
    if (typeof oldVNode === 'string' || typeof oldVNode === 'number') {
      return String(oldVNode) !== String(newVNode) ? { type: 'REPLACE', vnode: newVNode } : null;
    }
    if (oldVNode.tag !== newVNode.tag) return { type: 'REPLACE', vnode: newVNode };

    return {
      type: 'UPDATE',
      props: this.diffProps(oldVNode.props, newVNode.props),
      children: this.diffChildren(oldVNode.children, newVNode.children)
    };
  }

  static diffProps(oldProps = {}, newProps = {}) {
    const patches = {};

    Object.keys(oldProps).forEach(key => {
      if (!(key in newProps)) {
        patches[key] = null;
      } else if (oldProps[key] !== newProps[key]) {
        patches[key] = newProps[key];
      }
    });

    Object.keys(newProps).forEach(key => {
      if (!(key in oldProps)) {
        patches[key] = newProps[key];
      }
    });

    return Object.keys(patches).length > 0 ? patches : null;
  }

  static diffChildren(oldChildren = [], newChildren = []) {
    const patches = [];

    const oldKeyed = {};
    const newKeyed = {};

    oldChildren.forEach((child, index) => {
      const key = child && child.props && child.props.key;
      if (key !== undefined) oldKeyed[key] = { child, index };
    });

    newChildren.forEach((child, index) => {
      const key = child && child.props && child.props.key;
      if (key !== undefined) newKeyed[key] = { child, index };
    });

    const hasKeys = Object.keys(oldKeyed).length > 0 || Object.keys(newKeyed).length > 0;

    if (hasKeys) {
      // Removals
      Object.entries(oldKeyed).forEach(([key, { index }]) => {
        if (!(key in newKeyed)) {
          patches.push({ index, patch: { type: 'REMOVE' } });
        }
      });

      // Creates and moves/updates
      newChildren.forEach((newChild, newIndex) => {
        const key = newChild && newChild.props && newChild.props.key;
        if (key !== undefined) {
          const oldRecord = oldKeyed[key];
          if (!oldRecord) {
            patches.push({ index: newIndex, patch: { type: 'CREATE', vnode: newChild } });
          } else {
            const patch = this.diff(oldRecord.child, newChild);
            if (patch) patches.push({ index: newIndex, patch });
            if (oldRecord.index !== newIndex) {
              patches.push({ index: newIndex, patch: { type: 'MOVE', from: oldRecord.index } });
            }
          }
        } else {
          const patch = this.diff(oldChildren[newIndex], newChild);
          if (patch) patches.push({ index: newIndex, patch });
        }
      });

      return patches.length > 0 ? patches : null;
    }

    // Non-keyed fallback
    const maxLength = Math.max(oldChildren.length, newChildren.length);
    for (let i = 0; i < maxLength; i++) {
      const patch = this.diff(oldChildren[i], newChildren[i]);
      if (patch) {
        patches.push({ index: i, patch });
      }
    }

    return patches.length > 0 ? patches : null;
  }
}

