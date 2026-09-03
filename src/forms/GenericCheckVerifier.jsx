/* ============================================================
   src/employee-screens/GenericCheckVerifier.jsx

   ONE reusable data-entry screen for every check type registered in
   backend/routes/forms/*.js (aml, bankruptcy, bank-statement,
   car-quotation, civil-litigation, company-criminal, court-check,
   driving-license, drug-panel-5, drug-panel-10, form16, form26as,
   global-sanctions, indian-sanctions, idbi-property — 15 forms and
   counting). Adding form #21+ needs NO changes to this file — it fetches
   its field list from GET /api/forms/:formKey at runtime.

   Route: /verifier-forms/generic/:formKey/:workorderId
   (wired from verification-split.jsx's navigateToVerificationForm(),
   which maps a check's checkType to the right formKey — see
   typeToSlugAndFormKey() there.)

   Mirrors the visual language of the existing bespoke verifier screens
   (e.g. CriminalVerificationVerifier.jsx) — dark theme via `theme`,
   Provided | Verified split table for sections with layout: 'split',
   plain label:value fields otherwise — and saves through the SAME
   generic endpoints every other verifier screen already uses:
     PUT  /api/verifications/:workorderId/checks/:slNo/draft
     POST /api/verifications/complete
   ============================================================ */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Header from '../screens/header';
import api from '../apiroute/apiroute';
import theme from '../theme/theme';

const inputStyle = {
  width: '100%',
  padding: '0.65rem 0.85rem',
  backgroundColor: 'transparent',
  border: '1px solid',
  borderRadius: '8px',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'all 0.2s',
};

export default function GenericCheckVerifier() {
  const { formKey, workorderId } = useParams();
  const navigate = useNavigate();

  const [formConfig, setFormConfig] = useState(null);
  const [workorder, setWorkorder] = useState(null);
  const [activeCheck, setActiveCheck] = useState(null);
  const [providedData, setProvidedData] = useState({});

  const [values, setValues] = useState({});
  const [colorCode, setColorCode] = useState('Green');

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!formKey || !workorderId) {
      setLoadError('Missing form key or workorder id in the URL.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const [formRes, woRes] = await Promise.all([
          api.get(`/forms/${formKey}`),
          api.get(`/workorders/${workorderId}`),
        ]);
        if (cancelled) return;

        if (!formRes.data.success) {
          setLoadError(formRes.data.message || 'Unknown form.');
          return;
        }
        const cfg = formRes.data.form;
        setFormConfig(cfg);

        if (!woRes.data.success) {
          setLoadError(woRes.data.message || 'Failed to load workorder.');
          return;
        }
        const wo = woRes.data.workorder;
        setWorkorder(wo);

        // Find the check on this workorder whose checkType/subType
        // matches this form's keywords — same matching convention as
        // the backend's resolveFormConfig().
        const hayFor = (c) => `${c.checkType || ''} ${c.subType || ''}`.toLowerCase();
        const check = (wo.checks || []).find((c) =>
          (cfg.matchKeywords || []).some((kw) => hayFor(c).includes(kw.toLowerCase()))
        );

        if (!check) {
          setLoadError(`No "${cfg.title}" check found on this workorder.`);
          return;
        }
        setActiveCheck(check);
        setProvidedData(check.providedData || {});

        const saved = check.verifier || {};
        const initialValues = {};
        (cfg.sections || []).forEach((section) => {
          section.fields.forEach((f) => {
            initialValues[f.key] = saved[f.key] ?? '';
          });
        });
        setValues(initialValues);
        if (saved.colorCode) setColorCode(saved.colorCode);
      } catch (err) {
        if (!cancelled) setLoadError(err.response?.data?.message || err.message || 'Failed to load.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [formKey, workorderId]);

  const setField = (key, val) => setValues((prev) => ({ ...prev, [key]: val }));

  const buildPayload = () => ({ ...values, colorCode });

  const handleSubmit = async (action = 'submit') => {
    if (!activeCheck) return;
    setIsSubmitting(true);
    setMessage('');
    try {
      const dataPayload = buildPayload();
      if (action === 'submit') {
        await api.post('/verifications/complete', {
          workorderId,
          checkSlNo: activeCheck.slNo,
          result: colorCode === 'Red' ? 'discrepant' : colorCode === 'Amber' ? 'insufficient' : 'verified',
          notes: values.remarks || values.verifierComments || '',
          data: dataPayload,
        });
      } else {
        await api.put(`/verifications/${workorderId}/checks/${activeCheck.slNo}/draft`, {
          data: dataPayload,
          notes: values.remarks || values.verifierComments || '',
        });
      }
      setMessage(`Verification ${action === 'submit' ? 'submitted' : 'saved'} successfully!`);
    } catch (err) {
      setMessage(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const providedBoxStyle = useMemo(() => ({
    ...inputStyle,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgTertiary,
    color: theme.colors.textSecondary,
  }), []);

  const verifiedBoxStyle = useMemo(() => ({
    ...inputStyle,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgDeep,
    color: theme.colors.textPrimary,
  }), []);

  if (loading) {
    return (
      <div style={{ backgroundColor: theme.colors.bgDeep, minHeight: '100vh', color: theme.colors.textPrimary }}>
        <Header />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          Loading form…
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ backgroundColor: theme.colors.bgDeep, minHeight: '100vh', color: theme.colors.textPrimary }}>
        <Header />
        <div style={{ maxWidth: '640px', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
          <div style={{
            color: '#f87171',
            backgroundColor: 'rgba(248, 113, 113, 0.1)',
            padding: '1.5rem',
            borderRadius: '12px',
            borderLeft: '4px solid #f87171',
            marginBottom: '1.5rem',
          }}>
            {loadError}
          </div>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: theme.colors.bgTertiary,
              color: theme.colors.textPrimary,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const renderField = (field, isSplit) => {
    const value = values[field.key] ?? '';
    const commonProps = {
      value,
      onChange: (e) => setField(field.key, e.target.value),
      style: verifiedBoxStyle,
    };

    let control;
    if (field.type === 'textarea') {
      control = <textarea {...commonProps} rows={3} style={{ ...verifiedBoxStyle, resize: 'vertical' }} placeholder={field.placeholder} />;
    } else if (field.type === 'date') {
      control = <input type="date" {...commonProps} />;
    } else if (field.type === 'select') {
      control = (
        <select {...commonProps}>
          <option value="">— Select —</option>
          {(field.options || []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    } else if (field.type === 'yesno') {
      control = (
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {['Yes', 'No'].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setField(field.key, opt === 'Yes')}
              style={{
                padding: '0.55rem 1.4rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: `1px solid ${(value === true && opt === 'Yes') || (value === false && opt === 'No') ? theme.colors.accent : theme.colors.border}`,
                backgroundColor: (value === true && opt === 'Yes') || (value === false && opt === 'No') ? theme.colors.accent : 'transparent',
                color: (value === true && opt === 'Yes') || (value === false && opt === 'No') ? '#000' : theme.colors.textSecondary,
                cursor: 'pointer',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    } else {
      control = <input type="text" {...commonProps} placeholder={field.placeholder} />;
    }

    if (isSplit) {
      return (
        <React.Fragment key={field.key}>
          <div style={{ color: theme.colors.textSecondary, fontSize: '0.95rem' }}>{field.label}</div>
          <div style={providedBoxStyle}>{providedData[field.key] || '-'}</div>
          {control}
        </React.Fragment>
      );
    }

    return (
      <div key={field.key}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>{field.label}</label>
        {control}
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: theme.colors.bgDeep, minHeight: '100vh', color: theme.colors.textPrimary, fontFamily: theme.fonts.body }}>
      <Header />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 2rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem',
              backgroundColor: theme.colors.bgTertiary, color: theme.colors.textSecondary,
              border: `1px solid ${theme.colors.border}`, borderRadius: '10px',
              fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            <FiArrowLeft size={16} /> Back
          </button>
          <div style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>
            {formConfig?.title} <span style={{ margin: '0 0.4rem' }}>/</span>
            <span style={{ color: theme.colors.accent, fontWeight: 600 }}>Verification</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 2rem 3rem' }}>
        <div style={{ backgroundColor: theme.colors.bgPrimary, borderRadius: '16px', padding: '2rem', boxShadow: theme.shadows.lg }}>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem',
            borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '1.5rem', gap: '1.5rem',
          }}>
            <div>
              <h1 style={{ fontFamily: theme.fonts.display, fontSize: '2rem', fontWeight: 700, color: theme.colors.textPrimary, margin: 0 }}>
                {formConfig?.title}
              </h1>
              <p style={{ color: theme.colors.textSecondary, marginTop: '0.5rem' }}>
                Verifying for <strong>{workorder?.fullName || '—'}</strong> • BGV Ref: <strong>{workorder?.bgvRef || '—'}</strong>
              </p>
            </div>
            <div style={{
              padding: '0.5rem 1rem', backgroundColor: theme.colors.glassBg, border: `1px solid ${theme.colors.borderLight}`,
              borderRadius: '9999px', fontSize: '0.9rem', whiteSpace: 'nowrap',
            }}>
              Status: <span style={{ color: theme.colors.success }}>{activeCheck?.status || 'In Progress'}</span>
            </div>
          </div>

          {(formConfig?.sections || []).map((section, si) => {
            const isSplit = section.layout === 'split';
            return (
              <div key={si} style={{ marginBottom: '2.5rem' }}>
                {section.heading && (
                  <h3 style={{
                    fontSize: '0.95rem', fontWeight: 700, color: theme.colors.textSecondary,
                    textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '1.25rem',
                    borderBottom: `1px solid ${theme.colors.borderLight}`, paddingBottom: '0.5rem',
                  }}>
                    {section.heading}
                  </h3>
                )}

                {isSplit ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr 1.4fr', gap: '1rem 1.5rem', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, color: theme.colors.textSecondary, fontSize: '0.85rem', textTransform: 'uppercase' }}>Criteria</div>
                    <div style={{ fontWeight: 700, color: theme.colors.textSecondary, fontSize: '0.85rem', textTransform: 'uppercase' }}>Provided</div>
                    <div style={{ fontWeight: 700, color: theme.colors.textSecondary, fontSize: '0.85rem', textTransform: 'uppercase' }}>Verified</div>
                    {section.fields.map((f) => renderField(f, true))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {section.fields.map((f) => renderField(f, false))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Color Code */}
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', color: theme.colors.textSecondary, fontWeight: 600 }}>Color Code</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {['Green', 'Amber', 'Red'].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setColorCode(color)}
                  style={{
                    padding: '0.75rem 2rem',
                    borderRadius: '9999px',
                    fontWeight: 600,
                    border: `2px solid ${colorCode === color ?
                      (color === 'Green' ? theme.colors.success : color === 'Amber' ? theme.colors.amber : theme.colors.error) :
                      theme.colors.border}`,
                    backgroundColor: colorCode === color ?
                      (color === 'Green' ? '#10B981' : color === 'Amber' ? '#F59E0B' : '#EF4444') :
                      'transparent',
                    color: colorCode === color ? 'white' : theme.colors.textPrimary,
                    cursor: 'pointer',
                    transition: theme.timing.fast,
                  }}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Legend reference (informational — matches the report's own legend) */}
          {formConfig?.legend && (
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
              {formConfig.legend.map(([label, colorKey]) => {
                const swatch = { GREEN: '#10B981', YELLOW: '#F5D336', RED: '#EF4444', ORANGE: '#E68019' }[colorKey] || '#10B981';
                return (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: theme.colors.textMuted }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, background: swatch, display: 'inline-block' }} />
                    {label}
                  </div>
                );
              })}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => handleSubmit('save')}
              disabled={isSubmitting}
              style={{
                padding: '0.85rem 2.5rem', backgroundColor: theme.colors.bgTertiary, color: theme.colors.textPrimary,
                border: `1px solid ${theme.colors.border}`, borderRadius: '9999px', fontSize: '1.05rem',
                fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              Save
            </button>

            <button
              type="button"
              onClick={() => handleSubmit('submit')}
              disabled={isSubmitting}
              style={{
                padding: '0.85rem 3rem',
                background: `linear-gradient(90deg, ${theme.colors.accent}, ${theme.colors.accentHover})`,
                color: '#000', border: 'none', borderRadius: '9999px', fontSize: '1.05rem', fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.8 : 1,
                boxShadow: theme.shadows.glow,
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                padding: '0.85rem 2rem', backgroundColor: 'transparent', color: theme.colors.textSecondary,
                border: `1px solid ${theme.colors.border}`, borderRadius: '9999px', fontSize: '1.05rem', cursor: 'pointer',
              }}
            >
              Back To List
            </button>
          </div>

          {message && (
            <div style={{
              marginTop: '2rem', padding: '1rem',
              backgroundColor: message.toLowerCase().includes('success') ? theme.colors.success + '22' : theme.colors.error + '22',
              color: message.toLowerCase().includes('success') ? theme.colors.success : theme.colors.error,
              borderRadius: '8px', textAlign: 'center',
            }}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
