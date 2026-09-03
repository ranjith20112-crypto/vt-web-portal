// src/components/EmployeeWorkorderCreation.jsx
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  IoArrowBackOutline,
  IoSaveOutline,
  IoPersonOutline,
  IoSettingsOutline,
  IoShieldCheckmarkOutline,
  IoAddOutline,
  IoTrashOutline,
  IoDocumentTextOutline,
  IoLocationOutline,
  IoIdCardOutline,
  IoCloudUploadOutline,
  IoCheckmarkCircle,
  IoCubeOutline,
  IoSendOutline,
  IoFlagOutline,
  IoHomeOutline,
  IoCardOutline,
  IoSchoolOutline,
  IoBriefcaseOutline,
  IoPeopleOutline,
  IoPersonAddOutline,
  IoChevronForward,
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import api from '../apiroute/apiroute';
import Header from '../screens/header';
import { Field, CheckboxField, FileUpload, CardHeader, SectionTitle } from '../DE/formcontrols';
import CheckFormRouter from '../DE/checkformrouter';
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
// Check status pipeline: Assignment Pending -> Verification Pending -> QC -> Report
const CHECK_STATUS_OPTIONS = ['assignment-pending', 'verification-pending', 'qc', 'report'];
const CHECK_STATUS_LABELS = {
  'assignment-pending': 'Assignment Pending',
  'verification-pending': 'Verification Pending',
  qc: 'QC',
  report: 'Report',
};
const RELATIONSHIPS = ['Father', 'Mother', 'Spouse', 'Sibling', 'Son', 'Daughter', 'Friend', 'Other'];

// Cache key for custom fields
const cfKey = (checkTypeId, subCheckId = '') => `${checkTypeId || ''}::${subCheckId || ''}`;

// Key under which each check's dedicated-form data (Address/Employment/Education/etc.)
// is stored inside checkData[slNo], kept separate from the flat custom-field values.
const STRUCTURED_KEY = '__structured';

// Resolve logged-in employee
const getEmployeeAuth = () => {
  try {
    const raw = localStorage.getItem('user') || localStorage.getItem('employee') || localStorage.getItem('authUser') || '{}';
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
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

// Merge fields (deduplicated by name)
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

// FIX: Packages (see Packages.jsx) store their included checks as
// `checkComponents: [{ checkType: <code>, checkTypeName, subType: <code>, subTypeName, qty, slaDays }]`
// where `checkType` is the check-type's `code` field — NOT its Mongo `_id`.
// The previous version matched against `_id`, which never matched, so package
// checks silently failed to populate. This version matches by `code` first,
// then falls back to `_id` / name for older/legacy shapes.
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

const DynamicCheckField = ({ field, value, onChange }) => {
  const t = (field.type || 'text').toLowerCase();
  const common = { label: field.label, name: field.name, required: field.required, value, onChange, placeholder: field.placeholder };
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

const EmployeeWorkorderCreation = () => {
  const navigate = useNavigate();

  const [phase, setPhase] = useState('create');
  const [savedWorkorder, setSavedWorkorder] = useState(null);
  const [activeTab, setActiveTab] = useState('candidate');

  const [initiationMode, setInitiationMode] = useState('Candidate');

  const [isSaving, setIsSaving] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [savingCheckSlNo, setSavingCheckSlNo] = useState(null);
  const [loadingChecks, setLoadingChecks] = useState(true);

  const [clients, setClients] = useState([]);
  const [packages, setPackages] = useState([]);
  const [branches, setBranches] = useState([]);
  const [checkTypeMaster, setCheckTypeMaster] = useState([]);

  const [selectedClient, setSelectedClient] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [autoPackageApplied, setAutoPackageApplied] = useState(false);

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

  // Fetch masters
  useEffect(() => {
    const fetchMasters = async () => {
      setLoadingChecks(true);
      try {
        const [clientsRes, packagesRes, checksRes] = await Promise.all([
          api.get('/clients'),
          api.get('/packages'),
          api.get('/checktypes'),
        ]);
        setClients(clientsRes.data.success ? clientsRes.data.clients : []);
        // FIX: normalize packages the same way Packages.jsx does (id + checkComponents)
        // so downstream matching logic has a consistent shape to work with.
        const rawPackages = packagesRes.data.success ? packagesRes.data.packages : [];
        setPackages(
          rawPackages.map((p) => ({
            ...p,
            id: p._id,
            checkComponents: p.checkComponents || [],
          }))
        );
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

  // Update branches on client change
  useEffect(() => {
    if (selectedClient) {
      const client = clients.find(c => c._id === selectedClient || c.name === selectedClient);
      setBranches(client?.branches || client?.branchNames || []);
    }
  }, [selectedClient, clients]);

  // When a client with a pre-assigned package is selected, auto-select that package.
  useEffect(() => {
    setAutoPackageApplied(false);
  }, [selectedClient]);

  useEffect(() => {
    if (!selectedClient || autoPackageApplied) return;
    const client = clients.find(c => c._id === selectedClient || c.name === selectedClient);
    const pkgName = client?.assignedPackage;
    if (pkgName) {
      setSelectedPackage(pkgName);
      setAutoPackageApplied(true);
    }
  }, [selectedClient, clients, autoPackageApplied]);

  // Whenever the resolved package changes (auto or manual), pull in its checks
  // and merge them into the checks table without duplicating anything already added.
  // FIX: match package by name/packageName/title/code — Packages.jsx stores the
  // package's display name in `name`, and `code` as its unique short code.
  useEffect(() => {
    if (!selectedPackage || checkTypeMaster.length === 0 || packages.length === 0) return;
    const pkg = packages.find(
      (p) => (p.name || p.packageName || p.title) === selectedPackage || p.code === selectedPackage
    );
    if (!pkg) return;

    const pkgChecks = extractPackageChecks(pkg, checkTypeMaster);
    if (!pkgChecks.length) return;

    setChecks(prev => {
      const existingKeys = new Set(prev.map(c => `${c.checkTypeId}::${c.subCheckId || ''}`));
      const toAdd = pkgChecks.filter(c => !existingKeys.has(`${c.checkTypeId}::${c.subCheckId || ''}`));
      if (!toAdd.length) return prev;
      toAdd.forEach((c) => {
        ensureCustomFields(c.checkTypeId, '');
        if (c.subCheckId) ensureCustomFields(c.checkTypeId, c.subCheckId);
      });
      return [...prev, ...toAdd];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPackage, packages, checkTypeMaster]);

  // Ensure custom fields cache
  const ensureCustomFields = async (checkTypeId, subCheckId = '') => {
    if (!checkTypeId) return [];
    const key = cfKey(checkTypeId, subCheckId);
    if (customFieldsCache[key]) return customFieldsCache[key];

    try {
      const params = subCheckId ? { subCheckId } : {};
      const res = await api.get(`/customfields/by-checktype/${checkTypeId}`, { params });
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

  // Seed data when workorder is saved.
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
        if (c.subCheckId) {
          ensureCustomFields(c.checkTypeId, c.subCheckId);
        }
      }
    });

    setCheckData(dataSeed);
    setCheckMeta(metaSeed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedWorkorder]);

  const findMaster = (id) => checkTypeMaster.find(c => c._id === id);

  const fieldsForCheck = (chk) => {
    let baseFields = Array.isArray(chk.fields) && chk.fields.length ? chk.fields : [];
    if (!baseFields.length) {
      const master = checkTypeMaster.find(m => m._id === chk.checkTypeId);
      baseFields = extractFields(master);
    }

    const scoped = customFieldsCache[cfKey(chk.checkTypeId, chk.subCheckId || '')] || [];
    const wide = customFieldsCache[cfKey(chk.checkTypeId, '')] || [];

    return mergeFields(baseFields, scoped, wide);
  };

  const handleFormChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // ---- Candidate change handlers ----
  const updateCandidateSection = (section, key, value) =>
    setCandidate(p => ({ ...p, [section]: { ...p[section], [key]: value } }));

  const handlePersonalChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateCandidateSection('personal', name, type === 'checkbox' ? checked : value);
  };
  const handleAdditionalChange = (e) => updateCandidateSection('additional', e.target.name, e.target.value);
  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCandidate(p => {
      const nextAddress = { ...p.address, [name]: type === 'checkbox' ? checked : value };
      if (name === 'sameAsCurrent' && checked) {
        nextAddress.permanentAddress = nextAddress.currentAddress;
        nextAddress.permanentCity = nextAddress.currentCity;
        nextAddress.permanentState = nextAddress.currentState;
        nextAddress.permanentPinCode = nextAddress.pinCode;
      }
      return { ...p, address: nextAddress };
    });
  };

  const updateSecondaryContact = (idx, key, value) =>
    setCandidate(p => {
      const list = [...p.secondaryContacts];
      list[idx] = { ...list[idx], [key]: value };
      return { ...p, secondaryContacts: list };
    });
  const addSecondaryContact = () =>
    setCandidate(p => ({ ...p, secondaryContacts: [...p.secondaryContacts, { contactNumber: '', contactPerson: '', relationship: '' }] }));
  const removeSecondaryContact = (idx) =>
    setCandidate(p => ({ ...p, secondaryContacts: p.secondaryContacts.filter((_, i) => i !== idx) }));

  const updateEducationRow = (idx, key, value) =>
    setCandidate(p => {
      const list = [...p.education];
      list[idx] = { ...list[idx], [key]: value };
      return { ...p, education: list };
    });
  const addEducationRow = () =>
    setCandidate(p => ({ ...p, education: [...p.education, { qualification: '', institution: '', university: '', yearOfPassing: '', percentage: '' }] }));
  const removeEducationRow = (idx) =>
    setCandidate(p => ({ ...p, education: p.education.filter((_, i) => i !== idx) }));

  const updateEmploymentRow = (idx, key, value) =>
    setCandidate(p => {
      const list = [...p.employment];
      list[idx] = { ...list[idx], [key]: value };
      return { ...p, employment: list };
    });
  const addEmploymentRow = () =>
    setCandidate(p => ({ ...p, employment: [...p.employment, { companyName: '', designation: '', fromDate: '', toDate: '', reportingManager: '', hrContact: '', reasonForLeaving: '' }] }));
  const removeEmploymentRow = (idx) =>
    setCandidate(p => ({ ...p, employment: p.employment.filter((_, i) => i !== idx) }));

  const handleFileSelect = (key) => (file) => setFiles(p => ({ ...p, [key]: file }));

  const handleCheckFieldChange = (slNo, fieldName, value) => {
    const key = String(slNo);
    setCheckData(prev => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [fieldName]: value },
    }));
  };

  // Replaces just the dedicated-form ("Address"/"Employment"/"Education"/etc.)
  // portion of a check's data, leaving any configured custom-field values intact.
  const handleStructuredDataChange = (slNo, structuredData) => {
    const key = String(slNo);
    setCheckData(prev => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [STRUCTURED_KEY]: structuredData },
    }));
  };

  const handleCheckMetaChange = (slNo, key, value) => {
    const slKey = String(slNo);
    setCheckMeta(prev => ({
      ...prev,
      [slKey]: { ...(prev[slKey] || { status: 'assignment-pending', notes: '' }), [key]: value },
    }));
  };

  const handleAddCheck = () => {
    if (!newCheck.checkTypeId) return alert('Please select a check type.');
    const master = findMaster(newCheck.checkTypeId);
    if (!master) return;

    const subChecks = extractSubChecks(master);
    const selectedSub = subChecks.find(s => s.value === newCheck.subCheckId);

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

    setChecks(prev => [...prev, entry]);
    setNewCheck({ checkTypeId: '', subCheckId: '', count: 1 });

    ensureCustomFields(master._id, '');
    if (newCheck.subCheckId) {
      ensureCustomFields(master._id, newCheck.subCheckId);
    }
  };

  const handleRemoveCheck = (idx) => setChecks(prev => prev.filter((_, i) => i !== idx));

  const buildChecksPayload = () =>
    checks.map(c => ({
      checkType: c.checkType,
      checkTypeId: c.checkTypeId,
      subType: c.subType,
      subCheckId: c.subCheckId,
      infoNeeded: c.infoNeeded,
      count: c.count,
      fields: c.fields || [],
      data: {},
      status: 'assignment-pending',
      notes: '',
    }));

  const handleSaveDraft = async () => {
    if (!form.fullName || !form.email || !form.phone || !selectedClient) {
      alert('Please fill all required fields and select a client.');
      return;
    }
    setIsSaving(true);
    try {
      const authUser = getEmployeeAuth();

      const payload = {
        ...form,
        client: selectedClient,
        packageName: selectedPackage,
        branch: selectedBranch,
        initiationMode,
        origin: 'employee',
        createdBy: {
          origin: 'employee',
          userId: authUser._id || authUser.id || '',
          name: authUser.name || authUser.fullName || '',
          email: authUser.email || '',
          role: authUser.role || 'employee',
        },
        checks: buildChecksPayload(),
        status: 'draft',
      };

      const res = await api.post('/workorders?as=employee', payload);
      if (res.data.success) {
        setSavedWorkorder(res.data.workorder);
        setPhase('candidate');
        setActiveTab('candidate');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save draft.');
    } finally {
      setIsSaving(false);
    }
  };

  // After candidate data is saved, bump every check that hasn't started
  // verification yet into "Assignment Pending" — the first stage of the pipeline.
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
          console.error(`Failed to bump check ${c.slNo} to assignment-pending:`, err);
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
      fd.append('status', 'candidate-details');
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
        setCheckMeta(prev => ({ ...prev, ...metaUpdates }));

        alert('Candidate details saved! All checks moved to Assignment Pending.');
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
      if (!form.fullName || !form.email || !form.phone || !selectedClient) {
        alert('Please fill all required fields and select a client.');
        return;
      }
    }
    setIsSaving(true);
    try {
      let workorderId = savedWorkorder?._id;

      if (!workorderId) {
        const authUser = getEmployeeAuth();
        const payload = {
          ...form,
          client: selectedClient,
          packageName: selectedPackage,
          branch: selectedBranch,
          initiationMode,
          origin: 'employee',
          createdBy: {
            origin: 'employee',
            userId: authUser._id || authUser.id || '',
            name: authUser.name || authUser.fullName || '',
            email: authUser.email || '',
            role: authUser.role || 'employee',
          },
          checks: buildChecksPayload(),
          status: 'draft',
        };
        const draftRes = await api.post('/workorders?as=employee', payload);
        if (!draftRes.data.success) throw new Error('Draft creation failed');
        workorderId = draftRes.data.workorder._id;
        setSavedWorkorder(draftRes.data.workorder);
      }

      const res = await api.put(`/workorders/${workorderId}`, {
        status: 'submitted',
        initiationMode,
      });
      if (res.data.success) {
        alert('Workorder submitted successfully!');
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
      if (!form.fullName || !form.email || !form.phone || !selectedClient) {
        alert('Please fill all required fields and select a client.');
        return;
      }
    }
    setIsSendingInvite(true);
    try {
      let workorderId = savedWorkorder?._id;

      if (!workorderId) {
        const authUser = getEmployeeAuth();
        const payload = {
          ...form,
          client: selectedClient,
          packageName: selectedPackage,
          branch: selectedBranch,
          initiationMode,
          origin: 'employee',
          createdBy: {
            origin: 'employee',
            userId: authUser._id || authUser.id || '',
            name: authUser.name || authUser.fullName || '',
            email: authUser.email || '',
            role: authUser.role || 'employee',
          },
          checks: buildChecksPayload(),
          status: 'draft',
        };
        const draftRes = await api.post('/workorders?as=employee', payload);
        if (!draftRes.data.success) throw new Error('Draft creation failed');
        workorderId = draftRes.data.workorder._id;
        setSavedWorkorder(draftRes.data.workorder);
      }

      const submitRes = await api.put(`/workorders/${workorderId}`, {
        status: 'submitted',
        initiationMode,
      });
      if (!submitRes.data.success) throw new Error('Submit failed');

      const inviteRes = await api.post(`/workorders/${workorderId}/send-invite`, {
        email: savedWorkorder?.email || form.email,
        phone: savedWorkorder?.phone || form.phone,
        fullName: savedWorkorder?.fullName || form.fullName,
      });

      if (inviteRes.data.success) {
        alert('Workorder submitted and candidate invite sent successfully!');
        navigate('/workorder-dashboard');
      } else {
        alert('Workorder submitted, but invite could not be sent.');
        navigate('/workorder-dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit and send invite.');
    } finally {
      setIsSendingInvite(false);
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
    ];
  }, [savedWorkorder]);

  const checkTypeOptions = checkTypeMaster.map((c) => ({
    value: c._id,
    label: c.checkTypeName || c.name || c.checkType || 'Check',
  }));

  const savedPhotoUrl = savedWorkorder?.candidateDetails?.documents?.passportPhoto;
  const apiBaseURL = api?.defaults?.baseURL?.replace(/\/api\/?$/, '') || '';

  const isCandidateMode = initiationMode === 'Candidate';

  return (
    <div className="min-h-screen bg-[#F3F4F8] text-[#2A3EB1] font-sans selection:bg-[#2A3EB1]/10">
      <Header showNavigation={false} />

      {/* PHASE 1 HEADER */}
      {phase === 'create' && (
        <div className="bg-[#F3F4F8] py-5 border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl text-sm text-gray-600 hover:text-[#2A3EB1] transition-all">
                <IoArrowBackOutline size={18} />
                <span>Back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#2A3EB1]">Create New Workorder</h1>
                <p className="text-sm text-gray-500">Fill basic info, select package and verification checks</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/workorder-dashboard')} className="px-6 py-3 border border-gray-300 rounded-xl text-[#2A3EB1] hover:bg-gray-100 transition-all">Back to Dashboard</button>

              <button onClick={handleSaveDraft} disabled={isSaving || isSendingInvite} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl text-[#2A3EB1] font-medium flex items-center gap-2 disabled:opacity-50">
                <IoSaveOutline /> {isSaving ? 'Saving...' : 'Save as Draft'}
              </button>

              {isCandidateMode ? (
                <button onClick={handleSubmitAndSendInvite} disabled={isSendingInvite || isSaving} className="px-6 py-3 bg-[#2A3EB1] hover:bg-[#22318f] rounded-xl font-semibold flex items-center gap-2 text-white disabled:opacity-50">
                  <IoPersonAddOutline /> {isSendingInvite ? 'Sending...' : 'Submit & Send Invite'}
                </button>
              ) : (
                <button onClick={handleSubmitWorkorder} disabled={isSaving || isSendingInvite} className="px-6 py-3 bg-[#2A3EB1] hover:bg-[#22318f] rounded-xl font-semibold flex items-center gap-2 text-white disabled:opacity-50">
                  <IoSendOutline /> {isSaving ? 'Submitting...' : 'Submit Workorder'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2 HEADER */}
      {phase === 'candidate' && savedWorkorder && (
        <div className="bg-[#2A3EB1] py-5 border-b border-[#1c2b80] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setPhase('create')} className="text-white hover:text-gray-200">
                <IoArrowBackOutline size={26} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Workorder: {savedWorkorder.bgvRef || 'BGV-2026-XXXX'}</h1>
                <p className="text-gray-200 text-sm">Draft Saved — Enter data or send candidate invite</p>
              </div>
            </div>
            <div className="flex gap-3">
              {isCandidateMode ? (
                <button onClick={handleSubmitAndSendInvite} disabled={isSendingInvite || isSaving} className="px-6 py-3 bg-[#F3F4F8] hover:bg-gray-200 rounded-xl font-semibold flex items-center gap-2 text-[#2A3EB1] disabled:opacity-50">
                  <IoPersonAddOutline /> {isSendingInvite ? 'Sending...' : 'Submit & Send Invite'}
                </button>
              ) : (
                <button onClick={handleSubmitWorkorder} disabled={isSaving || isSendingInvite} className="px-6 py-3 bg-[#F3F4F8] hover:bg-gray-200 rounded-xl font-semibold flex items-center gap-2 text-[#2A3EB1] disabled:opacity-50">
                  <IoSendOutline /> {isSaving ? 'Submitting...' : 'Submit Workorder'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 1: CREATE */}
      {phase === 'create' && (
        <main className="max-w-7xl mx-auto px-6 py-10">
          {/* Initiation Mode */}
          <div className="mb-10">
            <label className="block text-xs font-bold text-gray-600 tracking-wider uppercase mb-4">INITIATION MODE / FLOW *</label>
            <div className="flex gap-6">
              <button onClick={() => setInitiationMode('Candidate')} className={`flex-1 max-w-md p-6 rounded-3xl border-2 transition-all flex items-center gap-4 ${initiationMode === 'Candidate' ? 'border-[#2A3EB1] bg-[#EEF0FA]' : 'border-gray-300 hover:border-gray-500'}`}>
                <IoPersonOutline size={32} className={initiationMode === 'Candidate' ? 'text-[#2A3EB1]' : 'text-gray-400'} />
                <div className="text-left">
                  <div className="font-semibold text-lg text-[#2A3EB1]">Candidate</div>
                  <div className="text-sm text-gray-500">Candidate will fill their own data</div>
                </div>
              </button>

              <button onClick={() => setInitiationMode('Verifitech')} className={`flex-1 max-w-md p-6 rounded-3xl border-2 transition-all flex items-center gap-4 ${initiationMode === 'Verifitech' ? 'border-[#2A3EB1] bg-[#EEF0FA]' : 'border-gray-300 hover:border-gray-500'}`}>
                <IoShieldCheckmarkOutline size={32} className={initiationMode === 'Verifitech' ? 'text-[#2A3EB1]' : 'text-gray-400'} />
                <div className="text-left">
                  <div className="font-semibold text-lg text-[#2A3EB1]">Verifitech</div>
                  <div className="text-sm text-gray-500">Internal team will handle data entry</div>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Candidate Basic Info */}
            <div className="lg:col-span-1 bg-[#F5F5F5] border border-gray-200 rounded-3xl p-8">
              <CardHeader icon={IoPersonOutline} title="Candidate Information" />
              <div className="mt-8 space-y-6">
                <Field label="Full Name" name="fullName" required value={form.fullName} onChange={handleFormChange} placeholder="As per government ID" />
                <Field label="Email Address" name="email" type="email" required value={form.email} onChange={handleFormChange} placeholder="candidate@email.com" />
                <Field label="Phone Number" name="phone" type="tel" required value={form.phone} onChange={handleFormChange} placeholder="+91 99999 99999" />
                <Field label="Priority" name="priority" as="select" value={form.priority} onChange={handleFormChange} options={PRIORITIES} />
                <Field label="Client Reference" name="clientRef" value={form.clientRef} onChange={handleFormChange} placeholder="Optional reference no." />
              </div>
            </div>

            {/* Configuration */}
            <div className="lg:col-span-2 bg-[#F5F5F5] border border-gray-200 rounded-3xl p-8">
              <CardHeader icon={IoSettingsOutline} title="Workorder Configuration" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">Client *</label>
                  <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-[#2A3EB1]">
                    <option value="">Select Client</option>
                    {clients.map(c => <option key={c._id} value={c._id || c.name}>{c.companyName || c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">
                    Package {autoPackageApplied && <span className="normal-case font-normal text-gray-400">(auto-filled from client)</span>}
                  </label>
                  <select
                    value={selectedPackage}
                    onChange={(e) => { setSelectedPackage(e.target.value); setAutoPackageApplied(false); }}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-[#2A3EB1]"
                  >
                    <option value="">Select Package</option>
                    {packages.map(p => (
                      <option key={p._id || p.id} value={p.name || p.packageName}>
                        {p.name || p.packageName} {p.code ? `(${p.code})` : ''}
                      </option>
                    ))}
                  </select>
                  {packages.length === 0 && (
                    <p className="text-xs text-red-600 mt-1">No packages found. Create one under Packages first.</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">Branch</label>
                  <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-[#2A3EB1]">
                    <option value="">Select Branch</option>
                    {branches.map((b, i) => <option key={i} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              {/* Add Check Section */}
              <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold flex items-center gap-2 text-[#2A3EB1]"><IoShieldCheckmarkOutline size={22} /> Verification Checks</h4>
                  <span className="text-sm text-gray-500">{checks.length} added</span>
                </div>

                {selectedPackage && (
                  <div className="mb-4 px-4 py-3 rounded-xl border border-gray-300 bg-[#EEF0FA] text-xs text-gray-600 flex items-center gap-2">
                    <IoCubeOutline size={16} className="text-[#2A3EB1]" />
                    Checks included in package "<span className="font-semibold text-[#2A3EB1]">{selectedPackage}</span>" are added automatically below. You can still add or remove checks manually.
                  </div>
                )}

                <div className="bg-[#EEF0FA] border border-gray-200 rounded-2xl p-6 mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <select value={newCheck.checkTypeId} onChange={(e) => setNewCheck(p => ({ ...p, checkTypeId: e.target.value, subCheckId: '' }))} className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-[#2A3EB1]">
                      <option value="">Select Check Type</option>
                      {checkTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>

                    <select value={newCheck.subCheckId} onChange={(e) => setNewCheck(p => ({ ...p, subCheckId: e.target.value }))} disabled={!newCheck.checkTypeId} className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-[#2A3EB1] disabled:opacity-50">
                      <option value="">Select Sub-Check</option>
                      {newCheck.checkTypeId && (() => {
                        const master = findMaster(newCheck.checkTypeId);
                        const subs = extractSubChecks(master);
                        return subs.map((s, idx) => <option key={idx} value={s.value}>{s.label}</option>);
                      })()}
                    </select>

                    <input type="number" min="1" value={newCheck.count} onChange={(e) => setNewCheck(p => ({ ...p, count: e.target.value }))} className="w-28 bg-white border border-gray-300 rounded-xl px-4 py-3 text-[#2A3EB1]" />
                    <button onClick={handleAddCheck} className="px-8 py-3 bg-[#2A3EB1] hover:bg-[#22318f] text-white rounded-xl font-medium flex items-center gap-2">
                      <IoAddOutline /> Add
                    </button>
                  </div>
                </div>

                {/* Checks Table */}
                <div className="bg-[#F5F5F5] border border-gray-200 rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-[#EEF0FA]">
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500">CHECK TYPE</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500">SUB TYPE</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500">FIELDS</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500">INFO FROM</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500">SOURCE</th>
                        <th className="px-6 py-4 w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {checks.length > 0 ? checks.map((c, i) => (
                        <tr key={i} className="border-t border-gray-100 hover:bg-[#EEF0FA]">
                          <td className="px-6 py-4 font-medium text-[#2A3EB1]">{c.checkType}</td>
                          <td className="px-6 py-4 text-gray-600 italic">{c.subType || '—'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{c.fields?.length || 0}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{c.infoNeeded}</td>
                          <td className="px-6 py-4 text-xs">
                            {c.fromPackage ? (
                              <span className="px-2 py-1 rounded-md border border-gray-300 bg-gray-100 text-gray-600">Package</span>
                            ) : (
                              <span className="px-2 py-1 rounded-md border border-gray-300 bg-white text-gray-500">Manual</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <button onClick={() => handleRemoveCheck(i)} className="text-red-600 hover:text-red-800"><IoTrashOutline size={20} /></button>
                          </td>
                        </tr>
                      )) : (
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

      {/* PHASE 2: CANDIDATE + CHECKS */}
      {phase === 'candidate' && savedWorkorder && (
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-[#F5F5F5] border border-gray-200 rounded-3xl p-6 mb-6">
                <div className="font-bold text-xl text-[#2A3EB1]">{savedWorkorder.fullName}</div>
                <div className="text-sm text-gray-500">{savedWorkorder.email}</div>
                <div className="mt-4 text-xs bg-gray-100 text-[#2A3EB1] border border-gray-300 px-4 py-2 rounded-2xl inline-flex items-center gap-2">
                  <IoCheckmarkCircle /> Draft Saved
                </div>
                <div className="mt-3 text-xs bg-[#2A3EB1] text-white px-4 py-2 rounded-2xl inline-flex items-center gap-2">
                  {isCandidateMode ? <IoPersonOutline /> : <IoShieldCheckmarkOutline />} {initiationMode} Mode
                </div>
              </div>

              <nav className="bg-[#F5F5F5] border border-gray-200 rounded-3xl p-4 space-y-1">
                {sidebarTabs.map((tab) => {
                  const active = activeTab === tab.id;
                  const Icon = tab.icon;
                  let hint = null;
                  if (tab.check) {
                    const d = checkData[String(tab.check.slNo)] || {};
                    hint = Object.entries(d).filter(([k, v]) => k !== STRUCTURED_KEY && v).length;
                  }
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-left transition-all ${active ? 'bg-[#2A3EB1] text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                      <Icon size={20} />
                      <span className="flex-1">{tab.label}</span>
                      {tab.check && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${active ? 'border-white/40 text-white' : 'border-gray-300 text-gray-500'}`}>
                          {CHECK_STATUS_LABELS[(tab.check.status || 'assignment-pending')] || tab.check.status}
                        </span>
                      )}
                      {hint > 0 && <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-gray-200'}`}>{hint}</span>}
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Main Content */}
            <section className="lg:col-span-3">
              {/* ---- CANDIDATE DATA ENTRY: single-page form, no step wizard ---- */}
              {activeTab === 'candidate' && (
                <div className="bg-[#F5F5F5] border border-gray-200 rounded-3xl overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center bg-[#EEF0FA] sticky top-0 z-10">
                    <h3 className="text-xl font-bold text-[#2A3EB1]">Candidate Data Entry Form</h3>
                    <button onClick={handleSaveCandidate} disabled={isSaving} className="flex items-center gap-2 bg-[#2A3EB1] text-white px-6 py-3 rounded-2xl font-bold disabled:opacity-50">
                      <IoSaveOutline size={18} /> {isSaving ? 'Saving...' : 'Save Candidate Data'}
                    </button>
                  </div>

                  <div className="p-8 space-y-12">
                    {/* Basic Details */}
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
                        <CheckboxField
                          label="Physically Challenged?"
                          name="physicallyChallenged"
                          checked={candidate.personal.physicallyChallenged}
                          onChange={handlePersonalChange}
                          description="If yes, please provide more details in the below textbox"
                        />
                        <CheckboxField
                          label="Any Chronic Health Issues?"
                          name="chronicCondition"
                          checked={candidate.personal.chronicCondition}
                          onChange={handlePersonalChange}
                          description="If yes, please provide more details in the below textbox"
                        />
                        <Field label="Disability Details" name="disabilityDetails" as="textarea" value={candidate.personal.disabilityDetails} onChange={handlePersonalChange} />
                        <Field label="Chronic Condition Details" name="chronicConditionDetails" as="textarea" value={candidate.personal.chronicConditionDetails} onChange={handlePersonalChange} />
                      </div>
                    </div>

                    {/* Secondary Contact Details */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <SectionTitle icon={IoPeopleOutline} title="Secondary Contact Details" />
                        <button onClick={addSecondaryContact} className="flex items-center gap-1 text-xs font-semibold text-[#2A3EB1] border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-100">
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
                      <p className="text-xs text-gray-400 mt-3">Note: This phone number should not match the candidate's primary mobile number.</p>
                    </div>

                    {/* Additional Details */}
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

                    {/* Address */}
                    <div>
                      <SectionTitle icon={IoHomeOutline} title="Current Address" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="md:col-span-2">
                          <Field label="Current Address" name="currentAddress" as="textarea" value={candidate.address.currentAddress} onChange={handleAddressChange} />
                        </div>
                        <Field label="Current City" name="currentCity" value={candidate.address.currentCity} onChange={handleAddressChange} />
                        <Field label="Current State" name="currentState" value={candidate.address.currentState} onChange={handleAddressChange} />
                        <Field label="PIN Code" name="pinCode" value={candidate.address.pinCode} onChange={handleAddressChange} />
                        <Field label="Country" name="country" value={candidate.address.country} onChange={handleAddressChange} />
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <SectionTitle icon={IoLocationOutline} title="Permanent Address" />
                        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                          <input type="checkbox" name="sameAsCurrent" checked={candidate.address.sameAsCurrent} onChange={handleAddressChange} className="w-4 h-4" />
                          Same as current address
                        </label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <Field label="Permanent Address" name="permanentAddress" as="textarea" value={candidate.address.permanentAddress} onChange={handleAddressChange} />
                        </div>
                        <Field label="Permanent City" name="permanentCity" value={candidate.address.permanentCity} onChange={handleAddressChange} />
                        <Field label="Permanent State" name="permanentState" value={candidate.address.permanentState} onChange={handleAddressChange} />
                        <Field label="Permanent PIN Code" name="permanentPinCode" value={candidate.address.permanentPinCode} onChange={handleAddressChange} />
                      </div>
                    </div>

                    {/* Education */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <SectionTitle icon={IoSchoolOutline} title="Education Details" />
                        <button onClick={addEducationRow} className="flex items-center gap-1 text-xs font-semibold text-[#2A3EB1] border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-100">
                          <IoAddOutline size={16} /> Add Education
                        </button>
                      </div>
                      <div className="space-y-4">
                        {candidate.education.map((ed, idx) => (
                          <div key={idx} className="p-5 border border-gray-200 rounded-2xl">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-sm font-bold text-gray-400">Record {idx + 1}</span>
                              {candidate.education.length > 1 && (
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
                        <button onClick={addEmploymentRow} className="flex items-center gap-1 text-xs font-semibold text-[#2A3EB1] border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-100">
                          <IoAddOutline size={16} /> Add Employer
                        </button>
                      </div>
                      {candidate.personal.isFresher === 'Yes' && (
                        <div className="mb-4 px-4 py-3 rounded-xl border border-gray-300 bg-[#EEF0FA] text-xs text-gray-600">
                          Candidate marked as Fresher — employment history is optional.
                        </div>
                      )}
                      <div className="space-y-4">
                        {candidate.employment.map((emp, idx) => (
                          <div key={idx} className="p-5 border border-gray-200 rounded-2xl">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-sm font-bold text-gray-400">Employer {idx + 1}</span>
                              {candidate.employment.length > 1 && (
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <FileUpload label="Passport Photo" file={files.passportPhoto} onSelect={handleFileSelect('passportPhoto')} />
                          {savedPhotoUrl && !files.passportPhoto && (
                            <img src={`${apiBaseURL}${savedPhotoUrl}`} alt="saved" className="mt-3 w-20 h-20 rounded-xl object-cover border border-gray-300" />
                          )}
                        </div>
                        <FileUpload label="Aadhaar Document" file={files.aadhaarFile} onSelect={handleFileSelect('aadhaarFile')} />
                        <FileUpload label="PAN Document" file={files.panFile} onSelect={handleFileSelect('panFile')} />
                        <FileUpload label="Passport Document" file={files.passportFile} onSelect={handleFileSelect('passportFile')} />
                        <FileUpload label="Driving License Document" file={files.dlFile} onSelect={handleFileSelect('dlFile')} />
                        <FileUpload label="Other Supporting Document" file={files.otherDocFile} onSelect={handleFileSelect('otherDocFile')} />
                      </div>
                    </div>

                    {/* Final Save */}
                    <div className="flex justify-end pt-6 border-t border-gray-200">
                      <button
                        onClick={handleSaveCandidate}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-3.5 bg-[#2A3EB1] text-white rounded-xl font-semibold hover:bg-[#22318f] disabled:opacity-50"
                      >
                        <IoSaveOutline size={18} /> {isSaving ? 'Saving...' : 'Save Candidate Data'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* DYNAMIC CHECK TABS — opens a dedicated form based on check type (Address / Employment / Education / ...),
                  or a "Coming Soon" placeholder if no dedicated form exists yet for that check type. */}
              {activeTab.startsWith('check-') && (() => {
                const slNo = activeTab.replace('check-', '');

                const currentCheck =
                  (savedWorkorder?.checks || []).find(c => String(c.slNo) === slNo) ||
                  checks.find((c, idx) => String(idx) === slNo) ||
                  checks.find(c => String(c.slNo) === slNo);

                if (!currentCheck) return <div className="p-8 text-red-600">Check not found</div>;

                const fields = fieldsForCheck(currentCheck);
                const meta = checkMeta[slNo] || { status: 'assignment-pending', notes: '' };
                const fullData = checkData[slNo] || {};
                const structuredData = fullData[STRUCTURED_KEY] || {};

                return (
                  <div className="bg-[#F5F5F5] border border-gray-200 rounded-3xl overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center bg-[#EEF0FA]">
                      <div>
                        <h3 className="text-xl font-bold text-[#2A3EB1]">{currentCheck.checkType}</h3>
                        {currentCheck.subType && <p className="text-gray-500 italic">{currentCheck.subType}</p>}
                      </div>
                      <button
                        onClick={() => handleSaveCheck(slNo)}
                        disabled={savingCheckSlNo === slNo}
                        className="flex items-center gap-2 bg-[#2A3EB1] text-white px-6 py-3 rounded-2xl font-bold disabled:opacity-50"
                      >
                        {savingCheckSlNo === slNo ? 'Saving...' : 'Save Check'}
                      </button>
                    </div>

                    <div className="p-8 space-y-10">
                      {/* Dedicated form for this check type (Address / Employment / Education / Coming Soon) */}
                      <CheckFormRouter
                        checkType={currentCheck.checkType}
                        subType={currentCheck.subType}
                        data={structuredData}
                        onDataChange={(next) => handleStructuredDataChange(slNo, next)}
                        workorderId={savedWorkorder._id}
                        slNo={slNo}
                      />

                      {/* Any additional fields configured for this check type via Custom Fields master */}
                      {fields.length > 0 && (
                        <div>
                          <SectionTitle icon={IoDocumentTextOutline} title="Additional Fields (Configured)" />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {fields.map((field, idx) => (
                              <DynamicCheckField
                                key={`${field.name}-${idx}`}
                                field={field}
                                value={fullData[field.name] || ''}
                                onChange={(e) => handleCheckFieldChange(slNo, field.name, e.target.value)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="bg-[#EEF0FA] border border-gray-200 rounded-2xl p-6">
                        <SectionTitle icon={IoFlagOutline} title="Status & Notes" />
                        {/* Pipeline breadcrumb */}
                        <div className="flex items-center gap-2 mb-6 flex-wrap">
                          {CHECK_STATUS_OPTIONS.map((st, idx) => {
                            const activeIdx = CHECK_STATUS_OPTIONS.indexOf(meta.status);
                            const done = idx <= activeIdx;
                            return (
                              <React.Fragment key={st}>
                                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${done ? 'bg-[#2A3EB1] text-white border-[#2A3EB1]' : 'bg-white text-gray-400 border-gray-300'}`}>
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
                            <select
                              value={meta.status}
                              onChange={(e) => handleCheckMetaChange(slNo, 'status', e.target.value)}
                              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-[#2A3EB1]"
                            >
                              {CHECK_STATUS_OPTIONS.map(st => (
                                <option key={st} value={st}>{CHECK_STATUS_LABELS[st]}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Field
                              label="Notes / Remarks"
                              name="notes"
                              as="textarea"
                              value={meta.notes}
                              onChange={(e) => handleCheckMetaChange(slNo, 'notes', e.target.value)}
                              placeholder="Any observations or additional remarks..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </section>
          </div>
        </main>
      )}
    </div>
  );
};

export default EmployeeWorkorderCreation;