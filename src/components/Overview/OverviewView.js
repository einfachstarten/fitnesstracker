import { Component } from '../../core/Component.js';
import { WeeklyStats } from '../WeeklyStats/WeeklyStats.js';
import { CalendarView } from '../CalendarView/CalendarView.js';

export class OverviewView extends Component {
  render() {
    return this.createElement('div', { className: 'overview-view' }, [
      this.createElement('h2', {}, ['\uD83D\uDCC5 \u00DCbersicht']),
      new WeeklyStats({ weeklyDataManager: this.props.weeklyDataManager }).render(),
      new CalendarView().render()
    ]);
  }
}
