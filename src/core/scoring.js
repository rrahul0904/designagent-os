export function scoreFindings(findings = []) {
  const penalty = findings.reduce((sum, finding) => sum + finding.severity, 0);
  const score = Math.max(0, Math.min(100, 100 - penalty));

  return {
    score,
    grade:
      score >= 90 ? "A" :
      score >= 80 ? "B" :
      score >= 70 ? "C" :
      score >= 60 ? "D" : "F",
    penalty
  };
}
