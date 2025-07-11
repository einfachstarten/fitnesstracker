import { Component } from '../../../core/Component.js';
import { ExerciseItem } from './ExerciseItem.js';

export class ExerciseList extends Component {
  render() {
    const { exercises = [] } = this.props;
    const items = exercises.map(ex => new ExerciseItem({ name: ex }).render());
    return this.createElement('ul', { className: 'exercise-list' }, items);
  }
}
