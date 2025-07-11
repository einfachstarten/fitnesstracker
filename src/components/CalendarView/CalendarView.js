import { Component } from '../../core/Component.js';

export class CalendarView extends Component {
  render() {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const days = [];
    for (let d = start.getDate(); d <= end.getDate(); d++) {
      days.push(
        this.createElement('div', {
          className: d === today.getDate() ? 'calendar-day today' : 'calendar-day'
        }, [d.toString()])
      );
    }

    return this.createElement('div', { className: 'calendar-view' }, [
      this.createElement('div', { className: 'calendar-grid' }, days)
    ]);
  }
}
