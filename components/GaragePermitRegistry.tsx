
import React, { useState, useEffect } from 'react';
import { GaragePermit, AccessLog, User, SystemConfig, TemplateFieldPos } from '../types';
import { Search, Plus, X, Car, FileText, CheckCircle, AlertCircle, Printer, UserCheck, ShieldCheck, MapPin, Home, History, Ban, User as UserIcon, Calendar, Info, BadgeCheck, Hash, UserCircle, Pencil, Trash2, AlertTriangle, Notebook, XCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface GaragePermitRegistryProps {
    currentUser: User;
    permits: GaragePermit[];
    onAddPermit: (permit: GaragePermit) => void;
    onUpdatePermit: (permit: GaragePermit) => void;
    onDeletePermit?: (permitId: string) => void;
    systemConfig: SystemConfig;
}

const OFFICE_CODE = "258";

const GaragePermitRegistry: React.FC<GaragePermitRegistryProps> = ({ currentUser, permits, onAddPermit, onUpdatePermit, onDeletePermit, systemConfig }) => {
    const { t, isRTL } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingPermitId, setEditingPermitId] = useState<string | null>(null);
    const [selectedPermitForView, setSelectedPermitForView] = useState<GaragePermit | null>(null);
    
    // Initial State for Permit Form
    const initialPermitState: Partial<GaragePermit> = {
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
        checkedBy: '',
        authorizedBy: '',
        notes: ''
    };

    const [newPermit, setNewPermit] = useState<Partial<GaragePermit>>(initialPermitState);
    const [ownerPermitCount, setOwnerPermitCount] = useState(0);
    const [garageOwnerPermitCount, setGarageOwnerPermitCount] = useState(0);

    // Calculate Permit ID based on selected issue date and sequence for that year
    const calculateNextId = (dateStr: string) => {
        const year = new Date(dateStr).getFullYear();
        const yearPrefix = `${OFFICE_CODE}/${year}/`;
        const yearPermits = permits.filter(p => p.permitId.startsWith(yearPrefix));
        const count = yearPermits.length + 1;
        return `${yearPrefix}${String(count).padStart(2, '0')}`;
    };

    // Update ID when issue date changes (only if not editing)
    useEffect(() => {
        if (isAdding && newPermit.issueDate && !editingPermitId) {
            setNewPermit(prev => ({ ...prev, permitId: calculateNextId(newPermit.issueDate!) }));
        }
    }, [newPermit.issueDate, isAdding, permits.length, editingPermitId]);

    // Check permit counts for owners
    useEffect(() => {
        if (newPermit.vehicleOwnerId) {
            const count = permits.filter(p => p.vehicleOwnerId === newPermit.vehicleOwnerId && p.status === 'Issued').length;
            setOwnerPermitCount(count);
        } else {
            setOwnerPermitCount(0);
        }

        if (newPermit.garageOwnerId) {
            const gCount = permits.filter(p => p.garageOwnerId === newPermit.garageOwnerId && p.status === 'Issued').length;
            setGarageOwnerPermitCount(gCount);
        } else {
            setGarageOwnerPermitCount(0);
        }
    }, [newPermit.vehicleOwnerId, newPermit.garageOwnerId, permits]);

    const handleAddClick = () => {
        setEditingPermitId(null);
        const initialDate = new Date().toISOString().split('T')[0];
        setNewPermit({ ...initialPermitState, issueDate: initialDate, permitId: calculateNextId(initialDate) });
        setIsAdding(true);
    };

    const handleEditClick = (permit: GaragePermit, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingPermitId(permit.permitId);
        setNewPermit({ ...permit });
        setIsAdding(true);
    };

    const handleVoidClick = (permitId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to void this permit? This action will officially invalidate the record.")) {
            const permit = permits.find(p => p.permitId === permitId);
            if (permit) {
                const log: AccessLog = { 
                    id: `log-${Date.now()}`, 
                    action: 'Voided', 
                    userId: currentUser.id, 
                    userName: currentUser.name, 
                    timestamp: new Date().toISOString(), 
                    details: `Permit status changed to Void by ${currentUser.name}.` 
                };
                const updatedPermit = { ...permit, status: 'Void' as const, logs: [...(permit.logs || []), log] };
                onUpdatePermit(updatedPermit);
                
                if (selectedPermitForView?.permitId === permitId) {
                    setSelectedPermitForView(updatedPermit);
                }
            }
        }
    };

    const handleDeleteClick = (permitId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to PERMANENTLY delete this permit? This action cannot be undone.")) {
            if (onDeletePermit) {
                onDeletePermit(permitId);
                if (selectedPermitForView?.permitId === permitId) {
                    setSelectedPermitForView(null);
                }
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingPermitId) {
            const log: AccessLog = {
                id: `log-${Date.now()}`,
                action: 'Updated',
                userId: currentUser.id,
                userName: currentUser.name,
                timestamp: new Date().toISOString(),
                details: `Permit updated by staff: ${currentUser.name}`
            };
            const updatedPermit = { ...newPermit, logs: [...(newPermit.logs || []), log] } as GaragePermit;
            onUpdatePermit(updatedPermit);
        } else {
            const finalId = calculateNextId(newPermit.issueDate!);
            const log: AccessLog = {
                id: `log-${Date.now()}`,
                action: 'Created',
                userId: currentUser.id,
                userName: currentUser.name,
                timestamp: new Date().toISOString(),
                details: `Permit issued by staff: ${currentUser.name}.`
            };
            const permitToAdd = { ...newPermit, permitId: finalId, status: 'Issued' as const, logs: [log] } as GaragePermit;
            onAddPermit(permitToAdd);
        }
        setIsAdding(false);
    };

    const filteredPermits = permits.filter(p => 
        p.permitId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.vehicleRegistryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.garageOwnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.vehicleChassisNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.vehicleOwnerId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const DetailRow = ({ label, value, mono = false }: { label: string, value: string | number | undefined, mono?: boolean }) => (
        <div className="flex flex-col py-2 border-b border-slate-50 last:border-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</span>
            <span className={`text-sm ${mono ? 'font-mono' : ''} text-slate-700`}>{value || '-'}</span>
        </div>
    );

    const printPermit = () => {
        window.print();
    };

    // Helper to get printable value for a field key
    const getFieldValue = (fieldKey: string, permit: GaragePermit | null) => {
        if (!permit) return '';
        switch(fieldKey) {
            case 'permitId': return permit.permitId;
            case 'issueDate': return permit.issueDate;
            case 'vehicleChassis': return permit.vehicleChassisNumber;
            case 'vehicleReg': return permit.vehicleRegistryNumber;
            case 'vOwnerName': return permit.vehicleOwnerName;
            case 'vOwnerAddress': return permit.vehicleOwnerAddress;
            case 'vOwnerId': return permit.vehicleOwnerId;
            case 'vOwnerPhone': return permit.vehicleOwnerContact;
            case 'garageAddress': return permit.garageAddress;
            case 'garageSize': return `${permit.garageSizeSqft} Sqft`;
            case 'houseReg': return permit.houseRegistryNumber;
            case 'gOwnerName': return permit.garageOwnerName;
            case 'gOwnerAddress': return permit.garageOwnerAddress;
            case 'gOwnerPhone': return permit.garageOwnerContact;
            case 'authorizedBy': return permit.authorizedBy;
            case 'checkedBy': return permit.checkedBy;
            case 'notes': return permit.notes;
            default: return '';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRTL ? 'text-right' : 'text-left'} print:hidden`}>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{t('garage_title')}</h2>
                    <p className="text-sm text-slate-500">{t('garage_subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleAddClick} className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 flex items-center gap-2 shadow-sm">
                        <Plus size={16} /> {t('new_permit')}
                    </button>
                </div>
            </div>

            <div className="relative print:hidden">
                <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                    <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input type="text" placeholder={t('search_garage')} className={`block w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3 text-left'} py-3 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 outline-none shadow-sm`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden print:hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200" dir={isRTL ? 'rtl' : 'ltr'}>
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('permit_id')}</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle Owner</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle Details</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Garage Location</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('th_status')}</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredPermits.map((permit) => (
                                <tr key={permit.permitId} onClick={() => setSelectedPermitForView(permit)} className="hover:bg-teal-50/30 cursor-pointer transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-slate-900">{permit.permitId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900">{permit.vehicleOwnerName}</div>
                                        <div className="text-xs text-slate-500">{permit.vehicleOwnerAddress}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-slate-800">{permit.vehicleRegistryNumber}</div>
                                        <div className="text-xs text-slate-500 font-mono">CH: {permit.vehicleChassisNumber}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-700">{permit.garageAddress}</div>
                                        <div className="text-xs text-slate-500 font-medium">{permit.garageSizeSqft} Sqft</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${permit.status === 'Issued' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                                            {permit.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => handleEditClick(permit, e)} className="p-1.5 text-slate-400 hover:text-teal-600 transition-colors" title="Edit Record"><Pencil size={18} /></button>
                                            {permit.status === 'Issued' && (
                                                <button onClick={(e) => handleVoidClick(permit.permitId, e)} className="p-1.5 text-slate-400 hover:text-orange-600 transition-colors" title={t('void_permit')}><Ban size={18} /></button>
                                            )}
                                            {currentUser.role === 'Admin' && (
                                                <button onClick={(e) => handleDeleteClick(permit.permitId, e)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors" title="Delete Record"><Trash2 size={18} /></button>
                                            )}
                                            <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"><FileText size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedPermitForView && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col my-4 print:shadow-none print:m-0 print:max-h-none print:max-w-none print:w-[210mm] print:h-[297mm]">
                        {/* Detail Modal Header */}
                        <div className={`p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl sticky top-0 z-10 print:hidden ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                                <div className={`p-2 rounded-lg ${selectedPermitForView.status === 'Issued' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">Permit #{selectedPermitForView.permitId}</h3>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Official View</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedPermitForView(null)} className="text-slate-400 hover:text-slate-600 p-1.5"><X size={24}/></button>
                        </div>

                        {/* Screen Detail View Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 print:hidden bg-slate-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <h4 className="text-xs font-black text-teal-700 uppercase tracking-widest border-b border-teal-50 pb-2 mb-3 flex items-center gap-2">
                                        <Car size={14} /> Vehicle Information
                                    </h4>
                                    <DetailRow label="Chassis Number" value={selectedPermitForView.vehicleChassisNumber} mono />
                                    <DetailRow label="Registry Number" value={selectedPermitForView.vehicleRegistryNumber} mono />
                                    <DetailRow label="Owner Name" value={selectedPermitForView.vehicleOwnerName} />
                                    <DetailRow label="Owner Address" value={selectedPermitForView.vehicleOwnerAddress} />
                                    <DetailRow label="Owner ID / Reg" value={selectedPermitForView.vehicleOwnerId} />
                                    <DetailRow label="Owner Contact" value={selectedPermitForView.vehicleOwnerContact} />
                                </section>
                                <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <h4 className="text-xs font-black text-teal-700 uppercase tracking-widest border-b border-teal-50 pb-2 mb-3 flex items-center gap-2">
                                        <Home size={14} /> Garage Information
                                    </h4>
                                    <DetailRow label="Garage Address" value={selectedPermitForView.garageAddress} />
                                    <DetailRow label="Garage Size (Sqft)" value={`${selectedPermitForView.garageSizeSqft} Sqft`} />
                                    <DetailRow label="House Registry No" value={selectedPermitForView.houseRegistryNumber} mono />
                                    <DetailRow label="Garage Owner Name" value={selectedPermitForView.garageOwnerName} />
                                    <DetailRow label="Garage Owner Address" value={selectedPermitForView.garageOwnerAddress} />
                                    <DetailRow label="Garage Owner ID" value={selectedPermitForView.garageOwnerId} />
                                    <DetailRow label="Garage Owner Contact" value={selectedPermitForView.garageOwnerContact} />
                                    <div className="mt-2 bg-blue-50 p-2 rounded text-xs font-bold text-blue-700 flex items-center gap-2">
                                        <BadgeCheck size={14} /> Active Permits for this Garage Owner: {permits.filter(p => p.garageOwnerId === selectedPermitForView?.garageOwnerId && p.status === 'Issued').length}
                                    </div>
                                </section>

                                {selectedPermitForView.notes && (
                                    <section className="md:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-50 pb-2 mb-3 flex items-center gap-2">
                                            <Notebook size={14} /> Extra Notes
                                        </h4>
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedPermitForView.notes}</p>
                                    </section>
                                )}

                                <section className="md:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <h4 className="text-xs font-black text-emerald-700 uppercase tracking-widest border-b border-emerald-50 pb-2 mb-3 flex items-center gap-2">
                                        <History size={14} /> Permit Access Log
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedPermitForView.logs && selectedPermitForView.logs.map(log => (
                                            <div key={log.id} className="text-xs flex justify-between items-center border-b border-slate-50 pb-2 last:border-0">
                                                <div className="flex gap-4">
                                                    <span className="font-mono text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                                                    <span className={`font-bold ${log.action === 'Created' ? 'text-emerald-600' : 'text-blue-600'}`}>{log.action}</span>
                                                    <span className="text-slate-600">{log.details}</span>
                                                </div>
                                                <span className="font-medium text-slate-500">{log.userName}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* OFFICIAL PRINTABLE PERMIT CARD (Rendered only during print) */}
                        <div className="hidden print:block relative w-full h-full bg-white overflow-hidden">
                            <div className="relative mx-auto bg-white" style={{ width: '210mm', height: '297mm' }}>
                                {systemConfig.garagePermitTemplate.backgroundImage && (
                                    <img 
                                        src={systemConfig.garagePermitTemplate.backgroundImage} 
                                        className="absolute inset-0 w-full h-full object-cover" 
                                        alt="Official Template"
                                    />
                                )}
                                
                                {Object.entries(systemConfig.garagePermitTemplate.fieldPositions).map(([key, pos]: [string, TemplateFieldPos]) => (
                                    pos.visible && (
                                        <div 
                                            key={key}
                                            className="absolute"
                                            style={{ 
                                                top: `${pos.top}%`, 
                                                left: `${pos.left}%`, 
                                                fontSize: `${pos.fontSize}pt`,
                                                fontWeight: pos.fontWeight || 'normal',
                                                whiteSpace: 'pre-wrap',
                                                maxWidth: '50%'
                                            }}
                                        >
                                            {getFieldValue(key, selectedPermitForView)}
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer Controls */}
                        <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0 flex justify-end gap-2 print:hidden">
                            {selectedPermitForView.status === 'Issued' && (
                                <button onClick={(e) => handleVoidClick(selectedPermitForView.permitId, e)} className="px-6 py-2 rounded-lg text-sm font-bold text-orange-600 hover:bg-orange-50 transition-colors flex items-center gap-2">
                                    <Ban size={16} /> {t('void_permit')}
                                </button>
                            )}
                            {currentUser.role === 'Admin' && (
                                <button onClick={(e) => handleDeleteClick(selectedPermitForView.permitId, e)} className="px-6 py-2 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                                    <Trash2 size={16} /> Delete Record
                                </button>
                            )}
                            <button onClick={printPermit} className="bg-teal-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-lg shadow-teal-600/20">
                                <Printer size={16} /> Print Official Permit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto print:hidden">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                            <div>
                                <h3 className="font-black text-lg text-slate-800 uppercase tracking-tight">{editingPermitId ? 'Edit Garage Permit' : 'Issue New Garage Permit'}</h3>
                                <p className="text-xs text-slate-500">Official Portal Access</p>
                            </div>
                            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 p-2"><X size={20}/></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto bg-white">
                            
                            <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-teal-700 uppercase mb-1">Issue Date</label>
                                    <input required type="date" className="w-full border border-teal-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none" 
                                        value={newPermit.issueDate} onChange={e => setNewPermit({...newPermit, issueDate: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-teal-700 uppercase mb-1">Permit Number (Auto)</label>
                                    <input readOnly type="text" className="w-full border border-teal-200 rounded-lg px-3 py-2 text-sm bg-teal-100 text-teal-900 font-mono font-bold outline-none" 
                                        value={newPermit.permitId} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-teal-700 uppercase mb-1">{t('garage_checked_by')}</label>
                                    <input required type="text" className="w-full border border-teal-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none" 
                                        placeholder="Staff Name"
                                        value={newPermit.checkedBy} onChange={e => setNewPermit({...newPermit, checkedBy: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-teal-700 uppercase mb-1">{t('authorized_by_label')}</label>
                                    <input required type="text" className="w-full border border-teal-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none" 
                                        placeholder="Authorizer"
                                        value={newPermit.authorizedBy} onChange={e => setNewPermit({...newPermit, authorizedBy: e.target.value})} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-l-4 border-teal-600 pl-3 flex items-center gap-2">
                                    <Car size={16} /> Vehicle Details
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Vehicle Chassis Number</label>
                                        <input required type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none" 
                                            value={newPermit.vehicleChassisNumber} onChange={e => setNewPermit({...newPermit, vehicleChassisNumber: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Vehicle Registry Number</label>
                                        <input required type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none" 
                                            value={newPermit.vehicleRegistryNumber} onChange={e => setNewPermit({...newPermit, vehicleRegistryNumber: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-l-4 border-teal-600 pl-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2"><UserCircle size={16} /> Vehicle Owner Section</div>
                                    {newPermit.vehicleOwnerId && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ownerPermitCount > 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                                            Existing Vehicle Owner Permits: {ownerPermitCount}
                                        </span>
                                    )}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Full Name</label>
                                        <input required type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none" 
                                            value={newPermit.vehicleOwnerName} onChange={e => setNewPermit({...newPermit, vehicleOwnerName: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Address (Atoll/Island)</label>
                                        <input required type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none" 
                                            value={newPermit.vehicleOwnerAddress} onChange={e => setNewPermit({...newPermit, vehicleOwnerAddress: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">ID Card / Registry Number</label>
                                        <input required type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none" 
                                            value={newPermit.vehicleOwnerId} onChange={e => setNewPermit({...newPermit, vehicleOwnerId: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Phone Number</label>
                                        <input required type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none" 
                                            value={newPermit.vehicleOwnerContact} onChange={e => setNewPermit({...newPermit, vehicleOwnerContact: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-l-4 border-teal-600 pl-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2"><BadgeCheck size={16} /> Garage Owner Details</div>
                                    {newPermit.garageOwnerId && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${garageOwnerPermitCount > 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                                            Existing Garage Owner Permits: {garageOwnerPermitCount}
                                        </span>
                                    )}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Owner Name</label>
                                        <input required type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none" 
                                            value={newPermit.garageOwnerName} onChange={e => setNewPermit({...newPermit, garageOwnerName: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Address</label>
                                        <input required type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none" 
                                            value={newPermit.garageOwnerAddress} onChange={e => setNewPermit({...newPermit, garageOwnerAddress: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">ID Number</label>
                                        <input required type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none" 
                                            value={newPermit.garageOwnerId} onChange={e => setNewPermit({...newPermit, garageOwnerId: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Phone</label>
                                        <input required type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none" 
                                            value={newPermit.garageOwnerContact} onChange={e => setNewPermit({...newPermit, garageOwnerContact: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-l-4 border-teal-600 pl-3 flex items-center gap-2">
                                    <Notebook size={16} /> {t('extra_notes')}
                                </h4>
                                <textarea 
                                    className="w-full border border-slate-300 rounded-xl px-3 py-3 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none h-24 resize-none shadow-inner" 
                                    placeholder="Add any additional notes or internal remarks here..."
                                    value={newPermit.notes}
                                    onChange={e => setNewPermit({...newPermit, notes: e.target.value})}
                                />
                            </div>
                        </form>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                            <button onClick={handleSubmit} type="button" className="px-8 py-2.5 text-sm font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20">
                                {editingPermitId ? 'Update Record' : 'Issue Permit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                @media print {
                    /* Hide everything by default */
                    body > #root > :not(.print-container) { 
                        display: none !important; 
                    }
                    
                    /* If using fixed/absolute positioning for layouts, ensure parent containers allow full page print */
                    #root {
                        display: block !important;
                        position: static !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }

                    /* Specifically hide the main sidebar and headers from the layout */
                    header, nav, aside, .print\\:hidden {
                        display: none !important;
                    }

                    /* Override the detail modal's fixed positioning to allow it to be the main print object */
                    .fixed.inset-0 {
                        position: static !important;
                        display: block !important;
                        background: white !important;
                    }

                    /* Only show the official card container */
                    .bg-white.rounded-xl.shadow-2xl {
                        box-shadow: none !important;
                        border: none !important;
                        max-width: none !important;
                        width: 100% !important;
                        max-height: none !important;
                        display: block !important;
                    }

                    @page { 
                        margin: 0; 
                        size: A4; 
                    }
                }
            `}</style>
        </div>
    );
};

export default GaragePermitRegistry;
