
import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole, AssetCategory, AssetStatusConfig, SystemConfig, TemplateFieldPos, AccessLog } from '../types';
// Fixed: Added User as UserIcon to imports from lucide-react to resolve the error on line 275
import { UserCircle, Upload, Save, Plus, Trash2, Shield, Mail, Check, Camera, X, Layers, Activity, Globe, Key, FileBadge, Briefcase, UserSquare2, FileText, Layout, Move, Settings as SettingsIcon, Eye, Type, Bold, Info, Lock, History, UserPlus, Search, Phone, MapPin, BadgeCheck, Fingerprint, Users, Pencil, Hash, ShieldAlert, ShieldCheck, CheckCircle2, User as UserIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  staffMembers?: User[];
  onUpdateStaff?: (staff: User[]) => void;
  onAddAccessLog?: (action: string, details: string) => void;
  accessLogs?: AccessLog[];
  assetCategories?: AssetCategory[];
  onUpdateCategories?: (categories: AssetCategory[]) => void;
  assetStatuses?: AssetStatusConfig[];
  onUpdateStatuses?: (statuses: AssetStatusConfig[]) => void;
  systemConfig?: SystemConfig;
  onUpdateSystemConfig?: (config: SystemConfig) => void;
}

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  'Admin': ['Full Access', 'System Configuration', 'Access Logs', 'Staff Management', 'Asset Registry', 'Analytics', 'House Registry', 'Garage Permits'],
  'Executive': ['Asset Management', 'Analytics', 'House Registry', 'Garage Permits', 'Request Triage', 'Permit Templates'],
  'Senior Management': ['Asset Registry (View)', 'House Registry', 'Garage Permits', 'Request Management'],
  'Staff': ['House Registry', 'Garage Permits', 'Request Handling']
};

const Settings: React.FC<SettingsProps> = ({ currentUser, onUpdateUser, staffMembers = [], onUpdateStaff, onAddAccessLog, accessLogs = [], assetCategories = [], onUpdateCategories, assetStatuses = [], onUpdateStatuses, systemConfig, onUpdateSystemConfig }) => {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'general' | 'profile' | 'staff' | 'logs' | 'config' | 'permit-template'>('profile');
  
  // Profile State
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const staffPhotoInputRef = useRef<HTMLInputElement>(null);
  const templateInputRef = useRef<HTMLInputElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Staff Management State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffSearch, setStaffSearch] = useState('');
  const [newStaff, setNewStaff] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'Staff',
    password: '',
    designation: '',
    address: '',
    rcNo: '',
    idNo: ''
  });

  // General Settings State
  const [localSystemConfig, setLocalSystemConfig] = useState<SystemConfig>(systemConfig || { 
    councilName: '', 
    secretariatName: '',
    garagePermitTemplate: {
      title: 'GARAGE UTILIZATION PERMIT',
      header: '',
      footer: '',
      declaration: '',
      useCustomTemplate: false,
      fieldPositions: {}
    }
  });
  const [generalSuccess, setGeneralSuccess] = useState(false);

  useEffect(() => {
    if (systemConfig) setLocalSystemConfig(systemConfig);
  }, [systemConfig]);

  const [selectedField, setSelectedField] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => setAvatar(event.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleStaffPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => setNewStaff(prev => ({ ...prev, avatar: event.target?.result as string }));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setLocalSystemConfig(prev => ({
        ...prev,
        garagePermitTemplate: { ...prev.garagePermitTemplate, backgroundImage: event.target?.result as string, useCustomTemplate: true }
      }));
      reader.readAsDataURL(file);
    }
  };

  const updateField = (fieldName: string, updates: Partial<TemplateFieldPos>) => {
    setLocalSystemConfig(prev => ({
      ...prev,
      garagePermitTemplate: {
        ...prev.garagePermitTemplate,
        fieldPositions: {
          ...prev.garagePermitTemplate.fieldPositions,
          [fieldName]: { ...prev.garagePermitTemplate.fieldPositions[fieldName], ...updates }
        }
      }
    }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ ...currentUser, name, email, avatar });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSaveGeneral = (e: React.MouseEvent | React.FormEvent) => {
      e.preventDefault();
      if (onUpdateSystemConfig) {
          onUpdateSystemConfig(localSystemConfig);
          setGeneralSuccess(true);
          setTimeout(() => setGeneralSuccess(false), 3000);
      }
  };

  const openStaffModal = (staff?: User) => {
    if (staff) {
      setEditingStaffId(staff.id);
      setNewStaff(staff);
    } else {
      setEditingStaffId(null);
      setNewStaff({
        name: '', email: '', role: 'Staff', password: '', 
        designation: '', address: '', rcNo: '', idNo: '', 
        avatar: ''
      });
    }
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateStaff) return;

    if (editingStaffId) {
      const original = staffMembers.find(s => s.id === editingStaffId);
      if (original && original.role !== newStaff.role) {
        onAddAccessLog?.('Role Changed', `Role for ${newStaff.name} updated from ${original.role} to ${newStaff.role}`);
      }
      onUpdateStaff(staffMembers.map(s => s.id === editingStaffId ? { ...s, ...newStaff } as User : s));
    } else {
      const staffToAdd: User = {
        ...newStaff,
        id: `USR-${Math.floor(Math.random() * 1000)}`,
        joinedDate: new Date().toISOString().split('T')[0]
      } as User;
      onUpdateStaff([staffToAdd, ...staffMembers]);
      onAddAccessLog?.('Staff Added', `New staff member ${staffToAdd.name} registered as ${staffToAdd.role}`);
    }
    setIsStaffModalOpen(false);
  };

  const handleDeleteStaff = (id: string) => {
    if (id === currentUser.id) {
        alert("You cannot delete your own account.");
        return;
    }
    if (window.confirm("Permanently remove this staff member? This action cannot be undone.")) {
      const staff = staffMembers.find(s => s.id === id);
      onUpdateStaff?.(staffMembers.filter(s => s.id !== id));
      onAddAccessLog?.('Staff Removed', `Staff member ${staff?.name} removed from system.`);
    }
  };

  const filteredStaff = staffMembers.filter(s => 
    s.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
    s.designation?.toLowerCase().includes(staffSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(staffSearch.toLowerCase())
  );

  const getRoleColor = (role: UserRole) => {
    switch(role) {
      case 'Admin': return 'bg-red-100 text-red-700 border-red-200';
      case 'Executive': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Senior Management': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl mx-auto">
        <div className="flex border-b border-slate-200 overflow-x-auto">
             <button 
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'profile' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <UserCircle size={18} />
                {t('tab_profile')}
            </button>
            {(currentUser.role === 'Admin' || currentUser.role === 'Executive') && (
              <button 
                onClick={() => setActiveTab('staff')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'staff' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <Users size={18} />
                Staff Profiles
              </button>
            )}
            {(currentUser.role === 'Admin') && (
              <button 
                onClick={() => setActiveTab('logs')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'logs' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <History size={18} />
                Access Logs
              </button>
            )}
            {(currentUser.role === 'Admin') && (
                 <button 
                    onClick={() => setActiveTab('general')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'general' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Globe size={18} />
                    {t('tab_general')}
                </button>
            )}
            {(currentUser.role === 'Admin' || currentUser.role === 'Executive') && (
                 <button 
                    onClick={() => setActiveTab('permit-template')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'permit-template' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Layout size={18} />
                    Permit Template
                </button>
            )}
        </div>

        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Staff Management</h2>
                <p className="text-sm text-slate-500">Manage digital identities, roles and permission assignments for council staff.</p>
              </div>
              <button onClick={() => openStaffModal()} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20">
                <UserPlus size={18} /> Add New Staff
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search staff by name, designation or email..." 
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all shadow-sm"
                value={staffSearch}
                onChange={e => setStaffSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStaff.map(staff => (
                <div key={staff.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow relative">
                  {staff.id === currentUser.id && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 z-10">
                        <UserIcon size={10} /> SELF
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border-2 border-slate-50 group-hover:border-teal-100 transition-colors">
                        {staff.avatar ? (
                          <img src={staff.avatar} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300"><UserCircle size={40} /></div>
                        )}
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getRoleColor(staff.role)}`}>
                        {staff.role}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900">{staff.name}</h3>
                    <p className="text-sm text-teal-600 font-medium">{staff.designation}</p>
                    
                    <div className="mt-4 space-y-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2"><Mail size={14} className="opacity-60" /> {staff.email}</div>
                      <div className="flex items-center gap-2"><Fingerprint size={14} className="opacity-60" /> {staff.rcNo || 'No RC Number'}</div>
                    </div>
                  </div>
                  <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                    <button onClick={() => openStaffModal(staff)} className="p-1.5 text-slate-400 hover:text-teal-600 transition-colors" title="Edit Staff Profile"><Pencil size={16}/></button>
                    {staff.id !== currentUser.id && (
                      <button onClick={() => handleDeleteStaff(staff.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors" title="Remove Staff"><Trash2 size={16}/></button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {isStaffModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
                <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-black text-lg text-slate-800 uppercase tracking-tight">{editingStaffId ? 'Update Staff Profile' : 'Register New Staff'}</h3>
                    <button onClick={() => setIsStaffModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2"><X size={20}/></button>
                  </div>
                  <form onSubmit={handleSaveStaff} className="flex flex-col md:flex-row">
                    {/* Left Column: Profile Info */}
                    <div className="flex-1 p-8 space-y-6 border-r border-slate-100">
                        <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-3xl bg-slate-100 overflow-hidden border-2 border-slate-200 flex items-center justify-center">
                            {newStaff.avatar ? <img src={newStaff.avatar} className="w-full h-full object-cover" /> : <Camera className="text-slate-300" />}
                            </div>
                            <button type="button" onClick={() => staffPhotoInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-teal-600 text-white p-2 rounded-xl shadow-lg hover:bg-teal-700 transition-colors"><Plus size={16}/></button>
                            <input type="file" ref={staffPhotoInputRef} className="hidden" accept="image/*" onChange={handleStaffPhotoChange} />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Full Name</label>
                                <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Designation</label>
                                <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" value={newStaff.designation} onChange={e => setNewStaff({...newStaff, designation: e.target.value})} />
                            </div>
                        </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Email Address</label>
                            <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input required type="email" className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Login Password</label>
                            <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input required={!editingStaffId} type="password" placeholder={editingStaffId ? '•••••••• (Hidden)' : '••••••••'} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ID Card Number</label>
                            <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono" value={newStaff.idNo} onChange={e => setNewStaff({...newStaff, idNo: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Staff RC Code</label>
                            <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono" value={newStaff.rcNo} onChange={e => setNewStaff({...newStaff, rcNo: e.target.value})} />
                        </div>
                        </div>

                        <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Official Address</label>
                        <textarea required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 h-20 resize-none" value={newStaff.address} onChange={e => setNewStaff({...newStaff, address: e.target.value})} />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsStaffModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" className="px-8 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20">
                            {editingStaffId ? 'Update Staff' : 'Register Staff'}
                        </button>
                        </div>
                    </div>

                    {/* Right Column: Role & Permissions */}
                    <div className="w-full md:w-80 bg-slate-50 p-8 flex flex-col gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Staff Role Hierarchy</label>
                            <div className="space-y-2">
                                {(['Admin', 'Executive', 'Senior Management', 'Staff'] as UserRole[]).map(role => (
                                    <button 
                                        key={role}
                                        type="button"
                                        onClick={() => setNewStaff({...newStaff, role})}
                                        className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-between group ${newStaff.role === role ? 'bg-white border-teal-500 shadow-md ring-4 ring-teal-500/5' : 'bg-transparent border-slate-200 hover:border-slate-300'}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-bold ${newStaff.role === role ? 'text-teal-700' : 'text-slate-600'}`}>{role}</span>
                                            {role === 'Admin' && <span className="text-[9px] text-red-500 font-bold uppercase">Restricted</span>}
                                        </div>
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${newStaff.role === role ? 'border-teal-500 bg-teal-500' : 'border-slate-300 group-hover:border-slate-400'}`}>
                                            {newStaff.role === role && <Check size={10} className="text-white" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <ShieldCheck size={14} className="text-teal-500" />
                                {newStaff.role} Permissions
                            </h4>
                            <div className="space-y-2">
                                {ROLE_PERMISSIONS[newStaff.role as UserRole].map((perm, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-600">
                                        <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <span>{perm}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <p className="text-[10px] text-slate-400 italic leading-relaxed">
                                    {newStaff.role === 'Admin' ? 'This role has unrestricted power over the entire portal configuration.' : 
                                     newStaff.role === 'Staff' ? 'This role is intended for frontline operators with basic submission access.' :
                                     'Role permissions are pre-configured based on council policy.'}
                                </p>
                            </div>
                        </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">System Access Logs</h2>
              <p className="text-sm text-slate-500">Security audit trail tracking all user logins and critical system actions.</p>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Member</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {accessLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-900">{log.userName}</div>
                          <div className="text-[10px] text-slate-400">{log.userId}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRoleColor(log.role || 'Staff')}`}>
                            {log.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-black uppercase tracking-tight ${log.action.includes('Login') || log.action.includes('Added') ? 'text-emerald-600' : 'text-blue-600'}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{log.details}</td>
                      </tr>
                    ))}
                    {accessLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No access logs recorded in the current session.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'permit-template' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Custom Permit Template Designer</h2>
                        <p className="text-sm text-slate-500">Upload your council's official document template and position data fields precisely.</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        {generalSuccess && <span className="text-emerald-600 text-xs font-bold animate-fade-in">Saved!</span>}
                        <button 
                            onClick={() => templateInputRef.current?.click()}
                            className="bg-white border border-teal-600 text-teal-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-50 flex items-center gap-2"
                        >
                            <Upload size={16} /> Upload Background
                        </button>
                        <input type="file" ref={templateInputRef} onChange={handleTemplateUpload} className="hidden" accept="image/*" />
                        
                        <button 
                            onClick={handleSaveGeneral}
                            className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 flex items-center gap-2 shadow-lg shadow-teal-700/20"
                        >
                            <Save size={16} /> Save Template
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Visual Editor (Preview) */}
                    <div className="lg:col-span-8 bg-slate-100 rounded-xl p-4 border border-slate-200 flex items-center justify-center relative min-h-[700px]">
                        <div className="bg-white shadow-2xl relative w-[500px] h-[707px] origin-center scale-[0.9] lg:scale-100 overflow-hidden" id="template-preview-canvas">
                            {localSystemConfig.garagePermitTemplate.backgroundImage ? (
                                <img src={localSystemConfig.garagePermitTemplate.backgroundImage} className="absolute inset-0 w-full h-full object-cover" alt="Template" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-4 bg-slate-50">
                                    <Layout size={64} strokeWidth={1} />
                                    <p className="text-sm">Upload a background image to start designing</p>
                                </div>
                            )}

                            {/* Dynamic Fields Overlays */}
                            {(Object.entries(localSystemConfig.garagePermitTemplate.fieldPositions) as [string, TemplateFieldPos][]).map(([key, pos]) => (
                                pos.visible && (
                                    <div 
                                        key={key}
                                        onClick={() => setSelectedField(key)}
                                        className={`absolute cursor-pointer border px-1 select-none transition-all ${selectedField === key ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20 z-20 font-bold' : 'border-transparent hover:border-slate-300 z-10'}`}
                                        style={{ 
                                            top: `${pos.top}%`, 
                                            left: `${pos.left}%`, 
                                            fontSize: `${pos.fontSize}px`,
                                            fontWeight: pos.fontWeight || 'normal'
                                        }}
                                    >
                                        [{key.toUpperCase()}]
                                    </div>
                                )
                            ))}
                        </div>
                    </div>

                    {/* Field Controls */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-y-auto max-h-[700px]">
                            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 sticky top-0 bg-slate-50 py-2 z-10">
                                <SettingsIcon size={16} /> 
                                {selectedField ? `Editing: ${selectedField}` : 'Select a field to edit'}
                            </h3>

                            {selectedField ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-500">Top Position (%)</label>
                                            <input 
                                                type="number" 
                                                className="w-full border border-slate-300 rounded px-3 py-1 text-sm bg-white"
                                                value={localSystemConfig.garagePermitTemplate.fieldPositions[selectedField].top}
                                                onChange={(e) => updateField(selectedField, { top: Number(e.target.value) })}
                                            />
                                            <input type="range" min="0" max="100" step="0.1" className="w-full mt-2" 
                                                value={localSystemConfig.garagePermitTemplate.fieldPositions[selectedField].top}
                                                onChange={(e) => updateField(selectedField, { top: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-500">Left Position (%)</label>
                                            <input 
                                                type="number" 
                                                className="w-full border border-slate-300 rounded px-3 py-1 text-sm bg-white"
                                                value={localSystemConfig.garagePermitTemplate.fieldPositions[selectedField].left}
                                                onChange={(e) => updateField(selectedField, { left: Number(e.target.value) })}
                                            />
                                            <input type="range" min="0" max="100" step="0.1" className="w-full mt-2" 
                                                value={localSystemConfig.garagePermitTemplate.fieldPositions[selectedField].left}
                                                onChange={(e) => updateField(selectedField, { left: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-500">Font Size (px)</label>
                                            <input 
                                                type="number" 
                                                className="w-full border border-slate-300 rounded px-3 py-1 text-sm bg-white"
                                                value={localSystemConfig.garagePermitTemplate.fieldPositions[selectedField].fontSize}
                                                onChange={(e) => updateField(selectedField, { fontSize: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-500">Weight</label>
                                            <button 
                                                onClick={() => updateField(selectedField, { fontWeight: localSystemConfig.garagePermitTemplate.fieldPositions[selectedField].fontWeight === 'bold' ? 'normal' : 'bold' })}
                                                className={`w-full flex items-center justify-center gap-2 py-1.5 border rounded text-xs font-bold transition-colors ${localSystemConfig.garagePermitTemplate.fieldPositions[selectedField].fontWeight === 'bold' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-600'}`}
                                            >
                                                <Bold size={14} /> Bold
                                            </button>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => updateField(selectedField, { visible: false })}
                                        className="w-full py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-100 flex items-center justify-center gap-2"
                                    >
                                        <X size={14} /> Hide Field From Print
                                    </button>
                                </div>
                            ) : (
                                <div className="text-xs text-slate-400 italic text-center py-8">Click on a field label in the preview to adjust its position and size.</div>
                            )}
                            
                            <div className="mt-8 border-t pt-6">
                                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 sticky top-0 bg-slate-50 py-2 z-10">
                                    <Eye size={16} /> 
                                    Available Fields
                                </h3>
                                <div className="space-y-2">
                                    {Object.keys(localSystemConfig.garagePermitTemplate.fieldPositions).map(field => (
                                        <div key={field} className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${selectedField === field ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:bg-slate-50'}`} onClick={() => setSelectedField(field)}>
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{field}</span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); updateField(field, { visible: !localSystemConfig.garagePermitTemplate.fieldPositions[field].visible }); }}
                                                className={`p-1 rounded ${localSystemConfig.garagePermitTemplate.fieldPositions[field].visible ? 'text-teal-600 hover:bg-teal-50' : 'text-slate-300 hover:bg-slate-50'}`}
                                            >
                                                <Check size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-teal-50 rounded-lg border border-teal-100">
                            <h4 className="text-xs font-bold text-teal-800 mb-2 flex items-center gap-2"><Info size={14}/> Designer Guide</h4>
                            <p className="text-[11px] text-teal-700 leading-relaxed">
                                1. Upload high-res JPG/PNG of your official paper.<br/>
                                2. Click labels on the left to move them.<br/>
                                3. Toggle the checkmark to hide/show fields.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">{t('tab_profile')}</h2>
                <form onSubmit={handleSaveProfile} className="space-y-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 bg-slate-50 flex items-center justify-center">
                                    {avatar ? (
                                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserCircle size={64} className="text-slate-300" />
                                    )}
                                </div>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-teal-600 text-white p-2 rounded-full shadow-lg hover:bg-teal-700 transition-colors"><Camera size={16} /></button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            </div>
                        </div>
                        <div className="flex-1 w-full space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none bg-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none bg-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100 flex items-center gap-4">
                        <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"><Save size={18} /> Save Changes</button>
                        {showSuccess && <span className="text-emerald-600 flex items-center gap-1 text-sm"><Check size={16} /> Saved successfully</span>}
                    </div>
                </form>
            </div>
        )}

        {activeTab === 'general' && (
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
               <h2 className="text-xl font-bold text-slate-900 mb-2">{t('tab_general')}</h2>
               <p className="text-sm text-slate-500 mb-6">{t('general_subtitle')}</p>
               <form onSubmit={handleSaveGeneral} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">{t('council_name_label')}</label>
                           <input type="text" value={localSystemConfig.councilName} onChange={e => setLocalSystemConfig({...localSystemConfig, councilName: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none bg-white" />
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">{t('secretariat_label')}</label>
                           <input type="text" value={localSystemConfig.secretariatName} onChange={e => setLocalSystemConfig({...localSystemConfig, secretariatName: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none bg-white" />
                       </div>
                   </div>
                   <div className="pt-6 border-t border-slate-100 flex items-center gap-4">
                        <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"><Save size={18} /> {t('update')}</button>
                        {generalSuccess && <span className="text-emerald-600 flex items-center gap-1 text-sm"><Check size={16} /> Updated successfully</span>}
                    </div>
               </form>
           </div>
        )}
    </div>
  );
};

export default Settings;
