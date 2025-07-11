import { Component } from '../../core/Component.js';

export class OverviewView extends Component {
  render() {
    return this.createElement('div', { className: 'overview-view' }, [
      this.createElement('h2', {}, ['\ud83d\udcc5 \u00dcbersicht']),
      this.createElement('p', {}, ['Hier werden Statistiken angezeigt.'])
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
