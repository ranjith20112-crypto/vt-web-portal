// src/components/EmployeeWorkorderDashboard.jsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  IoAddOutline,
  IoCloudUploadOutline,
  IoEyeOutline,
  IoPencilOutline,
  IoTrashOutline,
  IoRefreshOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoCheckmarkCircleOutline,
  IoCloseOutline,
  IoDocumentTextOutline,
  IoArrowBackOutline,
  IoEllipsisVerticalOutline,
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoCubeOutline,
  IoShieldCheckmarkOutline,
  IoFlagOutline,
  IoSaveOutline,
  IoPeopleOutline,
  IoCardOutline,
  IoHomeOutline,
  IoLocationOutline,
  IoSchoolOutline,
  IoBriefcaseOutline,
  IoIdCardOutline,
  IoChevronForward,
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import api from '../apiroute/apiroute';
import Header from '../screens/header';
import { Field, CheckboxField, FileUpload, CardHeader, SectionTitle } from '../DE/formcontrols';
import CheckFormRouter from '../DE/checkformrouter'

// ---- Status visual mapping ----
const STATUS_STYLES = {
  draft: { label: 'Draft', cls: 'bg-[#E2E8F0] text-[#475569] border-[#94A3B8]' },
  pending: { label: 'Pending', cls: 'bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]' },
  'candidate-details': { label: 'Candidate Details', cls: 'bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]' },
  'ready for assignment': { label: 'Ready for Assignment', cls: 'bg-[#DBEAFE] text-[#2563EB] border-[#3B82F6]' },
  'ready-for-assignment': { label: 'Ready for Assignment', cls: 'bg-[#DBEAFE] text-[#2563EB] border-[#3B82F6]' },
  submitted: { label: 'Submitted', cls: 'bg-[#D1FAE5] text-[#10B981] border-[#34D399]' },
  'in progress': { label: 'In Progress', cls: 'bg-[#DBEAFE] text-[#2563EB] border-[#3B82F6]' },
  'in-progress': { label: 'In Progress', cls: 'bg-[#DBEAFE] text-[#2563EB] border-[#3B82F6]' },
  'assignment-pending': { label: 'Assignment Pending', cls: 'bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]' },
  'verification-pending': { label: 'Verification Pending', cls: 'bg-[#DBEAFE] text-[#2563EB] border-[#3B82F6]' },
  qc: { label: 'QC', cls: 'bg-[#EDE9FE] text-[#7C3AED] border-[#A78BFA]' },
  report: { label: 'Report', cls: 'bg-[#D1FAE5] text-[#10B981] border-[#34D399]' },
  completed: { label: 'Completed', cls: 'bg-[#D1FAE5] text-[#10B981] border-[#34D399]' },
  discrepant: { label: 'Discrepant', cls: 'bg-[#FEE2E2] text-[#EF4444] border-[#F87171]' },
  discrepancy: { label: 'Discrepancy', cls: 'bg-[#FEE2E2] text-[#EF4444] border-[#F87171]' },
  insufficient: { label: 'Insufficient', cls: 'bg-[#FEE2E2] text-[#EF4444] border-[#F87171]' },
  overdue: { label: 'Overdue', cls: 'bg-[#FEE2E2] text-[#EF4444] border-[#F87171]' },
  cancelled: { label: 'Cancelled', cls: 'bg-[#E2E8F0] text-[#475569] border-[#94A3B8]' },
  assigned: { label: 'Assigned', cls: 'bg-[#DBEAFE] text-[#2563EB] border-[#3B82F6]' },
};

const StatusBadge = ({ status, small = false }) => {
  const s = (status || 'pending').toLowerCase();
  const meta = STATUS_STYLES[s] || { label: status || 'Pending', cls: 'bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]' };
  return (
    <span className={`inline-flex px-3 py-1 rounded-full font-medium border ${meta.cls} ${small ? 'text-[10px] px-2 py-0.5' : 'text-xs'}`}>
      {meta.label}
    </span>
  );
};

// Small labelled detail row
const Detail = ({ icon: Icon, label, value, color = '#10B981' }) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
      <Icon size={16} style={{ color }} />
    </div>
    <div className="min-w-0">
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</div>
      <div className="text-sm font-semibold text-gray-900 truncate">{value || '—'}</div>
    </div>
  </div>
);

// Generic editable field (used by workorder-info & checks tabs)
const EditField = ({ label, value, onChange, type = 'text', options = null, disabled = false, full = false }) => (
  <div className={full ? 'md:col-span-2' : ''}>
    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
    {options ? (
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-white border border-gray-300 focus:border-[#00D4AA] rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none disabled:opacity-50"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    ) : type === 'textarea' ? (
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={2}
        className="w-full bg-white border border-gray-300 focus:border-[#00D4AA] rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none resize-y disabled:opacity-50"
      />
    ) : (
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-white border border-gray-300 focus:border-[#00D4AA] rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none disabled:opacity-50"
      />
    )}
  </div>
);

// ---- Candidate option lists (mirrors EmployeeWorkorderCreation.jsx) ----
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
const RELATIONSHIPS = ['Father', 'Mother', 'Spouse', 'Sibling', 'Son', 'Daughter', 'Friend', 'Other'];

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
  address: {
    currentAddress: '',
    currentCity: '',
    currentState: '',
    pinCode: '',
    country: 'India',
    sameAsCurrent: false,
    permanentAddress: '',
    permanentCity: '',
    permanentState: '',
    permanentPinCode: '',
  },
  education: [
    { qualification: '', institution: '', university: '', yearOfPassing: '', percentage: '' },
  ],
  employment: [
    { companyName: '', designation: '', fromDate: '', toDate: '', reportingManager: '', hrContact: '', reasonForLeaving: '' },
  ],
};

// Key under which each check's dedicated-form data (Address/Employment/Education/etc.)
// is stored inside check.data, kept separate from flat custom-field values.
const STRUCTURED_KEY = '__structured';

const cfKey = (checkTypeId, subCheckId = '') => `${checkTypeId || ''}::${subCheckId || ''}`;

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

const DynamicCheckField = ({ field, value, onChange }) => {
  const t = (field.type || 'text').toLowerCase();
  const common = { label: field.label, name: field.name, required: field.required, value, onChange, placeholder: field.placeholder };
  if (t === 'select' || t === 'dropdown') return <Field {...common} as="select" options={field.options || []} />;
  if (t === 'textarea' || t === 'multiline') return <Field {...common} as="textarea" />;
  if (t === 'date') return <Field {...common} type="date" />;
  return <Field {...common} type={t} />;
};

// Check status pipeline: Assignment Pending -> Verification Pending -> QC -> Report
const CHECK_STATUS_PIPELINE = ['assignment-pending', 'verification-pending', 'qc', 'report'];
const CHECK_STATUS_LABELS = {
  'assignment-pending': 'Assignment Pending',
  'verification-pending': 'Verification Pending',
  qc: 'QC',
  report: 'Report',
  pending: 'Pending',
  assigned: 'Assigned',
  'in-progress': 'In Progress',
  completed: 'Completed',
  discrepancy: 'Discrepancy',
  insufficient: 'Insufficient',
};

const CHECK_STATUS_OPTIONS = [
  { value: 'assignment-pending', label: 'Assignment Pending' },
  { value: 'verification-pending', label: 'Verification Pending' },
  { value: 'qc', label: 'QC' },
  { value: 'report', label: 'Report' },
  { value: 'pending', label: 'Pending' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'discrepancy', label: 'Discrepancy' },
  { value: 'insufficient', label: 'Insufficient' },
];

const PRIORITY_OPTIONS = [
  { value: 'Standard', label: 'Standard' },
  { value: 'Urgent', label: 'Urgent' },
  { value: 'Critical', label: 'Critical' },
];

const INITIATION_MODE_OPTIONS = [
  { value: 'Candidate', label: 'Candidate' },
  { value: 'Verifitech', label: 'Verifitech' },
  { value: 'HR', label: 'HR' },
  { value: 'Client Portal', label: 'Client Portal' },
];

const WORKORDER_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'candidate-details', label: 'Candidate Details' },
  { value: 'ready-for-assignment', label: 'Ready for Assignment' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
];

const EmployeeWorkorderDashboard = () => {
  const navigate = useNavigate();
  const [workorders, setWorkorders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ status: 'all' });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [notification, setNotification] = useState(null);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ---- Edit modal state ----
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editTab, setEditTab] = useState('workorder');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [activeCheckIdx, setActiveCheckIdx] = useState(0);
  const [editFiles, setEditFiles] = useState({
    passportPhoto: null,
    aadhaarFile: null,
    panFile: null,
    passportFile: null,
    dlFile: null,
    otherDocFile: null,
  });

  // Masters needed to render dedicated + custom check fields
  const [checkTypeMaster, setCheckTypeMaster] = useState([]);
  const [customFieldsCache, setCustomFieldsCache] = useState({});

  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, overdue: 0 });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchWorkorders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/workorders');
      if (res.data.success) {
        const data = res.data.workorders || [];
        setWorkorders(data);

        const total = data.length;
        const active = data.filter(w => !['completed', 'cancelled'].includes((w.status || '').toLowerCase())).length;
        const completed = data.filter(w => (w.status || '').toLowerCase() === 'completed').length;
        const overdue = data.filter(w => (w.status || '').toLowerCase() === 'overdue').length;

        setStats({ total, active, completed, overdue });
      }
    } catch (error) {
      console.error('Fetch workorders error:', error);
      showNotification('error', 'Failed to load workorders');
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckTypeMaster = async () => {
    try {
      const res = await api.get('/api/checktypes');
      const raw = res.data?.success ? res.data.checkTypes : [];
      setCheckTypeMaster(raw.map((c) => ({ ...c, id: c._id })));
    } catch (err) {
      console.error('Failed to fetch check type master:', err);
    }
  };

  useEffect(() => {
    fetchWorkorders();
    fetchCheckTypeMaster();
  }, []);

  useEffect(() => {
    if (!openMenuId) return;
    const handler = () => setOpenMenuId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [openMenuId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters.status]);

  const filteredWorkorders = workorders.filter(wo => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      (wo.bgvRef || '').toLowerCase().includes(q) ||
      (wo.fullName || '').toLowerCase().includes(q) ||
      (wo.client || '').toLowerCase().includes(q) ||
      (wo.companyName || '').toLowerCase().includes(q) ||
      (wo.packageName || '').toLowerCase().includes(q);

    const statusMatch = filters.status === 'all' ||
      (wo.status || '').toLowerCase() === filters.status;

    return matchesSearch && statusMatch;
  });

  const totalPages = Math.ceil(filteredWorkorders.length / pageSize) || 1;
  const paginated = filteredWorkorders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Helper to get primary Verification Type
  const getVerificationType = (wo) => {
    if (wo.verificationType) return wo.verificationType;
    if (Array.isArray(wo.checks) && wo.checks.length > 0) {
      return wo.checks[0].checkType || 'Multiple';
    }
    return '—';
  };

  const getProgressBar = (wo) => {
    const done = wo.progressDone || 0;
    const total = wo.progressTotal || (wo.checks?.length || 1);
    const p = total > 0 ? Math.round((done / total) * 100) : 0;
    return (
      <div className="flex items-center gap-3 w-40">
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-1.5 bg-[#00D4AA] rounded-full transition-all"
            style={{ width: `${Math.min(p, 100)}%` }}
          />
        </div>
        <span className="text-xs font-mono text-gray-500 tabular-nums">{done}/{total}</span>
      </div>
    );
  };

  const handleNewWorkorder = () => {
    navigate('/employee-workorder-creation');
  };

  // ---- Custom fields loader (mirrors EmployeeWorkorderCreation.jsx) ----
  const ensureCustomFields = async (checkTypeId, subCheckId = '') => {
    if (!checkTypeId) return [];
    const key = cfKey(checkTypeId, subCheckId);
    if (customFieldsCache[key]) return customFieldsCache[key];

    try {
      const params = subCheckId ? { subCheckId } : {};
      const res = await api.get(`/api/customfields/by-checktype/${checkTypeId}`, { params });
      const fields = res.data?.success
        ? (res.data.fields || []).map(normalizeCustomField)
        : [];
      setCustomFieldsCache(prev => ({ ...prev, [key]: fields }));
      return fields;
    } catch (err) {
      console.error('Failed to fetch custom fields:', err);
      setCustomFieldsCache(prev => ({ ...prev, [key]: [] }));
      return [];
    }
  };

  const findMaster = (id) => checkTypeMaster.find(c => c._id === id);

  const fieldsForCheck = (chk) => {
    let baseFields = Array.isArray(chk.fields) && chk.fields.length ? chk.fields : [];
    if (!baseFields.length) {
      const master = findMaster(chk.checkTypeId);
      baseFields = extractFields(master);
    }
    const scoped = customFieldsCache[cfKey(chk.checkTypeId, chk.subCheckId || '')] || [];
    const wide = customFieldsCache[cfKey(chk.checkTypeId, '')] || [];
    return mergeFields(baseFields, scoped, wide);
  };

  // ---- Open edit modal: build FULL editable clone (candidate + checks) ----
  const openEditModal = (wo) => {
    setOpenMenuId(null);
    setSaveError('');
    setEditTab('workorder');
    setActiveCheckIdx(0);
    setEditFiles({
      passportPhoto: null,
      aadhaarFile: null,
      panFile: null,
      passportFile: null,
      dlFile: null,
      otherDocFile: null,
    });

    const cd = wo.candidateDetails || {};

    const candidateDetails = {
      personal: { ...initialCandidateState.personal, ...(cd.personal || {}) },
      secondaryContacts:
        Array.isArray(cd.secondaryContacts) && cd.secondaryContacts.length
          ? cd.secondaryContacts.map((c) => ({ ...c }))
          : initialCandidateState.secondaryContacts.map((c) => ({ ...c })),
      additional: { ...initialCandidateState.additional, ...(cd.additional || {}) },
      address: { ...initialCandidateState.address, ...(cd.address || {}) },
      education:
        Array.isArray(cd.education) && cd.education.length
          ? cd.education.map((e) => ({ ...e }))
          : initialCandidateState.education.map((e) => ({ ...e })),
      employment:
        Array.isArray(cd.employment) && cd.employment.length
          ? cd.employment.map((e) => ({ ...e }))
          : initialCandidateState.employment.map((e) => ({ ...e })),
      documents: { ...(cd.documents || {}) },
    };

    const checksClone = Array.isArray(wo.checks)
      ? wo.checks.map((c) => ({
          ...c,
          data: { ...(c.data || {}) },
        }))
      : [];

    setEditTarget(wo);
    setEditForm({
      fullName: wo.fullName || '',
      email: wo.email || '',
      phone: wo.phone || '',
      client: wo.client || '',
      branch: wo.branch || '',
      packageName: wo.packageName || '',
      priority: wo.priority || 'Standard',
      clientRef: wo.clientRef || '',
      initiationMode: wo.initiationMode || 'Candidate',
      status: wo.status || 'draft',
      assignedTo: wo.assignedTo || '',
      target: wo.target ? String(wo.target).slice(0, 10) : '',
      candidateDetails,
      checks: checksClone,
    });

    // Preload custom fields for every check so forms render fully
    checksClone.forEach((c) => {
      if (c.checkTypeId) {
        ensureCustomFields(c.checkTypeId, '');
        if (c.subCheckId) ensureCustomFields(c.checkTypeId, c.subCheckId);
      }
    });
  };

  const handleView = (wo) => openEditModal(wo);
  const handleEdit = (wo) => openEditModal(wo);

  const handleAskDelete = (wo) => {
    setOpenMenuId(null);
    setDeleteTarget(wo);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?._id) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/api/workorders/${deleteTarget._id}`);
      if (res.data?.success !== false) {
        setWorkorders(prev => prev.filter(w => w._id !== deleteTarget._id));
        showNotification('success', 'Workorder deleted');
        setDeleteTarget(null);
      } else {
        showNotification('error', res.data?.message || 'Failed to delete');
      }
    } catch (e) {
      showNotification('error', e.response?.data?.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  // ---- Field setters ----
  const setField = (key, value) => setEditForm((prev) => ({ ...prev, [key]: value }));

  const setPersonalField = (key, value) =>
    setEditForm((prev) => ({
      ...prev,
      candidateDetails: { ...prev.candidateDetails, personal: { ...prev.candidateDetails.personal, [key]: value } },
    }));

  const setAdditionalField = (key, value) =>
    setEditForm((prev) => ({
      ...prev,
      candidateDetails: { ...prev.candidateDetails, additional: { ...prev.candidateDetails.additional, [key]: value } },
    }));

  const setAddressField = (key, value, checked) =>
    setEditForm((prev) => {
      const nextAddress = { ...prev.candidateDetails.address, [key]: value };
      if (key === 'sameAsCurrent' && checked) {
        nextAddress.permanentAddress = nextAddress.currentAddress;
        nextAddress.permanentCity = nextAddress.currentCity;
        nextAddress.permanentState = nextAddress.currentState;
        nextAddress.permanentPinCode = nextAddress.pinCode;
      }
      return { ...prev, candidateDetails: { ...prev.candidateDetails, address: nextAddress } };
    });

  const updateSecondaryContact = (idx, key, value) =>
    setEditForm((prev) => {
      const list = [...prev.candidateDetails.secondaryContacts];
      list[idx] = { ...list[idx], [key]: value };
      return { ...prev, candidateDetails: { ...prev.candidateDetails, secondaryContacts: list } };
    });
  const addSecondaryContact = () =>
    setEditForm((prev) => ({
      ...prev,
      candidateDetails: {
        ...prev.candidateDetails,
        secondaryContacts: [...prev.candidateDetails.secondaryContacts, { contactNumber: '', contactPerson: '', relationship: '' }],
      },
    }));
  const removeSecondaryContact = (idx) =>
    setEditForm((prev) => ({
      ...prev,
      candidateDetails: {
        ...prev.candidateDetails,
        secondaryContacts: prev.candidateDetails.secondaryContacts.filter((_, i) => i !== idx),
      },
    }));

  const updateEducationRow = (idx, key, value) =>
    setEditForm((prev) => {
      const list = [...prev.candidateDetails.education];
      list[idx] = { ...list[idx], [key]: value };
      return { ...prev, candidateDetails: { ...prev.candidateDetails, education: list } };
    });
  const addEducationRow = () =>
    setEditForm((prev) => ({
      ...prev,
      candidateDetails: {
        ...prev.candidateDetails,
        education: [...prev.candidateDetails.education, { qualification: '', institution: '', university: '', yearOfPassing: '', percentage: '' }],
      },
    }));
  const removeEducationRow = (idx) =>
    setEditForm((prev) => ({
      ...prev,
      candidateDetails: {
        ...prev.candidateDetails,
        education: prev.candidateDetails.education.filter((_, i) => i !== idx),
      },
    }));

  const updateEmploymentRow = (idx, key, value) =>
    setEditForm((prev) => {
      const list = [...prev.candidateDetails.employment];
      list[idx] = { ...list[idx], [key]: value };
      return { ...prev, candidateDetails: { ...prev.candidateDetails, employment: list } };
    });
  const addEmploymentRow = () =>
    setEditForm((prev) => ({
      ...prev,
      candidateDetails: {
        ...prev.candidateDetails,
        employment: [...prev.candidateDetails.employment, { companyName: '', designation: '', fromDate: '', toDate: '', reportingManager: '', hrContact: '', reasonForLeaving: '' }],
      },
    }));
  const removeEmploymentRow = (idx) =>
    setEditForm((prev) => ({
      ...prev,
      candidateDetails: {
        ...prev.candidateDetails,
        employment: prev.candidateDetails.employment.filter((_, i) => i !== idx),
      },
    }));

  const handleEditFileSelect = (key) => (file) => setEditFiles((p) => ({ ...p, [key]: file }));

  // ---- Check setters ----
  const setCheckField = (idx, key, value) =>
    setEditForm((prev) => {
      const checks = [...prev.checks];
      checks[idx] = { ...checks[idx], [key]: value };
      return { ...prev, checks };
    });

  const setCheckStructuredData = (idx, structuredData) =>
    setEditForm((prev) => {
      const checks = [...prev.checks];
      checks[idx] = { ...checks[idx], data: { ...(checks[idx].data || {}), [STRUCTURED_KEY]: structuredData } };
      return { ...prev, checks };
    });

  const setCheckDataField = (idx, fieldName, value) =>
    setEditForm((prev) => {
      const checks = [...prev.checks];
      checks[idx] = { ...checks[idx], data: { ...(checks[idx].data || {}), [fieldName]: value } };
      return { ...prev, checks };
    });

  const handleCloseEdit = () => {
    if (isSaving) return;
    setEditTarget(null);
    setEditForm(null);
    setSaveError('');
  };

  const handleUpdate = async () => {
    if (!editTarget?._id || !editForm) return;
    setIsSaving(true);
    setSaveError('');
    try {
      const payload = {
        fullName: editForm.fullName,
        email: editForm.email,
        phone: editForm.phone,
        client: editForm.client,
        branch: editForm.branch,
        packageName: editForm.packageName,
        priority: editForm.priority,
        clientRef: editForm.clientRef,
        initiationMode: editForm.initiationMode,
        status: editForm.status,
        assignedTo: editForm.assignedTo,
        target: editForm.target,
        candidateDetails: editForm.candidateDetails,
        checks: editForm.checks,
      };

      const res = await api.put(`/api/workorders/${editTarget._id}`, payload);

      if (res.data?.success === false) {
        setSaveError(res.data?.message || 'Failed to update workorder.');
        setIsSaving(false);
        return;
      }

      // If any new documents were selected, push them via the multipart candidate endpoint
      const hasNewFiles = Object.values(editFiles).some(Boolean);
      let finalWorkorder = res.data?.workorder;
      if (hasNewFiles) {
        try {
          const fd = new FormData();
          fd.append('candidateDetails', JSON.stringify(editForm.candidateDetails));
          Object.entries(editFiles).forEach(([key, file]) => {
            if (file) fd.append(key, file);
          });
          const fileRes = await api.put(`/api/workorders/${editTarget._id}/candidate`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (fileRes.data?.success && fileRes.data.workorder) {
            finalWorkorder = fileRes.data.workorder;
          }
        } catch (fileErr) {
          console.error('Failed to upload updated documents:', fileErr);
          showNotification('error', 'Workorder updated, but document upload failed.');
        }
      }

      setWorkorders((prev) =>
        prev.map((w) => (w._id === editTarget._id ? { ...w, ...(finalWorkorder || payload) } : w))
      );

      showNotification('success', 'Workorder updated successfully');
      handleCloseEdit();
    } catch (e) {
      setSaveError(e.response?.data?.message || e.message || 'Failed to update workorder.');
    } finally {
      setIsSaving(false);
    }
  };

  const RowActions = ({ wo }) => (
    <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => handleView(wo)}
        title="View / Edit"
        className="p-2 hover:bg-gray-100 rounded-xl text-[#00D4AA] transition-all"
      >
        <IoEyeOutline size={20} />
      </button>
      <button
        onClick={() => handleEdit(wo)}
        title="Edit"
        className="p-2 hover:bg-gray-100 rounded-xl text-[#F59E0B] transition-all"
      >
        <IoPencilOutline size={20} />
      </button>
      <button
        onClick={() => handleAskDelete(wo)}
        title="Delete"
        className="p-2 hover:bg-gray-100 rounded-xl text-red-500 transition-all"
      >
        <IoTrashOutline size={20} />
      </button>

      <div className="relative">
        <button
          onClick={() => setOpenMenuId(openMenuId === wo._id ? null : wo._id)}
          title="More"
          className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-all"
        >
          <IoEllipsisVerticalOutline size={20} />
        </button>
        {openMenuId === wo._id && (
          <div className="absolute right-0 top-11 z-30 w-44 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden py-1">
            <button onClick={() => handleView(wo)} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-all">
              <IoEyeOutline size={17} className="text-[#00D4AA]" /> View / Edit
            </button>
            <div className="h-px bg-gray-100 my-1" />
            <button onClick={() => handleAskDelete(wo)} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-all">
              <IoTrashOutline size={17} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const apiBaseURL = api?.defaults?.baseURL?.replace(/\/api\/?$/, '') || '';

  return (
    <div className="min-h-screen bg-[#f8fefd] text-gray-900 font-sans">
      <Header showNavigation={false} />

      {notification && (
        <div className={`fixed top-20 right-6 z-[120] px-6 py-4 rounded-2xl border flex items-center gap-3 shadow-xl ${notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {notification.type === 'success' ? <IoCheckmarkCircleOutline size={22} /> : <IoCloseOutline size={22} />}
          <span>{notification.message}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:text-gray-900 transition-all">
            <IoArrowBackOutline size={18} />
            <span>Back</span>
          </button>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00D4AA] to-[#3B82F6] rounded-2xl flex items-center justify-center">
                <IoDocumentTextOutline size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">Workorder Management</h1>
                <p className="text-gray-600 mt-1">Create and manage BGV workorders</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={handleNewWorkorder}
              className="flex items-center gap-3 bg-[#00D4AA] hover:bg-[#00C29A] text-black px-6 py-3.5 rounded-2xl font-bold transition-all active:scale-95"
            >
              <IoAddOutline size={22} />
              New Workorder
            </button>
            <button
              className="flex items-center gap-3 border border-gray-300 hover:bg-gray-50 px-6 py-3.5 rounded-2xl font-medium transition-all"
            >
              <IoCloudUploadOutline size={20} />
              Bulk Upload
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'TOTAL', value: stats.total, color: '#00D4AA' },
            { label: 'ACTIVE', value: stats.active, color: '#3B82F6' },
            { label: 'COMPLETED', value: stats.completed, color: '#10B981' },
            { label: 'OVERDUE', value: stats.overdue, color: '#EF4444' },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
              <div className="text-xs font-bold tracking-widest text-gray-500">{stat.label}</div>
              <div className="text-5xl font-bold mt-2" style={{ color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
              <IoSearchOutline size={20} />
            </div>
            <input
              type="text"
              placeholder="Search by BGV ID, Candidate or Client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-300 focus:border-[#00D4AA] pl-12 py-4 rounded-2xl text-sm outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-5 py-3.5 border border-gray-300 hover:border-gray-400 rounded-2xl text-sm"
            >
              <IoFilterOutline size={18} /> Filter
            </button>
            <button
              onClick={fetchWorkorders}
              className="flex items-center gap-2 px-5 py-3.5 border border-gray-300 hover:border-gray-400 rounded-2xl text-sm"
            >
              <IoRefreshOutline size={18} /> Refresh
            </button>
          </div>
        </div>

        {/* Table with Verification Type Column */}
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1300px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">WORKORDER #</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">CANDIDATE</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">CLIENT</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">PACKAGE</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">VERIFICATION TYPE</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">STATUS</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">DE PROGRESS</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ASSIGNED</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">TARGET</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">CREATED</th>
                  <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="12" className="py-20 text-center text-gray-500">Loading workorders...</td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="py-20 text-center text-gray-500">No workorders found</td>
                  </tr>
                ) : (
                  paginated.map((wo, index) => (
                    <tr key={wo._id || index} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => handleView(wo)}>
                      <td className="px-6 py-5 text-sm text-gray-500 font-mono">{(currentPage - 1) * pageSize + index + 1}</td>
                      <td className="px-6 py-5">
                        <span className="font-mono text-[#00D4AA] font-medium">{wo.bgvRef || 'BGV-2026-XXXX'}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-medium text-gray-900">{wo.fullName}</div>
                        <div className="text-xs text-gray-500">{wo.email || ''}</div>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-600">{wo.companyName || wo.client || '-'}</td>
                      <td className="px-6 py-5 text-sm text-gray-700">{wo.packageName || 'IT Package'}</td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
                          <IoShieldCheckmarkOutline size={14} />
                          {getVerificationType(wo)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={wo.status} />
                      </td>
                      <td className="px-6 py-5">
                        {getProgressBar(wo)}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-600">{wo.assignedTo || 'Unassigned'}</td>
                      <td className="px-6 py-5 text-sm text-gray-600">
                        {wo.target ? new Date(wo.target).toLocaleDateString('en-GB') : '—'}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-600">
                        {wo.createdAt ? new Date(wo.createdAt).toLocaleDateString('en-GB') : '—'}
                      </td>
                      <td className="px-6 py-5">
                        <div className="opacity-70 group-hover:opacity-100 transition-all">
                          <RowActions wo={wo} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-5 border-t border-gray-200 text-sm">
            <div className="text-gray-500">
              Page {currentPage} of {totalPages} • {filteredWorkorders.length} records
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-4 py-2 rounded-xl border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${currentPage === page ? 'bg-[#00D4AA] text-black font-bold' : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-4 py-2 rounded-xl border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsFilterOpen(false)} />
          <div className="relative w-96 bg-white h-full border-l border-gray-200 p-8 overflow-auto shadow-2xl">
            <h3 className="text-xl font-bold mb-8 text-gray-900">Filters</h3>
            <div className="space-y-8">
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-2xl px-5 py-4 text-gray-900"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="submitted">Submitted</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="discrepant">Discrepant</option>
                </select>
              </div>
            </div>

            <div className="mt-12 flex gap-4">
              <button onClick={() => { setFilters({ status: 'all' }); }} className="flex-1 py-4 border border-gray-300 rounded-2xl text-gray-700">Reset</button>
              <button onClick={() => setIsFilterOpen(false)} className="flex-1 py-4 bg-[#00D4AA] text-black font-bold rounded-2xl">Apply Filters</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editTarget && editForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={handleCloseEdit}>
          <div
            className="bg-white border border-gray-200 rounded-3xl w-full max-w-6xl max-h-[94vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900 font-mono">{editTarget.bgvRef || 'Workorder'}</h3>
                <p className="text-sm text-gray-500">Edit candidate, workorder and check details</p>
              </div>
              <button onClick={handleCloseEdit} className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700">
                <IoCloseOutline size={22} />
              </button>
            </div>

            <div className="px-8 pt-6 flex-shrink-0">
              <div className="flex items-center gap-3 mb-5">
                <StatusBadge status={editForm.status} />
                {editForm.priority && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-purple-200 bg-purple-50 text-purple-700">
                    <IoFlagOutline size={12} /> {editForm.priority}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Detail icon={IoPersonOutline} label="Candidate" value={editForm.fullName} color="#3B82F6" />
                <Detail icon={IoMailOutline} label="Email" value={editForm.email} />
                <Detail icon={IoCallOutline} label="Phone" value={editForm.phone} />
                <Detail icon={IoCubeOutline} label="Package" value={editForm.packageName} color="#F59E0B" />
              </div>

              <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto">
                {[
                  { key: 'workorder', label: 'Workorder Info' },
                  { key: 'candidate', label: 'Candidate Details' },
                  { key: 'checks', label: `Checks (${editForm.checks.length})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setEditTab(tab.key)}
                    className="px-4 py-3 text-sm font-semibold border-b-2 transition-all -mb-px whitespace-nowrap"
                    style={{
                      borderColor: editTab === tab.key ? '#00D4AA' : 'transparent',
                      color: editTab === tab.key ? '#00D4AA' : '#64748B',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-8 py-6 overflow-y-auto flex-1">
              {saveError && (
                <div className="mb-5 px-4 py-3 rounded-xl text-sm bg-red-50 border border-red-200 text-red-600">
                  {saveError}
                </div>
              )}

              {/* ---- WORKORDER INFO TAB ---- */}
              {editTab === 'workorder' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <EditField label="Full Name" value={editForm.fullName} onChange={(v) => setField('fullName', v)} />
                  <EditField label="Email" value={editForm.email} onChange={(v) => setField('email', v)} type="email" />
                  <EditField label="Phone" value={editForm.phone} onChange={(v) => setField('phone', v)} />
                  <EditField label="Client (ID)" value={editForm.client} onChange={(v) => setField('client', v)} />
                  <EditField label="Branch" value={editForm.branch} onChange={(v) => setField('branch', v)} />
                  <EditField label="Package Name" value={editForm.packageName} onChange={(v) => setField('packageName', v)} />
                  <EditField label="Priority" value={editForm.priority} onChange={(v) => setField('priority', v)} options={PRIORITY_OPTIONS} />
                  <EditField label="Client Reference" value={editForm.clientRef} onChange={(v) => setField('clientRef', v)} />
                  <EditField label="Initiation Mode" value={editForm.initiationMode} onChange={(v) => setField('initiationMode', v)} options={INITIATION_MODE_OPTIONS} />
                  <EditField label="Workorder Status" value={editForm.status} onChange={(v) => setField('status', v)} options={WORKORDER_STATUS_OPTIONS} />
                  <EditField label="Target Date" value={editForm.target} onChange={(v) => setField('target', v)} type="date" />
                  <EditField label="Assigned To (overall)" value={editForm.assignedTo} onChange={(v) => setField('assignedTo', v)} />
                </div>
              )}

              {/* ---- CANDIDATE DETAILS TAB (full parity with EmployeeWorkorderCreation.jsx) ---- */}
              {editTab === 'candidate' && (
                <div className="space-y-12">
                  {/* Basic Details */}
                  <div>
                    <SectionTitle icon={IoIdCardOutline} title="Basic Details" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Field label="First Name" name="firstName" value={editForm.candidateDetails.personal.firstName} onChange={(e) => setPersonalField('firstName', e.target.value)} />
                      <Field label="Last Name" name="lastName" value={editForm.candidateDetails.personal.lastName} onChange={(e) => setPersonalField('lastName', e.target.value)} />
                      <Field label="Father's Name" name="fatherName" value={editForm.candidateDetails.personal.fatherName} onChange={(e) => setPersonalField('fatherName', e.target.value)} />
                      <Field label="Mother's Name" name="motherName" value={editForm.candidateDetails.personal.motherName} onChange={(e) => setPersonalField('motherName', e.target.value)} />
                      <Field label="Email Address" name="email" type="email" value={editForm.candidateDetails.personal.email} onChange={(e) => setPersonalField('email', e.target.value)} />
                      <Field label="Gender" name="gender" as="select" options={GENDERS} value={editForm.candidateDetails.personal.gender} onChange={(e) => setPersonalField('gender', e.target.value)} />
                      <Field label="Date of Birth" name="dob" type="date" value={editForm.candidateDetails.personal.dob} onChange={(e) => setPersonalField('dob', e.target.value)} />
                      <Field label="Marital Status" name="maritalStatus" as="select" options={MARITAL_STATUS} value={editForm.candidateDetails.personal.maritalStatus} onChange={(e) => setPersonalField('maritalStatus', e.target.value)} />
                      <Field label="Nationality" name="nationality" as="select" options={NATIONALITIES} value={editForm.candidateDetails.personal.nationality} onChange={(e) => setPersonalField('nationality', e.target.value)} />
                      <Field label="Aadhaar Number" name="aadhaarNumber" value={editForm.candidateDetails.personal.aadhaarNumber} onChange={(e) => setPersonalField('aadhaarNumber', e.target.value)} />
                      <Field label="Mobile Number" name="mobile" type="tel" value={editForm.candidateDetails.personal.mobile} onChange={(e) => setPersonalField('mobile', e.target.value)} />
                      <Field label="Alternate Mobile" name="altMobile" type="tel" value={editForm.candidateDetails.personal.altMobile} onChange={(e) => setPersonalField('altMobile', e.target.value)} />
                      <Field label="Blood Group" name="bloodGroup" as="select" options={BLOOD_GROUPS} value={editForm.candidateDetails.personal.bloodGroup} onChange={(e) => setPersonalField('bloodGroup', e.target.value)} />
                      <Field label="Is Fresher" name="isFresher" as="select" options={FRESHER_OPTIONS} value={editForm.candidateDetails.personal.isFresher} onChange={(e) => setPersonalField('isFresher', e.target.value)} />
                      <Field label="Ex-Serviceman" name="isExServiceman" as="select" options={YES_NO_OPTIONS} value={editForm.candidateDetails.personal.isExServiceman} onChange={(e) => setPersonalField('isExServiceman', e.target.value)} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <CheckboxField
                        label="Physically Challenged?"
                        name="physicallyChallenged"
                        checked={editForm.candidateDetails.personal.physicallyChallenged}
                        onChange={(e) => setPersonalField('physicallyChallenged', e.target.checked)}
                        description="If yes, please provide more details in the below textbox"
                      />
                      <CheckboxField
                        label="Any Chronic Health Issues?"
                        name="chronicCondition"
                        checked={editForm.candidateDetails.personal.chronicCondition}
                        onChange={(e) => setPersonalField('chronicCondition', e.target.checked)}
                        description="If yes, please provide more details in the below textbox"
                      />
                      <Field label="Disability Details" name="disabilityDetails" as="textarea" value={editForm.candidateDetails.personal.disabilityDetails} onChange={(e) => setPersonalField('disabilityDetails', e.target.value)} />
                      <Field label="Chronic Condition Details" name="chronicConditionDetails" as="textarea" value={editForm.candidateDetails.personal.chronicConditionDetails} onChange={(e) => setPersonalField('chronicConditionDetails', e.target.value)} />
                    </div>
                  </div>

                  {/* Secondary Contacts */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <SectionTitle icon={IoPeopleOutline} title="Secondary Contact Details" />
                      <button onClick={addSecondaryContact} className="flex items-center gap-1 text-xs font-semibold text-[#00D4AA] border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-100">
                        <IoAddOutline size={16} /> Add Contact
                      </button>
                    </div>
                    <div className="space-y-4">
                      {editForm.candidateDetails.secondaryContacts.map((sc, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border border-gray-200 rounded-xl">
                          <div className="text-sm font-bold text-gray-400">{idx + 1}</div>
                          <Field label="Contact Number" name="contactNumber" type="tel" value={sc.contactNumber} onChange={(e) => updateSecondaryContact(idx, 'contactNumber', e.target.value)} />
                          <Field label="Contact Person" name="contactPerson" value={sc.contactPerson} onChange={(e) => updateSecondaryContact(idx, 'contactPerson', e.target.value)} />
                          <div className="flex gap-2 items-end">
                            <div className="flex-1">
                              <Field label="Relationship" name="relationship" as="select" options={RELATIONSHIPS} value={sc.relationship} onChange={(e) => updateSecondaryContact(idx, 'relationship', e.target.value)} />
                            </div>
                            {editForm.candidateDetails.secondaryContacts.length > 1 && (
                              <button onClick={() => removeSecondaryContact(idx)} className="text-red-600 hover:text-red-800 p-2">
                                <IoTrashOutline size={18} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div>
                    <SectionTitle icon={IoCardOutline} title="Additional Details" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Field label="PAN Number" name="panNumber" value={editForm.candidateDetails.additional.panNumber} onChange={(e) => setAdditionalField('panNumber', e.target.value)} />
                      <Field label="Name on PAN" name="nameOnPan" value={editForm.candidateDetails.additional.nameOnPan} onChange={(e) => setAdditionalField('nameOnPan', e.target.value)} />
                      <Field label="Driving License No" name="drivingLicenseNo" value={editForm.candidateDetails.additional.drivingLicenseNo} onChange={(e) => setAdditionalField('drivingLicenseNo', e.target.value)} />
                      <Field label="DL Expiry Date" name="dlExpiryDate" type="date" value={editForm.candidateDetails.additional.dlExpiryDate} onChange={(e) => setAdditionalField('dlExpiryDate', e.target.value)} />
                      <Field label="Voter Id" name="voterId" value={editForm.candidateDetails.additional.voterId} onChange={(e) => setAdditionalField('voterId', e.target.value)} />
                      <Field label="SSN No" name="ssnNo" value={editForm.candidateDetails.additional.ssnNo} onChange={(e) => setAdditionalField('ssnNo', e.target.value)} />
                      <Field label="Passport Number" name="passportNumber" value={editForm.candidateDetails.additional.passportNumber} onChange={(e) => setAdditionalField('passportNumber', e.target.value)} />
                      <Field label="Passport Issue Date" name="passportIssueDate" type="date" value={editForm.candidateDetails.additional.passportIssueDate} onChange={(e) => setAdditionalField('passportIssueDate', e.target.value)} />
                      <Field label="Passport Expiry Date" name="passportExpiryDate" type="date" value={editForm.candidateDetails.additional.passportExpiryDate} onChange={(e) => setAdditionalField('passportExpiryDate', e.target.value)} />
                      <Field label="UAN Number" name="uanNumber" value={editForm.candidateDetails.additional.uanNumber} onChange={(e) => setAdditionalField('uanNumber', e.target.value)} />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <SectionTitle icon={IoHomeOutline} title="Current Address" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="md:col-span-2">
                        <Field label="Current Address" name="currentAddress" as="textarea" value={editForm.candidateDetails.address.currentAddress} onChange={(e) => setAddressField('currentAddress', e.target.value)} />
                      </div>
                      <Field label="Current City" name="currentCity" value={editForm.candidateDetails.address.currentCity} onChange={(e) => setAddressField('currentCity', e.target.value)} />
                      <Field label="Current State" name="currentState" value={editForm.candidateDetails.address.currentState} onChange={(e) => setAddressField('currentState', e.target.value)} />
                      <Field label="PIN Code" name="pinCode" value={editForm.candidateDetails.address.pinCode} onChange={(e) => setAddressField('pinCode', e.target.value)} />
                      <Field label="Country" name="country" value={editForm.candidateDetails.address.country} onChange={(e) => setAddressField('country', e.target.value)} />
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <SectionTitle icon={IoLocationOutline} title="Permanent Address" />
                      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          name="sameAsCurrent"
                          checked={editForm.candidateDetails.address.sameAsCurrent}
                          onChange={(e) => setAddressField('sameAsCurrent', e.target.checked, e.target.checked)}
                          className="w-4 h-4"
                        />
                        Same as current address
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Field label="Permanent Address" name="permanentAddress" as="textarea" value={editForm.candidateDetails.address.permanentAddress} onChange={(e) => setAddressField('permanentAddress', e.target.value)} />
                      </div>
                      <Field label="Permanent City" name="permanentCity" value={editForm.candidateDetails.address.permanentCity} onChange={(e) => setAddressField('permanentCity', e.target.value)} />
                      <Field label="Permanent State" name="permanentState" value={editForm.candidateDetails.address.permanentState} onChange={(e) => setAddressField('permanentState', e.target.value)} />
                      <Field label="Permanent PIN Code" name="permanentPinCode" value={editForm.candidateDetails.address.permanentPinCode} onChange={(e) => setAddressField('permanentPinCode', e.target.value)} />
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <SectionTitle icon={IoSchoolOutline} title="Education Details" />
                      <button onClick={addEducationRow} className="flex items-center gap-1 text-xs font-semibold text-[#00D4AA] border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-100">
                        <IoAddOutline size={16} /> Add Education
                      </button>
                    </div>
                    <div className="space-y-4">
                      {editForm.candidateDetails.education.map((ed, idx) => (
                        <div key={idx} className="p-5 border border-gray-200 rounded-2xl">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-gray-400">Record {idx + 1}</span>
                            {editForm.candidateDetails.education.length > 1 && (
                              <button onClick={() => removeEducationRow(idx)} className="text-red-600 hover:text-red-800">
                                <IoTrashOutline size={18} />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Field label="Qualification" name="qualification" value={ed.qualification} onChange={(e) => updateEducationRow(idx, 'qualification', e.target.value)} />
                            <Field label="Institution" name="institution" value={ed.institution} onChange={(e) => updateEducationRow(idx, 'institution', e.target.value)} />
                            <Field label="University / Board" name="university" value={ed.university} onChange={(e) => updateEducationRow(idx, 'university', e.target.value)} />
                            <Field label="Year of Passing" name="yearOfPassing" value={ed.yearOfPassing} onChange={(e) => updateEducationRow(idx, 'yearOfPassing', e.target.value)} />
                            <Field label="Percentage / CGPA" name="percentage" value={ed.percentage} onChange={(e) => updateEducationRow(idx, 'percentage', e.target.value)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Employment */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <SectionTitle icon={IoBriefcaseOutline} title="Employment History" />
                      <button onClick={addEmploymentRow} className="flex items-center gap-1 text-xs font-semibold text-[#00D4AA] border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-100">
                        <IoAddOutline size={16} /> Add Employer
                      </button>
                    </div>
                    {editForm.candidateDetails.personal.isFresher === 'Yes' && (
                      <div className="mb-4 px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-xs text-gray-600">
                        Candidate marked as Fresher — employment history is optional.
                      </div>
                    )}
                    <div className="space-y-4">
                      {editForm.candidateDetails.employment.map((emp, idx) => (
                        <div key={idx} className="p-5 border border-gray-200 rounded-2xl">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-gray-400">Employer {idx + 1}</span>
                            {editForm.candidateDetails.employment.length > 1 && (
                              <button onClick={() => removeEmploymentRow(idx)} className="text-red-600 hover:text-red-800">
                                <IoTrashOutline size={18} />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Field label="Company Name" name="companyName" value={emp.companyName} onChange={(e) => updateEmploymentRow(idx, 'companyName', e.target.value)} />
                            <Field label="Designation" name="designation" value={emp.designation} onChange={(e) => updateEmploymentRow(idx, 'designation', e.target.value)} />
                            <Field label="From Date" name="fromDate" type="date" value={emp.fromDate} onChange={(e) => updateEmploymentRow(idx, 'fromDate', e.target.value)} />
                            <Field label="To Date" name="toDate" type="date" value={emp.toDate} onChange={(e) => updateEmploymentRow(idx, 'toDate', e.target.value)} />
                            <Field label="Reporting Manager" name="reportingManager" value={emp.reportingManager} onChange={(e) => updateEmploymentRow(idx, 'reportingManager', e.target.value)} />
                            <Field label="HR Contact" name="hrContact" value={emp.hrContact} onChange={(e) => updateEmploymentRow(idx, 'hrContact', e.target.value)} />
                            <div className="md:col-span-3">
                              <Field label="Reason for Leaving" name="reasonForLeaving" as="textarea" value={emp.reasonForLeaving} onChange={(e) => updateEmploymentRow(idx, 'reasonForLeaving', e.target.value)} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Document Upload */}
                  <div>
                    <SectionTitle icon={IoCloudUploadOutline} title="Document Upload" />
                    <p className="text-xs text-gray-400 mb-4">Only select a file if you want to replace the existing document.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <FileUpload label="Passport Photo" file={editFiles.passportPhoto} onSelect={handleEditFileSelect('passportPhoto')} />
                        {editForm.candidateDetails.documents?.passportPhoto && !editFiles.passportPhoto && (
                          <img
                            src={`${apiBaseURL}${editForm.candidateDetails.documents.passportPhoto}`}
                            alt="saved"
                            className="mt-3 w-20 h-20 rounded-xl object-cover border border-gray-300"
                          />
                        )}
                      </div>
                      <FileUpload label="Aadhaar Document" file={editFiles.aadhaarFile} onSelect={handleEditFileSelect('aadhaarFile')} />
                      <FileUpload label="PAN Document" file={editFiles.panFile} onSelect={handleEditFileSelect('panFile')} />
                      <FileUpload label="Passport Document" file={editFiles.passportFile} onSelect={handleEditFileSelect('passportFile')} />
                      <FileUpload label="Driving License Document" file={editFiles.dlFile} onSelect={handleEditFileSelect('dlFile')} />
                      <FileUpload label="Other Supporting Document" file={editFiles.otherDocFile} onSelect={handleEditFileSelect('otherDocFile')} />
                    </div>
                  </div>
                </div>
              )}

              {/* ---- CHECKS TAB (dedicated forms + custom fields + status pipeline) ---- */}
              {editTab === 'checks' && (
                editForm.checks.length === 0 ? (
                  <div className="text-sm text-gray-500">No checks attached to this workorder.</div>
                ) : (
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Check list nav */}
                    <div className="lg:w-64 flex-shrink-0 space-y-1">
                      {editForm.checks.map((c, idx) => {
                        const active = activeCheckIdx === idx;
                        return (
                          <button
                            key={c.slNo ?? idx}
                            onClick={() => setActiveCheckIdx(idx)}
                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${active ? 'bg-[#00D4AA]/10 border-[#00D4AA] text-[#00A88A]' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                          >
                            <div className="text-sm font-semibold truncate">{c.checkType || `Check #${idx + 1}`}</div>
                            {c.subType && <div className="text-xs italic truncate">{c.subType}</div>}
                            <div className="mt-2">
                              <StatusBadge status={c.status} small />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active check editor */}
                    {(() => {
                      const idx = activeCheckIdx;
                      const check = editForm.checks[idx];
                      if (!check) return null;
                      const fields = fieldsForCheck(check);
                      const structuredData = check.data?.[STRUCTURED_KEY] || {};
                      const status = (check.status || 'assignment-pending').toLowerCase();
                      const pipelineIdx = CHECK_STATUS_PIPELINE.indexOf(status);

                      return (
                        <div className="flex-1 space-y-8 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-lg font-bold text-gray-900">{check.checkType}</h4>
                              {check.subType && <p className="text-sm text-gray-500 italic">{check.subType}</p>}
                            </div>
                            <StatusBadge status={check.status} />
                          </div>

                          {/* Dedicated form: Address / Employment / Education / etc. */}
                          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                            <CheckFormRouter
                              checkType={check.checkType}
                              subType={check.subType}
                              data={structuredData}
                              onDataChange={(next) => setCheckStructuredData(idx, next)}
                              workorderId={editTarget._id}
                              slNo={check.slNo}
                            />
                          </div>

                          {/* Configured custom fields */}
                          {fields.length > 0 && (
                            <div>
                              <SectionTitle icon={IoDocumentTextOutline} title="Additional Fields (Configured)" />
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {fields.map((field, fIdx) => (
                                  <DynamicCheckField
                                    key={`${field.name}-${fIdx}`}
                                    field={field}
                                    value={check.data?.[field.name] || ''}
                                    onChange={(e) => setCheckDataField(idx, field.name, e.target.value)}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Status / Assignment / Notes */}
                          <div className="bg-[#EEF0FA] border border-gray-200 rounded-2xl p-6">
                            <SectionTitle icon={IoFlagOutline} title="Status & Assignment" />

                            {pipelineIdx >= 0 && (
                              <div className="flex items-center gap-2 mb-6 flex-wrap">
                                {CHECK_STATUS_PIPELINE.map((st, i) => {
                                  const done = i <= pipelineIdx;
                                  return (
                                    <React.Fragment key={st}>
                                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${done ? 'bg-[#00D4AA] text-black border-[#00D4AA]' : 'bg-white text-gray-400 border-gray-300'}`}>
                                        {CHECK_STATUS_LABELS[st]}
                                      </span>
                                      {i < CHECK_STATUS_PIPELINE.length - 1 && <IoChevronForward size={12} className="text-gray-300" />}
                                    </React.Fragment>
                                  );
                                })}
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              <EditField
                                label="Status"
                                value={check.status}
                                onChange={(v) => setCheckField(idx, 'status', v)}
                                options={CHECK_STATUS_OPTIONS}
                              />
                              <EditField
                                label="Assigned To"
                                value={check.assignedTo}
                                onChange={(v) => setCheckField(idx, 'assignedTo', v)}
                              />
                              <EditField
                                label="Assignment Type"
                                value={check.assignmentType}
                                onChange={(v) => setCheckField(idx, 'assignmentType', v)}
                                options={[
                                  { value: '', label: '— None —' },
                                  { value: 'internal', label: 'Internal' },
                                  { value: 'external', label: 'External' },
                                ]}
                              />
                            </div>

                            <div className="mt-5">
                              <EditField
                                label="Notes / Remarks"
                                value={check.notes}
                                onChange={(v) => setCheckField(idx, 'notes', v)}
                                type="textarea"
                                full
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )
              )}
            </div>

            <div className="px-8 py-5 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
              <button onClick={handleCloseEdit} disabled={isSaving} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#00D4AA] text-black rounded-xl font-semibold flex items-center gap-2 hover:bg-[#00C29A] transition-all disabled:opacity-60"
              >
                <IoSaveOutline size={18} />
                {isSaving ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => !isDeleting && setDeleteTarget(null)}>
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
                <IoTrashOutline size={28} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Workorder?</h3>
              <p className="text-gray-600 mb-2">
                This will permanently delete <span className="font-semibold">{deleteTarget.bgvRef || deleteTarget.fullName}</span>.
              </p>
              <p className="text-sm text-gray-500 mb-7">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="flex-1 px-5 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
                <button onClick={handleConfirmDelete} disabled={isDeleting} className="flex-1 px-5 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-white font-semibold transition-all disabled:opacity-50">
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeWorkorderDashboard;
