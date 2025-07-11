import { Component } from '../../../core/Component.js';

export class WelcomeStep extends Component {
  constructor(props = {}) {
    super(props);
    this.userData = props.userData || {};
    this.handlers = props.handlers || {};
  }

  render() {
    const userData = this.userData;
    const handlers = this.handlers;

    return this.createElement('div', { className: 'step' }, [
      this.createElement('div', { className: 'step__emoji' }, ['\uD83C\uDFCB\uFE0F']),

      this.createElement('h2', { className: 'step__title' }, ['Willkommen!']),

      this.createElement('p', { className: 'step__text' }, [
        'Ich erstelle dir einen personalisierten Trainingsplan, der perfekt zu dir passt. Dazu stelle ich dir ein paar kurze Fragen.'
      ]),

      this.createElement('div', { className: 'form-group' }, [
        this.createElement('label', { className: 'form-label' }, ['Wie hei\u00dft du?']),
        this.createElement('input', {
          type: 'text',
          value: userData.name || '',
          className: 'form-input',
          placeholder: 'Dein Name',
          onInput: e => handlers.updateUserData('name', e.target.value)
        })
      ]),

      this.createElement('div', { className: 'form-group' }, [
        this.createElement('label', { className: 'form-label' }, ['Wie alt bist du? (optional)']),
        this.createElement('input', {
          type: 'number',
          min: '12',
          max: '100',
          value: userData.age || '',
          className: 'form-input',
          placeholder: 'Dein Alter',
          onInput: e => handlers.updateUserData('age', parseInt(e.target.value) || null)
        })
      ])
    ]);
  }
}
