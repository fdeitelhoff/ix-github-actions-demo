# Teststatus des Demoprojekts

Prüfung am 14. Oktober 2026. Umgebung: Linux, Node.js 24.19.0, npm 11.9.0, Git 2.51.1.

## Vor Auslieferung tatsächlich ausgeführt

| Prüfung | Ergebnis |
| --- | --- |
| `npm ci --offline --no-audit --no-fund` | Erfolgreich; Projekt besitzt keine externen npm-Abhängigkeiten. |
| `npm test` | 5 Tests bestanden, 0 fehlgeschlagen, Exitcode 0. |
| `npm start` | Ausgabe `actions-demo v1.2.3`, Exitcode 0. |
| `npm run demo:tags` | Tag liefert B, SHA liefert A; temporäres Repository anschließend entfernt, Exitcode 0. |
| Isolation des Tag-Versuchs | Integrationstest mit umleitenden `GIT_*`-Variablen, aktivierter Git-Signierkonfiguration und globaler Ignore-Regel `*.txt` erfolgreich. |
| Absichtlich falscher Testwert | In einer temporären Projektkopie geprüft: genau ein Testfehler, Exitcode 1. Die ausgelieferte Projektfassung enthält diesen Fehler nicht. |
| JSON und YAML | Dateien geparst; Trigger, Tokenrechte, SHA-Referenzen und lokaler Workflowpfad strukturell geprüft. Kein vollständiger Ersatz für GitHubs Workflowvalidierung. |
| Abgleich mit Artikel | Listings 1, 2 und 4 stimmen mit den aktiven Dateien überein. Beim Caller aus Listing 3 unterscheiden sich ausschließlich Name und Auslöser. Alle vier unveränderten Originale liegen bei. |

## Noch nicht ausgeführt

- Kein von Dependabot erzeugter Pull Request. Der Dependabot-Lauf selbst ist nachgewiesen (siehe GitHub-Protokoll unten); bei aktuellem Stand von `actions/checkout` war kein PR zu erwarten.
- Kein Windows- oder macOS-Lauf auf GitHub. Die GitHub-Läufe nutzen ausschließlich `ubuntu-24.04`. Die Skripte verwenden portable Node-APIs; die Windows-Aufgaben nutzen `npm.cmd`.
- Kein eigener Lauf mit Node.js 22. Das Projekt verwendet dort verfügbare APIs; lokal geprüft ist Node.js 24.19.0.
- Keine Prüfung von Organisationsrichtlinien, OIDC, Cloud-Deployments oder Workflow dependency lockfiles.

Die GitHub-Konfiguration und der Checkout-Pin sind mit den in der README verlinkten Primärquellen abgeglichen. Dieser Abgleich ersetzt keinen ausgeführten Workflow; die tatsächlichen GitHub-Läufe dokumentiert das Protokoll unten.

## Dein ergänzendes GitHub-Protokoll

Repository: https://github.com/fdeitelhoff/ix-github-actions-demo (öffentlich)

Commit-SHA: `70909ca32b49a3d9bea26f8fbfde88bef26462b8`

Datum: 14. Oktober 2026. Runner-Image `ubuntu-24.04`, Version 20261004.327.1.

- [x] **CI**: Checkout, `npm ci` und fünf Tests erfolgreich.
- [x] Pin im Action-Vorbereitungslog mit `3d3c42e5aac5ba805825da76410c181273ba90b1` verglichen.
- [x] Effektive Tokenrechte im Abschnitt **GITHUB_TOKEN Permissions** kontrolliert.
- [x] **Shared CI (manuell)**: wiederverwendbarer Workflow und fünf Tests erfolgreich.
- [x] Optional: absichtlicher Testfehler in einem Pull Request erkannt.
- [x] Dependabot-Update-Status geprüft. Ein fehlender PR bei aktuellem Stand ist kein Fehler.

Links zu Workflow-Läufen und Beobachtungen:

| Lauf | Ergebnis und Beobachtung |
| --- | --- |
| [CI (push)](https://github.com/fdeitelhoff/ix-github-actions-demo/actions/runs/38585752278) | Erfolgreich, 5/5 Tests. Log: `Download action repository 'actions/checkout@3d3c42e5…' (SHA:3d3c42e5aac5ba805825da76410c181273ba90b1)`. **GITHUB_TOKEN Permissions:** `Contents: read`, `Metadata: read`, keine Schreibrechte. |
| [Shared CI (manuell)](https://github.com/fdeitelhoff/ix-github-actions-demo/actions/runs/38585841652) | Erfolgreich per `workflow_dispatch`, 5/5 Tests, gleiche Tokenrechte und gleicher Pin. Log: `Uses: …/.github/workflows/reusable-ci.yml@refs/heads/main (70909ca…)`, also derselbe Commit wie beim Caller. |
| [CI (pull_request, PR #1)](https://github.com/fdeitelhoff/ix-github-actions-demo/actions/runs/38585942046) | Erwartungsgemäß fehlgeschlagen: Test 1 `expected: 'Absichtlich falsch'`, `actual: 'actions-demo v1.2.3'`; 4 bestanden, 1 fehlgeschlagen, Exitcode 1. PR ungemergt geschlossen, Branch gelöscht. |
| [Dependabot Updates](https://github.com/fdeitelhoff/ix-github-actions-demo/actions/runs/38585759145) | Direkt nach dem ersten Push automatisch gelaufen und erfolgreich. Log: `Checking if actions/checkout 7.0.1 needs updating` → `Latest version is 7.0.1`. Kein PR, wie erwartet. |
