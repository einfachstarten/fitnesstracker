export class ExperienceStep {
  render(userData, handlers) {
    return this.createElement('div', { className: 'experience-step' }, [
      this.createElement('h2', {}, ['Erfahrung']),
      ['Anf\u00e4nger', 'Fortgeschritten', 'Profi'].map(level =>
        this.createElement('button', {
          onClick: () => handlers.updateUserData('experience', level),
          className: userData.experience === level ? 'selected' : ''
        }, [level])
      )
    ]);
  }

  createElement(tag, props = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(props).forEach(([k,v]) => {
      if (k === 'onClick') el.addEventListener('click', v);
      else if (k === 'className') el.className = v;
      else el.setAttribute(k, v);
    });
    children.forEach(c => {
      if (c instanceof Node) el.appendChild(c);
      else if (Array.isArray(c)) c.forEach(ch => el.appendChild(ch));
      else el.appendChild(document.createTextNode(c));
    });
    return el;
  }
}
