import { Component } from '../../../core/Component.js';

export class GoalsStep extends Component {
  render(userData, handlers) {
    return this.createElement('div', { className: 'goals-step' }, [
      this.createElement('h2', {}, ['Ziele']),
      this.createElement(
        'button',
        {
          onClick: () => handlers.toggleArrayItem('goals', 'Muskelaufbau'),
          className: userData.goals.includes('Muskelaufbau') ? 'selected' : ''
        },
        ['Muskelaufbau']
      ),
      this.createElement(
        'button',
        {
          onClick: () => handlers.toggleArrayItem('goals', 'Kraft'),
          className: userData.goals.includes('Kraft') ? 'selected' : ''
        },
        ['Kraft']
      ),
      this.createElement(
        'button',
        {
          onClick: () => handlers.toggleArrayItem('goals', 'Ausdauer'),
          className: userData.goals.includes('Ausdauer') ? 'selected' : ''
        },
        ['Ausdauer']
      )
    ]);
  }
}
