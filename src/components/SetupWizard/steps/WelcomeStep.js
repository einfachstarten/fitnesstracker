// Pure Function - NO Component class
export function WelcomeStep(userData, handlers) {
  return {
    tag: 'div',
    props: { className: 'step' },
    children: [
      {
        tag: 'div',
        props: { className: 'step__emoji' },
        children: ['\ud83c\udfcb\ufe0f']
      },
      {
        tag: 'h2',
        props: { className: 'step__title' },
        children: ['Willkommen!']
      },
      {
        tag: 'p',
        props: { className: 'step__text' },
        children: ['Ich erstelle dir einen personalisierten Trainingsplan, der perfekt zu dir passt. Dazu stelle ich dir ein paar kurze Fragen.']
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
      },
      {
        tag: 'div',
        props: { className: 'form-group' },
        children: [
          {
            tag: 'label',
            props: { className: 'form-label' },
            children: ['Wie alt bist du? (optional)']
          },
          {
            tag: 'input',
            props: {
              type: 'number',
              min: '12',
              max: '100',
              value: userData.age || '',
              className: 'form-input',
              placeholder: 'Dein Alter',
              onInput: e => handlers.updateUserData('age', parseInt(e.target.value) || null)
            }
          }
        ]
      }
    ]
  };
}
