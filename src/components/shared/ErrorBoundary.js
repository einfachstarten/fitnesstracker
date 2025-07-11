export class ErrorBoundary {
  constructor(component) {
    this.component = component;
  }

  mount(container) {
    try {
      this.component.mount(container);
    } catch (err) {
      container.innerHTML = '<div>Fehler: ' + err.message + '</div>';
    }
  }
}
