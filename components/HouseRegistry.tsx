import React, { useState } from 'react';
import { House } from '../types';
import { Search, Home, Plus, MapPin, Users, Phone, FileCheck, AlertTriangle, Clock, X } from 'lucide-react';

interface HouseRegistryProps {
    houses: House[];
    onAddHouse: (house: House) => void;
}

const HouseRegistry: React.FC<HouseRegistryProps> = ({ houses, onAddHouse }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newHouse, setNewHouse] = useState<Partial<House>>({
        houseName: '',
        ownerName: '',
        address: '',
        islandZone: 'North',
        inhabitants: 0,
        permitStatus: 'Valid',
        contactNumber: ''
    });

    const filteredHouses = houses.filter(h => 
        h.houseName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        h.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const house: House = {
            id: `H-${Math.floor(Math.random() * 10000)}`,
            houseName: newHouse.houseName!,
            ownerName: newHouse.ownerName!,
            address: newHouse.address!,
            islandZone: newHouse.islandZone!,
            inhabitants: Number(newHouse.inhabitants),
            permitStatus: newHouse.permitStatus as 'Valid' | 'Expired' | 'Pending',
            contactNumber: newHouse.contactNumber!,
            constructionDate: new Date().toISOString()
        };
        onAddHouse(house);
        setIsAdding(false);
        setNewHouse({ houseName: '', ownerName: '', address: '', islandZone: 'North', inhabitants: 0, permitStatus: 'Valid', contactNumber: '' });
    };

    const getPermitBadge = (status: string) => {
        if (status === 'Valid') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200"><FileCheck size={12} className="mr-1"/> Valid</span>;
        if (status === 'Expired') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"><AlertTriangle size={12} className="mr-1"/> Expired</span>;
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"><Clock size={12} className="mr-1"/> Pending</span>;
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">House Registry</h2>
                    <p className="text-sm text-slate-500">Manage island residency and land permits.</p>
                </div>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Plus size={16} />
                    Register House
                </button>
            </div>

            {/* Filters */}
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                    type="text" 
                    placeholder="Search by House Name, Owner, or Address..." 
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                     <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">Register New House</h3>
                            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">House Name</label>
                                <input required type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
                                    value={newHouse.houseName} onChange={e => setNewHouse({...newHouse, houseName: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Owner Full Name</label>
                                <input required type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
                                    value={newHouse.ownerName} onChange={e => setNewHouse({...newHouse, ownerName: e.target.value})} />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Island Zone</label>
                                    <select className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none"
                                        value={newHouse.islandZone} onChange={e => setNewHouse({...newHouse, islandZone: e.target.value})}>
                                        <option>North</option>
                                        <option>South</option>
                                        <option>East</option>
                                        <option>West</option>
                                        <option>Central</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Inhabitants</label>
                                    <input required type="number" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
                                        value={newHouse.inhabitants} onChange={e => setNewHouse({...newHouse, inhabitants: Number(e.target.value)})} />
                                </div>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address / Plot No</label>
                                <input required type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
                                    value={newHouse.address} onChange={e => setNewHouse({...newHouse, address: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Permit Status</label>
                                    <select className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none"
                                        value={newHouse.permitStatus} onChange={e => setNewHouse({...newHouse, permitStatus: e.target.value as any})}>
                                        <option>Valid</option>
                                        <option>Pending</option>
                                        <option>Expired</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact No</label>
                                    <input required type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
                                        value={newHouse.contactNumber} onChange={e => setNewHouse({...newHouse, contactNumber: e.target.value})} />
                                </div>
                             </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded hover:bg-teal-700">Register House</button>
                            </div>
                        </form>
                     </div>
                </div>
            )}

            {/* List */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                 <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">House Details</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Owner</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Residents</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Zone</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Permit</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredHouses.map((house) => (
                            <tr key={house.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-teal-50 p-2 rounded-lg text-teal-600">
                                            <Home size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900">{house.houseName}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                <MapPin size={10} /> {house.address}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-slate-900">{house.ownerName}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                        <Phone size={10} /> {house.contactNumber}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-1 text-sm text-slate-600">
                                        <Users size={14} className="text-slate-400" />
                                        {house.inhabitants}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                                        {house.islandZone} Zone
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getPermitBadge(house.permitStatus)}
                                </td>
                            </tr>
                        ))}
                         {filteredHouses.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-slate-500 italic">
                                    No houses found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                 </table>
            </div>
        </div>
    );
};

export default HouseRegistry;
