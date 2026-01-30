
import React, { useState } from 'react';
import { GaragePermit, User, SystemConfig, TemplateFieldPos } from '../types';
import { Search, Plus, X, Car, FileText, CheckCircle, Printer, MapPin, Home, User as UserIcon, Calendar, BadgeCheck, Hash, UserCircle, Pencil, Trash2, Ban, AlertTriangle } from 'lucide-react';
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [editingPermit, setEditingPermit] = useState<GaragePermit | null>(null);
    const [viewingPermit, setViewingPermit] = useState<GaragePermit | null>(null);

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
        textAlign: pos.textAlign || 'left',
        position: 'absolute' as 'absolute',
        transform: 'translateY(-50%)'
    });

    const renderPrintField = (key: string, value: string) => {
        const pos = systemConfig.garagePermitTemplate.fieldPositions[key];
        if (!pos || !pos.visible) return null;
        return (
            <div style={getFieldStyle(pos)} className="whitespace-nowrap">
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

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-8">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                     <div className="col-span-2">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                     <div className="col-span-2">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
                     <div className="bg-white shadow-2xl w-[210mm] max-h-[90vh] flex flex-col overflow-hidden relative">
                         <div className="p-4 bg-slate-800 text-white flex justify-between items-center print:hidden">
                             <div className="flex items-center gap-4">
                                <h3 className="font-bold">{t('print_official_permit')}</h3>
                                <span className="text-xs bg-slate-700 px-2 py-1 rounded">{viewingPermit.permitId}</span>
                             </div>
                             <div className="flex gap-2">
                                <button onClick={() => window.print()} className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2">
                                    <Printer size={16} /> Print
                                </button>
                                <button onClick={() => setIsPrintModalOpen(false)} className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded">
                                    <X size={20} />
                                </button>
                             </div>
                         </div>
                         
                         <div className="flex-1 overflow-auto bg-slate-100 p-8 flex justify-center" id="print-area">
                             <div className="bg-white w-[210mm] h-[297mm] shadow-lg relative print:shadow-none overflow-hidden print:w-full print:h-full">
                                {systemConfig.garagePermitTemplate.useCustomTemplate && systemConfig.garagePermitTemplate.backgroundImage ? (
                                    <>
                                        {/* Background Image Layer */}
                                        <img 
                                            src={systemConfig.garagePermitTemplate.backgroundImage} 
                                            className="absolute inset-0 w-full h-full object-cover z-0" 
                                            alt="Permit Template"
                                        />
                                        
                                        {/* Dynamic Data Overlay */}
                                        <div className="absolute inset-0 z-10 text-slate-900">
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
                                            {renderPrintField('gOwnerPhone', viewingPermit.garageOwnerContact)}
                                            {renderPrintField('authorizedBy', viewingPermit.authorizedBy || '_________________')}
                                            {renderPrintField('checkedBy', viewingPermit.checkedBy || '_________________')}
                                            {renderPrintField('notes', viewingPermit.notes || '')}
                                        </div>
                                    </>
                                ) : (
                                    // Fallback Default Template
                                    <div className="p-16 h-full flex flex-col text-slate-900">
                                        <div className="text-center border-b-2 border-slate-900 pb-8 mb-8">
                                            <h1 className="text-2xl font-black uppercase tracking-widest mb-2 whitespace-pre-wrap">{systemConfig.garagePermitTemplate.header || `${systemConfig.secretariatName} ${systemConfig.councilName}`}</h1>
                                            <div className="mt-6 inline-block border-2 border-slate-900 px-8 py-3">
                                                <h2 className="text-xl font-bold uppercase tracking-widest">{systemConfig.garagePermitTemplate.title}</h2>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-end mb-8">
                                            <div className="text-sm">
                                                <p><span className="font-bold uppercase w-32 inline-block">Permit ID:</span> <span className="font-mono text-lg font-bold">{viewingPermit.permitId}</span></p>
                                                <p><span className="font-bold uppercase w-32 inline-block">Issue Date:</span> {new Date(viewingPermit.issueDate).toLocaleDateString()}</p>
                                            </div>
                                            <div className="w-24 h-24 border-2 border-slate-900 flex items-center justify-center text-xs text-center p-2 font-bold uppercase text-slate-400">
                                                Official Stamp
                                            </div>
                                        </div>

                                        <div className="mb-8 text-sm leading-relaxed text-justify">
                                            {systemConfig.garagePermitTemplate.declaration}
                                        </div>

                                        <div className="grid grid-cols-2 gap-12 mb-8">
                                            <div>
                                                <h3 className="font-bold uppercase border-b border-slate-900 mb-4 pb-1">Vehicle Details</h3>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1">
                                                        <span>Registry No:</span> <span className="font-bold font-mono">{viewingPermit.vehicleRegistryNumber}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1">
                                                        <span>Chassis No:</span> <span className="font-mono">{viewingPermit.vehicleChassisNumber}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1">
                                                        <span>Owner:</span> <span className="font-bold">{viewingPermit.vehicleOwnerName}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1">
                                                        <span>ID Card:</span> <span>{viewingPermit.vehicleOwnerId}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-bold uppercase border-b border-slate-900 mb-4 pb-1">Garage Details</h3>
                                                <div className="space-y-2 text-sm">
                                                     <div className="flex justify-between border-b border-dotted border-slate-400 pb-1">
                                                        <span>House Reg:</span> <span className="font-bold font-mono">{viewingPermit.houseRegistryNumber}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1">
                                                        <span>Address:</span> <span>{viewingPermit.garageAddress}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1">
                                                        <span>Owner:</span> <span className="font-bold">{viewingPermit.garageOwnerName}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1">
                                                        <span>Size:</span> <span>{viewingPermit.garageSizeSqft} Sqft</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-8 border-t-2 border-slate-900">
                                            <div className="grid grid-cols-2 gap-20">
                                                <div>
                                                    <p className="text-xs font-bold uppercase mb-8">Checked By:</p>
                                                    <p className="border-b border-slate-900 font-bold">{viewingPermit.checkedBy}</p>
                                                    <p className="text-[10px] mt-1 uppercase">Name & Signature</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold uppercase mb-8">Authorized By:</p>
                                                    <p className="border-b border-slate-900 font-bold">{viewingPermit.authorizedBy}</p>
                                                    <p className="text-[10px] mt-1 uppercase">Executive Secretary / President</p>
                                                </div>
                                            </div>
                                            <div className="text-center text-[10px] text-slate-500 mt-8">
                                                {systemConfig.garagePermitTemplate.footer}
                                            </div>
                                        </div>
                                    </div>
                                )}
                             </div>
                         </div>
                         <style>{`
                            @media print {
                                body * { visibility: hidden; }
                                #print-area, #print-area * { visibility: visible; }
                                #print-area { 
                                    position: absolute; 
                                    left: 0; 
                                    top: 0; 
                                    width: 100%; 
                                    height: 100%; 
                                    margin: 0; 
                                    padding: 0;
                                    background: white;
                                }
                                @page { size: A4; margin: 0; }
                            }
                        `}</style>
                     </div>
                </div>
            )}
        </div>
    );
};

export default GaragePermitRegistry;
