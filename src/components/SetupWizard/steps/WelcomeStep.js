export class WelcomeStep {
  render(userData, handlers) {
    return this.createElement('div', { className: 'welcome-step' }, [
      this.createElement('div', { className: 'step-icon' }, ['\ud83c\udfcb\ufe0f']),
      this.createElement('h2', { className: 'step-title' }, ['Willkommen!']),
      this.createElement('p', { className: 'step-description' }, [
        'Ich erstelle dir einen personalisierten Trainingsplan, der perfekt zu dir passt.'
      ]),

      this.createElement('div', { className: 'form-group' }, [
        this.createElement('label', {}, ['Wie hei\u00dft du?']),
        this.createElement('input', {
          type: 'text',
          value: userData.name || '',
          placeholder: 'Dein Name',
          onInput: (e) => handlers.updateUserData('name', e.target.value)
        })
      ]),

      this.createElement('div', { className: 'form-group' }, [
        this.createElement('label', {}, ['Wie alt bist du? (optional)']),
        this.createElement('input', {
          type: 'number',
          min: '12',
          max: '100',
          value: userData.age || '',
          placeholder: 'Dein Alter',
          onInput: (e) => handlers.updateUserData('age', parseInt(e.target.value) || null)
        })
      ])
    ]);
  }

  createElement(tag, props = {}, children = []) {
    const element = document.createElement(tag);

    Object.entries(props).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'onInput') {
        element.addEventListener('input', value);
      } else {
        element.setAttribute(key, value);
      }
    });

    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });

    return element;
  }
}
