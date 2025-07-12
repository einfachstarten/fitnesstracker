export function SummaryStep(userData = {}) {
  return {
    tag: 'div',
    props: { className: 'summary-step' },
    children: [
      { tag: 'h2', children: ['Zusammenfassung'] },
      { tag: 'pre', children: [JSON.stringify(userData, null, 2)] }
    ]
  };
}
