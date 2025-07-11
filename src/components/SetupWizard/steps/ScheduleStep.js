export class ScheduleStep {
  render(userData, handlers) {
    return this.createElement('div', {}, [
      this.createElement('h2', {}, ['Zeitplan']),
      this.createElement('label', {}, ['H\u00e4ufigkeit (Tage/Woche)']),
      this.createElement('input', {
        type: 'number',
        min: '1',
        max: '7',
        value: userData.frequency || '',
        onInput: (e) => handlers.updateUserData('frequency', e.target.value)
      }),
      this.createElement('label', {}, ['Dauer pro Einheit']),
      this.createElement('select', {
        value: userData.duration,
        onInput: (e) => handlers.updateUserData('duration', e.target.value)
      }, [
        this.createOption('30min'),
        this.createOption('45min'),
        this.createOption('60min'),
        this.createOption('90min')
      ])
    ]);
  }

  createOption(value) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = value;
    return opt;
  }

  createElement(tag, props = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(props).forEach(([k,v]) => {
      if (k === 'onInput') el.addEventListener('input', v);
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
