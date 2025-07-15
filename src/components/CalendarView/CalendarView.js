import { Component } from '../../core/Component.js';

export class CalendarView extends Component {
  navigate(offset) {
    const { weeklyDataManager } = this.props;
    const current = weeklyDataManager.data.currentWeek;
    const newWeek = offset < 0
      ? weeklyDataManager.getPreviousWeek(current)
      : weeklyDataManager.getNextWeek(current);
    weeklyDataManager.data.currentWeek = newWeek;
    if (!weeklyDataManager.data.weeks[newWeek]) {
      weeklyDataManager.createWeek(newWeek);
    } else {
      weeklyDataManager.saveToStorage();
    }
    this.update();
  }

  renderDays(currentWeek, weekData) {
    const { weeklyDataManager } = this.props;
    const { start, end } = weeklyDataManager.getWeekBounds(currentWeek);
    const todayStr = new Date().toISOString().split('T')[0];
    const days = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const workout = weekData.workouts.find(w => w.date === dateStr);
      const classes = ['calendar-day-clean'];
      if (dateStr === todayStr) classes.push('today');
      if (workout?.isCompleted) classes.push('completed');
      else if (workout) classes.push('scheduled');
      days.push(
        this.createElement('div', { className: classes.join(' ') }, [
          this.createElement('div', { className: 'day-header-clean' }, [
            this.createElement('div', { className: 'day-name' }, [d.toLocaleDateString('de-DE', { weekday: 'short' })]),
            this.createElement('div', { className: 'day-number' }, [String(d.getDate())])
          ]),
          this.createElement('div', { className: 'status-indicator' }, [
            workout?.isCompleted
              ? this.createElement('div', { className: 'completed-check' }, [
                  this.createElement('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
                    this.createElement('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '3', d: 'M5 13l4 4L19 7' })
                  ])
                ])
              : workout
                ? this.createElement('div', { className: 'scheduled-dot' }, [])
                : this.createElement('div', { className: 'empty-hint' }, [])
          ]),
          dateStr === todayStr ? this.createElement('div', { className: 'today-marker' }, []) : null
        ])
      );
    }
    return days;
  }

  render() {
    const { weeklyDataManager } = this.props;
    const currentWeek = weeklyDataManager.data.currentWeek || weeklyDataManager.getCurrentWeek();
    const weekData = weeklyDataManager.getWeekData(currentWeek);
    const { start, end } = weeklyDataManager.getWeekBounds(currentWeek);

    return this.createElement('div', {}, [
      this.createElement('div', { className: 'week-header-clean' }, [
        this.createElement('button', { className: 'nav-button', onclick: () => this.navigate(-1) }, ['\u2190']),
        this.createElement('div', { className: 'week-info' }, [
          this.createElement('div', { className: 'week-dates' }, [`${start.getDate()}.${start.getMonth()+1} - ${end.getDate()}.${end.getMonth()+1}`]),
          this.createElement('div', { className: 'week-label' }, [`KW ${currentWeek.split('-W')[1]}`])
        ]),
        this.createElement('button', { className: 'nav-button', onclick: () => this.navigate(1) }, ['\u2192'])
      ]),
      this.createElement('div', { className: 'calendar-grid-clean' }, this.renderDays(currentWeek, weekData))
    ]);
  }
}
