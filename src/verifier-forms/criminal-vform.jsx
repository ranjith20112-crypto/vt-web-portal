import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiEye } from 'react-icons/fi';
import Header from '../screens/header';
import api from '../apiroute/apiroute';
import theme from '../theme/theme';

// ---- Row field definitions -------------------------------------------------
// Criminal / PCC (Police Clearance Certificate) checks are searched against
// the candidate's DECLARED ADDRESS for the relevant period, so the
// "Provided" side is sourced from the same address-history entry the
// Address verifier screen uses (backend matches by check.historyIndex /
// check.refId / check.subType, same convention as Address/Education/
// Employment).
const SPLIT_FIELDS = [
  { key: 'address', label: 'Address Searched', type: 'textarea' },
  { key: 'country', label: 'Country', type: 'text' },
  { key: 'state', label: 'State', type: 'text' },
  { key: 'city', label: 'City / District', type: 'text' },
  { key: 'pinCode', label: 'PinCode', type: 'text' },
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

const CriminalVerificationVerifier = () => {
  const { workorderId } = useParams();
  const navigate = useNavigate();

  const [workorder, setWorkorder] = useState(null);
  const [activeCheck, setActiveCheck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Read-only left-hand side — the address this criminal check is searched against.
  const [providedData, setProvidedData] = useState({});

  // Editable right-hand side — what the verifier confirms.
  const [verified, setVerified] = useState({
    address: '',
    country: '',
    state: '',
    city: '',
    pinCode: '',
    periodFrom: '',
    periodTo: '',
  });

  // Per-row "Is unable to verify?" checkboxes.
  const [unableToVerify, setUnableToVerify] = useState({});

  // Full-width, verifier-authored fields (no "Provided" counterpart).
  const [searchType, setSearchType] = useState('Court Records');
  const [courtName, setCourtName] = useState('');
  const [policeStation, setPoliceStation] = useState('');
  const [district, setDistrict] = useState('');
  const [caseStatus, setCaseStatus] = useState('');
  const [firNumber, setFirNumber] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [sectionsOfLaw, setSectionsOfLaw] = useState('');
  const [natureOfOffense, setNatureOfOffense] = useState('');
  const [caseFiledDate, setCaseFiledDate] = useState('');
  const [caseDisposalDate, setCaseDisposalDate] = useState('');
  const [verifyingAuthorityName, setVerifyingAuthorityName] = useState('');
  const [verifyingAuthorityDesignation, setVerifyingAuthorityDesignation] = useState('');
  const [modeOfVerification, setModeOfVerification] = useState('Court Visit');
  const [verificationCharges, setVerificationCharges] = useState('');
  const [adverseRemarks, setAdverseRemarks] = useState('');
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
        // api's baseURL already includes /api — do NOT prefix with /api again.
        const response = await api.get(`/workorders/${workorderId}`);
        if (cancelled) return;

        if (response.data.success) {
          const wo = response.data.workorder;
          setWorkorder(wo);

          const criminalCheck = (wo.checks || []).find((c) =>
            (c.checkType || '').toLowerCase().includes('criminal')
          );

          if (criminalCheck) {
            setActiveCheck(criminalCheck);

            // "Provided" side: the address entry this criminal check is
            // being searched against, populated by the backend at
            // workorder-creation time (or computed on read from
            // candidateDetails.addressHistory — same convention as the
            // Address verifier screen).
            setProvidedData(criminalCheck.providedData || {});

            // "Verified" side + full-width fields: whatever the verifier
            // already saved on a previous visit (check.verifier), so
            // re-opening a saved draft doesn't lose work.
            const saved = criminalCheck.verifier || {};
            setVerified((prev) => ({
              ...prev,
              address: saved.address || '',
              country: saved.country || '',
              state: saved.state || '',
              city: saved.city || '',
              pinCode: saved.pinCode || '',
              periodFrom: saved.periodFrom || '',
              periodTo: saved.periodTo || '',
            }));
            setUnableToVerify(saved.unableToVerify || {});
            setSearchType(saved.searchType || 'Court Records');
            setCourtName(saved.courtName || '');
            setPoliceStation(saved.policeStation || '');
            setDistrict(saved.district || '');
            setCaseStatus(saved.caseStatus || '');
            setFirNumber(saved.firNumber || '');
            setCaseNumber(saved.caseNumber || '');
            setSectionsOfLaw(saved.sectionsOfLaw || '');
            setNatureOfOffense(saved.natureOfOffense || '');
            setCaseFiledDate(saved.caseFiledDate || '');
            setCaseDisposalDate(saved.caseDisposalDate || '');
            setVerifyingAuthorityName(saved.verifyingAuthorityName || '');
            setVerifyingAuthorityDesignation(saved.verifyingAuthorityDesignation || '');
            setModeOfVerification(saved.modeOfVerification || 'Court Visit');
            setVerificationCharges(saved.verificationCharges || '');
            setAdverseRemarks(saved.adverseRemarks || '');
            setVerifierComments(saved.verifierComments || '');
            if (saved.colorCode) setColorCode(saved.colorCode);
          } else {
            setLoadError('No Criminal Record check found on this workorder.');
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
  const toggleUnableToVerify = (key) =>
    setUnableToVerify((prev) => ({ ...prev, [key]: !prev[key] }));

  const buildPayload = () => ({
    ...verified,
    unableToVerify,
    searchType,
    courtName,
    policeStation,
    district,
    caseStatus,
    firNumber,
    caseNumber,
    sectionsOfLaw,
    natureOfOffense,
    caseFiledDate,
    caseDisposalDate,
    verifyingAuthorityName,
    verifyingAuthorityDesignation,
    modeOfVerification,
    verificationCharges,
    adverseRemarks,
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

  // ---- Document tables --------------------------------------------------
  const documentEntries = workorder?.candidateDetails?.documents
    ? Object.entries(workorder.candidateDetails.documents)
    : [];

  const providedDocuments = Array.isArray(activeCheck?.providedDocuments)
    ? activeCheck.providedDocuments
    : [];

  const fileUrlBase = api?.defaults?.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : '';
  const photoUrl = workorder?.candidateDetails?.photoUrl || workorder?.candidateDetails?.photo || '';

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
  };

  const verifiedBoxStyle = {
    ...inputStyle,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgDeep,
    color: theme.colors.textPrimary,
  };

  const selectOptions = {
    searchType: ['Court Records', 'Police Verification', 'Both'],
    caseStatus: ['Select', 'No Record Found', 'Case Pending', 'Convicted', 'Acquitted', 'Not Traceable'],
    mode: ['Court Visit', 'Police Station Visit', 'Online Portal', 'Through Advocate'],
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
            Criminal Record <span style={{ margin: '0 0.4rem' }}>/</span>
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
          {/* Title */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '2rem',
            borderBottom: `1px solid ${theme.colors.border}`,
            paddingBottom: '1.5rem',
            gap: '1.5rem',
          }}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              {photoUrl && (
                <img
                  src={photoUrl.startsWith('http') ? photoUrl : `${fileUrlBase}${photoUrl}`}
                  alt={workorder?.fullName || 'Candidate'}
                  style={{
                    width: '96px',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    border: `1px solid ${theme.colors.border}`,
                  }}
                />
              )}
              <div>
                <h1 style={{
                  fontFamily: theme.fonts.display,
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: theme.colors.textPrimary,
                  margin: 0,
                }}>
                  Criminal Record <span style={{ fontSize: '1rem', fontWeight: 400, color: theme.colors.textMuted }}>To verify criminal record check...</span>
                </h1>
                <p style={{ color: theme.colors.textSecondary, marginTop: '0.5rem' }}>
                  Verifying for <strong>{workorder?.fullName || '—'}</strong> • BGV Ref: <strong>{workorder?.bgvRef || '—'}</strong>
                </p>
              </div>
            </div>

            <div style={{
              padding: '0.5rem 1rem',
              backgroundColor: theme.colors.glassBg,
              border: `1px solid ${theme.colors.borderLight}`,
              borderRadius: '9999px',
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
            }}>
              Status: <span style={{ color: theme.colors.success }}>{activeCheck?.status || 'In Progress'}</span>
            </div>
          </div>

          <form onSubmit={(e) => handleSubmit(e, 'submit')}>
            {/* ==================== SPLIT TABLE ==================== */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr 1.4fr 0.5fr', gap: '1rem 1.5rem', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, color: theme.colors.textSecondary, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Details</div>
              <div style={{ fontWeight: 700, color: theme.colors.textSecondary, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Provided</div>
              <div style={{ fontWeight: 700, color: theme.colors.textSecondary, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Verified</div>
              <div style={{ fontWeight: 700, color: theme.colors.textSecondary, fontSize: '0.75rem', textAlign: 'center' }}>Unable to<br />verify?</div>

              {SPLIT_FIELDS.map((f) => (
                <React.Fragment key={f.key}>
                  <div style={{ color: theme.colors.textSecondary, fontSize: '0.95rem', alignSelf: f.type === 'textarea' ? 'flex-start' : 'center', paddingTop: f.type === 'textarea' ? '0.65rem' : 0 }}>
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
                      value={verified[f.key]}
                      onChange={(e) => setVerifiedField(f.key, e.target.value)}
                      rows={3}
                      style={{ ...verifiedBoxStyle, resize: 'vertical' }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={verified[f.key]}
                      onChange={(e) => setVerifiedField(f.key, e.target.value)}
                      style={verifiedBoxStyle}
                    />
                  )}
                  <div style={{ display: 'flex', justifyContent: 'center', alignSelf: f.type === 'textarea' ? 'flex-start' : 'center', paddingTop: f.type === 'textarea' ? '0.85rem' : 0 }}>
                    <input
                      type="checkbox"
                      checked={!!unableToVerify[f.key]}
                      onChange={() => toggleUnableToVerify(f.key)}
                      style={{ width: '16px', height: '16px' }}
                    />
                  </div>
                </React.Fragment>
              ))}

              {/* Period of Stay at this address — From */}
              <div style={{ color: theme.colors.textSecondary, fontSize: '0.95rem' }}>Period of Stay (From)</div>
              <div style={providedBoxStyle}>{providedData.periodFrom || '-'}</div>
              <input
                type="date"
                value={verified.periodFrom}
                onChange={(e) => setVerifiedField('periodFrom', e.target.value)}
                style={verifiedBoxStyle}
              />
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <input
                  type="checkbox"
                  checked={!!unableToVerify.periodFrom}
                  onChange={() => toggleUnableToVerify('periodFrom')}
                  style={{ width: '16px', height: '16px' }}
                />
              </div>

              {/* Period of Stay at this address — To */}
              <div style={{ color: theme.colors.textSecondary, fontSize: '0.95rem' }}>Period of Stay (To)</div>
              <div style={providedBoxStyle}>{providedData.periodTo || '-'}</div>
              <input
                type="date"
                value={verified.periodTo}
                onChange={(e) => setVerifiedField('periodTo', e.target.value)}
                style={verifiedBoxStyle}
              />
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <input
                  type="checkbox"
                  checked={!!unableToVerify.periodTo}
                  onChange={() => toggleUnableToVerify('periodTo')}
                  style={{ width: '16px', height: '16px' }}
                />
              </div>
            </div>

            {/* ==================== Full-width, verifier-only fields ==================== */}
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Search Type</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {selectOptions.searchType.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSearchType(opt)}
                      style={{
                        padding: '0.6rem 1.25rem',
                        borderRadius: '9999px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        border: `1px solid ${searchType === opt ? theme.colors.accent : theme.colors.border}`,
                        backgroundColor: searchType === opt ? theme.colors.accent : 'transparent',
                        color: searchType === opt ? '#000' : theme.colors.textSecondary,
                        cursor: 'pointer',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Court Name</label>
                  <input type="text" value={courtName} onChange={(e) => setCourtName(e.target.value)} style={verifiedBoxStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Police Station</label>
                  <input type="text" value={policeStation} onChange={(e) => setPoliceStation(e.target.value)} style={verifiedBoxStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>District / Jurisdiction</label>
                  <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} style={verifiedBoxStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Case Status</label>
                  <select value={caseStatus} onChange={(e) => setCaseStatus(e.target.value)} style={verifiedBoxStyle}>
                    {selectOptions.caseStatus.map((o) => <option key={o} value={o === 'Select' ? '' : o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>FIR Number</label>
                  <input type="text" value={firNumber} onChange={(e) => setFirNumber(e.target.value)} style={verifiedBoxStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Case Number</label>
                  <input type="text" value={caseNumber} onChange={(e) => setCaseNumber(e.target.value)} style={verifiedBoxStyle} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Sections of Law Involved</label>
                <input type="text" value={sectionsOfLaw} onChange={(e) => setSectionsOfLaw(e.target.value)} style={verifiedBoxStyle} placeholder="e.g. IPC 420, IPC 34" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Nature of Offense</label>
                <textarea value={natureOfOffense} onChange={(e) => setNatureOfOffense(e.target.value)} rows={2} style={{ ...verifiedBoxStyle, resize: 'vertical' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Case Filed Date</label>
                  <input type="date" value={caseFiledDate} onChange={(e) => setCaseFiledDate(e.target.value)} style={verifiedBoxStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Case Disposal Date</label>
                  <input type="date" value={caseDisposalDate} onChange={(e) => setCaseDisposalDate(e.target.value)} style={verifiedBoxStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Verifying Authority Name</label>
                  <input type="text" value={verifyingAuthorityName} onChange={(e) => setVerifyingAuthorityName(e.target.value)} style={verifiedBoxStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Verifying Authority Designation</label>
                  <input type="text" value={verifyingAuthorityDesignation} onChange={(e) => setVerifyingAuthorityDesignation(e.target.value)} style={verifiedBoxStyle} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Mode of Verification</label>
                <select value={modeOfVerification} onChange={(e) => setModeOfVerification(e.target.value)} style={verifiedBoxStyle}>
                  {selectOptions.mode.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>
                  Verification Charges (if any)
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <select style={{ ...verifiedBoxStyle, width: '120px' }}>
                    <option>INR</option>
                  </select>
                  <input
                    type="text"
                    value={verificationCharges}
                    onChange={(e) => setVerificationCharges(e.target.value)}
                    style={verifiedBoxStyle}
                    placeholder="Amount"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Court / Police Certificate</label>
                  <input type="file" style={{ color: theme.colors.textSecondary, fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Supporting Document</label>
                  <input type="file" style={{ color: theme.colors.textSecondary, fontSize: '0.85rem' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Adverse Remarks (if any)</label>
                <textarea value={adverseRemarks} onChange={(e) => setAdverseRemarks(e.target.value)} rows={2} style={{ ...verifiedBoxStyle, resize: 'vertical' }} />
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
                Back To List
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

          {/* ==================== Document tables ==================== */}
          <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
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

export default CriminalVerificationVerifier;