// Kleine Beispielanwendung für die CI-Tests. Bewusst kein vollständiger SemVer-Parser.
export function releaseLabel(project, version) {
  if (typeof project !== 'string' || project.trim() === '') {
    throw new TypeError('Ein Projektname ist erforderlich.');
  }
  if (typeof version !== 'string' || !/^\d+\.\d+\.\d+$/.test(version)) {
    throw new TypeError('Die Demo erwartet eine Version im Format X.Y.Z.');
  }
  return `${project.trim()} v${version}`;
}
