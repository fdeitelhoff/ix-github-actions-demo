# GitHub Actions als Lieferkettenrisiko – Demoprojekt

Dieses Projekt macht die vier Listings des Artikels ausführbar. Du kannst zuerst die Beispielanwendung und die Veränderbarkeit gewöhnlicher Git-Tags lokal prüfen. Anschließend lässt du dieselben Tests in einem eigenen GitHub-Repository laufen und prüfst dort Checkout-Pin, Tokenrechte, wiederverwendbare Workflows und Dependabot.

Die Beispielanwendung erzeugt einen Releasenamen. Sie benötigt keine externen npm-Pakete und veröffentlicht nichts. Der Git-Versuch arbeitet ausschließlich in einem neu angelegten temporären Repository. Für die GitHub-Läufe brauchst du keine selbst angelegten Secrets oder Zugriffstokens.

## 1. In VS Code öffnen und lokal testen

Voraussetzungen: **Node.js 22 oder 24 mit npm**, **Git ab 2.32** und **Visual Studio Code**. Für eine neue lokale Installation bietet sich Node.js 24 LTS an. Das Projekt nutzt nur Funktionen, die auch mit Node.js 22 verfügbar sind.

1. Entpacke das ZIP vollständig.
2. Öffne in VS Code den Ordner `github-actions-demo`, in dem `package.json` liegt: **Datei → Ordner öffnen**.
3. Öffne **Terminal → Neues Terminal**. Prüfe, dass das Terminal in diesem Ordner steht.
4. Führe die Befehle einzeln aus.

Unter Windows in PowerShell:

```powershell
node --version
git --version
npm.cmd ci
npm.cmd test
npm.cmd start
npm.cmd run demo:tags
```

Unter Linux/macOS:

```bash
node --version
git --version
npm ci
npm test
npm start
npm run demo:tags
```

`npm.cmd` umgeht unter Windows die gelegentliche Sperre von `npm.ps1`. Du musst dafür keine PowerShell-Ausführungsrichtlinie ändern. Die mitgelieferten VS-Code-Aufgaben verwenden unter Windows bereits `npm.cmd`. Du findest sie über **Terminal → Aufgabe ausführen** unter `Demo: …`. Mit F5 kannst du das Beispielprogramm debuggen.

Erwartete Ergebnisse:

| Befehl | Erwartetes Ergebnis |
| --- | --- |
| `npm ci` | Erfolgreicher Abschluss auf Grundlage der vorhandenen `package-lock.json`; keine Projektabhängigkeiten zu installieren. |
| `npm test` | Fünf erfolgreiche Tests: vier Anwendungstests und ein Integrationstest des Tag-Versuchs. |
| `npm start` | Ausgabe `actions-demo v1.2.3`. |
| `npm run demo:tags` | `v1` liefert nach dem Verschieben „Stand B“, der vollständige SHA von A weiterhin „Stand A“. |

Die konkrete Darstellung der Testergebnisse hängt von der Node-Version ab. Entscheidend sind fünf bestandene Tests, null Fehlschläge und Exitcode 0.

## 2. Was der lokale Tag-Versuch zeigt

`scripts/tag-lab.mjs` legt ein temporäres Git-Repository an, erzeugt Commit A und den Tag `v1`, danach Commit B. Anschließend setzt das Skript **nur in diesem temporären Repository** den Tag `v1` auf B. Zwei Lesezugriffe zeigen den Unterschied:

- Der Name `v1` bezeichnet jetzt B.
- Der vollständige Commit-SHA von A bezeichnet weiterhin A.

Das Skript prüft diese Aussagen und entfernt das temporäre Repository. Es verändert weder deine Git-Konfiguration noch vorhandene Repositories und benötigt keinen Netzwerkzugriff. Der Versuch zeigt die Semantik gewöhnlicher Git-Tags. Er prüft weder GitHub Actions noch den besonderen Schutz von GitHub Immutable Releases und bescheinigt keinem Commit Vertrauenswürdigkeit.

## 3. Die Original-Listings und die aktiven Workflows

| Artikel | Unverändertes Original | Ausführbare Datei im Projekt |
| --- | --- | --- |
| Listing 1 | `article-listings/Listing1.yml` | `.github/workflows/ci.yml` – unverändert |
| Listing 2 | `article-listings/Listing2.yml` | `.github/dependabot.yml` – unverändert |
| Listing 3 | `article-listings/Listing3.yml` | `.github/workflows/shared-ci.yml` – Name und Auslöser angepasst |
| Listing 4 | `article-listings/Listing4.yml` | `.github/workflows/reusable-ci.yml` – unverändert |

Die Dateien unter `article-listings` dienen dem Vergleich. GitHub führt sie dort nicht als Workflows aus.

**Einziger funktionaler Unterschied zu den Listings:** Der Caller aus Listing 3 startet im Demoprojekt mit `workflow_dispatch` manuell. So läuft auf einen Push nach `main` zunächst nur Listing 1. Den wiederverwendbaren Ablauf prüfst du danach separat. Der Aufruf, seine Berechtigungen und der aufgerufene Workflow entsprechen dem Artikel.

Der Checkout-Pin lautet unverändert:

```yaml
uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
```

Die Workflows nutzen wie der Artikel das auf `ubuntu-24.04` vorinstallierte Node.js. Dieses Projekt fügt dafür keine zusätzliche Action ein. Die Action-eigene Node-Laufzeit von `checkout` und die für `npm test` verfügbare Projektlaufzeit sind zwei verschiedene Dinge. Das Runner-Image kann sich ändern; die Tests brauchen Node.js ab 22. Für ein Produktionsprojekt gehört auch diese Laufzeit in die bewusst gepflegte Buildkonfiguration.

## 4. Auf GitHub ausführen

Die YAML-Dateien starten nicht durch das Öffnen in VS Code. Dafür braucht es ein GitHub-Repository mit aktivierten Actions.

1. Erstelle auf GitHub ein **neues, leeres Test-Repository**, beispielsweise `github-actions-lieferketten-demo`. Lege dort zunächst keine README oder andere Dateien an. Ein privates Repository eignet sich ebenfalls.
2. Führe im entpackten Projektordner die folgenden Befehle einzeln aus. Ersetze `DEIN-KONTO` in der URL durch deinen GitHub-Namen beziehungsweise deine Organisation und passe gegebenenfalls den Repositorynamen an.

```bash
git init -b main
git add .
git commit -m "GitHub-Actions-Demo hinzufügen"
git remote add origin https://github.com/DEIN-KONTO/github-actions-lieferketten-demo.git
git push -u origin main
```

Git benötigt dafür deine übliche Anmeldung bei GitHub und einen konfigurierten Commit-Namen samt E-Mail-Adresse. Diese Anmeldung gehört zur Übertragung deines Repositorys, nicht in eine Workflow-Datei. Falls Git nach der Commit-Identität fragt, setze sie mit `git config user.name` und `git config user.email` für dieses Repository.

3. Prüfe auf GitHub, dass `main` der Defaultbranch ist und die versteckten Ordner `.github` und `.vscode` ebenfalls angekommen sind.
4. Öffne den Reiter **Actions**, dann den Lauf **CI** und den Job **test**.

Erwartet: Checkout, `npm ci` und `npm test` schließen erfolgreich ab. Die Tests enthalten auch den lokalen Tag-Versuch. Für dessen lesbare Ausgabe kannst du weiterhin `npm run demo:tags` lokal verwenden; der Integrationstest fängt diese Ausgabe ab.

### Pin und Tokenrechte im echten Lauf prüfen

- Im Abschnitt **Set up job** stehen die effektiven **GITHUB_TOKEN Permissions**. Erwartet sind Leserechte für Contents sowie das von GitHub bereitgestellte Metadata-Leserecht, keine Schreibrechte. Übergeordnete Richtlinien können den Lauf zusätzlich einschränken.
- Bei der Vorbereitung der Actions zeigt das Log den geladenen Stand von `actions/checkout`. Vergleiche ihn mit dem vollständigen Pin oben. Verwechsle ihn nicht mit dem ausgecheckten Anwendungscommit aus deinem Test-Repository.
- `persist-credentials: false` steht im Checkout-Schritt. Es verhindert die Hinterlegung der Checkout-Zugangsdaten für spätere Git-Aufrufe. Es entfernt nicht den Jobtoken.

Ein erfolgreicher Lauf belegt, dass diese Konfiguration funktioniert. Er beweist keine allgemeine Sicherheit des ausgeführten Codes. Das Projekt enthält absichtlich keinen schreibenden GitHub-API-Test: Die effektiven Tokenrechte liest du in GitHubs Joblog ab.

## 5. Den wiederverwendbaren Workflow testen

1. Die Dateien müssen bereits auf dem Defaultbranch liegen.
2. Öffne **Actions → Shared CI (manuell) → Run workflow**.
3. Wähle `main` und starte den Lauf.
4. Öffne den aufgerufenen Testjob und prüfe erneut die fünf Testergebnisse und die Tokenrechte.

`shared-ci.yml` ruft auf Job-Ebene `./.github/workflows/reusable-ci.yml` auf. Die relative Referenz verwendet denselben Commit wie der Caller. Die Datei `reusable-ci.yml` selbst hat nur `workflow_call` als Auslöser und deshalb keinen eigenen manuellen Startknopf.

Wenn du Listing 3 exakt mit seinen automatischen Auslösern ausprobieren möchtest, ersetze den Inhalt von `shared-ci.yml` durch `article-listings/Listing3.yml`. Dann können die direkte CI und die wiederverwendbare Variante beide auf dasselbe Ereignis reagieren. Für einen dauerhaften Einsatz genügt eine der beiden Varianten.

## 6. Einen Fehler sichtbar machen

Öffne `test/release-label.test.mjs`. Ändere **nur im ersten Test den erwarteten Wert**, also das zweite Argument von `assert.equal`:

```javascript
assert.equal(releaseLabel('actions-demo', '1.2.3'), 'Absichtlich falsch');
```

`npm test` beziehungsweise `npm.cmd test` muss nun mit einem fehlgeschlagenen Test und Exitcode 1 enden. Nimm die Änderung danach mit **Rückgängig** zurück und prüfe erneut den grünen Lauf.

Für den gleichen Nachweis auf GitHub kannst du die absichtliche Änderung auf einem neuen Branch committen, pushen und daraus einen Pull Request nach `main` öffnen. Der Workflow aus Listing 1 startet dann über `pull_request` und muss im Testschritt scheitern. Den Fehler nicht nach `main` übernehmen. Alternativ genügt die lokale Prüfung.

## 7. Dependabot prüfen

Die Datei `.github/dependabot.yml` aus Listing 2 konfiguriert wöchentliche Versionsupdates für GitHub Actions. In dieser Konfiguration prüft Dependabot den Defaultbranch. Bei einem neueren geeigneten Stand kann es einen Pull Request mit aktualisiertem SHA und Versionskommentar vorschlagen.

Du musst dafür keine veraltete Action absichtlich einbauen. **Ein erfolgreicher Check ohne Pull Request ist erwartbar, wenn keine neuere geeignete Version existiert.** Prüfe den Update-Status in der Dependabot-Ansicht deines Repositorys. GitHub dokumentiert den Zugang zu den Update-Logs in der unten verlinkten Anleitung zur Konfiguration von Versionsupdates.

Auch die manuelle Caller-Variante und der wiederverwendbare Workflow liegen in `.github/workflows`. Die reinen Artikelkopien unter `article-listings` sind keine zusätzlichen aktiven Pipelines. Versionsupdates und Sicherheitswarnungen bleiben verschiedene Funktionen; ein ausbleibender Alert ist kein Sicherheitsnachweis.

## 8. Was du damit tatsächlich überprüfst

| Gegenstand | Ort und Umfang |
| --- | --- |
| Node-Projekt und Testfehler | Lokal und im GitHub-Job ausführbar. |
| Beweglicher Tag gegenüber vollständigem SHA | Lokal reproduzierbar, ohne GitHub-Zugriff. |
| SHA-Pin, `permissions`, Checkout | Konfiguration liegt bei; tatsächliche Auflösung und Rechte im GitHub-Lauf prüfen. |
| Wiederverwendbarer Workflow | Realer Aufruf auf GitHub; kein lokaler Simulator. |
| Dependabot | GitHub-Dienst; Aktualisierungsstatus und gegebenenfalls Pull Request auf GitHub prüfen. |
| Allowlisting und verpflichtende SHA-Pins | Einstellungen des Repositorys beziehungsweise der Organisation. Sie sind nicht Bestandteil eines ZIPs. |
| OIDC und geschützte Deployments | Erfordern zusätzliche Cloud- und GitHub-Konfiguration. Das Projekt richtet keine Cloud-Rollen oder produktiven Zugänge ein. |
| Workflow dependency lockfiles | Separate GitHub-Funktion mit eigenen Voraussetzungen; das Projekt enthält kein fingiertes `actions.lock`. |

Für diesen Testablauf ist ein echtes GitHub-Repository die einfachste Ergänzung zur lokalen Prüfung. Ein lokaler Workflow-Emulator ist nicht nötig und ersetzt insbesondere keine Prüfung der GitHub-Tokenrechte, Richtlinien oder Dependabot-Läufe.

## 9. Fehlersuche und Dokumentation

| Beobachtung | Nächster Schritt |
| --- | --- |
| `npm.ps1` ist nicht digital signiert | Unter Windows `npm.cmd` verwenden oder eine mitgelieferte VS-Code-Aufgabe starten. |
| `git` oder `node` fehlt im PATH | Werkzeug installieren, VS Code vollständig neu öffnen und Versionsbefehle erneut ausführen. |
| `npm ci` findet keine `package-lock.json` | Den richtigen Projektordner öffnen und das ZIP vollständig entpacken. |
| Nach dem Push kein CI-Lauf | Branchname `main`, `.github/workflows/ci.yml` und Actions-Einstellungen prüfen. Organisationsrichtlinien können die Action blockieren. |
| `Run workflow` fehlt | Den Workflow **Shared CI (manuell)** auswählen und prüfen, dass seine Datei auf dem Defaultbranch liegt. |
| Dependabot erzeugt keinen Pull Request | Update-Status prüfen; ohne neue geeignete Version ist kein PR nötig. |

Für einen Nachweis zum Artikel eignen sich drei Aufnahmen: die lokale Ausgabe von `demo:tags`, der erfolgreiche CI-Lauf mit aufgeklapptem Berechtigungsabschnitt und die Jobansicht des wiederverwendbaren Workflows. Notiere jeweils den Commit deines Test-Repositorys und das Testdatum.

`TESTSTATUS.md` dokumentiert die vor Auslieferung tatsächlich ausgeführten Prüfungen. Ergänze dort deine GitHub-Ergebnisse, bevor du einen vollständigen End-to-End-Test im Artikel beschreibst.

## Quellen zur Ausführung

Abgleich am 14. Oktober 2026. Diese Links erläutern die Testumgebung; sie ändern das Quellenverzeichnis des Artikels nicht.

- [Checkout v7.0.1 und zugehöriger Commit](https://github.com/actions/checkout/releases/tag/v7.0.1)
- [Node.js-Versionen](https://nodejs.org/en/about/previous-releases)
- [Software im Ubuntu-24.04-Runner](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md)
- [Manuelle Workflow-Läufe](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)
- [Wiederverwendbare Workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows)
- [GITHUB_TOKEN und Berechtigungen](https://docs.github.com/en/actions/tutorials/authenticate-with-github_token)
- [Dependabot-Versionupdates konfigurieren und Logs aufrufen](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/configure-version-updates)
