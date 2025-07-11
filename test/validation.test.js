import assert from 'assert';
import { isValidName, isValidAge, hasValidGoals } from '../src/utils/ValidationUtils.js';

assert.strictEqual(isValidName('Tom'), true);
assert.strictEqual(Boolean(isValidName('')), false);
assert.strictEqual(isValidAge(30), true);
assert.strictEqual(isValidAge(5), false);
assert.strictEqual(hasValidGoals(['Muskelaufbau']), true);
assert.strictEqual(hasValidGoals([]), false);

console.log('validation tests passed');
