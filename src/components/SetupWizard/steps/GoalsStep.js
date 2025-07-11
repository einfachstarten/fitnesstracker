export class GoalsStep {
  render(userData, handlers) {
    return this.createElement('div', { className: 'goals-step' }, [
      this.createElement('h2', {}, ['Ziele']),
      this.createElement('button', {
        onClick: () => handlers.toggleArrayItem('goals', 'Muskelaufbau'),
        className: userData.goals.includes('Muskelaufbau') ? 'selected' : ''
      }, ['Muskelaufbau']),
      this.createElement('button', {
        onClick: () => handlers.toggleArrayItem('goals', 'Kraft'),
        className: userData.goals.includes('Kraft') ? 'selected' : ''
      }, ['Kraft']),
      this.createElement('button', {
        onClick: () => handlers.toggleArrayItem('goals', 'Ausdauer'),
        className: userData.goals.includes('Ausdauer') ? 'selected' : ''
      }, ['Ausdauer'])
    ]);
  }

  createElement(tag, props = {}, children = []) {
    const element = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === 'onClick') {
        element.addEventListener('click', v);
      } else if (k === 'className') {
        element.className = v;
      } else {
        element.setAttribute(k, v);
      }
    });
    children.forEach(c => {
      if (typeof c === 'string') element.appendChild(document.createTextNode(c));
      else element.appendChild(c);
    });
    return element;
  }
}
