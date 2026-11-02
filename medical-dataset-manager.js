/* Medical dataset management for the Service Code Match Portal. */
'use strict';

const MEDICAL_DATASET_SCHEMA = {
  datasetId: 'string',
  name: 'string',
  source: 'string',
  version: 'string',
  license: 'string',
  verificationStatus: 'string', // unverified | partially_verified | verified
  importedAt: 'string',
  recordCount: 'number',
  records: 'array'
};

const MEDICAL_RECORD_SCHEMA = {
  id: 'string',
  serviceTerm: 'string',
  standardName: 'string',
  standardCode: 'string',
  category: 'string',
  synonyms: 'array',
  abbreviations: 'array',
  procedure: 'string',
  specimen: 'string',
  bodySite: 'string',
  modality: 'string',
  method: 'string',
  equivalents: 'array', // [{standardCode, label}]
  sourceRef: 'string', // sheet/row
  verified: 'boolean'
};

function mdmNow() { return new Date().toISOString(); }

function mdmParseCSV(text) {
  const lines = String(text || '').split(/\r?\n/).filter(l => l.trim() !== '');
  if (!lines.length) return [];
  const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    const obj = {};
    header.forEach((h, idx) => { obj[h] = cols[idx] != null ? cols[idx] : ''; });
    rows.push(obj);
  }
  return rows;
}

function mdmParseJSON(text) {
  try { const v = JSON.parse(text); return Array.isArray(v) ? v : (v.records || v.data || []); }
  catch (e) { return []; }
}

function mdmNormalizeRecord(raw, index) {
  const r = raw || {};
  return {
    id: String(r.id || r.ID || ('rec-' + index)),
    serviceTerm: String(r.serviceTerm || r['Service Name'] || r.name || r.term || '').trim(),
    standardName: String(r.standardName || r['Standard Service'] || r.standard || '').trim(),
    standardCode: String(r.standardCode || r['Standard Code'] || r.code || '').trim(),
    category: String(r.category || r.Category || r.group || '').trim().toLowerCase(),
    synonyms: Array.isArray(r.synonyms) ? r.synonyms : String(r.synonyms || '').split(/[;,]/).map(s => s.trim()).filter(Boolean),
    abbreviations: Array.isArray(r.abbreviations) ? r.abbreviations : String(r.abbreviations || '').split(/[;,]/).map(s => s.trim()).filter(Boolean),
    procedure: String(r.procedure || r.Procedure || '').trim(),
    specimen: String(r.specimen || r.Specimen || '').trim(),
    bodySite: String(r.bodySite || r['Body Site'] || r.site || '').trim(),
    modality: String(r.modality || r.Modality || '').trim(),
    method: String(r.method || r.Method || r.testingMethod || '').trim(),
    equivalents: Array.isArray(r.equivalents) ? r.equivalents : [],
    sourceRef: String(r.sourceRef || r.source || r.row || '').trim(),
    verified: r.verified === true || String(r.verified || '').toLowerCase() === 'true' || String(r.verified || '').toLowerCase() === 'yes'
  };
}

function mdmValidateDataset(dataset) {
  const errors = [];
  if (!dataset || typeof dataset !== 'object') { errors.push('Dataset must be an object.'); return { valid: false, errors }; }
  if (!dataset.name) errors.push('Dataset name is required.');
  if (!dataset.source) errors.push('Dataset source is required.');
  if (!dataset.version) errors.push('Dataset version is required.');
  if (!dataset.license) errors.push('Dataset license is required.');
  if (!Array.isArray(dataset.records)) errors.push('Dataset records must be an array.');
  (dataset.records || []).forEach((rec, idx) => {
    if (!rec.serviceTerm && !rec.standardName) errors.push('Record ' + idx + ' is missing serviceTerm/standardName.');
  });
  return { valid: errors.length === 0, errors };
}

function mdmCreateDataset(meta, rawRecords, format) {
  const records = (rawRecords || []).map((r, i) => mdmNormalizeRecord(r, i));
  const dataset = {
    datasetId: 'ds-' + Date.now(),
    name: String(meta && meta.name || 'Untitled dataset'),
    source: String(meta && meta.source || 'unknown'),
    version: String(meta && meta.version || '1.0'),
    license: String(meta && meta.license || 'unspecified'),
    verificationStatus: String(meta && meta.verificationStatus || 'unverified'),
    importedAt: mdmNow(),
    format: format || 'unknown',
    recordCount: records.length,
    records
  };
  const v = mdmValidateDataset(dataset);
  dataset.validation = v;
  return dataset;
}

function mdmImportText(text, format, meta) {
  let raw = [];
  if (format === 'json') raw = mdmParseJSON(text);
  else if (format === 'csv') raw = mdmParseCSV(text);
  else {
    // try json then csv
    raw = mdmParseJSON(text);
    if (!raw.length) raw = mdmParseCSV(text);
  }
  return mdmCreateDataset(meta, raw, format);
}

// In-memory registry
const MedicalDatasetRegistry = {
  datasets: [],
  add(ds) { this.datasets.push(ds); return ds; },
  list() { return this.datasets.slice(); },
  get(id) { return this.datasets.find(d => d.datasetId === id) || null; },
  remove(id) { this.datasets = this.datasets.filter(d => d.datasetId !== id); }
};

if (typeof globalThis !== 'undefined') {
  globalThis.MedicalDatasetManager = {
    schema: MEDICAL_DATASET_SCHEMA,
    recordSchema: MEDICAL_RECORD_SCHEMA,
    parseCSV: mdmParseCSV,
    parseJSON: mdmParseJSON,
    normalizeRecord: mdmNormalizeRecord,
    validateDataset: mdmValidateDataset,
    createDataset: mdmCreateDataset,
    importText: mdmImportText,
    registry: MedicalDatasetRegistry
  };
}
if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.MedicalDatasetManager;