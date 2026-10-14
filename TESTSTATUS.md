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

- Kein echter Lauf in einem GitHub-Repository. Checkout-Download, tatsächlich gewährte Tokenrechte und Aufruf des wiederverwendbaren Workflows sind daher noch nicht praktisch auf GitHub nachgewiesen.
- Kein Dependabot-Lauf und kein von Dependabot erzeugter Pull Request.
- Kein Windows- oder macOS-Lauf. Die Skripte verwenden portable Node-APIs; die Windows-Aufgaben nutzen `npm.cmd`.
- Kein eigener Lauf mit Node.js 22. Das Projekt verwendet dort verfügbare APIs; lokal geprüft ist Node.js 24.19.0.
- Keine Prüfung von Organisationsrichtlinien, OIDC, Cloud-Deployments oder Workflow dependency lockfiles.

Die GitHub-Konfiguration und der Checkout-Pin sind mit den in der README verlinkten Primärquellen abgeglichen. Dieser Abgleich ersetzt keinen ausgeführten Workflow.

## Dein ergänzendes GitHub-Protokoll

Repository: ____________________

Commit-SHA: ____________________

Datum: ____________________

- [ ] **CI**: Checkout, `npm ci` und fünf Tests erfolgreich.
- [ ] Pin im Action-Vorbereitungslog mit `3d3c42e5aac5ba805825da76410c181273ba90b1` verglichen.
- [ ] Effektive Tokenrechte im Abschnitt **GITHUB_TOKEN Permissions** kontrolliert.
- [ ] **Shared CI (manuell)**: wiederverwendbarer Workflow und fünf Tests erfolgreich.
- [ ] Optional: absichtlicher Testfehler in einem Pull Request erkannt.
- [ ] Dependabot-Update-Status geprüft. Ein fehlender PR bei aktuellem Stand ist kein Fehler.

Links zu Workflow-Läufen und Beobachtungen:

____________________________________________________________
