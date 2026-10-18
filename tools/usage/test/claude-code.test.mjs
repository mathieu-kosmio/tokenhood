import { test } from 'node:test';
import assert from 'node:assert/strict';
import { measure, toReport } from '../claude-code.mjs';

const line = (ts, id, usage, extra = {}) =>
  JSON.stringify({ type: 'assistant', timestamp: ts, version: '2.1.299', message: { id, model: 'claude-opus-5-5', usage }, ...extra });
const u = (input, output, cc, cr) => ({ input_tokens: input, output_tokens: output, cache_creation_input_tokens: cc, cache_read_input_tokens: cr });

const transcript = [
  line('2026-10-18T10:00:00Z', 'msg_1', u(10, 100, 1000, 5000)),
  line('2026-10-18T10:00:01Z', 'msg_1', u(10, 100, 1000, 5000)), // même réponse sur une 2e ligne
  line('2026-10-18T10:05:00Z', 'msg_2', u(5, 50, 0, 6000)),
  line('2026-10-18T11:00:00Z', 'msg_3', u(1, 10, 200, 100)),
  JSON.stringify({ type: 'user', timestamp: '2026-10-18T10:01:00Z', message: { content: 'bonjour' } }),
  'ligne illisible',
].join('\n');

test('chaque réponse est comptée une seule fois', () => {
  const r = measure(transcript);
  assert.equal(r.messages, 3);
  assert.deepEqual(r.tokens, { input: 16, output: 160, cache_creation: 1200, cache_read: 11100 });
  assert.equal(r.counted, 16 + 1200 + 160);
});

test('fenêtre et exclusions par horodatage', () => {
  const r = measure(transcript, { since: '2026-10-18T10:00:00Z', until: '2026-10-18T11:00:00Z', exclude: ['2026-10-18T10:04:00Z/2026-10-18T10:06:00Z'] });
  assert.equal(r.messages, 1);
  assert.equal(r.tokens.output, 100);
  assert.deepEqual(r.period, { start: '2026-10-18T10:00:00Z', end: '2026-10-18T10:00:00Z' });
});

test('le rapport produit porte le décompte et sa nature', () => {
  const report = toReport(measure(transcript), { mission: ['TH-104'], contributor: 'exemple', pr: ['12'] });
  assert.match(report, /missions: \[TH-104\]/);
  assert.match(report, /counted: 1376/);
  assert.match(report, /nature: declared/);
  assert.match(report, /model: claude-opus-5-5/);
});
