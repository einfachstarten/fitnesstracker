export function EquipmentStep(userData = {}, handlers = {}) {
  const equipments = ['Eigengewicht', 'Kurzhanteln', 'Langhanteln', 'Gym-Ger\u00e4te'];
  return {
    tag: 'div',
    children: equipments.map(eq => ({
      tag: 'button',
      props: {
        onClick: () => handlers.toggleArrayItem('equipment', eq),
        className: (userData.equipment || []).includes(eq) ? 'selected' : ''
      },
      children: [eq]
    }))
  };
}
