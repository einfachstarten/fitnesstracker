export function FocusStep(userData = {}, handlers = {}) {
  const areas = ['Ganzk\u00f6rper', 'Oberk\u00f6rper', 'Unterk\u00f6rper', 'Core'];
  return {
    tag: 'div',
    children: areas.map(a => ({
      tag: 'button',
      props: {
        onClick: () => handlers.toggleArrayItem('focus', a),
        className: (userData.focus || []).includes(a) ? 'selected' : ''
      },
      children: [a]
    }))
  };
}
