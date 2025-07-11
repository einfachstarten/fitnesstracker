import { Component } from '../../core/Component.js';
import { ExerciseList } from './exercise/ExerciseList.js';

export class WorkoutView extends Component {
  render() {
    const { currentPlan } = this.props;
    const day = Object.keys(currentPlan || {})[0];
    const dayData = currentPlan ? currentPlan[day] : null;

    return this.createElement('div', { className: 'workout-view' }, [
      this.createElement('h2', {}, [dayData ? dayData.title : 'Workout']),
      dayData && new ExerciseList({ exercises: dayData.exercises }).render()
    ]);
  }
}
