import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, readState, saveState } from '../src/storage.js';
test('corrupt or unavailable storage recovers safely', () => {
  assert.deepEqual(readState({ getItem: () => '{broken' }), normalize());
  assert.deepEqual(readState(undefined), normalize());
  assert.equal(saveState(undefined, {}), false);
  assert.deepEqual(normalize({count:-2,note:3,theme:'invalid'}), normalize());
});
test('round trip preserves note, counter and theme', () => {
  let value; const storage = { setItem: (_, v) => { value = v; }, getItem: () => value };
  const state = {count:42,note:'Idea <script> & café',theme:'light'};
  assert.equal(saveState(storage,state),true);
  assert.deepEqual(readState(storage),state);
});
