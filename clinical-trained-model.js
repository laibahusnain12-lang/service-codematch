
/* Trained clinical matching model - browser-compatible inference.
   Generated offline from verified clinical service catalogues.
   No training controls exposed to portal users. */
'use strict';

const ClinicalTrainedModel = {
  modelVersion: "clinical-hybrid-v1",
  featureCount: 62,
  featureNames: ["mod_ct", "mod_mri", "mod_echo", "mod_ecg", "mod_usg", "mod_xray", "mod_laser", "mod_culture", "mod_haem", "mod_psycho", "mod_epila", "mod_biopsy", "mod_oct", "mod_endoscopy", "mod_dental", "mod_chem", "spec_urine", "spec_blood", "spec_tissue", "spec_cells", "spec_none", "site_chest", "site_brain", "site_heart", "site_abdomen", "site_skin", "site_nasal", "site_retina", "site_jaw", "site_musculoskeletal", "site_variable", "site_urinary", "meth_culture", "meth_microscopy", "meth_enzymatic", "meth_doppler", "meth_laser", "meth_excision", "meth_core_needle", "meth_fine_needle", "meth_treadmill", "meth_protocol", "meth_color_fundus", "meth_flexible", "meth_panoramic", "meth_interproximal", "meth_chemical", "cat_lab", "cat_rad", "cat_card", "cat_surg", "cat_phys", "cat_path", "cat_opth", "cat_ent", "cat_dent", "cat_derm", "has_abbr", "has_syn", "has_procedure", "has_bodySite", "has_method"],
  weights: [-0.3258144557360114, 0, 0, 0, 0, -0.11292296533118243, 0, -0.20507058285731927, 0, 0, 0, 0, 0, 0, 0, 0, -0.41014116571463854, 1.7121142492798664, -0.2167007348233673, -0.2167007348233673, -0.7439716001459356, -0.4387374210671945, 0, 0, -0.39248913130561564, -0.1526170895393712, 0, 0, 0, -0.1526170895393712, -0.4334014696467346, -0.41014116571463854, -0.20507058285731927, -0.20507058285731927, 0, 0, -0.1526170895393712, -0.2167007348233673, -0.2167007348233673, -0.2167007348233673, 0, 0, 0, 0, 0, 0, 0, 0.44591595892529384, -0.4387374210671945, 0, -0.39248913130561564, -0.3052341790787424, 0.42265565499319774, 0, 0, 0, 0, -0.26788911753306044, -0.26788911753306044, -0.26788911753306044, -0.26788911753306044, -0.26788911753306044],
  bias: -0.26788911753306044,
  threshold: 0.5,

  extractAttrsFromRecord: function(rec) {
    const feats = {};
    const mod = String(rec.modality || '').toLowerCase();
    const spec = String(rec.specimen || '').toLowerCase();
    const site = String(rec.bodySite || '').toLowerCase();
    const meth = String(rec.method || '').toLowerCase();
    const cat = String(rec.category || '').toLowerCase();

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

    feats.has_abbr = (rec.abbreviations && rec.abbreviations.length > 0) ? 1 : 0;
    feats.has_syn = (rec.synonyms && rec.synonyms.length > 0) ? 1 : 0;
    feats.has_procedure = (rec.procedure && rec.procedure.length > 0) ? 1 : 0;
    feats.has_bodySite = (rec.bodySite && rec.bodySite.length > 0) ? 1 : 0;
    feats.has_method = (rec.method && rec.method.length > 0) ? 1 : 0;

    return feats;
  },

  featureVector: function(attrs) {
    return this.featureNames.map(function(k) { return attrs[k] ? 1.0 : 0.0; });
  },

  sigmoid: function(z) {
    return 1.0 / (1.0 + Math.exp(-Math.max(-50, Math.min(50, z))));
  },

  /* Score clinical equivalence between input attributes and candidate attributes.
     Returns a probability 0-1 that the two services are clinically equivalent. */
  score: function(inputAttrs, candidateAttrs) {
    const v1 = this.featureVector(inputAttrs);
    const v2 = this.featureVector(candidateAttrs);
    const x = new Array(v1.length);
    for (let i = 0; i < v1.length; i++) x[i] = (v1[i] + v2[i]) / 2.0;
    let z = this.bias;
    for (let i = 0; i < this.weights.length; i++) z += this.weights[i] * x[i];
    return this.sigmoid(z);
  },

  /* Extract structured clinical attributes from a service name string for model scoring. */
  extractFromServiceName: function(name) {
    const text = String(name || '').toLowerCase();
    const attrs = {};
    this.featureNames.forEach(k => { attrs[k] = 0; });

    // Modality detection
    if (text.includes('computed tomography') || text.includes('ct scan') || text.includes(' ct ')) attrs.mod_ct = 1;
    if (text.includes('magnetic resonance') || text.includes('mri')) attrs.mod_mri = 1;
    if (text.includes('echo') || text.includes('echocardiography')) attrs.mod_echo = 1;
    if (text.includes('ecg') || text.includes('ekg') || text.includes('electrocardiogram')) attrs.mod_ecg = 1;
    if (text.includes('ultrasound') || text.includes('ultrasonography')) attrs.mod_usg = 1;
    if (text.includes('radiograph') || text.includes('x ray') || text.includes('xray')) attrs.mod_xray = 1;
    if (text.includes('laser')) attrs.mod_laser = 1;
    if (text.includes('culture') || text.includes('microbiology')) attrs.mod_culture = 1;
    if (text.includes('hemogram') || text.includes('complete blood')) attrs.mod_haem = 1;
    if (text.includes('biopsy') || text.includes('fine needle')) attrs.mod_biopsy = 1;
    if (text.includes('oct') || text.includes('optical coherence')) attrs.mod_oct = 1;
    if (text.includes('endoscopy') || text.includes('nasal endoscopy')) attrs.mod_endoscopy = 1;
    if (text.includes('orthopantomogram') || text.includes('opg') || text.includes('bitewing')) attrs.mod_dental = 1;
    if (text.includes('chemical peel')) attrs.mod_chem = 1;

    // Specimen
    if (text.includes('urine')) attrs.spec_urine = 1;
    if (text.includes('blood')) attrs.spec_blood = 1;
    if (text.includes('tissue')) attrs.spec_tissue = 1;
    if (text.includes('cells')) attrs.spec_cells = 1;
    if (!text.includes('urine') && !text.includes('blood') && !text.includes('tissue') && !text.includes('cells')) attrs.spec_none = 1;

    // Body site
    if (text.includes('chest')) attrs.site_chest = 1;
    if (text.includes('brain')) attrs.site_brain = 1;
    if (text.includes('heart')) attrs.site_heart = 1;
    if (text.includes('abdomen')) attrs.site_abdomen = 1;
    if (text.includes('skin')) attrs.site_skin = 1;
    if (text.includes('nasal')) attrs.site_nasal = 1;
    if (text.includes('retina')) attrs.site_retina = 1;
    if (text.includes('jaw')) attrs.site_jaw = 1;
    if (text.includes('musculoskeletal')) attrs.site_musculoskeletal = 1;
    if (text.includes('urinary')) attrs.site_urinary = 1;

    // Method
    if (text.includes('culture') || text.includes('microbiology')) attrs.meth_culture = 1;
    if (text.includes('microscopy')) attrs.meth_microscopy = 1;
    if (text.includes('enzymatic')) attrs.meth_enzymatic = 1;
    if (text.includes('doppler')) attrs.meth_doppler = 1;
    if (text.includes('laser')) attrs.meth_laser = 1;
    if (text.includes('excision')) attrs.meth_excision = 1;
    if (text.includes('core needle')) attrs.meth_core_needle = 1;
    if (text.includes('fine needle')) attrs.meth_fine_needle = 1;
    if (text.includes('treadmill')) attrs.meth_treadmill = 1;
    if (text.includes('protocol')) attrs.meth_protocol = 1;
    if (text.includes('color fundus')) attrs.meth_color_fundus = 1;
    if (text.includes('flexible')) attrs.meth_flexible = 1;
    if (text.includes('panoramic')) attrs.meth_panoramic = 1;
    if (text.includes('interproximal')) attrs.meth_interproximal = 1;
    if (text.includes('chemical')) attrs.meth_chemical = 1;

    // Category
    if (text.includes('laboratory') || text.includes('culture') || text.includes('blood count') || text.includes('lipid')) attrs.cat_lab = 1;
    if (text.includes('tomography') || text.includes('mri') || text.includes('x ray') || text.includes('radiograph') || text.includes('echocardiography') || text.includes('ecg') || text.includes('ultrasound')) attrs.cat_rad = 1;
    if (text.includes('cardiac') || text.includes('stress test') || text.includes('holter')) attrs.cat_card = 1;
    if (text.includes('cholecystectomy') || text.includes('appendectomy') || text.includes('surgery')) attrs.cat_surg = 1;
    if (text.includes('laser') && (text.includes('therapy') || text.includes('physio'))) attrs.cat_phys = 1;
    if (text.includes('biopsy') || text.includes('fine needle')) attrs.cat_path = 1;
    if (text.includes('oct') || text.includes('fundus')) attrs.cat_opth = 1;
    if (text.includes('endoscopy') || text.includes('nasal')) attrs.cat_ent = 1;
    if (text.includes('opg') || text.includes('orthopantomogram') || text.includes('bitewing') || text.includes('dental')) attrs.cat_dent = 1;
    if (text.includes('chemical peel') || text.includes('acne') || text.includes('dermat')) attrs.cat_derm = 1;

    attrs.has_abbr = 0;
    attrs.has_syn = 0;
    attrs.has_procedure = 0;
    attrs.has_bodySite = 0;
    attrs.has_method = 0;

    return attrs;
  }
};

if (typeof globalThis !== 'undefined') globalThis.ClinicalTrainedModel = ClinicalTrainedModel;
if (typeof module !== 'undefined' && module.exports) module.exports = ClinicalTrainedModel;
