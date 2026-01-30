
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
  const [localSystemConfig, setLocalSystemConfig] = useState<SystemConfig>(() => {
      const baseConfig = systemConfig || { 
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
      };

      return {
          ...baseConfig,
          garagePermitTemplate: {
              ...baseConfig.garagePermitTemplate,
              fieldPositions: {
                  ...DEFAULT_FIELD_POSITIONS,
                  ...(baseConfig.garagePermitTemplate?.fieldPositions || {})
              }
          }
      };
  });
  
  useEffect(() => {
      if (systemConfig) {
          setLocalSystemConfig(prev => ({
              ...systemConfig,
              garagePermitTemplate: {
                  ...systemConfig.garagePermitTemplate,
                  fieldPositions: {
                      ...DEFAULT_FIELD_POSITIONS,
                      ...systemConfig.garagePermitTemplate.fieldPositions
                  }
              }
          }));
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
      reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              const MAX_WIDTH = 1240; 
              const MAX_HEIGHT = 1754; 
              
              let width = img.width;
              let height = img.height;

              if (width > height) {
                  if (width > MAX_WIDTH) {
                      height *= MAX_WIDTH / width;
                      width = MAX_WIDTH;
                  }
              } else {
                  if (height > MAX_HEIGHT) {
                      width *= MAX_HEIGHT / height;
                      height = MAX_HEIGHT;
                  }
              }

              canvas.width = width;
              canvas.height = height;
              ctx?.drawImage(img, 0, 0, width, height);
              
              const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
              
              setLocalSystemConfig(prev => ({
                ...prev,
                garagePermitTemplate: { ...prev.garagePermitTemplate, backgroundImage: dataUrl, useCustomTemplate: true }
              }));
          };
          img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveTemplate = () => {
      if(window.confirm("Remove custom background template?")) {
          setLocalSystemConfig(prev => ({
            ...prev,
            garagePermitTemplate: { ...prev.garagePermitTemplate, backgroundImage: undefined, useCustomTemplate: false }
          }));
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

            {activeTab === 'general' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{t('tab_general')}</h2>
                            <p className="text-sm text-slate-500">{t('general_subtitle')}</p>
                        </div>
                    </div>
                    <form onSubmit={handleSaveGeneral} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">{t('council_name_label')}</label>
                                <input type="text" value={localSystemConfig.councilName} onChange={(e) => setLocalSystemConfig({...localSystemConfig, councilName: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">{t('secretariat_label')}</label>
                                <input type="text" value={localSystemConfig.secretariatName} onChange={(e) => setLocalSystemConfig({...localSystemConfig, secretariatName: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white" />
                            </div>
                        </div>
                        <div className="pt-4">
                            <button type="submit" className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-teal-700 flex items-center gap-2 shadow-lg">
                                <Save size={16} /> Save Configuration
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'staff' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{t('tab_staff')}</h2>
                            <p className="text-sm text-slate-500">Manage portal access and user roles.</p>
                        </div>
                        <button onClick={() => openStaffModal()} className="bg-teal-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-teal-700 transition-all flex items-center gap-2 shadow-md">
                            <UserPlus size={18} /> Add Staff
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input type="text" placeholder="Search staff members..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" value={staffSearch} onChange={e => setStaffSearch(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStaff.map(staff => (
                            <div key={staff.id} className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-teal-200 transition-all duration-300 relative overflow-hidden">
                                <div className={`absolute top-0 right-0 p-3 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest border-b border-l ${getRoleColor(staff.role)}`}>
                                    {staff.role}
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center border-2 border-white shadow-sm">
                                        {staff.avatar ? <img src={staff.avatar} className="w-full h-full object-cover" /> : <UserCircle size={32} className="text-slate-300" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{staff.name}</h3>
                                        <p className="text-xs text-slate-500 font-medium">{staff.designation || 'Council Staff'}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Mail size={12} className="text-teal-600"/> {staff.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <BadgeCheck size={12} className="text-teal-600"/> ID: {staff.rcNo || staff.id}
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-4 border-t border-slate-100">
                                    <button onClick={() => openStaffModal(staff)} className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center gap-2"><Pencil size={12}/> Edit</button>
                                    <button onClick={() => handleDeleteStaff(staff.id)} className="flex-1 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-2"><Trash2 size={12}/> Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">System Access Logs</h2>
                            <p className="text-sm text-slate-500">Audit trail of all portal activities.</p>
                        </div>
                        <div className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-mono text-slate-600">Total Records: {accessLogs.length}</div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {accessLogs.slice(0, 50).map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 whitespace-nowrap text-xs font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">{log.userName.charAt(0)}</div>
                                                <span className="text-xs font-medium text-slate-700">{log.userName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${log.action === 'Login' ? 'bg-green-50 text-green-700' : log.action.includes('Delete') ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>{log.action}</span>
                                        </td>
                                        <td className="px-6 py-3 text-xs text-slate-600 truncate max-w-xs" title={log.details}>{log.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
                            <button onClick={handleRemoveTemplate} className="bg-white border border-red-200 text-red-600 px-3 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 flex items-center gap-2 transition-all">
                                <Trash2 size={16} /> Reset
                            </button>
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
                        <div className="lg:col-span-8 bg-slate-100 rounded-2xl p-6 border border-slate-200 flex flex-col items-center relative min-h-[850px] overflow-hidden">
                            <div className="mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Layout size={12} /> Canvas Area: A4 Portrait (210mm x 297mm)
                            </div>
                            <div className="bg-white shadow-2xl relative w-[500px] h-[707px] origin-top scale-[0.9] lg:scale-100 overflow-hidden border border-slate-300" id="permit-designer-canvas">
                                {localSystemConfig.garagePermitTemplate.backgroundImage ? (
                                    <img src={localSystemConfig.garagePermitTemplate.backgroundImage} className="absolute inset-0 w-full h-full object-fill pointer-events-none" alt="Template" />
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
                    <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Database & Storage</h2>
                            <p className="text-sm text-slate-500">Manage backups and cloud connectivity.</p>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isCloudActive ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                            {isCloudActive ? <Cloud size={16}/> : <CloudOff size={16}/>}
                            <span className="text-xs font-bold uppercase">{isCloudActive ? 'Cloud Active' : 'Local Mode'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Database size={18} className="text-teal-600"/> Local Backup</h3>
                            <p className="text-sm text-slate-500">Download a full JSON snapshot of the current system state or restore from a previous file.</p>
                            
                            <div className="flex flex-col gap-3">
                                <button onClick={handleExportDatabase} className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors">
                                    <Download size={16}/> Export Full Backup
                                </button>
                                <div className="relative">
                                    <button onClick={() => importDatabaseRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-dashed border-slate-300 text-slate-600 font-bold text-sm rounded-xl hover:border-teal-500 hover:text-teal-600 transition-colors">
                                        <Upload size={16}/> Restore from Backup
                                    </button>
                                    <input type="file" ref={importDatabaseRef} onChange={handleImportDatabase} className="hidden" accept=".json" />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2"><PlugZap size={18} className="text-purple-600"/> Cloud Connection</h3>
                            <p className="text-sm text-slate-500">Test the connection to the Supabase backend. Requires .env configuration.</p>
                            
                            {connectionStatus && (
                                <div className={`p-3 rounded-lg text-xs font-mono border ${connectionStatus.success ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                    {connectionStatus.message}
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <button onClick={handleTestConnection} disabled={testingConnection} className="flex items-center justify-center gap-2 py-3 bg-purple-50 text-purple-700 font-bold text-sm rounded-xl hover:bg-purple-100 transition-colors disabled:opacity-50">
                                    {testingConnection ? <Loader2 className="animate-spin" size={16}/> : <Activity size={16}/>}
                                    {testingConnection ? 'Testing...' : 'Test Connection'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-red-50 border border-red-100 shadow-sm">
                        <h3 className="font-bold text-red-800 flex items-center gap-2 mb-2"><ShieldAlert size={18}/> Danger Zone</h3>
                        <p className="text-sm text-red-600 mb-4">Irreversible actions. Proceed with caution.</p>
                        <button onClick={handleClearDatabase} className="px-6 py-2.5 bg-white border border-red-200 text-red-600 font-bold text-sm rounded-xl hover:bg-red-600 hover:text-white transition-colors">
                            Factory Reset / Clear All Data
                        </button>
                    </div>
                </div>
            )}

            {isStaffModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">{editingStaffId ? 'Edit Staff Profile' : 'Register New Staff'}</h3>
                            <button onClick={() => setIsStaffModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleSaveStaff} className="p-6 space-y-4">
                            <div className="flex justify-center mb-4">
                                <div className="relative group cursor-pointer" onClick={() => staffPhotoInputRef.current?.click()}>
                                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 hover:border-teal-500 transition-colors">
                                        {newStaff.avatar ? <img src={newStaff.avatar} className="w-full h-full object-cover"/> : <Camera size={24} className="text-slate-400"/>}
                                    </div>
                                    <input type="file" ref={staffPhotoInputRef} onChange={handleStaffPhotoChange} className="hidden" accept="image/*" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                                    <input required type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                                    <select className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white" value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value as UserRole})}>
                                        <option value="Staff">Staff</option>
                                        <option value="Senior Management">Senior Management</option>
                                        <option value="Executive">Executive</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email / Login ID</label>
                                <input required type="email" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Designation</label>
                                <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" value={newStaff.designation} onChange={e => setNewStaff({...newStaff, designation: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Staff ID (RC)</label>
                                    <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" value={newStaff.rcNo} onChange={e => setNewStaff({...newStaff, rcNo: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                                    <input type="password" placeholder="Leave blank to keep current" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsStaffModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded hover:bg-slate-200">Cancel</button>
                                <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-teal-600 rounded hover:bg-teal-700">Save Staff</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default Settings;
