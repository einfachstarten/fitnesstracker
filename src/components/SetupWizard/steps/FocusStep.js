export class FocusStep {
  render(userData, handlers) {
    const areas = ['Ganzk\u00f6rper', 'Oberk\u00f6rper', 'Unterk\u00f6rper', 'Core'];
    return this.createElement('div', {}, areas.map(a =>
      this.createElement('button', {
        onClick: () => handlers.toggleArrayItem('focus', a),
        className: userData.focus.includes(a) ? 'selected' : ''
      }, [a])
    ));
  }

  createElement(tag, props = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(props).forEach(([k,v]) => {
      if (k === 'onClick') el.addEventListener('click', v);
      else if (k === 'className') el.className = v;
      else el.setAttribute(k, v);
    });
    children.forEach(c => {
      if (Array.isArray(c)) c.forEach(ch => el.appendChild(ch));
      else if (c instanceof Node) el.appendChild(c);
      else el.appendChild(document.createTextNode(c));
    });
    return el;
  }
}
