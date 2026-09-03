import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiEye } from 'react-icons/fi';
import Header from '../screens/header';
import api from '../apiroute/apiroute';
import theme from '../theme/theme';

// ---- Row field definitions -------------------------------------------------
const SPLIT_FIELDS = [
  { key: 'degree', label: 'Name of the Degree', type: 'text' },
  { key: 'department', label: 'Department / Major', type: 'text' },
  { key: 'collegeName', label: 'Name of the College (or) School', type: 'text' },
  { key: 'collegeAddress', label: 'Address of College (or) School Campus', type: 'textarea' },
  { key: 'affiliatedUniversity', label: 'Affiliated University / Institution / Board', type: 'text' },
  { key: 'serialNo', label: 'Serial Number / Reg. No. / Enrollment No.', type: 'text' },
];

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

// ---- Client-side fallback ---------------------------------------------
function deriveEducationProvided(check) {
  const structured = check?.data?.__structured || {};
  const rec = (Array.isArray(structured.records) && structured.records[0]) || {};

  const collegeName =
    rec.institutionName === 'Others' ? rec.institutionNameOther || '' : rec.institutionName || '';

  return {
    providedData: {
      degree: rec.degreeName || '',
      department: rec.majorSubject || '',
      collegeName,
      collegeAddress: rec.universityNameAddress || '',
      affiliatedUniversity: rec.universityNameAddress || '',
      serialNo: rec.studentId || '',
      periodFrom: rec.courseCommencementDate || '',
      periodTo: rec.courseCompletionDate || '',
    },
    providedDocuments: (rec.files || []).map((f) => ({
      name: f.originalName || f.fieldname || 'Document',
      type: f.fieldname || '',
      url: f.url || '',
    })),
  };
}

function hasAnyValue(obj) {
  return !!obj && Object.values(obj).some((v) => v !== undefined && v !== null && v !== '');
}

const EducationVerificationVerifier = () => {
  const { workorderId } = useParams();
  const navigate = useNavigate();

  const [workorder, setWorkorder] = useState(null);
  const [activeCheck, setActiveCheck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [providedData, setProvidedData] = useState({});
  const [providedDocuments, setProvidedDocuments] = useState([]);

  const [verified, setVerified] = useState({
    degree: '',
    department: '',
    collegeName: '',
    collegeAddress: '',
    affiliatedUniversity: '',
    serialNo: '',
    periodFrom: '',
    periodTo: '',
  });

  const [unableToVerify, setUnableToVerify] = useState({});

  // Full-width fields
  const [adverseRemarks, setAdverseRemarks] = useState('');
  const [verifiedByName, setVerifiedByName] = useState('');
  const [verifierDesignation, setVerifierDesignation] = useState('');
  const [modeOfVerification, setModeOfVerification] = useState('University letter head');
  const [universityCharges, setUniversityCharges] = useState('');
  const [verifierComments, setVerifierComments] = useState('');

  const [colorCode, setColorCode] = useState('Green');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!workorderId) {
      setLoadError('No workorder ID found in the URL.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchWorkorder = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const response = await api.get(`/workorders/${workorderId}`);
        if (cancelled) return;

        if (response.data.success) {
          const wo = response.data.workorder;
          setWorkorder(wo);

          const eduCheck = (wo.checks || []).find((c) =>
            (c.checkType || '').toLowerCase().includes('education')
          );

          if (eduCheck) {
            setActiveCheck(eduCheck);

            if (hasAnyValue(eduCheck.providedData)) {
              setProvidedData(eduCheck.providedData);
              setProvidedDocuments(
                Array.isArray(eduCheck.providedDocuments) ? eduCheck.providedDocuments : []
              );
            } else {
              const derived = deriveEducationProvided(eduCheck);
              setProvidedData(derived.providedData);
              setProvidedDocuments(derived.providedDocuments);
            }

            const saved = eduCheck.verifier || {};
            setVerified({
              degree: saved.degree || '',
              department: saved.department || '',
              collegeName: saved.collegeName || '',
              collegeAddress: saved.collegeAddress || '',
              affiliatedUniversity: saved.affiliatedUniversity || '',
              serialNo: saved.serialNo || '',
              periodFrom: saved.periodFrom || '',
              periodTo: saved.periodTo || '',
            });
            setUnableToVerify(saved.unableToVerify || {});
            setAdverseRemarks(saved.adverseRemarks || '');
            setVerifiedByName(saved.verifiedByName || '');
            setVerifierDesignation(saved.verifierDesignation || '');
            setModeOfVerification(saved.modeOfVerification || 'University letter head');
            setUniversityCharges(saved.universityCharges || '');
            setVerifierComments(saved.verifierComments || '');
            if (saved.colorCode) setColorCode(saved.colorCode);
          } else {
            setLoadError('No Education check found on this workorder.');
          }
        } else {
          setLoadError(response.data.message || 'Failed to load workorder.');
        }
      } catch (error) {
        console.error('Failed to fetch workorder:', error);
        setLoadError(error.response?.data?.message || error.message || 'Failed to load workorder.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchWorkorder();
    return () => { cancelled = true; };
  }, [workorderId]);

  const setVerifiedField = (key, value) => setVerified((prev) => ({ ...prev, [key]: value }));

  // ✅ Checkbox now copies Provided → Verified when checked
  const toggleUnableToVerify = (key) => {
    setUnableToVerify((prev) => {
      const newState = { ...prev, [key]: !prev[key] };

      // Copy from Provided to Verified when checkbox is checked
      if (!prev[key] && providedData[key] !== undefined) {
        const providedValue = providedData[key] || '';
        setVerifiedField(key, providedValue);
      }

      return newState;
    });
  };

  const buildPayload = () => ({
    ...verified,
    unableToVerify,
    adverseRemarks,
    verifiedByName,
    verifierDesignation,
    modeOfVerification,
    universityCharges,
    verifierComments,
    colorCode,
  });

  const handleSubmit = async (e, action = 'submit') => {
    e.preventDefault();
    if (!workorderId || !activeCheck) return;

    setIsSubmitting(true);
    setMessage('');

    try {
      const dataPayload = buildPayload();

      if (action === 'submit') {
        await api.post('/verifications/complete', {
          workorderId,
          checkSlNo: activeCheck.slNo,
          result: colorCode === 'Red' ? 'discrepant' : colorCode === 'Amber' ? 'insufficient' : 'verified',
          notes: verifierComments,
          data: dataPayload,
        });
      } else {
        await api.put(`/verifications/${workorderId}/checks/${activeCheck.slNo}/draft`, {
          data: dataPayload,
          notes: verifierComments,
        });
      }

      setMessage(`Verification ${action === 'submit' ? 'submitted' : 'saved'} successfully!`);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const documentEntries = workorder?.candidateDetails?.documents
    ? Object.entries(workorder.candidateDetails.documents)
    : [];

  const fileUrlBase = api?.defaults?.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : '';

  if (loading) {
    return (
      <div style={{ backgroundColor: theme.colors.bgDeep, minHeight: '100vh', color: theme.colors.textPrimary }}>
        <Header />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          Loading workorder…
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

  const providedBoxStyle = {
    ...inputStyle,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgTertiary,
    color: theme.colors.textSecondary,
    cursor: 'not-allowed',
  };

  // ✅ Fixed Verified Column Styling (Good Contrast)
  const verifiedBoxStyle = {
    ...inputStyle,
    borderColor: theme.colors.border,
    backgroundColor: '#f8fefd',   // Light background
    color: '#111827',             // Dark text for visibility
  };

  return (
    <div style={{
      backgroundColor: theme.colors.bgDeep,
      minHeight: '100vh',
      color: theme.colors.textPrimary,
      fontFamily: theme.fonts.body
    }}>
      <Header />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 2rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.1rem',
              backgroundColor: theme.colors.bgTertiary,
              color: theme.colors.textSecondary,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <FiArrowLeft size={16} />
            Back
          </button>

          <div style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>
            Education <span style={{ margin: '0 0.4rem' }}>/</span>
            <span style={{ color: theme.colors.accent, fontWeight: 600 }}>Verification</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 2rem 3rem' }}>
        <div style={{
          backgroundColor: theme.colors.bgPrimary,
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: theme.shadows.lg,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '2rem',
            borderBottom: `1px solid ${theme.colors.border}`,
            paddingBottom: '1.5rem',
          }}>
            <div>
              <h1 style={{
                fontFamily: theme.fonts.display,
                fontSize: '2rem',
                fontWeight: 700,
                color: theme.colors.textPrimary,
                margin: 0,
              }}>
                Education <span style={{ fontSize: '1rem', fontWeight: 400, color: theme.colors.textMuted }}>To verify education check...</span>
              </h1>
              <p style={{ color: theme.colors.textSecondary, marginTop: '0.5rem' }}>
                Verifying for <strong>{workorder?.fullName || '—'}</strong> • BGV Ref: <strong>{workorder?.bgvRef || '—'}</strong>
              </p>
            </div>

            <div style={{
              padding: '0.5rem 1rem',
              backgroundColor: theme.colors.glassBg,
              border: `1px solid ${theme.colors.borderLight}`,
              borderRadius: '9999px',
              fontSize: '0.9rem',
            }}>
              Status: <span style={{ color: theme.colors.success }}>{activeCheck?.status || 'In Progress'}</span>
            </div>
          </div>

          <form onSubmit={(e) => handleSubmit(e, 'submit')}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr 1.4fr 0.5fr', gap: '1rem 1.5rem', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, color: theme.colors.textSecondary, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Details</div>
              <div style={{ fontWeight: 700, color: theme.colors.textSecondary, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Provided</div>
              <div style={{ fontWeight: 700, color: theme.colors.textSecondary, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Verified</div>
              <div style={{ fontWeight: 700, color: theme.colors.textSecondary, fontSize: '0.75rem', textAlign: 'center' }}>Unable to<br />verify?</div>

              {SPLIT_FIELDS.map((f) => (
                <React.Fragment key={f.key}>
                  <div style={{ 
                    color: theme.colors.textSecondary, 
                    fontSize: '0.95rem', 
                    alignSelf: f.type === 'textarea' ? 'flex-start' : 'center', 
                    paddingTop: f.type === 'textarea' ? '0.65rem' : 0 
                  }}>
                    {f.label}
                  </div>
                  
                  {f.type === 'textarea' ? (
                    <div style={{ ...providedBoxStyle, whiteSpace: 'pre-wrap', minHeight: '4.5rem' }}>
                      {providedData[f.key] || '-'}
                    </div>
                  ) : (
                    <div style={providedBoxStyle}>{providedData[f.key] || '-'}</div>
                  )}

                  {f.type === 'textarea' ? (
                    <textarea
                      value={verified[f.key] || ''}
                      onChange={(e) => setVerifiedField(f.key, e.target.value)}
                      rows={3}
                      style={{ ...verifiedBoxStyle, resize: 'vertical' }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={verified[f.key] || ''}
                      onChange={(e) => setVerifiedField(f.key, e.target.value)}
                      style={verifiedBoxStyle}
                    />
                  )}

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignSelf: f.type === 'textarea' ? 'flex-start' : 'center', 
                    paddingTop: f.type === 'textarea' ? '0.85rem' : 0 
                  }}>
                    <input
                      type="checkbox"
                      checked={!!unableToVerify[f.key]}
                      onChange={() => toggleUnableToVerify(f.key)}
                      style={{ width: '18px', height: '18px', accentColor: theme.colors.accent }}
                    />
                  </div>
                </React.Fragment>
              ))}

              {/* Period From */}
              <div style={{ color: theme.colors.textSecondary, fontSize: '0.95rem' }}>Period (From)</div>
              <div style={providedBoxStyle}>{providedData.periodFrom || '-'}</div>
              <input
                type="month"
                value={verified.periodFrom || ''}
                onChange={(e) => setVerifiedField('periodFrom', e.target.value)}
                style={verifiedBoxStyle}
              />
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <input
                  type="checkbox"
                  checked={!!unableToVerify.periodFrom}
                  onChange={() => toggleUnableToVerify('periodFrom')}
                  style={{ width: '18px', height: '18px', accentColor: theme.colors.accent }}
                />
              </div>

              {/* Period To */}
              <div style={{ color: theme.colors.textSecondary, fontSize: '0.95rem' }}>Period (To)</div>
              <div style={providedBoxStyle}>{providedData.periodTo || '-'}</div>
              <input
                type="month"
                value={verified.periodTo || ''}
                onChange={(e) => setVerifiedField('periodTo', e.target.value)}
                style={verifiedBoxStyle}
              />
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <input
                  type="checkbox"
                  checked={!!unableToVerify.periodTo}
                  onChange={() => toggleUnableToVerify('periodTo')}
                  style={{ width: '18px', height: '18px', accentColor: theme.colors.accent }}
                />
              </div>
            </div>

            {/* Full-width verifier fields */}
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>
                  Adverse Remarks (if any) such as D-Bar / Educational Malpractices / Misbehaviour
                </label>
                <textarea
                  value={adverseRemarks}
                  onChange={(e) => setAdverseRemarks(e.target.value)}
                  rows={2}
                  style={{ ...verifiedBoxStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Verified By Name</label>
                  <input 
                    type="text" 
                    value={verifiedByName} 
                    onChange={(e) => setVerifiedByName(e.target.value)} 
                    style={verifiedBoxStyle} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Designation</label>
                  <input 
                    type="text" 
                    value={verifierDesignation} 
                    onChange={(e) => setVerifierDesignation(e.target.value)} 
                    style={verifiedBoxStyle} 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Mode of Verification</label>
                <select 
                  value={modeOfVerification} 
                  onChange={(e) => setModeOfVerification(e.target.value)} 
                  style={verifiedBoxStyle}
                >
                  <option value="University letter head">University letter head</option>
                  <option value="Email">Email</option>
                  <option value="Phone">Telephonic</option>
                  <option value="Portal">Official University Portal</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>
                  University / College Charges (if any)
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <select style={{ ...verifiedBoxStyle, width: '120px' }}>
                    <option>INR</option>
                  </select>
                  <input
                    type="text"
                    value={universityCharges}
                    onChange={(e) => setUniversityCharges(e.target.value)}
                    style={verifiedBoxStyle}
                    placeholder="Amount"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Supporting Document 1</label>
                  <input type="file" style={{ color: theme.colors.textSecondary, fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Supporting Document 2</label>
                  <input type="file" style={{ color: theme.colors.textSecondary, fontSize: '0.85rem' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Verifier's Comments</label>
                <textarea
                  value={verifierComments}
                  onChange={(e) => setVerifierComments(e.target.value)}
                  rows={4}
                  style={{ ...verifiedBoxStyle, resize: 'vertical' }}
                  placeholder="Additional observations..."
                />
              </div>
            </div>

            {/* Color Code */}
            <div style={{ marginTop: '2rem' }}>
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
                    }}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'save')}
                style={{
                  padding: '0.85rem 2.5rem',
                  backgroundColor: theme.colors.bgTertiary,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '9999px',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Save
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '0.85rem 3rem',
                  background: `linear-gradient(90deg, ${theme.colors.accent}, ${theme.colors.accentHover})`,
                  color: '#000',
                  border: 'none',
                  borderRadius: '9999px',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.8 : 1,
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>

              <button
                type="button"
                style={{
                  padding: '0.85rem 2rem',
                  backgroundColor: 'transparent',
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '9999px',
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                }}
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
            </div>
          </form>

          {message && (
            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: message.toLowerCase().includes('success') ? theme.colors.success + '22' : theme.colors.error + '22',
              color: message.toLowerCase().includes('success') ? theme.colors.success : theme.colors.error,
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              {message}
            </div>
          )}

          {/* Document tables */}
          <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Provided Documents */}
            <div style={{ backgroundColor: theme.colors.bgSecondary, borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#111827', padding: '1rem 1.5rem', fontWeight: 600, borderBottom: `1px solid ${theme.colors.border}` }}>
                Provided Documents
              </div>
              <div style={{ padding: providedDocuments.length ? '0.5rem' : '1.25rem' }}>
                {providedDocuments.length === 0 ? (
                  <div style={{ color: theme.colors.textMuted, fontSize: '0.85rem' }}>No documents tagged for this check yet.</div>
                ) : (
                  providedDocuments.map((doc, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', padding: '0.85rem',
                      borderBottom: i < providedDocuments.length - 1 ? `1px solid ${theme.colors.borderLight}` : 'none',
                      gap: '1rem',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{doc.name || 'Document'}</div>
                        <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>{doc.type || ''}</div>
                      </div>
                      {doc.url && (
                        <a
                          href={doc.url.startsWith('http') ? doc.url : `${fileUrlBase}${doc.url}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: theme.colors.accent }}
                        >
                          <FiDownload size={18} />
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Workorder Documents */}
            <div style={{ backgroundColor: theme.colors.bgSecondary, borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#111827', padding: '1rem 1.5rem', fontWeight: 600, borderBottom: `1px solid ${theme.colors.border}` }}>
                Workorder Documents
              </div>
              <div style={{ padding: documentEntries.length ? '0.5rem' : '1.25rem' }}>
                {documentEntries.length === 0 ? (
                  <div style={{ color: theme.colors.textMuted, fontSize: '0.85rem' }}>No documents uploaded on this workorder.</div>
                ) : (
                  documentEntries.map(([key, url], i) => (
                    <div key={key} style={{
                      display: 'flex', alignItems: 'center', padding: '0.85rem',
                      borderBottom: i < documentEntries.length - 1 ? `1px solid ${theme.colors.borderLight}` : 'none',
                      gap: '1rem',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{key}</div>
                        <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>{String(url).split('/').pop()}</div>
                      </div>
                      <a
                        href={String(url).startsWith('http') ? url : `${fileUrlBase}${url}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: theme.colors.accent }}
                      >
                        <FiEye size={18} />
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationVerificationVerifier;