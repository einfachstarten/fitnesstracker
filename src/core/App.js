// VERSION IDENTIFIER - MUST BE FIRST LINE
console.log('📦 App.js DEPLOYED - Version: 2024-07-11-18:15');

import { EventBus } from './EventBus.js';
import { WorkoutPlanGenerator } from '../services/WorkoutPlanGenerator.js';
import { WeeklyDataManager } from '../services/WeeklyDataManager.js';
import { OverviewView } from '../components/Overview/OverviewView.js';
import { WorkoutView } from '../components/WorkoutView/WorkoutView.js';
import { CalendarView } from '../components/CalendarView/CalendarView.js';

// Global state object
window.appState = {
  currentView: 'setup',
  currentStep: 1,
  totalSteps: 7,
  isTransitioning: false,
  userData: {
    name: '',
    age: null,
    goals: [],
    experience: '',
    equipment: [],
    focus: [],
    frequency: '',
    duration: ''
  },
  currentPlan: null,
  selectedDay: null,
  selectedDate: null,
  showDayModal: false,
  completedExercises: {},
  completedDays: {},
  expandedExercises: {}
};

// State update function
window.updateAppState = function(changes, skipRender = false) {
  console.log('🔄 Updating state:', changes);
  Object.assign(window.appState, changes);
  localStorage.setItem('fitness_app_state', JSON.stringify(window.appState));
  if (!skipRender && window.app) {
    window.app.render();
  }
  console.log('✅ New state:', window.appState);
};

// State getter
window.getAppState = function() {
  return window.appState;
};

// Array toggle helper
window.toggleArrayItem = function(arrayPath, item) {
  const pathParts = arrayPath.split('.');
  let current = window.appState;
  for (let i = 0; i < pathParts.length - 1; i++) {
    if (!current[pathParts[i]]) current[pathParts[i]] = {};
    current = current[pathParts[i]];
  }
  const arrayKey = pathParts[pathParts.length - 1];
  if (!Array.isArray(current[arrayKey])) {
    current[arrayKey] = [];
  }
  const array = current[arrayKey];
  const index = array.indexOf(item);
  if (index > -1) {
    array.splice(index, 1);
  } else {
    array.push(item);
  }
  window.updateAppState({});
};

// State initialization
window.initializeAppState = function() {
  const saved = localStorage.getItem('fitness_app_state');
  if (saved) {
    try {
      window.appState = JSON.parse(saved);
      console.log('📄 Loaded state from localStorage');
      return;
    } catch (e) {
      console.warn('❌ Failed to parse saved state, using defaults');
    }
  }
  console.log('🆕 Using default state');
};

export class App {
  constructor() {
    console.log('🚀 App constructor STARTED - Version: 2024-07-11-18:15');
    window.initializeAppState();
    window.app = this;
    this.eventBus = new EventBus();
    this.exerciseDatabase = null;
    this.planGenerator = null;
    this.weeklyDataManager = new WeeklyDataManager();
    this.init().catch(error => {
      console.error('💥 Init failed:', error);
      this.showError('Init failed: ' + error.message);
    });
  }

  async init() {
    console.log('🔄 INIT started');
    this.exerciseDatabase = await this.loadExerciseDatabase();
    console.log('✅ Exercise database loaded');
    this.planGenerator = new WorkoutPlanGenerator(this.exerciseDatabase);
    console.log('✅ Plan generator created');
    this.setupEventHandlers();
    console.log('✅ Event handlers setup');
    this.checkExistingData();
    console.log('✅ Data checked, currentView:', window.appState.currentView);
    this.render();
    console.log('✅ Initial render completed');
  }

  checkExistingData() {
    const state = window.appState;
    if (state.userData && state.userData.name && state.currentPlan) {
      window.updateAppState({ currentView: 'overview' }, true);
    } else {
      window.updateAppState({ currentView: 'setup' }, true);
    }
  }

  setupEventHandlers() {
    // No more EventBus - direct function calls
  }

  render() {
    console.log('🎨 Rendering view:', window.appState.currentView);
    const container = document.getElementById('app');
    container.innerHTML = '';
    switch (window.appState.currentView) {
      case 'setup':
        this.renderSetupWizard(container);
        break;
      case 'overview':
        this.renderOverview(container);
        break;
      case 'workout':
        this.renderWorkout(container);
        break;
      case 'calendar':
        this.renderCalendar(container);
        break;
      default:
        container.innerHTML = '<div>Unknown view</div>';
    }
  }

  renderSetupWizard(container) {
    container.innerHTML = this.generateSetupWizardHTML();
  }

  generateSetupWizardHTML() {
    const state = window.appState;
    const progressPercentage = (state.currentStep / state.totalSteps) * 100;
    return `
      <div class="wizard">
        <div class="wizard__header">
          <h1 class="wizard__title">🔮 Trainingsplan-Assistent</h1>
          <p class="wizard__subtitle">Schritt ${state.currentStep} von ${state.totalSteps}</p>
          <div class="wizard__progress">
            <div class="wizard__progress-fill" style="width: ${progressPercentage}%"></div>
          </div>
        </div>
        <div class="wizard__content">
          ${this.generateStepHTML()}
        </div>
        <div class="wizard__navigation">
          ${this.generateNavigationHTML()}
        </div>
      </div>
    `;
  }

  generateStepHTML() {
    const state = window.appState;
    switch (state.currentStep) {
      case 1: return this.generateStep1HTML();
      case 2: return this.generateStep2HTML();
      case 3: return this.generateStep3HTML();
      case 4: return this.generateStep4HTML();
      case 5: return this.generateStep5HTML();
      case 6: return this.generateStep6HTML();
      case 7: return this.generateStep7HTML();
      default: return '<div>Step not implemented</div>';
    }
  }

  generateStep1HTML() {
    const userData = window.appState.userData;
    return `
      <div class="step">
        <div class="step__emoji">🏋️‍♀️</div>
        <h2 class="step__title">Willkommen!</h2>
        <p class="step__text">Ich erstelle dir einen personalisierten Trainingsplan.</p>
        <div class="form-group">
          <label class="form-label">Wie heißt du?</label>
          <input type="text" class="form-input" placeholder="Dein Name" 
                 value="${userData.name || ''}"
                 oninput="window.updateAppState({userData: {...window.appState.userData, name: this.value}})">
        </div>
        <div class="form-group">
          <label class="form-label">Alter (optional)</label>
          <input type="number" class="form-input" placeholder="Dein Alter" 
                 value="${userData.age || ''}"
                 oninput="window.updateAppState({userData: {...window.appState.userData, age: parseInt(this.value) || null}})">
        </div>
      </div>
    `;
  }

  generateStep2HTML() {
    const goals = window.appState.userData.goals || [];
    const goalOptions = [
      { id: 'Muskelaufbau', icon: '💪', title: 'Muskelaufbau' },
      { id: 'Kraft', icon: '🏋️', title: 'Kraft steigern' },
      { id: 'Ausdauer', icon: '🏃', title: 'Ausdauer' },
      { id: 'Gesundheit', icon: '❤️', title: 'Gesundheit' }
    ];

    return `
      <div class="step">
        <div class="step__emoji">🎯</div>
        <h2 class="step__title">Was ist dein Hauptziel?</h2>
        <p class="step__text">Du kannst mehrere Ziele auswählen</p>
        ${goalOptions.map(goal => `
          <button class="goal-button ${goals.includes(goal.id) ? 'goal-button--selected' : ''}"
                  onclick="window.toggleArrayItem('userData.goals', '${goal.id}')">
            ${goal.icon} ${goal.title}
          </button>
        `).join('')}
      </div>
    `;
  }

  generateStep3HTML() {
    const experience = window.appState.userData.experience;
    const levels = ['Anfänger', 'Fortgeschritten', 'Profi'];
    return `
      <div class="step">
        <div class="step__emoji">💪</div>
        <h2 class="step__title">Deine Erfahrung?</h2>
        ${levels.map(level => `
          <button class="goal-button ${experience === level ? 'goal-button--selected' : ''}"
                  onclick="window.updateAppState({userData: {...window.appState.userData, experience: '${level}'}})">
            ${level}
          </button>
        `).join('')}
      </div>
    `;
  }

  generateStep4HTML() {
    const equipment = window.appState.userData.equipment || [];
    const equipmentOptions = ['Eigengewicht', 'Kurzhanteln', 'Langhanteln', 'Gym-Geräte'];
    return `
      <div class="step">
        <div class="step__emoji">🏋️</div>
        <h2 class="step__title">Welche Ausrüstung hast du?</h2>
        ${equipmentOptions.map(eq => `
          <button class="goal-button ${equipment.includes(eq) ? 'goal-button--selected' : ''}"
                  onclick="window.toggleArrayItem('userData.equipment', '${eq}')">
            ${eq}
          </button>
        `).join('')}
      </div>
    `;
  }

  generateStep5HTML() {
    const focus = window.appState.userData.focus || [];
    const focusOptions = ['Ganzkörper', 'Oberkörper', 'Unterkörper', 'Core'];
    return `
      <div class="step">
        <div class="step__emoji">🎯</div>
        <h2 class="step__title">Worauf willst du fokussieren?</h2>
        ${focusOptions.map(f => `
          <button class="goal-button ${focus.includes(f) ? 'goal-button--selected' : ''}"
                  onclick="window.toggleArrayItem('userData.focus', '${f}')">
            ${f}
          </button>
        `).join('')}
      </div>
    `;
  }

  generateStep6HTML() {
    const userData = window.appState.userData;
    return `
      <div class="step">
        <div class="step__emoji">📅</div>
        <h2 class="step__title">Dein Zeitplan</h2>
        <div class="form-group">
          <label class="form-label">Häufigkeit (Tage/Woche)</label>
          <input type="number" min="1" max="7" class="form-input"
                 value="${userData.frequency || ''}"
                 oninput="window.updateAppState({userData: {...window.appState.userData, frequency: this.value}})">
        </div>
        <div class="form-group">
          <label class="form-label">Dauer pro Einheit</label>
          <select class="form-input" onchange="window.updateAppState({userData: {...window.appState.userData, duration: this.value}})">
            <option value="">Wählen...</option>
            <option value="30min" ${userData.duration === '30min' ? 'selected' : ''}>30 Minuten</option>
            <option value="45min" ${userData.duration === '45min' ? 'selected' : ''}>45 Minuten</option>
            <option value="60min" ${userData.duration === '60min' ? 'selected' : ''}>60 Minuten</option>
            <option value="90min" ${userData.duration === '90min' ? 'selected' : ''}>90 Minuten</option>
          </select>
        </div>
      </div>
    `;
  }

  generateStep7HTML() {
    const userData = window.appState.userData;
    return `
      <div class="step">
        <div class="step__emoji">📋</div>
        <h2 class="step__title">Zusammenfassung</h2>
        <div class="summary">
          <p><strong>Name:</strong> ${userData.name}</p>
          <p><strong>Ziele:</strong> ${(userData.goals || []).join(', ')}</p>
          <p><strong>Erfahrung:</strong> ${userData.experience}</p>
          <p><strong>Equipment:</strong> ${(userData.equipment || []).join(', ')}</p>
          <p><strong>Fokus:</strong> ${(userData.focus || []).join(', ')}</p>
          <p><strong>Training:</strong> ${userData.frequency}x/Woche, ${userData.duration}</p>
        </div>
      </div>
    `;
  }

  generateNavigationHTML() {
    const state = window.appState;
    const isFirstStep = state.currentStep === 1;
    const isLastStep = state.currentStep === state.totalSteps;
    const canProceed = this.validateCurrentStep();
    let html = '';
    if (!isFirstStep) {
      html += `<button class="btn btn--secondary" onclick="window.app.previousStep()">← Zurück</button>`;
    }
    const buttonClass = canProceed ? 'btn--primary' : 'btn--disabled';
    const buttonText = isLastStep ? '🎉 Plan erstellen!' : 'Weiter →';
    const clickHandler = isLastStep ? 'window.app.completeSetup()' : 'window.app.nextStep()';
    html += `<button class="btn ${buttonClass}" ${!canProceed ? 'disabled' : ''} 
                     onclick="${clickHandler}">${buttonText}</button>`;
    return html;
  }

  validateCurrentStep() {
    const userData = window.appState.userData;
    const validators = {
      1: () => !!userData.name,
      2: () => (userData.goals || []).length > 0,
      3: () => !!userData.experience,
      4: () => (userData.equipment || []).length > 0,
      5: () => (userData.focus || []).length > 0,
      6: () => !!userData.frequency && !!userData.duration,
      7: () => true
    };
    return validators[window.appState.currentStep]?.() || false;
  }

  nextStep() {
    if (!this.validateCurrentStep()) return;
    window.updateAppState({
      currentStep: window.appState.currentStep + 1
    });
  }

  previousStep() {
    if (window.appState.currentStep > 1) {
      window.updateAppState({
        currentStep: window.appState.currentStep - 1
      });
    }
  }

  completeSetup() {
    const userData = window.appState.userData;
    const currentPlan = this.planGenerator.generatePlan(userData);
    window.updateAppState({
      currentPlan: currentPlan,
      currentView: 'overview'
    });
  }

  async loadExerciseDatabase() {
    try {
      const response = await fetch('./exercises.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('Using fallback exercises');
      return this.getFallbackExercises();
    }
  }

  renderOverview(container) {
    const view = new OverviewView({
      eventBus: this.eventBus,
      userData: window.appState.userData,
      currentPlan: window.appState.currentPlan,
      weeklyDataManager: this.weeklyDataManager
    });
    view.mount(container);
  }

  renderWorkout(container) {
    const view = new WorkoutView({
      eventBus: this.eventBus,
      currentPlan: window.appState.currentPlan,
      weeklyDataManager: this.weeklyDataManager
    });
    view.mount(container);
  }

  renderCalendar(container) {
    const view = new CalendarView({});
    view.mount(container);
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
