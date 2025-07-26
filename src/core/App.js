// VERSION IDENTIFIER - MUST BE FIRST LINE
console.log('📦 App.js DEPLOYED - Version: 2025-07-14-00:00');

import { EventBus } from './EventBus.js';
import { WorkoutPlanGenerator } from '../services/WorkoutPlanGenerator.js';
import { WeeklyDataManager } from '../services/WeeklyDataManager.js';
import { WeeklyTracker } from '../services/WeeklyTracker.js';
import { CalendarView } from '../components/CalendarView/CalendarView.js';
import { ExerciseDetailProvider } from '../services/ExerciseDetailProvider.js';
import { getStartOfWeek } from '../utils/DateUtils.js';

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
  trainingPool: null,
  selectedDay: null,
  selectedTraining: null,
  selectedDate: null,
  showDayModal: false,
  completedExercises: {},
  completedDays: {},
  expandedExercises: {},
  workoutState: null
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

// Input-specific updater to avoid full re-render
window.updateInputField = function(field, value) {
  console.log('🔄 Input update:', field, value);
  if (field === 'name') {
    window.appState.userData.name = value;
  } else if (field === 'age') {
    window.appState.userData.age = parseInt(value) || null;
  }
  localStorage.setItem('fitness_app_state', JSON.stringify(window.appState));
  window.updateNavigationButtons();
  console.log('✅ Input updated, no re-render');
};

// Update only the navigation button state
window.updateNavigationButtons = function() {
  const canProceed = window.app.validateCurrentStep();
  const button = document.querySelector('.btn--primary, .btn--disabled');
  if (button) {
    button.disabled = !canProceed;
    button.className = `btn ${canProceed ? 'btn--primary' : 'btn--disabled'}`;
  }
};

// Start workout for a given day
window.startWorkout = function(dayName) {
  window.updateAppState({ currentView: 'workout', selectedDay: dayName });
};

window.startPoolTraining = function(trainingId) {
  const pool = window.appState.trainingPool;
  const training = pool?.available_trainings.find(t => t.id === trainingId);
  if (training) {
    const exercisesState = {};
    training.exercises.forEach((ex, idx) => {
      const key = ex.id || `ex${idx}`;
      exercisesState[key] = { completed: false, expanded: false };
    });
    window.updateAppState({
      currentView: 'workout',
      selectedTraining: training,
      workoutState: {
        trainingId: training.id,
        exercises: exercisesState,
        start_time: Date.now(),
        completed_exercises: 0,
        total_exercises: training.exercises.length
      }
    });
  }
};

window.finishTraining = function(trainingId) {
  const pool = window.appState.trainingPool;
  if (!pool) return;
  const training = pool.available_trainings.find(t => t.id === trainingId);
  if (training && !training.completed) {
    training.completed = true;
    training.completed_date = new Date().toISOString().split('T')[0];
    pool.completed_workouts++;
    pool.available_trainings = pool.available_trainings.filter(t => !t.completed);
  }
  window.updateAppState({ currentView: 'overview', trainingPool: pool, selectedTraining: null, workoutState: null });
};

window.toggleExercise = function(exId) {
  const ws = window.appState.workoutState;
  if (!ws) return;
  const current = ws.exercises[exId].expanded;
  Object.keys(ws.exercises).forEach(id => (ws.exercises[id].expanded = false));
  ws.exercises[exId].expanded = !current;
  window.updateAppState({ workoutState: ws }, true);
  window.app.render();
};

window.completeExercise = function(exId, checked) {
  const ws = window.appState.workoutState;
  if (!ws) return;
  ws.exercises[exId].completed = checked;
  ws.completed_exercises = Object.values(ws.exercises).filter(e => e.completed).length;
  window.updateAppState({ workoutState: ws }, true);
  window.app.render();
  if (ws.completed_exercises === ws.total_exercises) {
    // simple celebration effect could be added here
  }
};

function renderExerciseAccordion(exercise, expanded, completed, provider) {
  const details = provider.getExerciseDetails(exercise.id);
  if (!details) return '';
  return `
    <div class="exercise-item ${completed ? 'completed' : ''}">
      <div class="exercise-header" onclick="toggleExercise('${exercise.id}')">
        <div class="exercise-checkbox">
          <input type="checkbox" ${completed ? 'checked' : ''} onchange="completeExercise('${exercise.id}', this.checked)">
          <span class="checkmark"></span>
        </div>
        <div class="exercise-main">
          <h4 class="exercise-name">${details.name}</h4>
          <span class="exercise-reps">${details.reps || ''}</span>
        </div>
        <div class="exercise-toggle">
          <span class="toggle-icon ${expanded ? 'expanded' : ''}">▼</span>
        </div>
      </div>
      ${expanded ? `
      <div class="exercise-details expanded">
        <div class="exercise-description">
          <p class="description-text">${details.description || ''}</p>
          <div class="exercise-instructions">
            <h5>📋 Ausführung:</h5>
            <ol class="instruction-list">
              ${(details.instructions || []).map(i => `<li>${i}</li>`).join('')}
            </ol>
          </div>
          <div class="exercise-tips">
            <h5>💡 Tipps:</h5>
            <ul class="tips-list">
              ${(details.tips || []).map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
          <div class="exercise-muscles">
            <h5>🎯 Zielmuskeln:</h5>
            <div class="muscle-tags">
              ${(details.muscleGroups || []).map(m => `<span class="muscle-tag">${m}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>` : ''}
    </div>`;
}

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
    this.forceCacheRefresh();
    window.initializeAppState();
    window.app = this;
    this.eventBus = new EventBus();
    this.planGenerator = null;
    this.weeklyDataManager = new WeeklyDataManager();
    this.weeklyTracker = new WeeklyTracker(this.weeklyDataManager);
    this.init().catch(error => {
      console.error('💥 Init failed:', error);
      this.showError('Init failed: ' + error.message);
    });
  }

  async init() {
    console.log('🔄 INIT started');
    this.planGenerator = new WorkoutPlanGenerator();
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
    if (state.userData && state.userData.name && state.trainingPool) {
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
                 oninput="window.updateInputField('name', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Alter (optional)</label>
          <input type="number" class="form-input" placeholder="Dein Alter"
                 value="${userData.age || ''}"
                 oninput="window.updateInputField('age', this.value)">
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
    const equipmentOptions = [
      { id: 'Eigengewicht', icon: '🤸‍♂️', title: 'Bodyweight' },
      { id: 'Kurzhanteln', icon: '🏋️‍♂️', title: 'Dumbbells' },
      { id: 'Langhantel', icon: '🏋️‍♀️', title: 'Barbell' },
      { id: 'Kettlebell', icon: '⚫', title: 'Kettlebell' },
      { id: 'Widerstandsbänder', icon: '🟠', title: 'Resistance Bands' },
      { id: 'Schlingentrainer', icon: '🔗', title: 'TRX' },
      { id: 'Trainingsmatte', icon: '🟫', title: 'Exercise Mat' },
      { id: 'Gewichtsscheiben', icon: '⚪', title: 'Weight Plates' },
      { id: 'Klimmzugstange', icon: '🚪', title: 'Pull-up Bar' },
      { id: 'Medizinball', icon: '⚽', title: 'Medicine Ball' },
      { id: 'Gymnastikball', icon: '🔵', title: 'Exercise Ball' },
      { id: 'Springseil', icon: '➰', title: 'Jump Rope' },
      { id: 'Resistance Loops', icon: '🟡', title: 'Mini Bands' },
      { id: 'Liegestützgriffe', icon: '📐', title: 'Push-up Handles' },
      { id: 'Ab Wheel', icon: '🛞', title: 'Ab Roller' }
    ];

    console.log('\uD83D\uDD27 Equipment step - rendering', equipmentOptions.length, 'options');

    return `
      <div class="step">
        <div class="step__emoji">🏋️</div>
        <h2 class="step__title">Welche Ausrüstung hast du?</h2>
        <div class="equipment-grid">
          ${equipmentOptions.map(eq => `
            <div class="equipment-card ${equipment.includes(eq.id) ? 'selected' : ''}" onclick="window.toggleArrayItem('userData.equipment', '${eq.id}')">
              <div class="equipment-icon">${eq.icon}</div>
              <div class="equipment-name">${eq.title}</div>
            </div>
          `).join('')}
        </div>
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

  async completeSetup() {
    const userData = window.appState.userData;
    const trainings = await this.planGenerator.generateTrainingPool(userData);
    const pool = {
      week_start: getStartOfWeek(new Date()),
      total_workouts: trainings.length,
      completed_workouts: 0,
      available_trainings: trainings
    };
    window.updateAppState({
      trainingPool: pool,
      currentView: 'overview'
    });
  }



  async renderOverview(container) {
    const state = window.appState;
    let pool = state.trainingPool;
    if (!pool) {
      const trainings = await this.planGenerator.generateTrainingPool(state.userData);
      pool = {
        week_start: getStartOfWeek(new Date()),
        total_workouts: trainings.length,
        completed_workouts: 0,
        available_trainings: trainings
      };
      window.updateAppState({ trainingPool: pool }, true);
    } else if (pool.week_start !== getStartOfWeek(new Date())) {
      const trainings = await this.planGenerator.generateTrainingPool(state.userData);
      pool = {
        week_start: getStartOfWeek(new Date()),
        total_workouts: trainings.length,
        completed_workouts: 0,
        available_trainings: trainings
      };
      window.updateAppState({ trainingPool: pool }, true);
    }

    const progress = Math.round((pool.completed_workouts / pool.total_workouts) * 100);
    container.innerHTML = `
      <div class="training-pool-container">
        <div class="pool-header">
          <h2>Deine Trainings diese Woche</h2>
          <div class="week-progress">
            <span class="progress-text">${pool.completed_workouts} von ${pool.total_workouts} Trainings</span>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
          </div>
        </div>
        <div class="training-grid">
          ${pool.available_trainings.map(t => `
            <div class="training-card theme-${t.type} ${t.completed ? 'completed' : 'available'}" onclick="${t.completed ? '' : `startPoolTraining('${t.id}')`}">
              <div class="card-icon">${t.icon}</div>
              <h3 class="card-title">${t.title}</h3>
              <div class="card-exercises">
                ${t.exercises.slice(0,3).map(ex => `<span>${ex.name || ex}</span>`).join('')}
              </div>
              <div class="card-footer">
                <span class="duration">${t.duration}</span>
                <button class="card-button ${t.completed ? 'completed' : 'start'}">
                  ${t.completed ? '✓ ERLEDIGT' : '▶ STARTEN'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
        <button class="reset-pool" style="display:none" onclick="window.app.resetTrainingPool()">Reset Pool</button>
      </div>`;
  }

  generatePlanCards(plan) {
    if (!plan) return '<p class="no-plan">Kein Plan verfügbar</p>';
    return Object.entries(plan).map(([dayName, dayData]) => `
      <div class="plan-card">
        <div class="plan-card-header">
          <h3 class="plan-card-title">${dayName}</h3>
          <span class="plan-card-subtitle">${dayData.title}</span>
        </div>
        <div class="plan-card-exercises">
          ${(dayData.exercises || []).slice(0, 3).map(ex => `
            <div class="exercise-preview">
              <span class="exercise-name">${ex.name || ex}</span>
              <span class="exercise-sets">${ex.sets || '3x8-12'}</span>
            </div>
          `).join('')}
          ${(dayData.exercises || []).length > 3 ?
            `<div class="exercise-more">+${(dayData.exercises || []).length - 3} weitere</div>` :
            ''}
        </div>
        <button class="plan-card-button" onclick="window.startWorkout('${dayName}')">
          Starten
        </button>
      </div>
    `).join('');
  }

  renderWorkout(container) {
    const training = window.appState.selectedTraining;
    const ws = window.appState.workoutState;
    if (!training || !ws) {
      container.innerHTML = '<div class="p-4">Kein Training gefunden.</div>';
      return;
    }
    const progress = Math.round((ws.completed_exercises / ws.total_exercises) * 100);
    const provider = new ExerciseDetailProvider(this.planGenerator.exerciseManager, training.difficulty);
    const items = training.exercises
      .map((ex, idx) => {
        const key = ex.id || `ex${idx}`;
        const st = ws.exercises[key];
        const exWithId = { ...ex, id: key };
        return renderExerciseAccordion(exWithId, st.expanded, st.completed, provider);
      })
      .join('');

    container.innerHTML = `
      <div class="workout">
        <h2>${training.title}</h2>
        <div class="workout-progress">
          <div class="progress-header">
            <h3>Trainingsfortschritt</h3>
            <span class="progress-text">${ws.completed_exercises}/${ws.total_exercises} Übungen</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div>
        </div>
        <div class="exercise-list">${items}</div>
        <button onclick="finishTraining('${training.id}')" class="plan-card-button" ${ws.completed_exercises === ws.total_exercises ? '' : 'disabled'}>Training abschließen</button>
      </div>`;
  }

  renderCalendar(container) {
    const view = new CalendarView({ weeklyDataManager: this.weeklyDataManager });
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



  /* ------------------------------------------------------------------
   *  Weekly System Helpers
   * ------------------------------------------------------------------ */

  initializeWeeklySystem() {
    const currentWeek = this.getISOWeek(new Date());
    const weeklyData = {
      weeklyGoal: parseInt(window.appState.userData.frequency),
      currentWeek: currentWeek,
      weeks: {}
    };

    weeklyData.weeks[currentWeek] = {
      startDate: this.getWeekBounds(currentWeek).start.toISOString().split('T')[0],
      endDate: this.getWeekBounds(currentWeek).end.toISOString().split('T')[0],
      target: parseInt(window.appState.userData.frequency),
      completed: 0,
      workouts: [],
      isWeekCompleted: false
    };

    window.updateAppState({ weeklyData }, true);
    this.saveToLocalStorage();
  }

  getISOWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    const week = 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
  }

  getWeekBounds(weekString) {
    const [year, week] = weekString.split('-W').map(Number);
    const jan4 = new Date(year, 0, 4);
    const weekStart = new Date(jan4.getTime() + (week - 1) * 7 * 86400000);
    weekStart.setDate(weekStart.getDate() - (jan4.getDay() + 6) % 7);
    return {
      start: weekStart,
      end: new Date(weekStart.getTime() + 6 * 86400000)
    };
  }

  getWeekDates(weekBounds) {
    const dates = [];
    for (let d = new Date(weekBounds.start); d <= weekBounds.end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    return dates;
  }

  initializeWeek(weekString) {
    const bounds = this.getWeekBounds(weekString);
    window.appState.weeklyData.weeks[weekString] = {
      startDate: bounds.start.toISOString().split('T')[0],
      endDate: bounds.end.toISOString().split('T')[0],
      target: parseInt(window.appState.userData.frequency),
      completed: 0,
      workouts: [],
      isWeekCompleted: false
    };
  }

  previousWeek() {
    const current = window.appState.weeklyData.currentWeek;
    const [year, week] = current.split('-W').map(Number);
    const newWeek = week === 1 ? `${year-1}-W52` : `${year}-W${String(week-1).padStart(2,'0')}`;

    if (!window.appState.weeklyData.weeks[newWeek]) {
      this.initializeWeek(newWeek);
    }

    window.updateAppState({
      weeklyData: {
        ...window.appState.weeklyData,
        currentWeek: newWeek
      }
    });
    this.render();
  }

  nextWeek() {
    const current = window.appState.weeklyData.currentWeek;
    const [year, week] = current.split('-W').map(Number);
    const newWeek = week === 52 ? `${year+1}-W01` : `${year}-W${String(week+1).padStart(2,'0')}`;

    if (!window.appState.weeklyData.weeks[newWeek]) {
      this.initializeWeek(newWeek);
    }

    window.updateAppState({
      weeklyData: {
        ...window.appState.weeklyData,
        currentWeek: newWeek
      }
    });
    this.render();
  }

  selectDay(dateStr) {
    const workout = this.getWorkoutForDate(dateStr, window.appState.currentPlan);
    if (workout) {
      this.showDayModal(dateStr, workout);
    } else {
      this.showAddWorkoutModal(dateStr);
    }
  }

  showDayModal(dateStr, workout) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">${new Date(dateStr).toLocaleDateString('de-DE', {weekday: 'long', day: 'numeric', month: 'long'})}</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>

        <div class="modal-body">
          <div class="workout-details">
            <h4 class="workout-title">${workout.title}</h4>
            <div class="exercises-list">
              ${workout.exercises.map(ex => `
                <div class="exercise-item">
                  <div class="exercise-name">${ex.name}</div>
                  <div class="exercise-sets">${ex.sets || '3x12'}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" onclick="this.closest('.modal-overlay').remove()">
            Schließen
          </button>
          <button class="btn-primary" onclick="window.startWorkout('${dateStr}')">
            Training starten
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  showAddWorkoutModal(dateStr) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">${new Date(dateStr).toLocaleDateString('de-DE', {weekday: 'long', day: 'numeric', month: 'long'})}</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        <div class="modal-body">
          <p class="text-center">Noch kein Training geplant.</p>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" onclick="this.closest('.modal-overlay').remove()">Schließen</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  startTodayWorkout() {
    const pool = window.appState.trainingPool;
    const next = pool?.available_trainings[0];
    if (next) {
      window.startPoolTraining(next.id);
    }
  }

  showPlanOverview() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">📋 Dein Trainingsplan</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        <div class="modal-body">
          ${this.renderPlanOverview()}
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  editPlan() {
    window.updateAppState({ currentView: 'setup', currentStep: 1 });
    this.render();
  }

  async resetTrainingPool() {
    const trainings = await this.planGenerator.generateTrainingPool(window.appState.userData);
    const pool = {
      week_start: getStartOfWeek(new Date()),
      total_workouts: trainings.length,
      completed_workouts: 0,
      available_trainings: trainings
    };
    window.updateAppState({ trainingPool: pool });
    this.render();
  }

  renderPlanOverview() {
    const plan = window.appState.currentPlan;
    return Object.entries(plan).map(([day, data]) => `
      <div class="plan-day">
        <h4 class="plan-day-title">${day}</h4>
        <div class="plan-exercises">
          ${data.exercises.slice(0, 3).map(ex => `
            <div class="plan-exercise">${ex.name}</div>
          `).join('')}
          ${data.exercises.length > 3 ? `<div class="plan-more">+${data.exercises.length - 3} weitere</div>` : ''}
        </div>
      </div>
    `).join('');
  }

  /* ------------------------------------------------------------------
   *  Rendering Helpers
   * ------------------------------------------------------------------ */

  renderMainHeader(userData, weekData, weekProgress) {
    return `
      <div class="main-header">
        <div class="header-gradient">
          <div class="header-content">
            <div class="user-greeting">
              <h1 class="greeting-text">Hi ${userData.name}! 👋</h1>
              <p class="greeting-subtitle">Dein personalisierter Trainingsplan ist bereit</p>
            </div>

            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number">${weekData.target}</div>
                <div class="stat-label">Tage/Woche</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${userData.duration}</div>
                <div class="stat-label">pro Einheit</div>
              </div>
              <div class="stat-card progress-card">
                <div class="progress-circle" style="--progress:${weekProgress * 3.6}deg">
                  <div class="progress-text">${weekProgress}%</div>
                </div>
                <div class="stat-label">Woche ${window.appState.weeklyData.currentWeek.split('-W')[1]}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderWeeklyCalendar(currentWeek, weekData, plan) {
    const weekBounds = this.getWeekBounds(currentWeek);
    const dates = this.getWeekDates(weekBounds);

    return `
      <div class="calendar-section">
        <div class="week-navigation">
          <button class="nav-btn" onclick="window.app.previousWeek()">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
          </button>

          <div class="week-info">
            <div class="week-dates">${this.formatWeekRange(weekBounds)}</div>
            <div class="week-label">Kalenderwoche ${currentWeek.split('-W')[1]}</div>
          </div>

          <button class="nav-btn" onclick="window.app.nextWeek()">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        <div class="calendar-grid">
          ${dates.map(date => this.renderCalendarDay(date, plan, weekData)).join('')}
        </div>

        <div class="week-summary">
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${(weekData.completed/weekData.target)*100}%"></div>
          </div>
          <div class="summary-text">
            ${weekData.completed} von ${weekData.target} Trainings abgeschlossen
          </div>
        </div>
      </div>
    `;
  }

  renderCalendarDay(date, plan, weekData) {
    const dateStr = date.toISOString().split('T')[0];
    const isToday = dateStr === new Date().toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('de-DE', { weekday: 'short' });
    const dayNumber = date.getDate();

    const workout = this.getWorkoutForDate(dateStr, plan);
    const isCompleted = this.isWorkoutCompleted(dateStr, weekData);
    const isScheduled = !!workout;

    let statusClass = '';
    let statusContent = '';

    if (isToday) statusClass += ' today';
    if (isCompleted) {
      statusClass += ' completed';
      statusContent = '<div class="status-check completed-check">✓</div>';
    } else if (isScheduled) {
      statusClass += ' scheduled';
      statusContent = '<div class="status-dot"></div>';
    } else {
      statusContent = '<div class="empty-slot">+</div>';
    }

    return `
      <div class="calendar-day${statusClass}" onclick="window.app.selectDay('${dateStr}')">
        <div class="day-header">
          <div class="day-name">${dayName}</div>
          <div class="day-number">${dayNumber}</div>
        </div>

        <div class="day-content">
          ${workout ? `
            <div class="workout-preview">
              <div class="workout-title">${workout.title}</div>
              <div class="exercise-count">${workout.exercises.length} Übungen</div>
            </div>
          ` : ''}
        </div>

        <div class="day-status">
          ${statusContent}
        </div>

        ${isToday ? '<div class="today-pulse"></div>' : ''}
      </div>
    `;
  }

  renderQuickActions() {
    return `
      <div class="quick-actions">
        <button class="action-btn primary" onclick="window.app.startTodayWorkout()">
          <div class="btn-icon">🏋️</div>
          <div class="btn-text">Heute trainieren</div>
        </button>

        <button class="action-btn secondary" onclick="window.app.showPlanOverview()">
          <div class="btn-icon">📋</div>
          <div class="btn-text">Plan ansehen</div>
        </button>

        <button class="action-btn secondary" onclick="window.app.editPlan()">
          <div class="btn-icon">⚙️</div>
          <div class="btn-text">Plan anpassen</div>
        </button>
      </div>
    `;
  }

  formatWeekRange(bounds) {
    const start = bounds.start;
    const end = bounds.end;
    return `${start.getDate()}.${start.getMonth()+1} - ${end.getDate()}.${end.getMonth()+1}`;
  }

  getWorkoutForDate(dateStr, plan) {
    if (!plan) return null;
    return Object.values(plan).find(day => day.date === dateStr || day.day === dateStr);
  }

  isWorkoutCompleted(dateStr, weekData) {
    return weekData.workouts.some(w => w.date === dateStr && w.isCompleted);
  }

  forceCacheRefresh() {
    if ('serviceWorker' in navigator && 'caches' in window) {
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.startsWith('fitness-tracker-v')) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      });
    }
  }

  saveToLocalStorage() {
    localStorage.setItem('fitness_app_state', JSON.stringify(window.appState));
  }
}
