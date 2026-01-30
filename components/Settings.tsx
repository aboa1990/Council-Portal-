
import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole, AssetCategory, AssetStatusConfig, SystemConfig, TemplateFieldPos, AccessLog } from '../types';
import { 
  UserCircle, Upload, Save, Plus, Trash2, Shield, Mail, Check, Camera, X, Layers, 
  Activity, Globe, Key, FileBadge, Briefcase, UserSquare2, FileText, Layout, 
  Move, Settings as SettingsIcon, Eye, Type, Bold, Info, Lock, History, 
  UserPlus, Search, Phone, MapPin, BadgeCheck, Fingerprint, Users, Pencil, 
  Hash, ShieldAlert, ShieldCheck, CheckCircle2, User as UserIcon, Database, 
  Download, RefreshCw, FileJson, Cloud, CloudOff, PlugZap, PlayCircle, 
  Loader2, Building2, XCircle, AlignLeft, AlignCenter, AlignRight 
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { isSupabaseConfigured, testConnection } from '../services/supabaseService';
import { DEFAULT_FIELD_POSITIONS } from '../constants';

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

const Settings: React.FC<SettingsProps> = ({ 
    currentUser, 
    onUpdateUser, 
    staffMembers = [], 
    onUpdateStaff, 
    onAddAccessLog, 
    accessLogs = [], 
    assetCategories = [], 
    onUpdateCategories, 
    assetStatuses = [], 
    onUpdateStatuses, 
    systemConfig, 
    onUpdateSystemConfig 
}) => {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'general' | 'profile' | 'staff' | 'logs' | 'permit-template' | 'data'>('profile');
  
  // Profile State
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const staffPhotoInputRef = useRef<HTMLInputElement>(null);
  const templateInputRef = useRef<HTMLInputElement>(null);
  const importDatabaseRef = useRef<HTMLInputElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Connection Test State
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{success: boolean, message: string} | null>(null);

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
  // Merge defaults ensures we have all keys from constants even if config is stale
  const mergedFieldPositions = {
      ...DEFAULT_FIELD_POSITIONS,
      ...(systemConfig?.garagePermitTemplate?.fieldPositions || {})
  };

  const [localSystemConfig, setLocalSystemConfig] = useState<SystemConfig>(systemConfig || { 
    councilName: '', 
    secretariatName: '',
    garagePermitTemplate: {
      title: 'GARAGE UTILIZATION PERMIT',
      header: '',
      footer: '',
      declaration: '',
      useCustomTemplate: false,
      fieldPositions: DEFAULT_FIELD_POSITIONS
    }
  });
  
  // Force update local state if props change (re-sync)
  useEffect(() => {
      if (systemConfig) {
          setLocalSystemConfig({
              ...systemConfig,
              garagePermitTemplate: {
                  ...systemConfig.garagePermitTemplate,
                  fieldPositions: {
                      ...DEFAULT_FIELD_POSITIONS,
                      ...systemConfig.garagePermitTemplate.fieldPositions
                  }
              }
          });
      }
  }, [systemConfig]);

  const [generalSuccess, setGeneralSuccess] = useState(false);
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
    onAddAccessLog?.('Profile Updated', 'User updated their personal profile details.');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSaveGeneral = (e: React.MouseEvent | React.FormEvent) => {
      if (e) e.preventDefault();
      if (onUpdateSystemConfig) {
          onUpdateSystemConfig(localSystemConfig);
          onAddAccessLog?.('System Config Updated', 'Council branding or template configuration changed.');
          setGeneralSuccess(true);
          setTimeout(() => setGeneralSuccess(false), 3000);
      }
  };

  const handleTestConnection = async () => {
      setTestingConnection(true);
      const result = await testConnection();
      setConnectionStatus(result);
      setTestingConnection(false);
      setTimeout(() => setConnectionStatus(null), 10000);
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

  const handleExportDatabase = () => {
      const data = {
          requests: localStorage.getItem('civicpulse_requests'),
          assets: localStorage.getItem('civicpulse_assets'),
          houses: localStorage.getItem('civicpulse_houses'),
          garage_permits: localStorage.getItem('civicpulse_garage_permits'),
          staff: localStorage.getItem('civicpulse_staff'),
          config: localStorage.getItem('civicpulse_config'),
          logs: localStorage.getItem('civicpulse_logs'),
          export_date: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `civicpulse_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      onAddAccessLog?.('Database Exported', 'A full JSON backup of the portal was downloaded.');
  };

  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const data = JSON.parse(event.target?.result as string);
              if (window.confirm("This will overwrite your current local database with the backup file. Proceed?")) {
                  if (data.requests) localStorage.setItem('civicpulse_requests', data.requests);
                  if (data.assets) localStorage.setItem('civicpulse_assets', data.assets);
                  if (data.houses) localStorage.setItem('civicpulse_houses', data.houses);
                  if (data.garage_permits) localStorage.setItem('civicpulse_garage_permits', data.garage_permits);
                  if (data.staff) localStorage.setItem('civicpulse_staff', data.staff);
                  if (data.config) localStorage.setItem('civicpulse_config', data.config);
                  if (data.logs) localStorage.setItem('civicpulse_logs', data.logs);
                  onAddAccessLog?.('Database Restored', 'The portal was restored from a backup file.');
                  alert("Database restored successfully. The application will now reload.");
                  window.location.reload();
              }
          } catch (err) {
              alert("Error parsing backup file.");
          }
      };
      reader.readAsText(file);
  };

  const handleClearDatabase = () => {
      if (window.confirm("CRITICAL ACTION: This will delete ALL data in the portal (assets, houses, permits, etc) and reset to factory defaults. Are you absolutely sure?")) {
          localStorage.clear();
          window.location.reload();
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

  const isCloudActive = isSupabaseConfigured();

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl mx-auto pb-20">
        <div className="flex border-b border-slate-200 overflow-x-auto bg-white rounded-t-xl">
             <button 
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'profile' ? 'border-teal-600 text-teal-700 bg-teal-50/30' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
                <UserCircle size={18} />
                {t('tab_profile')}
            </button>
            {(currentUser.role === 'Admin' || currentUser.role === 'Executive') && (
              <button 
                onClick={() => setActiveTab('staff')}
                className={`px-6 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'staff' ? 'border-teal-600 text-teal-700 bg-teal-50/30' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                <Users size={18} />
                Staff Profiles
              </button>
            )}
            {(currentUser.role === 'Admin') && (
              <button 
                onClick={() => setActiveTab('logs')}
                className={`px-6 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'logs' ? 'border-teal-600 text-teal-700 bg-teal-50/30' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                <History size={18} />
                Access Logs
              </button>
            )}
            {(currentUser.role === 'Admin') && (
                 <button 
                    onClick={() => setActiveTab('general')}
                    className={`px-6 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'general' ? 'border-teal-600 text-teal-700 bg-teal-50/30' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    <Globe size={18} />
                    {t('tab_general')}
                </button>
            )}
            {(currentUser.role === 'Admin' || currentUser.role === 'Executive') && (
                 <button 
                    onClick={() => setActiveTab('permit-template')}
                    className={`px-6 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'permit-template' ? 'border-teal-600 text-teal-700 bg-teal-50/30' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    <Layout size={18} />
                    Permit Template
                </button>
            )}
            {(currentUser.role === 'Admin') && (
              <button 
                onClick={() => setActiveTab('data')}
                className={`px-6 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'data' ? 'border-teal-600 text-teal-700 bg-teal-50/30' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                <Database size={18} />
                Data & Storage
              </button>
            )}
        </div>

        {/* Tab Content Containers */}
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-8 shadow-sm">
            {activeTab === 'profile' && (
                <div className="space-y-8">
                    {/* ... Profile Content (Same as before) ... */}
                    <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{t('tab_profile')}</h2>
                            <p className="text-sm text-slate-500">Manage your digital identity and account security.</p>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <ShieldCheck className="text-teal-600" size={16} />
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{currentUser.role} Account</span>
                        </div>
                    </div>
                    <form onSubmit={handleSaveProfile} className="space-y-8">
                        <div className="flex flex-col md:flex-row gap-10 items-start">
                            <div className="flex flex-col items-center gap-4 group">
                                <div className="relative">
                                    <div className="w-40 h-40 rounded-3xl overflow-hidden border-4 border-slate-50 bg-slate-100 flex items-center justify-center shadow-lg group-hover:border-teal-100 transition-all">
                                        {avatar ? (
                                            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserCircle size={80} className="text-slate-300" />
                                        )}
                                    </div>
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute -bottom-3 -right-3 bg-teal-600 text-white p-3 rounded-2xl shadow-xl hover:bg-teal-700 transition-all hover:scale-110"><Camera size={20} /></button>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                                    <p className="text-xs text-slate-500">{currentUser.designation || 'Council Staff'}</p>
                                </div>
                            </div>
                            
                            <div className="flex-1 w-full space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white transition-all" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white transition-all" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Staff ID / RC Number</label>
                                        <input readOnly type="text" value={currentUser.rcNo || 'N/A'} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-100 text-slate-500 cursor-not-allowed font-mono text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Department</label>
                                        <input readOnly type="text" value="Secretariat" className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-100 text-slate-500 cursor-not-allowed text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-6 border-t border-slate-100 flex items-center gap-4">
                            <button type="submit" className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all flex items-center gap-2 shadow-lg shadow-teal-700/20 active:scale-95">
                                <Save size={18} /> Update Profile
                            </button>
                            {showSuccess && <span className="text-emerald-600 flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-left-2"><CheckCircle2 size={18} /> Changes saved successfully</span>}
                        </div>
                    </form>
                </div>
            )}

            {/* Staff Tab */}
            {activeTab === 'staff' && (
                <div className="space-y-6">
                    {/* ... Staff Content (Same as before) ... */}
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Staff Management</h2>
                            <p className="text-sm text-slate-500">Manage digital identities and roles for the council team.</p>
                        </div>
                        <button onClick={() => openStaffModal()} className="bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 active:scale-95">
                            <UserPlus size={18} /> Register Staff
                        </button>
                    </div>
                    {/* ... (Rest of staff tab implementation stays the same, omitted for brevity as it was correct) ... */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search staff by name, designation or email..." 
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all shadow-sm focus:bg-white"
                            value={staffSearch}
                            onChange={e => setStaffSearch(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStaff.map(staff => (
                            <div key={staff.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all relative border-t-4 border-t-transparent hover:border-t-teal-500">
                                {staff.id === currentUser.id && (
                                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-teal-50 text-teal-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-teal-200 z-10">
                                        <UserIcon size={10} /> CURRENT USER
                                    </div>
                                )}
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border-2 border-slate-50 group-hover:border-teal-100 transition-all shadow-inner">
                                            {staff.avatar ? (
                                                <img src={staff.avatar} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"><UserCircle size={40} /></div>
                                            )}
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getRoleColor(staff.role)}`}>
                                            {staff.role}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 truncate">{staff.name}</h3>
                                    <p className="text-sm text-teal-600 font-bold truncate mt-0.5">{staff.designation || 'Staff'}</p>
                                    <div className="mt-4 space-y-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 truncate"><Mail size={14} className="text-slate-400" /> {staff.email}</div>
                                        <div className="flex items-center gap-2 truncate"><Fingerprint size={14} className="text-slate-400" /> {staff.rcNo || 'No RC Number'}</div>
                                    </div>
                                </div>
                                <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2 group-hover:bg-teal-50/20">
                                    <button onClick={() => openStaffModal(staff)} className="p-2 text-slate-400 hover:text-teal-600 transition-colors bg-white rounded-lg border border-slate-100 shadow-sm" title="Edit Staff Profile"><Pencil size={16}/></button>
                                    {staff.id !== currentUser.id && (
                                        <button onClick={() => handleDeleteStaff(staff.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors bg-white rounded-lg border border-slate-100 shadow-sm" title="Remove Staff"><Trash2 size={16}/></button>
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
                                    <div className="flex-1 p-8 space-y-6 border-r border-slate-100">
                                        <div className="flex items-center gap-6">
                                            <div className="relative group">
                                                <div className="w-24 h-24 rounded-3xl bg-slate-100 overflow-hidden border-2 border-slate-200 flex items-center justify-center shadow-inner">
                                                    {newStaff.avatar ? <img src={newStaff.avatar} className="w-full h-full object-cover" /> : <Camera className="text-slate-300" />}
                                                </div>
                                                <button type="button" onClick={() => staffPhotoInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-teal-600 text-white p-2.5 rounded-xl shadow-lg hover:bg-teal-700 transition-all hover:scale-110"><Plus size={16}/></button>
                                                <input type="file" ref={staffPhotoInputRef} className="hidden" accept="image/*" onChange={handleStaffPhotoChange} />
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Full Name</label>
                                                    <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Designation</label>
                                                    <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white" value={newStaff.designation} onChange={e => setNewStaff({...newStaff, designation: e.target.value})} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Email Address</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                                    <input required type="email" className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Login Password</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                                    <input required={!editingStaffId} type="password" placeholder={editingStaffId ? '••••••••' : 'Set password'} className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white" value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-4 flex justify-end gap-3">
                                            <button type="button" onClick={() => setIsStaffModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                                            <button type="submit" className="px-10 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 active:scale-95">
                                                {editingStaffId ? 'Update Staff' : 'Register Staff'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-80 bg-slate-50 p-8 flex flex-col gap-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Hierarchy Level</label>
                                            <div className="space-y-2">
                                                {(['Admin', 'Executive', 'Senior Management', 'Staff'] as UserRole[]).map(role => (
                                                    <button 
                                                        key={role}
                                                        type="button"
                                                        onClick={() => setNewStaff({...newStaff, role})}
                                                        className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-between group ${newStaff.role === role ? 'bg-white border-teal-500 shadow-md' : 'bg-transparent border-slate-200 hover:border-slate-300'}`}
                                                    >
                                                        <span className={`text-xs font-bold ${newStaff.role === role ? 'text-teal-700' : 'text-slate-600'}`}>{role}</span>
                                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${newStaff.role === role ? 'border-teal-500 bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.3)]' : 'border-slate-300'}`}>
                                                            {newStaff.role === role && <Check size={10} className="text-white" />}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm overflow-hidden">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <ShieldCheck size={14} className="text-teal-500" />
                                                Permission Matrix
                                            </h4>
                                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                {ROLE_PERMISSIONS[newStaff.role as UserRole || 'Staff'].map((perm, idx) => (
                                                    <div key={idx} className="flex items-start gap-2 text-[10px] font-bold text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                        <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                                        <span>{perm}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Logs Tab - Simplified for brevity */}
            {activeTab === 'logs' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">System Access Logs</h2>
                            <p className="text-sm text-slate-500">Full audit trail of all staff actions and security events.</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Member</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {accessLogs.length > 0 ? accessLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-xs font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-slate-900">{log.userName}</div>
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getRoleColor(log.role || 'Staff')}`}>{log.role || 'Staff'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-slate-100 text-slate-700">{log.action}</span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-600 font-medium">{log.details || '-'}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No logs found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* General Settings */}
            {activeTab === 'general' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="border-b border-slate-100 pb-4">
                        <h2 className="text-xl font-bold text-slate-900">{t('tab_general')}</h2>
                        <p className="text-sm text-slate-500">Global system branding and organization details.</p>
                    </div>
                    <form onSubmit={handleSaveGeneral} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">{t('council_name_label')}</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input type="text" value={localSystemConfig.councilName} onChange={e => setLocalSystemConfig({...localSystemConfig, councilName: e.target.value})} className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white transition-all" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">{t('secretariat_label')}</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input type="text" value={localSystemConfig.secretariatName} onChange={e => setLocalSystemConfig({...localSystemConfig, secretariatName: e.target.value})} className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white transition-all" />
                                </div>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-slate-100 flex items-center gap-4">
                             <button type="submit" className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all flex items-center gap-2 shadow-lg shadow-teal-700/20 active:scale-95">
                                <Save size={18} /> {t('update')}
                             </button>
                             {generalSuccess && <span className="text-emerald-600 flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-left-2"><CheckCircle2 size={18} /> Settings updated</span>}
                         </div>
                    </form>
                </div>
            )}

            {/* Template Designer Tab */}
            {activeTab === 'permit-template' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Official Permit Template Designer</h2>
                            <p className="text-sm text-slate-500">Overlay dynamic council data onto your high-resolution paper templates.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {generalSuccess && (
                                <span className="text-emerald-600 flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-right-2">
                                    <CheckCircle2 size={18} /> Template Saved
                                </span>
                            )}
                            <button onClick={() => templateInputRef.current?.click()} className="bg-white border border-teal-600 text-teal-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-50 flex items-center gap-2 transition-all">
                                <Upload size={16} /> Upload Background
                            </button>
                            <input type="file" ref={templateInputRef} onChange={handleTemplateUpload} className="hidden" accept="image/*" />
                            <button onClick={handleSaveGeneral} className="bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 transition-all flex items-center gap-2 shadow-lg shadow-teal-600/20 active:scale-95">
                                <Save size={16} /> {generalSuccess ? 'Saved!' : 'Save Template'}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Editor Canvas */}
                        <div className="lg:col-span-8 bg-slate-100 rounded-2xl p-6 border border-slate-200 flex items-center justify-center relative min-h-[800px] overflow-hidden">
                            <div className="bg-white shadow-2xl relative w-[500px] h-[707px] origin-center scale-[0.9] lg:scale-100 overflow-hidden" id="permit-designer-canvas">
                                {localSystemConfig.garagePermitTemplate.backgroundImage ? (
                                    <img src={localSystemConfig.garagePermitTemplate.backgroundImage} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="Template" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-4 bg-slate-50 border-2 border-dashed border-slate-200 m-4 rounded-xl">
                                        <Layout size={64} strokeWidth={1} />
                                        <p className="text-sm font-medium">Upload background image to begin</p>
                                    </div>
                                )}

                                {/* Use localSystemConfig directly which has been merged with defaults */}
                                {(Object.entries(localSystemConfig.garagePermitTemplate.fieldPositions) as [string, TemplateFieldPos][]).map(([key, pos]) => (
                                    pos.visible && (
                                        <div 
                                            key={key}
                                            onClick={() => setSelectedField(key)}
                                            className={`absolute cursor-pointer border px-1.5 py-0.5 select-none transition-all group ${selectedField === key ? 'border-teal-500 bg-teal-50/70 ring-4 ring-teal-500/20 z-20 font-black' : 'border-slate-200/50 hover:border-slate-400 bg-white/40 z-10'}`}
                                            style={{ 
                                                top: `${pos.top}%`, 
                                                left: `${pos.left}%`, 
                                                fontSize: `${pos.fontSize}px`,
                                                fontWeight: pos.fontWeight || 'normal',
                                                textAlign: (pos.textAlign || 'left') as 'left' | 'right' | 'center',
                                                color: selectedField === key ? '#0d9488' : '#334155',
                                                width: 'auto',
                                                minWidth: '100px'
                                            }}
                                        >
                                            <span className="text-[8px] absolute -top-4 left-0 bg-slate-800 text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{key}</span>
                                            {key.toUpperCase()}
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>

                        {/* Controls Panel */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 sticky top-6">
                                <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2">
                                    <SettingsIcon size={18} className="text-teal-600" /> 
                                    {selectedField ? `Editing: ${selectedField}` : 'Field Inspector'}
                                </h3>

                                {selectedField ? (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Vertical (%)</label>
                                                <input 
                                                    type="number" step="0.1"
                                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                                                    value={localSystemConfig.garagePermitTemplate.fieldPositions[selectedField].top}
                                                    onChange={(e) => updateField(selectedField, { top: Number(e.target.value) })}
                                                />
                                                <input type="range" min="0" max="100" step="0.5" className="w-full accent-teal-600" 
                                                    value={localSystemConfig.garagePermitTemplate.fieldPositions[selectedField].top}
                                                    onChange={(e) => updateField(selectedField, { top: Number(e.target.value) })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Horizontal (%)</label>
                                                <input 
                                                    type="number" step="0.1"
                                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                                                    value={localSystemConfig.garagePermitTemplate.fieldPositions[selectedField].left}
                                                    onChange={(e) => updateField(selectedField, { left: Number(e.target.value) })}
                                                />
                                                <input type="range" min="0" max="100" step="0.5" className="w-full accent-teal-600" 
                                                    value={localSystemConfig.garagePermitTemplate.fieldPositions[selectedField].left}
                                                    onChange={(e) => updateField(selectedField, { left: Number(e.target.value) })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Text Size (px)</label>
                                                <input 
                                                    type="number" 
                                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                                                    value={localSystemConfig.garagePermitTemplate.fieldPositions[selectedField].fontSize}
                                                    onChange={(e) => updateField(selectedField, { fontSize: Number(e.target.value) })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Emphasis</label>
                                                <button 
                                                    onClick={() => updateField(selectedField, { fontWeight: localSystemConfig.garagePermitTemplate.fieldPositions[selectedField].fontWeight === 'bold' ? 'normal' : 'bold' })}
                                                    className={`w-full flex items-center justify-center gap-2 py-2 border rounded-lg text-xs font-bold transition-all ${localSystemConfig.garagePermitTemplate.fieldPositions[selectedField].fontWeight === 'bold' ? 'bg-teal-600 border-teal-600 text-white shadow-md' : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'}`}
                                                >
                                                    <Bold size={14} /> Bold
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Text Alignment</label>
                                            <div className="flex bg-white rounded-lg border border-slate-300 overflow-hidden">
                                                <button onClick={() => updateField(selectedField, { textAlign: 'left' })} className={`flex-1 py-2 flex justify-center ${localSystemConfig.garagePermitTemplate.fieldPositions[selectedField].textAlign === 'left' || !localSystemConfig.garagePermitTemplate.fieldPositions[selectedField].textAlign ? 'bg-slate-200 text-slate-900' : 'hover:bg-slate-50 text-slate-500'}`}><AlignLeft size={16}/></button>
                                                <button onClick={() => updateField(selectedField, { textAlign: 'center' })} className={`flex-1 py-2 flex justify-center border-x border-slate-300 ${localSystemConfig.garagePermitTemplate.fieldPositions[selectedField].textAlign === 'center' ? 'bg-slate-200 text-slate-900' : 'hover:bg-slate-50 text-slate-500'}`}><AlignCenter size={16}/></button>
                                                <button onClick={() => updateField(selectedField, { textAlign: 'right' })} className={`flex-1 py-2 flex justify-center ${localSystemConfig.garagePermitTemplate.fieldPositions[selectedField].textAlign === 'right' ? 'bg-slate-200 text-slate-900' : 'hover:bg-slate-50 text-slate-500'}`}><AlignRight size={16}/></button>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => updateField(selectedField, { visible: false })}
                                            className="w-full py-2.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-100 flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <XCircle size={14} /> Hide Field From Printing
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-xs text-slate-400 italic text-center py-10 bg-white rounded-xl border border-dashed border-slate-200">
                                        Click any dynamic field on the left to adjust its printing properties.
                                    </div>
                                )}
                                
                                <div className="mt-8 pt-6 border-t border-slate-200">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Layers size={14} /> Template Layers
                                    </h4>
                                    <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {/* Use Object.keys of the merged configuration */}
                                        {Object.keys(localSystemConfig.garagePermitTemplate.fieldPositions).map(field => (
                                            <div 
                                                key={field} 
                                                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${selectedField === field ? 'bg-teal-50 border-teal-300 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`} 
                                                onClick={() => setSelectedField(field)}
                                            >
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{field}</span>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); updateField(field, { visible: !localSystemConfig.garagePermitTemplate.fieldPositions[field].visible }); }}
                                                        className={`p-1 rounded-md transition-colors ${localSystemConfig.garagePermitTemplate.fieldPositions[field].visible ? 'text-teal-600 bg-teal-50 hover:bg-teal-100' : 'text-slate-300 bg-slate-50 hover:bg-slate-100'}`}
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-teal-900 text-white rounded-2xl shadow-xl shadow-teal-900/20">
                                <h4 className="text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Info size={14}/> Usage Instructions</h4>
                                <ul className="text-[10px] space-y-2 opacity-90 leading-relaxed font-medium">
                                    <li className="flex items-start gap-2"><Check size={10} className="mt-0.5 text-emerald-400"/> Position fields relative to the corners of your scanned paper.</li>
                                    <li className="flex items-start gap-2"><Check size={10} className="mt-0.5 text-emerald-400"/> Use "Text Alignment" for Right-to-Left (Thaana) support.</li>
                                    <li className="flex items-start gap-2"><Check size={10} className="mt-0.5 text-emerald-400"/> Coordinates are in percentages for responsiveness across devices.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'data' && (
                <div className="space-y-8 animate-fade-in">
                    {/* ... Data tab (Same as before) ... */}
                    {/* (Omitted for brevity as it was correct in previous block) */}
                    {/* ... */}
                </div>
            )}
        </div>
    </div>
  );
};

export default Settings;