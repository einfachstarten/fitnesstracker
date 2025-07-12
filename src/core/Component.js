import { EventBus } from "./EventBus.js";
import { VirtualDOM } from "./VirtualDOM.js";
export class Component {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
    this.element = null;
    this.children = new Map();
    this.eventBus = props.eventBus || new EventBus();
    this._handlers = [];
  }

  setState(newState) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...newState };
    this.onStateChange(prevState, this.state);
    if (this.element) {
      this.update();
    }
  }

  render() {
    throw new Error(`Component ${this.constructor.name} must implement render() method`);
  }

  mount(container) {
    try {
      this.lastVNode = this.render();
      const temp = document.createElement('div');
      VirtualDOM.render(this.lastVNode, temp);
      this.element = temp.firstChild;
      container.appendChild(this.element);
      this.onMount();
      return this.element;
    } catch (error) {
      console.error('Component mount failed:', error);
      throw error;
    }
  }

  unmount() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.onUnmount();
      this.element = null;
    }
  }

  update() {
    if (this.element && this.element.parentNode) {
      const parent = this.element.parentNode;
      parent.removeChild(this.element);
      this.lastVNode = this.render();
      const temp = document.createElement('div');
      VirtualDOM.render(this.lastVNode, temp);
      this.element = temp.firstChild;
      parent.appendChild(this.element);
      console.log(`${this.constructor.name} re-rendered`);
    }
  }

  applyPatches(element, patch) {
    if (!patch) return;
    switch (patch.type) {
      case 'REPLACE':
        const wrapper = document.createElement('div');
        VirtualDOM.render(patch.vnode, wrapper);
        element.parentNode.replaceChild(wrapper.firstChild, element);
        this.element = wrapper.firstChild;
        break;
      case 'CREATE':
        const tmp = document.createElement('div');
        VirtualDOM.render(patch.vnode, tmp);
        element.appendChild(tmp.firstChild);
        break;
      case 'REMOVE':
        element.parentNode && element.parentNode.removeChild(element);
        break;
      case 'UPDATE':
        if (patch.props) {
          Object.entries(patch.props).forEach(([key, value]) => {
            if (key === 'disabled') {
              if (value) {
                element.setAttribute('disabled', 'disabled');
                element.disabled = true;
              } else {
                element.removeAttribute('disabled');
                element.disabled = false;
              }
            } else if (key === 'className') {
              if (value === null) {
                element.removeAttribute('class');
              } else {
                element.className = value;
              }
            } else if (key === 'value') {
              element.value = value ?? '';
            } else if (value === null) {
              element.removeAttribute(key);
            } else {
              element.setAttribute(key, value);
            }
          });
        }
        break;
    }

    if (patch.children && Array.isArray(patch.children)) {
      patch.children.forEach(childPatch => {
        const idx = childPatch.index;
        const childElement = element.childNodes[idx];
        const cp = childPatch.patch;
        if (!cp) return;
        switch (cp.type) {
          case 'CREATE': {
            const tmp = document.createElement('div');
            VirtualDOM.render(cp.vnode, tmp);
            const ref = element.childNodes[idx];
            if (ref) element.insertBefore(tmp.firstChild, ref);
            else element.appendChild(tmp.firstChild);
            break;
          }
          case 'REMOVE':
            if (childElement) element.removeChild(childElement);
            break;
          case 'MOVE': {
            const fromEl = element.childNodes[cp.from];
            if (fromEl) {
              const ref = element.childNodes[idx];
              element.insertBefore(fromEl, ref);
            }
            break;
          }
          default:
            this.applyPatches(childElement, cp);
        }
      });
    }
  }

  // Lifecycle hooks
  onMount() {}
  onStateChange(prevState, newState) {}

  // Event handling
  emit(event, data) {
    this.eventBus.emit(event, data);
  }

  on(event, handler) {
    this.eventBus.on(event, handler);
    this._handlers.push({ event, handler });
  }

  off(event, handler) {
    this.eventBus.off(event, handler);
  }

  createElement(tag, props = {}, children = []) {
    return VirtualDOM.createElement(tag, props, children);
  }

  onUnmount() {
    this._handlers.forEach(h => this.eventBus.off(h.event, h.handler));
    this._handlers = [];
  }
}
