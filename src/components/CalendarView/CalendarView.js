import { Component } from '../../core/Component.js';

export class CalendarView extends Component {
  render() {
    const container = this.createElement('div', { className: 'calendar-view' });

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const grid = this.createElement('div', { className: 'calendar-grid' });
    for (let d = start.getDate(); d <= end.getDate(); d++) {
      const date = this.createElement('div', { className: 'calendar-day' }, [d.toString()]);
      if (d === today.getDate()) {
        date.classList.add('today');
      }
      grid.appendChild(date);
    }
    container.appendChild(grid);
    return container;
  }
}
