import { Component } from '../../core/Component.js';
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

    this.steps = [
      new WelcomeStep(),
      new GoalsStep(),
      new ExperienceStep(),
      new EquipmentStep(),
      new FocusStep(),
      new ScheduleStep(),
      new SummaryStep()
    ];
  }

  render() {
    const currentStepComponent = this.steps[this.state.currentStep - 1];

    return this.createElement('div', { className: 'setup-wizard' }, [
      this.renderHeader(),
      this.renderStepContent(currentStepComponent),
      this.renderNavigation()
    ]);
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

  renderStepContent(stepComponent) {
    return this.createElement('div', { className: 'step-content' }, [
      stepComponent.render(this.state.userData, this.getStepHandlers())
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

  completeSetup() {
    this.emit('setup:complete', this.state.userData);
  }

  // Helper method for creating DOM elements
  createElement(tag, props = {}, children = []) {
    const element = document.createElement(tag);

    Object.entries(props).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'onClick') {
        element.addEventListener('click', value);
      } else if (key === 'style') {
        element.setAttribute('style', value);
      } else {
        element.setAttribute(key, value);
      }
    });

    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        element.appendChild(child);
      }
    });

    return element;
  }
}
