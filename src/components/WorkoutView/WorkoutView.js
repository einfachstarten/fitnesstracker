import { Component } from '../../core/Component.js';

export class WorkoutView extends Component {
  render() {
    return this.createElement('div', { className: 'workout-view' }, [
      this.createElement('h2', {}, ['Workout']),
      this.createElement('p', {}, ['Workout Details hier'])
    ]);
  }

  createElement(tag, props = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(props).forEach(([k,v]) => {
      if (k === 'className') el.className = v;
      else el.setAttribute(k, v);
    });
    children.forEach(c => {
      if (typeof c === 'string') el.appendChild(document.createTextNode(c));
      else el.appendChild(c);
    });
    return el;
  }
}
