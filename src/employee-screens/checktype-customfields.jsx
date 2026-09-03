import React, { useState, useEffect, useRef } from 'react';
import {
    IoAddOutline,
    IoSearchOutline,
    IoFilterOutline,
    IoCloseOutline,
    IoCreateOutline,
    IoTrashOutline,
    IoChevronDownOutline,
    IoChevronUpOutline,
    IoChevronForwardSharp,
    IoCheckmarkCircleOutline,
    IoAlertCircleOutline,
    IoSaveOutline,
    IoGridOutline,
    IoListOutline,
    IoCardOutline,
    IoRefreshOutline,
    IoDocumentTextOutline,
    IoCheckboxOutline,
    IoLayersOutline,
    IoTimeOutline,
    IoHomeOutline,
    IoEyeOutline,
    IoArrowBackOutline,
    IoEyeOffOutline,
    IoTextOutline,
    IoToggleOutline,
    IoCalendarOutline,
    IoListOutline as IoListIcon,
    IoMailOutline,
    IoPhonePortraitOutline,
    IoLinkOutline,
    IoCodeOutline,
    IoResizeOutline,
    IoCloudUploadOutline,
    IoColorPaletteOutline,
    IoRadioOutline,
    IoSwapVerticalOutline,
    IoLockClosedOutline,
    IoInformationCircleOutline,
    IoOptionsOutline,
    IoBrushOutline,
    IoCodeSlashOutline,
    IoGitBranchOutline
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import api from '../apiroute/apiroute';
import Header from '../screens/header';

// ─── Field Type Definitions ──────────────────────────────────────
const FIELD_TYPES = [
    { value: 'text', label: 'Text', icon: IoTextOutline, color: 'text-[#00D4AA]', bg: 'bg-[#00D4AA]/10', border: 'border-[#00D4AA]/20' },
    { value: 'number', label: 'Number', icon: IoCodeOutline, color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/20' },
    { value: 'email', label: 'Email', icon: IoMailOutline, color: 'text-[#F5A623]', bg: 'bg-[#F5A623]/10', border: 'border-[#F5A623]/20' },
    { value: 'phone', label: 'Phone', icon: IoPhonePortraitOutline, color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/20' },
    { value: 'textarea', label: 'Textarea', icon: IoResizeOutline, color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', border: 'border-[#8B5CF6]/20' },
    { value: 'date', label: 'Date', icon: IoCalendarOutline, color: 'text-[#EC4899]', bg: 'bg-[#EC4899]/10', border: 'border-[#EC4899]/20' },
    { value: 'dropdown', label: 'Dropdown', icon: IoChevronDownOutline, color: 'text-[#06B6D4]', bg: 'bg-[#06B6D4]/10', border: 'border-[#06B6D4]/20' },
    { value: 'radio', label: 'Radio Group', icon: IoRadioOutline, color: 'text-[#F97316]', bg: 'bg-[#F97316]/10', border: 'border-[#F97316]/20' },
    { value: 'checkbox', label: 'Checkbox', icon: IoCheckboxOutline, color: 'text-[#14B8A6]', bg: 'bg-[#14B8A6]/10', border: 'border-[#14B8A6]/20' },
    { value: 'toggle', label: 'Toggle', icon: IoToggleOutline, color: 'text-[#A855F7]', bg: 'bg-[#A855F7]/10', border: 'border-[#A855F7]/20' },
    { value: 'file', label: 'File Upload', icon: IoCloudUploadOutline, color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]/20' },
    { value: 'url', label: 'URL', icon: IoLinkOutline, color: 'text-[#6366F1]', bg: 'bg-[#6366F1]/10', border: 'border-[#6366F1]/20' },
    { value: 'color', label: 'Color Picker', icon: IoColorPaletteOutline, color: 'text-[#F43F5E]', bg: 'bg-[#F43F5E]/10', border: 'border-[#F43F5E]/20' },
    { value: 'richtext', label: 'Rich Text', icon: IoBrushOutline, color: 'text-[#D946EF]', bg: 'bg-[#D946EF]/10', border: 'border-[#D946EF]/20' },
];

const VALIDATION_RULES = [
    { value: 'none', label: 'None' },
    { value: 'required', label: 'Required' },
    { value: 'minLength', label: 'Min Length' },
    { value: 'maxLength', label: 'Max Length' },
    { value: 'pattern', label: 'Regex Pattern' },
    { value: 'min', label: 'Min Value' },
    { value: 'max', label: 'Max Value' },
    { value: 'email', label: 'Valid Email' },
    { value: 'url', label: 'Valid URL' },
    { value: 'phone', label: 'Valid Phone' },
    { value: 'dateRange', label: 'Date Range' },
    { value: 'fileSize', label: 'Max File Size' },
    { value: 'fileType', label: 'Allowed File Types' },
];

function getEmptyForm() {
    return {
        id: null,
        fieldName: '',
        fieldLabel: '',
        fieldType: 'text',
        placeholder: '',
        defaultValue: '',
        description: '',
        checkTypeId: '',
        subCheckId: '',
        subCheckName: '',
        required: false,
        unique: false,
        readonly: false,
        hidden: false,
        showInList: true,
        showInForm: true,
        status: 'Active',
        sortOrder: 0,
        minLength: '',
        maxLength: '',
        minValue: '',
        maxValue: '',
        regexPattern: '',
        regexMessage: '',
        options: [],
        allowedFileTypes: '',
        maxFileSize: '',
        width: 'full',
        helpText: '',
        cssClass: '',
        validationRules: []
    };
}

// ─── Floating Input (MODULE-LEVEL to preserve focus while typing) ──
const FloatingInput = ({
    label, name, type = 'text', required = false, icon: Icon,
    value, onChange, readOnly, prefix, suffix,
    focusedField, setFocusedField, errors = {},
}) => {
    const isFocused = focusedField === name;
    const hasValue = value && value.toString().length > 0;
    return (
        <div className="relative group">
            {Icon && (
                <div className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors duration-300 ${isFocused ? 'text-[#00D4AA]' : 'text-[#7A8B9A]'}`}>
                    <Icon size={20} />
                </div>
            )}
            <input
                type={type}
                name={name}
                value={value || ''}
                onChange={onChange}
                onFocus={() => setFocusedField(name)}
                onBlur={() => setFocusedField(null)}
                required={required}
                readOnly={readOnly}
                className={`w-full bg-[#FFFFFF]/60 border border-[#D8E6E3] focus:border-[#00D4AA] text-[#0A1628] rounded-xl ${Icon ? 'px-12' : 'px-4'} py-4 outline-none transition-all duration-300 placeholder-transparent peer shadow-inner ${readOnly ? 'opacity-50 cursor-not-allowed' : ''} ${errors[name] ? 'border-[#FF5252]/50' : ''} ${prefix ? 'pl-10' : ''} ${suffix ? 'pr-20' : ''}`}
                placeholder={label}
                id={`modal-${name}`}
            />
            {prefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A8B9A] text-sm">{prefix}</span>}
            {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7A8B9A] text-sm">{suffix}</span>}
            <label
                htmlFor={`modal-${name}`}
                className={`absolute ${Icon ? 'left-12' : prefix ? 'left-10' : 'left-4'} transition-all duration-300 pointer-events-none ${hasValue || isFocused ? '-top-2.5 text-xs text-[#00D4AA] bg-[#FFFFFF] px-2 rounded border border-[#D8E6E3]' : 'top-4 text-[#7A8B9A] bg-transparent'}`}
            >
                {label} {required && <span className="text-[#FF5252]">*</span>}
            </label>
            {errors[name] && <p className="text-[#FF5252] text-xs mt-1.5 ml-1">{errors[name]}</p>}
        </div>
    );
};

const CustomFields = () => {
    const navigate = useNavigate();
    const [customFields, setCustomFields] = useState([]);
    const [checkTypes, setCheckTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ status: 'all', fieldType: 'all', checkType: 'all', subCheck: 'all', required: 'all' });
    const [sortConfig, setSortConfig] = useState({ key: 'sortOrder', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedRows, setSelectedRows] = useState([]);
    const [viewType, setViewType] = useState('list');
    const [showPreview, setShowPreview] = useState(false);
    const [previewField, setPreviewField] = useState(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [notification, setNotification] = useState(null);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState(getEmptyForm());
    const [focusedField, setFocusedField] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [optionInput, setOptionInput] = useState('');
    const [activeModalTab, setActiveModalTab] = useState('basic');

    // Sub-checks for the modal's selected check type
    const [modalSubChecks, setModalSubChecks] = useState([]);
    const [loadingSubChecks, setLoadingSubChecks] = useState(false);
    // Sub-checks for the filter panel's selected check type
    const [filterSubChecks, setFilterSubChecks] = useState([]);

    const modalRef = useRef(null);
    const filterRef = useRef(null);
    const previewRef = useRef(null);

    // ─── Fetch Data ───────────────────────────────────────────────
    const fetchCustomFields = async () => {
        try {
            setLoading(true);
            const res = await api.get('/customfields');
            if (res.data.success) {
                setCustomFields(res.data.customFields.map(f => ({ ...f, id: f._id })));
            }
        } catch (error) {
            console.error('Fetch custom fields error:', error);
            setNotification({ type: 'error', message: 'Failed to load custom fields' });
            setTimeout(() => setNotification(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const fetchCheckTypes = async () => {
        try {
            const res = await api.get('/checktypes');
            if (res.data.success) {
                setCheckTypes(res.data.checkTypes.map(c => ({ ...c, id: c._id })));
            }
        } catch (error) {
            console.error('Fetch check types error:', error);
        }
    };

    // Load sub-checks for a check type (modal)
    const loadModalSubChecks = async (checkTypeId) => {
        if (!checkTypeId) { setModalSubChecks([]); return; }
        try {
            setLoadingSubChecks(true);
            const res = await api.get(`/customfields/subchecks/${checkTypeId}`);
            setModalSubChecks(res.data?.success ? (res.data.subChecks || []) : []);
        } catch (error) {
            console.error('Load modal sub-checks error:', error);
            setModalSubChecks([]);
        } finally {
            setLoadingSubChecks(false);
        }
    };

    // Load sub-checks for a check type (filter)
    const loadFilterSubChecks = async (checkTypeId) => {
        if (!checkTypeId || checkTypeId === 'all') { setFilterSubChecks([]); return; }
        try {
            const res = await api.get(`/customfields/subchecks/${checkTypeId}`);
            setFilterSubChecks(res.data?.success ? (res.data.subChecks || []) : []);
        } catch (error) {
            console.error('Load filter sub-checks error:', error);
            setFilterSubChecks([]);
        }
    };

    useEffect(() => { fetchCustomFields(); fetchCheckTypes(); }, []);

    // ─── Filtering, Sorting, Pagination ───────────────────────────
    const filteredFields = customFields.filter(f => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = !query ||
            f.fieldLabel?.toLowerCase().includes(query) ||
            f.fieldName?.toLowerCase().includes(query) ||
            f.fieldType?.toLowerCase().includes(query) ||
            f.subCheckName?.toLowerCase().includes(query);
        const matchesStatus = filters.status === 'all' || f.status?.toLowerCase() === filters.status;
        const matchesFieldType = filters.fieldType === 'all' || f.fieldType === filters.fieldType;
        const matchesCheckType = filters.checkType === 'all' || f.checkTypeId === filters.checkType;
        const matchesSubCheck = filters.subCheck === 'all' || (f.subCheckId || '') === filters.subCheck;
        const matchesRequired = filters.required === 'all' || f.required === (filters.required === 'yes');
        return matchesSearch && matchesStatus && matchesFieldType && matchesCheckType && matchesSubCheck && matchesRequired;
    });

    const sortedFields = [...filteredFields].sort((a, b) => {
        const valA = a[sortConfig.key] ?? '';
        const valB = b[sortConfig.key] ?? '';
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(sortedFields.length / pageSize) || 1;
    const paginatedFields = sortedFields.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const stats = {
        total: customFields.length,
        active: customFields.filter(f => f.status === 'Active').length,
        required: customFields.filter(f => f.required).length,
        types: new Set(customFields.map(f => f.fieldType)).size
    };

    const handleSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    const toggleSelectAll = () => setSelectedRows(prev => prev.length === paginatedFields.length ? [] : paginatedFields.map(f => f.id));
    const toggleSelectRow = (id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);

    const getCheckTypeName = (id) => checkTypes.find(c => c.id === id)?.name || '—';
    const getFieldTypeConfig = (type) => FIELD_TYPES.find(t => t.value === type) || FIELD_TYPES[0];

    // ─── Modal Controls ───────────────────────────────────────────
    const openCreateModal = () => {
        setEditingField(null);
        setFormData({ ...getEmptyForm(), sortOrder: customFields.length + 1 });
        setErrors({});
        setOptionInput('');
        setActiveModalTab('basic');
        setModalSubChecks([]);
        setShowCreateModal(true);
    };

    const openEditModal = (field) => {
        setEditingField(field);
        setFormData({
            ...getEmptyForm(),
            ...field,
            subCheckId: field.subCheckId || '',
            subCheckName: field.subCheckName || '',
            sortOrder: String(field.sortOrder ?? 0),
            minLength: field.minLength ? String(field.minLength) : '',
            maxLength: field.maxLength ? String(field.maxLength) : '',
            minValue: field.minValue ? String(field.minValue) : '',
            maxValue: field.maxValue ? String(field.maxValue) : '',
            maxFileSize: field.maxFileSize ? String(field.maxFileSize) : '',
        });
        setErrors({});
        setOptionInput('');
        setActiveModalTab('basic');
        // Preload sub-checks for the field's check type so the dropdown is populated
        if (field.checkTypeId) loadModalSubChecks(field.checkTypeId);
        else setModalSubChecks([]);
        setShowCreateModal(true);
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingField(null);
        setFormData(getEmptyForm());
        setErrors({});
        setOptionInput('');
        setModalSubChecks([]);
    };

    const openPreview = (field) => { setPreviewField(field); setShowPreview(true); };
    const closePreview = () => { setShowPreview(false); setPreviewField(null); };

    // ─── Form Handlers ────────────────────────────────────────────
    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    // When check type changes: load its sub-checks and reset any chosen sub-check
    const handleCheckTypeChange = (e) => {
        const checkTypeId = e.target.value;
        setFormData(prev => ({ ...prev, checkTypeId, subCheckId: '', subCheckName: '' }));
        loadModalSubChecks(checkTypeId);
    };

    // When sub-check changes: keep both id and name in sync
    const handleSubCheckChange = (e) => {
        const subCheckId = e.target.value;
        const sc = modalSubChecks.find(s => s._id === subCheckId);
        setFormData(prev => ({ ...prev, subCheckId, subCheckName: sc?.name || '' }));
    };

    const addOption = () => {
        if (optionInput.trim() && !formData.options.includes(optionInput.trim())) {
            setFormData(prev => ({ ...prev, options: [...prev.options, optionInput.trim()] }));
            setOptionInput('');
        }
    };

    const removeOption = (index) => {
        setFormData(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== index) }));
    };

    const moveOption = (index, direction) => {
        const newOptions = [...formData.options];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= newOptions.length) return;
        [newOptions[index], newOptions[targetIndex]] = [newOptions[targetIndex], newOptions[index]];
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const addValidationRule = (rule) => {
        if (!formData.validationRules.includes(rule)) {
            setFormData(prev => ({ ...prev, validationRules: [...prev.validationRules, rule] }));
        }
    };

    const removeValidationRule = (rule) => {
        setFormData(prev => ({ ...prev, validationRules: prev.validationRules.filter(r => r !== rule) }));
    };

    // ─── Validation ───────────────────────────────────────────────
    const validateForm = () => {
        const e = {};
        if (!formData.fieldLabel?.trim()) e.fieldLabel = 'Field label is required';
        if (!formData.fieldName?.trim()) e.fieldName = 'Field name is required';
        else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(formData.fieldName)) e.fieldName = 'Must start with a letter, only letters, numbers, underscores';
        if ((formData.fieldType === 'dropdown' || formData.fieldType === 'radio') && formData.options.length < 1) e.options = 'At least one option is required';
        if (formData.minLength && isNaN(Number(formData.minLength))) e.minLength = 'Must be a number';
        if (formData.maxLength && isNaN(Number(formData.maxLength))) e.maxLength = 'Must be a number';
        if (formData.minValue && isNaN(Number(formData.minValue))) e.minValue = 'Must be a number';
        if (formData.maxValue && isNaN(Number(formData.maxValue))) e.maxValue = 'Must be a number';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ─── Submit ───────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);

        const payload = {
            fieldLabel: formData.fieldLabel.trim(),
            fieldName: formData.fieldName.trim(),
            fieldType: formData.fieldType,
            placeholder: formData.placeholder,
            defaultValue: formData.defaultValue,
            description: formData.description,
            checkTypeId: formData.checkTypeId || null,
            subCheckId: formData.subCheckId || null,
            subCheckName: formData.subCheckName || '',
            required: formData.required,
            unique: formData.unique,
            readonly: formData.readonly,
            hidden: formData.hidden,
            showInList: formData.showInList,
            showInForm: formData.showInForm,
            status: formData.status,
            sortOrder: Number(formData.sortOrder) || 0,
            options: formData.options,
            minLength: formData.minLength ? Number(formData.minLength) : null,
            maxLength: formData.maxLength ? Number(formData.maxLength) : null,
            minValue: formData.minValue ? Number(formData.minValue) : null,
            maxValue: formData.maxValue ? Number(formData.maxValue) : null,
            regexPattern: formData.regexPattern || null,
            regexMessage: formData.regexMessage || null,
            allowedFileTypes: formData.allowedFileTypes || null,
            maxFileSize: formData.maxFileSize ? Number(formData.maxFileSize) : null,
            width: formData.width,
            helpText: formData.helpText,
            cssClass: formData.cssClass,
            validationRules: formData.validationRules
        };

        try {
            if (editingField) {
                const res = await api.put(`/customfields/${editingField.id}`, payload);
                if (res.data.success) {
                    await fetchCustomFields();
                    setNotification({ type: 'success', message: 'Custom field updated successfully!' });
                }
            } else {
                const res = await api.post('/customfields/create', payload);
                if (res.data.success) {
                    await fetchCustomFields();
                    setNotification({ type: 'success', message: 'Custom field created successfully!' });
                }
            }
            closeModal();
        } catch (error) {
            console.error('Submit custom field error:', error);
            setNotification({ type: 'error', message: error.response?.data?.message || 'Operation failed' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setNotification(null), 3000);
        }
    };

    // ─── Delete ───────────────────────────────────────────────────
    const handleDeleteClick = async (id) => {
        if (!window.confirm('Delete this custom field? This action cannot be undone.')) return;
        try {
            const res = await api.delete(`/customfields/${id}`);
            if (res.data.success) {
                await fetchCustomFields();
                setNotification({ type: 'success', message: 'Custom field deleted!' });
            }
        } catch (error) {
            console.error('Delete custom field error:', error);
            setNotification({ type: 'error', message: error.response?.data?.message || 'Delete failed' });
        } finally {
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const clearFilters = () => {
        setFilters({ status: 'all', fieldType: 'all', checkType: 'all', subCheck: 'all', required: 'all' });
        setFilterSubChecks([]);
        setSearchQuery('');
    };

    // ─── Click Outside Handlers ───────────────────────────────────
    useEffect(() => {
        const h = (e) => { if (modalRef.current && !modalRef.current.contains(e.target)) closeModal(); };
        if (showCreateModal) document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [showCreateModal]);

    useEffect(() => {
        const h = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilterPanel(false); };
        if (showFilterPanel) document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [showFilterPanel]);

    useEffect(() => {
        const h = (e) => { if (previewRef.current && !previewRef.current.contains(e.target)) closePreview(); };
        if (showPreview) document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [showPreview]);

    // ─── Field Preview Renderer ───────────────────────────────────
    const renderFieldPreview = (field) => {
        if (!field) return null;
        const config = getFieldTypeConfig(field.fieldType);
        const IconComp = config.icon;

        switch (field.fieldType) {
            case 'text':
            case 'email':
            case 'phone':
            case 'url':
                return (
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#0A1628] flex items-center gap-2">
                            {field.required && <span className="text-[#FF5252]">*</span>}
                            {field.fieldLabel}
                        </label>
                        <div className="relative">
                            <IconComp size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A8B9A]" />
                            <input
                                type={field.fieldType === 'email' ? 'email' : field.fieldType === 'phone' ? 'tel' : field.fieldType === 'url' ? 'url' : 'text'}
                                placeholder={field.placeholder || `Enter ${field.fieldLabel.toLowerCase()}`}
                                readOnly={field.readonly}
                                className="w-full bg-[#EFF7F5]/80 border border-[#D8E6E3] rounded-lg pl-11 pr-4 py-2.5 text-sm text-[#0A1628] placeholder-gray-500 outline-none focus:border-[#00D4AA] transition-all"
                            />
                        </div>
                        {field.helpText && <p className="text-[11px] text-[#7A8B9A] flex items-center gap-1"><IoInformationCircleOutline size={12} />{field.helpText}</p>}
                    </div>
                );
            case 'number':
                return (
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#0A1628] flex items-center gap-2">
                            {field.required && <span className="text-[#FF5252]">*</span>}
                            {field.fieldLabel}
                        </label>
                        <input
                            type="number"
                            placeholder={field.placeholder || 'Enter number'}
                            min={field.minValue}
                            max={field.maxValue}
                            readOnly={field.readonly}
                            className="w-full bg-[#EFF7F5]/80 border border-[#D8E6E3] rounded-lg px-4 py-2.5 text-sm text-[#0A1628] placeholder-gray-500 outline-none focus:border-[#00D4AA] transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        {(field.minValue || field.maxValue) && <p className="text-[11px] text-[#7A8B9A]">Range: {field.minValue || '—'} to {field.maxValue || '—'}</p>}
                    </div>
                );
            case 'textarea':
                return (
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#0A1628] flex items-center gap-2">
                            {field.required && <span className="text-[#FF5252]">*</span>}
                            {field.fieldLabel}
                        </label>
                        <textarea
                            placeholder={field.placeholder || `Enter ${field.fieldLabel.toLowerCase()}`}
                            rows={3}
                            readOnly={field.readonly}
                            maxLength={field.maxLength}
                            className="w-full bg-[#EFF7F5]/80 border border-[#D8E6E3] rounded-lg px-4 py-2.5 text-sm text-[#0A1628] placeholder-gray-500 outline-none focus:border-[#00D4AA] transition-all resize-none"
                        />
                        {field.maxLength && <p className="text-[11px] text-[#7A8B9A] text-right">Max {field.maxLength} characters</p>}
                    </div>
                );
            case 'date':
                return (
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#0A1628] flex items-center gap-2">
                            {field.required && <span className="text-[#FF5252]">*</span>}
                            {field.fieldLabel}
                        </label>
                        <div className="relative">
                            <IoCalendarOutline size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A8B9A]" />
                            <input
                                type="date"
                                readOnly={field.readonly}
                                className="w-full bg-[#EFF7F5]/80 border border-[#D8E6E3] rounded-lg pl-11 pr-4 py-2.5 text-sm text-[#0A1628] outline-none focus:border-[#00D4AA] transition-all [color-scheme:light]"
                            />
                        </div>
                    </div>
                );
            case 'dropdown':
                return (
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#0A1628] flex items-center gap-2">
                            {field.required && <span className="text-[#FF5252]">*</span>}
                            {field.fieldLabel}
                        </label>
                        <select className="w-full bg-[#EFF7F5]/80 border border-[#D8E6E3] rounded-lg px-4 py-2.5 text-sm text-[#0A1628] outline-none focus:border-[#00D4AA] transition-all appearance-none cursor-pointer">
                            <option value="">{field.placeholder || 'Select an option'}</option>
                            {field.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                );
            case 'radio':
                return (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[#0A1628] flex items-center gap-2">
                            {field.required && <span className="text-[#FF5252]">*</span>}
                            {field.fieldLabel}
                        </label>
                        <div className="space-y-2">
                            {field.options?.map((opt, i) => (
                                <label key={i} className="flex items-center gap-3 cursor-pointer group/radio">
                                    <div className="w-4 h-4 rounded-full border-2 border-[#D8E6E3] bg-[#EFF7F5] group-hover/radio:border-[#00D4AA] transition-all flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-[#00D4AA] scale-0 group-hover/radio:scale-100 transition-transform" />
                                    </div>
                                    <span className="text-sm text-[#0A1628]">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );
            case 'checkbox':
                return (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[#0A1628] flex items-center gap-2">
                            {field.required && <span className="text-[#FF5252]">*</span>}
                            {field.fieldLabel}
                        </label>
                        {field.options?.map((opt, i) => (
                            <label key={i} className="flex items-center gap-3 cursor-pointer">
                                <div className="w-4 h-4 rounded border-2 border-[#D8E6E3] bg-[#EFF7F5] hover:border-[#00D4AA] transition-all" />
                                <span className="text-sm text-[#0A1628]">{opt}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'toggle':
                return (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#EFF7F5]/50 border border-[#D8E6E3]">
                        <div>
                            <label className="text-sm font-medium text-[#0A1628]">{field.fieldLabel}</label>
                            {field.helpText && <p className="text-[11px] text-[#7A8B9A] mt-0.5">{field.helpText}</p>}
                        </div>
                        <div className="w-12 h-7 rounded-full bg-[#D8E6E3] flex items-center px-1 cursor-pointer transition-all hover:bg-[#C7D9D5]">
                            <div className="w-5 h-5 rounded-full bg-white shadow-md transition-transform" />
                        </div>
                    </div>
                );
            case 'file':
                return (
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#0A1628] flex items-center gap-2">
                            {field.required && <span className="text-[#FF5252]">*</span>}
                            {field.fieldLabel}
                        </label>
                        <div className="border-2 border-dashed border-[#D8E6E3] rounded-xl p-6 text-center hover:border-[#00D4AA]/40 transition-all cursor-pointer">
                            <IoCloudUploadOutline size={28} className="text-[#7A8B9A] mx-auto mb-2" />
                            <p className="text-sm text-[#5C6B7A]">Click or drag file to upload</p>
                            {field.allowedFileTypes && <p className="text-[11px] text-[#7A8B9A] mt-1">Allowed: {field.allowedFileTypes}</p>}
                            {field.maxFileSize && <p className="text-[11px] text-[#7A8B9A]">Max size: {field.maxFileSize}MB</p>}
                        </div>
                    </div>
                );
            case 'color':
                return (
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#0A1628] flex items-center gap-2">
                            {field.required && <span className="text-[#FF5252]">*</span>}
                            {field.fieldLabel}
                        </label>
                        <div className="flex items-center gap-3">
                            <input type="color" defaultValue="#00D4AA" className="w-10 h-10 rounded-lg border border-[#D8E6E3] bg-transparent cursor-pointer" />
                            <input type="text" defaultValue="#00D4AA" className="flex-1 bg-[#EFF7F5]/80 border border-[#D8E6E3] rounded-lg px-4 py-2.5 text-sm text-[#0A1628] font-mono outline-none focus:border-[#00D4AA] transition-all" />
                        </div>
                    </div>
                );
            case 'richtext':
                return (
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#0A1628] flex items-center gap-2">
                            {field.required && <span className="text-[#FF5252]">*</span>}
                            {field.fieldLabel}
                        </label>
                        <div className="border border-[#D8E6E3] rounded-lg overflow-hidden">
                            <div className="flex items-center gap-1 px-3 py-2 bg-[#FFFFFF] border-b border-[#D8E6E3]">
                                {['B', 'I', 'U', 'S', 'H1', 'H2', '—', '•', '🔗'].map((btn, i) => (
                                    <button key={i} className="w-7 h-7 rounded flex items-center justify-center text-[11px] font-bold text-[#7A8B9A] hover:text-[#0A1628] hover:bg-black/5 transition-all">{btn}</button>
                                ))}
                            </div>
                            <div contentEditable className="min-h-[80px] p-3 text-sm text-[#0A1628] bg-[#EFF7F5]/80 outline-none" />
                        </div>
                    </div>
                );
            default:
                return <p className="text-sm text-[#7A8B9A]">Unknown field type</p>;
        }
    };

    // ─── RENDER ───────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#F8FEFD] text-[#0A1628] font-sans selection:bg-[#00D4AA]/30 selection:text-[#00D4AA]">
            <Header showNavigation={false} />

            {/* Notification */}
            {notification && (
                <div className={`fixed top-20 right-6 z-[9999] px-5 py-3.5 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in border ${notification.type === 'success' ? 'bg-[#FFFFFF] border-[#00D4AA]/30 text-[#00D4AA]' : 'bg-[#FFFFFF] border-[#EF4444]/30 text-[#EF4444]'}`}>
                    <IoCheckmarkCircleOutline size={20} />
                    <span className="text-sm font-medium">{notification.message}</span>
                    <button onClick={() => setNotification(null)} className="ml-2 text-[#7A8B9A] hover:text-[#0A1628]"><IoCloseOutline size={16} /></button>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-8 py-12">

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2.5 mb-5 bg-[#EFF7F5]/80 hover:bg-[#D8E6E3] border border-black/10 rounded-xl text-sm font-medium text-[#5C6B7A] hover:text-[#0A1628] transition-all active:scale-95"
                >
                    <IoArrowBackOutline size={20} />
                    <span>Back</span>
                </button>

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-8 animate-fade-in-up">
                    <div className="lg:w-1/2">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center border border-[#3B82F6]/20">
                                <IoOptionsOutline size={24} className="text-[#3B82F6]" />
                            </div>
                            <h2 className="text-4xl font-bold text-[#0A1628] tracking-tight">Custom Fields</h2>
                        </div>
                        <p className="text-[#5C6B7A] text-base leading-relaxed flex items-center gap-2">
                            <IoGridOutline size={18} className="text-[#7A8B9A]" />
                            Define custom data fields for check type & sub-check forms
                        </p>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                        {[
                            { label: 'TOTAL', val: stats.total, color: 'text-[#00D4AA]', bc: 'border-[#00D4AA]/20', bg: 'bg-[#00D4AA]/5' },
                            { label: 'ACTIVE', val: stats.active, color: 'text-[#10B981]', bc: 'border-[#10B981]/20', bg: 'bg-[#10B981]/5' },
                            { label: 'REQUIRED', val: stats.required, color: 'text-[#F5A623]', bc: 'border-[#F5A623]/20', bg: 'bg-[#F5A623]/5' },
                            { label: 'TYPES', val: stats.types, color: 'text-[#8B5CF6]', bc: 'border-[#8B5CF6]/20', bg: 'bg-[#8B5CF6]/5' }
                        ].map((s, i) => (
                            <div key={i} className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${s.bc} ${s.bg}`}>
                                <span className="text-[10px] font-bold text-[#7A8B9A] uppercase tracking-wider">{s.label}</span>
                                <span className={`text-2xl font-bold ${s.color} tracking-tight`}>{s.val}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-72 lg:w-80">
                            <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search Label, Name, Type, Sub-Check..."
                                className="w-full bg-[#EFF7F5]/80 border border-black/10 focus:border-[#00D4AA] rounded-xl pl-12 pr-5 py-3 outline-none text-sm text-[#0A1628] placeholder-gray-500 transition-all"
                            />
                        </div>
                        <div className="flex bg-[#EFF7F5]/50 rounded-xl p-1 border border-black/5">
                            <button onClick={() => setViewType('list')} className={`p-2.5 rounded-lg transition-all ${viewType === 'list' ? 'bg-[#00D4AA] text-[#060D1B]' : 'text-gray-400 hover:text-[#0A1628]'}`}><IoListOutline size={20} /></button>
                            <button onClick={() => setViewType('grid')} className={`p-2.5 rounded-lg transition-all ${viewType === 'grid' ? 'bg-[#00D4AA] text-[#060D1B]' : 'text-gray-400 hover:text-[#0A1628]'}`}><IoCardOutline size={20} /></button>
                        </div>
                        <button
                            onClick={() => setShowFilterPanel(prev => !prev)}
                            className={`relative px-5 py-3 rounded-xl font-medium text-sm transition-all border flex items-center gap-2 ${Object.values(filters).some(val => val && val !== 'all') || searchQuery ? 'bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00D4AA]' : 'bg-[#EFF7F5]/50 border-black/5 text-gray-400 hover:text-[#0A1628] hover:bg-black/5'}`}
                        >
                            <IoFilterOutline size={18} />
                            <span>Filter</span>
                            {Object.values(filters).some(val => val && val !== 'all') && (
                                <span className="ml-1 w-5 h-5 rounded-full bg-[#00D4AA] text-[#060D1B] text-[10px] font-bold flex items-center justify-center">
                                    {Object.values(filters).filter(val => val && val !== 'all').length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilterPanel && (
                    <div ref={filterRef} className="mb-4 p-5 rounded-2xl bg-[#FFFFFF]/80 border border-black/10 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-bold text-[#7A8B9A] uppercase tracking-widest">Filters</h4>
                            <button onClick={clearFilters} className="text-xs text-[#00D4AA] hover:underline">Clear All</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-[10px] text-[#7A8B9A] mb-1.5 uppercase tracking-wider font-bold">Status</label>
                                <select value={filters.status} onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))} className="w-full bg-[#EFF7F5]/80 border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] outline-none focus:border-[#00D4AA] transition-all">
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] text-[#7A8B9A] mb-1.5 uppercase tracking-wider font-bold">Field Type</label>
                                <select value={filters.fieldType} onChange={(e) => setFilters(p => ({ ...p, fieldType: e.target.value }))} className="w-full bg-[#EFF7F5]/80 border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] outline-none focus:border-[#00D4AA] transition-all">
                                    <option value="all">All Types</option>
                                    {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] text-[#7A8B9A] mb-1.5 uppercase tracking-wider font-bold">Check Type</label>
                                <select
                                    value={filters.checkType}
                                    onChange={(e) => { const v = e.target.value; setFilters(p => ({ ...p, checkType: v, subCheck: 'all' })); loadFilterSubChecks(v); }}
                                    className="w-full bg-[#EFF7F5]/80 border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] outline-none focus:border-[#00D4AA] transition-all"
                                >
                                    <option value="all">All Check Types</option>
                                    {checkTypes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] text-[#7A8B9A] mb-1.5 uppercase tracking-wider font-bold">Sub-Check</label>
                                <select
                                    value={filters.subCheck}
                                    onChange={(e) => setFilters(p => ({ ...p, subCheck: e.target.value }))}
                                    disabled={filters.checkType === 'all'}
                                    className="w-full bg-[#EFF7F5]/80 border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] outline-none focus:border-[#00D4AA] transition-all disabled:opacity-40"
                                >
                                    <option value="all">All Sub-Checks</option>
                                    <option value="">Check-Type Wide</option>
                                    {filterSubChecks.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] text-[#7A8B9A] mb-1.5 uppercase tracking-wider font-bold">Required</label>
                                <select value={filters.required} onChange={(e) => setFilters(p => ({ ...p, required: e.target.value }))} className="w-full bg-[#EFF7F5]/80 border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] outline-none focus:border-[#00D4AA] transition-all">
                                    <option value="all">All</option>
                                    <option value="yes">Required</option>
                                    <option value="no">Optional</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create Button */}
                <div className="flex justify-start mb-3">
                    <button
                        onClick={openCreateModal}
                        className="group flex items-center gap-2 px-6 py-3 bg-[#00D4AA] text-[#060D1B] rounded-xl font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(0,212,170,0.4)] hover:scale-105 active:scale-95"
                    >
                        <IoAddOutline size={18} />
                        <span>Create Custom Field</span>
                    </button>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="text-center py-20 text-[#5C6B7A]">
                        <div className="w-8 h-8 border-2 border-[#00D4AA] border-t-transparent animate-spin rounded-full mx-auto mb-3"></div>
                        Loading custom fields...
                    </div>
                ) : (
                    <>
                        {/* ─── LIST VIEW ─── */}
                        {viewType === 'list' && (
                            <div className="bg-[#FFFFFF]/40 border border-black/10 rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up mt-3" style={{ animationDelay: '0.15s' }}>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-black/5 bg-black/[0.02]">
                                                <th className="p-5"><input type="checkbox" checked={paginatedFields.length > 0 && selectedRows.length === paginatedFields.length} onChange={toggleSelectAll} className="w-4 h-4 rounded border-[#D8E6E3] bg-[#EFF7F5] text-[#00D4AA] focus:ring-[#00D4AA]/30" /></th>
                                                <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase cursor-pointer" onClick={() => handleSort('sortOrder')}>
                                                    <div className="flex items-center gap-1">Order {sortConfig.key === 'sortOrder' && (sortConfig.direction === 'asc' ? <IoChevronUpOutline size={12} /> : <IoChevronDownOutline size={12} />)}</div>
                                                </th>
                                                <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">Field Label</th>
                                                <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">Field Name</th>
                                                <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">Type</th>
                                                <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase text-center">Required</th>
                                                <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">Check Type</th>
                                                <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">Sub-Check</th>
                                                <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">Status</th>
                                                <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedFields.length > 0 ? paginatedFields.map((field) => {
                                                const typeConfig = getFieldTypeConfig(field.fieldType);
                                                const TypeIcon = typeConfig.icon;
                                                return (
                                                    <tr key={field.id} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors group">
                                                        <td className="p-5">
                                                            <input type="checkbox" checked={selectedRows.includes(field.id)} onChange={() => toggleSelectRow(field.id)} className="w-4 h-4 rounded border-[#D8E6E3] bg-[#EFF7F5] text-[#00D4AA] focus:ring-[#00D4AA]/30" />
                                                        </td>
                                                        <td className="p-5">
                                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#EFF7F5] border border-[#D8E6E3] text-xs font-mono text-[#5C6B7A]">{field.sortOrder ?? '—'}</span>
                                                        </td>
                                                        <td className="p-5">
                                                            <div className="font-medium text-[#0A1628] text-sm">{field.fieldLabel}</div>
                                                            {field.description && <div className="text-xs text-[#7A8B9A] mt-0.5 max-w-[200px] truncate">{field.description}</div>}
                                                        </td>
                                                        <td className="p-5">
                                                            <span className="text-xs font-mono text-[#5C6B7A] bg-[#EFF7F5] px-2 py-1 rounded-md border border-[#D8E6E3]">{field.fieldName}</span>
                                                        </td>
                                                        <td className="p-5">
                                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${typeConfig.bg} border ${typeConfig.border}`}>
                                                                <TypeIcon size={14} className={typeConfig.color} />
                                                                <span className={`text-xs font-medium ${typeConfig.color}`}>{typeConfig.label}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-5 text-center">
                                                            {field.required ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FF5252]/10 border border-[#FF5252]/20 text-[10px] font-bold text-[#FF5252] uppercase">Required</span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/[0.03] border border-black/5 text-[10px] font-bold text-[#7A8B9A] uppercase">Optional</span>
                                                            )}
                                                        </td>
                                                        <td className="p-5">
                                                            <span className="text-xs text-[#5C6B7A]">{getCheckTypeName(field.checkTypeId)}</span>
                                                        </td>
                                                        <td className="p-5">
                                                            {field.subCheckName ? (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#A855F7]/10 border border-[#A855F7]/20 text-[10px] font-medium text-[#C084FC]">
                                                                    <IoGitBranchOutline size={11} />
                                                                    {field.subCheckName}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] text-[#7A8B9A]">Check-wide</span>
                                                            )}
                                                        </td>
                                                        <td className="p-5">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2.5 h-2.5 rounded-full ${field.status === 'Active' ? 'bg-[#10B981]' : 'bg-gray-600'}`}></div>
                                                                <span className={`text-sm ${field.status === 'Active' ? 'text-[#10B981]' : 'text-gray-500'}`}>{field.status}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-5 text-right">
                                                            <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => openPreview(field)} className="p-2 rounded-lg hover:bg-[#00D4AA]/10 hover:text-[#00D4AA] transition-all text-[#7A8B9A]" title="Preview">
                                                                    <IoEyeOutline size={18} />
                                                                </button>
                                                                <button onClick={() => openEditModal(field)} className="p-2 rounded-lg hover:bg-[#3B82F6]/10 hover:text-[#3B82F6] transition-all text-[#7A8B9A]" title="Edit">
                                                                    <IoCreateOutline size={18} />
                                                                </button>
                                                                <button onClick={() => handleDeleteClick(field.id)} className="p-2 rounded-lg hover:bg-[#FF5252]/10 hover:text-[#FF5252] transition-all text-[#7A8B9A]" title="Delete">
                                                                    <IoTrashOutline size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            }) : (
                                                <tr>
                                                    <td colSpan={10} className="p-16 text-center text-[#5C6B7A]">
                                                        <IoDocumentTextOutline size={40} className="mx-auto mb-3 text-[#D8E6E3]" />
                                                        <p>No custom fields found.</p>
                                                        <p className="text-xs text-[#7A8B9A] mt-1">Click "Create Custom Field" to add your first field</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="px-6 py-4 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 text-sm text-[#7A8B9A]">
                                        <span>Page Size</span>
                                        <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="px-2 py-1 bg-[#EFF7F5] border border-black/10 rounded-lg text-[#0A1628] text-xs focus:outline-none">
                                            {[5, 10, 20, 50].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg bg-[#EFF7F5] border border-black/10 text-xs text-[#5C6B7A] hover:text-[#0A1628] disabled:opacity-30">First</button>
                                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg bg-[#EFF7F5] border border-black/10 text-xs text-[#5C6B7A] hover:text-[#0A1628] disabled:opacity-30">Prev</button>
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                                            <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-xs font-bold ${currentPage === i + 1 ? 'bg-[#00D4AA] text-[#060D1B]' : 'bg-[#EFF7F5] border border-black/10 text-[#5C6B7A] hover:text-[#0A1628]'}`}>{i + 1}</button>
                                        ))}
                                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg bg-[#EFF7F5] border border-black/10 text-xs text-[#5C6B7A] hover:text-[#0A1628] disabled:opacity-30">Next</button>
                                        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg bg-[#EFF7F5] border border-black/10 text-xs text-[#5C6B7A] hover:text-[#0A1628] disabled:opacity-30">Last</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── GRID VIEW ─── */}
                        {viewType === 'grid' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up mt-3" style={{ animationDelay: '0.15s' }}>
                                {paginatedFields.length > 0 ? paginatedFields.map((field) => {
                                    const typeConfig = getFieldTypeConfig(field.fieldType);
                                    const TypeIcon = typeConfig.icon;
                                    return (
                                        <div key={field.id} className="group bg-[#FFFFFF]/60 border border-black/10 rounded-2xl p-6 hover:border-black/20 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`w-11 h-11 rounded-xl ${typeConfig.bg} border ${typeConfig.border} flex items-center justify-center`}>
                                                    <TypeIcon size={20} className={typeConfig.color} />
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${field.status === 'Active' ? 'border-[#10B981]/20 text-[#10B981] bg-[#10B981]/10' : 'border-gray-500/20 text-gray-500 bg-gray-500/10'}`}>
                                                    {field.status}
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-[#0A1628] text-sm mb-1">{field.fieldLabel}</h3>
                                            <p className="text-[10px] text-[#7A8B9A] font-mono mb-2">{field.fieldName}</p>
                                            {field.description && <p className="text-xs text-[#7A8B9A] mb-3 line-clamp-2">{field.description}</p>}

                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${typeConfig.bg} border ${typeConfig.border} ${typeConfig.color}`}>{typeConfig.label}</span>
                                                {field.required && <span className="px-2 py-0.5 rounded-md bg-[#FF5252]/10 border border-[#FF5252]/20 text-[10px] text-[#FF5252] font-bold">REQUIRED</span>}
                                                {field.subCheckName && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#A855F7]/10 border border-[#A855F7]/20 text-[10px] text-[#C084FC] font-bold"><IoGitBranchOutline size={10} />{field.subCheckName}</span>}
                                            </div>

                                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-black/5">
                                                <span className="text-[10px] text-[#7A8B9A]">{getCheckTypeName(field.checkTypeId)}</span>
                                                <div className="flex items-center gap-1.5">
                                                    <button onClick={() => openPreview(field)} className="p-2 rounded-lg hover:bg-[#00D4AA]/10 hover:text-[#00D4AA] transition-all text-[#7A8B9A]"><IoEyeOutline size={16} /></button>
                                                    <button onClick={() => openEditModal(field)} className="p-2 rounded-lg hover:bg-[#3B82F6]/10 hover:text-[#3B82F6] transition-all text-[#7A8B9A]"><IoCreateOutline size={16} /></button>
                                                    <button onClick={() => handleDeleteClick(field.id)} className="p-2 rounded-lg hover:bg-[#FF5252]/10 hover:text-[#FF5252] transition-all text-[#7A8B9A]"><IoTrashOutline size={16} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="col-span-full text-center py-20 text-[#5C6B7A]">
                                        <IoDocumentTextOutline size={40} className="mx-auto mb-3 text-[#D8E6E3]" />
                                        <p>No custom fields found.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* ─── CREATE / EDIT MODAL ─── */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[9000] flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
                    <div ref={modalRef} className="relative w-full max-w-3xl bg-[#FFFFFF] border border-black/10 rounded-2xl shadow-2xl animate-fade-in-up">
                        {/* Modal Header */}
                        <div className="sticky top-0 z-10 bg-[#FFFFFF] border-b border-black/5 px-8 py-5 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#00D4AA]/10 border border-[#00D4AA]/20 flex items-center justify-center">
                                        <IoOptionsOutline size={20} className="text-[#00D4AA]" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[#0A1628]">{editingField ? 'Edit Custom Field' : 'Create Custom Field'}</h3>
                                        <p className="text-xs text-[#7A8B9A]">{editingField ? 'Modify field configuration' : 'Define a new custom data field'}</p>
                                    </div>
                                </div>
                                <button onClick={closeModal} className="p-2 rounded-lg hover:bg-black/5 text-[#7A8B9A] hover:text-[#0A1628] transition-all">
                                    <IoCloseOutline size={22} />
                                </button>
                            </div>

                            {/* Modal Tabs */}
                            <div className="flex gap-1 mt-5 bg-[#EFF7F5]/50 rounded-xl p-1 border border-black/5">
                                {[
                                    { key: 'basic', label: 'Basic Info', icon: IoDocumentTextOutline },
                                    { key: 'type', label: 'Type & Options', icon: IoLayersOutline },
                                    { key: 'validation', label: 'Validation', icon: IoLockClosedOutline },
                                    { key: 'display', label: 'Display', icon: IoBrushOutline }
                                ].map(tab => {
                                    const TabIcon = tab.icon;
                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveModalTab(tab.key)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeModalTab === tab.key ? 'bg-[#00D4AA] text-[#060D1B]' : 'text-[#7A8B9A] hover:text-[#0A1628] hover:bg-black/5'}`}
                                        >
                                            <TabIcon size={14} />
                                            <span className="hidden sm:inline">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
                            {/* ── TAB: BASIC INFO ── */}
                            {activeModalTab === 'basic' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FloatingInput label="Field Label" name="fieldLabel" value={formData.fieldLabel} onChange={handleFormChange} required icon={IoTextOutline} focusedField={focusedField} setFocusedField={setFocusedField} errors={errors} />
                                        <FloatingInput label="Field Name (API Key)" name="fieldName" value={formData.fieldName} onChange={handleFormChange} required icon={IoCodeSlashOutline} focusedField={focusedField} setFocusedField={setFocusedField} errors={errors} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#0A1628] mb-1.5">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleFormChange}
                                            placeholder="What is this field used for?"
                                            rows={2}
                                            className="w-full bg-[#FFFFFF]/60 border border-[#D8E6E3] focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-[#0A1628] placeholder-gray-500 transition-all resize-none"
                                        />
                                    </div>

                                    {/* Check Type + Sub-Check */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-[#0A1628] mb-1.5">Associated Check Type</label>
                                            <select
                                                name="checkTypeId"
                                                value={formData.checkTypeId}
                                                onChange={handleCheckTypeChange}
                                                className="w-full bg-[#FFFFFF]/60 border border-[#D8E6E3] focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-[#0A1628] transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="">— None (Global) —</option>
                                                {checkTypes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                                            </select>
                                            <p className="text-[11px] text-[#7A8B9A] mt-1 ml-1">Leave empty to make this field available globally</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#0A1628] mb-1.5 flex items-center gap-2">
                                                <IoGitBranchOutline size={14} className="text-[#C084FC]" />
                                                Sub-Check (optional)
                                                {loadingSubChecks && <span className="text-[10px] text-[#00D4AA]">loading…</span>}
                                            </label>
                                            <select
                                                name="subCheckId"
                                                value={formData.subCheckId}
                                                onChange={handleSubCheckChange}
                                                disabled={!formData.checkTypeId || loadingSubChecks}
                                                className="w-full bg-[#FFFFFF]/60 border border-[#D8E6E3] focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-[#0A1628] transition-all appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <option value="">— Whole Check Type —</option>
                                                {modalSubChecks.map(s => <option key={s._id} value={s._id}>{s.name}{s.code ? ` (${s.code})` : ''}</option>)}
                                            </select>
                                            <p className="text-[11px] text-[#7A8B9A] mt-1 ml-1">
                                                {formData.checkTypeId ? 'Attach this field to a specific sub-check, or leave for the whole check.' : 'Select a check type first.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FloatingInput label="Sort Order" name="sortOrder" type="number" value={formData.sortOrder} onChange={handleFormChange} icon={IoSwapVerticalOutline} focusedField={focusedField} setFocusedField={setFocusedField} errors={errors} />
                                        <FloatingInput label="Default Value" name="defaultValue" value={formData.defaultValue} onChange={handleFormChange} focusedField={focusedField} setFocusedField={setFocusedField} errors={errors} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FloatingInput label="Placeholder" name="placeholder" value={formData.placeholder} onChange={handleFormChange} focusedField={focusedField} setFocusedField={setFocusedField} errors={errors} />
                                    </div>
                                </div>
                            )}

                            {/* ── TAB: TYPE & OPTIONS ── */}
                            {activeModalTab === 'type' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                        <label className="block text-xs font-bold text-[#7A8B9A] uppercase tracking-widest mb-3">Field Type <span className="text-[#FF5252]">*</span></label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                                            {FIELD_TYPES.map(type => {
                                                const TypeIcon = type.icon;
                                                const isSelected = formData.fieldType === type.value;
                                                return (
                                                    <button
                                                        key={type.value}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, fieldType: type.value }))}
                                                        className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all duration-200 ${isSelected ? `${type.bg} shadow-lg scale-[1.02]` : 'border-black/5 bg-black/[0.02] hover:border-black/10 hover:bg-black/[0.04]'}`}
                                                        style={isSelected ? { borderColor: 'rgba(255,255,255,0.15)' } : {}}
                                                    >
                                                        <div className={`w-10 h-10 rounded-xl ${type.bg} border ${type.border} flex items-center justify-center transition-all ${isSelected ? 'scale-110' : ''}`}>
                                                            <TypeIcon size={18} className={type.color} />
                                                        </div>
                                                        <span className={`text-[11px] font-semibold ${isSelected ? 'text-[#0A1628]' : 'text-[#5C6B7A]'}`}>{type.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {(formData.fieldType === 'dropdown' || formData.fieldType === 'radio' || formData.fieldType === 'checkbox') && (
                                        <div className="space-y-3">
                                            <label className="block text-xs font-bold text-[#7A8B9A] uppercase tracking-widest">
                                                Options <span className="text-[#FF5252]">*</span>
                                                {errors.options && <span className="text-[#FF5252] normal-case tracking-normal ml-2">{errors.options}</span>}
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={optionInput}
                                                    onChange={(e) => setOptionInput(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption(); } }}
                                                    placeholder="Type an option and press Enter..."
                                                    className="flex-1 bg-[#FFFFFF]/60 border border-[#D8E6E3] focus:border-[#00D4AA] rounded-xl px-4 py-3 outline-none text-sm text-[#0A1628] placeholder-gray-500 transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addOption}
                                                    className="px-4 py-3 bg-[#00D4AA]/10 border border-[#00D4AA]/30 text-[#00D4AA] rounded-xl hover:bg-[#00D4AA]/20 transition-all"
                                                >
                                                    <IoAddOutline size={18} />
                                                </button>
                                            </div>
                                            {formData.options.length > 0 && (
                                                <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                                                    {formData.options.map((opt, i) => (
                                                        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#EFF7F5]/50 border border-black/5 group/opt">
                                                            <span className="w-6 h-6 rounded-md bg-black/5 flex items-center justify-center text-[10px] font-bold text-[#7A8B9A]">{i + 1}</span>
                                                            <span className="flex-1 text-sm text-[#0A1628]">{opt}</span>
                                                            <div className="flex items-center gap-1 opacity-0 group-hover/opt:opacity-100 transition-opacity">
                                                                <button type="button" onClick={() => moveOption(i, -1)} disabled={i === 0} className="p-1 rounded hover:bg-black/5 text-[#7A8B9A] disabled:opacity-20"><IoChevronUpOutline size={14} /></button>
                                                                <button type="button" onClick={() => moveOption(i, 1)} disabled={i === formData.options.length - 1} className="p-1 rounded hover:bg-black/5 text-[#7A8B9A] disabled:opacity-20"><IoChevronDownOutline size={14} /></button>
                                                                <button type="button" onClick={() => removeOption(i)} className="p-1 rounded hover:bg-[#FF5252]/10 text-[#7A8B9A] hover:text-[#FF5252]"><IoCloseOutline size={14} /></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {formData.fieldType === 'file' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <FloatingInput label="Allowed File Types" name="allowedFileTypes" value={formData.allowedFileTypes} onChange={handleFormChange} icon={IoDocumentTextOutline} focusedField={focusedField} setFocusedField={setFocusedField} errors={errors} />
                                            <FloatingInput label="Max File Size (MB)" name="maxFileSize" type="number" value={formData.maxFileSize} onChange={handleFormChange} icon={IoCloudUploadOutline} focusedField={focusedField} setFocusedField={setFocusedField} errors={errors} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── TAB: VALIDATION ── */}
                            {activeModalTab === 'validation' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="space-y-4">
                                        <label className="block text-xs font-bold text-[#7A8B9A] uppercase tracking-widest mb-2">Quick Rules</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                            {VALIDATION_RULES.filter(r => r.value !== 'none').map(rule => {
                                                const isActive = formData.validationRules.includes(rule.value);
                                                return (
                                                    <button
                                                        key={rule.value}
                                                        type="button"
                                                        onClick={() => isActive ? removeValidationRule(rule.value) : addValidationRule(rule.value)}
                                                        className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${isActive ? 'bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00D4AA]' : 'border-black/5 bg-black/[0.02] text-[#7A8B9A] hover:border-black/10 hover:text-[#0A1628]'}`}
                                                    >
                                                        {rule.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {formData.validationRules.includes('minLength') && (
                                            <FloatingInput label="Min Length" name="minLength" type="number" value={formData.minLength} onChange={handleFormChange} icon={IoTextOutline} focusedField={focusedField} setFocusedField={setFocusedField} errors={errors} />
                                        )}
                                        {formData.validationRules.includes('maxLength') && (
                                            <FloatingInput label="Max Length" name="maxLength" type="number" value={formData.maxLength} onChange={handleFormChange} icon={IoResizeOutline} focusedField={focusedField} setFocusedField={setFocusedField} errors={errors} />
                                        )}
                                        {formData.validationRules.includes('min') && (
                                            <FloatingInput label="Min Value" name="minValue" type="number" value={formData.minValue} onChange={handleFormChange} icon={IoCodeOutline} focusedField={focusedField} setFocusedField={setFocusedField} errors={errors} />
                                        )}
                                        {formData.validationRules.includes('max') && (
                                            <FloatingInput label="Max Value" name="maxValue" type="number" value={formData.maxValue} onChange={handleFormChange} icon={IoCodeOutline} focusedField={focusedField} setFocusedField={setFocusedField} errors={errors} />
                                        )}
                                        {formData.validationRules.includes('pattern') && (
                                            <>
                                                <FloatingInput label="Regex Pattern" name="regexPattern" value={formData.regexPattern} onChange={handleFormChange} icon={IoCodeSlashOutline} focusedField={focusedField} setFocusedField={setFocusedField} errors={errors} />
                                                <FloatingInput label="Regex Error Message" name="regexMessage" value={formData.regexMessage} onChange={handleFormChange} icon={IoAlertCircleOutline} focusedField={focusedField} setFocusedField={setFocusedField} errors={errors} />
                                            </>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-xs font-bold text-[#7A8B9A] uppercase tracking-widest mb-2">Constraints</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {[
                                                { name: 'required', label: 'Required Field', desc: 'User must provide a value', color: '[#FF5252]' },
                                                { name: 'unique', label: 'Unique Value', desc: 'Value must be unique across records', color: '[#F5A623]' },
                                                { name: 'readonly', label: 'Read Only', desc: 'Field cannot be edited by user', color: '[#6366F1]' },
                                                { name: 'hidden', label: 'Hidden Field', desc: 'Not visible in forms', color: 'gray-500' },
                                            ].map(item => (
                                                <label
                                                    key={item.name}
                                                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${formData[item.name] ? `border-${item.color}/40 bg-${item.color}/5` : 'border-black/5 bg-black/[0.02] hover:border-black/10'}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        name={item.name}
                                                        checked={formData[item.name]}
                                                        onChange={handleFormChange}
                                                        className="w-4 h-4 rounded border-[#D8E6E3] bg-[#EFF7F5] accent-[#00D4AA] cursor-pointer"
                                                    />
                                                    <div>
                                                        <div className="text-sm font-medium text-[#0A1628]">{item.label}</div>
                                                        <div className="text-[11px] text-[#7A8B9A]">{item.desc}</div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── TAB: DISPLAY ── */}
                            {activeModalTab === 'display' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-[#0A1628] mb-1.5">Status</label>
                                            <select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleFormChange}
                                                className="w-full bg-[#FFFFFF]/60 border border-[#D8E6E3] focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-[#0A1628] transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#0A1628] mb-1.5">Width</label>
                                            <select
                                                name="width"
                                                value={formData.width}
                                                onChange={handleFormChange}
                                                className="w-full bg-[#FFFFFF]/60 border border-[#D8E6E3] focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-[#0A1628] transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="full">Full Width</option>
                                                <option value="half">Half Width</option>
                                                <option value="third">One Third</option>
                                                <option value="quarter">One Quarter</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-xs font-bold text-[#7A8B9A] uppercase tracking-widest mb-2">Visibility</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {[
                                                { name: 'showInList', label: 'Show in List View', desc: 'Display this field in table/list views', color: '[#10B981]' },
                                                { name: 'showInForm', label: 'Show in Form', desc: 'Display this field in create/edit forms', color: '[#3B82F6]' },
                                            ].map(item => (
                                                <label
                                                    key={item.name}
                                                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${formData[item.name] ? `border-${item.color}/40 bg-${item.color}/5` : 'border-black/5 bg-black/[0.02] hover:border-black/10'}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        name={item.name}
                                                        checked={formData[item.name]}
                                                        onChange={handleFormChange}
                                                        className="w-4 h-4 rounded border-[#D8E6E3] bg-[#EFF7F5] accent-[#00D4AA] cursor-pointer"
                                                    />
                                                    <div>
                                                        <div className="text-sm font-medium text-[#0A1628]">{item.label}</div>
                                                        <div className="text-[11px] text-[#7A8B9A]">{item.desc}</div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <FloatingInput label="Help Text" name="helpText" value={formData.helpText} onChange={handleFormChange} icon={IoInformationCircleOutline} focusedField={focusedField} setFocusedField={setFocusedField} errors={errors} />
                                    <FloatingInput label="Custom CSS Class" name="cssClass" value={formData.cssClass} onChange={handleFormChange} icon={IoBrushOutline} focusedField={focusedField} setFocusedField={setFocusedField} errors={errors} />

                                    <div>
                                        <label className="block text-xs font-bold text-[#7A8B9A] uppercase tracking-widest mb-3">Live Preview</label>
                                        <div className="p-5 rounded-xl bg-[#F8FEFD] border border-black/5">
                                            <div className="max-w-lg">
                                                {renderFieldPreview(formData)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Modal Footer */}
                            <div className="sticky bottom-0 bg-[#FFFFFF] border-t border-black/5 -mx-8 -mb-6 px-8 py-4 rounded-b-2xl flex items-center justify-between">
                                <p className="text-xs text-[#7A8B9A]">Fields marked with <span className="text-[#FF5252]">*</span> are required</p>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-6 py-3 rounded-xl border border-black/10 text-sm font-medium text-[#5C6B7A] hover:text-[#0A1628] hover:bg-black/5 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-3 bg-[#00D4AA] text-[#060D1B] rounded-xl font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(0,212,170,0.4)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <><div className="w-4 h-4 border-2 border-[#060D1B] border-t-transparent animate-spin rounded-full" /> Saving...</>
                                        ) : editingField ? (
                                            <><IoSaveOutline size={16} /> Update Field</>
                                        ) : (
                                            <><IoAddOutline size={16} /> Create Field</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── PREVIEW MODAL ─── */}
            {showPreview && previewField && (
                <div className="fixed inset-0 z-[9000] flex items-center justify-center px-4">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closePreview} />
                    <div ref={previewRef} className="relative w-full max-w-lg bg-[#FFFFFF] border border-black/10 rounded-2xl shadow-2xl animate-fade-in-up overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
                            <div className="flex items-center gap-3">
                                {(() => { const c = getFieldTypeConfig(previewField.fieldType); const I = c.icon; return <div className={`w-9 h-9 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center`}><I size={16} className={c.color} /></div>; })()}
                                <div>
                                    <h3 className="text-sm font-bold text-[#0A1628]">Field Preview</h3>
                                    <p className="text-[10px] text-[#7A8B9A]">{previewField.fieldLabel} ({previewField.fieldName})</p>
                                </div>
                            </div>
                            <button onClick={closePreview} className="p-2 rounded-lg hover:bg-black/5 text-[#7A8B9A] hover:text-[#0A1628] transition-all"><IoCloseOutline size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Type', value: getFieldTypeConfig(previewField.fieldType).label },
                                    { label: 'Status', value: previewField.status },
                                    { label: 'Required', value: previewField.required ? 'Yes' : 'No' },
                                    { label: 'Unique', value: previewField.unique ? 'Yes' : 'No' },
                                    { label: 'Check Type', value: getCheckTypeName(previewField.checkTypeId) },
                                    { label: 'Sub-Check', value: previewField.subCheckName || 'Check-wide' },
                                    { label: 'Read Only', value: previewField.readonly ? 'Yes' : 'No' },
                                    { label: 'Sort Order', value: previewField.sortOrder ?? '—' },
                                ].map((meta, i) => (
                                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-[#EFF7F5]/50 border border-black/5">
                                        <span className="text-[10px] text-[#7A8B9A] uppercase font-bold">{meta.label}</span>
                                        <span className="text-xs text-[#0A1628] font-medium">{meta.value}</span>
                                    </div>
                                ))}
                            </div>

                            {previewField.validationRules?.length > 0 && (
                                <div>
                                    <span className="text-[10px] text-[#7A8B9A] uppercase font-bold block mb-2">Validation Rules</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {previewField.validationRules.map((rule, i) => (
                                            <span key={i} className="px-2.5 py-1 rounded-lg bg-[#00D4AA]/10 border border-[#00D4AA]/20 text-[10px] font-medium text-[#00D4AA]">
                                                {VALIDATION_RULES.find(r => r.value === rule)?.label || rule}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(previewField.fieldType === 'dropdown' || previewField.fieldType === 'radio' || previewField.fieldType === 'checkbox') && previewField.options?.length > 0 && (
                                <div>
                                    <span className="text-[10px] text-[#7A8B9A] uppercase font-bold block mb-2">Options ({previewField.options.length})</span>
                                    <div className="space-y-1">
                                        {previewField.options.map((opt, i) => (
                                            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EFF7F5]/50 border border-black/5">
                                                <span className="text-[10px] text-[#7A8B9A] w-5">{i + 1}.</span>
                                                <span className="text-sm text-[#0A1628]">{opt}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <span className="text-[10px] text-[#7A8B9A] uppercase font-bold block mb-2">Rendered Output</span>
                                <div className="p-5 rounded-xl bg-[#F8FEFD] border border-black/5">
                                    {renderFieldPreview(previewField)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomFields;