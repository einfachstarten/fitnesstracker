export function ExperienceStep(userData = {}, handlers = {}) {
  return {
    tag: 'div',
    props: { className: 'experience-step' },
    children: [
      { tag: 'h2', children: ['Erfahrung'] },
      ...['Anf\u00e4nger', 'Fortgeschritten', 'Profi'].map(level => ({
        tag: 'button',
        props: {
          onClick: () => handlers.updateUserData('experience', level),
          className: userData.experience === level ? 'selected' : ''
        },
        children: [level]
      }))
    ]
  };
}
