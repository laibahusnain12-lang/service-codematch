/* Clinical conflict detection module (separate from interpretation). */
'use strict';
function ccdDetectConflicts(input, candidate) {
  if (typeof assessClinicalEquivalence === 'function') {
    const a = assessClinicalEquivalence(input, candidate);
    return {
      conflicts: a.conflicts || [],
      criticalConflicts: a.criticalConflicts || [],
      missing: a.missing || [],
      compatible: a.compatible === true
    };
  }
  return { conflicts: [], criticalConflicts: [], missing: [], compatible: true };
}
const ClinicalConflictDetector = { detect: ccdDetectConflicts, version: 'conflict-detector-v1' };
if (typeof globalThis !== 'undefined') globalThis.ClinicalConflictDetector = ClinicalConflictDetector;
if (typeof module !== 'undefined' && module.exports) module.exports = ClinicalConflictDetector;