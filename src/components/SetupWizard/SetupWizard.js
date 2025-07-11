import { Component } from '../../core/Component.js';
import { VirtualDOM } from '../../core/VirtualDOM.js';
import { WelcomeStep } from './steps/WelcomeStep.js';
// Placeholder imports for remaining steps
import { GoalsStep } from './steps/GoalsStep.js';
import { ExperienceStep } from './steps/ExperienceStep.js';
import { EquipmentStep } from './steps/EquipmentStep.js';
import { FocusStep } from './steps/FocusStep.js';
import { ScheduleStep } from './steps/ScheduleStep.js';
import { SummaryStep } from './steps/SummaryStep.js';

export class SetupWizard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 1,
      totalSteps: 7,
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
      isTransitioning: false
    };

    // Components will be created dynamically per render
  }

  getCurrentStepComponent() {
    const stepClasses = [
      WelcomeStep,
      GoalsStep,
      ExperienceStep,
      EquipmentStep,
      FocusStep,
      ScheduleStep,
      SummaryStep
    ];

    const StepClass = stepClasses[this.state.currentStep - 1];
    return new StepClass({
      userData: this.state.userData,
      handlers: this.getStepHandlers(),
      eventBus: this.eventBus
    });
  }

  render() {
    return this.createElement('div', { className: 'setup-wizard' }, [
      this.renderHeader(),
      this.renderStepContent(),
      this.renderNavigation()
    ]);
  }

  onMount() {
    // Force apply CSS classes after mount
    this.applyCSSFix();
  }

  applyCSSFix() {
    if (!this.element) return;

    // Apply CSS directly to DOM elements after a short delay
    setTimeout(() => {
      const wizard = this.element;
      if (wizard) {
        // Header styling
        const header = wizard.querySelector('.setup-wizard') || wizard;
        if (header) {
          header.style.cssText = `
          max-width: 28rem;
          margin: 0 auto;
          background: white;
          min-height: 100vh;
        `;
        }

        // Header gradient
        const headerDiv = wizard.querySelector('[class*="gradient"]') || wizard.firstElementChild;
        if (headerDiv) {
          headerDiv.style.cssText = `
          padding: 1rem;
          background: linear-gradient(to right, #2563eb, #4f46e5);
          color: white;
        `;
        }

        // Content area
        const content = wizard.querySelector('[class*="p-6"]');
        if (content) {
          content.style.cssText = `
          padding: 1.5rem;
        `;
        }

        // Input fields
        const inputs = wizard.querySelectorAll('input');
        inputs.forEach(input => {
          input.style.cssText = `
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        `;
        });

        // Labels
        const labels = wizard.querySelectorAll('label');
        labels.forEach(label => {
          label.style.cssText = `
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        `;
        });

        // Buttons
        const buttons = wizard.querySelectorAll('button');
        buttons.forEach(button => {
          if (button.disabled) {
            button.style.cssText = `
            flex: 1;
            padding: 0.75rem;
            font-weight: 600;
            border-radius: 0.5rem;
            background: #d1d5db;
            color: #6b7280;
            cursor: not-allowed;
          `;
          } else {
            button.style.cssText = `
            flex: 1;
            padding: 0.75rem;
            font-weight: 600;
            border-radius: 0.5rem;
            background: linear-gradient(to right, #2563eb, #4f46e5);
            color: white;
            cursor: pointer;
          `;
          }
        });
      }
    }, 50);
  }

  renderHeader() {
    const progressPercentage = (this.state.currentStep / this.state.totalSteps) * 100;

    return this.createElement('div', { className: 'setup-header' }, [
      this.createElement('h1', { className: 'setup-title' }, ['\ud83e\udd13 Trainingsplan-Assistent']),
      this.createElement('p', { className: 'setup-subtitle' }, [`Schritt ${this.state.currentStep} von ${this.state.totalSteps}`]),
      this.createElement('div', { className: 'progress-bar' }, [
        this.createElement('div', {
          className: 'progress-fill',
          style: `width: ${progressPercentage}%`
        })
      ])
    ]);
  }

  renderStepContent() {
    const stepComponent = this.getCurrentStepComponent();
    return this.createElement('div', { className: 'step-content' }, [
      stepComponent.render()
    ]);
  }

  renderNavigation() {
    const isFirstStep = this.state.currentStep === 1;
    const isLastStep = this.state.currentStep === this.state.totalSteps;
    const canProceed = this.validateCurrentStep();

    return this.createElement('div', { className: 'step-navigation' }, [
      !isFirstStep && this.createElement('button', {
        className: 'btn btn-secondary',
        onClick: () => this.previousStep()
      }, ['\u2190 Zur\u00fcck']),

      this.createElement('button', {
        className: `btn btn-primary ${!canProceed ? 'disabled' : ''}`,
        onClick: () => isLastStep ? this.completeSetup() : this.nextStep(),
        disabled: !canProceed
      }, [isLastStep ? '\ud83c\udf89 Plan erstellen!' : 'Weiter \u2192'])
    ]);
  }

  getStepHandlers() {
    return {
      updateUserData: (key, value) => this.updateUserData(key, value),
      toggleArrayItem: (arrayKey, item) => this.toggleArrayItem(arrayKey, item)
    };
  }

  updateUserData(key, value) {
    this.setState({
      userData: { ...this.state.userData, [key]: value }
    });
  }

  toggleArrayItem(arrayKey, item) {
    const array = this.state.userData[arrayKey] || [];
    const index = array.indexOf(item);
    const newArray = index > -1
      ? array.filter(i => i !== item)
      : [...array, item];

    this.updateUserData(arrayKey, newArray);
  }

  validateCurrentStep() {
    const validators = {
      1: () => !!this.state.userData.name,
      2: () => this.state.userData.goals.length > 0,
      3: () => !!this.state.userData.experience,
      4: () => this.state.userData.equipment.length > 0,
      5: () => this.state.userData.focus.length > 0,
      6: () => this.state.userData.frequency && this.state.userData.duration,
      7: () => true
    };

    return validators[this.state.currentStep]?.() || false;
  }

  nextStep() {
    if (this.state.isTransitioning || !this.validateCurrentStep()) return;

    this.setState({ isTransitioning: true });

    setTimeout(() => {
      this.setState({
        currentStep: this.state.currentStep + 1,
        isTransitioning: false
      });
    }, 300);
  }

  previousStep() {
    if (this.state.currentStep > 1) {
      this.setState({ currentStep: this.state.currentStep - 1 });
    }
  }

  update() {
    if (this.element) {
      const newVNode = this.render();
      const patches = VirtualDOM.diff(this.lastVNode, newVNode);
      if (patches) {
        this.applyPatches(this.element, patches);
      }
      this.lastVNode = newVNode;

      // Reapply CSS after DOM update
      this.applyCSSFix();
    }
  }

  completeSetup() {
    this.emit('setup:complete', this.state.userData);
  }
}
