
import React, { useState, useRef } from 'react';
import { GaragePermit, User, SystemConfig, TemplateFieldPos, AccessLog } from '../types';
import { Search, Plus, X, Car, FileText, CheckCircle, Printer, MapPin, Home, User as UserIcon, BadgeCheck, Pencil, Trash2, Ban, ZoomIn, ZoomOut, History, Eye, AlertCircle, Upload, FileCheck, Download, PieChart, BarChart3 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { DEFAULT_FIELD_POSITIONS } from '../constants';

interface GaragePermitRegistryProps {
    currentUser: User;
    permits: GaragePermit[];
    onAddPermit: (permit: GaragePermit) => void;
    onUpdatePermit: (permit: GaragePermit) => void;
    onDeletePermit?: (permitId: string) => void;
    systemConfig: SystemConfig;
}

const OFFICE_CODE = "258";

// --- Internal Component: The Permit Design ---
// This is extracted so we can render it twice: once for screen (scaled), once for print (fixed)
const PermitPaper: React.FC<{ permit: GaragePermit, systemConfig: SystemConfig, effectiveFieldPositions: any }> = ({ permit, systemConfig, effectiveFieldPositions }) => {
    
    // Helper for absolute positioning fields
    const getFieldStyle = (pos: TemplateFieldPos) => ({
        top: `${pos.top}%`,
        left: `${pos.left}%`,
        fontSize: `${pos.fontSize}px`,
        fontWeight: pos.fontWeight || 'normal',
        textAlign: (pos.textAlign || 'right') as 'left' | 'right' | 'center',
        position: 'absolute' as 'absolute',
        transform: 'translateY(-50%)',
        width: 'auto',
        minWidth: '200px',
        whiteSpace: 'nowrap' as 'nowrap'
    });

    const renderField = (key: string, value: string) => {
        const pos = effectiveFieldPositions[key];
        if (!pos || !pos.visible) return null;
        return <div style={getFieldStyle(pos)} className="print-field">{value}</div>;
    };

    return (
        <div style={{ width: '210mm', height: '297mm', position: 'relative', backgroundColor: 'white', overflow: 'hidden' }}>
            {systemConfig.garagePermitTemplate.useCustomTemplate && systemConfig.garagePermitTemplate.backgroundImage ? (
                <>
                    <img 
                        src={systemConfig.garagePermitTemplate.backgroundImage} 
                        style={{ width: '100%', height: '100%', objectFit: 'fill', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
                        alt="Permit Template"
                    />
                    <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
                        {renderField('permitId', permit.permitId)}
                        {renderField('issueDate', new Date(permit.issueDate).toLocaleDateString())}
                        {renderField('vehicleChassis', permit.vehicleChassisNumber)}
                        {renderField('vehicleReg', permit.vehicleRegistryNumber)}
                        {renderField('vOwnerName', permit.vehicleOwnerName)}
                        {renderField('vOwnerAddress', permit.vehicleOwnerAddress)}
                        {renderField('vOwnerId', permit.vehicleOwnerId)}
                        {renderField('vOwnerPhone', permit.vehicleOwnerContact)}
                        {renderField('garageAddress', permit.garageAddress)}
                        {renderField('garageSize', String(permit.garageSizeSqft))}
                        {renderField('houseReg', permit.houseRegistryNumber)}
                        {renderField('gOwnerName', permit.garageOwnerName)}
                        {renderField('gOwnerAddress', permit.garageOwnerAddress)}
                        {renderField('gOwnerId', permit.garageOwnerId)}
                        {renderField('gOwnerPhone', permit.garageOwnerContact)}
                        {renderField('authorizedBy', permit.authorizedBy || '')}
                        {renderField('checkedBy', permit.checkedBy || '')}
                        {renderField('notes', permit.notes || '')}
                    </div>
                </>
            ) : (
                /* Fallback Standard Template */
                <div className="relative w-full h-full p-12 flex flex-col justify-between border-4 border-double border-slate-900 m-0 box-border bg-white">
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                        <BadgeCheck size={400} />
                    </div>
                    <div className="relative z-10 text-center space-y-2 border-b-2 border-slate-900 pb-6">
                        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500">{systemConfig.secretariatName}</h2>
                        <h1 className="text-3xl font-black uppercase tracking-wider text-slate-900">{systemConfig.councilName}</h1>
                        <div className="pt-4">
                            <span className="inline-block border-2 border-slate-900 px-8 py-2 text-xl font-bold uppercase tracking-widest">Garage Utilization Permit</span>
                        </div>
                    </div>
                    <div className="relative z-10 flex-1 py-8 flex flex-col justify-start gap-10">
                        <div className="flex justify-between items-end px-4">
                            <div>
                                <p className="text-xs font-bold uppercase text-slate-500 mb-1">Permit Number</p>
                                <p className="text-xl font-mono font-bold text-slate-900">{permit.permitId}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold uppercase text-slate-500 mb-1">Date of Issue</p>
                                <p className="text-lg font-bold text-slate-900">{new Date(permit.issueDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="border border-slate-300 bg-slate-50/50 p-6 rounded-none">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-2 mb-4 flex items-center gap-2"><Car size={16} /> Vehicle Information</h3>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                <div className="flex justify-between border-b border-dotted border-slate-300 pb-1"><span className="text-sm font-bold text-slate-600">Registry No.</span><span className="text-sm font-mono font-bold">{permit.vehicleRegistryNumber}</span></div>
                                <div className="flex justify-between border-b border-dotted border-slate-300 pb-1"><span className="text-sm font-bold text-slate-600">Chassis No.</span><span className="text-sm font-mono font-bold">{permit.vehicleChassisNumber}</span></div>
                                <div className="col-span-2 flex justify-between border-b border-dotted border-slate-300 pb-1"><span className="text-sm font-bold text-slate-600">Registered Owner</span><span className="text-sm font-bold">{permit.vehicleOwnerName}</span></div>
                                <div className="col-span-2 flex justify-between border-b border-dotted border-slate-300 pb-1"><span className="text-sm font-bold text-slate-600">Owner ID / Contact</span><span className="text-sm">{permit.vehicleOwnerId} / {permit.vehicleOwnerContact}</span></div>
                            </div>
                        </div>
                        <div className="border border-slate-300 bg-slate-50/50 p-6 rounded-none">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-2 mb-4 flex items-center gap-2"><Home size={16} /> Garage Facility Details</h3>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                <div className="flex justify-between border-b border-dotted border-slate-300 pb-1"><span className="text-sm font-bold text-slate-600">House Registry</span><span className="text-sm font-mono font-bold">{permit.houseRegistryNumber}</span></div>
                                <div className="flex justify-between border-b border-dotted border-slate-300 pb-1"><span className="text-sm font-bold text-slate-600">Garage Size</span><span className="text-sm font-bold">{permit.garageSizeSqft} Sq. Ft</span></div>
                                <div className="col-span-2 flex justify-between border-b border-dotted border-slate-300 pb-1"><span className="text-sm font-bold text-slate-600">Location Address</span><span className="text-sm font-bold">{permit.garageAddress}</span></div>
                                <div className="col-span-2 flex justify-between border-b border-dotted border-slate-300 pb-1"><span className="text-sm font-bold text-slate-600">Facility Owner</span><span className="text-sm">{permit.garageOwnerName}</span></div>
                            </div>
                        </div>
                        <div className="text-xs text-justify text-slate-600 leading-relaxed italic px-2">{systemConfig.garagePermitTemplate.declaration}</div>
                    </div>
                    <div className="relative z-10 mt-auto pt-8 border-t-2 border-slate-900">
                        <div className="grid grid-cols-2 gap-16">
                            <div className="text-center"><div className="h-16 flex items-end justify-center pb-2"><span className="font-script text-2xl text-slate-800">{permit.checkedBy}</span></div><div className="border-t border-slate-400 pt-2"><p className="text-xs font-bold uppercase text-slate-500">Checked By</p></div></div>
                            <div className="text-center"><div className="h-16 flex items-end justify-center pb-2"></div><div className="border-t border-slate-400 pt-2"><p className="text-xs font-bold uppercase text-slate-500">Authorized Signature</p></div></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const GaragePermitRegistry: React.FC<GaragePermitRegistryProps> = ({ currentUser, permits, onAddPermit, onUpdatePermit, onDeletePermit, systemConfig }) => {
    const { t, isRTL } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [isSignedDocModalOpen, setIsSignedDocModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    
    const [editingPermit, setEditingPermit] = useState<GaragePermit | null>(null);
    const [viewingPermit, setViewingPermit] = useState<GaragePermit | null>(null);
    const [viewingSignedDoc, setViewingSignedDoc] = useState<GaragePermit | null>(null);
    
    const [previewScale, setPreviewScale] = useState(0.8);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const effectiveFieldPositions = {
        ...DEFAULT_FIELD_POSITIONS,
        ...(systemConfig.garagePermitTemplate?.fieldPositions || {})
    };

    const initialFormState: Partial<GaragePermit> = {
        permitId: '',
        issueDate: new Date().toISOString().split('T')[0],
        status: 'Issued',
        vehicleChassisNumber: '',
        vehicleRegistryNumber: '',
        vehicleOwnerName: '',
        vehicleOwnerAddress: '',
        vehicleOwnerId: '',
        vehicleOwnerContact: '',
        garageAddress: '',
        garageSizeSqft: 0,
        houseRegistryNumber: '',
        garageOwnerName: '',
        garageOwnerAddress: '',
        garageOwnerId: '',
        garageOwnerContact: '',
        notes: '',
        signedPermitData: ''
    };

    const [formData, setFormData] = useState<Partial<GaragePermit>>(initialFormState);

    // Filter permits
    const filteredPermits = permits.filter(p => 
        p.permitId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.vehicleRegistryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.vehicleOwnerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate Stats for Report
    const totalPermits = permits.length;
    const activePermits = permits.filter(p => p.status === 'Issued').length;
    const voidPermits = permits.filter(p => p.status === 'Void').length;
    
    const permitsByYear = permits.reduce((acc, p) => {
        const year = new Date(p.issueDate).getFullYear();
        acc[year] = (acc[year] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Calculate active permits for a given owner ID (both vehicle and garage roles)
    const getActivePermitCount = (id: string, type: 'vehicle' | 'garage') => {
        if (!id) return 0;
        return permits.filter(p => 
            p.status === 'Issued' && 
            (type === 'vehicle' ? p.vehicleOwnerId === id : p.garageOwnerId === id)
        ).length;
    };

    const handleOpenAdd = () => {
        setEditingPermit(null);
        const year = new Date().getFullYear();
        const count = permits.filter(p => p.issueDate.startsWith(String(year))).length + 1;
        const newId = `${OFFICE_CODE}/${year}/${String(count).padStart(2, '0')}`;
        setFormData({ ...initialFormState, permitId: newId });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (permit: GaragePermit) => {
        setEditingPermit(permit);
        setFormData({ ...permit });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const timestamp = new Date().toISOString();
        const logEntry: AccessLog = {
            id: `log-${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            role: currentUser.role,
            timestamp: timestamp,
            action: editingPermit ? 'Updated' : 'Created',
            details: editingPermit ? 'Permit details updated' : 'Permit issued'
        };

        if (editingPermit) {
             const updatedPermit: GaragePermit = { 
                 ...editingPermit, 
                 ...formData as GaragePermit,
                 logs: [logEntry, ...(editingPermit.logs || [])]
             };
             onUpdatePermit(updatedPermit);
        } else {
            const newPermit: GaragePermit = { 
                ...formData as GaragePermit, 
                checkedBy: currentUser.name, 
                authorizedBy: '', 
                logs: [logEntry] 
            };
            onAddPermit(newPermit);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this permit?')) onDeletePermit?.(id);
    };

    const handlePrint = (permit: GaragePermit) => {
        setViewingPermit(permit);
        setPreviewScale(0.8); 
        setIsPrintModalOpen(true);
    };

    const handleViewSignedDoc = (permit: GaragePermit) => {
        setViewingSignedDoc(permit);
        setIsSignedDocModalOpen(true);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({ ...prev, signedPermitData: event.target?.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVoid = (permit: GaragePermit) => {
        if (window.confirm('Are you sure you want to void this permit?')) {
            const logEntry: AccessLog = {
                id: `log-${Date.now()}`,
                userId: currentUser.id,
                userName: currentUser.name,
                role: currentUser.role,
                timestamp: new Date().toISOString(),
                action: 'Voided',
                details: 'Permit marked as void'
            };
            onUpdatePermit({ 
                ...permit, 
                status: 'Void',
                logs: [logEntry, ...(permit.logs || [])]
            });
        }
    };

    // Live counts for form inputs
    const activeVehiclePermitsInForm = getActivePermitCount(formData.vehicleOwnerId || '', 'vehicle');
    const activeGaragePermitsInForm = getActivePermitCount(formData.garageOwnerId || '', 'garage');

    return (
        <div className="space-y-6 animate-fade-in pb-10">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{t('garage_title')}</h2>
                    <p className="text-sm text-slate-500">{t('garage_subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsReportModalOpen(true)} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
                        <BarChart3 size={16} /> Report
                    </button>
                    <button onClick={handleOpenAdd} className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm">
                        <Plus size={16} /> {t('new_permit')}
                    </button>
                </div>
            </div>

            <div className="relative">
                <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}><Search className="h-5 w-5 text-slate-400" /></div>
                <input type="text" placeholder={t('search_garage')} className={`block w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-3 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 sm:text-sm shadow-sm`}
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

             <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{t('permit_id')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{t('vehicle_details')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{t('owner_details')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{t('garage_details')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{t('status')}</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">{t('actions_label')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredPermits.map((permit) => (
                                <tr key={permit.permitId} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center gap-3"><div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><FileText size={20} /></div><div><div className="text-sm font-bold text-slate-900 font-mono">{permit.permitId}</div><div className="text-xs text-slate-500">{new Date(permit.issueDate).toLocaleDateString()}</div></div></div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="flex flex-col"><div className="flex items-center gap-2 text-sm font-bold text-slate-700"><Car size={14} className="text-slate-400"/> {permit.vehicleRegistryNumber}</div><div className="text-xs text-slate-500 font-mono">Chassis: {permit.vehicleChassisNumber}</div></div></td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 text-sm text-slate-900"><UserIcon size={14} className="text-slate-400"/> {permit.vehicleOwnerName}</div>
                                            <div className="text-xs text-slate-500">{permit.vehicleOwnerContact}</div>
                                            <div className="mt-1">
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200" title="Active vehicle permits for this owner">
                                                    <Car size={10} />
                                                    {t('permits_held')}: {getActivePermitCount(permit.vehicleOwnerId, 'vehicle')}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 text-sm text-slate-700"><Home size={14} className="text-slate-400"/> {permit.houseRegistryNumber}</div>
                                            <div className="text-xs text-slate-500">{permit.garageAddress}</div>
                                            {/* Garage Owner Info Display */}
                                            {permit.garageOwnerName && (
                                                <div className="mt-1 flex flex-col">
                                                    <div className="text-xs text-slate-400 flex items-center gap-1"><UserIcon size={10} /> {permit.garageOwnerName}</div>
                                                    <div className="mt-0.5">
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200" title="Active garage allocations for this owner">
                                                            <Home size={10} />
                                                            Allocations: {getActivePermitCount(permit.garageOwnerId, 'garage')}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{permit.status === 'Issued' ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle size={12} className="mr-1"/> Issued</span> : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"><Ban size={12} className="mr-1"/> Void</span>}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right"><div className="flex items-center justify-end gap-2">
                                        {permit.signedPermitData && (
                                            <button onClick={() => handleViewSignedDoc(permit)} className="p-1.5 text-teal-600 bg-teal-50 hover:bg-teal-100 rounded transition-colors" title="View Signed Permit"><FileCheck size={16} /></button>
                                        )}
                                        <button onClick={() => handleOpenEdit(permit)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View Details"><Eye size={16} /></button><button onClick={() => handlePrint(permit)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"><Printer size={16} /></button><button onClick={() => handleOpenEdit(permit)} className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"><Pencil size={16} /></button>{permit.status !== 'Void' && <button onClick={() => handleVoid(permit)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"><Ban size={16} /></button>}{onDeletePermit && <button onClick={() => handleDelete(permit.permitId)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} /></button>}</div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* REPORT MODAL */}
            {isReportModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 print:hidden">
                            <h3 className="font-bold text-lg text-slate-800">Garage Permit Summary Report</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => window.print()} className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                                    <Printer size={16} /> Print Report
                                </button>
                                <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2"><X size={20}/></button>
                            </div>
                        </div>
                        
                        {/* Report Content */}
                        <div className="flex-1 overflow-auto p-8" id="garage-report-area">
                            <div className="text-center mb-8 border-b-2 border-slate-800 pb-4">
                                <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900">{systemConfig.councilName}</h1>
                                <h2 className="text-lg font-medium text-slate-600 mt-1">{systemConfig.secretariatName}</h2>
                                <div className="mt-4 inline-block bg-slate-900 text-white px-4 py-1 text-sm font-bold uppercase">
                                    Garage Permit Activity Report
                                </div>
                                <p className="text-xs text-slate-500 mt-2">Generated on {new Date().toLocaleDateString()}</p>
                            </div>

                            {/* KPI Cards */}
                            <div className="grid grid-cols-3 gap-6 mb-8">
                                <div className="bg-slate-50 border border-slate-200 p-4 text-center rounded-lg">
                                    <div className="text-3xl font-black text-slate-900">{totalPermits}</div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Total Permits Issued</div>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-100 p-4 text-center rounded-lg">
                                    <div className="text-3xl font-black text-emerald-700">{activePermits}</div>
                                    <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">Active / Valid</div>
                                </div>
                                <div className="bg-red-50 border border-red-100 p-4 text-center rounded-lg">
                                    <div className="text-3xl font-black text-red-700">{voidPermits}</div>
                                    <div className="text-xs font-bold text-red-600 uppercase tracking-widest mt-1">Void / Cancelled</div>
                                </div>
                            </div>

                            {/* Breakdown Table */}
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-slate-800 uppercase border-b border-slate-200 pb-2 mb-4">Issuance by Year</h3>
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            <th className="px-4 py-2 font-bold text-slate-700">Year</th>
                                            <th className="px-4 py-2 font-bold text-slate-700 text-right">Count</th>
                                            <th className="px-4 py-2 font-bold text-slate-700 text-right">% of Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {Object.entries(permitsByYear).sort((a,b) => Number(b[0]) - Number(a[0])).map(([year, count]) => (
                                            <tr key={year}>
                                                <td className="px-4 py-2 font-medium">{year}</td>
                                                <td className="px-4 py-2 text-right">{count}</td>
                                                <td className="px-4 py-2 text-right text-slate-500">{((Number(count) / totalPermits) * 100).toFixed(1)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Recent Activity List */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 uppercase border-b border-slate-200 pb-2 mb-4">Last 10 Issued Permits</h3>
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            <th className="px-4 py-2 font-bold text-slate-700">Permit ID</th>
                                            <th className="px-4 py-2 font-bold text-slate-700">Date</th>
                                            <th className="px-4 py-2 font-bold text-slate-700">Vehicle Owner</th>
                                            <th className="px-4 py-2 font-bold text-slate-700">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {[...permits].sort((a,b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()).slice(0, 10).map(p => (
                                            <tr key={p.permitId}>
                                                <td className="px-4 py-2 font-mono text-xs">{p.permitId}</td>
                                                <td className="px-4 py-2 text-slate-600">{new Date(p.issueDate).toLocaleDateString()}</td>
                                                <td className="px-4 py-2 text-slate-900">{p.vehicleOwnerName}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${p.status === 'Issued' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
                                <div>
                                    <p className="font-bold text-slate-700 uppercase mb-4">Prepared By:</p>
                                    <div className="h-8 border-b border-slate-300 w-48 mb-1"></div>
                                    <p>{currentUser.name} ({currentUser.role})</p>
                                </div>
                                <div>
                                    <p>End of Report</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-5xl">
                             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-lg text-slate-800">{editingPermit ? 'Update Permit' : t('new_permit')}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Standard Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('permit_id')}</label><input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-slate-100 font-mono font-bold text-slate-700" value={formData.permitId} readOnly /></div>
                                    <div className="col-span-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('issue_date')}</label><input type="date" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white outline-none" value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} /></div>
                                </div>
                                
                                {/* Vehicle Details Section */}
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2"><Car size={16} className="text-teal-600"/> {t('vehicle_details')}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('registry_no')}</label><input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white font-mono" value={formData.vehicleRegistryNumber} onChange={e => setFormData({...formData, vehicleRegistryNumber: e.target.value})} /></div>
                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('chassis_no')}</label><input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white font-mono" value={formData.vehicleChassisNumber} onChange={e => setFormData({...formData, vehicleChassisNumber: e.target.value})} /></div>
                                        
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex justify-between">
                                                {t('owner_id')}
                                                {activeVehiclePermitsInForm > 0 && (
                                                    <span className="text-amber-600 text-[10px] flex items-center gap-1">
                                                        <AlertCircle size={10} /> Active Permits: {activeVehiclePermitsInForm}
                                                    </span>
                                                )}
                                            </label>
                                            <input type="text" required className={`w-full border rounded px-3 py-2 text-sm bg-white ${activeVehiclePermitsInForm > 0 ? 'border-amber-300 focus:ring-amber-500' : 'border-slate-300'}`} value={formData.vehicleOwnerId} onChange={e => setFormData({...formData, vehicleOwnerId: e.target.value})} />
                                        </div>
                                        
                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('owner_name')}</label><input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white" value={formData.vehicleOwnerName} onChange={e => setFormData({...formData, vehicleOwnerName: e.target.value})} /></div>
                                        <div className="lg:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('owner_address')}</label><input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white" value={formData.vehicleOwnerAddress} onChange={e => setFormData({...formData, vehicleOwnerAddress: e.target.value})} /></div>
                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('contact_no')}</label><input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white" value={formData.vehicleOwnerContact} onChange={e => setFormData({...formData, vehicleOwnerContact: e.target.value})} /></div>
                                    </div>
                                </div>

                                {/* Garage Details Section */}
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2"><Home size={16} className="text-teal-600"/> {t('garage_details')}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('house_reg_no')}</label><input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white font-mono" value={formData.houseRegistryNumber} onChange={e => setFormData({...formData, houseRegistryNumber: e.target.value})} /></div>
                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('garage_size')}</label><input type="number" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white" value={formData.garageSizeSqft} onChange={e => setFormData({...formData, garageSizeSqft: Number(e.target.value)})} /></div>
                                        <div className="lg:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('garage_address')}</label><input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white" value={formData.garageAddress} onChange={e => setFormData({...formData, garageAddress: e.target.value})} /></div>
                                        
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex justify-between">
                                                {t('owner_id')}
                                                {activeGaragePermitsInForm > 0 && (
                                                    <span className="text-amber-600 text-[10px] flex items-center gap-1">
                                                        <AlertCircle size={10} /> Active Allocations: {activeGaragePermitsInForm}
                                                    </span>
                                                )}
                                            </label>
                                            <input type="text" required className={`w-full border rounded px-3 py-2 text-sm bg-white ${activeGaragePermitsInForm > 0 ? 'border-amber-300 focus:ring-amber-500' : 'border-slate-300'}`} value={formData.garageOwnerId} onChange={e => setFormData({...formData, garageOwnerId: e.target.value})} />
                                        </div>

                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('owner_name')}</label><input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white" value={formData.garageOwnerName} onChange={e => setFormData({...formData, garageOwnerName: e.target.value})} /></div>
                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('owner_address')}</label><input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white" value={formData.garageOwnerAddress} onChange={e => setFormData({...formData, garageOwnerAddress: e.target.value})} /></div>
                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('contact_no')}</label><input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white" value={formData.garageOwnerContact} onChange={e => setFormData({...formData, garageOwnerContact: e.target.value})} /></div>
                                    </div>
                                </div>
                                
                                {/* Signed Permit Upload Section - Only when editing */}
                                {editingPermit && (
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-4 border-b border-blue-200 pb-2">
                                            <FileCheck size={16} className="text-blue-600"/> Signed Permit Record
                                        </h4>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <p className="text-xs text-blue-700 mb-2">Upload the scanned/signed copy of this permit for digital archiving.</p>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="bg-white border border-blue-300 text-blue-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-sm"
                                                    >
                                                        <Upload size={16} />
                                                        {formData.signedPermitData ? 'Replace Document' : 'Upload Signed Copy'}
                                                    </button>
                                                    <input 
                                                        type="file" 
                                                        ref={fileInputRef}
                                                        onChange={handleFileUpload}
                                                        className="hidden"
                                                        accept="image/*,application/pdf"
                                                    />
                                                    {formData.signedPermitData && (
                                                         <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                                             <CheckCircle size={14} /> Document Attached
                                                         </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Access Log Section - ONLY when editing */}
                                {editingPermit && (
                                    <div className="mt-8 pt-6 border-t border-slate-200">
                                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                                            <History size={16} className="text-slate-500" />
                                            Audit Log
                                        </h4>
                                        <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden max-h-48 overflow-y-auto">
                                            <table className="min-w-full text-xs">
                                                <thead className="bg-slate-100 text-slate-500 font-medium">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left sticky top-0 bg-slate-100">Date</th>
                                                        <th className="px-3 py-2 text-left sticky top-0 bg-slate-100">User</th>
                                                        <th className="px-3 py-2 text-left sticky top-0 bg-slate-100">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 text-slate-600">
                                                    {editingPermit.logs?.map((log) => (
                                                        <tr key={log.id}>
                                                            <td className="px-3 py-2">{new Date(log.timestamp).toLocaleString()}</td>
                                                            <td className="px-3 py-2">{log.userName}</td>
                                                            <td className="px-3 py-2">{log.action}</td>
                                                        </tr>
                                                    )) || <tr><td colSpan={3} className="px-3 py-2 text-center italic">No logs available</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200">{t('cancel')}</button>
                                    <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-teal-600 rounded hover:bg-teal-700 shadow-sm">{editingPermit ? 'Update Permit' : t('issue_permit_btn')}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Signed Document Viewer Modal */}
            {isSignedDocModalOpen && viewingSignedDoc && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
                     <div className="bg-white rounded-lg shadow-2xl h-[90vh] w-full max-w-4xl flex flex-col overflow-hidden relative">
                         <div className="p-4 bg-slate-800 text-white flex justify-between items-center z-50 shadow-md">
                             <div className="flex items-center gap-4">
                                <h3 className="font-bold text-lg flex items-center gap-2"><FileCheck size={20} /> Signed Permit Record</h3>
                                <div className="text-xs bg-slate-700 px-3 py-1 rounded-full font-mono border border-slate-600 whitespace-nowrap">{viewingSignedDoc.permitId}</div>
                             </div>
                             <button onClick={() => setIsSignedDocModalOpen(false)} className="bg-slate-700 hover:bg-slate-600 p-2 rounded"><X size={20} /></button>
                         </div>
                         <div className="flex-1 overflow-auto bg-slate-100 p-4 flex justify-center items-center">
                             {viewingSignedDoc.signedPermitData?.startsWith('data:application/pdf') ? (
                                 <iframe src={viewingSignedDoc.signedPermitData} className="w-full h-full border-none rounded shadow-lg" title="Signed Permit PDF" />
                             ) : (
                                 <img src={viewingSignedDoc.signedPermitData} className="max-w-full max-h-full object-contain rounded shadow-lg" alt="Signed Permit" />
                             )}
                         </div>
                     </div>
                </div>
            )}

            {/* Modal for Screen Preview */}
            {isPrintModalOpen && viewingPermit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-hidden modal-backdrop">
                     <div className="bg-white rounded-lg shadow-2xl h-[95vh] w-full max-w-6xl flex flex-col overflow-hidden relative modal-content">
                         <div className="p-4 bg-slate-800 text-white flex justify-between items-center print:hidden z-50 shadow-md">
                             <div className="flex items-center gap-4">
                                <h3 className="font-bold text-lg hidden sm:block">{t('print_official_permit')}</h3>
                                <div className="text-xs bg-slate-700 px-3 py-1 rounded-full font-mono border border-slate-600 whitespace-nowrap">{viewingPermit.permitId}</div>
                             </div>
                             <div className="flex items-center gap-2 sm:gap-4">
                                <div className="hidden sm:flex items-center bg-slate-700 rounded-lg p-1">
                                    <button onClick={() => setPreviewScale(Math.max(0.3, previewScale - 0.1))} className="p-1.5 hover:bg-slate-600 rounded"><ZoomOut size={16} /></button>
                                    <span className="text-xs font-mono w-12 text-center">{Math.round(previewScale * 100)}%</span>
                                    <button onClick={() => setPreviewScale(Math.min(1.5, previewScale + 0.1))} className="p-1.5 hover:bg-slate-600 rounded"><ZoomIn size={16} /></button>
                                </div>
                                <button onClick={() => window.print()} className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2"><Printer size={18} /> Print</button>
                                <button onClick={() => setIsPrintModalOpen(false)} className="bg-slate-700 hover:bg-slate-600 p-2 rounded"><X size={20} /></button>
                             </div>
                         </div>
                         <div className="flex-1 overflow-auto bg-slate-200/50 p-4 sm:p-8 flex justify-center items-start custom-scrollbar">
                             {/* SCREEN PREVIEW: This one scales */}
                             <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top center', transition: 'transform 0.2s ease-out', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }}>
                                 <PermitPaper permit={viewingPermit} systemConfig={systemConfig} effectiveFieldPositions={effectiveFieldPositions} />
                             </div>
                         </div>
                     </div>
                </div>
            )}

            {/* HIDDEN PRINT-ONLY CONTAINER */}
            {/* This renders the permit at exactly 100% scale (A4) and is only visible when printing. */}
            {viewingPermit && (
                <div id="official-print-version" className="hidden print:block">
                    <PermitPaper permit={viewingPermit} systemConfig={systemConfig} effectiveFieldPositions={effectiveFieldPositions} />
                </div>
            )}

            {/* PRINT CSS */}
            <style>{`
            @media print {
                /* Hide everything by default */
                body * { visibility: hidden; }
                
                /* Show ONLY the dedicated print container */
                #official-print-version, #official-print-version * {
                    visibility: visible;
                }

                /* Added for Report Printing */
                #garage-report-area, #garage-report-area * {
                    visibility: visible;
                }
                #garage-report-area {
                    position: absolute;
                    left: 0; top: 0; width: 100%; height: auto;
                    padding: 40px; margin: 0; background: white; z-index: 99999;
                }

                #official-print-version {
                    position: fixed;
                    left: 0;
                    top: 0;
                    width: 210mm;
                    height: 297mm;
                    margin: 0;
                    padding: 0;
                    z-index: 99999;
                    background: white;
                }
                
                .print\\:hidden { display: none !important; }

                @page { size: A4; margin: 0; }
            }
            `}</style>
        </div>
    );
};

export default GaragePermitRegistry;
