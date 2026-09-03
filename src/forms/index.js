// routes/forms/index.js
// ============================================================================
//  FORMS REGISTRY
//  ----------------------------------------------------------------------
//  Aggregates every per-form config file in this directory into:
//    1. A Map keyed by form `key`, for fast lookup.
//    2. `resolveFormConfig(checkType, subType)` — matches a check's
//       checkType/subType text against each config's `matchKeywords`
//       (case-insensitive substring match), used by BOTH:
//         - GenericCheckVerifier.jsx (frontend), via GET /api/forms/registry
//           and GET /api/forms/:formKey
//         - routes/reportPdfRoutes.js's buildReportPdf(), to pick which
//           template to render for a given check.
//    3. An Express router exposing:
//         GET /api/forms/registry        -> [{ key, title, noFrontend }]
//         GET /api/forms/:formKey        -> full config for one form
//
//  ---- HOW TO ADD FORM #21+ (see also WIRING_NOTES.md) ----
//    1. Create routes/forms/<yourFormName>.js, `module.exports = {...}`
//       following the exact same shape as any file in this directory
//       (key, title, matchKeywords, sections[], legend[]).
//    2. Add one line below: `require('./<yourFormName>')`.
//    That's it — it automatically appears in the registry, becomes
//    selectable via GenericCheckVerifier, and gets PDF report generation
//    for free through the shared drawConfiguredReportPage() renderer in
//    reportPdfRoutes.js. No other file needs to change.
// ============================================================================

const express = require('express');
const router = express.Router();

// ---- Every form config lives in its own file — this is the ONLY list
// that needs an entry when a new form is added. ----
const ALL_CONFIGS = [
  require('./aml'),
  require('./bankruptcy'),
  require('./bankStatement'),
  require('./carQuotation'),
  require('./civilLitigation'),
  require('./companyCriminal'),
  require('./courtCheck'),
  require('./drivingLicense'),
  require('./drugPanel5'),
  require('./drugPanel10'),
  require('./form16'),
  require('./form26as'),
  require('./globalSanctions'),
  require('./indianSanctions'),
  require('./idbiProperty'),
  // Report-only configs — these check types already have bespoke
  // data-entry screens elsewhere in the app; these configs only drive
  // PDF generation (see the noFrontend: true flag + the comment at the
  // top of each file for the exact field-key contract they rely on).
  require('./criminalReport'),
  require('./employmentLevel1Report'),
  require('./employmentLevel2Report'),
  require('./educationReport'),
];

const REGISTRY = new Map(ALL_CONFIGS.map((cfg) => [cfg.key, cfg]));

// ----------------------------------------------------------------------
// resolveFormConfig(checkType, subType)
//   Returns the best-matching config, or null. Longer/more-specific
//   matchKeywords are checked first within each config (the config
//   authors are expected to order matchKeywords from most to least
//   specific — e.g. drugPanel5/10 include the full "drug panel - 5"
//   phrase before any shorter fallback), and configs themselves are
//   tried in the ALL_CONFIGS array order, so more specific configs
//   (e.g. 'employment-level2') should be listed... — in practice here,
//   employmentLevel2Report's keywords ('employment level 2') are more
//   specific than employmentLevel1Report's bare 'employment', but
//   Level 1's config is registered first. To keep this deterministic
//   regardless of require() order, resolveFormConfig scores every
//   config by its LONGEST matching keyword and picks the highest score
//   (a more specific/longer phrase always wins over a shorter generic
//   one), rather than a simple first-match.
// ----------------------------------------------------------------------
function resolveFormConfig(checkType, subType) {
  const hay = `${checkType || ''} ${subType || ''}`.toLowerCase();
  let best = null;
  let bestScore = 0;

  ALL_CONFIGS.forEach((cfg) => {
    (cfg.matchKeywords || []).forEach((kw) => {
      const needle = kw.toLowerCase();
      if (hay.includes(needle) && needle.length > bestScore) {
        bestScore = needle.length;
        best = cfg;
      }
    });
  });

  return best;
}

function getRegistryList() {
  return ALL_CONFIGS.map((cfg) => ({
    key: cfg.key,
    title: cfg.title,
    noFrontend: !!cfg.noFrontend,
  }));
}

// GET /api/forms/registry
router.get('/api/forms/registry', (req, res) => {
  res.json({ success: true, forms: getRegistryList() });
});

// GET /api/forms/:formKey
router.get('/api/forms/:formKey', (req, res) => {
  const cfg = REGISTRY.get(req.params.formKey);
  if (!cfg) return res.status(404).json({ success: false, message: `Unknown form key "${req.params.formKey}".` });
  res.json({ success: true, form: cfg });
});

module.exports = router;
module.exports.resolveFormConfig = resolveFormConfig;
module.exports.getRegistryList = getRegistryList;
module.exports.REGISTRY = REGISTRY;
