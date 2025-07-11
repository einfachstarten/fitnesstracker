import { Component } from '../../../core/Component.js';

export class ScheduleStep extends Component {
  constructor(props = {}) {
    super(props);
    this.userData = props.userData || {};
    this.handlers = props.handlers || {};
  }

  render() {
    const userData = this.userData;
    const handlers = this.handlers;
    return this.createElement('div', {}, [
      this.createElement('h2', {}, ['Zeitplan']),
      this.createElement('label', {}, ['H\u00e4ufigkeit (Tage/Woche)']),
      this.createElement('input', {
        type: 'number',
        min: '1',
        max: '7',
        value: userData.frequency || '',
        onInput: e => handlers.updateUserData('frequency', e.target.value)
      }),
      this.createElement('label', {}, ['Dauer pro Einheit']),
      this.createElement(
        'select',
        {
          value: userData.duration,
          onInput: e => handlers.updateUserData('duration', e.target.value)
        },
        [
          this.createElement('option', { value: '30min' }, ['30min']),
          this.createElement('option', { value: '45min' }, ['45min']),
          this.createElement('option', { value: '60min' }, ['60min']),
          this.createElement('option', { value: '90min' }, ['90min'])
        ]
      )
    ]);
  }
}
