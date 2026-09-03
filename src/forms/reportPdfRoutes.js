// routes/reportPdfRoutes.js
// ============================================================================
//  REPORT PDF GENERATION
//  ----------------------------------------------------------------------
//  Generates the exact Verifitech "Employee Residence Address | Identity
//  Verification Report" layout (the format supplied as a reference PDF)
//  from live data in `new-workorder-creation`, for any check that has
//  reached QC-approved status (qcStatus === 'completed').
//
//  Address / Criminal-type checks get the full replica layout: candidate
//  info table, Yes/No checkbox grid, locality / accommodation / ownership
//  checkbox rows, verifier comments, colour-coded FINAL STATUS banner, a
//  legend, and a second "Field Visit Photography" page with whatever
//  images were uploaded for that check.
//
//  Every other check type (Employment, Education, etc.) gets a generic
//  but branded report — same header/footer/legend, a key/value table of
//  the verifier's findings instead of the fixed address grid.
//
//  Library: pdf-lib (pure JS, no headless browser / system deps needed —
//  see /mnt/skills/public/pdf/REFERENCE.md "JavaScript Libraries").
//  npm install pdf-lib
// ============================================================================

const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const { resolveFormConfig } = require('./forms');

const API_BASE = '/api/report';
const WORKORDER_COLLECTION = 'new-workorder-creation';
const EMPLOYEE_COLLECTION = 'employee_login';
// Company logo, as supplied — resolved relative to the backend root
// (this file lives in routes/, so ../images/... points at backend/images/).
const LOGO_PATH = path.join(__dirname, '..', 'images', 'verifitech-logoo.png');

async function embedLogo(pdfDoc) {
  try {
    if (!fs.existsSync(LOGO_PATH)) return null;
    const bytes = fs.readFileSync(LOGO_PATH);
    return await pdfDoc.embedPng(bytes);
  } catch (e) {
    console.error('Logo embed failed:', e.message);
    return null;
  }
}

const isValidId = (id) => {
  try {
    return ObjectId.isValid(id) && String(new ObjectId(id)) === String(id);
  } catch {
    return false;
  }
};

const employeeDisplayName = (e) => {
  if (!e) return '';
  const firstName = e.firstName || e.first_name || '';
  const lastName = e.lastName || e.last_name || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  return fullName || e.displayName || e.name || e.fullName || e.email || 'Unknown';
};

const fmtDate = (d) => {
  if (!d) return 'NA';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};



// ----------------------------------------------------------------------
// COLORS (rgb 0..1)
// ----------------------------------------------------------------------
const TEAL = rgb(0.043, 0.647, 0.616);
const BLACK = rgb(0.06, 0.06, 0.06);
const GRAY = rgb(0.45, 0.45, 0.45);
const LIGHT_GRAY = rgb(0.94, 0.94, 0.94);
const LINE_GRAY = rgb(0.75, 0.75, 0.75);
const GREEN = rgb(0.16, 0.62, 0.27);
const YELLOW = rgb(0.95, 0.83, 0.2);
const RED = rgb(0.82, 0.18, 0.15);
const ORANGE = rgb(0.9, 0.5, 0.1);

// FINAL STATUS resolution — mirrors the legend on the reference PDF.
function resolveFinalStatus(check) {
  if (check.status === 'insufficient') return { label: 'INFORMATION UNABLE TO VALIDATE', color: YELLOW, textColor: BLACK };
  if (check.status === 'discrepancy') return { label: 'ADVERSE REMARK REPORT', color: RED, textColor: rgb(1, 1, 1) };
  if (check.qcResult === 'approved' || check.status === 'report') return { label: 'GENUINE', color: GREEN, textColor: rgb(1, 1, 1) };
  return { label: 'PARTIALLY VERIFIED / MINOR DISCREPANCIES', color: ORANGE, textColor: rgb(1, 1, 1) };
}

// ----------------------------------------------------------------------
// Shared header / footer, drawn on every page.
// ----------------------------------------------------------------------
function drawHeaderFooter(page, fonts, { title, pageWidth, pageHeight, logoImage }) {
  const { bold, regular } = fonts;
  const margin = 40;

  // Header
  page.drawText('Strictly Private & Confidential', {
    x: margin, y: pageHeight - 35, size: 9, font: bold, color: BLACK,
  });

  if (logoImage) {
    // Logo lives in the top strip, above the header separator line drawn
    // at pageHeight - 50. maxLogoW/maxLogoH are the *preferred* size, but
    // the clamp below is what actually guarantees no overlap with the
    // title text underneath — even if these numbers get tuned larger
    // later, the logo can never grow past the strip it's confined to.
    const stripHeight = 50; // matches the header line's offset below pageHeight
    const stripPadding = 8;
    const maxLogoW = 130;
    const maxLogoH = 34;

    let scale = Math.min(maxLogoW / logoImage.width, maxLogoH / logoImage.height, 1);
    let w = logoImage.width * scale;
    let h = logoImage.height * scale;

    const maxAllowedH = stripHeight - stripPadding;
    if (h > maxAllowedH) {
      const clamp = maxAllowedH / h;
      w *= clamp;
      h *= clamp;
    }

    const logoX = pageWidth - margin - w;
    const logoY = (pageHeight - stripHeight) + (stripHeight - h) / 2;
    page.drawImage(logoImage, { x: logoX, y: logoY, width: w, height: h });
  } else {
    // Fallback if the logo file isn't found on disk — keeps the report
    // generating instead of failing outright.
    page.drawText('Verifitech', {
      x: pageWidth - margin - 70, y: pageHeight - 32, size: 14, font: bold, color: TEAL,
    });
    page.drawText('VerifyFirst BuildTrust', {
      x: pageWidth - margin - 70, y: pageHeight - 44, size: 6, font: regular, color: GRAY,
    });
  }

  page.drawLine({
    start: { x: margin, y: pageHeight - 50 }, end: { x: pageWidth - margin, y: pageHeight - 50 },
    thickness: 1, color: BLACK,
  });

  page.drawText(title, {
    x: (pageWidth - bold.widthOfTextAtSize(title, 13)) / 2,
    y: pageHeight - 72, size: 13, font: bold, color: BLACK,
  });

  // Footer
  page.drawLine({
    start: { x: margin, y: 50 }, end: { x: pageWidth - margin, y: 50 },
    thickness: 0.5, color: LINE_GRAY,
  });
  page.drawText('verify@verifitech.com | www.verifitech.com', {
    x: margin, y: 34, size: 8, font: regular, color: TEAL,
  });
  page.drawText('Version: 4.0 / Generated Report', {
    x: pageWidth - margin - 140, y: 34, size: 8, font: regular, color: GRAY,
  });
  page.drawText('**This is a computer-generated document. No signature is required', {
    x: (pageWidth - regular.widthOfTextAtSize('**This is a computer-generated document. No signature is required', 7.5)) / 2,
    y: 22, size: 7.5, font: regular, color: GRAY,
  });
}

// yn() intentionally removed — the checkbox-grid layout it supported
// (Address Matches / Confirmed: Yes/No, etc.) belonged to the OLDER
// report template. The current template (Address_Form.docx replica) uses
// plain label/value rows instead — see drawAddressReportPage below.

// Wrap text to a max width, returns array of lines.
function wrapText(text, font, size, maxWidth) {
  const words = String(text || '').split(/\s+/);
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
}

// ----------------------------------------------------------------------
// A full-width row split into arbitrary label/value columns (fractions of
// totalWidth must sum to ~1). Used for the multi-cell rows — Case Ref /
// Name, Period of Stay, Field Executive Name/Date/Time, and Remarks/
// Signature — that a single label:value row can't express.
// ----------------------------------------------------------------------
function drawGridRow(page, fonts, x, y, totalWidth, columns, height, fillColor) {
  page.drawRectangle({
    x, y: y - height, width: totalWidth, height,
    borderColor: BLACK, borderWidth: 0.75, color: fillColor,
  });
  let cx = x;
  columns.forEach((col, i) => {
    const w = totalWidth * col.widthFrac;
    if (i > 0) page.drawLine({ start: { x: cx, y }, end: { x: cx, y: y - height }, thickness: 0.5, color: LINE_GRAY });
    const isLabel = col.type === 'label';
    page.drawText(String(col.text ?? (isLabel ? '' : 'NA')), {
      x: cx + 4, y: y - height / 2 - 3, size: isLabel ? 7.5 : 8,
      font: isLabel ? fonts.bold : fonts.regular,
      color: col.textColor || BLACK,
    });
    cx += w;
  });
}

// Infers whether the verified address is the candidate's Present,
// Permanent, or Previous address. Not an explicit field in the data
// model, so this reads whatever signal is available (subType, or which
// __structured block the candidate submitted) and falls back to
// "Permanent" — Address Verification checks are permanent-residence
// checks by convention across the rest of this codebase.
function inferAddressType(check) {
  const hay = `${check.subType || ''} ${check.checkType || ''}`.toLowerCase();
  if (hay.includes('present')) return 'Present';
  if (hay.includes('previous')) return 'Previous';
  return 'Permanent';
}

// ----------------------------------------------------------------------
// PAGE 1 — Residential Address Verification Form (exact replica of the
// supplied Address_Form.docx reference), populated with the FINAL,
// QC-approved verification data. This is the delivered report — every
// field is filled in, unlike the blank working copy generated by
// routes/addressFormRoutes.js for a field executive's on-site visit.
// ----------------------------------------------------------------------
function drawAddressReportPage(pdfPage, fonts, data, dims) {
  const { bold, regular } = fonts;
  const { pageWidth, pageHeight } = dims;
  const margin = 40;
  const fullWidth = pageWidth - margin * 2;
  let y = pageHeight - 100;

  const { candidate, check, verifier, candidateDetails, performedByName } = data;
  const addr = verifier || {};
  const finalStatus = resolveFinalStatus(check);

  const row = (label, value, boxHeight = 20) => {
    page_drawFieldRow(pdfPage, fonts, margin, y, fullWidth, label, value, boxHeight);
    y -= boxHeight;
  };

  const fullAddress = [addr.address, addr.landMark, addr.city, addr.state, addr.pinCode].filter(Boolean).join(', ');
  const dateOfVisit = fmtDate(check.completedAt);
  const timeOfVisit = check.completedAt
    ? new Date(check.completedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : 'NA';

  // Row 1 — Case Reference No. | value | Name of the Candidate | value
  drawGridRow(pdfPage, fonts, margin, y, fullWidth, [
    { type: 'label', text: 'Case Reference No.', widthFrac: 0.26 },
    { type: 'value', text: check.bgvRef || candidate.bgvRef, widthFrac: 0.24 },
    { type: 'label', text: 'Name of the Candidate', widthFrac: 0.24 },
    { type: 'value', text: candidate.fullName, widthFrac: 0.26 },
  ], 24);
  y -= 24;

  // Row 2 — Address of the Candidate
  row('Address of the Candidate', fullAddress || 'NA', 28);

  // Row 3 — Period of Stay: From | value | To | value
  drawGridRow(pdfPage, fonts, margin, y, fullWidth, [
    { type: 'label', text: 'Period of Stay', widthFrac: 0.22 },
    { type: 'label', text: 'From (MM-DD-YYYY)', widthFrac: 0.20 },
    { type: 'value', text: fmtDate(addr.periodFrom), widthFrac: 0.16 },
    { type: 'label', text: 'To (MM-DD-YYYY)', widthFrac: 0.20 },
    { type: 'value', text: fmtDate(addr.periodTo) || 'Till Date', widthFrac: 0.22 },
  ], 24);
  y -= 24;

  // Row 4 / 5 — Father Name / Candidate Contact No.
  row('Father Name', candidateDetails?.personal?.fatherName || 'NA');
  row('Candidate Contact No.', candidate.phone || candidateDetails?.personal?.mobile || 'NA');

  // Row 6 — Particulars | Verifier Feedback (header row) — the
  // "Verifier Feedback" side is shaded with the resolved FINAL STATUS
  // color, which is what ties the Legends block at the bottom of this
  // page back to an actual result on the report (on the blank working
  // form this row is neutral, since there's no result yet).
  drawGridRow(pdfPage, fonts, margin, y, fullWidth, [
    { type: 'label', text: 'Particulars', widthFrac: 0.26 },
  ], 20, LIGHT_GRAY);
  drawGridRow(pdfPage, fonts, margin + fullWidth * 0.26, y, fullWidth * 0.74, [
    { type: 'label', text: 'Verifier Feedback', widthFrac: 1, textColor: finalStatus.textColor },
  ], 20, finalStatus.color);
  y -= 20;

  // Row 7-9 — Ownership Status / Type of Address / Nearest Landmark
  row('Ownership Status\n(Owned / Rented / Other)'.split('\n')[0], addr.ownershipStatus || 'NA', 22);
  row('Type of Address (Present / Permanent / Previous)', inferAddressType(check), 22);
  row('Nearest Landmark (100 Meters of address)', addr.landMark || 'NA', 22);

  // Row 10-12 — Verifier Name / Relationship / Signature
  row('Verifier Name', performedByName || 'NA');
  row('Relationship with Candidate', addr.relationshipWithCandidate || 'NA');
  row('Verifiers Signature', 'Digitally Verified — no physical signature required', 24);

  // Row 13 — Verifier Address / Location — best-effort summary from
  // whatever corroborating details the verifier captured (there's no
  // single dedicated field for this in the data model).
  const verifierLocationBits = [
    addr.verifiedWith ? `Verified with: ${addr.verifiedWith}` : '',
    addr.neighbourContacted && addr.neighbourContacted !== 'NA' ? `Neighbour contacted — ${addr.neighbourFeedback || 'NA'}` : '',
  ].filter(Boolean).join('.  ');
  const locLines = wrapText(verifierLocationBits || 'NA', regular, 8, fullWidth - 130);
  const locBoxH = Math.max(28, 14 + locLines.length * 11);
  pdfPage.drawRectangle({ x: margin, y: y - locBoxH, width: fullWidth, height: locBoxH, borderColor: BLACK, borderWidth: 0.75 });
  pdfPage.drawLine({ start: { x: margin + 120, y }, end: { x: margin + 120, y: y - locBoxH }, thickness: 0.5, color: LINE_GRAY });
  pdfPage.drawText('Verifier Address / Location', { x: margin + 3, y: y - 12, size: 7.5, font: bold });
  pdfPage.drawText('(Details shared here are used exclusively to verify authenticity.)', { x: margin + 3, y: y - 22, size: 6, font: regular, color: GRAY });
  locLines.forEach((line, i) => {
    pdfPage.drawText(line, { x: margin + 126, y: y - 12 - i * 11, size: 8, font: regular });
  });
  y -= locBoxH;

  // Row 14 — Field Executives Name | value | Date of Visit | value | Time of Visit | value
  drawGridRow(pdfPage, fonts, margin, y, fullWidth, [
    { type: 'label', text: 'Field Executives Name', widthFrac: 0.24 },
    { type: 'value', text: performedByName, widthFrac: 0.20 },
    { type: 'label', text: 'Date of Visit', widthFrac: 0.16 },
    { type: 'value', text: dateOfVisit, widthFrac: 0.16 },
    { type: 'label', text: 'Time of Visit', widthFrac: 0.12 },
    { type: 'value', text: timeOfVisit, widthFrac: 0.12 },
  ], 22);
  y -= 22;

  // Row 15 — Field Executives Remarks | value | Field Executive Signature: | value
  const remarksLines = wrapText(check.notes || 'NA', regular, 8, fullWidth * 0.44 - 8);
  const remarksBoxH = Math.max(22, 12 + remarksLines.length * 11);
  drawGridRow(pdfPage, fonts, margin, y, fullWidth, [
    { type: 'label', text: 'Field Executives Remarks', widthFrac: 0.24 },
    { type: 'value', text: '', widthFrac: 0.44 },
    { type: 'label', text: 'Field Executive Signature:', widthFrac: 0.18 },
    { type: 'value', text: 'Digitally Verified', widthFrac: 0.14 },
  ], remarksBoxH);
  remarksLines.forEach((line, i) => {
    pdfPage.drawText(line, { x: margin + fullWidth * 0.24 + 4, y: y - 12 - i * 11, size: 8, font: regular });
  });
  y -= remarksBoxH + 16;

  // Legends — a stacked list (color swatch + label per row), exactly as
  // laid out at the bottom of the reference template.
  pdfPage.drawText('Legends:', { x: margin, y, size: 8, font: bold });
  y -= 4;
  const legendItems = [
    ['Clear Report', GREEN],
    ['Information Unable to Validate', YELLOW],
    ['Adverse Remark Report', RED],
    ['Partially Verified / Minor Discrepancies', ORANGE],
  ];
  legendItems.forEach(([label, color], i) => {
    const ly = y - 12 - i * 13;
    pdfPage.drawRectangle({ x: margin, y: ly - 7, width: 220, height: 12, color, borderColor: BLACK, borderWidth: 0.5 });
    pdfPage.drawText(label, { x: margin + 6, y: ly - 4, size: 7.5, font: regular });
  });
}

// One label/value row helper used throughout the address layout.
function page_drawFieldRow(page, fonts, x, y, width, label, value, height) {
  page.drawRectangle({ x, y: y - height, width, height, borderColor: BLACK, borderWidth: 0.75 });
  page.drawLine({ start: { x: x + 120, y }, end: { x: x + 120, y: y - height }, thickness: 0.5, color: LINE_GRAY });
  page.drawText(label, { x: x + 3, y: y - height / 2 - 3, size: 7.5, font: fonts.bold, color: BLACK });
  page.drawText(String(value || 'NA'), { x: x + 126, y: y - height / 2 - 3, size: 8, font: fonts.regular, color: BLACK });
}


// ----------------------------------------------------------------------
// GENERIC report page — used for check types that don't have a fixed
// visual template (Employment, Education, etc). Same header/footer/legend
// branding, but the body is a plain key/value table of the verifier data.
// ----------------------------------------------------------------------
function humanizeKey(key) {
  return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (s) => s.toUpperCase()).trim();
}

function drawGenericReportPage(pdfPage, fonts, data, dims) {
  const { bold, regular } = fonts;
  const { pageWidth, pageHeight } = dims;
  const margin = 40;
  let y = pageHeight - 100;

  const { candidate, check, verifier, performedByName } = data;

  const row = (label, value, height = 20) => {
    page_drawFieldRow(pdfPage, fonts, margin, y, pageWidth - margin * 2, label, value, height);
    y -= height;
  };

  row('Case Ref.No', check.bgvRef || candidate.bgvRef);
  row('Candidate Name', candidate.fullName || 'NA');
  row('Check Type', `${check.checkType || ''}${check.subType ? ` — ${check.subType}` : ''}`);
  row('Client', candidate.client || 'NA');
  row('Name of Verification Executive', performedByName || 'NA');

  // Flat key/value dump of whatever the verifier captured.
  const entries = Object.entries(verifier || {}).filter(([, v]) => v !== null && v !== undefined && typeof v !== 'object');
  entries.forEach(([key, value]) => {
    row(humanizeKey(key), String(value));
  });

  row("Supervisor's Remark / QC Notes", check.qcNotes || 'NA', 24);

  const finalStatus = resolveFinalStatus(check);
  const bannerH = 24;
  pdfPage.drawRectangle({ x: margin, y: y - bannerH, width: pageWidth - margin * 2, height: bannerH, color: finalStatus.color, borderColor: BLACK, borderWidth: 0.75 });
  pdfPage.drawText('FINAL STATUS', { x: margin + 3, y: y - 15, size: 8, font: bold, color: finalStatus.textColor });
  const labelWidth = bold.widthOfTextAtSize(finalStatus.label, 10);
  pdfPage.drawText(finalStatus.label, {
    x: margin + (pageWidth - margin * 2 - labelWidth) / 2, y: y - 16, size: 10, font: bold, color: finalStatus.textColor,
  });
}

// ----------------------------------------------------------------------
// LEGEND_COLORS — maps the string color names used in every form config's
// `legend` array (routes/forms/*.js) to the actual pdf-lib rgb() values
// already defined above.
// ----------------------------------------------------------------------
const LEGEND_COLORS = { GREEN, YELLOW, RED, ORANGE };

// A vertical stacked legend list — same visual convention as the address
// report (color swatch + label per row). Returns the new `y` cursor.
function drawStackedLegend(pdfPage, fonts, x, y, legendItems) {
  pdfPage.drawText('Legends:', { x, y, size: 8, font: fonts.bold });
  let cursor = y - 4;
  legendItems.forEach(([label, colorKey], i) => {
    const ly = cursor - 12 - i * 13;
    pdfPage.drawRectangle({ x, y: ly - 7, width: 220, height: 12, color: LEGEND_COLORS[colorKey] || GREEN, borderColor: BLACK, borderWidth: 0.5 });
    pdfPage.drawText(label, { x: x + 6, y: ly - 4, size: 7.5, font: fonts.regular });
  });
  return cursor - 12 - legendItems.length * 13;
}

// Like page_drawFieldRow, but wraps BOTH the label and the value to fit
// their columns (a wider 190pt label column, since the new form configs'
// labels are often long descriptive phrases, unlike the short address-
// form labels page_drawFieldRow was originally sized for), growing the
// row height to fit whichever side wraps more. Returns the height used,
// since it may exceed the requested minHeight.
function drawWrappedFieldRow(page, fonts, x, y, width, label, value, minHeight = 20) {
  const labelColWidth = 190;
  const valueColWidth = width - labelColWidth;
  const labelLines = wrapText(label, fonts.bold, 7.5, labelColWidth - 8);
  const valueLines = wrapText(String(value ?? 'NA') || 'NA', fonts.regular, 8, valueColWidth - 8);
  const neededLines = Math.max(labelLines.length, valueLines.length, 1);
  const height = Math.max(minHeight, 10 + neededLines * 11);

  page.drawRectangle({ x, y: y - height, width, height, borderColor: BLACK, borderWidth: 0.75 });
  page.drawLine({ start: { x: x + labelColWidth, y }, end: { x: x + labelColWidth, y: y - height }, thickness: 0.5, color: LINE_GRAY });

  labelLines.forEach((line, i) => {
    page.drawText(line, { x: x + 4, y: y - 12 - i * 11, size: 7.5, font: fonts.bold, color: BLACK });
  });
  valueLines.forEach((line, i) => {
    page.drawText(line, { x: x + labelColWidth + 6, y: y - 12 - i * 11, size: 8, font: fonts.regular, color: BLACK });
  });

  return height;
}

// ----------------------------------------------------------------------
// drawConfiguredReportPage — the SHARED renderer used by every form
// registered in routes/forms/ (15 new-frontend forms + 4 report-only
// configs = 19 form types, on top of the bespoke Address layout above).
// Adding form #21+ requires ZERO changes here — it's entirely driven by
// the config's `sections` (and optional `layout: 'split'` per section).
// ----------------------------------------------------------------------
function drawConfiguredReportPage(pdfPage, fonts, data, dims, formConfig) {
  const { bold, regular } = fonts;
  const { pageWidth, pageHeight } = dims;
  const margin = 40;
  const fullWidth = pageWidth - margin * 2;
  let y = pageHeight - 100;

  const { candidate, check, verifier, performedByName } = data;
  const finalStatus = resolveFinalStatus(check);

  const row = (label, value, minHeight = 20) => {
    const h = drawWrappedFieldRow(pdfPage, fonts, margin, y, fullWidth, label, value, minHeight);
    y -= h;
  };

  // Header identity block — common to every configured form.
  drawGridRow(pdfPage, fonts, margin, y, fullWidth, [
    { type: 'label', text: 'Case Reference No.', widthFrac: 0.26 },
    { type: 'value', text: check.bgvRef || candidate.bgvRef, widthFrac: 0.24 },
    { type: 'label', text: 'Name of the Candidate', widthFrac: 0.24 },
    { type: 'value', text: candidate.fullName, widthFrac: 0.26 },
  ], 22);
  y -= 22;
  row('Client', candidate.client || 'NA');

  // Each configured section: an optional shaded heading bar, then its
  // fields as label:value rows (wrapping long textarea-type values), or —
  // for sections with layout: 'split' — a Criteria/Provided/Verified
  // mini-table (mirrors the split verifier-form pattern shown in
  // CriminalVerificationVerifier.jsx, now applied generically).
  (formConfig.sections || []).forEach((section) => {
    if (section.heading) {
      drawGridRow(pdfPage, fonts, margin, y, fullWidth, [
        { type: 'label', text: section.heading, widthFrac: 1 },
      ], 18, LIGHT_GRAY);
      y -= 18;
    }

    if (section.layout === 'split') {
      // Column header row for the split mini-table.
      drawGridRow(pdfPage, fonts, margin, y, fullWidth, [
        { type: 'label', text: 'Criteria', widthFrac: 0.34 },
        { type: 'label', text: 'Provided', widthFrac: 0.33 },
        { type: 'label', text: 'Verified', widthFrac: 0.33 },
      ], 18);
      y -= 18;

      section.fields.forEach((field) => {
        const provided = (check.providedData && check.providedData[field.key]) || 'NA';
        const verified = (verifier && verifier[field.key]) || 'NA';
        drawGridRow(pdfPage, fonts, margin, y, fullWidth, [
          { type: 'label', text: field.label, widthFrac: 0.34 },
          { type: 'value', text: String(provided), widthFrac: 0.33 },
          { type: 'value', text: String(verified), widthFrac: 0.33 },
        ], 20);
        y -= 20;
      });
      return;
    }

    section.fields.forEach((field) => {
      const rawValue = verifier ? verifier[field.key] : undefined;
      if (field.type === 'textarea') {
        const labelColWidth = 190;
        const labelLines = wrapText(field.label, bold, 7.5, labelColWidth - 8);
        const valueLines = wrapText((rawValue || 'NA'), regular, 8, fullWidth - labelColWidth - 8);
        const boxH = Math.max(20, 10 + Math.max(labelLines.length, valueLines.length) * 11);
        pdfPage.drawRectangle({ x: margin, y: y - boxH, width: fullWidth, height: boxH, borderColor: BLACK, borderWidth: 0.75 });
        pdfPage.drawLine({ start: { x: margin + labelColWidth, y }, end: { x: margin + labelColWidth, y: y - boxH }, thickness: 0.5, color: LINE_GRAY });
        labelLines.forEach((line, i) => {
          pdfPage.drawText(line, { x: margin + 4, y: y - 12 - i * 11, size: 7.5, font: bold });
        });
        valueLines.forEach((line, i) => {
          pdfPage.drawText(line, { x: margin + labelColWidth + 6, y: y - 12 - i * 11, size: 8, font: regular });
        });
        y -= boxH;
      } else if (field.type === 'yesno') {
        // Distinguish an explicit boolean false ("No") from simply
        // unset/undefined ("NA") — a naive `rawValue ? 'No' : 'NA'`
        // would incorrectly show "NA" for a real "No" answer.
        let val = 'NA';
        if (rawValue === true || String(rawValue).toLowerCase() === 'yes') val = 'Yes';
        else if (rawValue === false || String(rawValue).toLowerCase() === 'no') val = 'No';
        row(field.label, val);
      } else {
        row(field.label, rawValue || 'NA');
      }
    });
  });

  // Verifier / QC notes — common to every configured form.
  row('Name of Verification Executive', performedByName || 'NA');
  row("Supervisor's Remark / QC Notes", check.qcNotes || 'NA', 24);

  // FINAL STATUS banner + stacked legend (uses the form's own legend
  // definition so a 3-color vs 4-color form shows only its own options).
  const bannerH = 22;
  pdfPage.drawRectangle({ x: margin, y: y - bannerH, width: fullWidth, height: bannerH, color: finalStatus.color, borderColor: BLACK, borderWidth: 0.75 });
  pdfPage.drawText('FINAL STATUS', { x: margin + 3, y: y - 14, size: 8, font: bold, color: finalStatus.textColor });
  const labelW = bold.widthOfTextAtSize(finalStatus.label, 9);
  pdfPage.drawText(finalStatus.label, { x: margin + (fullWidth - labelW) / 2, y: y - 14, size: 9, font: bold, color: finalStatus.textColor });
  y -= bannerH + 14;

  drawStackedLegend(pdfPage, fonts, margin, y, formConfig.legend || [
    ['Clear Report', 'GREEN'], ['Information Unable to Validate', 'YELLOW'], ['Adverse Remark / Report', 'RED'],
  ]);
}

// ----------------------------------------------------------------------
// PAGE 2 — Field Visit Photography (only added if at least one image is
// resolvable on disk).
// ----------------------------------------------------------------------
async function drawFieldVisitPage(pdfDoc, fonts, imagePaths, dims, logoImage) {
  const { pageWidth, pageHeight } = dims;
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  drawHeaderFooter(page, fonts, { title: 'Field Visit Photography', pageWidth, pageHeight, logoImage });

  const margin = 40;
  const gap = 16;
  const boxW = (pageWidth - margin * 2 - gap) / 2;
  const boxH = 200;
  const labels = ['Landmark', 'Id Proof', 'Building with Door Number', 'Flat With Flat No'];
  const positions = [
    { x: margin, y: pageHeight - 100 },
    { x: margin + boxW + gap, y: pageHeight - 100 },
    { x: margin, y: pageHeight - 100 - boxH - 40 },
    { x: margin + boxW + gap, y: pageHeight - 100 - boxH - 40 },
  ];

  for (let i = 0; i < 4; i += 1) {
    const { x, y } = positions[i];
    page.drawText(`${labels[i]} :`, { x, y: y + 6, size: 9, font: fonts.bold });
    page.drawRectangle({ x, y: y - boxH, width: boxW, height: boxH, borderColor: BLACK, borderWidth: 1 });

    const imgPath = imagePaths[i];
    if (imgPath && fs.existsSync(imgPath)) {
      try {
        const bytes = fs.readFileSync(imgPath);
        const ext = path.extname(imgPath).toLowerCase();
        const image = ext === '.png' ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
        const scale = Math.min((boxW - 10) / image.width, (boxH - 10) / image.height, 1);
        const w = image.width * scale;
        const h = image.height * scale;
        page.drawImage(image, {
          x: x + (boxW - w) / 2, y: y - boxH + (boxH - h) / 2, width: w, height: h,
        });
      } catch (e) {
        page.drawText('N/A', { x: x + boxW / 2 - 10, y: y - boxH / 2, size: 10, font: fonts.bold });
      }
    } else {
      page.drawText('N/A', { x: x + boxW / 2 - 10, y: y - boxH / 2, size: 10, font: fonts.bold });
    }
  }
}

// ----------------------------------------------------------------------
// Resolve absolute disk paths for a check's uploaded files (from
// check.data.__structured.*.files and the workorder's documents[]) so the
// Field Visit Photography page can embed real images where available.
// ----------------------------------------------------------------------
function resolveImagePaths(wo, check) {
  const uploadsRoot = path.join(__dirname, '..');
  const urls = [];

  const structured = check?.data?.__structured || {};
  ['present', 'permanent'].forEach((k) => {
    const block = structured[k];
    if (block && Array.isArray(block.files)) block.files.forEach((f) => f?.url && urls.push(f.url));
  });
  if (Array.isArray(structured.records)) {
    structured.records.forEach((rec) => {
      if (Array.isArray(rec.files)) rec.files.forEach((f) => f?.url && urls.push(f.url));
    });
  }
  (Array.isArray(wo.documents) ? wo.documents : []).forEach((d) => {
    if (String(d.checkSlNo) === String(check.slNo) && d.url) urls.push(d.url);
  });

  return urls.map((u) => path.join(uploadsRoot, u.replace(/^\//, '')));
}

// ----------------------------------------------------------------------
// buildReportPdf(db, workorderId, slNo)
//   Reusable core — returns { bytes, fileName, wo, check } for a single
//   check's report. Used by the download route below AND by
//   routes/reportDeliveryRoutes.js when emailing the PDF to a client.
// ----------------------------------------------------------------------
async function buildReportPdf(db, workorderId, slNo) {
  if (!isValidId(workorderId)) {
    const err = new Error('Invalid workorder id.');
    err.status = 400;
    throw err;
  }

  const wo = await db.collection(WORKORDER_COLLECTION).findOne({ _id: new ObjectId(workorderId) });
  if (!wo) {
    const err = new Error('Workorder not found.');
    err.status = 404;
    throw err;
  }

  const check = (Array.isArray(wo.checks) ? wo.checks : []).find((c) => String(c.slNo) === String(slNo));
  if (!check) {
    const err = new Error('Check not found.');
    err.status = 404;
    throw err;
  }

  let performedByName = check.assignedTo || '';
  if (check.assignedToId && isValidId(check.assignedToId)) {
    const emp = await db.collection(EMPLOYEE_COLLECTION).findOne({ _id: new ObjectId(check.assignedToId) });
    if (emp) performedByName = employeeDisplayName(emp);
  }

  const pdfDoc = await PDFDocument.create();
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fonts = { regular, bold };
  const logoImage = await embedLogo(pdfDoc);

  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;
  const dims = { pageWidth, pageHeight };

  const page1 = pdfDoc.addPage([pageWidth, pageHeight]);
  const checkTypeLower = (check.checkType || '').toLowerCase();
  // NOTE: 'criminal' used to share this address-style layout because its
  // PROVIDED-data shape reuses transformAddress() (see
  // verificationDataRoutes.js). The FINAL REPORT now has its own proper
  // template (routes/forms/criminalReport.js, matching Criminal_Form.docx)
  // resolved via the forms registry below, so it's deliberately excluded
  // here.
  const isAddressLike = checkTypeLower.includes('address') || checkTypeLower.includes('identity');
  const formConfig = isAddressLike ? null : resolveFormConfig(check.checkType, check.subType);

  const reportData = {
    candidate: { ...wo, _id: wo._id.toString() },
    check: { ...check, bgvRef: wo.bgvRef },
    verifier: check.verifier || {},
    candidateDetails: wo.candidateDetails || {},
    performedByName,
  };

  drawHeaderFooter(page1, fonts, {
    title: isAddressLike
      ? 'Residential Address Verification Form'
      : (formConfig ? formConfig.title : `${check.checkType || 'Check'} Verification Report`),
    pageWidth, pageHeight, logoImage,
  });

  if (isAddressLike) {
    drawAddressReportPage(page1, fonts, reportData, dims);
  } else if (formConfig) {
    // Every registered form (routes/forms/*.js) renders through this ONE
    // shared, config-driven function — see drawConfiguredReportPage above.
    drawConfiguredReportPage(page1, fonts, reportData, dims, formConfig);
  } else {
    // Safety net for any check type that isn't registered yet — a flat
    // key/value dump of whatever the verifier captured, so nothing ever
    // fails to generate a report while a form config is being written.
    drawGenericReportPage(page1, fonts, reportData, dims);
  }

  // Field Visit Photography page — only meaningful for address-style
  // checks, matches the reference PDF's second page.
  if (isAddressLike) {
    const imagePaths = resolveImagePaths(wo, check);
    await drawFieldVisitPage(pdfDoc, fonts, imagePaths, dims, logoImage);
  }

  const pdfBytes = await pdfDoc.save();
  const fileName = `${wo.bgvRef || 'Report'}_${(wo.fullName || 'Candidate').replace(/\s+/g, '_')}_${check.checkType || ''}.pdf`.replace(/[^\w.\-]+/g, '_');

  return { bytes: Buffer.from(pdfBytes), fileName, wo, check };
}

// ----------------------------------------------------------------------
// GET /api/report/:workorderId/checks/:slNo/pdf
//   Generates and streams the PDF report for a single QC-approved check.
// ----------------------------------------------------------------------
router.get(`${API_BASE}/:workorderId/checks/:slNo/pdf`, async (req, res) => {
  try {
    const { workorderId, slNo } = req.params;
    const { bytes, fileName } = await buildReportPdf(req.db, workorderId, slNo);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.send(bytes);
  } catch (err) {
    console.error('GET /report/:workorderId/checks/:slNo/pdf error', err);
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

module.exports = router;
module.exports.buildReportPdf = buildReportPdf;
