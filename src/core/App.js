import { EventBus } from './EventBus.js';
import { WorkoutPlanGenerator } from '../services/WorkoutPlanGenerator.js';
import { WeeklyDataManager } from '../services/WeeklyDataManager.js';
import { SetupWizard } from '../components/SetupWizard/SetupWizard.js';
import { OverviewView } from '../components/Overview/OverviewView.js';
import { WorkoutView } from '../components/WorkoutView/WorkoutView.js';
import { CalendarView } from '../components/CalendarView/CalendarView.js';
import { PerformanceMonitor } from '../utils/PerformanceMonitor.js';
import { ErrorTracker } from '../utils/ErrorTracker.js';

export class App {
  constructor() {
    this.eventBus = new EventBus();
    this.currentView = 'setup';
    this.components = new Map();

    this.exerciseDatabase = null;
    this.planGenerator = null;
    this.weeklyDataManager = new WeeklyDataManager();

    this.userData = null;
    this.currentPlan = null;

    this.performanceMonitor = new PerformanceMonitor();
    this.errorTracker = new ErrorTracker();
    window.addEventListener('load', () => {
      this.performanceMonitor.trackAppMetrics();
    });

    this.init();
  }

  async init() {
    try {
      await this.loadExerciseDatabase();
      this.planGenerator = new WorkoutPlanGenerator(this.exerciseDatabase);
      this.setupEventHandlers();
      this.checkExistingData();
      this.render();
    } catch (error) {
      console.error('App initialization failed:', error);
      this.showError('App konnte nicht geladen werden: ' + error.message);
    }
  }

  async loadExerciseDatabase() {
    try {
      const response = await fetch('./exercises.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.exerciseDatabase = await response.json();
    } catch (error) {
      console.warn('Could not load exercises.json, using fallback');
      this.exerciseDatabase = this.getFallbackExercises();
    }
  }

  setupEventHandlers() {
    this.eventBus.on('setup:complete', (userData) => {
      this.handleSetupComplete(userData);
    });

    this.eventBus.on('workout:complete', (workoutId) => {
      this.handleWorkoutComplete(workoutId);
    });

    this.eventBus.on('view:change', (viewName) => {
      this.changeView(viewName);
    });
  }

  checkExistingData() {
    const savedUserData = localStorage.getItem('fitness_user_data');
    const savedPlan = localStorage.getItem('fitness_current_plan');

    if (savedUserData && savedPlan) {
      this.userData = JSON.parse(savedUserData);
      this.currentPlan = JSON.parse(savedPlan);
      this.currentView = 'overview';
    }
  }

  handleSetupComplete(userData) {
    this.userData = userData;
    this.currentPlan = this.planGenerator.generatePlan(userData);

    localStorage.setItem('fitness_user_data', JSON.stringify(userData));
    localStorage.setItem('fitness_current_plan', JSON.stringify(this.currentPlan));

    this.changeView('overview');
  }

  handleWorkoutComplete(workoutId) {
    this.weeklyDataManager.completeWorkout(workoutId);
    this.eventBus.emit('data:updated');
  }

  changeView(viewName) {
    this.currentView = viewName;
    this.render();
  }

  render() {
    const container = document.getElementById('app');

    this.components.forEach(c => c.unmount());
    this.components.clear();

    let viewComponent;
    switch (this.currentView) {
      case 'setup':
        viewComponent = new SetupWizard({ eventBus: this.eventBus });
        break;
      case 'overview':
        viewComponent = new OverviewView({
          eventBus: this.eventBus,
          userData: this.userData,
          currentPlan: this.currentPlan,
          weeklyDataManager: this.weeklyDataManager
        });
        break;
      case 'calendar':
        viewComponent = new CalendarView({});
        break;
      case 'workout':
        viewComponent = new WorkoutView({
          eventBus: this.eventBus,
          currentPlan: this.currentPlan,
          weeklyDataManager: this.weeklyDataManager
        });
        break;
    }

    if (viewComponent) {
      this.components.set(this.currentView, viewComponent);
      viewComponent.mount(container);
    }
  }

  showError(message) {
    const container = document.getElementById('app');
    container.innerHTML = `
      <div class="error-screen">
        <h2>\u26a0\ufe0f Fehler</h2>
        <p>${message}</p>
        <button onclick="location.reload()">Neu laden</button>
      </div>
    `;
  }

  getFallbackExercises() {
    return {
      "Eigengewicht": [
        { "name": "Liegest\u00fctz", "muskelgruppen": ["Brust", "Trizeps"], "schwierigkeit": "Anf\u00e4nger" },
        { "name": "Kniebeuge", "muskelgruppen": ["Beine", "Ges\u00e4\u00df"], "schwierigkeit": "Anf\u00e4nger" }
      ]
    };
  }
}
