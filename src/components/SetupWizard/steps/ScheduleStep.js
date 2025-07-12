export function ScheduleStep(userData = {}, handlers = {}) {
  return {
    tag: 'div',
    children: [
      { tag: 'h2', children: ['Zeitplan'] },
      { tag: 'label', children: ['H\u00e4ufigkeit (Tage/Woche)'] },
      {
        tag: 'input',
        props: {
          type: 'number',
          min: '1',
          max: '7',
          value: userData.frequency || '',
          onInput: e => handlers.updateUserData('frequency', e.target.value)
        }
      },
      { tag: 'label', children: ['Dauer pro Einheit'] },
      {
        tag: 'select',
        props: {
          value: userData.duration,
          onInput: e => handlers.updateUserData('duration', e.target.value)
        },
        children: [
          { tag: 'option', props: { value: '30min' }, children: ['30min'] },
          { tag: 'option', props: { value: '45min' }, children: ['45min'] },
          { tag: 'option', props: { value: '60min' }, children: ['60min'] },
          { tag: 'option', props: { value: '90min' }, children: ['90min'] }
        ]
      }
    ]
  };
}
