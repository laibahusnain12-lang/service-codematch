/* Maintainable medical terminology and clinical knowledge database. */
'use strict';
const ClinicalKnowledgeBase = {
  version: 'clinical-kb-v1',
  categories: ['laboratory','radiology','cardiology','pathology','surgery','dentistry','physiotherapy','ophthalmology','ent','gynecology','dermatology','consultation'],
  abbreviations: {
    ct: 'computed tomography',
    mri: 'magnetic resonance imaging',
    usg: 'ultrasound',
    ecg: 'electrocardiogram',
    ekg: 'electrocardiogram',
    echo: 'echocardiography',
    cbc: 'complete blood count',
    ua: 'urinalysis',
    lft: 'liver function test',
    rft: 'renal function test'
  },
  synonyms: {
    'computed tomography': ['ct','cat scan'],
    'magnetic resonance imaging': ['mri'],
    'ultrasound': ['usg','sonography','ultrasonography'],
    'electrocardiogram': ['ecg','ekg'],
    'echocardiography': ['echo']
  },
  exclusions: {
    'laser therapy': ['wax therapy'],
    'wax therapy': ['laser therapy'],
    'ct': ['mri'],
    'mri': ['ct'],
    'ecg': ['echocardiography'],
    'echocardiography': ['ecg']
  },
  sources: ['Internal clinical terminology review (placeholder)']
};
if (typeof globalThis !== 'undefined') globalThis.ClinicalKnowledgeBase = ClinicalKnowledgeBase;
if (typeof module !== 'undefined' && module.exports) module.exports = ClinicalKnowledgeBase;