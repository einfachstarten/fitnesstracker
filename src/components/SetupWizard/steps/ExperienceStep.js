import { Component } from '../../../core/Component.js';

export class ExperienceStep extends Component {
  constructor(props) {
    super(props);
    this.userData = props.userData || {};
    this.handlers = props.handlers || {};
  }

  render() {
    const userData = this.userData;
    const handlers = this.handlers;

    return this.createElement('div', { className: 'experience-step' }, [
      this.createElement('h2', {}, ['Erfahrung']),
      ['Anfänger', 'Fortgeschritten', 'Profi'].map(level =>
        this.createElement('button', {
          onClick: () => handlers.updateUserData('experience', level),
          className: userData.experience === level ? 'selected' : ''
        }, [level])
      )
    ]);
  }
}
