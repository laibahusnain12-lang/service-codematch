/* Reviewer feedback capture for future training. */
'use strict';

function rfbNorm(v) { return String(v == null ? '' : v).trim(); }

function rfbCreateEntry(input) {
  const e = input || {};
  return {
    id: 'fb-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    originalService: rfbNorm(e.originalService),
    candidateStandardService: rfbNorm(e.candidateStandardService),
    candidateStandardCode: rfbNorm(e.candidateStandardCode),
    reviewerDecision: rfbNorm(e.reviewerDecision), // approved | rejected | needs_changes
    reason: rfbNorm(e.reason),
    reviewerRole: rfbNorm(e.reviewerRole || e.reviewerIdentity),
    datasetVersion: rfbNorm(e.datasetVersion),
    modelVersion: rfbNorm(e.modelVersion),
    catalogueVersion: rfbNorm(e.catalogueVersion),
    clinicalEvidence: e.clinicalEvidence || null,
    createdAt: new Date().toISOString()
  };
}

const ReviewerFeedbackStore = {
  entries: [],
  add(entry) { const e = rfbCreateEntry(entry); this.entries.push(e); return e; },
  list() { return this.entries.slice(); },
  toTrainingExamples() {
    return this.entries.map(e => ({
      left: { serviceTerm: e.originalService },
      right: { serviceTerm: e.candidateStandardService, standardCode: e.candidateStandardCode },
      label: e.reviewerDecision === 'approved' ? 'EQUIVALENT' : (e.reviewerDecision === 'rejected' ? 'NOT_EQUIVALENT' : 'INSUFFICIENT_INFORMATION'),
      reviewerReason: e.reason,
      source: 'reviewer_feedback',
      datasetVersion: e.datasetVersion,
      modelVersion: e.modelVersion
    }));
  },
  exportJSON() { return JSON.stringify(this.entries, null, 2); }
};

if (typeof globalThis !== 'undefined') globalThis.ReviewerFeedback = { createEntry: rfbCreateEntry, store: ReviewerFeedbackStore };
if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.ReviewerFeedback;