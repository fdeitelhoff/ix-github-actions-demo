#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

// Dieser Versuch zeigt gewöhnliche Git-Tags. Er bildet weder GitHub Actions
// noch den besonderen Schutz von GitHub Immutable Releases nach.
const tempRoot = mkdtempSync(join(tmpdir(), 'actions-tag-lab-'));
const repository = join(tempRoot, 'repository');
const emptyDirectory = join(tempRoot, 'empty');
const emptyConfig = join(tempRoot, 'empty.gitconfig');

// Übernommene GIT_* Variablen könnten etwa ein anderes Repository auswählen
// oder fremde Konfiguration einschleusen. Die Änderungen gelten ausschließlich
// für die hier gestarteten Git-Prozesse, nicht für die Benutzersitzung.
const gitEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(([name]) => !name.toUpperCase().startsWith('GIT_')),
);
Object.assign(gitEnvironment, {
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_CONFIG_GLOBAL: emptyConfig,
  GIT_ATTR_NOSYSTEM: '1',
  GIT_TERMINAL_PROMPT: '0',
  GIT_AUTHOR_NAME: 'Lokaler Tag-Versuch',
  GIT_AUTHOR_EMAIL: 'tag-lab@example.invalid',
  GIT_COMMITTER_NAME: 'Lokaler Tag-Versuch',
  GIT_COMMITTER_EMAIL: 'tag-lab@example.invalid',
  GIT_AUTHOR_DATE: '2026-01-01T12:00:00+00:00',
  GIT_COMMITTER_DATE: '2026-01-01T12:00:00+00:00',
});

function git(...arguments_) {
  const result = spawnSync('git', [
    '-c', 'init.defaultBranch=main',
    '-c', `core.hooksPath=${emptyDirectory}`,
    '-c', `core.excludesFile=${emptyConfig}`,
    '-c', `core.attributesFile=${emptyConfig}`,
    '-c', 'commit.gpgSign=false',
    '-c', 'tag.gpgSign=false',
    '-c', 'core.autocrlf=false',
    '-c', 'core.safecrlf=false',
    ...arguments_,
  ], {
    cwd: repository,
    env: gitEnvironment,
    encoding: 'utf8',
    windowsHide: true,
    timeout: 15_000,
  });
  if (result.error?.code === 'ENOENT') {
    throw new Error('Git fehlt im PATH. Bitte Git installieren und das Terminal erneut öffnen.');
  }
  if (result.error) {
    throw new Error(`Git konnte den lokalen Versuch nicht ausführen: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`Git-Befehl fehlgeschlagen (${arguments_[0]}): ${result.stderr.trim()}`);
  }
  return result.stdout.trim();
}

try {
  mkdirSync(repository);
  mkdirSync(emptyDirectory);
  writeFileSync(emptyConfig, '', 'utf8');
  // Keine Vorlagen aus der Installation oder einer persönlichen Konfiguration.
  git('init', `--template=${emptyDirectory}`, '--object-format=sha1', '.');
  writeFileSync(join(repository, 'zustand.txt'), 'Stand A\n', 'utf8');
  git('add', 'zustand.txt');
  git('commit', '-m', 'Stand A');
  const commitA = git('rev-parse', 'HEAD');
  assert.match(commitA, /^[0-9a-f]{40}$/);
  git('tag', 'v1', commitA);
  assert.equal(git('rev-parse', 'v1'), commitA);

  console.log('Lokaler Versuch: Ein gewöhnlicher Git-Tag ist veränderbar.');
  console.log(`1. Commit A: ${commitA}`);
  console.log('   v1 zeigt zunächst auf A; die Datei enthält „Stand A“.');

  writeFileSync(join(repository, 'zustand.txt'), 'Stand B\n', 'utf8');
  git('add', 'zustand.txt');
  git('commit', '-m', 'Stand B');
  const commitB = git('rev-parse', 'HEAD');
  assert.notEqual(commitA, commitB);
  git('tag', '--force', 'v1', commitB);

  const currentTag = git('rev-parse', 'v1');
  const taggedContent = git('show', 'v1:zustand.txt');
  const pinnedContent = git('show', `${commitA}:zustand.txt`);
  assert.equal(currentTag, commitB);
  assert.equal(taggedContent, 'Stand B');
  assert.equal(git('rev-parse', commitA), commitA);
  assert.equal(pinnedContent, 'Stand A');

  console.log(`2. Commit B: ${commitB}`);
  console.log('   Der Tag v1 erhält absichtlich ein neues Ziel.');
  console.log(`3. Zugriff über v1: ${taggedContent}`);
  console.log(`   Zugriff über den vollständigen SHA von A: ${pinnedContent}`);
  console.log('Alle Prüfungen erfolgreich: Der Tag bewegt sich; der SHA bezeichnet weiterhin A.');
  console.log('Bezug zum Artikel: Ein uses-Verweis auf einen Tag kann später anderen Code auswählen.');
  console.log('Grenze: Dieser lokale Versuch testet weder GitHub Actions noch GitHub Immutable Releases.');
} catch (error) {
  console.error(`Tag-Versuch fehlgeschlagen: ${error.message}`);
  process.exitCode = 1;
} finally {
  try {
    rmSync(tempRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    console.log('Das temporäre Repository ist entfernt. Vorhandene Repositories bleiben unverändert.');
  } catch (error) {
    console.error(`Bereinigung fehlgeschlagen: ${error.message}`);
    process.exitCode = 1;
  }
}
