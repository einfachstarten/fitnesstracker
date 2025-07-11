import { Component } from '../../core/Component.js';

export class WeeklyStats extends Component {
  render() {
    const { weeklyDataManager } = this.props;
    const week = weeklyDataManager.getCurrentWeek();
    const data = weeklyDataManager.getWeekData(week);

    return this.createElement('div', { className: 'weekly-stats' }, [
      this.createElement('h3', {}, ['Aktuelle Woche']),
      this.createElement('p', {}, [`${data.completed} von ${data.target} Workouts abgeschlossen`])
    ]);
  }
}
