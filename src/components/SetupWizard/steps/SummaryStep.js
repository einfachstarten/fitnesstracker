import { Component } from '../../../core/Component.js';

export class SummaryStep extends Component {
  render(userData) {
    return this.createElement('div', { className: 'summary-step' }, [
      this.createElement('h2', {}, ['Zusammenfassung']),
      this.createElement('pre', {}, [JSON.stringify(userData, null, 2)])
    ]);
  }
}
