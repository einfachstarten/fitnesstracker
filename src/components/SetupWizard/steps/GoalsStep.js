export function GoalsStep(userData = {}, handlers = {}) {
  return {
    tag: 'div',
    props: { className: 'goals-step' },
    children: [
      { tag: 'h2', children: ['Ziele'] },
      ...['Muskelaufbau', 'Kraft', 'Ausdauer'].map(goal => ({
        tag: 'button',
        props: {
          onClick: () => handlers.toggleArrayItem('goals', goal),
          className: (userData.goals || []).includes(goal) ? 'selected' : ''
        },
        children: [goal]
      }))
    ]
  };
}
