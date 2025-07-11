import { Component } from '../../../core/Component.js';

export class ExerciseItem extends Component {
  render() {
    const { name } = this.props;
    return this.createElement('li', { className: 'exercise-item' }, [name]);
  }
}
