import { Component } from '../../../core/Component.js';

export class EquipmentStep extends Component {
  constructor(props = {}) {
    super(props);
    this.userData = props.userData || {};
    this.handlers = props.handlers || {};
  }

  render() {
    const userData = this.userData;
    const handlers = this.handlers;
    const equipments = ['Eigengewicht', 'Kurzhanteln', 'Langhanteln', 'Gym-Ger\u00e4te'];
    return this.createElement(
      'div',
      {},
      equipments.map(eq =>
        this.createElement(
          'button',
          {
            onClick: () => handlers.toggleArrayItem('equipment', eq),
            className: userData.equipment.includes(eq) ? 'selected' : ''
          },
          [eq]
        )
      )
    );
  }
}
