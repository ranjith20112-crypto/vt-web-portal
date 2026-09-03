import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiEye } from 'react-icons/fi';
import Header from '../screens/header';
import api from '../apiroute/apiroute';
import theme from '../theme/theme';

// ---- Row field definitions -------------------------------------------------
const SPLIT_FIELDS = [
  { key: 'address', label: 'Address', type: 'textarea' },
  { key: 'country', label: 'Country', type: 'text' },
  { key: 'state', label: 'State', type: 'text' },
  { key: 'city', label: 'City', type: 'text' },
  { key: 'pinCode', label: 'PinCode', type: 'text' },
  { key: 'landMark', label: 'Land Mark', type: 'text' },
  { key: 'typeOfAccommodation', label: 'Type of Accommodation', type: 'text' },
  { key: 'ownershipStatus', label: 'Ownership Status / Nature of Residence', type: 'text' },
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
function deriveAddressProvided(check) {
  const structured = check?.data?.__structured || {};
  const block =
    (structured.sameAsPresent === false ? structured.permanent : structured.present) ||
    structured.present ||
    structured.permanent ||
    {};

  return {
    providedData: {
      address: block.address || '',
      country: block.country || '',
      state: block.state || '',
      city: block.city || '',
      pinCode: block.pincode || '',
      landMark: block.landmark || '',
      typeOfAccommodation: block.accommodationType || '',
      ownershipStatus: block.residenceType || '',
      periodFrom: block.periodFrom || '',
      periodTo: block.periodTo || '',
    },
    providedDocuments: (block.files || []).map((f) => ({
      name: f.originalName || f.fieldname || 'Document',
      type: f.fieldname || '',
      url: f.url || '',
    })),
  };
}

function hasAnyValue(obj) {
  return !!obj && Object.values(obj).some((v) => v !== undefined && v !== null && v !== '');
}

const AddressVerificationVerifier = () => {
  const { workorderId } = useParams();
  const navigate = useNavigate();

  const [workorder, setWorkorder] = useState(null);
  const [activeCheck, setActiveCheck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [providedData, setProvidedData] = useState({});
  const [providedDocuments, setProvidedDocuments] = useState([]);

  const [verified, setVerified] = useState({
    address: '',
    country: '',
    state: '',
    city: '',
    pinCode: '',
    landMark: '',
    typeOfAccommodation: '',
    ownershipStatus: '',
    periodFrom: '',
    periodTo: '',
  });

  const [unableToVerify, setUnableToVerify] = useState({});

  // Full-width fields
  const [verifiedWith, setVerifiedWith] = useState('');
  const [neighbourContacted, setNeighbourContacted] = useState('');
  const [neighbourFeedback, setNeighbourFeedback] = useState('');
  const [respondentName, setRespondentName] = useState('');
  const [relationshipWithCandidate, setRelationshipWithCandidate] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [aboutFamilyMember, setAboutFamilyMember] = useState('');
  const [isCandidateStaysHere, setIsCandidateStaysHere] = useState('');
  const [isAddressMatched, setIsAddressMatched] = useState('');
  const [isPhotoMatched, setIsPhotoMatched] = useState('');
  const [locality, setLocality] = useState('');
  const [proofVerified, setProofVerified] = useState('');
  const [proofNumber, setProofNumber] = useState('');
  const [candidateStaysWith, setCandidateStaysWith] = useState('');
  const [supervisorRemarks, setSupervisorRemarks] = useState('');
  const [verifierName, setVerifierName] = useState('');
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

          const addrCheck = (wo.checks || []).find((c) =>
            (c.checkType || '').toLowerCase().includes('address')
          );

          if (addrCheck) {
            setActiveCheck(addrCheck);

            if (hasAnyValue(addrCheck.providedData)) {
              setProvidedData(addrCheck.providedData);
              setProvidedDocuments(
                Array.isArray(addrCheck.providedDocuments) ? addrCheck.providedDocuments : []
              );
            } else {
              const derived = deriveAddressProvided(addrCheck);
              setProvidedData(derived.providedData);
              setProvidedDocuments(derived.providedDocuments);
            }

            const saved = addrCheck.verifier || {};
            setVerified({
              address: saved.address || '',
              country: saved.country || '',
              state: saved.state || '',
              city: saved.city || '',
              pinCode: saved.pinCode || '',
              landMark: saved.landMark || '',
              typeOfAccommodation: saved.typeOfAccommodation || '',
              ownershipStatus: saved.ownershipStatus || '',
              periodFrom: saved.periodFrom || '',
              periodTo: saved.periodTo || '',
            });
            setUnableToVerify(saved.unableToVerify || {});
            setVerifiedWith(saved.verifiedWith || '');
            setNeighbourContacted(saved.neighbourContacted || '');
            setNeighbourFeedback(saved.neighbourFeedback || '');
            setRespondentName(saved.respondentName || '');
            setRelationshipWithCandidate(saved.relationshipWithCandidate || '');
            setContactNumber(saved.contactNumber || '');
            setAboutFamilyMember(saved.aboutFamilyMember || '');
            setIsCandidateStaysHere(saved.isCandidateStaysHere || '');
            setIsAddressMatched(saved.isAddressMatched || '');
            setIsPhotoMatched(saved.isPhotoMatched || '');
            setLocality(saved.locality || '');
            setProofVerified(saved.proofVerified || '');
            setProofNumber(saved.proofNumber || '');
            setCandidateStaysWith(saved.candidateStaysWith || '');
            setSupervisorRemarks(saved.supervisorRemarks || '');
            setVerifierName(saved.verifierName || '');
            setVerifierComments(saved.verifierComments || '');
            if (saved.colorCode) setColorCode(saved.colorCode);
          } else {
            setLoadError('No Address check found on this workorder.');
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

  // ✅ Copy Provided to Verified when "Unable to Verify" is checked
  const toggleUnableToVerify = (key) => {
    setUnableToVerify((prev) => {
      const newState = { ...prev, [key]: !prev[key] };

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
    verifiedWith,
    neighbourContacted,
    neighbourFeedback,
    respondentName,
    relationshipWithCandidate,
    contactNumber,
    aboutFamilyMember,
    isCandidateStaysHere,
    isAddressMatched,
    isPhotoMatched,
    locality,
    proofVerified,
    proofNumber,
    candidateStaysWith,
    supervisorRemarks,
    verifierName,
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
    cursor: 'not-allowed',
  };

  // ✅ Fixed Verified styling - Light background + Dark text
  const verifiedBoxStyle = {
    ...inputStyle,
    borderColor: theme.colors.border,
    backgroundColor: '#f8fefd',
    color: '#111827',
  };

  const selectOptions = {
    yesNo: ['Select', 'Yes', 'No'],
    yesNoPartly: ['Select', 'Yes', 'No', 'Partly'],
    contacted: ['Select', 'Contacted', 'Not Contacted', 'Not Available'],
    locality: ['Select', 'Urban', 'Semi-Urban', 'Rural'],
    proof: ['Select', 'Aadhaar', 'Voter ID', 'Passport', 'Utility Bill', 'Ration Card', 'Others'],
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
            Address <span style={{ margin: '0 0.4rem' }}>/</span>
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
                  Address <span style={{ fontSize: '1rem', fontWeight: 400, color: theme.colors.textMuted }}>To verify address check...</span>
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
            {/* SPLIT TABLE */}
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

              {/* Period of Stay From */}
              <div style={{ color: theme.colors.textSecondary, fontSize: '0.95rem' }}>Period of Stay (From)</div>
              <div style={providedBoxStyle}>{providedData.periodFrom || '-'}</div>
              <input
                type="date"
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

              {/* Period of Stay To */}
              <div style={{ color: theme.colors.textSecondary, fontSize: '0.95rem' }}>Period of Stay (To)</div>
              <div style={providedBoxStyle}>{providedData.periodTo || '-'}</div>
              <input
                type="date"
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Verified With</label>
                  <input type="text" value={verifiedWith} onChange={(e) => setVerifiedWith(e.target.value)} style={verifiedBoxStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Neighbour — Contacted</label>
                  <select value={neighbourContacted} onChange={(e) => setNeighbourContacted(e.target.value)} style={verifiedBoxStyle}>
                    {selectOptions.contacted.map((o) => <option key={o} value={o === 'Select' ? '' : o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Neighbour Feedback</label>
                <textarea value={neighbourFeedback} onChange={(e) => setNeighbourFeedback(e.target.value)} rows={2} style={{ ...verifiedBoxStyle, resize: 'vertical' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Respondent&apos;s Name</label>
                  <input type="text" value={respondentName} onChange={(e) => setRespondentName(e.target.value)} style={verifiedBoxStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Relationship with Candidate</label>
                  <input type="text" value={relationshipWithCandidate} onChange={(e) => setRelationshipWithCandidate(e.target.value)} style={verifiedBoxStyle} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Land Line / Mobile Ph. No.</label>
                <input type="text" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} style={verifiedBoxStyle} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>About Family Member</label>
                <textarea value={aboutFamilyMember} onChange={(e) => setAboutFamilyMember(e.target.value)} rows={2} style={{ ...verifiedBoxStyle, resize: 'vertical' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Is Candidate Stays Here</label>
                  <select value={isCandidateStaysHere} onChange={(e) => setIsCandidateStaysHere(e.target.value)} style={verifiedBoxStyle}>
                    {selectOptions.yesNoPartly.map((o) => <option key={o} value={o === 'Select' ? '' : o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Is Address Matched</label>
                  <select value={isAddressMatched} onChange={(e) => setIsAddressMatched(e.target.value)} style={verifiedBoxStyle}>
                    {selectOptions.yesNoPartly.map((o) => <option key={o} value={o === 'Select' ? '' : o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Is Photo Matched</label>
                  <select value={isPhotoMatched} onChange={(e) => setIsPhotoMatched(e.target.value)} style={verifiedBoxStyle}>
                    {selectOptions.yesNo.map((o) => <option key={o} value={o === 'Select' ? '' : o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Locality</label>
                  <select value={locality} onChange={(e) => setLocality(e.target.value)} style={verifiedBoxStyle}>
                    {selectOptions.locality.map((o) => <option key={o} value={o === 'Select' ? '' : o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Proof Verified</label>
                  <select value={proofVerified} onChange={(e) => setProofVerified(e.target.value)} style={verifiedBoxStyle}>
                    {selectOptions.proof.map((o) => <option key={o} value={o === 'Select' ? '' : o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Proof Number</label>
                  <input type="text" value={proofNumber} onChange={(e) => setProofNumber(e.target.value)} style={verifiedBoxStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Candidate Stays With</label>
                  <input type="text" value={candidateStaysWith} onChange={(e) => setCandidateStaysWith(e.target.value)} style={verifiedBoxStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>ID Proof</label>
                  <input type="file" style={{ color: theme.colors.textSecondary, fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Building / Landmark Photo</label>
                  <input type="file" style={{ color: theme.colors.textSecondary, fontSize: '0.85rem' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Supervisor&apos;s Remarks</label>
                <textarea value={supervisorRemarks} onChange={(e) => setSupervisorRemarks(e.target.value)} rows={2} style={{ ...verifiedBoxStyle, resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Verifier Name</label>
                <input type="text" value={verifierName} onChange={(e) => setVerifierName(e.target.value)} style={verifiedBoxStyle} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.colors.textSecondary }}>Verifier&apos;s Comments</label>
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

          {/* Document tables */}
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

export default AddressVerificationVerifier;;