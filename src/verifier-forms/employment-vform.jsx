import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiEye } from 'react-icons/fi';
import Header from '../screens/header';
import api from '../apiroute/apiroute';
import theme from '../theme/theme';

// ---- Row field definitions -------------------------------------------------
const SPLIT_FIELDS = [
  { key: 'companyName', label: 'Name of the Company', type: 'text' },
  { key: 'designation', label: 'Designation', type: 'text' },
  { key: 'department', label: 'Department / Function', type: 'text' },
  { key: 'employeeId', label: 'Employee ID', type: 'text' },
  { key: 'reportingManager', label: 'Reporting Manager', type: 'text' },
  { key: 'serialNo', label: 'Employee Code / Reference No.', type: 'text' },
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
function deriveEmploymentProvided(check) {
  const structured = check?.data?.__structured || {};
  const rec = (Array.isArray(structured.records) && structured.records[0]) || {};

  const companyName =
    rec.companyName === 'Others' ? rec.companyNameOther || '' : rec.companyName || '';

  return {
    providedData: {
      companyName,
      designation: rec.positionHeld || '',
      department: rec.department || '',
      employeeId: rec.employeeCode || '',
      reportingManager: rec.reportingAuthorityName || '',
      serialNo: rec.employeeCode || '',
      dateOfJoining: rec.dateOfJoining || '',
      dateOfRelieving: rec.yetToRelieve ? '' : rec.serviceDate || '',
      companyAddress: rec.companyAddress || '',
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

const EmploymentVerificationVerifier = () => {
  const { workorderId } = useParams();
  const navigate = useNavigate();

  const [workorder, setWorkorder] = useState(null);
  const [activeCheck, setActiveCheck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Read-only left-hand side
  const [providedData, setProvidedData] = useState({});
  const [providedDocuments, setProvidedDocuments] = useState([]);

  // Editable right-hand side
  const [verified, setVerified] = useState({
    companyName: '',
    designation: '',
    department: '',
    employeeId: '',
    reportingManager: '',
    serialNo: '',
    dateOfJoining: '',
    dateOfRelieving: '',
  });

  // Per-row "Unable to Verify?" checkboxes
  const [unableToVerify, setUnableToVerify] = useState({});

  // Full-width fields
  const [companyAddress, setCompanyAddress] = useState('');
  const [currentlyEmployed, setCurrentlyEmployed] = useState(false);
  const [reasonForLeaving, setReasonForLeaving] = useState('');
  const [adverseRemarks, setAdverseRemarks] = useState('');
  const [verifiedByName, setVerifiedByName] = useState('');
  const [verifierDesignation, setVerifierDesignation] = useState('');
  const [modeOfVerification, setModeOfVerification] = useState('Email');
  const [employerCharges, setEmployerCharges] = useState('');
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

          const empCheck = (wo.checks || []).find((c) =>
            (c.checkType || '').toLowerCase().includes('employment')
          );

          if (empCheck) {
            setActiveCheck(empCheck);

            if (hasAnyValue(empCheck.providedData)) {
              setProvidedData(empCheck.providedData);
              setProvidedDocuments(
                Array.isArray(empCheck.providedDocuments) ? empCheck.providedDocuments : []
              );
            } else {
              const derived = deriveEmploymentProvided(empCheck);
              setProvidedData(derived.providedData);
              setProvidedDocuments(derived.providedDocuments);
            }

            const saved = empCheck.verifier || {};
            setVerified({
              companyName: saved.companyName || '',
              designation: saved.designation || '',
              department: saved.department || '',
              employeeId: saved.employeeId || '',
              reportingManager: saved.reportingManager || '',
              serialNo: saved.serialNo || '',
              dateOfJoining: saved.dateOfJoining || '',
              dateOfRelieving: saved.dateOfRelieving || '',
            });
            setUnableToVerify(saved.unableToVerify || {});
            setCompanyAddress(saved.companyAddress || '');
            setCurrentlyEmployed(!!saved.currentlyEmployed);
            setReasonForLeaving(saved.reasonForLeaving || '');
            setAdverseRemarks(saved.adverseRemarks || '');
            setVerifiedByName(saved.verifiedBy || '');
            setVerifierDesignation(saved.verifierDesignation || '');
            setModeOfVerification(saved.modeOfVerification || 'Email');
            setEmployerCharges(saved.employerCharges || '');
            setVerifierComments(saved.verifierComments || '');
            if (saved.colorCode) setColorCode(saved.colorCode);
          } else {
            setLoadError('No Employment check found on this workorder.');
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

  const setVerifiedField = (key, value) => {
    setVerified((prev) => ({ ...prev, [key]: value }));
  };

  // Updated toggle: when checked → copy Provided → Verified
  const toggleUnableToVerify = (key) => {
    setUnableToVerify((prev) => {
      const newState = { ...prev, [key]: !prev[key] };
      
      // If newly checked, copy from provided to verified
      if (!prev[key] && providedData[key] !== undefined) {
        const providedValue = providedData[key] || '';
        
        if (key === 'dateOfJoining' || key === 'dateOfRelieving') {
          // For dates, ensure proper format if needed
          setVerifiedField(key, providedValue);
        } else {
          setVerifiedField(key, providedValue);
        }
      }
      
      return newState;
    });
  };

  const buildPayload = () => ({
    ...verified,
    unableToVerify,
    companyAddress,
    currentlyEmployed,
    reasonForLeaving,
    adverseRemarks,
    verifiedBy: verifiedByName,
    verifierDesignation,
    modeOfVerification,
    employerCharges,
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

  // Fixed verified style - good contrast (light background + dark text)
  const verifiedBoxStyle = {
    ...inputStyle,
    borderColor: theme.colors.border,
    backgroundColor: '#f8fefd', // as mentioned by user
    color: '#111827',           // dark text for visibility
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
            Employment <span style={{ margin: '0 0.4rem' }}>/</span>
            <span style={{ color: theme.colors.accent, fontWeight: 600 }}>Verification</span>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '1.5rem 2rem 3rem',
      }}>
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
                Employment <span style={{ fontSize: '1rem', fontWeight: 400, color: theme.colors.textMuted }}>To verify employment check...</span>
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
            {/* SPLIT TABLE */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr 1.4fr 0.5fr', gap: '1rem 1.5rem', alignItems: 'center' }}>
              {/* Header */}
              <div style={{ fontWeight: 700, color: theme.colors.textSecondary, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Details</div>
              <div style={{ fontWeight: 700, color: theme.colors.textSecondary, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Provided</div>
              <div style={{ fontWeight: 700, color: theme.colors.textSecondary, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Verified</div>
              <div style={{ fontWeight: 700, color: theme.colors.textSecondary, fontSize: '0.75rem', textAlign: 'center' }}>Unable to<br />verify?</div>

              {SPLIT_FIELDS.map((f) => (
                <React.Fragment key={f.key}>
                  <div style={{ color: theme.colors.textSecondary, fontSize: '0.95rem' }}>{f.label}</div>
                  <div style={providedBoxStyle}>{providedData[f.key] || '-'}</div>
                  <input
                    type="text"
                    value={verified[f.key] || ''}
                    onChange={(e) => setVerifiedField(f.key, e.target.value)}
                    style={verifiedBoxStyle}
                  />
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <input
                      type="checkbox"
                      checked={!!unableToVerify[f.key]}
                      onChange={() => toggleUnableToVerify(f.key)}
                      style={{ width: '18px', height: '18px', accentColor: theme.colors.accent }}
                    />
                  </div>
                </React.Fragment>
              ))}

              {/* Date of Joining */}
              <div style={{ color: theme.colors.textSecondary, fontSize: '0.95rem' }}>Date of Joining (From)</div>
              <div style={providedBoxStyle}>{providedData.dateOfJoining || '-'}</div>
              <input
                type="date"
                value={verified.dateOfJoining || ''}
                onChange={(e) => setVerifiedField('dateOfJoining', e.target.value)}
                style={verifiedBoxStyle}
              />
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <input
                  type="checkbox"
                  checked={!!unableToVerify.dateOfJoining}
                  onChange={() => toggleUnableToVerify('dateOfJoining')}
                  style={{ width: '18px', height: '18px', accentColor: theme.colors.accent }}
                />
              </div>

              {/* Date of Relieving */}
              <div style={{ color: theme.colors.textSecondary, fontSize: '0.95rem' }}>Date of Relieving (To)</div>
              <div style={providedBoxStyle}>
                {providedData.dateOfRelieving || (currentlyEmployed ? 'Currently Employed' : '-')}
              </div>
              <input
                type="date"
                value={verified.dateOfRelieving || ''}
                onChange={(e) => setVerifiedField('dateOfRelieving', e.target.value)}
                disabled={currentlyEmployed}
                style={{ ...verifiedBoxStyle, opacity: currentlyEmployed ? 0.5 : 1 }}
              />
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <input
                  type="checkbox"
                  checked={!!unableToVerify.dateOfRelieving}
                  onChange={() => toggleUnableToVerify('dateOfRelieving')}
                  disabled={currentlyEmployed}
                  style={{ width: '18px', height: '18px', accentColor: theme.colors.accent }}
                />
              </div>
            </div>

            {/* Currently employed toggle */}
            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <input
                type="checkbox"
                id="currentlyEmployed"
                checked={currentlyEmployed}
                onChange={(e) => setCurrentlyEmployed(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: theme.colors.accent }}
              />
              <label htmlFor="currentlyEmployed" style={{ color: theme.colors.textSecondary, fontSize: '0.9rem' }}>
                Currently employed here
              </label>
            </div>

            {/* Full-width fields */}
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>
                  Company / Employer Address (as provided)
                </label>
                <div style={{ ...providedBoxStyle, minHeight: '4.5rem', whiteSpace: 'pre-wrap', padding: '0.85rem' }}>
                  {providedData.companyAddress || '-'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>
                  Verified Company Address
                </label>
                <textarea
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  rows={3}
                  style={{ ...verifiedBoxStyle, resize: 'vertical' }}
                  placeholder="Confirmed registered / branch office address..."
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>
                  Reason for Leaving (if applicable)
                </label>
                <input
                  type="text"
                  value={reasonForLeaving}
                  onChange={(e) => setReasonForLeaving(e.target.value)}
                  disabled={currentlyEmployed}
                  style={{ ...verifiedBoxStyle, opacity: currentlyEmployed ? 0.5 : 1 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>
                  Adverse Remarks (if any) such as termination, misconduct, disciplinary action
                </label>
                <textarea
                  value={adverseRemarks}
                  onChange={(e) => setAdverseRemarks(e.target.value)}
                  rows={2}
                  style={{ ...verifiedBoxStyle, resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>
                  Verified By Name (HR Contact)
                </label>
                <input
                  type="text"
                  value={verifiedByName}
                  onChange={(e) => setVerifiedByName(e.target.value)}
                  style={verifiedBoxStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>
                  Verifier's Designation
                </label>
                <input
                  type="text"
                  value={verifierDesignation}
                  onChange={(e) => setVerifierDesignation(e.target.value)}
                  style={verifiedBoxStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>
                  Mode of Verification
                </label>
                <select
                  value={modeOfVerification}
                  onChange={(e) => setModeOfVerification(e.target.value)}
                  style={verifiedBoxStyle}
                >
                  <option value="Email">Email</option>
                  <option value="Phone">Telephonic</option>
                  <option value="Portal">Official HR Portal</option>
                  <option value="Company letter head">Company Letter Head</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>
                  Employer Verification Charges (if any)
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <select style={{ ...verifiedBoxStyle, width: '120px' }}>
                    <option>INR</option>
                  </select>
                  <input
                    type="text"
                    value={employerCharges}
                    onChange={(e) => setEmployerCharges(e.target.value)}
                    style={verifiedBoxStyle}
                    placeholder="Amount"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>
                    Supporting Document 1
                  </label>
                  <input type="file" style={{ color: theme.colors.textSecondary, fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>
                    Supporting Document 2
                  </label>
                  <input type="file" style={{ color: theme.colors.textSecondary, fontSize: '0.85rem' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>
                  Verifier's Comments
                </label>
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
                      transition: theme.timing.fast,
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
                  boxShadow: theme.shadows.glow,
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

          {/* Documents Section */}
          <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Provided Documents */}
            <div style={{ backgroundColor: theme.colors.bgSecondary, borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{
                backgroundColor: '#111827',
                padding: '1rem 1.5rem',
                fontWeight: 600,
                borderBottom: `1px solid ${theme.colors.border}`,
              }}>
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
                          style={{ color: theme.colors.accent, background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
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
              <div style={{
                backgroundColor: '#111827',
                padding: '1rem 1.5rem',
                fontWeight: 600,
                borderBottom: `1px solid ${theme.colors.border}`,
              }}>
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
                        style={{ color: theme.colors.accent, background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
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

export default EmploymentVerificationVerifier;