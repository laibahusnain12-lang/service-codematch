/* Medical dataset management UI wiring. */
'use strict';
(function () {
  function $(id) { return document.getElementById(id); }
  let currentRaw = null;
  let currentFormat = null;

  function fileName(el) { return el && el.files && el.files[0] ? el.files[0].name : 'No file selected'; }
  function readAsText(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(r.error);
      r.readAsText(file);
    });
  }
  function readAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(r.error);
      r.readAsArrayBuffer(file);
    });
  }

  async function parseFile(file) {
    const name = file.name.toLowerCase();
    if (name.endsWith('.json')) {
      const text = await readAsText(file);
      return { format: 'json', raw: window.MedicalDatasetManager.parseJSON(text) };
    }
    if (name.endsWith('.csv')) {
      const text = await readAsText(file);
      return { format: 'csv', raw: window.MedicalDatasetManager.parseCSV(text) };
    }
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      const buf = await readAsArrayBuffer(file);
      if (!window.XLSX) throw new Error('Excel reader not available');
      const wb = XLSX.read(buf, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      return { format: 'xlsx', raw: json };
    }
    throw new Error('Unsupported file type');
  }

  function renderPreview(raw) {
    const el = $('dataset-preview');
    if (!el) return;
    if (!raw || !raw.length) { el.hidden = true; el.innerHTML = ''; return; }
    const cols = Object.keys(raw[0]).slice(0, 8);
    let html = '<table class="dataset-table"><thead><tr>' + cols.map(c => '<th>' + c + '</th>').join('') + '</tr></thead><tbody>';
    raw.slice(0, 10).forEach(row => {
      html += '<tr>' + cols.map(c => '<td>' + (row[c] == null ? '' : String(row[c])) + '</td>').join('') + '</tr>';
    });
    html += '</tbody></table><p>Showing ' + Math.min(10, raw.length) + ' of ' + raw.length + ' rows.</p>';
    el.innerHTML = html;
    el.hidden = false;
  }

  function renderVersions() {
    const ul = $('dataset-versions');
    if (!ul || !window.MedicalDatasetManager) return;
    ul.innerHTML = '';
    window.MedicalDatasetManager.registry.list().forEach(ds => {
      const li = document.createElement('li');
      li.textContent = ds.name + ' v' + ds.version + ' (' + ds.recordCount + ' records) — ' + ds.verificationStatus + ' — ' + ds.importedAt;
      ul.appendChild(li);
    });
  }

  function setMessage(msg) { const el = $('dataset-message'); if (el) el.textContent = msg; }

  async function handleFileChange() {
    const file = $('dataset-file').files[0];
    $('dataset-file-name').textContent = fileName($('dataset-file'));
    if (!file) { currentRaw = null; return; }
    try {
      const parsed = await parseFile(file);
      currentRaw = parsed.raw;
      currentFormat = parsed.format;
      setMessage('Loaded ' + currentRaw.length + ' records (' + currentFormat + ').');
      renderPreview(currentRaw);
    } catch (e) {
      currentRaw = null;
      setMessage('Error reading file: ' + e.message);
    }
  }

  function getMeta() {
    return {
      name: $('dataset-name').value.trim(),
      source: $('dataset-source').value.trim(),
      version: $('dataset-version').value.trim(),
      license: $('dataset-license').value.trim(),
      verificationStatus: $('dataset-verification').value
    };
  }

  function preview() {
    if (!currentRaw) { setMessage('No dataset loaded.'); return; }
    renderPreview(currentRaw);
    setMessage('Preview: ' + currentRaw.length + ' records.');
  }

  function validate() {
    if (!currentRaw) { setMessage('No dataset loaded.'); return; }
    const ds = window.MedicalDatasetManager.createDataset(getMeta(), currentRaw, currentFormat);
    if (ds.validation.valid) setMessage('Dataset valid: ' + ds.recordCount + ' records.');
    else setMessage('Validation errors: ' + ds.validation.errors.join('; '));
  }

  function importData() {
    if (!currentRaw) { setMessage('No dataset loaded.'); return; }
    const meta = getMeta();
    if (meta.verificationStatus !== 'verified') {
      setMessage('Import of unverified data blocked. Set verification status to Verified only for reviewed data.');
      return;
    }
    const ds = window.MedicalDatasetManager.createDataset(meta, currentRaw, currentFormat);
    if (!ds.validation.valid) { setMessage('Cannot import: ' + ds.validation.errors.join('; ')); return; }
    window.MedicalDatasetManager.registry.add(ds);
    renderVersions();
    setMessage('Imported dataset "' + ds.name + '" v' + ds.version + ' (' + ds.recordCount + ' records).');
  }

  document.addEventListener('DOMContentLoaded', function () {
    const fileInput = $('dataset-file');
    if (fileInput) fileInput.addEventListener('change', handleFileChange);
    const pb = $('dataset-preview-btn'); if (pb) pb.addEventListener('click', preview);
    const vb = $('dataset-validate-btn'); if (vb) vb.addEventListener('click', validate);
    const ib = $('dataset-import-btn'); if (ib) ib.addEventListener('click', importData);
    renderVersions();
  });
})();
