export class ErrorTracker {
  constructor() {
    this.setupErrorHandlers();
  }

  setupErrorHandlers() {
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'unhandled_promise_rejection',
        message: event.reason?.message || event.reason,
        stack: event.reason?.stack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
    });
  }

  logError(errorData) {
    console.error('Error tracked:', errorData);
    const errors = JSON.parse(localStorage.getItem('fitness_error_log') || '[]');
    errors.push(errorData);
    if (errors.length > 50) {
      errors.splice(0, errors.length - 50);
    }
    localStorage.setItem('fitness_error_log', JSON.stringify(errors));
  }

  getErrorLog() {
    return JSON.parse(localStorage.getItem('fitness_error_log') || '[]');
  }
}

