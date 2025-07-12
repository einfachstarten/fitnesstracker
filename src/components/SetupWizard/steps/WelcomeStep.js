// Pure Function - NO CLASS!
export function WelcomeStep(userData = {}, handlers = {}) {
  return {
    tag: 'div',
    props: { className: 'step' },
    children: [
      {
        tag: 'div',
        props: { className: 'step__emoji' },
        children: ['🏋️‍♀️']
      },
      {
        tag: 'h2',
        props: { className: 'step__title' },
        children: ['Willkommen!']
      },
      {
        tag: 'p',
        props: { className: 'step__text' },
        children: ['Ich erstelle dir einen personalisierten Trainingsplan, der perfekt zu dir passt.']
      },
      {
        tag: 'div',
        props: { className: 'form-group' },
        children: [
          {
            tag: 'label',
            props: { className: 'form-label' },
            children: ['Wie heißt du?']
          },
          {
            tag: 'input',
            props: {
              type: 'text',
              value: userData.name || '',
              className: 'form-input',
              placeholder: 'Dein Name',
              onInput: e => handlers.updateUserData('name', e.target.value)
            }
          }
        ]
      }
    ]
  };
}
