import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('Tag-Versuch isoliert die Git-Umgebung und räumt sein Repository auf', () => {
  const temporaryParent = mkdtempSync(join(tmpdir(), 'tag-lab-test-'));
  const configParent = mkdtempSync(join(tmpdir(), 'tag-lab-config-'));
  try {
    mkdirSync(join(configParent, 'git'));
    writeFileSync(join(configParent, 'git', 'ignore'), '*.txt\n');
    const result = spawnSync(process.execPath, [
      fileURLToPath(new URL('../scripts/tag-lab.mjs', import.meta.url)),
    ], {
      encoding: 'utf8',
      timeout: 30_000,
      env: {
        ...process.env,
        TMPDIR: temporaryParent,
        TEMP: temporaryParent,
        TMP: temporaryParent,
        XDG_CONFIG_HOME: configParent,
        // Diese Werte würden den Versuch ohne Isolation umleiten oder abbrechen.
        GIT_DIR: join(temporaryParent, 'nicht-vorhandenes-repository'),
        GIT_WORK_TREE: join(temporaryParent, 'nicht-vorhandener-worktree'),
        GIT_CONFIG_COUNT: '1',
        GIT_CONFIG_KEY_0: 'commit.gpgSign',
        GIT_CONFIG_VALUE_0: 'true',
      },
    });
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Zugriff über v1: Stand B/);
    assert.match(result.stdout, /SHA von A: Stand A/);
    assert.deepEqual(readdirSync(temporaryParent), []);
  } finally {
    rmSync(temporaryParent, { recursive: true, force: true, maxRetries: 3 });
    rmSync(configParent, { recursive: true, force: true, maxRetries: 3 });
  }
});
