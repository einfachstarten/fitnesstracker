export function WelcomeStep(userData, handlers) {
  // Inline styles as fallback
  const styles = {
    container: 'padding: 24px; text-align: center;',
    emoji: 'font-size: 4rem; margin-bottom: 16px;',
    title: 'font-size: 1.5rem; font-weight: bold; color: #1f2937; margin-bottom: 16px;',
    text: 'color: #6b7280; line-height: 1.6; margin-bottom: 24px;',
    input: 'width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; margin-bottom: 16px;',
    label: 'display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 8px; text-align: left;'
  };

  return {
    tag: 'div',
    props: {
      className: 'welcome-step text-center space-y-6',
      style: styles.container
    },
    children: [
      {
        tag: 'div',
        props: {
          className: 'text-6xl',
          style: styles.emoji
        },
        children: ['🏋️‍♀️']
      },
      {
        tag: 'h2',
        props: {
          className: 'text-2xl font-bold text-gray-800',
          style: styles.title
        },
        children: ['Willkommen!']
      },
      {
        tag: 'p',
        props: {
          className: 'text-gray-600 leading-relaxed',
          style: styles.text
        },
        children: ['Ich erstelle dir einen personalisierten Trainingsplan, der perfekt zu dir passt. Dazu stelle ich dir ein paar kurze Fragen.']
      },
      {
        tag: 'div',
        props: { className: 'space-y-4' },
        children: [
          {
            tag: 'div',
            children: [
              {
                tag: 'label',
                props: {
                  className: 'block text-sm font-medium text-gray-700 mb-2',
                  style: styles.label
                },
                children: ['Wie heißt du?']
              },
              {
                tag: 'input',
                props: {
                  type: 'text',
                  value: userData.name || '',
                  className: 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500',
                  style: styles.input,
                  placeholder: 'Dein Name',
                  onInput: e => handlers.updateUserData('name', e.target.value)
                }
              }
            ]
          },
          {
            tag: 'div',
            children: [
              {
                tag: 'label',
                props: {
                  className: 'block text-sm font-medium text-gray-700 mb-2',
                  style: styles.label
                },
                children: ['Wie alt bist du? (optional)']
              },
              {
                tag: 'input',
                props: {
                  type: 'number',
                  min: '12',
                  max: '100',
                  value: userData.age || '',
                  className: 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500',
                  style: styles.input,
                  placeholder: 'Dein Alter',
                  onInput: e => handlers.updateUserData('age', parseInt(e.target.value) || null)
                }
              }
            ]
          }
        ]
      }
    ]
  };
}
