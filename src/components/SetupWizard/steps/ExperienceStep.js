import { Component } from '../../../core/Component.js';

export class ExperienceStep extends Component {
  render(userData, handlers) {
    return this.createElement('div', { className: 'experience-step' }, [
      this.createElement('h2', {}, ['Erfahrung']),
      ['Anf\u00e4nger', 'Fortgeschritten', 'Profi'].map(level =>
        this.createElement('button', {
          onClick: () => handlers.updateUserData('experience', level),
          className: userData.experience === level ? 'selected' : ''
        }, [level])
      )
    ]);
  }
}
