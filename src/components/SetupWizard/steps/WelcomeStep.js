import { Component } from '../../../core/Component.js';

export class WelcomeStep extends Component {
  constructor(props) {
    super(props);
    this.userData = props.userData || {};
    this.handlers = props.handlers || {};
  }

  render() {
    const userData = this.userData;
    const handlers = this.handlers;

    const styles = {
      container: 'padding: 24px; text-align: center;',
      emoji: 'font-size: 4rem; margin-bottom: 16px;',
      title: 'font-size: 1.5rem; font-weight: bold; color: #1f2937; margin-bottom: 16px;',
      text: 'color: #6b7280; line-height: 1.6; margin-bottom: 24px;',
      input: 'width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; margin-bottom: 16px;',
      label: 'display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 8px; text-align: left;'
    };

    return this.createElement('div', {
      className: 'welcome-step text-center space-y-6',
      style: styles.container
    }, [
      this.createElement('div', {
        className: 'text-6xl',
        style: styles.emoji
      }, ['🏋️‍♀️']),

      this.createElement('h2', {
        className: 'text-2xl font-bold text-gray-800',
        style: styles.title
      }, ['Willkommen!']),

      this.createElement('p', {
        className: 'text-gray-600 leading-relaxed',
        style: styles.text
      }, ['Ich erstelle dir einen personalisierten Trainingsplan, der perfekt zu dir passt. Dazu stelle ich dir ein paar kurze Fragen.']),

      this.createElement('div', { className: 'space-y-4' }, [
        this.createElement('div', {}, [
          this.createElement('label', {
            className: 'block text-sm font-medium text-gray-700 mb-2',
            style: styles.label
          }, ['Wie heißt du?']),
          this.createElement('input', {
            type: 'text',
            value: userData.name || '',
            className: 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500',
            style: styles.input,
            placeholder: 'Dein Name',
            onInput: e => handlers.updateUserData('name', e.target.value)
          })
        ]),

        this.createElement('div', {}, [
          this.createElement('label', {
            className: 'block text-sm font-medium text-gray-700 mb-2',
            style: styles.label
          }, ['Wie alt bist du? (optional)']),
          this.createElement('input', {
            type: 'number',
            min: '12',
            max: '100',
            value: userData.age || '',
            className: 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500',
            style: styles.input,
            placeholder: 'Dein Alter',
            onInput: e => handlers.updateUserData('age', parseInt(e.target.value) || null)
          })
        ])
      ])
    ]);
  }
}
