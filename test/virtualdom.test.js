import assert from 'assert';
import { VirtualDOM } from '../src/core/VirtualDOM.js';

const li = (k, t) => VirtualDOM.createElement('li', { key: k }, [t]);

// Reordering
const oldList = VirtualDOM.createElement('ul', {}, [
  li('a', 'A'),
  li('b', 'B'),
  li('c', 'C')
]);

const newList = VirtualDOM.createElement('ul', {}, [
  li('b', 'B'),
  li('a', 'A'),
  li('c', 'C')
]);

const diff1 = VirtualDOM.diff(oldList, newList);
assert(Array.isArray(diff1.children));
const moves = diff1.children.filter(p => p.patch && p.patch.type === 'MOVE');
assert.strictEqual(moves.length, 2);

// Removal and creation
const oldList2 = VirtualDOM.createElement('ul', {}, [
  li('a', 'A'),
  li('b', 'B')
]);

const newList2 = VirtualDOM.createElement('ul', {}, [
  li('b', 'B'),
  li('c', 'C')
]);

const diff2 = VirtualDOM.diff(oldList2, newList2);
const removes = diff2.children.filter(p => p.patch && p.patch.type === 'REMOVE');
const creates = diff2.children.filter(p => p.patch && p.patch.type === 'CREATE');
assert.strictEqual(removes.length, 1);
assert.strictEqual(creates.length, 1);

console.log('virtualdom keyed diff tests passed');
