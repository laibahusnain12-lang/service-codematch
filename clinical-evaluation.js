/* Clinical matching evaluation metrics. */
'use strict';

function cevSafeDiv(a, b) { return b ? a / b : 0; }

function cevEvaluate(gold, predictions) {
  // gold: array of {id, expectedLabel? or expectedCode?}
  // predictions: array aligned, each {candidateCodes:[], predictedLabel, predictedCode, confidence, category}
  // We support code-based equivalence: a prediction is correct if predictedCode in expected acceptable set.
  let tp = 0, fp = 0, fn = 0, tn = 0;
  let top3Hits = 0;
  let incorrectEquiv = 0;
  const byCategory = {};
  gold.forEach((g, i) => {
    const p = predictions[i] || {};
    const expectedCodes = Array.isArray(g.acceptableCodes) ? g.acceptableCodes : (g.expectedCode ? [g.expectedCode] : []);
    const predictedCode = p.predictedCode || (p.candidateCodes && p.candidateCodes[0]) || '';
    const isEquivPred = p.predictedLabel === 'EQUIVALENT' || (p.autoApproved === true);
    const actuallyEquiv = g.label === 'EQUIVALENT' || g.isEquivalent === true;
    if (isEquivPred && actuallyEquiv) tp++;
    if (isEquivPred && !actuallyEquiv) { fp++; incorrectEquiv++; }
    if (!isEquivPred && actuallyEquiv) fn++;
    if (!isEquivPred && !actuallyEquiv) tn++;
    const cands = Array.isArray(p.candidateCodes) ? p.candidateCodes : (predictedCode ? [predictedCode] : []);
    if (expectedCodes.length && expectedCodes.some(c => cands.slice(0, 3).includes(c))) top3Hits++;
    const cat = g.category || 'unknown';
    if (!byCategory[cat]) byCategory[cat] = { total: 0, tp: 0, fp: 0, fn: 0, tn: 0, top3: 0 };
    byCategory[cat].total++;
    if (isEquivPred && actuallyEquiv) byCategory[cat].tp++;
    if (isEquivPred && !actuallyEquiv) byCategory[cat].fp++;
    if (!isEquivPred && actuallyEquiv) byCategory[cat].fn++;
    if (!isEquivPred && !actuallyEquiv) byCategory[cat].tn++;
    if (expectedCodes.length && expectedCodes.some(c => cands.slice(0, 3).includes(c))) byCategory[cat].top3++;
  });
  const precision = cevSafeDiv(tp, tp + fp);
  const recall = cevSafeDiv(tp, tp + fn);
  const f1 = cevSafeDiv(2 * precision * recall, precision + recall);
  const top3Accuracy = cevSafeDiv(top3Hits, gold.length);
  const fpr = cevSafeDiv(fp, fp + tn);
  const incorrectEquivRate = cevSafeDiv(incorrectEquiv, gold.length);
  return {
    total: gold.length,
    tp, fp, fn, tn,
    precision, recall, f1,
    top3Accuracy,
    falsePositiveRate: fpr,
    incorrectEquivalenceRate: incorrectEquivRate,
    byCategory
  };
}

if (typeof globalThis !== 'undefined') globalThis.ClinicalEvaluation = { evaluate: cevEvaluate };
if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.ClinicalEvaluation;