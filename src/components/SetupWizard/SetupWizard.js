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
    return this.createElement('div', { className: 'wizard' }, [
      this.renderHeader(),
      this.renderStepContent(),
      this.renderNavigation()
    ]);
  }

  onMount() {}

  renderHeader() {
    const progressPercentage = (this.state.currentStep / this.state.totalSteps) * 100;

    return this.createElement('div', { className: 'wizard__header' }, [
      this.createElement('h1', { className: 'wizard__title' }, ['\ud83e\udd13 Trainingsplan-Assistent']),
      this.createElement('p', { className: 'wizard__subtitle' }, [`Schritt ${this.state.currentStep} von ${this.state.totalSteps}`]),
      this.createElement('div', { className: 'wizard__progress' }, [
        this.createElement('div', {
          className: 'wizard__progress-fill',
          style: `width: ${progressPercentage}%`
        })
      ])
    ]);
  }

  renderStepContent() {
    const stepComponent = this.getCurrentStepComponent();

    return this.createElement('div', { className: 'wizard__content' }, [
      stepComponent.render()
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
    }
  }

  completeSetup() {
    this.emit('setup:complete', this.state.userData);
  }
}
