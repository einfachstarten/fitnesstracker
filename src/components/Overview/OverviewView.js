import { Component } from '../../core/Component.js';
import { CalendarView } from '../CalendarView/CalendarView.js';

export class OverviewView extends Component {
  render() {
    console.log('Rendering OverviewView with props:', this.props);
    return this.createElement('div', { className: 'overview-view' }, [
      this.createElement('h2', {}, ['📅 Übersicht']),
      this.createElement('div', { className: 'weekly-stats' }, [
        this.createElement('h3', {}, ['Aktuelle Woche']),
        this.createElement('p', {}, ['0 von 3 Workouts abgeschlossen'])
      ]),
      this.createElement('div', { className: 'calendar-placeholder' }, [
        'Kalender wird geladen...'
      ])
    ]);
  }
}
