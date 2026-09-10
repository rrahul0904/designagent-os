import { extractDesignDNA } from "./design-dna.js";
import { auditSource } from "./anti-patterns.js";
import { scoreFindings } from "./scoring.js";

export function analyzeSource(source = "", metadata = {}) {
  const designDNA = extractDesignDNA(source);
  const findings = auditSource(source);
  const quality = scoreFindings(findings);

  return {
    version: "0.1.0",
    metadata,
    quality,
    designDNA,
    findings,
    recommendations: findings.map(f => ({
      rule: f.id,
      recommendation: `Review and remediate: ${f.message}`
    }))
  };
}
