import { Component } from '../../../core/Component.js';

export class FocusStep extends Component {
  constructor(props) {
    super(props);
    this.userData = props.userData || {};
    this.handlers = props.handlers || {};
  }

  render() {
    const userData = this.userData;
    const handlers = this.handlers;
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
