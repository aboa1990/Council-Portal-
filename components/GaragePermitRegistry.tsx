import React, { useState } from 'react';
import { GaragePermit } from '../types';
import { Search, Plus, X, Car, User, MapPin, FileText, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface GaragePermitRegistryProps {
    permits: GaragePermit[];
    onAddPermit: (permit: GaragePermit) => void;
}

const OFFICE_CODE = "258";

const GaragePermitRegistry: React.FC<GaragePermitRegistryProps> = ({ permits, onAddPermit }) => {
    const { t, isRTL } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Initial State for New Permit
    const initialPermitState: Partial<GaragePermit> = {
        permitId: '',
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        status: 'Active',
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
        garageOwnerContact: ''
    };

    const [newPermit, setNewPermit] = useState<Partial<GaragePermit>>(initialPermitState);

    // Dynamic ID Generation
    const getNextPermitId = () => {
        const currentYear = new Date().getFullYear();
        // Filter permits for current year
        const currentYearPermits = permits.filter(p => p.permitId.includes(`/${currentYear}/`));
        const count = currentYearPermits.length + 1;
        // Format: 258/2026/04
        return `${OFFICE_CODE}/${currentYear}/${String(count).padStart(2, '0')}`;
    };

    const handleAddClick = () => {
        const nextId = getNextPermitId();
        setNewPermit({ ...initialPermitState, permitId: nextId });
        setIsAdding(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Recalculate ID just in case to avoid collision (optimistic UI)
        const finalId = getNextPermitId();
        const permitToAdd = { ...newPermit, permitId: finalId } as GaragePermit;
        onAddPermit(permitToAdd);
        setIsAdding(false);
    };

    const filteredPermits = permits.filter(p => 
        p.permitId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.vehicleRegistryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.vehicleOwnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.vehicleChassisNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{t('garage_title')}</h2>
                    <p className="text-sm text-slate-500">{t('garage_subtitle')}</p>
                </div>
                <button 
                    onClick={handleAddClick}
                    className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Plus size={16} />
                    {t('new_permit')}
                </button>
            </div>

            {/* Search */}
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

            {/* List */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-bold text-slate-500 uppercase tracking-wider`}>{t('permit_id')}</th>
                                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-bold text-slate-500 uppercase tracking-wider`}>{t('vehicle_details')}</th>
                                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-bold text-slate-500 uppercase tracking-wider`}>{t('vehicle_owner')}</th>
                                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-bold text-slate-500 uppercase tracking-wider`}>{t('garage_details')}</th>
                                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-bold text-slate-500 uppercase tracking-wider`}>{t('status')}</th>
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
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-medium text-slate-900 flex items-center gap-1">
                                                <Car size={14} className="text-slate-400"/> {permit.vehicleRegistryNumber}
                                            </span>
                                            <span className="text-xs text-slate-500 font-mono">VIN: {permit.vehicleChassisNumber}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm text-slate-900">{permit.vehicleOwnerName}</span>
                                            <span className="text-xs text-slate-500">{permit.vehicleOwnerContact}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm text-slate-900">{permit.garageAddress}</span>
                                            <span className="text-xs text-slate-500">{permit.garageOwnerName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {permit.status === 'Active' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                <CheckCircle size={12} className="mr-1"/> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                <AlertCircle size={12} className="mr-1"/> {permit.status}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredPermits.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500 italic">
                                        No garage permits found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Permit Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <h3 className="font-bold text-lg text-slate-800">{t('new_permit')}</h3>
                            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-8 flex-1">
                            
                            {/* Section 0: Permit Info */}
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('permit_id')}</label>
                                        <input type="text" readOnly value={newPermit.permitId} className="w-full border border-teal-300 bg-teal-50 text-teal-900 font-mono font-bold rounded px-3 py-2 text-sm outline-none" />
                                        <p className="text-[10px] text-slate-400 mt-1">Auto-generated: Office/Year/Sequence</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('issue_date')}</label>
                                        <input type="date" required value={newPermit.issueDate} onChange={e => setNewPermit({...newPermit, issueDate: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('expiry_date')}</label>
                                        <input type="date" required value={newPermit.expiryDate} onChange={e => setNewPermit({...newPermit, expiryDate: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Section 1 & 2: Vehicle & Owner */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <Car size={18} className="text-teal-600"/> {t('vehicle_details')}
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('registry_no')}</label>
                                            <input type="text" required placeholder="e.g. C-1020" value={newPermit.vehicleRegistryNumber} onChange={e => setNewPermit({...newPermit, vehicleRegistryNumber: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('chassis_no')}</label>
                                            <input type="text" required placeholder="e.g. CHS-12345678" value={newPermit.vehicleChassisNumber} onChange={e => setNewPermit({...newPermit, vehicleChassisNumber: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500" />
                                        </div>
                                    </div>

                                    <h4 className="font-bold text-slate-800 mb-4 mt-8 flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <User size={18} className="text-teal-600"/> {t('vehicle_owner')}
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('owner_name')}</label>
                                            <input type="text" required value={newPermit.vehicleOwnerName} onChange={e => setNewPermit({...newPermit, vehicleOwnerName: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('owner_address')}</label>
                                            <input type="text" required placeholder="Atoll, Island, House" value={newPermit.vehicleOwnerAddress} onChange={e => setNewPermit({...newPermit, vehicleOwnerAddress: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('owner_id')}</label>
                                                <input type="text" required value={newPermit.vehicleOwnerId} onChange={e => setNewPermit({...newPermit, vehicleOwnerId: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('contact_no')}</label>
                                                <input type="text" required value={newPermit.vehicleOwnerContact} onChange={e => setNewPermit({...newPermit, vehicleOwnerContact: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3 & 4: Garage & Owner */}
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <MapPin size={18} className="text-teal-600"/> {t('garage_details')}
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('garage_address')}</label>
                                            <input type="text" required value={newPermit.garageAddress} onChange={e => setNewPermit({...newPermit, garageAddress: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('garage_size')}</label>
                                                <input type="number" required value={newPermit.garageSizeSqft} onChange={e => setNewPermit({...newPermit, garageSizeSqft: Number(e.target.value)})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('house_reg_no')}</label>
                                                <input type="text" required value={newPermit.houseRegistryNumber} onChange={e => setNewPermit({...newPermit, houseRegistryNumber: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500" />
                                            </div>
                                        </div>
                                    </div>

                                    <h4 className="font-bold text-slate-800 mb-4 mt-8 flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <User size={18} className="text-teal-600"/> {t('garage_owner')}
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('owner_name')}</label>
                                            <input type="text" required value={newPermit.garageOwnerName} onChange={e => setNewPermit({...newPermit, garageOwnerName: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('owner_address')}</label>
                                            <input type="text" required placeholder="Atoll, Island, House" value={newPermit.garageOwnerAddress} onChange={e => setNewPermit({...newPermit, garageOwnerAddress: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('owner_id')}</label>
                                                <input type="text" required value={newPermit.garageOwnerId} onChange={e => setNewPermit({...newPermit, garageOwnerId: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('contact_no')}</label>
                                                <input type="text" required value={newPermit.garageOwnerContact} onChange={e => setNewPermit({...newPermit, garageOwnerContact: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
                                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">{t('cancel')}</button>
                                <button type="submit" className="px-6 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 shadow-sm">{t('new_permit')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GaragePermitRegistry;