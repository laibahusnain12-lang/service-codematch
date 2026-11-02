/* Clinical training dataset preparation pipeline. */
'use strict';

const LABELS = ['EQUIVALENT', 'RELATED', 'NOT_EQUIVALENT', 'INSUFFICIENT_INFORMATION'];

function ctpNorm(v) { return (typeof ciNorm === 'function') ? ciNorm(v) : String(v || '').toLowerCase().trim().replace(/\s+/g, ' '); }

function ctpNormalizeRecord(rec) {
  const r = rec || {};
  return {
    id: r.id,
    serviceTerm: ctpNorm(r.serviceTerm),
    standardName: ctpNorm(r.standardName),
    standardCode: String(r.standardCode || '').trim(),
    category: ctpNorm(r.category),
    synonyms: (r.synonyms || []).map(ctpNorm),
    abbreviations: (r.abbreviations || []).map(ctpNorm),
    procedure: ctpNorm(r.procedure),
    specimen: ctpNorm(r.specimen),
    bodySite: ctpNorm(r.bodySite),
    modality: ctpNorm(r.modality),
    method: ctpNorm(r.method),
    verified: !!r.verified
  };
}

function ctpDedupe(records) {
  const seen = new Map();
  const out = [];
  for (const r of records) {
    const key = r.serviceTerm + '|' + r.standardCode;
    if (seen.has(key)) {
      const existing = seen.get(key);
      existing._sourceRefs = existing._sourceRefs || [];
      if (r.sourceRef) existing._sourceRefs.push(r.sourceRef);
    } else {
      const nr = Object.assign({}, r, { _sourceRefs: r.sourceRef ? [r.sourceRef] : [] });
      seen.set(key, nr);
      out.push(nr);
    }
  }
  return out;
}

function ctpDetectConflicts(records) {
  const conflicts = [];
  const byTerm = {};
  for (const r of records) {
    (byTerm[r.serviceTerm] = byTerm[r.serviceTerm] || []).push(r);
  }
  for (const term of Object.keys(byTerm)) {
    const group = byTerm[term];
    const codes = new Set(group.map(r => r.standardCode).filter(Boolean));
    if (codes.size > 1) conflicts.push({ serviceTerm: term, codes: [...codes], reason: 'Multiple standard codes for same term' });
    const cats = new Set(group.map(r => r.category).filter(Boolean));
    if (cats.size > 1) conflicts.push({ serviceTerm: term, categories: [...cats], reason: 'Multiple categories for same term' });
  }
  return conflicts;
}

function ctpConflictBetween(a, b) {
  // returns true if critical clinical conflict
  if (a.category && b.category && a.category !== b.category) return true;
  if (a.modality && b.modality && a.modality !== b.modality) return true;
  if (a.specimen && b.specimen && a.specimen !== b.specimen) return true;
  if (a.method && b.method && a.method !== b.method) return true;
  if (a.bodySite && b.bodySite && a.bodySite !== b.bodySite) return true;
  return false;
}

function ctpLabelPair(a, b) {
  // a, b normalized records
  if (!a.verified || !b.verified) {
    // unverified -> insufficient unless exact same code
    if (a.standardCode && a.standardCode === b.standardCode && a.serviceTerm === b.serviceTerm) return 'EQUIVALENT';
    return 'INSUFFICIENT_INFORMATION';
  }
  if (a.standardCode && a.standardCode === b.standardCode) {
    if (ctpConflictBetween(a, b)) return 'NOT_EQUIVALENT';
    return 'EQUIVALENT';
  }
  if (ctpConflictBetween(a, b)) return 'NOT_EQUIVALENT';
  // same category and some overlap
  if (a.category && a.category === b.category) return 'RELATED';
  return 'NOT_EQUIVALENT';
}

function ctpBuildPairs(records) {
  const recs = records.map(ctpNormalizeRecord);
  const pairs = [];
  for (let i = 0; i < recs.length; i++) {
    for (let j = i + 1; j < recs.length; j++) {
      const a = recs[i], b = recs[j];
      const label = ctpLabelPair(a, b);
      pairs.push({ id: a.id + '::' + b.id, left: a, right: b, label });
    }
  }
  // add hard negatives: same category but conflicting attributes
  const byCat = {};
  for (const r of recs) (byCat[r.category] = byCat[r.category] || []).push(r);
  for (const cat of Object.keys(byCat)) {
    const group = byCat[cat];
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i], b = group[j];
        if (ctpConflictBetween(a, b)) {
          // ensure a NOT_EQUIVALENT pair exists (already added above likely); tag as hard negative
          const existing = pairs.find(p => (p.left.id === a.id && p.right.id === b.id) || (p.left.id === b.id && p.right.id === a.id));
          if (existing) existing.hardNegative = true;
        }
      }
    }
  }
  return pairs;
}

function ctpSplitHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) >>> 0; }
  return h;
}

function ctpSplitPairs(pairs, ratios) {
  ratios = ratios || { train: 0.7, val: 0.15, test: 0.15 };
  // group by unordered pair key to prevent leakage
  const groups = {};
  for (const p of pairs) {
    const key = [p.left.id, p.right.id].sort().join('|');
    const bucket = ctpSplitHash(key) % 100;
    let split = 'train';
    if (bucket >= (ratios.train * 100) && bucket < ((ratios.train + ratios.val) * 100)) split = 'val';
    else if (bucket >= ((ratios.train + ratios.val) * 100)) split = 'test';
    p.split = split;
  }
  const out = { train: [], val: [], test: [] };
  for (const p of pairs) out[p.split].push(p);
  return out;
}

function ctpPrepare(records) {
  const normalized = records.map(ctpNormalizeRecord);
  const deduped = ctpDedupe(normalized);
  const conflicts = ctpDetectConflicts(deduped);
  const pairs = ctpBuildPairs(deduped);
  const splits = ctpSplitPairs(pairs);
  return {
    recordCount: records.length,
    dedupedCount: deduped.length,
    conflicts,
    pairs,
    splits,
    labels: LABELS
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.ClinicalTrainingPipeline = {
    labels: LABELS,
    normalizeRecord: ctpNormalizeRecord,
    dedupe: ctpDedupe,
    detectConflicts: ctpDetectConflicts,
    conflictBetween: ctpConflictBetween,
    labelPair: ctpLabelPair,
    buildPairs: ctpBuildPairs,
    splitPairs: ctpSplitPairs,
    prepare: ctpPrepare
  };
}
if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.ClinicalTrainingPipeline;