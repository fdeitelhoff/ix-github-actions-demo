import assert from 'node:assert/strict';
import test from 'node:test';
import { releaseLabel } from '../src/release-label.mjs';

test('Projekt und Version ergeben einen lesbaren Releasenamen', () => {
  assert.equal(releaseLabel('actions-demo', '1.2.3'), 'actions-demo v1.2.3');
});

test('Leerzeichen um den Projektnamen beeinflussen das Ergebnis nicht', () => {
  assert.equal(releaseLabel('  actions-demo  ', '1.2.3'), 'actions-demo v1.2.3');
});

test('Ein fehlender Projektname führt zu einem Fehler', () => {
  assert.throws(() => releaseLabel(' ', '1.2.3'), TypeError);
});

test('Eine unvollständige Versionsangabe führt zu einem Fehler', () => {
  assert.throws(() => releaseLabel('actions-demo', '1.2'), TypeError);
});
