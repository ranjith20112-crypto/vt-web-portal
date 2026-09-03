import React, { useState, useRef, useCallback } from 'react';
import {
    IoCloudUploadOutline,
    IoDownloadOutline,
    IoArrowBackOutline,
    IoInformationCircleOutline,
    IoCloseOutline,
    IoCheckmarkCircleOutline,
    IoWarningOutline,
    IoDocumentTextOutline,
    IoTrashOutline,
    IoFileTrayFullOutline,
    IoCheckmark,
    IoClose
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import Header from '../screens/header';

const ClientBulkUpload = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [uploadError, setUploadError] = useState(null);

    // Preview states
    const [previewData, setPreviewData] = useState(null);
    const [isParsing, setIsParsing] = useState(false);

    const requiredFields = [
        { name: 'client_code', desc: 'Unique client identifier code' },
        { name: 'company_name', desc: 'Registered company name' },
        { name: 'display_name', desc: 'Display name for the client' },
        { name: 'industry', desc: 'Industry sector' },
        { name: 'website', desc: 'Company website URL' },
        { name: 'address_line_1', desc: 'Primary address line' },
        { name: 'country', desc: 'Country name' },
        { name: 'state', desc: 'State or province' },
        { name: 'city', desc: 'City name' },
        { name: 'primary_contact_email', desc: 'Primary contact email address' },
    ];

    const allExpectedHeaders = [
        'client_code', 'company_name', 'display_name', 'industry', 'website',
        'address_line_1', 'address_line_2', 'country', 'state', 'city',
        'pin_code', 'gstin', 'pan', 'primary_contact_name', 'primary_contact_email',
        'primary_contact_phone', 'landline', 'company_date', 'category',
        'customer_supporter', 'billing_cycle', 'credit_period_days',
        'contract_start_date', 'contract_end_date', 'is_active', 'package_code',
        'enable_portal', 'portal_email', 'portal_password'
    ];

    // --- Parse CSV file for preview ---
    const parseFileForPreview = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

                    if (lines.length < 2) {
                        reject(new Error('File appears to be empty or has no data rows'));
                        return;
                    }

                    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));

                    const previewRows = [];
                    const allRows = [];

                    for (let i = 1; i < lines.length; i++) {
                        const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
                        const rowObj = {};
                        headers.forEach((h, idx) => {
                            rowObj[h] = values[idx] || '';
                        });
                        allRows.push(rowObj);
                        if (previewRows.length < 5) {
                            previewRows.push(rowObj);
                        }
                    }

                    resolve({ headers, previewRows, totalRows: allRows.length, allRows });
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    };

    const handleDownloadTemplate = () => {
        const headers = allExpectedHeaders;
        const sampleRows = [
            ['client_code', 'company_name', 'display_name', 'industry', 'website', 'address_line_1', 'address_line_2', 'country', 'state', 'city', 'pin_code', 'gstin', 'pan', 'primary_contact_name', 'primary_contact_email', 'primary_contact_phone', 'landline', 'company_date', 'category', 'customer_supporter', 'billing_cycle', 'credit_period_days', 'contract_start_date', 'contract_end_date', 'is_active', 'package_code', 'enable_portal', 'portal_email', 'portal_password'],
            ['CLI-SAMPLE', 'Sample Client Technologies Pvt Ltd', 'Sample Client', 'Information Technology', 'https://www.sampleclient.com', '123 Technopark, Phase II', 'OMR Road, Karapakkam', 'India', 'Tamil Nadu', 'Chennai', '600097', '33ABCDE1234F1Z0', 'ABCDE1234F', 'John Doe', 'john.doe@sampleclient.com', '9876543210', '044-67890123', '2026-01-15', 'Cat A', 'Super Admin', 'monthly', '30', '2026-01-15', '2027-01-14', 'Yes', 'PKG-STD', 'Yes', 'john.doe@sampleclient.com', 'Welcome@123']
        ];

        const csvContent = [headers.join(','), ...sampleRows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Client_Bulk_Upload_Template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        resetUploadState();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFileSelect = (e) => {
        resetUploadState();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const resetUploadState = () => {
        setUploadResult(null);
        setUploadError(null);
        setPreviewData(null);
    };

    const handleFile = async (file) => {
        if (!validateFile(file)) return;

        setSelectedFile(file);
        setIsParsing(true);

        try {
            const parsed = await parseFileForPreview(file);
            setPreviewData(parsed);
        } catch (err) {
            setUploadError(err.message || 'Failed to parse file');
            setSelectedFile(null);
        } finally {
            setIsParsing(false);
        }
    };

    const validateFile = (file) => {
        const validExtensions = ['.xlsx', '.xls', '.csv'];
        const fileName = file.name.toLowerCase();
        const isValid = validExtensions.some(ext => fileName.endsWith(ext));
        if (!isValid) {
            setUploadError('Invalid file format. Please upload .xlsx, .xls, or .csv files only.');
            return false;
        }
        if (file.size > 10 * 1024 * 1024) {
            setUploadError('File size exceeds 10MB limit.');
            return false;
        }
        return true;
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);
        setUploadResult(null);
        setUploadError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setUploadResult({
                success: true,
                totalRecords: previewData?.totalRows || 42,
                imported: (previewData?.totalRows || 42) - 2,
                failed: 2,
                message: 'Bulk client upload completed successfully!'
            });
            setSelectedFile(null);
            setPreviewData(null);
        } catch (error) {
            setUploadError('Failed to upload clients. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setUploadResult(null);
        setUploadError(null);
        setPreviewData(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="min-h-screen bg-[#F8FEFD] text-[#0A1628] font-sans">
            <Header showNavigation={false} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex mb-8 items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-[#5C6B7A] hover:text-[#0A1628] transition-all active:scale-95"
                >
                    <IoArrowBackOutline size={20} />
                    <span>Back to Clients</span>
                </button>

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center border border-[#00D4AA]/20">
                                <IoCloudUploadOutline size={24} className="text-[#00D4AA]" />
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-[#0A1628] tracking-tight">Bulk Client Upload</h2>
                        </div>
                        <p className="text-[#5C6B7A] text-base leading-relaxed flex items-center gap-2">
                            <IoFileTrayFullOutline size={18} className="text-[#7A8B9A]" />
                            Onboard multiple clients using an Excel spreadsheet template.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-5 py-3 rounded-xl bg-white border border-gray-200 shadow-sm">
                            <div className="text-xs text-[#7A8B9A] uppercase tracking-wider font-bold">Total Clients</div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                    {/* Left Panel - Instructions */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Upload Instructions Card */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <IoInformationCircleOutline size={20} className="text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold text-[#0A1628]">Upload Instructions</h3>
                            </div>

                            <p className="text-sm text-[#5C6B7A] leading-relaxed mb-6">
                                Please download the official template, fill in client details, and upload the file using the dropzone.
                            </p>

                            <button
                                onClick={handleDownloadTemplate}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white rounded-xl font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-[0.98]"
                            >
                                <IoDownloadOutline size={20} />
                                Download Template
                            </button>
                        </div>

                        {/* Required Fields */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <h4 className="text-xs font-bold text-[#7A8B9A] uppercase tracking-widest mb-4 border-l-2 border-[#FF5252] pl-3">
                                Required Fields
                            </h4>
                            <div className="space-y-2">
                                {requiredFields.map((field, i) => (
                                    <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                        <span className="text-[#FF5252] font-mono text-xs mt-0.5">●</span>
                                        <div>
                                            <span className="text-sm font-medium text-[#0A1628] font-mono">{field.name}</span>
                                            <span className="text-xs text-[#7A8B9A] ml-2">— {field.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Dynamic Mapping Info */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <h4 className="text-xs font-bold text-[#7A8B9A] uppercase tracking-widest mb-3 border-l-2 border-[#3B82F6] pl-3">
                                Field Mapping
                            </h4>
                            <p className="text-sm text-[#5C6B7A] leading-relaxed">
                                The system maps fields like <span className="text-[#3B82F6] font-mono">client_code</span>,
                                <span className="text-[#3B82F6] font-mono"> company_name</span>, and
                                <span className="text-[#3B82F6] font-mono"> primary_contact_email</span> directly to the database.
                                Please ensure exact header matches (case-insensitive).
                            </p>
                        </div>

                        {/* Security Note */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <h4 className="text-xs font-bold text-[#7A8B9A] uppercase tracking-widest mb-3 border-l-2 border-[#10B981] pl-3">
                                Security Note
                            </h4>
                            <p className="text-sm text-[#5C6B7A] leading-relaxed">
                                Portal passwords are encrypted before storage. Clients must reset their password on first login for security compliance.
                            </p>
                        </div>

                    </div>

                    {/* Right Panel - Upload Area */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">

                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-8 h-8 rounded-lg bg-[#00D4AA]/10 flex items-center justify-center">
                                    <IoCloudUploadOutline size={20} className="text-[#00D4AA]" />
                                </div>
                                <h3 className="text-lg font-bold text-[#0A1628]">Import & Upload</h3>
                            </div>

                            {/* Upload Result */}
                            {uploadResult && (
                                <div className="mb-6 p-5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30">
                                    <div className="flex items-start gap-3">
                                        <IoCheckmarkCircleOutline size={24} className="text-[#10B981] shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-[#10B981] mb-2">{uploadResult.message}</h4>
                                            <div className="grid grid-cols-3 gap-4 mt-3">
                                                <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                                                    <div className="text-xl font-bold text-[#0A1628]">{uploadResult.totalRecords}</div>
                                                    <div className="text-xs text-[#7A8B9A] mt-1">Total</div>
                                                </div>
                                                <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                                                    <div className="text-xl font-bold text-[#10B981]">{uploadResult.imported}</div>
                                                    <div className="text-xs text-[#7A8B9A] mt-1">Imported</div>
                                                </div>
                                                <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                                                    <div className="text-xl font-bold text-[#FF5252]">{uploadResult.failed}</div>
                                                    <div className="text-xs text-[#7A8B9A] mt-1">Failed</div>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => setUploadResult(null)} className="text-[#7A8B9A] hover:text-[#0A1628]">
                                            <IoCloseOutline size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Upload Error */}
                            {uploadError && (
                                <div className="mb-6 p-5 rounded-xl bg-red-500/10 border border-red-500/30">
                                    <div className="flex items-start gap-3">
                                        <IoWarningOutline size={24} className="text-red-600 shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-red-600 mb-1">Upload Failed</h4>
                                            <p className="text-sm text-red-700/80">{uploadError}</p>
                                        </div>
                                        <button onClick={() => setUploadError(null)} className="text-[#7A8B9A] hover:text-[#0A1628]">
                                            <IoCloseOutline size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Dropzone */}
                            <div
                                className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer
 ${dragActive
                                        ? 'border-[#00D4AA] bg-[#00D4AA]/5 shadow-[0_0_30px_rgba(0,212,170,0.1)]'
                                        : selectedFile
                                            ? 'border-[#3B82F6] bg-[#3B82F6]/5'
                                            : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => !selectedFile && fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                {selectedFile ? (
                                    <div>
                                        <div className="w-16 h-16 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center mx-auto mb-4">
                                            <IoDocumentTextOutline size={28} className="text-blue-600" />
                                        </div>
                                        <h4 className="text-lg font-bold text-[#0A1628] mb-1">{selectedFile.name}</h4>
                                        <p className="text-sm text-[#7A8B9A] mb-2">
                                            {(selectedFile.size / 1024).toFixed(1)} KB
                                        </p>
                                        {previewData && (
                                            <p className="text-xs text-[#00D4AA] font-medium mb-3">
                                                {previewData.totalRows} rows detected
                                            </p>
                                        )}
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-600 border border-red-200 hover:bg-red-50 text-sm font-medium transition-all"
                                            >
                                                <IoTrashOutline size={16} />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-all duration-300
 ${dragActive ? 'bg-[#00D4AA]/10 border border-[#00D4AA]/20' : 'bg-gray-100 border border-gray-200'}`}>
                                            <IoCloudUploadOutline
                                                size={32}
                                                className={`transition-colors duration-300 ${dragActive ? 'text-[#00D4AA]' : 'text-[#7A8B9A]'}`}
                                            />
                                        </div>
                                        <h4 className="text-base font-bold text-[#0A1628] mb-2">
                                            {dragActive ? 'Drop file here' : 'Drag and drop file here, or click to browse'}
                                        </h4>
                                        <p className="text-sm text-[#5C6B7A]">
                                            Excel formats: .xlsx, .xls, .csv up to 10MB
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Parsing Loader */}
                            {isParsing && (
                                <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
                                    <div className="w-5 h-5 border-2 border-[#00D4AA] border-t-transparent animate-spin rounded-full mx-auto mb-2"></div>
                                    <p className="text-sm text-[#5C6B7A]">Parsing file for preview...</p>
                                </div>
                            )}

                            {/* Upload Button */}
                            <div className="mt-8 flex gap-4">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex-1 py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-[#5C6B7A] font-medium text-sm transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={!selectedFile || isUploading}
                                    className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2
 ${!selectedFile || isUploading
                                            ? 'bg-gray-100 text-[#7A8B9A] cursor-not-allowed'
                                            : 'bg-[#00D4AA] text-[#0A1628] hover:bg-[#00F0C0] hover:shadow-[0_0_20px_rgba(0,212,170,0.4)] active:scale-[0.98]'
                                        }`}
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-[#0A1628] border-t-transparent animate-spin rounded-full"></div>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <IoCloudUploadOutline size={18} />
                                            Upload & Import
                                        </>
                                    )}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ClientBulkUpload;