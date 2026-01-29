import React, { useState, useRef } from 'react';
import { User, UserRole, AssetCategory, AssetStatusConfig, SystemConfig } from '../types';
import { UserCircle, Upload, Save, Plus, Trash2, Shield, Mail, Check, Camera, X, Layers, Activity, Globe, Key, FileBadge, Briefcase, UserSquare2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  assetCategories?: AssetCategory[];
  onUpdateCategories?: (categories: AssetCategory[]) => void;
  assetStatuses?: AssetStatusConfig[];
  onUpdateStatuses?: (statuses: AssetStatusConfig[]) => void;
  systemConfig?: SystemConfig;
  onUpdateSystemConfig?: (config: SystemConfig) => void;
}

const MOCK_STAFF_LIST: User[] = [
    { id: 'USR-001', name: 'Ahmed Riza', role: 'Admin', email: 'ahmed.riza@council.gov.mv', designation: 'Council President', idNo: 'A000001', rcNo: 'RC-101', sex: 'Male' },
    { id: 'USR-002', name: 'Fathimath Nazeer', role: 'Secretary General', email: 'f.nazeer@council.gov.mv', designation: 'SG', idNo: 'A000002', rcNo: 'RC-102', sex: 'Female' },
    { id: 'USR-003', name: 'Ali Shiyam', role: 'Staff', email: 'ali.shiyam@council.gov.mv', designation: 'Admin Officer', idNo: 'A000003', rcNo: 'RC-103', sex: 'Male' },
];

const COLORS = [
    { name: 'Emerald', class: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { name: 'Blue', class: 'bg-blue-100 text-blue-800 border-blue-200' },
    { name: 'Amber', class: 'bg-amber-100 text-amber-800 border-amber-200' },
    { name: 'Red', class: 'bg-red-100 text-red-800 border-red-200' },
    { name: 'Purple', class: 'bg-purple-100 text-purple-800 border-purple-200' },
    { name: 'Gray', class: 'bg-slate-100 text-slate-800 border-slate-200' },
];

const Settings: React.FC<SettingsProps> = ({ currentUser, onUpdateUser, assetCategories = [], onUpdateCategories, assetStatuses = [], onUpdateStatuses, systemConfig, onUpdateSystemConfig }) => {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'general' | 'profile' | 'staff' | 'config'>('profile');
  
  // Profile State
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // General Settings State
  const [localSystemConfig, setLocalSystemConfig] = useState<SystemConfig>(systemConfig || { councilName: '', secretariatName: '' });
  const [generalSuccess, setGeneralSuccess] = useState(false);

  // Staff State
  const [staffList, setStaffList] = useState<User[]>(MOCK_STAFF_LIST);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  
  const initialNewStaffState: Partial<User> = { 
      name: '', 
      email: '', 
      role: 'Staff', 
      password: '',
      sex: 'Male',
      rcNo: '',
      designation: '',
      idNo: ''
  };
  const [newStaff, setNewStaff] = useState<Partial<User>>(initialNewStaffState);

  // Config State
  const [localCategories, setLocalCategories] = useState<AssetCategory[]>(assetCategories);
  const [localStatuses, setLocalStatuses] = useState<AssetStatusConfig[]>(assetStatuses);
  const [configSuccess, setConfigSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setAvatar(url);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ ...currentUser, name, email, avatar });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
      e.preventDefault();
      if (onUpdateSystemConfig) {
          onUpdateSystemConfig(localSystemConfig);
          setGeneralSuccess(true);
          setTimeout(() => setGeneralSuccess(false), 3000);
      }
  };

  const handleAddStaff = (e: React.FormEvent) => {
      e.preventDefault();
      const staff: User = {
          id: `USR-${Math.floor(Math.random() * 10000)}`,
          name: newStaff.name || 'Unknown',
          email: newStaff.email,
          role: newStaff.role as UserRole,
          password: newStaff.password,
          sex: newStaff.sex as 'Male' | 'Female',
          rcNo: newStaff.rcNo,
          designation: newStaff.designation,
          idNo: newStaff.idNo
      };
      setStaffList([...staffList, staff]);
      setIsAddingStaff(false);
      setNewStaff(initialNewStaffState);
  };

  const handleDeleteStaff = (id: string) => {
      if(confirm('Are you sure you want to remove this staff member?')) {
          setStaffList(staffList.filter(s => s.id !== id));
      }
  };

  const handleCategoryChange = (id: string, field: 'name' | 'code', value: string) => {
      setLocalCategories(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleStatusChange = (id: string, field: 'name' | 'color', value: string) => {
      setLocalStatuses(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleAddCategory = () => {
      const newId = `cat_${Date.now()}`;
      setLocalCategories([...localCategories, { id: newId, name: 'New Category', code: '99' }]);
  };

  const handleAddStatus = () => {
      const newId = `sts_${Date.now()}`;
      setLocalStatuses([...localStatuses, { id: newId, name: 'New Status', color: COLORS[5].class }]);
  };

  const handleDeleteCategory = (id: string) => {
      setLocalCategories(localCategories.filter(c => c.id !== id));
  };

  const handleDeleteStatus = (id: string) => {
      setLocalStatuses(localStatuses.filter(s => s.id !== id));
  };

  const handleSaveConfig = () => {
      if (onUpdateCategories) onUpdateCategories(localCategories);
      if (onUpdateStatuses) onUpdateStatuses(localStatuses);
      setConfigSuccess(true);
      setTimeout(() => setConfigSuccess(false), 3000);
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl mx-auto">
        
        {/* Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto">
             <button 
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'profile' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <UserCircle size={18} />
                {t('tab_profile')}
            </button>
            {(currentUser.role === 'Admin') && (
                 <button 
                    onClick={() => setActiveTab('general')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'general' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Globe size={18} />
                    {t('tab_general')}
                </button>
            )}
            {(currentUser.role === 'Admin' || currentUser.role === 'Secretary General') && (
                 <button 
                    onClick={() => setActiveTab('staff')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'staff' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Shield size={18} />
                    {t('tab_staff')}
                </button>
            )}
             {(currentUser.role === 'Admin') && (
                 <button 
                    onClick={() => {
                        setActiveTab('config');
                        setLocalCategories(assetCategories);
                        setLocalStatuses(assetStatuses);
                    }}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'config' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Layers size={18} />
                    {t('tab_config')}
                </button>
            )}
        </div>

        {activeTab === 'general' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                 <h2 className="text-xl font-bold text-slate-900">{t('tab_general')}</h2>
                 <p className="text-sm text-slate-500 mb-6">{t('general_subtitle')}</p>
                 <form onSubmit={handleSaveGeneral} className="space-y-6 max-w-2xl">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('council_name_label')}</label>
                        <input 
                            type="text" 
                            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                            value={localSystemConfig.councilName}
                            onChange={(e) => setLocalSystemConfig({...localSystemConfig, councilName: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('secretariat_label')}</label>
                         <input 
                            type="text" 
                            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                            value={localSystemConfig.secretariatName}
                            onChange={(e) => setLocalSystemConfig({...localSystemConfig, secretariatName: e.target.value})}
                        />
                     </div>
                     <div className="pt-4 flex items-center gap-4">
                         <button 
                            type="submit"
                            className="bg-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"
                        >
                            <Save size={18} />
                            Save Configuration
                        </button>
                        {generalSuccess && (
                            <span className="text-emerald-600 flex items-center gap-1 text-sm animate-fade-in">
                                <Check size={16} /> Updated successfully
                            </span>
                        )}
                     </div>
                 </form>
            </div>
        )}

        {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">{t('tab_profile')}</h2>
                <form onSubmit={handleSaveProfile} className="space-y-8">
                    
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 bg-slate-50 flex items-center justify-center">
                                    {avatar ? (
                                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserCircle size={64} className="text-slate-300" />
                                    )}
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 bg-teal-600 text-white p-2 rounded-full shadow-lg hover:bg-teal-700 transition-colors"
                                >
                                    <Camera size={16} />
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    className="hidden" 
                                    accept="image/*"
                                />
                            </div>
                            <span className="text-xs text-slate-500">Allowed *.jpeg, *.jpg, *.png</span>
                        </div>

                        {/* Fields */}
                        <div className="flex-1 w-full space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="user@council.gov.mv"
                                        className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                <input 
                                    type="text" 
                                    value={currentUser.role}
                                    disabled
                                    className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-lg px-4 py-2 capitalize cursor-not-allowed"
                                />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                                    <input 
                                        type="text" 
                                        value={currentUser.designation || ''}
                                        disabled
                                        className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-lg px-4 py-2 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Staff ID / ID Card</label>
                                    <input 
                                        type="text" 
                                        value={currentUser.idNo || ''}
                                        disabled
                                        className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-lg px-4 py-2 cursor-not-allowed"
                                    />
                                </div>
                             </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center gap-4">
                        <button 
                            type="submit"
                            className="bg-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"
                        >
                            <Save size={18} />
                            Save Changes
                        </button>
                        {showSuccess && (
                            <span className="text-emerald-600 flex items-center gap-1 text-sm animate-fade-in">
                                <Check size={16} /> Saved successfully
                            </span>
                        )}
                    </div>
                </form>
            </div>
        )}

        {activeTab === 'staff' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Staff Directory</h2>
                        <p className="text-sm text-slate-500">Manage portal access and roles.</p>
                    </div>
                    <button 
                        onClick={() => setIsAddingStaff(true)}
                        className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Add Staff
                    </button>
                </div>

                {isAddingStaff && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 animate-in slide-in-from-top-2">
                         <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                             <UserSquare2 size={18}/>
                             New Staff Registration
                         </h3>
                         <form onSubmit={handleAddStaff} className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                                    <input required type="text" placeholder="e.g. Ibrahim Ali" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                                    <input required type="email" placeholder="email@council.gov.mv" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
                                </div>
                                 <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Key size={14} />
                                        </div>
                                        <input required type="password" placeholder="••••••" className="w-full border border-slate-300 rounded-md pl-9 pr-3 py-2 text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none" value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} />
                                    </div>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                                    <select className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none" value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value as UserRole})}>
                                        <option value="Staff">Staff</option>
                                        <option value="Supervisor">Supervisor</option>
                                        <option value="Secretary General">Secretary General</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                             </div>
                             
                             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sex</label>
                                    <select className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none" value={newStaff.sex} onChange={e => setNewStaff({...newStaff, sex: e.target.value as 'Male' | 'Female'})}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">RC No</label>
                                    <div className="relative">
                                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <FileBadge size={14} />
                                        </div>
                                        <input required type="text" placeholder="RC-XXXX" className="w-full border border-slate-300 rounded-md pl-9 pr-3 py-2 text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none" value={newStaff.rcNo} onChange={e => setNewStaff({...newStaff, rcNo: e.target.value})} />
                                    </div>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Designation</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Briefcase size={14} />
                                        </div>
                                        <input required type="text" placeholder="e.g. Officer" className="w-full border border-slate-300 rounded-md pl-9 pr-3 py-2 text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none" value={newStaff.designation} onChange={e => setNewStaff({...newStaff, designation: e.target.value})} />
                                    </div>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ID Card No</label>
                                    <input required type="text" placeholder="AXXXXXX" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none" value={newStaff.idNo} onChange={e => setNewStaff({...newStaff, idNo: e.target.value})} />
                                </div>
                             </div>

                             <div className="flex gap-2 pt-2 justify-end">
                                <button type="button" onClick={() => setIsAddingStaff(false)} className="px-4 py-2 border border-slate-300 rounded-md text-slate-600 hover:bg-white text-sm">Cancel</button>
                                <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-teal-700">Register Staff</button>
                            </div>
                         </form>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Staff Member</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Role / Designation</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">ID Info</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {staffList.map((staff) => (
                                <tr key={staff.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
                                                {staff.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-900">{staff.name}</div>
                                                <div className="text-xs text-slate-500">{staff.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                                                staff.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                                                staff.role === 'Secretary General' ? 'bg-indigo-100 text-indigo-700' :
                                                staff.role === 'Supervisor' ? 'bg-blue-100 text-blue-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                                {staff.role}
                                            </span>
                                            <span className="text-xs text-slate-500 ml-1">{staff.designation || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        <div className="flex flex-col text-xs">
                                            <span>ID: {staff.idNo || '-'}</span>
                                            <span>RC: {staff.rcNo || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button 
                                            onClick={() => handleDeleteStaff(staff.id)}
                                            className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'config' && (
            <div className="space-y-8">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Layers size={20} className="text-teal-600"/> 
                                {t('section_categories')}
                            </h2>
                        </div>
                        <button onClick={handleAddCategory} className="text-sm text-teal-600 font-medium hover:text-teal-800 flex items-center gap-1">
                            <Plus size={16}/> {t('add_item')}
                        </button>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                         <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-bold text-slate-500 uppercase`}>{t('cat_name')}</th>
                                    <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-bold text-slate-500 uppercase`}>{t('cat_code')}</th>
                                    <th className="px-6 py-3 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {localCategories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <input 
                                                type="text" 
                                                className="border border-slate-300 rounded px-2 py-1 text-sm w-full max-w-xs focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                                                value={cat.name}
                                                onChange={(e) => handleCategoryChange(cat.id, 'name', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap">
                                             <input 
                                                type="text" 
                                                className="border border-slate-300 rounded px-2 py-1 text-sm w-20 font-mono bg-white focus:ring-1 focus:ring-teal-500 outline-none"
                                                value={cat.code}
                                                onChange={(e) => handleCategoryChange(cat.id, 'code', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <button onClick={() => handleDeleteCategory(cat.id)} className="text-slate-400 hover:text-red-500">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                         </table>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Activity size={20} className="text-teal-600"/> 
                                {t('section_statuses')}
                            </h2>
                        </div>
                        <button onClick={handleAddStatus} className="text-sm text-teal-600 font-medium hover:text-teal-800 flex items-center gap-1">
                            <Plus size={16}/> {t('add_item')}
                        </button>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                         <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-bold text-slate-500 uppercase`}>{t('status_name')}</th>
                                    <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-bold text-slate-500 uppercase`}>{t('status_color')}</th>
                                    <th className="px-6 py-3 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {localStatuses.map((sts) => (
                                    <tr key={sts.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <input 
                                                type="text" 
                                                className="border border-slate-300 rounded px-2 py-1 text-sm w-full max-w-xs focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                                                value={sts.name}
                                                onChange={(e) => handleStatusChange(sts.id, 'name', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap">
                                             <select 
                                                className={`border border-slate-300 rounded px-2 py-1 text-xs w-40 focus:ring-1 focus:ring-teal-500 outline-none cursor-pointer ${sts.color}`}
                                                value={sts.color}
                                                onChange={(e) => handleStatusChange(sts.id, 'color', e.target.value)}
                                            >
                                                {COLORS.map(c => <option key={c.name} value={c.class}>{c.name}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <button onClick={() => handleDeleteStatus(sts.id)} className="text-slate-400 hover:text-red-500">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                         </table>
                    </div>
                </div>

                 <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex justify-end">
                      <button 
                        onClick={handleSaveConfig}
                        className="bg-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"
                    >
                        <Save size={18} />
                        {t('update')}
                    </button>
                 </div>

                 {configSuccess && (
                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                        <Check size={20} />
                        Configuration updated successfully.
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default Settings;