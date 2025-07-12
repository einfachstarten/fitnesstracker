export class SetupWizard {
  constructor(props = {}) {
    this.eventBus = props.eventBus;
    this.currentStep = 1;
    this.totalSteps = 7;
    this.userData = {
      name: '',
      age: null,
      goals: [],
      experience: '',
      equipment: [],
      focus: [],
      frequency: '',
      duration: ''
    };
  }

  mount(container) {
    this.container = container;
    window.wizard = this;
    this.render();
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = this.template();
  }

  template() {
    return `
      <div class="wizard">
        ${this.renderHeader()}
        <div class="wizard__content">${this.renderStepContent()}</div>
        ${this.renderNavigation()}
      </div>
    `;
  }

  renderHeader() {
    const progress = (this.currentStep / this.totalSteps) * 100;
    return `
      <div class="wizard__header">
        <h1 class="wizard__title">🔮 Trainingsplan-Assistent</h1>
        <p class="wizard__subtitle">Schritt ${this.currentStep} von ${this.totalSteps}</p>
        <div class="wizard__progress">
          <div class="wizard__progress-fill" style="width:${progress}%"></div>
        </div>
      </div>
    `;
  }

  renderStepContent() {
    switch (this.currentStep) {
      case 1: return this.stepWelcome();
      case 2: return this.stepGoals();
      case 3: return this.stepExperience();
      case 4: return this.stepEquipment();
      case 5: return this.stepFocus();
      case 6: return this.stepSchedule();
      case 7: return this.stepSummary();
      default: return '<div>Unbekannter Schritt</div>';
    }
  }

  stepWelcome() {
    return `
      <div class="step">
        <div class="step__emoji">🏋️‍♀️</div>
        <h2 class="step__title">Willkommen!</h2>
        <p class="step__text">Ich erstelle dir einen personalisierten Trainingsplan, der perfekt zu dir passt.</p>
        <div class="form-group">
          <label class="form-label">Wie heißt du?</label>
          <input type="text" value="${this.userData.name || ''}" placeholder="Dein Name"
                 oninput="wizard.updateUserData('name', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Wie alt bist du? (optional)</label>
          <input type="number" min="12" max="100" value="${this.userData.age ?? ''}" placeholder="Dein Alter"
                 oninput="wizard.updateUserData('age', this.value ? parseInt(this.value) : null)">
        </div>
      </div>
    `;
  }

  stepGoals() {
    const options = [
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
        <div class="goals">
          ${options.map(o => `<button class="goal-button ${this.userData.goals.includes(o.id) ? 'goal-button--selected' : ''}" onclick="wizard.toggleArrayItem('goals','${o.id}')">${o.icon} ${o.title}</button>`).join('')}
        </div>
      </div>
    `;
  }

  stepExperience() {
    const levels = ['Anfänger', 'Fortgeschritten', 'Profi'];
    return `
      <div class="step">
        <h2 class="step__title">Erfahrung</h2>
        <div class="experience-options">
          ${levels.map(l => `<button class="${this.userData.experience === l ? 'selected' : ''}" onclick="wizard.updateUserData('experience','${l}')">${l}</button>`).join('')}
        </div>
      </div>
    `;
  }

  stepEquipment() {
    const equipments = ['Eigengewicht', 'Kurzhanteln', 'Langhanteln', 'Gym-Geräte'];
    return `
      <div class="step">
        ${equipments.map(eq => `<button class="${this.userData.equipment.includes(eq) ? 'selected' : ''}" onclick="wizard.toggleArrayItem('equipment','${eq}')">${eq}</button>`).join('')}
      </div>
    `;
  }

  stepFocus() {
    const areas = ['Ganzkörper', 'Oberkörper', 'Unterkörper', 'Core'];
    return `
      <div class="step">
        ${areas.map(a => `<button class="${this.userData.focus.includes(a) ? 'selected' : ''}" onclick="wizard.toggleArrayItem('focus','${a}')">${a}</button>`).join('')}
      </div>
    `;
  }

  stepSchedule() {
    const freq = this.userData.frequency || '';
    const dur = this.userData.duration || '';
    return `
      <div class="step">
        <label>Häufigkeit (Tage/Woche)</label>
        <input type="number" min="1" max="7" value="${freq}" oninput="wizard.updateUserData('frequency', this.value)">
        <label>Dauer pro Einheit</label>
        <select oninput="wizard.updateUserData('duration', this.value)">
          <option value="30min" ${dur === '30min' ? 'selected' : ''}>30min</option>
          <option value="45min" ${dur === '45min' ? 'selected' : ''}>45min</option>
          <option value="60min" ${dur === '60min' ? 'selected' : ''}>60min</option>
          <option value="90min" ${dur === '90min' ? 'selected' : ''}>90min</option>
        </select>
      </div>
    `;
  }

  stepSummary() {
    const u = this.userData;
    return `
      <div class="step">
        <h2 class="step__title">Zusammenfassung</h2>
        <pre>${JSON.stringify(u, null, 2)}</pre>
      </div>
    `;
  }

  renderNavigation() {
    const isFirst = this.currentStep === 1;
    const isLast = this.currentStep === this.totalSteps;
    const canProceed = this.validateCurrentStep();
    return `
      <div class="wizard__navigation">
        ${!isFirst ? `<button class="btn btn--secondary" onclick="wizard.previousStep()">← Zurück</button>` : ''}
        <button class="btn ${canProceed ? 'btn--primary' : 'btn--disabled'}" ${!canProceed ? 'disabled' : ''}
          onclick="${isLast ? 'wizard.completeSetup()' : 'wizard.nextStep()'}">
          ${isLast ? '🎉 Plan erstellen!' : 'Weiter →'}
        </button>
      </div>
    `;
  }

  updateUserData(key, value) {
    this.userData[key] = value;
    this.render();
  }

  toggleArrayItem(arrayKey, item) {
    if (!Array.isArray(this.userData[arrayKey])) this.userData[arrayKey] = [];
    const arr = this.userData[arrayKey];
    const idx = arr.indexOf(item);
    if (idx > -1) arr.splice(idx, 1); else arr.push(item);
    this.render();
  }

  validateCurrentStep() {
    const u = this.userData;
    switch (this.currentStep) {
      case 1: return !!u.name;
      case 2: return u.goals.length > 0;
      case 3: return !!u.experience;
      case 4: return u.equipment.length > 0;
      case 5: return u.focus.length > 0;
      case 6: return u.frequency && u.duration;
      case 7: return true;
      default: return false;
    }
  }

  nextStep() {
    if (!this.validateCurrentStep()) return;
    if (this.currentStep < this.totalSteps) {
      this.currentStep += 1;
      this.render();
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep -= 1;
      this.render();
    }
  }

  completeSetup() {
    if (this.eventBus) this.eventBus.emit('setup:complete', this.userData);
  }
}
