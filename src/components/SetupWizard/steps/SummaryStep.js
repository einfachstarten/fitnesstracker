import { Component } from '../../../core/Component.js';

export class SummaryStep extends Component {
  constructor(props) {
    super(props);
    this.userData = props.userData || {};
  }

  render() {
    const userData = this.userData;
    return this.createElement('div', { className: 'summary-step' }, [
      this.createElement('h2', {}, ['Zusammenfassung']),
      this.createElement('pre', {}, [JSON.stringify(userData, null, 2)])
    ]);
  }
}
