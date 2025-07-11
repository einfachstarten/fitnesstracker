import { EventBus } from "./EventBus.js";
export class Component {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
    this.element = null;
    this.children = new Map();
    this.eventBus = props.eventBus || new EventBus();
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
    throw new Error('Component must implement render() method');
  }

  mount(container) {
    this.element = this.render();
    container.appendChild(this.element);
    this.onMount();
    return this.element;
  }

  unmount() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.onUnmount();
      this.element = null;
    }
  }

  update() {
    if (this.element) {
      const newElement = this.render();
      this.element.parentNode.replaceChild(newElement, this.element);
      this.element = newElement;
    }
  }

  // Lifecycle hooks
  onMount() {}
  onUnmount() {}
  onStateChange(prevState, newState) {}

  // Event handling
  emit(event, data) {
    this.eventBus.emit(event, data);
  }

  on(event, handler) {
    this.eventBus.on(event, handler);
  }

  off(event, handler) {
    this.eventBus.off(event, handler);
  }
}
