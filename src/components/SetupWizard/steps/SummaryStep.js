export class SummaryStep {
  render(userData) {
    return this.createElement('div', { className: 'summary-step' }, [
      this.createElement('h2', {}, ['Zusammenfassung']),
      this.createElement('pre', {}, [JSON.stringify(userData, null, 2)])
    ]);
  }

  createElement(tag, props = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(props).forEach(([k,v]) => {
      if (k === 'className') el.className = v;
      else el.setAttribute(k, v);
    });
    children.forEach(c => {
      if (typeof c === 'string') el.appendChild(document.createTextNode(c));
      else el.appendChild(c);
    });
    return el;
  }
}
