export class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.startTime = performance.now();
    this.setupObservers();
  }

  setupObservers() {
    if ('PerformanceObserver' in window) {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
        this.sendMetric('lcp', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      new PerformanceObserver((entryList) => {
        const firstInput = entryList.getEntries()[0];
        this.metrics.fid = firstInput.processingStart - firstInput.startTime;
        this.sendMetric('fid', this.metrics.fid);
      }).observe({ entryTypes: ['first-input'] });

      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.metrics.cls = clsValue;
        this.sendMetric('cls', clsValue);
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  trackAppMetrics() {
    this.metrics.timeToInteractive = performance.now() - this.startTime;
    this.metrics.componentCount = document.querySelectorAll('[data-component]').length;
    this.metrics.memoryUsage = performance.memory ? performance.memory.usedJSHeapSize : null;
    this.sendMetric('app_metrics', this.metrics);
  }

  trackUserFlow(flowName, startTime) {
    const duration = performance.now() - startTime;
    this.sendMetric('user_flow', { flow: flowName, duration });
  }

  sendMetric(name, value) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metric', {
        custom_parameter_name: name,
        custom_parameter_value: value
      });
    }
    console.log(`Performance metric: ${name}`, value);
  }
}

