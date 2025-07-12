export function GoalsStep(userData = {}, handlers = {}) {
  const goals = userData.goals || [];
  const goalOptions = [
    { id: 'Muskelaufbau', icon: '💪', title: 'Muskelaufbau', desc: 'Muskelmasse und Definition' },
    { id: 'Kraft', icon: '🏋️', title: 'Kraft steigern', desc: 'Stärker werden' },
    { id: 'Ausdauer', icon: '🏃', title: 'Ausdauer', desc: 'Kondition verbessern' },
    { id: 'Gesundheit', icon: '❤️', title: 'Gesundheit', desc: 'Fit und gesund bleiben' }
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
      {
        tag: 'div',
        props: { className: 'goals-options' },
        children: goalOptions.map(goal => {
          const isSelected = goals.includes(goal.id);
          return {
            tag: 'div',
            props: {
              className: `goal-card ${isSelected ? 'goal-card--selected' : ''}`,
              onClick: (e) => {
                e.preventDefault();
                handlers.toggleArrayItem('goals', goal.id);
              }
            },
            children: [
              {
                tag: 'div',
                props: { className: 'goal-card__icon' },
                children: [goal.icon]
              },
              {
                tag: 'div',
                props: { className: 'goal-card__content' },
                children: [
                  {
                    tag: 'div',
                    props: { className: 'goal-card__title' },
                    children: [goal.title]
                  },
                  {
                    tag: 'div',
                    props: { className: 'goal-card__desc' },
                    children: [goal.desc]
                  }
                ]
              },
              {
                tag: 'div',
                props: { className: 'goal-card__check' },
                children: [isSelected ? '✓' : '']
              }
            ]
          };
        })
      }
    ]
  };
}
