const fs = require('fs');
const path = require('path');

const base = path.resolve(__dirname, '..');
const datasets = path.join(base, 'dev', 'datasets', 'verified');
const outDir = path.join(base, 'dev', 'model-outputs');

fs.mkdirSync(outDir, { recursive: true });
console.log('Training medical matching model...');

const dataset = JSON.parse(fs.readFileSync(path.join(datasets, 'verified-clinical-dataset.json'), 'utf8'));
const records = dataset.records;
console.log('Loaded', records.length, 'records');

function extractFeatures(rec) {
  const feats = {};
  const mod = rec.modality || '';
  const spec = rec.specimen || '';
  const site = rec.bodySite || '';
  const meth = rec.method || '';
  const cat = rec.category || '';

  feats.mod_ct = mod.includes('computed tomography') ? 1 : 0;
  feats.mod_mri = mod.includes('magnetic resonance') ? 1 : 0;
  feats.mod_echo = mod.includes('echo') || mod.includes('echocardiography') ? 1 : 0;
  feats.mod_ecg = mod.includes('ecg') || mod.includes('ekg') || mod.includes('electrocardiogram') ? 1 : 0;
  feats.mod_usg = mod.includes('ultrasound') || mod.includes('ultrasonography') ? 1 : 0;
  feats.mod_xray = mod.includes('radiograph') || mod.includes('x ray') || mod.includes('xray') ? 1 : 0;
  feats.mod_laser = mod.includes('laser') ? 1 : 0;
  feats.mod_culture = (mod.includes('culture') || mod.includes('microbiology')) ? 1 : 0;
  feats.mod_haem = mod.includes('hemogram') || mod.includes('complete blood') ? 1 : 0;
  feats.mod_psycho = mod.includes('laser') || mod.includes('photobiomod') ? 1 : 0;
  feats.mod_epila = mod.includes('epilation') || mod.includes('wax') ? 1 : 0;
  feats.mod_biopsy = mod.includes('biopsy') || mod.includes('fine needle') ? 1 : 0;
  feats.mod_oct = mod.includes('optical coherence') || mod.includes('oct') ? 1 : 0;
  feats.mod_endoscopy = mod.includes('endoscopy') || mod.includes('nasal') ? 1 : 0;
  feats.mod_dental = mod.includes('dental laser') || mod.includes('orthopantomogram') || mod.includes('bitewing') ? 1 : 0;
  feats.mod_chem = mod.includes('chemical peel') || mod.includes('peel') ? 1 : 0;

  feats.spec_urine = spec.includes('urine') ? 1 : 0;
  feats.spec_blood = spec.includes('blood') ? 1 : 0;
  feats.spec_tissue = spec.includes('tissue') ? 1 : 0;
  feats.spec_cells = spec.includes('cells') ? 1 : 0;
  feats.spec_none = spec.includes('none') ? 1 : 0;

  feats.site_chest = site.includes('chest') ? 1 : 0;
  feats.site_brain = site.includes('brain') ? 1 : 0;
  feats.site_heart = site.includes('heart') ? 1 : 0;
  feats.site_abdomen = site.includes('abdomen') ? 1 : 0;
  feats.site_skin = site.includes('skin') ? 1 : 0;
  feats.site_nasal = site.includes('nasal') ? 1 : 0;
  feats.site_retina = site.includes('retina') ? 1 : 0;
  feats.site_jaw = site.includes('jaw') ? 1 : 0;
  feats.site_musculoskeletal = site.includes('musculoskeletal') ? 1 : 0;
  feats.site_variable = site.includes('variable') ? 1 : 0;
  feats.site_urinary = site.includes('urinary') ? 1 : 0;

  feats.meth_culture = (meth.includes('culture') || meth.includes('microbiology')) ? 1 : 0;
  feats.meth_microscopy = meth.includes('microscopy') ? 1 : 0;
  feats.meth_enzymatic = meth.includes('enzymatic') ? 1 : 0;
  feats.meth_doppler = meth.includes('doppler') ? 1 : 0;
  feats.meth_laser = meth.includes('laser') ? 1 : 0;
  feats.meth_excision = meth.includes('excision') ? 1 : 0;
  feats.meth_core_needle = meth.includes('core needle') || meth.includes('core biopsy') ? 1 : 0;
  feats.meth_fine_needle = meth.includes('fine needle') ? 1 : 0;
  feats.meth_treadmill = meth.includes('treadmill') ? 1 : 0;
  feats.meth_protocol = meth.includes('protocol') ? 1 : 0;
  feats.meth_color_fundus = meth.includes('color fundus') ? 1 : 0;
  feats.meth_flexible = meth.includes('flexible') ? 1 : 0;
  feats.meth_panoramic = meth.includes('panoramic') ? 1 : 0;
  feats.meth_interproximal = meth.includes('interproximal') ? 1 : 0;
  feats.meth_chemical = meth.includes('chemical') ? 1 : 0;

  feats.cat_lab = cat === 'laboratory' ? 1 : 0;
  feats.cat_rad = cat === 'radiology' ? 1 : 0;
  feats.cat_card = cat === 'cardiology' ? 1 : 0;
  feats.cat_surg = cat === 'surgery' ? 1 : 0;
  feats.cat_phys = cat === 'physiotherapy' ? 1 : 0;
  feats.cat_path = cat === 'pathology' ? 1 : 0;
  feats.cat_opth = cat === 'ophthalmology' ? 1 : 0;
  feats.cat_ent = cat === 'ent' ? 1 : 0;
  feats.cat_dent = cat === 'dentistry' ? 1 : 0;
  feats.cat_derm = cat === 'dermatology' ? 1 : 0;

  feats.has_abbr = rec.abbreviations && rec.abbreviations.length > 0 ? 1 : 0;
  feats.has_syn = rec.synonyms && rec.synonyms.length > 0 ? 1 : 0;
  feats.has_procedure = rec.procedure && rec.procedure.length > 0 ? 1 : 0;
  feats.has_bodySite = rec.bodySite && rec.bodySite.length > 0 ? 1 : 0;
  feats.has_method = rec.method && rec.method.length > 0 ? 1 : 0;

  return feats;
}

const featKeys = Object.keys(extractFeatures(records[0]));
console.log('Feature count:', featKeys.length);

function vec(rec) {
  return featKeys.map(function(k) { return extractFeatures(rec)[k] ? 1.0 : 0.0; });
}

const labeledPairs = [];
const byId = {};
for (let i = 0; i < records.length; i++) { byId[records[i].id] = records[i]; }

const codeMap = {};
for (let i = 0; i < records.length; i++) {
  if (records[i].standardCode) {
    if (!codeMap[records[i].standardCode]) codeMap[records[i].standardCode] = [];
    codeMap[records[i].standardCode].push(records[i]);
  }
}
for (const code of Object.keys(codeMap)) {
  const group = codeMap[code];
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      labeledPairs.push({ left: group[i], right: group[j], label: 'EQUIVALENT', source: 'same_standard_code' });
    }
  }
}

const hardNegIds = [
  ['phys-001', 'phys-002'],
  ['rad-001', 'rad-004'],
  ['rad-005', 'rad-002'],
  ['rad-002', 'rad-003'],
  ['rad-006', 'rad-007'],
  ['lab-001', 'lab-002'],
  ['lab-003', 'lab-004'],
  ['surg-001', 'surg-002'],
  ['path-001', 'path-002']
];
for (let i = 0; i < hardNegIds.length; i++) {
  const l = hardNegIds[i][0]; const r = hardNegIds[i][1];
  if (byId[l] && byId[r]) {
    labeledPairs.push({ left: byId[l], right: byId[r], label: 'NOT_EQUIVALENT', source: 'clinical_hard_negative' });
  }
}

if (byId['lab-004'] && byId['path-003']) {
  labeledPairs.push({ left: byId['lab-004'], right: byId['path-003'], label: 'EQUIVALENT', source: 'clinical_positive_pair' });
}

console.log('Total labeled pairs:', labeledPairs.length);
console.log('Equivalent:', labeledPairs.filter(p => p.label === 'EQUIVALENT').length);
console.log('Not equivalent:', labeledPairs.filter(p => p.label === 'NOT_EQUIVALENT').length);

function splitHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

const trainPairs = [];
const valPairs = [];
const testPairs = [];
for (const p of labeledPairs) {
  const key = p.left.id + '|' + p.right.id;
  const bucket = splitHash(key) % 100;
  if (bucket < 70) trainPairs.push(p);
  else if (bucket < 85) valPairs.push(p);
  else testPairs.push(p);
}
console.log('Split - train:', trainPairs.length, 'val:', valPairs.length, 'test:', testPairs.length);

const lr = {
  learningRate: 0.01,
  epochs: 300,
  weights: new Array(featKeys.length).fill(0.0),
  bias: 0.0
};

function sigmoid(z) { return 1.0 / (1.0 + Math.exp(-Math.max(-50, Math.min(50, z)))); }
function predict(vec) {
  let z = lr.bias;
  for (let i = 0; i < lr.weights.length; i++) z += lr.weights[i] * vec[i];
  return sigmoid(z);
}
console.log('Training logistic regression...');
for (let epoch = 0; epoch < lr.epochs; epoch++) {
  let totalLoss = 0;
  for (const p of trainPairs) {
    const v1 = vec(p.left);
    const v2 = vec(p.right);
    const x = new Array(v1.length);
    for (let i = 0; i < v1.length; i++) x[i] = (v1[i] + v2[i]) / 2.0;
    const y = p.label === 'EQUIVALENT' ? 1.0 : 0.0;
    const pred = predict(x);
    const err = pred - y;
    totalLoss += -(y * Math.log(pred + 1e-8) + (1 - y) * Math.log(1 - pred + 1e-8));
    for (let i = 0; i < lr.weights.length; i++) lr.weights[i] -= lr.learningRate * err * x[i];
    lr.bias -= lr.learningRate * err;
  }
  if ((epoch + 1) % 50 === 0) {
    console.log('  Epoch', epoch + 1, 'loss', totalLoss / trainPairs.length);
  }
}

function evaluate(pairs, name) {
  let tp = 0, fp = 0, fn = 0, tn = 0;
  for (const p of pairs) {
    const v1 = vec(p.left);
    const v2 = vec(p.right);
    const x = new Array(v1.length);
    for (let i = 0; i < v1.length; i++) x[i] = (v1[i] + v2[i]) / 2.0;
    const pred = predict(x);
    const y = p.label === 'EQUIVALENT' ? 1.0 : 0.0;
    const predLabel = pred >= 0.5 ? 'EQUIVALENT' : 'NOT_EQUIVALENT';
    if (predLabel === 'EQUIVALENT' && y === 1.0) tp++;
    else if (predLabel === 'EQUIVALENT') fp++;
    else if (y === 1.0) fn++;
    else tn++;
  }
  const precision = tp / (tp + fp) || 0;
  const recall = tp / (tp + fn) || 0;
  const f1 = (precision + recall) > 0 ? 2 * precision * recall / (precision + recall) : 0;
  return { split: name, total: pairs.length, tp, fp, fn, tn, precision, recall, f1 };
}

const trainMetrics = evaluate(trainPairs, 'train');
const valMetrics = evaluate(valPairs, 'val');
const testMetrics = evaluate(testPairs, 'test');
console.log('Train metrics:', JSON.stringify(trainMetrics));
console.log('Val metrics:', JSON.stringify(valMetrics));
console.log('Test metrics:', JSON.stringify(testMetrics));

const model = {
  modelVersion: 'clinical-hybrid-v1',
  trainingDate: new Date().toISOString(),
  featureCount: featKeys.length,
  featureNames: featKeys,
  weights: lr.weights,
  bias: lr.bias,
  threshold: 0.5,
  metricSummary: { train: trainMetrics, val: valMetrics, test: testMetrics },
  recordCount: records.length,
  positivePairs: labeledPairs.filter(p => p.label === 'EQUIVALENT').length,
  negativePairs: labeledPairs.filter(p => p.label === 'NOT_EQUIVALENT').length,
  validation: {
    source: 'verified clinical service catalogues and internal clinical terminology review',
    notes: 'Training on verified examples only; no auto-matching results used as ground truth.'
  }
};

fs.writeFileSync(path.join(outDir, 'clinical-hybrid-model.json'), JSON.stringify(model, null, 2));
console.log('Model saved to', path.join(outDir, 'clinical-hybrid-model.json'));
