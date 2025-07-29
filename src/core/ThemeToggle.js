import { Component } from './Component.js';

export class ThemeToggle extends Component {
  constructor(props = {}) {
    super(props);
    this.state = { isDark: this.getInitialTheme() };
  }

  getInitialTheme() {
    const stored = localStorage.getItem('fitness_theme_mode');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  setHtmlClass(isDark) {
    document.documentElement.classList.toggle('dark', isDark);
  }

  onMount() {
    this.setHtmlClass(this.state.isDark);
  }

  toggleTheme() {
    const isDark = !this.state.isDark;
    this.setHtmlClass(isDark);
    localStorage.setItem('fitness_theme_mode', isDark ? 'dark' : 'light');
    this.setState({ isDark });
  }

  render() {
    const icon = this.state.isDark
      ? this.createElement('svg', {
          className: 'w-6 h-6',
          viewBox: '0 0 24 24',
          fill: 'currentColor'
        }, [
          this.createElement('path', {
            d: 'M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z'
          })
        ])
      : this.createElement('svg', {
          className: 'w-6 h-6',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2'
        }, [
          this.createElement('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            d:
              'M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.05 17.95l-1.414 1.414M17.95 17.95l-1.414-1.414M6.05 6.05L4.636 7.464M12 8a4 4 0 100 8 4 4 0 000-8z'
          })
        ]);

    return this.createElement(
      'button',
      { className: 'theme-toggle-btn', onclick: () => this.toggleTheme() },
      [icon]
    );
  }
}
