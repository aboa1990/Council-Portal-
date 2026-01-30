
import React, { useState } from 'react';
import { GaragePermit, User, SystemConfig, TemplateFieldPos } from '../types';
import { Search, Plus, X, Car, FileText, CheckCircle, Printer, MapPin, Home, User as UserIcon, Calendar, BadgeCheck, Hash, UserCircle, Pencil, Trash2, Ban, AlertTriangle, ZoomIn, ZoomOut } from 'lucide-react';
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

const GaragePermitRegistry: React.FC<GaragePermitRegistryProps> = ({ currentUser, permits, onAddPermit, onUpdatePermit, onDeletePermit, systemConfig }) => {
    const { t, isRTL } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [editingPermit, setEditingPermit] = useState<GaragePermit | null>(null);
    const [viewingPermit, setViewingPermit] = useState<GaragePermit | null>(null);
    const [previewScale, setPreviewScale] = useState(1.0); // Default to 100% for clear visibility

    // Merge system config with defaults to ensure all layers are visible even if config is old
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
        notes: ''
    };

    const [formData, setFormData] = useState<Partial<GaragePermit>>(initialFormState);

    const filteredPermits = permits.filter(p => 
        p.permitId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.vehicleRegistryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.vehicleOwnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.garageOwnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.vehicleChassisNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenAdd = () => {
        setEditingPermit(null);
        const year = new Date().getFullYear();
        // Simple logic to generate next ID
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
        
        if (editingPermit) {
             const updatedPermit: GaragePermit = {
                 ...editingPermit,
                 ...formData as GaragePermit,
                 logs: [...(editingPermit.logs || []), {
                     id: `log-${Date.now()}`,
                     action: 'Updated',
                     userId: currentUser.id,
                     userName: currentUser.name,
                     timestamp: new Date().toISOString(),
                     details: 'Permit details updated'
                 }]
             };
             onUpdatePermit(updatedPermit);
        } else {
            const newPermit: GaragePermit = {
                ...formData as GaragePermit,
                checkedBy: currentUser.name, 
                authorizedBy: '', 
                logs: [{
                     id: `log-${Date.now()}`,
                     action: 'Created',
                     userId: currentUser.id,
                     userName: currentUser.name,
                     timestamp: new Date().toISOString(),
                     details: 'Permit created'
                }]
            };
            onAddPermit(newPermit);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this permit?')) {
            onDeletePermit?.(id);
        }
    };

    const handlePrint = (permit: GaragePermit) => {
        setViewingPermit(permit);
        setPreviewScale(1.0); // Reset to 100% on open
        setIsPrintModalOpen(true);
    };

    const handleVoid = (permit: GaragePermit) => {
        if (window.confirm('Are you sure you want to void this permit?')) {
             onUpdatePermit({ ...permit, status: 'Void' });
        }
    };

    // Helper for printing fields
    const getFieldStyle = (pos: TemplateFieldPos) => ({
        top: `${pos.top}%`,
        left: `${pos.left}%`,
        fontSize: `${pos.fontSize}px`,
        fontWeight: pos.fontWeight || 'normal',
        textAlign: (pos.textAlign || 'right') as 'left' | 'right' | 'center', // Default to right as requested
        position: 'absolute' as 'absolute',
        transform: 'translateY(-50%)',
        width: 'auto',
        minWidth: '200px', // Ensure enough width for right alignment to be visible
        whiteSpace: 'nowrap' as 'nowrap'
    });

    const renderPrintField = (key: string, value: string) => {
        const pos = effectiveFieldPositions[key];
        if (!pos || !pos.visible) return null;
        return (
            <div style={getFieldStyle(pos)} className="print-field">
                {value}
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{t('garage_title')}</h2>
                    <p className="text-sm text-slate-500">{t('garage_subtitle')}</p>
                </div>
                <button 
                    onClick={handleOpenAdd}
                    className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Plus size={16} />
                    {t('new_permit')}
                </button>
            </div>

            {/* Filter */}
            <div className="relative">
                <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                    <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                    type="text" 
                    placeholder={t('search_garage')} 
                    className={`block w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-3 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm shadow-sm`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
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
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900 font-mono">{permit.permitId}</div>
                                                <div className="text-xs text-slate-500">{new Date(permit.issueDate).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                                <Car size={14} className="text-slate-400"/> {permit.vehicleRegistryNumber}
                                            </div>
                                            <div className="text-xs text-slate-500 font-mono">Chassis: {permit.vehicleChassisNumber}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 text-sm text-slate-900">
                                                <UserIcon size={14} className="text-slate-400"/> {permit.vehicleOwnerName}
                                            </div>
                                            <div className="text-xs text-slate-500">{permit.vehicleOwnerContact}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                             <div className="flex items-center gap-2 text-sm text-slate-700">
                                                <Home size={14} className="text-slate-400"/> {permit.houseRegistryNumber}
                                            </div>
                                            <div className="text-xs text-slate-500">{permit.garageAddress}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {permit.status === 'Issued' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                <CheckCircle size={12} className="mr-1"/> Issued
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                <Ban size={12} className="mr-1"/> Void
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handlePrint(permit)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Print Permit">
                                                <Printer size={16} />
                                            </button>
                                            <button onClick={() => handleOpenEdit(permit)} className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors" title="Edit Permit">
                                                <Pencil size={16} />
                                            </button>
                                            {permit.status !== 'Void' && (
                                                <button onClick={() => handleVoid(permit)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors" title="Void Permit">
                                                    <Ban size={16} />
                                                </button>
                                            )}
                                            {onDeletePermit && (
                                                <button onClick={() => handleDelete(permit.permitId)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete Permit">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredPermits.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">No permits found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal (Updated Width) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-8">
                         <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                            <h3 className="font-bold text-lg text-slate-800">{editingPermit ? 'Update Permit' : t('new_permit')}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('permit_id')}</label>
                                    <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-slate-100 font-mono font-bold text-slate-700" value={formData.permitId} readOnly />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('issue_date')}</label>
                                    <input type="date" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none" 
                                        value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} />
                                </div>
                            </div>

                            {/* Section: Vehicle Info */}
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                                    <Car size={16} className="text-teal-600"/> {t('vehicle_details')}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('registry_no')}</label>
                                        <input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none uppercase font-mono" 
                                            placeholder="e.g. C-1020"
                                            value={formData.vehicleRegistryNumber} onChange={e => setFormData({...formData, vehicleRegistryNumber: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('chassis_no')}</label>
                                        <input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none uppercase font-mono" 
                                            value={formData.vehicleChassisNumber} onChange={e => setFormData({...formData, vehicleChassisNumber: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('owner_name')}</label>
                                        <input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none" 
                                            value={formData.vehicleOwnerName} onChange={e => setFormData({...formData, vehicleOwnerName: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('owner_id')}</label>
                                        <input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none" 
                                            value={formData.vehicleOwnerId} onChange={e => setFormData({...formData, vehicleOwnerId: e.target.value})} />
                                    </div>
                                     <div className="lg:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('owner_address')}</label>
                                        <input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none" 
                                            value={formData.vehicleOwnerAddress} onChange={e => setFormData({...formData, vehicleOwnerAddress: e.target.value})} />
                                    </div>
                                     <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('contact_no')}</label>
                                        <input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none" 
                                            value={formData.vehicleOwnerContact} onChange={e => setFormData({...formData, vehicleOwnerContact: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                             {/* Section: Garage Info */}
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                                    <Home size={16} className="text-teal-600"/> {t('garage_details')}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('house_reg_no')}</label>
                                        <input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none font-mono uppercase" 
                                            value={formData.houseRegistryNumber} onChange={e => setFormData({...formData, houseRegistryNumber: e.target.value})} />
                                    </div>
                                     <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('garage_size')}</label>
                                        <input type="number" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none" 
                                            value={formData.garageSizeSqft} onChange={e => setFormData({...formData, garageSizeSqft: Number(e.target.value)})} />
                                    </div>
                                     <div className="lg:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('garage_address')}</label>
                                        <input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none" 
                                            value={formData.garageAddress} onChange={e => setFormData({...formData, garageAddress: e.target.value})} />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('owner_name')}</label>
                                        <input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none" 
                                            value={formData.garageOwnerName} onChange={e => setFormData({...formData, garageOwnerName: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('owner_id')}</label>
                                        <input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none" 
                                            value={formData.garageOwnerId} onChange={e => setFormData({...formData, garageOwnerId: e.target.value})} />
                                    </div>
                                     <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('owner_address')}</label>
                                        <input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none" 
                                            value={formData.garageOwnerAddress} onChange={e => setFormData({...formData, garageOwnerAddress: e.target.value})} />
                                    </div>
                                     <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('contact_no')}</label>
                                        <input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none" 
                                            value={formData.garageOwnerContact} onChange={e => setFormData({...formData, garageOwnerContact: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('extra_notes')}</label>
                                <textarea 
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none h-20 resize-none"
                                    value={formData.notes || ''}
                                    onChange={e => setFormData({...formData, notes: e.target.value})}
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200">{t('cancel')}</button>
                                <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-teal-600 rounded hover:bg-teal-700 shadow-sm">{editingPermit ? 'Update Permit' : t('issue_permit_btn')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Print Preview Modal */}
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
                                    <button 
                                        onClick={() => setPreviewScale(Math.max(0.3, previewScale - 0.1))} 
                                        className="p-1.5 hover:bg-slate-600 rounded transition-colors"
                                        title="Zoom Out"
                                    >
                                        <ZoomOut size={16} />
                                    </button>
                                    <span className="text-xs font-mono w-12 text-center">{Math.round(previewScale * 100)}%</span>
                                    <button 
                                        onClick={() => setPreviewScale(Math.min(1.5, previewScale + 0.1))} 
                                        className="p-1.5 hover:bg-slate-600 rounded transition-colors"
                                        title="Zoom In"
                                    >
                                        <ZoomIn size={16} />
                                    </button>
                                </div>

                                <button onClick={() => window.print()} className="bg-teal-500 hover:bg-teal-600 text-white px-4 sm:px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-teal-500/20">
                                    <Printer size={18} /> <span className="hidden sm:inline">Print</span>
                                </button>
                                <button onClick={() => setIsPrintModalOpen(false)} className="bg-slate-700 hover:bg-slate-600 text-white p-2.5 rounded-lg transition-colors">
                                    <X size={20} />
                                </button>
                             </div>
                         </div>
                         
                         {/* SCROLLABLE PREVIEW AREA */}
                         <div className="flex-1 overflow-auto bg-slate-200/50 p-4 sm:p-8 flex justify-center items-start custom-scrollbar">
                             {/* THE A4 PAPER CONTAINER WRAPPER */}
                             <div 
                                className="print-preview-wrapper"
                                style={{ 
                                    transform: `scale(${previewScale})`,
                                    transformOrigin: 'top center',
                                    transition: 'transform 0.2s ease-out'
                                }}
                             >
                                 <div 
                                    id="print-area" 
                                    className="bg-white shadow-2xl relative overflow-hidden flex-shrink-0"
                                    style={{ width: '210mm', height: '297mm' }}
                                 >
                                    {systemConfig.garagePermitTemplate.useCustomTemplate && systemConfig.garagePermitTemplate.backgroundImage ? (
                                        <>
                                            <img 
                                                src={systemConfig.garagePermitTemplate.backgroundImage} 
                                                className="absolute inset-0 w-full h-full object-cover z-0" 
                                                alt="Permit Template"
                                            />
                                            <div className="absolute inset-0 z-10 pointer-events-none">
                                                {renderPrintField('permitId', viewingPermit.permitId)}
                                                {renderPrintField('issueDate', new Date(viewingPermit.issueDate).toLocaleDateString())}
                                                {renderPrintField('vehicleChassis', viewingPermit.vehicleChassisNumber)}
                                                {renderPrintField('vehicleReg', viewingPermit.vehicleRegistryNumber)}
                                                {renderPrintField('vOwnerName', viewingPermit.vehicleOwnerName)}
                                                {renderPrintField('vOwnerAddress', viewingPermit.vehicleOwnerAddress)}
                                                {renderPrintField('vOwnerId', viewingPermit.vehicleOwnerId)}
                                                {renderPrintField('vOwnerPhone', viewingPermit.vehicleOwnerContact)}
                                                {renderPrintField('garageAddress', viewingPermit.garageAddress)}
                                                {renderPrintField('garageSize', String(viewingPermit.garageSizeSqft))}
                                                {renderPrintField('houseReg', viewingPermit.houseRegistryNumber)}
                                                {renderPrintField('gOwnerName', viewingPermit.garageOwnerName)}
                                                {renderPrintField('gOwnerAddress', viewingPermit.garageOwnerAddress)}
                                                {renderPrintField('gOwnerId', viewingPermit.garageOwnerId)}
                                                {renderPrintField('gOwnerPhone', viewingPermit.garageOwnerContact)}
                                                {renderPrintField('authorizedBy', viewingPermit.authorizedBy || '')}
                                                {renderPrintField('checkedBy', viewingPermit.checkedBy || '')}
                                                {renderPrintField('notes', viewingPermit.notes || '')}
                                            </div>
                                        </>
                                    ) : (
                                        // Robust Fallback Template (If no background image)
                                        <div className="relative w-full h-full p-12 flex flex-col justify-between border-4 border-double border-slate-900 m-0 box-border bg-white">
                                            
                                            {/* Watermark */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                                                <BadgeCheck size={400} />
                                            </div>

                                            {/* Header */}
                                            <div className="relative z-10 text-center space-y-2 border-b-2 border-slate-900 pb-6">
                                                <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500">{systemConfig.secretariatName}</h2>
                                                <h1 className="text-3xl font-black uppercase tracking-wider text-slate-900">{systemConfig.councilName}</h1>
                                                <div className="pt-4">
                                                    <span className="inline-block border-2 border-slate-900 px-8 py-2 text-xl font-bold uppercase tracking-widest">
                                                        Garage Utilization Permit
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Permit Details Grid */}
                                            <div className="relative z-10 flex-1 py-8 flex flex-col justify-start gap-10">
                                                
                                                {/* Top Meta */}
                                                <div className="flex justify-between items-end px-4">
                                                    <div>
                                                        <p className="text-xs font-bold uppercase text-slate-500 mb-1">Permit Number</p>
                                                        <p className="text-xl font-mono font-bold text-slate-900">{viewingPermit.permitId}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-bold uppercase text-slate-500 mb-1">Date of Issue</p>
                                                        <p className="text-lg font-bold text-slate-900">{new Date(viewingPermit.issueDate).toLocaleDateString()}</p>
                                                    </div>
                                                </div>

                                                {/* Vehicle Section */}
                                                <div className="border border-slate-300 bg-slate-50/50 p-6 rounded-none">
                                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-2 mb-4 flex items-center gap-2">
                                                        <Car size={16} /> Vehicle Information
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                                        <div className="flex justify-between border-b border-dotted border-slate-300 pb-1">
                                                            <span className="text-sm font-bold text-slate-600">Registry No.</span>
                                                            <span className="text-sm font-mono font-bold">{viewingPermit.vehicleRegistryNumber}</span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-dotted border-slate-300 pb-1">
                                                            <span className="text-sm font-bold text-slate-600">Chassis No.</span>
                                                            <span className="text-sm font-mono font-bold">{viewingPermit.vehicleChassisNumber}</span>
                                                        </div>
                                                        <div className="col-span-2 flex justify-between border-b border-dotted border-slate-300 pb-1">
                                                            <span className="text-sm font-bold text-slate-600">Registered Owner</span>
                                                            <span className="text-sm font-bold">{viewingPermit.vehicleOwnerName}</span>
                                                        </div>
                                                        <div className="col-span-2 flex justify-between border-b border-dotted border-slate-300 pb-1">
                                                            <span className="text-sm font-bold text-slate-600">Owner ID / Contact</span>
                                                            <span className="text-sm">{viewingPermit.vehicleOwnerId} / {viewingPermit.vehicleOwnerContact}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Garage Section */}
                                                <div className="border border-slate-300 bg-slate-50/50 p-6 rounded-none">
                                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-2 mb-4 flex items-center gap-2">
                                                        <Home size={16} /> Garage Facility Details
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                                        <div className="flex justify-between border-b border-dotted border-slate-300 pb-1">
                                                            <span className="text-sm font-bold text-slate-600">House Registry</span>
                                                            <span className="text-sm font-mono font-bold">{viewingPermit.houseRegistryNumber}</span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-dotted border-slate-300 pb-1">
                                                            <span className="text-sm font-bold text-slate-600">Garage Size</span>
                                                            <span className="text-sm font-bold">{viewingPermit.garageSizeSqft} Sq. Ft</span>
                                                        </div>
                                                        <div className="col-span-2 flex justify-between border-b border-dotted border-slate-300 pb-1">
                                                            <span className="text-sm font-bold text-slate-600">Location Address</span>
                                                            <span className="text-sm font-bold">{viewingPermit.garageAddress}</span>
                                                        </div>
                                                        <div className="col-span-2 flex justify-between border-b border-dotted border-slate-300 pb-1">
                                                            <span className="text-sm font-bold text-slate-600">Facility Owner</span>
                                                            <span className="text-sm">{viewingPermit.garageOwnerName}</span>
                                                        </div>
                                                        <div className="col-span-2 flex justify-between border-b border-dotted border-slate-300 pb-1">
                                                            <span className="text-sm font-bold text-slate-600">Owner ID / Contact</span>
                                                            <span className="text-sm">{viewingPermit.garageOwnerId} / {viewingPermit.garageOwnerContact}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Declaration */}
                                                <div className="text-xs text-justify text-slate-600 leading-relaxed italic px-2">
                                                    {systemConfig.garagePermitTemplate.declaration || 
                                                    "This document certifies that the vehicle described above has been granted permission to utilize the registered garage facility in accordance with the Land Transport Act and local council regulations. This permit must be kept with the vehicle registration at all times."}
                                                </div>
                                            </div>

                                            {/* Footer / Signatures */}
                                            <div className="relative z-10 mt-auto pt-8 border-t-2 border-slate-900">
                                                <div className="grid grid-cols-2 gap-16">
                                                    <div className="text-center">
                                                        <div className="h-16 flex items-end justify-center pb-2">
                                                            <span className="font-script text-2xl text-slate-800">{viewingPermit.checkedBy}</span>
                                                        </div>
                                                        <div className="border-t border-slate-400 pt-2">
                                                            <p className="text-xs font-bold uppercase text-slate-500">Checked By</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="h-16 flex items-end justify-center pb-2">
                                                            {/* Space for stamp/sig */}
                                                        </div>
                                                        <div className="border-t border-slate-400 pt-2">
                                                            <p className="text-xs font-bold uppercase text-slate-500">Authorized Signature & Stamp</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-center mt-8 text-[10px] text-slate-400 font-mono">
                                                    OFFICIAL RECORD GENERATED BY {systemConfig.councilName.toUpperCase()} PORTAL
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                 </div>
                             </div>
                         </div>
                         <style>{`
                            @media print {
                                @page { size: A4 portrait; margin: 0; }
                                body { 
                                    visibility: hidden; 
                                    background: white;
                                }
                                
                                /* Ensure the wrapper overrides inline React scaling styles */
                                .print-preview-wrapper {
                                    transform: none !important;
                                    position: absolute !important;
                                    top: 0 !important;
                                    left: 0 !important;
                                    margin: 0 !important;
                                    padding: 0 !important;
                                    width: 100% !important;
                                    height: auto !important;
                                    overflow: visible !important;
                                }

                                /* Explicitly show the print area and its children */
                                #print-area {
                                    visibility: visible !important;
                                    position: absolute !important;
                                    left: 0 !important;
                                    top: 0 !important;
                                    width: 210mm !important;
                                    height: 297mm !important;
                                    margin: 0 !important;
                                    padding: 0 !important;
                                    z-index: 9999;
                                    box-shadow: none !important;
                                    background: white !important;
                                }
                                
                                #print-area * {
                                    visibility: visible !important;
                                }

                                /* Hide modal UI elements specifically to be safe */
                                .modal-backdrop, .modal-content {
                                    position: static !important;
                                    overflow: visible !important;
                                    width: auto !important;
                                    height: auto !important;
                                    background: white !important;
                                }
                            }
                        `}</style>
                     </div>
                </div>
            )}
        </div>
    );
};

export default GaragePermitRegistry;