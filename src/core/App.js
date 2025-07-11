// VERSION IDENTIFIER - MUST BE FIRST LINE
console.log('📦 App.js DEPLOYED - Version: 2024-07-11-18:15');

import { EventBus } from './EventBus.js';
import { WorkoutPlanGenerator } from '../services/WorkoutPlanGenerator.js';
import { WeeklyDataManager } from '../services/WeeklyDataManager.js';
import { SetupWizard } from '../components/SetupWizard/SetupWizard.js';
import { OverviewView } from '../components/Overview/OverviewView.js';
import { WorkoutView } from '../components/WorkoutView/WorkoutView.js';
import { CalendarView } from '../components/CalendarView/CalendarView.js';

export class App {
  constructor() {
    // MUST BE FIRST LINE IN CONSTRUCTOR
    console.log('🚀 App constructor STARTED - Version: 2024-07-11-18:15');
    
    console.log('1️⃣ Creating EventBus...');
    this.eventBus = new EventBus();
    
    console.log('2️⃣ Setting initial state...');
    this.currentView = 'setup';
    this.components = new Map();
    this.exerciseDatabase = null;
    this.planGenerator = null;
    this.userData = null;
    this.currentPlan = null;

    console.log('3️⃣ Creating WeeklyDataManager...');
    this.weeklyDataManager = new WeeklyDataManager();
    console.log('✅ WeeklyDataManager created successfully');

    console.log('4️⃣ Constructor complete, calling init()...');
    this.init().catch(error => {
      console.error('💥 Init failed:', error);
      this.showError('Init failed: ' + error.message);
    });
  }

  async init() {
    console.log('🔄 INIT started');
    try {
      console.log('📚 Loading exercise database...');
      await this.loadExerciseDatabase();
      console.log('✅ Exercise database loaded');
      
      console.log('📋 Creating plan generator...');
      this.planGenerator = new WorkoutPlanGenerator(this.exerciseDatabase);
      console.log('✅ Plan generator created');
      
      console.log('🎯 Setting up event handlers...');
      this.setupEventHandlers();
      console.log('✅ Event handlers setup');
      
      console.log('💾 Checking existing data...');
      this.checkExistingData();
      console.log('✅ Data checked, currentView:', this.currentView);
      
      console.log('🎨 Starting render...');
      this.render();
      console.log('✅ Render completed');
      
    } catch (error) {
      console.error('💥 App init failed:', error);
      this.showError('App init failed: ' + error.message + '\n\n' + error.stack);
    }
  }

  async loadExerciseDatabase() {
    try {
      const response = await fetch('./exercises.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.exerciseDatabase = await response.json();
    } catch (error) {
      console.warn('Using fallback exercises');
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
    console.log('🔄 Changing view to:', viewName);
    this.currentView = viewName;
    this.render();
  }

  render() {
    console.log('🎨 Rendering view:', this.currentView);
    const container = document.getElementById('app');
    // Clear previous content (e.g., initial loading screen)
    container.innerHTML = '';

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
      console.log('🎯 Mounting component:', this.currentView);
      viewComponent.mount(container);
    }
  }

  showError(message) {
    const container = document.getElementById('app');
    container.innerHTML = `
      <div class="p-8 text-center">
        <h2 class="text-xl font-bold text-red-600 mb-4">⚠️ Fehler</h2>
        <pre class="text-left bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">${message}</pre>
        <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Neu laden</button>
      </div>
    `;
  }

  getFallbackExercises() {
    return {
      "Eigengewicht": [
        { "name": "Liegestütz", "muskelgruppen": ["Brust", "Trizeps"], "schwierigkeit": "Anfänger" },
        { "name": "Kniebeuge", "muskelgruppen": ["Beine", "Gesäß"], "schwierigkeit": "Anfänger" }
      ]
    };
  }
}
