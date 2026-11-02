const fs = require('fs');
const path = require('path');
const vm = require('vm');

function load(files) {
  const ctx = vm.createContext({ console, setTimeout, clearTimeout, Map, Set, Math, JSON, String, Number, Object, Array, Date, Intl, RegExp, Promise });
  ctx.self = ctx;
  ctx.globalThis = ctx;
  for (const f of files) {
    const code = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    vm.runInContext(code, ctx, { filename: f });
  }
  return ctx;
}

const ctx = load(['clinical-interpreter.js', 'medical-dataset-manager.js', 'clinical-training-pipeline.js', 'clinical-evaluation.js', 'reviewer-feedback.js']);

// Dataset import test
const csv = 'serviceTerm,standardName,standardCode,category,verified\nCT Chest,CT Chest,CT001,radiology,true\nCT Chest,CT Chest,CT001,radiology,true\nMRI Brain,MRI Brain,MR001,radiology,true';
const ds = ctx.MedicalDatasetManager.importText(csv, 'csv', { name: 'Test DS', source: 'unit', version: '1.0', license: 'MIT', verificationStatus: 'verified' });
console.log('dataset records:', ds.recordCount, 'valid:', ds.validation.valid);
if (ds.recordCount !== 3) throw new Error('Expected 3 records');
if (!ds.validation.valid) throw new Error('Expected valid dataset');

// Training pipeline test
const prep = ctx.ClinicalTrainingPipeline.prepare(ds.records);
console.log('deduped:', prep.dedupedCount, 'pairs:', prep.pairs.length, 'conflicts:', prep.conflicts.length);
if (prep.dedupedCount !== 2) throw new Error('Expected 2 deduped records');
if (!prep.splits.train.length && !prep.splits.val.length && !prep.splits.test.length) throw new Error('Expected splits');

// Evaluation test
const gold = [{ expectedCode: 'CT001', label: 'EQUIVALENT', category: 'radiology', acceptableCodes: ['CT001'] }];
const preds = [{ predictedCode: 'CT001', predictedLabel: 'EQUIVALENT', candidateCodes: ['CT001'], autoApproved: true }];
const m = ctx.ClinicalEvaluation.evaluate(gold, preds);
console.log('precision:', m.precision, 'recall:', m.recall, 'f1:', m.f1);
if (m.precision !== 1) throw new Error('Expected precision 1');

// Feedback test
const fb = ctx.ReviewerFeedback.store.add({ originalService: 'CT chest', candidateStandardService: 'CT Chest', candidateStandardCode: 'CT001', reviewerDecision: 'approved', reason: 'match', reviewerRole: 'reviewer', datasetVersion: '1.0', modelVersion: 'v1', catalogueVersion: 'v1' });
console.log('feedback id:', fb.id);
if (!fb.id) throw new Error('Feedback entry missing id');
const ex = ctx.ReviewerFeedback.store.toTrainingExamples();
if (ex.length !== 1) throw new Error('Expected 1 training example');

console.log('PASS: dataset, pipeline, evaluation, feedback');