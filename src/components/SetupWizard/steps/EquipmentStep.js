import { Component } from '../../../core/Component.js';

export class EquipmentStep extends Component {
  render(userData, handlers) {
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
