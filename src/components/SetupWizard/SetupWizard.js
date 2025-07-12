import { Component } from '../../core/Component.js';
import { WelcomeStep } from './steps/WelcomeStep.js';
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
      }
    };
  }

  render() {
    return this.createElement('div', { className: 'wizard' }, [
      this.renderHeader(),
      this.renderStepContent(),
      this.renderNavigation()
    ]);
  }

  renderHeader() {
    const progressPercentage = (this.state.currentStep / this.state.totalSteps) * 100;

    return this.createElement('div', { className: 'wizard__header' }, [
      this.createElement('h1', { className: 'wizard__title' }, ['\ud83d\udd2e Trainingsplan-Assistent']),
      this.createElement('p', { className: 'wizard__subtitle' }, [`Schritt ${this.state.currentStep} von ${this.state.totalSteps}`]),
      this.createElement('div', { className: 'wizard__progress' }, [
        this.createElement('div', {
          className: 'wizard__progress-fill',
          style: `width: ${progressPercentage}%`
        })
      ])
    ]);
  }

  // SIMPLE renderStepContent - direct function calls
  renderStepContent() {
    const userData = this.state.userData;
    const handlers = this.getStepHandlers();

    let stepVNode;
    switch (this.state.currentStep) {
      case 1:
        stepVNode = WelcomeStep(userData, handlers);
        break;
      case 2:
        stepVNode = GoalsStep(userData, handlers);
        break;
      case 3:
        stepVNode = ExperienceStep(userData, handlers);
        break;
      case 4:
        stepVNode = EquipmentStep(userData, handlers);
        break;
      case 5:
        stepVNode = FocusStep(userData, handlers);
        break;
      case 6:
        stepVNode = ScheduleStep(userData, handlers);
        break;
      case 7:
        stepVNode = SummaryStep(userData);
        break;
      default:
        stepVNode = {
          tag: 'div',
          children: [`Step ${this.state.currentStep} not implemented yet`]
        };
    }

    return this.createElement('div', { className: 'wizard__content' }, [
      stepVNode
    ]);
  }

  renderNavigation() {
    const isFirstStep = this.state.currentStep === 1;
    const isLastStep = this.state.currentStep === this.state.totalSteps;
    const canProceed = this.validateCurrentStep();

    const buttons = [];
    
    if (!isFirstStep) {
      buttons.push(this.createElement('button', {
        className: 'btn btn--secondary',
        onClick: () => this.previousStep()
      }, ['\u2190 Zur\u00fcck']));
    }
    
    buttons.push(this.createElement('button', {
      className: `btn ${canProceed ? 'btn--primary' : 'btn--disabled'}`,
      disabled: !canProceed,
      onClick: () => isLastStep ? this.completeSetup() : this.nextStep()
    }, [isLastStep ? '\ud83c\udf89 Plan erstellen!' : 'Weiter \u2192']));

    return this.createElement('div', { className: 'wizard__navigation' }, buttons);
  }

  getStepHandlers() {
    return {
      updateUserData: (key, value) => this.updateUserData(key, value),
      toggleArrayItem: (arrayKey, item) => this.toggleArrayItem(arrayKey, item)
    };
  }

  updateUserData(key, value) {
    // Direct state mutation followed by immediate re-render
    this.state.userData[key] = value;
    this.update();
  }

  toggleArrayItem(arrayKey, item) {
    if (!Array.isArray(this.state.userData[arrayKey])) {
      this.state.userData[arrayKey] = [];
    }

    const array = this.state.userData[arrayKey];
    const index = array.indexOf(item);

    if (index > -1) {
      array.splice(index, 1);
    } else {
      array.push(item);
    }

    this.update();
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
    if (!this.validateCurrentStep()) return;

    this.state.currentStep += 1;
    this.update();
  }

  previousStep() {
    if (this.state.currentStep > 1) {
      this.state.currentStep -= 1;
      this.update();
    }
  }

  completeSetup() {
    this.emit('setup:complete', this.state.userData);
  }
}
