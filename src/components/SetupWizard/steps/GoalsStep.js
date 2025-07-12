export function GoalsStep(userData = {}, handlers = {}) {
  const goals = userData.goals || [];
  const goalOptions = [
    { id: 'Muskelaufbau', icon: '💪', title: 'Muskelaufbau' },
    { id: 'Kraft', icon: '🏋️', title: 'Kraft steigern' },
    { id: 'Ausdauer', icon: '🏃', title: 'Ausdauer' },
    { id: 'Gesundheit', icon: '❤️', title: 'Gesundheit' }
  ];

  return {
    tag: 'div',
    props: { className: 'step' },
    children: [
      {
        tag: 'div',
        props: { className: 'step__emoji' },
        children: ['🎯']
      },
      {
        tag: 'h2',
        props: { className: 'step__title' },
        children: ['Was ist dein Hauptziel?']
      },
      {
        tag: 'p',
        props: { className: 'step__text' },
        children: ['Du kannst mehrere Ziele auswählen']
      },
      ...goalOptions.map(goal => ({
        tag: 'button',
        props: {
          className: `goal-button ${goals.includes(goal.id) ? 'goal-button--selected' : ''}`,
          onClick: () => handlers.toggleArrayItem('goals', goal.id)
        },
        children: [`${goal.icon} ${goal.title}`]
      }))
    ]
  };
}
