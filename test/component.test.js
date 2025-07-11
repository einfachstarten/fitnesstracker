import assert from 'assert';
import { JSDOM } from 'jsdom';
import { Component } from '../src/core/Component.js';

class TestComponent extends Component {
  onMount() {
    this.on('ping', () => (this.pinged = true));
  }
  render() { return this.createElement('div'); }
}

const bus = { events: new Map(), on(e,h){ if(!this.events.has(e)) this.events.set(e,[]); this.events.get(e).push(h);}, off(e,h){ const arr=this.events.get(e)||[]; const i=arr.indexOf(h); if(i>-1) arr.splice(i,1); }, emit(e,d){ (this.events.get(e)||[]).forEach(h=>h(d)); } };

const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.document = dom.window.document;
const comp = new TestComponent({ eventBus: bus });
const container = document.body;
comp.mount(container);
assert.strictEqual(bus.events.get('ping').length,1);
comp.unmount();
assert.strictEqual(bus.events.get('ping').length,0);
console.log('component cleanup test passed');
