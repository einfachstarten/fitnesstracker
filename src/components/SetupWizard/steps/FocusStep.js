import { Component } from '../../../core/Component.js';

export class FocusStep extends Component {
  render(userData, handlers) {
    const areas = ['Ganzk\u00f6rper', 'Oberk\u00f6rper', 'Unterk\u00f6rper', 'Core'];
    return this.createElement(
      'div',
      {},
      areas.map(a =>
        this.createElement(
          'button',
          {
            onClick: () => handlers.toggleArrayItem('focus', a),
            className: userData.focus.includes(a) ? 'selected' : ''
          },
          [a]
        )
      )
    );
  }
}
