export class EquipmentStep {
  render(userData, handlers) {
    const equipments = ['Eigengewicht', 'Kurzhanteln', 'Langhanteln', 'Gym-Ger\u00e4te'];
    return this.createElement('div', {}, equipments.map(eq =>
      this.createElement('button', {
        onClick: () => handlers.toggleArrayItem('equipment', eq),
        className: userData.equipment.includes(eq) ? 'selected' : ''
      }, [eq])
    ));
  }

  createElement(tag, props = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(props).forEach(([k,v]) => {
      if (k === 'onClick') el.addEventListener('click', v);
      else if (k === 'className') el.className = v;
      else el.setAttribute(k, v);
    });
    children.forEach(c => {
      if (Array.isArray(c)) c.forEach(ch => el.appendChild(ch));
      else if (c instanceof Node) el.appendChild(c);
      else el.appendChild(document.createTextNode(c));
    });
    return el;
  }
}
