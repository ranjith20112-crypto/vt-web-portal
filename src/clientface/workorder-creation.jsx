// src/components/CreateWorkorder.jsx
// client face workorder creation form
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  IoArrowBackOutline,
  IoSaveOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
  IoAddOutline,
  IoTrashOutline,
  IoDocumentTextOutline,
  IoIdCardOutline,
  IoCloudUploadOutline,
  IoCheckmarkCircle,
  IoCubeOutline,
  IoSendOutline,
  IoFlagOutline,
  IoCardOutline,
  IoPeopleOutline,
  IoPersonAddOutline,
  IoChevronForward,
  IoBusinessOutline,
  IoGitBranchOutline,
  IoDownloadOutline,
  IoPencilOutline,
  IoPauseCircleOutline,
  IoPlayCircleOutline,
  IoStopCircleOutline,
  IoBriefcaseOutline,
  IoAlertCircleOutline,
  IoWarningOutline,
  IoCloseOutline,
} from 'react-icons/io5';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../apiroute/apiroute';
import Header from '../screens/header';
import { Field, CheckboxField, FileUpload, CardHeader, SectionTitle } from '../DE/formcontrols';
import CheckFormRouter from '../DE/checkformrouter';
import { useAuth } from '../context/AuthContext';


// ---- Option data ----
const PRIORITIES = ['Standard', 'Urgent', 'Express'];
const GENDERS = ['Male', 'Female', 'Other'];
const MARITAL_STATUS = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Not Known'];
const NATIONALITIES = ['Indian', 'Nepali', 'Bhutanese', 'Other'];
const YES_NO_OPTIONS = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
];
const FRESHER_OPTIONS = [
  { value: 'Yes', label: 'Yes – No prior work experience' },
  { value: 'No', label: 'No – I have work experience' },
];
const CHECK_STATUS_OPTIONS = ['assignment-pending', 'verification-pending', 'qc', 'report'];
const CHECK_STATUS_LABELS = {
  'assignment-pending': 'Assignment Pending',
  'verification-pending': 'Verification Pending',
  qc: 'QC',
  report: 'Report',
  hold: 'On Hold',
  stopped: 'Stopped',
};
const RELATIONSHIPS = ['Father', 'Mother', 'Spouse', 'Sibling', 'Son', 'Daughter', 'Friend', 'Other'];

const DOCUMENT_TYPE_OPTIONS = [
  'Photo',
  'Letter of Authorization (LOA)',
  'Aadhaar Card',
  'PAN Card',
  'Passport',
  'Driving License',
  'Voter ID',
  'Other',
];

const cfKey = (checkTypeId, subCheckId = '') => `${checkTypeId || ''}::${subCheckId || ''}`;

const STRUCTURED_KEY = '__structured';

// --------------------------------------------------------------------
// PAYMENT-LIABILITY POLICY (client-side mirror, informational only)
//   Hold and Stop actions have NO time restriction on when they can be
//   raised. This constant is used ONLY to preview, in a professional
//   pop-up message, whether Verifitech's payment-liability policy would
//   apply to a Stop raised right now. The backend computes and stamps
//   the authoritative value; this never blocks the action.
// --------------------------------------------------------------------
const PAYMENT_GRACE_WINDOW_MS = 24 * 60 * 60 * 1000;
const isPaymentDuePreview = (createdAt) => {
  if (!createdAt) return true;
  return Date.now() - new Date(createdAt).getTime() > PAYMENT_GRACE_WINDOW_MS;
};
const paymentPolicyMessage = (paymentDue) =>
  paymentDue
    ? "As this request falls outside Verifitech's 24-hour payment-review window from workorder creation, payment is due for the verification work already initiated on this record."
    : "As this request falls within Verifitech's 24-hour payment-review window from workorder creation, no payment is due for this stop.";

// ---- File preview helpers --------------------------------------------------
const isImageUrl = (url) => /\.(jpe?g|png|gif|webp)(\?.*)?$/i.test(String(url || ''));
const isImageFile = (file) => !!file && typeof file.type === 'string' && file.type.startsWith('image/');

const DocThumb = ({ url, file, apiBaseURL, size = 56 }) => {
  const dimStyle = { width: size, height: size };

  if (file) {
    if (isImageFile(file)) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt="preview"
          style={dimStyle}
          className="rounded-lg object-cover border border-gray-300 flex-shrink-0"
        />
      );
    }
    return (
      <div style={dimStyle} className="rounded-lg border border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0">
        <IoDocumentTextOutline size={Math.round(size * 0.45)} />
      </div>
    );
  }

  if (!url) return null;
  const href = url.startsWith('http') ? url : `${apiBaseURL}${url}`;

  if (isImageUrl(url)) {
    return (
      <a href={href} target="_blank" rel="noreferrer" style={dimStyle} className="block flex-shrink-0">
        <img src={href} alt="preview" style={dimStyle} className="rounded-lg object-cover border border-gray-300" />
      </a>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={dimStyle}
      className="rounded-lg border border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 hover:border-[#00B494] hover:text-[#00806E] flex-shrink-0"
    >
      <IoDocumentTextOutline size={Math.round(size * 0.45)} />
    </a>
  );
};

const T = {
  page: 'bg-[#f8fefd] text-black',
  card: 'bg-white border border-gray-200 shadow-sm',
  cardHeader: 'bg-gray-50 border-b border-gray-200',
  muted: 'text-gray-500',
  mutedLight: 'text-gray-400',
  input: 'bg-white border border-gray-300 text-black focus:border-[#00B494]',
  accentBtn: 'bg-[#00D4AA] hover:brightness-95 text-black',
  ghostBtn: 'bg-gray-100 hover:bg-gray-200 border border-gray-300 text-black',
  outlineBtn: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
};

const getClientAuth = () => {
  try {
    const raw = localStorage.getItem('user') || localStorage.getItem('client') || '{}';
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
};

// Identity stamp sent to the Hold / Stop endpoints so the backend knows
// this action came from the CLIENT portal (triggers Customer Supporter
// notification emails) and the audit trail / StoppedManagement.jsx screen
// can show who performed it.
const getClientIdentity = () => {
  const authUser = getClientAuth();
  return {
    origin: 'client',
    name: authUser.name || authUser.fullName || authUser.companyName || 'Client',
    email: authUser.email || authUser.portalEmail || '',
    userId: authUser._id || authUser.id || '',
  };
};

const extractFields = (master) => {
  if (!master) return [];
  const raw = master.fields || master.formFields || master.customFields || master.checkFields || [];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((f) => {
      if (typeof f === 'string') return { name: f, label: f, type: 'text' };
      return {
        name: f.name || f.key || f.fieldName || f.label,
        label: f.label || f.name || f.key || 'Field',
        type: f.type || f.fieldType || 'text',
        required: !!f.required,
        options: f.options || f.choices || [],
        placeholder: f.placeholder || '',
      };
    })
    .filter((f) => f.name);
};

const extractSubChecks = (master) => {
  if (!master) return [];
  const raw = master.subChecks || master.subCheckTypes || master.subcheck || master.sub_checks || [];
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === 'string') return { value: item, label: item, id: item };
    return {
      value: item._id || item.id || item.value,
      label: item.name || item.label || item.subCheckName || item,
      id: item._id || item.id || item.value,
    };
  });
};

const normalizeCustomField = (f) => ({
  name: f.name || f.fieldName || f.key,
  label: f.label || f.fieldLabel || f.name || 'Field',
  type: f.type || f.fieldType || 'text',
  required: !!f.required,
  options: f.options || f.choices || [],
  placeholder: f.placeholder || '',
  subCheckId: f.subCheckId || null,
  subCheckName: f.subCheckName || '',
});

const mergeFields = (...lists) => {
  const out = [];
  const seen = new Set();
  lists.forEach((list) => {
    (list || []).forEach((f) => {
      if (f && f.name && !seen.has(f.name)) {
        seen.add(f.name);
        out.push(f);
      }
    });
  });
  return out;
};

const extractPackageChecks = (pkg, masterList) => {
  if (!pkg) return [];
  const raw = pkg.checkComponents || pkg.checks || [];
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      const isObj = typeof item === 'object' && item !== null;
      const code = isObj ? (item.checkType || item.checkTypeId || item._id) : item;
      const checkTypeName = isObj ? item.checkTypeName : '';

      const master =
        masterList.find((m) => m.code === code) ||
        masterList.find((m) => m._id === code) ||
        masterList.find((m) => (m.checkTypeName || m.name || m.checkType) === (checkTypeName || code));

      if (!master) return null;

      const subChecks = extractSubChecks(master);
      const subTypeCode = isObj ? (item.subType || '') : '';
      const selectedSub = subChecks.find((s) => s.value === subTypeCode);

      return {
        checkTypeId: master._id,
        checkType: master.checkTypeName || master.name || master.checkType || 'Check',
        subType: selectedSub ? selectedSub.label : (isObj ? (item.subTypeName || '') : ''),
        subCheckId: subTypeCode || null,
        infoNeeded: master.infoNeeded || 'Candidate',
        count: (isObj && item.qty) || 1,
        fields: extractFields(master),
        data: {},
        status: 'assignment-pending',
        notes: '',
        fromPackage: true,
      };
    })
    .filter(Boolean);
};

const DynamicCheckField = ({ field, value, onChange, onUploadFile, uploading, apiBaseURL }) => {
  const t = (field.type || 'text').toLowerCase();
  const common = { label: field.label, name: field.name, required: field.required, value, onChange, placeholder: field.placeholder };

  if (t === 'file' || t === 'image' || t === 'upload') {
    return (
      <div>
        <label className="block text-xs font-bold text-gray-600 tracking-wider uppercase mb-2">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center gap-3">
          <DocThumb url={value} apiBaseURL={apiBaseURL} size={56} />
          <label className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed text-sm cursor-pointer transition-all ${uploading ? 'opacity-60 cursor-wait' : 'hover:border-[#00B494] hover:text-[#00806E]'} border-gray-300 bg-white text-gray-500`}>
            <IoCloudUploadOutline size={18} />
            {uploading ? 'Uploading…' : value ? 'Replace file' : 'Choose file'}
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && onUploadFile) onUploadFile(f);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </div>
    );
  }

  if (t === 'select' || t === 'dropdown') return <Field {...common} as="select" options={field.options || []} />;
  if (t === 'textarea' || t === 'multiline') return <Field {...common} as="textarea" />;
  if (t === 'date') return <Field {...common} type="date" />;
  return <Field {...common} type={t} />;
};

const initialCandidateState = {
  personal: {
    firstName: '',
    lastName: '',
    fatherName: '',
    motherName: '',
    email: '',
    gender: '',
    dob: '',
    maritalStatus: '',
    nationality: 'Indian',
    aadhaarNumber: '',
    mobile: '',
    altMobile: '',
    bloodGroup: '',
    isFresher: '',
    isExServiceman: '',
    physicallyChallenged: false,
    disabilityDetails: '',
    chronicCondition: false,
    chronicConditionDetails: '',
  },
  secondaryContacts: [
    { contactNumber: '', contactPerson: '', relationship: '' },
    { contactNumber: '', contactPerson: '', relationship: '' },
  ],
  additional: {
    panNumber: '',
    nameOnPan: '',
    drivingLicenseNo: '',
    dlExpiryDate: '',
    voterId: '',
    ssnNo: '',
    passportNumber: '',
    passportIssueDate: '',
    passportExpiryDate: '',
    uanNumber: '',
  },
};

const CreateWorkorder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const editId = searchParams.get('id');
  const [loadingEdit, setLoadingEdit] = useState(!!editId);

  const lockedClient = user?.companyName || user?.clientName || user?.displayName || user?.client || '';
  const lockedPackage = user?.assignedPackage || user?.packageName || '';
  const lockedBranch = user?.branchName || user?.branch || '';

  const [phase, setPhase] = useState('create');
  const [savedWorkorder, setSavedWorkorder] = useState(null);
  const [activeTab, setActiveTab] = useState('candidate');

  const [isSaving, setIsSaving] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [savingCheckSlNo, setSavingCheckSlNo] = useState(null);
  const [loadingChecks, setLoadingChecks] = useState(true);

  const [checkTypeMaster, setCheckTypeMaster] = useState([]);
  const [packages, setPackages] = useState([]);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    priority: 'Standard',
    clientRef: '',
  });

  const [checks, setChecks] = useState([]);
  const [newCheck, setNewCheck] = useState({ checkTypeId: '', subCheckId: '', count: 1 });

  const [candidate, setCandidate] = useState(initialCandidateState);

  const [files, setFiles] = useState({
    passportPhoto: null,
    aadhaarFile: null,
    panFile: null,
    passportFile: null,
    dlFile: null,
    otherDocFile: null,
  });

  const [checkData, setCheckData] = useState({});
  const [checkMeta, setCheckMeta] = useState({});
  const [customFieldsCache, setCustomFieldsCache] = useState({});
  const [uploadingCheckField, setUploadingCheckField] = useState(null);

  const [uploadDocType, setUploadDocType] = useState(DOCUMENT_TYPE_OPTIONS[0]);
  const [uploadDocFile, setUploadDocFile] = useState(null);
  const [uploadDocCheckSlNo, setUploadDocCheckSlNo] = useState('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docSearchTerm, setDocSearchTerm] = useState('');

  // ---- HOLD / STOP modal state (no time restriction; payment message shown) ----
  const [holdCheckModal, setHoldCheckModal] = useState(null); // { slNo }
  const [holdCheckReason, setHoldCheckReason] = useState('');
  const [isHoldingCheck, setIsHoldingCheck] = useState(false);

  const [holdCaseModal, setHoldCaseModal] = useState(false);
  const [holdCaseReason, setHoldCaseReason] = useState('');
  const [isHoldingCase, setIsHoldingCase] = useState(false);

  const [stopCheckModal, setStopCheckModal] = useState(null); // { slNo }
  const [stopCheckReason, setStopCheckReason] = useState('');
  const [isStoppingCheck, setIsStoppingCheck] = useState(false);

  const [stopCaseModal, setStopCaseModal] = useState(false);
  const [stopCaseReason, setStopCaseReason] = useState('');
  const [isStoppingCase, setIsStoppingCase] = useState(false);

  useEffect(() => {
    const fetchMasters = async () => {
      setLoadingChecks(true);
      try {
        const [packagesRes, checksRes] = await Promise.all([
          api.get('/packages'),
          api.get('/checktypes'),
        ]);
        const rawPackages = packagesRes.data.success ? packagesRes.data.packages : [];
        setPackages(rawPackages.map((p) => ({ ...p, id: p._id, checkComponents: p.checkComponents || [] })));
        const rawCheckTypes = checksRes.data.success ? checksRes.data.checkTypes : [];
        setCheckTypeMaster(rawCheckTypes.map((c) => ({ ...c, id: c._id })));
      } catch (err) {
        console.error('Failed to fetch masters:', err);
      } finally {
        setLoadingChecks(false);
      }
    };
    fetchMasters();
  }, []);

  const ensureCustomFields = async (checkTypeId, subCheckId = '') => {
    if (!checkTypeId) return [];
    const key = cfKey(checkTypeId, subCheckId);
    if (customFieldsCache[key]) return customFieldsCache[key];

    try {
      const params = subCheckId ? { subCheckId } : {};
      const res = await api.get(`/customfields/by-checktype/${checkTypeId}`, { params });
      const fields = res.data?.success ? (res.data.fields || []).map(normalizeCustomField) : [];
      setCustomFieldsCache((prev) => ({ ...prev, [key]: fields }));
      return fields;
    } catch (err) {
      console.error('Failed to fetch custom fields:', err);
      setCustomFieldsCache((prev) => ({ ...prev, [key]: [] }));
      return [];
    }
  };

  useEffect(() => {
    if (!editId) return;
    let cancelled = false;

    const loadForEdit = async () => {
      setLoadingEdit(true);
      try {
        const res = await api.get(`/workorders/${editId}`);
        if (cancelled) return;

        if (res.data.success) {
          const wo = res.data.workorder;

          if (wo.locked) {
            alert('This workorder is finalized and cannot be edited. Unlock it from the dashboard first.');
            navigate('/workorder-dashboard');
            return;
          }

          setForm({
            fullName: wo.fullName || '',
            email: wo.email || '',
            phone: wo.phone || '',
            priority: wo.priority || 'Standard',
            clientRef: wo.clientRef || '',
          });

          const loadedChecks = (Array.isArray(wo.checks) ? wo.checks : []).map((c) => ({
            checkTypeId: c.checkTypeId || '',
            checkType: c.checkType || 'Check',
            subType: c.subType || '',
            subCheckId: c.subCheckId || null,
            infoNeeded: c.infoNeeded || 'Candidate',
            count: c.count || 1,
            fields: Array.isArray(c.fields) ? c.fields : [],
            data: c.data || {},
            status: c.status || 'assignment-pending',
            notes: c.notes || '',
            slNo: c.slNo,
          }));
          setChecks(loadedChecks);

          loadedChecks.forEach((c) => {
            if (c.checkTypeId) {
              ensureCustomFields(c.checkTypeId, '');
              if (c.subCheckId) ensureCustomFields(c.checkTypeId, c.subCheckId);
            }
          });

          const cd = wo.candidateDetails || {};
          setCandidate({
            personal: { ...initialCandidateState.personal, ...(cd.personal || {}) },
            secondaryContacts:
              Array.isArray(cd.secondaryContacts) && cd.secondaryContacts.length
                ? cd.secondaryContacts
                : initialCandidateState.secondaryContacts,
            additional: { ...initialCandidateState.additional, ...(cd.additional || {}) },
          });

          setSavedWorkorder(wo);
          setPhase('create');
        } else {
          alert(res.data.message || 'Failed to load workorder for editing.');
        }
      } catch (err) {
        console.error('Failed to load workorder for edit:', err);
        alert(err.response?.data?.message || 'Failed to load workorder for editing.');
      } finally {
        if (!cancelled) setLoadingEdit(false);
      }
    };

    loadForEdit();
    return () => { cancelled = true; };
  }, [editId, navigate]);

  useEffect(() => {
    if (editId) return;
    if (!lockedPackage || checkTypeMaster.length === 0 || packages.length === 0) return;

    const pkg = packages.find(
      (p) => (p.name || p.packageName || p.title) === lockedPackage || p.code === lockedPackage
    );
    if (!pkg) return;

    const pkgChecks = extractPackageChecks(pkg, checkTypeMaster);
    if (!pkgChecks.length) return;

    setChecks((prev) => {
      const existingKeys = new Set(prev.map((c) => `${c.checkTypeId}::${c.subCheckId || ''}`));
      const toAdd = pkgChecks.filter((c) => !existingKeys.has(`${c.checkTypeId}::${c.subCheckId || ''}`));
      if (!toAdd.length) return prev;
      toAdd.forEach((c) => {
        ensureCustomFields(c.checkTypeId, '');
        if (c.subCheckId) ensureCustomFields(c.checkTypeId, c.subCheckId);
      });
      return [...prev, ...toAdd];
    });
  }, [lockedPackage, packages, checkTypeMaster, editId]);

  useEffect(() => {
    if (!savedWorkorder?.checks?.length) return;

    const dataSeed = {};
    const metaSeed = {};

    savedWorkorder.checks.forEach((c) => {
      const slNo = String(c.slNo);
      dataSeed[slNo] = c.data || {};
      metaSeed[slNo] = { status: c.status || 'assignment-pending', notes: c.notes || '' };

      if (c.checkTypeId) {
        ensureCustomFields(c.checkTypeId, '');
        if (c.subCheckId) ensureCustomFields(c.checkTypeId, c.subCheckId);
      }
    });

    setCheckData(dataSeed);
    setCheckMeta(metaSeed);
  }, [savedWorkorder]);

  const findMaster = (id) => checkTypeMaster.find((c) => c._id === id);

  const fieldsForCheck = (chk) => {
    let baseFields = Array.isArray(chk.fields) && chk.fields.length ? chk.fields : [];
    if (!baseFields.length) {
      const master = checkTypeMaster.find((m) => m._id === chk.checkTypeId);
      baseFields = extractFields(master);
    }

    const scoped = customFieldsCache[cfKey(chk.checkTypeId, chk.subCheckId || '')] || [];
    const wide = customFieldsCache[cfKey(chk.checkTypeId, '')] || [];

    return mergeFields(baseFields, scoped, wide);
  };

  const handleFormChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const updateCandidateSection = (section, key, value) =>
    setCandidate((p) => ({ ...p, [section]: { ...p[section], [key]: value } }));

  const handlePersonalChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateCandidateSection('personal', name, type === 'checkbox' ? checked : value);
  };

  const handleAdditionalChange = (e) => updateCandidateSection('additional', e.target.name, e.target.value);

  const updateSecondaryContact = (idx, key, value) =>
    setCandidate((p) => {
      const list = [...p.secondaryContacts];
      list[idx] = { ...list[idx], [key]: value };
      return { ...p, secondaryContacts: list };
    });

  const addSecondaryContact = () =>
    setCandidate((p) => ({ ...p, secondaryContacts: [...p.secondaryContacts, { contactNumber: '', contactPerson: '', relationship: '' }] }));

  const removeSecondaryContact = (idx) =>
    setCandidate((p) => ({ ...p, secondaryContacts: p.secondaryContacts.filter((_, i) => i !== idx) }));

  const handleFileSelect = (key) => (file) => setFiles((p) => ({ ...p, [key]: file }));

  const handleCheckFieldChange = (slNo, fieldName, value) => {
    const key = String(slNo);
    setCheckData((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [fieldName]: value },
    }));
  };

  const handleCheckFileFieldUpload = async (slNo, fieldName, file) => {
    if (!savedWorkorder?._id || !file) return;
    const uploadKey = `${slNo}:${fieldName}`;
    setUploadingCheckField(uploadKey);
    try {
      const fd = new FormData();
      fd.append(fieldName, file);
      const res = await api.post(`/workorders/${savedWorkorder._id}/checks/${slNo}/documents`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        const uploadedFiles = res.data.files || [];
        const matched = uploadedFiles.find((f) => f.fieldname === fieldName) || uploadedFiles[0];
        if (matched?.url) {
          handleCheckFieldChange(slNo, fieldName, matched.url);
        }
      } else {
        alert(res.data.message || 'Failed to upload file.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload file.');
    } finally {
      setUploadingCheckField(null);
    }
  };

  const handleStructuredDataChange = (slNo, structuredData) => {
    const key = String(slNo);
    setCheckData((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [STRUCTURED_KEY]: structuredData },
    }));
  };

  const handleCheckMetaChange = (slNo, key, value) => {
    const slKey = String(slNo);
    setCheckMeta((prev) => ({
      ...prev,
      [slKey]: { ...(prev[slKey] || { status: 'assignment-pending', notes: '' }), [key]: value },
    }));
  };

  const handleAddCheck = () => {
    if (!newCheck.checkTypeId) return alert('Please select a check type.');
    const master = findMaster(newCheck.checkTypeId);
    if (!master) return;

    const subChecks = extractSubChecks(master);
    const selectedSub = subChecks.find((s) => s.value === newCheck.subCheckId);

    const entry = {
      checkTypeId: master._id,
      checkType: master.checkTypeName || master.name || master.checkType || 'Check',
      subType: selectedSub ? selectedSub.label : (master.subType || ''),
      subCheckId: newCheck.subCheckId || null,
      infoNeeded: master.infoNeeded || 'Candidate',
      count: Number(newCheck.count) || 1,
      fields: extractFields(master),
      data: {},
      status: 'assignment-pending',
      notes: '',
    };

    setChecks((prev) => [...prev, entry]);
    setNewCheck({ checkTypeId: '', subCheckId: '', count: 1 });

    ensureCustomFields(master._id, '');
    if (newCheck.subCheckId) ensureCustomFields(master._id, newCheck.subCheckId);
  };

  const handleRemoveCheck = (idx) => setChecks((prev) => prev.filter((_, i) => i !== idx));

  const handleChangeCheckType = (idx, newCheckTypeId) => {
    const master = findMaster(newCheckTypeId);
    if (!master) return;

    const current = checks[idx];
    const hasData = current?.data && Object.keys(current.data).length > 0;
    if (hasData) {
      const ok = window.confirm(
        'Changing the check type will clear the data already filled in for this check. Continue?'
      );
      if (!ok) return;
    }

    setChecks((prev) =>
      prev.map((c, i) => {
        if (i !== idx) return c;
        return {
          ...c,
          checkTypeId: master._id,
          checkType: master.checkTypeName || master.name || master.checkType || 'Check',
          subType: '',
          subCheckId: null,
          infoNeeded: master.infoNeeded || 'Candidate',
          fields: extractFields(master),
          data: {},
        };
      })
    );

    ensureCustomFields(master._id, '');

    if (current?.slNo !== undefined) {
      setCheckData((prev) => ({ ...prev, [String(current.slNo)]: {} }));
    }
  };

  const handleChangeCheckSubType = (idx, subCheckId) => {
    setChecks((prev) =>
      prev.map((c, i) => {
        if (i !== idx) return c;
        const master = findMaster(c.checkTypeId);
        const subs = extractSubChecks(master);
        const selectedSub = subs.find((s) => s.value === subCheckId);
        return { ...c, subCheckId: subCheckId || null, subType: selectedSub ? selectedSub.label : '' };
      })
    );

    const chk = checks[idx];
    if (chk?.checkTypeId && subCheckId) ensureCustomFields(chk.checkTypeId, subCheckId);
  };

  const handleChangeCheckCount = (idx, count) => {
    setChecks((prev) => prev.map((c, i) => (i === idx ? { ...c, count: Number(count) || 1 } : c)));
  };

  const buildChecksPayload = () =>
    checks.map((c) => ({
      checkType: c.checkType,
      checkTypeId: c.checkTypeId,
      subType: c.subType,
      subCheckId: c.subCheckId,
      infoNeeded: c.infoNeeded,
      count: c.count,
      fields: c.fields || [],
      data: c.data || {},
      status: c.status || 'assignment-pending',
      notes: c.notes || '',
    }));

  const handleSaveDraft = async () => {
    if (!form.fullName || !form.email || !form.phone || !lockedClient) {
      alert('Please fill all required fields.');
      return;
    }
    setIsSaving(true);
    try {
      const checksPayload = buildChecksPayload();

      if (savedWorkorder?._id) {
        const res = await api.put(`/workorders/${savedWorkorder._id}`, {
          ...form,
          checks: checksPayload,
        });
        if (res.data.success) {
          setSavedWorkorder(res.data.workorder);
          setPhase('candidate');
          setActiveTab('candidate');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        const authUser = getClientAuth();
        const payload = {
          ...form,
          client: lockedClient,
          packageName: lockedPackage,
          branch: lockedBranch,
          origin: 'client',
          createdBy: {
            origin: 'client',
            userId: authUser._id || authUser.id || '',
            name: authUser.name || authUser.fullName || lockedClient,
            email: authUser.email || '',
            role: 'client',
          },
          checks: checksPayload,
          status: 'draft',
        };

        const res = await api.post('/workorders', payload);
        if (res.data.success) {
          setSavedWorkorder(res.data.workorder);
          setPhase('candidate');
          setActiveTab('candidate');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save workorder.');
    } finally {
      setIsSaving(false);
    }
  };

  const bumpChecksToAssignmentPending = async (workorder) => {
    const woChecks = workorder?.checks || [];
    const bumped = [];
    await Promise.all(
      woChecks.map(async (c) => {
        const currentStatus = (c.status || '').toLowerCase();
        const notStarted = !currentStatus || currentStatus === 'pending' || currentStatus === 'draft';
        if (!notStarted) return;
        try {
          const res = await api.put(`/workorders/${workorder._id}/checks/${c.slNo}`, {
            data: c.data || {},
            status: 'assignment-pending',
            notes: c.notes || '',
          });
          if (res.data?.success && res.data.workorder) {
            bumped.push(res.data.workorder);
          }
        } catch (err) {
          console.error(`Failed to bump check ${c.slNo}:`, err);
        }
      })
    );
    return bumped.length ? bumped[bumped.length - 1] : workorder;
  };

  const handleSaveCandidate = async () => {
    if (!savedWorkorder?._id) return;
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append('candidateDetails', JSON.stringify(candidate));
      fd.append('status', 'candidate-details'); // Critical status for flow
      Object.entries(files).forEach(([key, file]) => {
        if (file) fd.append(key, file);
      });

      const res = await api.put(`/workorders/${savedWorkorder._id}/candidate`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        let wo = res.data.workorder;
        wo = await bumpChecksToAssignmentPending(wo);
        setSavedWorkorder(wo);

        const metaUpdates = {};
        (wo.checks || []).forEach((c) => {
          metaUpdates[String(c.slNo)] = { status: c.status || 'assignment-pending', notes: c.notes || '' };
        });
        setCheckMeta((prev) => ({ ...prev, ...metaUpdates }));

        alert('Candidate details saved! Checks moved to Assignment Pending. Status updated to reflect progress.');
      }
    } catch (err) {
      alert('Failed to save candidate details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCheck = async (slNo) => {
    if (!savedWorkorder?._id) return;
    const slKey = String(slNo);
    setSavingCheckSlNo(slKey);
    try {
      const res = await api.put(`/workorders/${savedWorkorder._id}/checks/${slNo}`, {
        data: checkData[slKey] || {},
        status: checkMeta[slKey]?.status || 'assignment-pending',
        notes: checkMeta[slKey]?.notes || '',
      });
      if (res.data.success) {
        setSavedWorkorder(res.data.workorder);
        alert('Check saved successfully!');
      }
    } catch (err) {
      alert('Failed to save check.');
    } finally {
      setSavingCheckSlNo(null);
    }
  };

  const handleSubmitWorkorder = async () => {
    if (!savedWorkorder?._id) {
      alert('Please save draft first.');
      return;
    }
    setIsSaving(true);
    try {
      const res = await api.put(`/workorders/${savedWorkorder._id}`, {
        status: 'submitted',
      });
      if (res.data.success) {
        alert(editId ? 'Workorder updated and submitted successfully!' : 'Workorder submitted successfully!');
        navigate('/workorder-dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit workorder.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitAndSendInvite = async () => {
    if (!savedWorkorder?._id) {
      alert('Please save draft first.');
      return;
    }
    setIsSendingInvite(true);
    try {
      const submitRes = await api.put(`/workorders/${savedWorkorder._id}`, { status: 'submitted' });
      if (!submitRes.data.success) throw new Error('Submit failed');

      const inviteRes = await api.post(`/workorders/${savedWorkorder._id}/send-invite`, {
        email: savedWorkorder.email || form.email,
        phone: savedWorkorder.phone || form.phone,
        fullName: savedWorkorder.fullName || form.fullName,
      });

      if (inviteRes.data.success) {
        alert(editId ? 'Workorder updated, submitted and invite sent!' : 'Workorder submitted and invite sent!');
        navigate('/workorder-dashboard');
      } else {
        alert('Workorder submitted, invite could not be sent.');
        navigate('/workorder-dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit and send invite.');
    } finally {
      setIsSendingInvite(false);
    }
  };

  // ------------------------------------------------------------------
  // HOLD CHECK  (reversible, no time restriction)
  // ------------------------------------------------------------------
  const handleHoldCheck = async () => {
    if (!savedWorkorder?._id || !holdCheckModal) return;
    if (!holdCheckReason.trim()) return alert('Please provide a reason.');
    setIsHoldingCheck(true);
    try {
      const res = await api.put(`/workorders/${savedWorkorder._id}/checks/${holdCheckModal.slNo}/hold`, {
        reason: holdCheckReason.trim(),
        raisedBy: getClientIdentity(),
      });
      if (res.data.success) {
        setSavedWorkorder(res.data.workorder);
        setHoldCheckModal(null);
        setHoldCheckReason('');
        alert('Check put on hold.');
      } else {
        alert(res.data.message || 'Failed to hold check.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to hold check.');
    } finally {
      setIsHoldingCheck(false);
    }
  };

  const handleResumeCheck = async (slNo) => {
    if (!savedWorkorder?._id) return;
    try {
      const res = await api.put(`/workorders/${savedWorkorder._id}/checks/${slNo}/hold/clear`);
      if (res.data.success) {
        setSavedWorkorder(res.data.workorder);
        alert('Check hold cleared.');
      } else {
        alert(res.data.message || 'Failed to resume check.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resume check.');
    }
  };

  // ------------------------------------------------------------------
  // HOLD ENTIRE WORKORDER (reversible, no time restriction)
  // ------------------------------------------------------------------
  const handleHoldCase = async () => {
    if (!savedWorkorder?._id) return;
    if (!holdCaseReason.trim()) return alert('Please provide a reason.');
    setIsHoldingCase(true);
    try {
      const res = await api.put(`/workorders/${savedWorkorder._id}/case-hold`, {
        reason: holdCaseReason.trim(),
        raisedBy: getClientIdentity(),
      });
      if (res.data.success) {
        setSavedWorkorder(res.data.workorder);
        setHoldCaseModal(false);
        setHoldCaseReason('');
        alert('Entire workorder put on hold. Your Customer Supporter has been notified.');
      } else {
        alert(res.data.message || 'Failed to hold workorder.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to hold workorder.');
    } finally {
      setIsHoldingCase(false);
    }
  };

  const handleResumeCase = async () => {
    if (!savedWorkorder?._id) return;
    try {
      const res = await api.put(`/workorders/${savedWorkorder._id}/case-hold/clear`);
      if (res.data.success) {
        setSavedWorkorder(res.data.workorder);
        alert('Workorder hold cleared.');
      } else {
        alert(res.data.message || 'Failed to resume workorder.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resume workorder.');
    }
  };

  // ------------------------------------------------------------------
  // STOP CHECK — PERMANENT, no time restriction, payment info shown in modal
  // ------------------------------------------------------------------
  const handleStopCheck = async () => {
    if (!savedWorkorder?._id || !stopCheckModal) return;
    if (!stopCheckReason.trim()) return alert('Please provide a reason.');
    setIsStoppingCheck(true);
    try {
      const res = await api.put(`/workorders/${savedWorkorder._id}/checks/${stopCheckModal.slNo}/stop`, {
        reason: stopCheckReason.trim(),
        stoppedBy: getClientIdentity(),
      });
      if (res.data.success) {
        setSavedWorkorder(res.data.workorder);
        setStopCheckModal(null);
        setStopCheckReason('');
        alert('Check stopped. Your Customer Supporter has been notified.');
      } else {
        alert(res.data.message || 'Failed to stop check.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to stop check.');
    } finally {
      setIsStoppingCheck(false);
    }
  };

  // ------------------------------------------------------------------
  // STOP ENTIRE WORKORDER — PERMANENT, no time restriction, payment info shown
  // ------------------------------------------------------------------
  const handleStopCase = async () => {
    if (!savedWorkorder?._id) return;
    if (!stopCaseReason.trim()) return alert('Please provide a reason.');
    setIsStoppingCase(true);
    try {
      const res = await api.put(`/workorders/${savedWorkorder._id}/stop`, {
        reason: stopCaseReason.trim(),
        stoppedBy: getClientIdentity(),
      });
      if (res.data.success) {
        setSavedWorkorder(res.data.workorder);
        setStopCaseModal(false);
        setStopCaseReason('');
        alert('Workorder stopped — every check halted. Your Customer Supporter has been notified.');
      } else {
        alert(res.data.message || 'Failed to stop workorder.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to stop workorder.');
    } finally {
      setIsStoppingCase(false);
    }
  };

  const uploadedDocs = savedWorkorder?.documents || [];

  const filteredDocs = useMemo(() => {
    if (!docSearchTerm.trim()) return uploadedDocs;
    const term = docSearchTerm.toLowerCase();
    return uploadedDocs.filter(
      (d) =>
        (d.documentType || '').toLowerCase().includes(term) ||
        (d.originalName || '').toLowerCase().includes(term) ||
        String(d.checkSlNo || '').toLowerCase().includes(term)
    );
  }, [uploadedDocs, docSearchTerm]);

  const handleUploadDocument = async () => {
    if (!savedWorkorder?._id) return;
    if (!uploadDocFile) {
      alert('Please choose a file to upload.');
      return;
    }
    setIsUploadingDoc(true);
    try {
      const fd = new FormData();
      fd.append('file', uploadDocFile);
      fd.append('documentType', uploadDocType);
      if (uploadDocCheckSlNo) fd.append('checkSlNo', uploadDocCheckSlNo);

      const res = await api.post(`/workorders/${savedWorkorder._id}/documents`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setSavedWorkorder(res.data.workorder);
        setUploadDocFile(null);
        setUploadDocType(DOCUMENT_TYPE_OPTIONS[0]);
        setUploadDocCheckSlNo('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!savedWorkorder?._id) return;
    if (!window.confirm('Remove this document?')) return;
    try {
      const res = await api.delete(`/workorders/${savedWorkorder._id}/documents/${docId}`);
      if (res.data.success) {
        setSavedWorkorder(res.data.workorder);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document.');
    }
  };

  const sidebarTabs = useMemo(() => {
    const woChecks = savedWorkorder?.checks || [];
    return [
      { id: 'candidate', label: 'Candidate Details', icon: IoPersonOutline },
      ...woChecks.map((c) => ({
        id: `check-${String(c.slNo)}`,
        label: c.subType ? `${c.checkType} - ${c.subType}` : c.checkType,
        icon: IoDocumentTextOutline,
        check: c,
      })),
      { id: 'upload', label: 'Upload Documents', icon: IoCloudUploadOutline },
    ];
  }, [savedWorkorder]);

  const checkTypeOptions = checkTypeMaster.map((c) => ({
    value: c._id,
    label: c.checkTypeName || c.name || c.checkType || 'Check',
  }));

  const savedDocs = savedWorkorder?.candidateDetails?.documents || {};
  const apiBaseURL = api?.defaults?.baseURL?.replace(/\/api\/?$/, '') || '';

  if (loadingEdit) {
    return (
      <div className={`min-h-screen ${T.page} font-sans`}>
        <Header showNavigation={false} />
        <div className="flex items-center justify-center py-24 text-lg gap-3 text-gray-600">
          <IoPencilOutline size={22} />
          Loading workorder for editing…
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${T.page} font-sans selection:bg-[#00D4AA]/30`}>
      <Header showNavigation={false} />

      {phase === 'create' && (
        <div className="bg-[#f8fefd] py-5 border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className={`flex items-center gap-2 px-4 py-2 ${T.ghostBtn} rounded-xl text-sm`}>
                <IoArrowBackOutline size={18} />
                <span>Back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-black flex items-center gap-2">
                  {editId && <IoPencilOutline size={20} className="text-[#00806E]" />}
                  {editId ? 'Edit Workorder' : 'Create New Workorder'}
                </h1>
                <p className={`text-sm ${T.muted}`}>
                  {editId
                    ? `Update basic info and verification checks${savedWorkorder?.bgvRef ? ` — ${savedWorkorder.bgvRef}` : ''}`
                    : 'Fill basic info and verification checks'}
                </p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => navigate('/workorder-dashboard')} className={`px-6 py-3 rounded-xl ${T.outlineBtn}`}>Back to Dashboard</button>
              <button onClick={handleSaveDraft} disabled={isSaving} className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 ${T.ghostBtn}`}>
                <IoSaveOutline /> {isSaving ? 'Saving...' : editId ? 'Save Changes' : 'Save as Draft'}
              </button>
              <button onClick={handleSubmitWorkorder} disabled={isSaving} className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50 ${T.accentBtn}`}>
                <IoSendOutline /> {editId ? 'Update & Submit' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'candidate' && savedWorkorder && (
        <div className="bg-white py-5 border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <button onClick={() => setPhase('create')} className="text-gray-500 hover:text-black">
                <IoArrowBackOutline size={26} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-black">Workorder: {savedWorkorder.bgvRef || 'BGV-XXXX'}</h1>
                <p className={`text-sm ${T.muted}`}>{editId ? 'Changes saved — Update candidate data' : 'Draft Saved — Enter candidate data'}</p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => (savedWorkorder.status === 'on-hold' ? handleResumeCase() : setHoldCaseModal(true))}
                disabled={savedWorkorder.stopped}
                className="px-5 py-3 rounded-xl font-semibold flex items-center gap-2 border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-50"
              >
                <IoPauseCircleOutline size={18} />
                {savedWorkorder.status === 'on-hold' ? 'Resume Workorder' : 'Hold Workorder'}
              </button>
              <button
                onClick={() => setStopCaseModal(true)}
                disabled={savedWorkorder.stopped}
                className="px-5 py-3 rounded-xl font-semibold flex items-center gap-2 border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                <IoStopCircleOutline size={18} />
                {savedWorkorder.stopped ? 'Workorder Stopped' : 'Stop Workorder'}
              </button>
              <button onClick={handleSubmitAndSendInvite} disabled={isSendingInvite || isSaving} className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50 ${T.accentBtn}`}>
                <IoPersonAddOutline /> {isSendingInvite ? 'Sending...' : editId ? 'Update Workorder' : 'Submit Workorder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'create' && (
        <main className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={`lg:col-span-1 rounded-3xl p-8 space-y-4 ${T.card}`}>
              <CardHeader icon={IoBusinessOutline} title="Client Information" />
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
                  <IoBusinessOutline className="text-[#00806E]" size={20} />
                  <div>
                    <div className={`text-xs ${T.muted}`}>CLIENT</div>
                    <div className="font-semibold text-black">{lockedClient || savedWorkorder?.client || '—'}</div>
                  </div>
                </div>
                {(lockedPackage || savedWorkorder?.packageName) && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
                    <IoCubeOutline className="text-[#00806E]" size={20} />
                    <div>
                      <div className={`text-xs ${T.muted}`}>PACKAGE</div>
                      <div className="font-semibold text-black">{lockedPackage || savedWorkorder?.packageName}</div>
                    </div>
                  </div>
                )}
                {(lockedBranch || savedWorkorder?.branch) && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
                    <IoGitBranchOutline className="text-[#00806E]" size={20} />
                    <div>
                      <div className={`text-xs ${T.muted}`}>BRANCH</div>
                      <div className="font-semibold text-black">{lockedBranch || savedWorkorder?.branch}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={`lg:col-span-2 rounded-3xl p-8 ${T.card}`}>
              <CardHeader icon={IoPersonOutline} title="Candidate Basic Information" />
              <div className="mt-8 space-y-6">
                <Field label="Full Name" name="fullName" required value={form.fullName} onChange={handleFormChange} placeholder="As per government ID" />
                <Field label="Email Address" name="email" type="email" required value={form.email} onChange={handleFormChange} placeholder="candidate@email.com" />
                <Field label="Phone Number" name="phone" type="tel" required value={form.phone} onChange={handleFormChange} placeholder="+91 99999 99999" />
                <Field label="Priority" name="priority" as="select" value={form.priority} onChange={handleFormChange} options={PRIORITIES} />
                <Field label="Client Reference" name="clientRef" value={form.clientRef} onChange={handleFormChange} placeholder="Optional reference no." />
              </div>

              <div className="mt-12">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold flex items-center gap-2 text-black"><IoShieldCheckmarkOutline size={22} className="text-[#00806E]" /> Verification Checks</h4>
                  <span className={`text-sm ${T.muted}`}>{checks.length} added</span>
                </div>

                {lockedPackage && !editId && (
                  <div className="mb-6 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-600 flex items-center gap-2">
                    <IoCubeOutline size={16} className="text-[#00806E]" />
                    Package checks are loaded automatically.
                  </div>
                )}

                {editId && (
                  <div className="mb-6 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-700 flex items-center gap-2">
                    <IoPencilOutline size={16} />
                    Editing an existing workorder — you can change a check's type, sub-type or count directly in the table below. Changing a check's type clears any data already filled in for that row. Removing a check here removes it permanently on save.
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <select value={newCheck.checkTypeId} onChange={(e) => setNewCheck((p) => ({ ...p, checkTypeId: e.target.value, subCheckId: '' }))} className={`flex-1 rounded-xl px-4 py-3 ${T.input}`}>
                      <option value="">Select Check Type</option>
                      {checkTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>

                    <select value={newCheck.subCheckId} onChange={(e) => setNewCheck((p) => ({ ...p, subCheckId: e.target.value }))} disabled={!newCheck.checkTypeId} className={`flex-1 rounded-xl px-4 py-3 disabled:opacity-50 ${T.input}`}>
                      <option value="">Select Sub-Check</option>
                      {newCheck.checkTypeId && (() => {
                        const master = findMaster(newCheck.checkTypeId);
                        const subs = extractSubChecks(master);
                        return subs.map((s, idx) => <option key={idx} value={s.value}>{s.label}</option>);
                      })()}
                    </select>

                    <input type="number" min="1" value={newCheck.count} onChange={(e) => setNewCheck((p) => ({ ...p, count: e.target.value }))} className={`w-28 rounded-xl px-4 py-3 ${T.input}`} />
                    <button onClick={handleAddCheck} className={`px-8 py-3 rounded-xl font-medium flex items-center gap-2 ${T.accentBtn}`}>
                      <IoAddOutline /> Add
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500">CHECK TYPE</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500">SUB TYPE</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500">COUNT</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500">INFO FROM</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500">SOURCE</th>
                        <th className="px-6 py-4 w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {checks.length > 0 ? checks.map((c, i) => {
                        const master = findMaster(c.checkTypeId);
                        const subs = extractSubChecks(master);
                        return (
                          <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <select
                                value={c.checkTypeId}
                                onChange={(e) => handleChangeCheckType(i, e.target.value)}
                                className={`rounded-lg px-3 py-2 text-sm ${T.input}`}
                              >
                                {!c.checkTypeId && <option value="">Select…</option>}
                                {checkTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              {subs.length > 0 ? (
                                <select
                                  value={c.subCheckId || ''}
                                  onChange={(e) => handleChangeCheckSubType(i, e.target.value)}
                                  className={`rounded-lg px-3 py-2 text-sm ${T.input}`}
                                >
                                  <option value="">— None —</option>
                                  {subs.map((s, idx) => <option key={idx} value={s.value}>{s.label}</option>)}
                                </select>
                              ) : (
                                <span className="text-gray-400 italic text-sm">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="number"
                                min="1"
                                value={c.count}
                                onChange={(e) => handleChangeCheckCount(i, e.target.value)}
                                className={`w-20 rounded-lg px-3 py-2 text-sm ${T.input}`}
                              />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{c.infoNeeded}</td>
                            <td className="px-6 py-4 text-xs">
                              {c.fromPackage ? <span className="px-2 py-1 rounded-md border border-gray-300 bg-gray-100 text-gray-600">Package</span> : <span className="px-2 py-1 rounded-md border border-gray-300 bg-white text-gray-500">Manual</span>}
                            </td>
                            <td className="px-6 py-4">
                              <button onClick={() => handleRemoveCheck(i)} className="text-red-600 hover:text-red-800"><IoTrashOutline size={20} /></button>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No checks added yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {phase === 'candidate' && savedWorkorder && (
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* ---- Stop / Hold status banners ---- */}
          {savedWorkorder.stopped && (
            <div className="mb-6 px-5 py-4 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm flex items-start gap-2">
              <IoStopCircleOutline size={18} className="mt-0.5 flex-shrink-0" />
              <div>
                This workorder was stopped on {savedWorkorder.stoppedAt ? new Date(savedWorkorder.stoppedAt).toLocaleString() : '—'}.
                {savedWorkorder.stopReason ? ` Reason: ${savedWorkorder.stopReason}` : ''}
                {typeof savedWorkorder.paymentDue === 'boolean' && (
                  <span className="block mt-1 font-semibold">
                    {savedWorkorder.paymentDue ? 'Payment is due for this stop.' : 'No payment is due for this stop.'}
                  </span>
                )}
              </div>
            </div>
          )}
          {savedWorkorder.status === 'on-hold' && !savedWorkorder.stopped && (
            <div className="mb-6 px-5 py-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-700 text-sm flex items-start gap-2">
              <IoPauseCircleOutline size={18} className="mt-0.5 flex-shrink-0" />
              <div>
                This workorder is currently on hold.
                {savedWorkorder.caseHoldReason ? ` Reason: ${savedWorkorder.caseHoldReason}` : ''}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <aside className="lg:col-span-1">
              <div className={`rounded-3xl p-6 mb-6 ${T.card}`}>
                <div className="font-bold text-xl text-black">{savedWorkorder.fullName}</div>
                <div className={`text-sm ${T.muted}`}>{savedWorkorder.email}</div>
                <div className="mt-4 text-xs bg-[#00D4AA]/10 text-[#00806E] border border-[#00D4AA]/30 px-4 py-2 rounded-2xl inline-flex items-center gap-2">
                  <IoCheckmarkCircle /> {editId ? 'Loaded for Editing' : 'Draft Saved'}
                </div>
              </div>

              <nav className={`rounded-3xl p-4 space-y-1 ${T.card}`}>
                {sidebarTabs.map((tab) => {
                  const active = activeTab === tab.id;
                  const Icon = tab.icon;
                  let hint = null;
                  if (tab.check) {
                    const d = checkData[String(tab.check.slNo)] || {};
                    hint = Object.entries(d).filter(([k, v]) => k !== STRUCTURED_KEY && v).length;
                  }
                  if (tab.id === 'upload' && uploadedDocs.length > 0) {
                    hint = uploadedDocs.length;
                  }
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-left transition-all ${active ? 'bg-[#00D4AA] text-black' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                      <Icon size={20} />
                      <span className="flex-1">{tab.label}</span>
                      {tab.check && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${active ? 'border-black/20 text-black' : 'border-gray-300 text-gray-500'}`}>
                          {CHECK_STATUS_LABELS[(tab.check.status || 'assignment-pending')] || tab.check.status}
                        </span>
                      )}
                      {hint > 0 && <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-black/10' : 'bg-gray-200'}`}>{hint}</span>}
                    </button>
                  );
                })}
              </nav>

              <button
                onClick={() => setPhase('create')}
                className={`mt-4 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium ${T.outlineBtn}`}
              >
                <IoArrowBackOutline size={16} /> Edit Basic Info / Checks
              </button>
            </aside>

            <section className="lg:col-span-3">
              {activeTab === 'candidate' && (
                <div className={`rounded-3xl overflow-hidden ${T.card}`}>
                  <div className={`px-8 py-6 flex justify-between items-center sticky top-0 z-10 ${T.cardHeader}`}>
                    <h3 className="text-xl font-bold text-black">Candidate Data Entry Form</h3>
                    <button onClick={handleSaveCandidate} disabled={isSaving} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold disabled:opacity-50 ${T.accentBtn}`}>
                      <IoSaveOutline size={18} /> {isSaving ? 'Saving...' : 'Save Candidate Data'}
                    </button>
                  </div>

                  <div className="p-8 space-y-12">
                    <div>
                      <SectionTitle icon={IoIdCardOutline} title="Basic Details" />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Field label="First Name" name="firstName" value={candidate.personal.firstName} onChange={handlePersonalChange} />
                        <Field label="Last Name" name="lastName" value={candidate.personal.lastName} onChange={handlePersonalChange} />
                        <Field label="Father's Name" name="fatherName" value={candidate.personal.fatherName} onChange={handlePersonalChange} />
                        <Field label="Mother's Name" name="motherName" value={candidate.personal.motherName} onChange={handlePersonalChange} />
                        <Field label="Email Address" name="email" type="email" required value={candidate.personal.email} onChange={handlePersonalChange} />
                        <Field label="Gender" name="gender" as="select" required options={GENDERS} value={candidate.personal.gender} onChange={handlePersonalChange} />
                        <Field label="Date of Birth" name="dob" type="date" required value={candidate.personal.dob} onChange={handlePersonalChange} />
                        <Field label="Marital Status" name="maritalStatus" as="select" options={MARITAL_STATUS} value={candidate.personal.maritalStatus} onChange={handlePersonalChange} />
                        <Field label="Nationality" name="nationality" as="select" options={NATIONALITIES} value={candidate.personal.nationality} onChange={handlePersonalChange} />
                        <Field label="Aadhaar Number" name="aadhaarNumber" required value={candidate.personal.aadhaarNumber} onChange={handlePersonalChange} />
                        <Field label="Mobile Number" name="mobile" type="tel" required value={candidate.personal.mobile} onChange={handlePersonalChange} />
                        <Field label="Alternate Mobile" name="altMobile" type="tel" value={candidate.personal.altMobile} onChange={handlePersonalChange} />
                        <Field label="Blood Group" name="bloodGroup" as="select" required options={BLOOD_GROUPS} value={candidate.personal.bloodGroup} onChange={handlePersonalChange} />
                        <Field label="Is Fresher" name="isFresher" as="select" options={FRESHER_OPTIONS} value={candidate.personal.isFresher} onChange={handlePersonalChange} />
                        <Field label="Ex-Serviceman" name="isExServiceman" as="select" options={YES_NO_OPTIONS} value={candidate.personal.isExServiceman} onChange={handlePersonalChange} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <CheckboxField label="Physically Challenged?" name="physicallyChallenged" checked={candidate.personal.physicallyChallenged} onChange={handlePersonalChange} />
                        <CheckboxField label="Any Chronic Health Issues?" name="chronicCondition" checked={candidate.personal.chronicCondition} onChange={handlePersonalChange} />
                        <Field label="Disability Details" name="disabilityDetails" as="textarea" value={candidate.personal.disabilityDetails} onChange={handlePersonalChange} />
                        <Field label="Chronic Condition Details" name="chronicConditionDetails" as="textarea" value={candidate.personal.chronicConditionDetails} onChange={handlePersonalChange} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <SectionTitle icon={IoPeopleOutline} title="Secondary Contact Details" />
                        <button onClick={addSecondaryContact} className="flex items-center gap-1 text-xs font-semibold text-[#00806E] border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50">
                          <IoAddOutline size={16} /> Add Contact
                        </button>
                      </div>
                      <div className="space-y-4">
                        {candidate.secondaryContacts.map((sc, idx) => (
                          <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border border-gray-200 rounded-xl">
                            <div className="text-sm font-bold text-gray-400">{idx + 1}</div>
                            <Field label="Contact Number" name="contactNumber" type="tel" value={sc.contactNumber} onChange={(e) => updateSecondaryContact(idx, 'contactNumber', e.target.value)} />
                            <Field label="Contact Person" name="contactPerson" value={sc.contactPerson} onChange={(e) => updateSecondaryContact(idx, 'contactPerson', e.target.value)} />
                            <div className="flex gap-2 items-end">
                              <div className="flex-1">
                                <Field label="Relationship" name="relationship" as="select" options={RELATIONSHIPS} value={sc.relationship} onChange={(e) => updateSecondaryContact(idx, 'relationship', e.target.value)} />
                              </div>
                              {candidate.secondaryContacts.length > 1 && (
                                <button onClick={() => removeSecondaryContact(idx)} className="text-red-600 hover:text-red-800 p-2">
                                  <IoTrashOutline size={18} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <SectionTitle icon={IoCardOutline} title="Additional Details" />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Field label="PAN Number" name="panNumber" value={candidate.additional.panNumber} onChange={handleAdditionalChange} />
                        <Field label="Name on PAN" name="nameOnPan" value={candidate.additional.nameOnPan} onChange={handleAdditionalChange} />
                        <Field label="Driving License No" name="drivingLicenseNo" value={candidate.additional.drivingLicenseNo} onChange={handleAdditionalChange} />
                        <Field label="DL Expiry Date" name="dlExpiryDate" type="date" value={candidate.additional.dlExpiryDate} onChange={handleAdditionalChange} />
                        <Field label="Voter Id" name="voterId" value={candidate.additional.voterId} onChange={handleAdditionalChange} />
                        <Field label="SSN No" name="ssnNo" value={candidate.additional.ssnNo} onChange={handleAdditionalChange} />
                        <Field label="Passport Number" name="passportNumber" value={candidate.additional.passportNumber} onChange={handleAdditionalChange} />
                        <Field label="Passport Issue Date" name="passportIssueDate" type="date" value={candidate.additional.passportIssueDate} onChange={handleAdditionalChange} />
                        <Field label="Passport Expiry Date" name="passportExpiryDate" type="date" value={candidate.additional.passportExpiryDate} onChange={handleAdditionalChange} />
                        <Field label="UAN Number" name="uanNumber" value={candidate.additional.uanNumber} onChange={handleAdditionalChange} />
                      </div>
                    </div>

                    <div>
                      <SectionTitle icon={IoCloudUploadOutline} title="Document Upload" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <FileUpload label="Passport Photo" file={files.passportPhoto} onSelect={handleFileSelect('passportPhoto')} />
                          <div className="mt-2 flex items-center gap-2">
                            <DocThumb url={files.passportPhoto ? null : savedDocs.passportPhoto} file={files.passportPhoto} apiBaseURL={apiBaseURL} size={56} />
                            {!files.passportPhoto && savedDocs.passportPhoto && <span className="text-xs text-gray-400">Currently saved file</span>}
                          </div>
                        </div>
                        <div>
                          <FileUpload label="Aadhaar Document" file={files.aadhaarFile} onSelect={handleFileSelect('aadhaarFile')} />
                          <div className="mt-2 flex items-center gap-2">
                            <DocThumb url={files.aadhaarFile ? null : savedDocs.aadhaarFile} file={files.aadhaarFile} apiBaseURL={apiBaseURL} size={56} />
                            {!files.aadhaarFile && savedDocs.aadhaarFile && <span className="text-xs text-gray-400">Currently saved file</span>}
                          </div>
                        </div>
                        <div>
                          <FileUpload label="PAN Document" file={files.panFile} onSelect={handleFileSelect('panFile')} />
                          <div className="mt-2 flex items-center gap-2">
                            <DocThumb url={files.panFile ? null : savedDocs.panFile} file={files.panFile} apiBaseURL={apiBaseURL} size={56} />
                            {!files.panFile && savedDocs.panFile && <span className="text-xs text-gray-400">Currently saved file</span>}
                          </div>
                        </div>
                        <div>
                          <FileUpload label="Passport Document" file={files.passportFile} onSelect={handleFileSelect('passportFile')} />
                          <div className="mt-2 flex items-center gap-2">
                            <DocThumb url={files.passportFile ? null : savedDocs.passportFile} file={files.passportFile} apiBaseURL={apiBaseURL} size={56} />
                            {!files.passportFile && savedDocs.passportFile && <span className="text-xs text-gray-400">Currently saved file</span>}
                          </div>
                        </div>
                        <div>
                          <FileUpload label="Driving License Document" file={files.dlFile} onSelect={handleFileSelect('dlFile')} />
                          <div className="mt-2 flex items-center gap-2">
                            <DocThumb url={files.dlFile ? null : savedDocs.dlFile} file={files.dlFile} apiBaseURL={apiBaseURL} size={56} />
                            {!files.dlFile && savedDocs.dlFile && <span className="text-xs text-gray-400">Currently saved file</span>}
                          </div>
                        </div>
                        <div>
                          <FileUpload label="Other Supporting Document" file={files.otherDocFile} onSelect={handleFileSelect('otherDocFile')} />
                          <div className="mt-2 flex items-center gap-2">
                            <DocThumb url={files.otherDocFile ? null : savedDocs.otherDocFile} file={files.otherDocFile} apiBaseURL={apiBaseURL} size={56} />
                            {!files.otherDocFile && savedDocs.otherDocFile && <span className="text-xs text-gray-400">Currently saved file</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-200">
                      <button onClick={handleSaveCandidate} disabled={isSaving} className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold disabled:opacity-50 ${T.accentBtn}`}>
                        <IoSaveOutline size={18} /> {isSaving ? 'Saving...' : 'Save Candidate Data'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab.startsWith('check-') && (() => {
                const slNo = activeTab.replace('check-', '');
                const currentCheck =
                  (savedWorkorder?.checks || []).find((c) => String(c.slNo) === slNo) ||
                  checks.find((c, idx) => String(idx) === slNo) ||
                  checks.find((c) => String(c.slNo) === slNo);

                if (!currentCheck) return <div className="p-8 text-red-600">Check not found</div>;

                const fields = fieldsForCheck(currentCheck);
                const meta = checkMeta[slNo] || { status: 'assignment-pending', notes: '' };
                const fullData = checkData[slNo] || {};
                const structuredData = fullData[STRUCTURED_KEY] || {};

                const formCheckType = currentCheck.checkType;
                const formSubType = currentCheck.subType;

                return (
                  <div className={`rounded-3xl overflow-hidden ${T.card}`}>
                    <div className={`px-8 py-6 flex justify-between items-center flex-wrap gap-3 ${T.cardHeader}`}>
                      <div>
                        <h3 className="text-xl font-bold text-black">{currentCheck.checkType}</h3>
                        {currentCheck.subType && <p className="text-gray-500 italic">{currentCheck.subType}</p>}
                        {currentCheck.status === 'hold' && (
                          <p className="text-xs text-amber-600 mt-1 font-semibold">On hold{currentCheck.holdReason ? `: ${currentCheck.holdReason}` : ''}</p>
                        )}
                        {currentCheck.stopped && (
                          <p className="text-xs text-red-600 mt-1 font-semibold">Stopped{currentCheck.stopReason ? `: ${currentCheck.stopReason}` : ''}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {currentCheck.status === 'hold' ? (
                          <button onClick={() => handleResumeCheck(slNo)} className="px-4 py-3 rounded-2xl font-semibold border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-2">
                            <IoPlayCircleOutline size={16} /> Resume Check
                          </button>
                        ) : (
                          <button
                            onClick={() => setHoldCheckModal({ slNo })}
                            disabled={currentCheck.stopped}
                            className="px-4 py-3 rounded-2xl font-semibold border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 flex items-center gap-2 disabled:opacity-50"
                          >
                            <IoPauseCircleOutline size={16} /> Hold Check
                          </button>
                        )}
                        <button
                          onClick={() => setStopCheckModal({ slNo })}
                          disabled={currentCheck.stopped}
                          className="px-4 py-3 rounded-2xl font-semibold border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 flex items-center gap-2 disabled:opacity-50"
                        >
                          <IoStopCircleOutline size={16} /> {currentCheck.stopped ? 'Stopped' : 'Stop Check'}
                        </button>
                        <button onClick={() => handleSaveCheck(slNo)} disabled={savingCheckSlNo === slNo} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold disabled:opacity-50 ${T.accentBtn}`}>
                          {savingCheckSlNo === slNo ? 'Saving...' : 'Save Check'}
                        </button>
                      </div>
                    </div>

                    <div className="p-8 space-y-10">
                      <CheckFormRouter
                        checkType={formCheckType}
                        subType={formSubType}
                        data={structuredData}
                        onDataChange={(next) => handleStructuredDataChange(slNo, next)}
                        workorderId={savedWorkorder._id}
                        slNo={slNo}
                      />

                      {fields.length > 0 && (
                        <div>
                          <SectionTitle icon={IoDocumentTextOutline} title="Additional Fields" />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {fields.map((field, idx) => (
                              <DynamicCheckField
                                key={`${field.name}-${idx}`}
                                field={field}
                                value={fullData[field.name] || ''}
                                onChange={(e) => handleCheckFieldChange(slNo, field.name, e.target.value)}
                                onUploadFile={(file) => handleCheckFileFieldUpload(slNo, field.name, file)}
                                uploading={uploadingCheckField === `${slNo}:${field.name}`}
                                apiBaseURL={apiBaseURL}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                        <SectionTitle icon={IoFlagOutline} title="Status & Notes" />
                        <div className="flex items-center gap-2 mb-6 flex-wrap">
                          {CHECK_STATUS_OPTIONS.map((st, idx) => {
                            const activeIdx = CHECK_STATUS_OPTIONS.indexOf(meta.status);
                            const done = idx <= activeIdx;
                            return (
                              <React.Fragment key={st}>
                                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${done ? 'bg-[#00D4AA] text-black border-[#00D4AA]' : 'bg-white text-gray-400 border-gray-300'}`}>
                                  {CHECK_STATUS_LABELS[st]}
                                </span>
                                {idx < CHECK_STATUS_OPTIONS.length - 1 && <IoChevronForward size={12} className="text-gray-300" />}
                              </React.Fragment>
                            );
                          })}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-bold text-gray-600 tracking-wider uppercase mb-2">Status</label>
                            <select value={meta.status} onChange={(e) => handleCheckMetaChange(slNo, 'status', e.target.value)} className={`w-full rounded-xl px-4 py-3.5 ${T.input}`}>
                              {CHECK_STATUS_OPTIONS.map((st) => (
                                <option key={st} value={st}>{CHECK_STATUS_LABELS[st]}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Field label="Notes / Remarks" name="notes" as="textarea" value={meta.notes} onChange={(e) => handleCheckMetaChange(slNo, 'notes', e.target.value)} placeholder="Any observations..." />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {activeTab === 'upload' && (
                <div className="space-y-6">
                  <div className={`rounded-3xl overflow-hidden ${T.card}`}>
                    <div className={`px-8 py-6 ${T.cardHeader}`}>
                      <h3 className="text-xl font-bold text-black flex items-center gap-2">
                        <IoCloudUploadOutline size={22} className="text-[#00806E]" /> Upload Supporting Documents
                      </h3>
                    </div>
                    <div className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-1">
                          <label className="block text-xs font-bold text-gray-600 tracking-wider uppercase mb-2">Document Type</label>
                          <select
                            value={uploadDocType}
                            onChange={(e) => setUploadDocType(e.target.value)}
                            className={`w-full rounded-xl px-4 py-3.5 ${T.input}`}
                          >
                            {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-1">
                          <label className="block text-xs font-bold text-gray-600 tracking-wider uppercase mb-2">Related Check (optional)</label>
                          <select
                            value={uploadDocCheckSlNo}
                            onChange={(e) => setUploadDocCheckSlNo(e.target.value)}
                            className={`w-full rounded-xl px-4 py-3.5 ${T.input}`}
                          >
                            <option value="">— General (not check specific) —</option>
                            {(savedWorkorder?.checks || []).map((c) => (
                              <option key={c.slNo} value={c.slNo}>
                                {c.subType ? `${c.checkType} - ${c.subType}` : c.checkType}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-1">
                          <FileUpload label="Document" file={uploadDocFile} onSelect={setUploadDocFile} />
                          {uploadDocFile && (
                            <div className="mt-2 flex items-center gap-2">
                              <DocThumb file={uploadDocFile} apiBaseURL={apiBaseURL} size={40} />
                              <span className="text-xs text-gray-500 truncate">{uploadDocFile.name}</span>
                            </div>
                          )}
                        </div>

                        <div className="md:col-span-1">
                          <button
                            onClick={handleUploadDocument}
                            disabled={isUploadingDoc}
                            className={`w-full px-8 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 ${T.accentBtn}`}
                          >
                            <IoCloudUploadOutline /> {isUploadingDoc ? 'Uploading...' : 'Upload'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-3xl overflow-hidden ${T.card}`}>
                    <div className={`px-8 py-6 flex items-center justify-between flex-wrap gap-4 ${T.cardHeader}`}>
                      <h3 className="text-xl font-bold text-black">Uploaded Documents</h3>
                      <input
                        type="text"
                        value={docSearchTerm}
                        onChange={(e) => setDocSearchTerm(e.target.value)}
                        placeholder="Search..."
                        className={`rounded-xl px-4 py-2 text-sm focus:outline-none ${T.input}`}
                      />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500">S.NO</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500">CHECK</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500">DOCUMENT TYPE</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500">DOCUMENT</th>
                            <th className="px-6 py-4 w-24 text-left text-xs font-bold text-gray-500">ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDocs.length > 0 ? filteredDocs.map((doc, i) => {
                            const relatedCheck = (savedWorkorder?.checks || []).find((c) => String(c.slNo) === String(doc.checkSlNo));
                            return (
                              <tr key={doc.id} className="border-t border-gray-100 hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-600">{i + 1}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {relatedCheck ? (relatedCheck.subType ? `${relatedCheck.checkType} - ${relatedCheck.subType}` : relatedCheck.checkType) : '—'}
                                </td>
                                <td className="px-6 py-4 font-medium text-black">{doc.documentType}</td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <DocThumb url={doc.url} apiBaseURL={apiBaseURL} size={40} />
                                    <a
                                      href={`${apiBaseURL}${doc.url}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-sm text-[#00806E] underline flex items-center gap-1"
                                    >
                                      <IoDownloadOutline size={16} /> {doc.originalName || 'View File'}
                                    </a>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <button onClick={() => handleDeleteDocument(doc.id)} className="text-red-600 hover:text-red-800">
                                    <IoTrashOutline size={20} />
                                  </button>
                                </td>
                              </tr>
                            );
                          }) : (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No documents uploaded yet</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      )}

      {/* ================= HOLD CHECK MODAL ================= */}
      {holdCheckModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => !isHoldingCheck && setHoldCheckModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <IoPauseCircleOutline size={20} className="text-amber-500" /> Hold This Check
              </h3>
              <button onClick={() => !isHoldingCheck && setHoldCheckModal(null)} className="text-gray-400 hover:text-gray-700">
                <IoCloseOutline size={22} />
              </button>
            </div>
            <textarea
              value={holdCheckReason}
              onChange={(e) => setHoldCheckReason(e.target.value)}
              rows={4}
              placeholder="Reason for hold..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none mb-4 focus:border-amber-400"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setHoldCheckModal(null)} disabled={isHoldingCheck} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button onClick={handleHoldCheck} disabled={isHoldingCheck || !holdCheckReason.trim()} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold disabled:opacity-50">
                {isHoldingCheck ? 'Holding...' : 'Hold Check'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= HOLD CASE MODAL ================= */}
      {holdCaseModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => !isHoldingCase && setHoldCaseModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <IoBriefcaseOutline size={20} className="text-amber-600" /> Hold Entire Workorder
              </h3>
              <button onClick={() => !isHoldingCase && setHoldCaseModal(false)} className="text-gray-400 hover:text-gray-700">
                <IoCloseOutline size={22} />
              </button>
            </div>
            <textarea
              value={holdCaseReason}
              onChange={(e) => setHoldCaseReason(e.target.value)}
              rows={4}
              placeholder="Reason for hold..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none mb-4 focus:border-amber-400"
            />
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-4">Your Customer Supporter will be notified by email.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setHoldCaseModal(false)} disabled={isHoldingCase} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button onClick={handleHoldCase} disabled={isHoldingCase || !holdCaseReason.trim()} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold disabled:opacity-50">
                {isHoldingCase ? 'Holding...' : 'Hold Workorder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STOP CHECK MODAL — no time restriction, payment notice ================= */}
      {stopCheckModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => !isStoppingCheck && setStopCheckModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                <IoStopCircleOutline size={20} /> Stop This Check
              </h3>
              <button onClick={() => !isStoppingCheck && setStopCheckModal(null)} className="text-gray-400 hover:text-gray-700">
                <IoCloseOutline size={22} />
              </button>
            </div>
            <textarea
              value={stopCheckReason}
              onChange={(e) => setStopCheckReason(e.target.value)}
              rows={4}
              placeholder="Reason for stopping..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none mb-4 focus:border-red-400"
            />
            <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 mb-3">
              <IoCardOutline size={15} className="text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-700">
                <b>Payment Notice:</b> {paymentPolicyMessage(isPaymentDuePreview(savedWorkorder?.createdAt))}
              </p>
            </div>
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">
              This cannot be undone, and your Customer Supporter will be emailed.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setStopCheckModal(null)} disabled={isStoppingCheck} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button onClick={handleStopCheck} disabled={isStoppingCheck || !stopCheckReason.trim()} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold disabled:opacity-50">
                {isStoppingCheck ? 'Stopping...' : 'Stop Check'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STOP CASE MODAL — no time restriction, payment notice ================= */}
      {stopCaseModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => !isStoppingCase && setStopCaseModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                <IoBriefcaseOutline size={20} /> Stop Entire Workorder
              </h3>
              <button onClick={() => !isStoppingCase && setStopCaseModal(false)} className="text-gray-400 hover:text-gray-700">
                <IoCloseOutline size={22} />
              </button>
            </div>
            <textarea
              value={stopCaseReason}
              onChange={(e) => setStopCaseReason(e.target.value)}
              rows={4}
              placeholder="Reason for stopping..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none mb-4 focus:border-red-400"
            />
            <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 mb-3">
              <IoCardOutline size={15} className="text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-700">
                <b>Payment Notice:</b> {paymentPolicyMessage(isPaymentDuePreview(savedWorkorder?.createdAt))}
              </p>
            </div>
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">
              This halts every check at once, cannot be undone, and your Customer Supporter will be emailed.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setStopCaseModal(false)} disabled={isStoppingCase} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button onClick={handleStopCase} disabled={isStoppingCase || !stopCaseReason.trim()} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold disabled:opacity-50">
                {isStoppingCase ? 'Stopping...' : 'Stop Workorder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateWorkorder;