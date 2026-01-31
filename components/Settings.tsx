
import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole, AssetCategory, AssetStatusConfig, SystemConfig, TemplateFieldPos, AccessLog, UserPermissions } from '../types';
import { 
  UserCircle, Upload, Save, Plus, Trash2, Shield, Mail, Check, Camera, X, Layers, 
  Activity, Globe, Key, FileBadge, Briefcase, UserSquare2, FileText, Layout, 
  Move, Settings as SettingsIcon, Eye, Type, Bold, Info, Lock, History, 
  UserPlus, Search, Phone, MapPin, BadgeCheck, Fingerprint, Users, Pencil, 
  Hash, ShieldAlert, ShieldCheck, CheckCircle2, User as UserIcon, Database, 
  Download, RefreshCw, FileJson, Cloud, CloudOff, PlugZap, PlayCircle, 
  Loader2, Building2, XCircle, AlignLeft, AlignCenter, AlignRight, ListTree, Tag, Palette, AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { isSupabaseConfigured, testConnection } from '../services/supabaseService';
import { DEFAULT_FIELD_POSITIONS, getPermissionsForRole } from '../constants';

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
  const [activeTab, setActiveTab] = useState<'general' | 'profile' | 'staff' | 'logs' | 'permit-template' | 'data' | 'config'>('profile');
  
  // Profile State
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  
  // Profile Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const staffPhotoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const fontInputRef = useRef<HTMLInputElement>(null);
  const templateInputRef = useRef<HTMLInputElement>(null);
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
  // Local state for permissions checkbox editing
  const [editingPermissions, setEditingPermissions] = useState<UserPermissions>(getPermissionsForRole('Staff'));

  // General Settings State - Safe Initialization
  const [localSystemConfig, setLocalSystemConfig] = useState<SystemConfig>(() => {
      const baseConfig = systemConfig || { 
        councilName: '', 
        secretariatName: '',
        inventoryPrefix: '258',
        garagePermitTemplate: {
          title: 'GARAGE UTILIZATION PERMIT',
          header: '',
          footer: '',
          declaration: '',
          useCustomTemplate: false,
          fieldPositions: DEFAULT_FIELD_POSITIONS
        }
      };

      // Safely access garagePermitTemplate, provide defaults if missing
      const permitTemplate = baseConfig.garagePermitTemplate || {
          title: 'GARAGE UTILIZATION PERMIT',
          header: '',
          footer: '',
          declaration: '',
          useCustomTemplate: false,
          fieldPositions: DEFAULT_FIELD_POSITIONS
      };

      return {
          ...baseConfig,
          garagePermitTemplate: {
              ...permitTemplate,
              fieldPositions: {
                  ...DEFAULT_FIELD_POSITIONS,
                  ...(permitTemplate.fieldPositions || {})
              }
          }
      };
  });
  
  useEffect(() => {
      if (systemConfig) {
          const permitTemplate = systemConfig.garagePermitTemplate || {
              title: 'GARAGE UTILIZATION PERMIT',
              header: '',
              footer: '',
              declaration: '',
              useCustomTemplate: false,
              fieldPositions: DEFAULT_FIELD_POSITIONS
          };

          setLocalSystemConfig(prev => ({
              ...systemConfig,
              garagePermitTemplate: {
                  ...permitTemplate,
                  fieldPositions: {
                      ...DEFAULT_FIELD_POSITIONS,
                      ...permitTemplate.fieldPositions
                  }
              }
          }));
      }
  }, [systemConfig]);

  const [generalSuccess, setGeneralSuccess] = useState(false);
  
  // Category & Status Editing State
  const [localCategories, setLocalCategories] = useState<AssetCategory[]>(assetCategories);
  const [localStatuses, setLocalStatuses] = useState<AssetStatusConfig[]>(assetStatuses);

  // Sync props to local state when tab opens/props change
  useEffect(() => {
      setLocalCategories(assetCategories);
      setLocalStatuses(assetStatuses);
  }, [assetCategories, assetStatuses]);

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => setLocalSystemConfig(prev => ({ ...prev, councilLogo: event.target?.result as string }));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (event) => {
              setLocalSystemConfig(prev => ({
                  ...prev,
                  customDhivehiFont: event.target?.result as string,
                  customDhivehiFontName: file.name
              }));
          };
          reader.readAsDataURL(file);
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
    setPasswordError(null);

    const updatedUser: User = { 
        ...currentUser, 
        name, 
        email, 
        avatar 
    };

    if (newPassword) {
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }
        if (newPassword.length < 4) {
            setPasswordError("Password is too short.");
            return;
        }
        updatedUser.password = newPassword;
        onAddAccessLog?.('Password Changed', 'User updated their login password.');
    } else {
        onAddAccessLog?.('Profile Updated', 'User updated their personal profile details.');
    }

    onUpdateUser(updatedUser);
    setNewPassword('');
    setConfirmPassword('');
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

  const handleSaveConfig = () => {
      if (onUpdateCategories) onUpdateCategories(localCategories);
      if (onUpdateStatuses) onUpdateStatuses(localStatuses);
      if (onUpdateSystemConfig) onUpdateSystemConfig(localSystemConfig);
      onAddAccessLog?.('Asset Config Updated', 'Updated asset categories, statuses, or codes.');
      setGeneralSuccess(true);
      setTimeout(() => setGeneralSuccess(false), 3000);
  };

  const openStaffModal = (staff?: User) => {
    if (staff) {
      setEditingStaffId(staff.id);
      setNewStaff(staff);
      setEditingPermissions(staff.permissions || getPermissionsForRole(staff.role));
    } else {
      setEditingStaffId(null);
      setNewStaff({
        name: '', email: '', role: 'Staff', password: '', 
        designation: '', address: '', rcNo: '', idNo: '', 
        avatar: ''
      });
      setEditingPermissions(getPermissionsForRole('Staff'));
    }
    setIsStaffModalOpen(true);
  };

  const handleRoleChange = (role: UserRole) => {
      setNewStaff({ ...newStaff, role });
      setEditingPermissions(getPermissionsForRole(role));
  };

  const handlePermissionToggle = (key: keyof UserPermissions) => {
      setEditingPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateStaff) return;

    const userWithPermissions = { ...newStaff, permissions: editingPermissions } as User;

    if (editingStaffId) {
      const original = staffMembers.find(s => s.id === editingStaffId);
      if (original && original.role !== newStaff.role) {
        onAddAccessLog?.('Role Changed', `Role for ${newStaff.name} updated from ${original.role} to ${newStaff.role}`);
      }
      onUpdateStaff(staffMembers.map(s => s.id === editingStaffId ? { ...s, ...userWithPermissions } : s));
    } else {
      const staffToAdd: User = {
        ...userWithPermissions,
        id: `USR-${Math.floor(Math.random() * 1000)}`,
        joinedDate: new Date().toISOString().split('T')[0]
      };
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

  const handleTestConnection = async () => {
      setTestingConnection(true);
      const result = await testConnection();
      setConnectionStatus(result);
      setTestingConnection(false);
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
  
  const canManageStaff = currentUser.permissions?.manage_users || currentUser.role === 'Admin';

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl mx-auto pb-20">
        <div className="flex border-b border-slate-200 overflow-x-auto bg-white rounded-t-xl">
             <button onClick={() => setActiveTab('profile')} className={`px-6 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'profile' ? 'border-teal-600 text-teal-700 bg-teal-50/30' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}><UserCircle size={18} /> {t('tab_profile')}</button>
            {canManageStaff && <button onClick={() => setActiveTab('staff')} className={`px-6 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'staff' ? 'border-teal-600 text-teal-700 bg-teal-50/30' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}><Users size={18} /> Staff Management</button>}
            {(currentUser.role === 'Admin') && <button onClick={() => setActiveTab('logs')} className={`px-6 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'logs' ? 'border-teal-600 text-teal-700 bg-teal-50/30' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}><History size={18} /> Access Logs</button>}
            {(currentUser.role === 'Admin') && <button onClick={() => setActiveTab('general')} className={`px-6 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'general' ? 'border-teal-600 text-teal-700 bg-teal-50/30' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}><Globe size={18} /> {t('tab_general')}</button>}
             {(currentUser.role === 'Admin' || currentUser.role === 'Executive') && <button onClick={() => setActiveTab('config')} className={`px-6 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'config' ? 'border-teal-600 text-teal-700 bg-teal-50/30' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}><ListTree size={18} /> {t('tab_config') || "Asset Config"}</button>}
            {(currentUser.role === 'Admin' || currentUser.role === 'Executive') && <button onClick={() => setActiveTab('permit-template')} className={`px-6 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'permit-template' ? 'border-teal-600 text-teal-700 bg-teal-50/30' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}><Layout size={18} /> Permit Template</button>}
            {(currentUser.role === 'Admin') && <button onClick={() => setActiveTab('data')} className={`px-6 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'data' ? 'border-teal-600 text-teal-700 bg-teal-50/30' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}><Database size={18} /> Data & Storage</button>}
        </div>

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
                                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none bg-white transition-all" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none bg-white transition-all" />
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

                                <div className="pt-6 mt-6 border-t border-slate-100">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                                        <Key size={18} className="text-teal-600" /> Security & Password
                                    </h3>
                                    
                                    {passwordError && (
                                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 flex items-center gap-2">
                                            <XCircle size={16} /> {passwordError}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">New Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input 
                                                    type="password" 
                                                    value={newPassword} 
                                                    onChange={e => setNewPassword(e.target.value)} 
                                                    placeholder="Leave blank to keep current"
                                                    className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none bg-white transition-all" 
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Confirm Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input 
                                                    type="password" 
                                                    value={confirmPassword} 
                                                    onChange={e => setConfirmPassword(e.target.value)} 
                                                    placeholder="Retype new password"
                                                    className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none bg-white transition-all" 
                                                />
                                            </div>
                                        </div>
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
                                <input type="text" value={localSystemConfig.councilName} onChange={(e) => setLocalSystemConfig({...localSystemConfig, councilName: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none bg-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">{t('secretariat_label')}</label>
                                <input type="text" value={localSystemConfig.secretariatName} onChange={(e) => setLocalSystemConfig({...localSystemConfig, secretariatName: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none bg-white" />
                            </div>
                            
                            <div className="md:col-span-2 border-t border-slate-100 pt-4">
                                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Layout size={16}/> Login Screen Branding</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Title Line 1</label>
                                        <input type="text" value={localSystemConfig.loginTitle || ''} onChange={(e) => setLocalSystemConfig({...localSystemConfig, loginTitle: e.target.value})} placeholder="Digital Governance" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Highlight Text</label>
                                        <input type="text" value={localSystemConfig.loginHighlight || ''} onChange={(e) => setLocalSystemConfig({...localSystemConfig, loginHighlight: e.target.value})} placeholder="Reimagined." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Subtitle</label>
                                        <input type="text" value={localSystemConfig.loginSubtitle || ''} onChange={(e) => setLocalSystemConfig({...localSystemConfig, loginSubtitle: e.target.value})} placeholder="Welcome to the portal..." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 border-t border-slate-100 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Council Logo</label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center overflow-hidden">
                                                {localSystemConfig.councilLogo ? <img src={localSystemConfig.councilLogo} className="w-full h-full object-contain" /> : <Building2 size={24} className="text-slate-400"/>}
                                            </div>
                                            <div>
                                                <button type="button" onClick={() => logoInputRef.current?.click()} className="text-xs bg-slate-800 text-white px-3 py-2 rounded-lg font-bold hover:bg-slate-900 transition-colors flex items-center gap-2">
                                                    <Upload size={14}/> Upload New Logo
                                                </button>
                                                <input type="file" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                                                <p className="text-[10px] text-slate-400 mt-1">Recommended: PNG with transparent background</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Custom Font (Dhivehi)</label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-600 truncate">
                                                {localSystemConfig.customDhivehiFontName || 'Default: Noto Sans Thaana'}
                                            </div>
                                            <button type="button" onClick={() => fontInputRef.current?.click()} className="text-xs bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg font-bold hover:bg-slate-50 transition-colors">
                                                Upload .WOFF2
                                            </button>
                                            <input type="file" ref={fontInputRef} onChange={handleFontUpload} className="hidden" accept=".woff2,.ttf,.otf" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 flex items-center gap-4">
                            <button type="submit" className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-teal-700 flex items-center gap-2 shadow-lg">
                                <Save size={16} /> Save Configuration
                            </button>
                            {generalSuccess && <span className="text-emerald-600 text-sm font-bold flex items-center gap-2 animate-in fade-in"><CheckCircle2 size={16}/> Saved</span>}
                        </div>
                    </form>
                </div>
            )}
            
            {activeTab === 'config' && (
               <div className="space-y-8 animate-fade-in">
                   <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                       <div>
                           <h2 className="text-xl font-bold text-slate-900">{t('tab_config') || "Asset Configuration"}</h2>
                           <p className="text-sm text-slate-500">{t('config_subtitle') || "Manage system codes and categories."}</p>
                       </div>
                   </div>
                   
                   <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                         <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Tag size={18} className="text-teal-600" />
                            Global Inventory Settings
                         </h3>
                         <div className="max-w-md">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Office / Inventory Group Prefix</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none font-mono bg-white"
                                    value={localSystemConfig.inventoryPrefix || '258'}
                                    onChange={(e) => setLocalSystemConfig({...localSystemConfig, inventoryPrefix: e.target.value})}
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-2">This code (e.g., 258) is used as the prefix for all asset IDs (e.g., 258-2024-01-001).</p>
                         </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Asset Categories */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800">Asset Categories</h3>
                                <button 
                                    onClick={() => setLocalCategories([...localCategories, { id: `cat_${Date.now()}`, name: 'New Category', code: '00', nameDh: '' }])}
                                    className="text-xs bg-white border border-slate-300 px-2 py-1 rounded hover:bg-slate-50 font-bold"
                                >
                                    + Add
                                </button>
                            </div>
                            <div className="max-h-80 overflow-y-auto p-4 space-y-3">
                                {localCategories.map((cat, idx) => (
                                    <div key={cat.id} className="flex items-center gap-2">
                                        <input type="text" className="w-12 border border-slate-300 rounded px-2 py-1 text-xs font-mono text-center bg-white" value={cat.code} onChange={(e) => {
                                            const newCats = [...localCategories];
                                            newCats[idx].code = e.target.value;
                                            setLocalCategories(newCats);
                                        }} />
                                        <input type="text" className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs bg-white" value={cat.name} onChange={(e) => {
                                            const newCats = [...localCategories];
                                            newCats[idx].name = e.target.value;
                                            setLocalCategories(newCats);
                                        }} />
                                        <button onClick={() => setLocalCategories(localCategories.filter(c => c.id !== cat.id))} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Asset Statuses */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800">Asset Statuses</h3>
                                <button 
                                    onClick={() => setLocalStatuses([...localStatuses, { id: `sts_${Date.now()}`, name: 'New Status', color: 'bg-slate-100 text-slate-800' }])}
                                    className="text-xs bg-white border border-slate-300 px-2 py-1 rounded hover:bg-slate-50 font-bold"
                                >
                                    + Add
                                </button>
                            </div>
                            <div className="max-h-80 overflow-y-auto p-4 space-y-3">
                                {localStatuses.map((sts, idx) => (
                                    <div key={sts.id} className="flex items-center gap-2">
                                        <input type="text" className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs bg-white" value={sts.name} onChange={(e) => {
                                            const newSts = [...localStatuses];
                                            newSts[idx].name = e.target.value;
                                            setLocalStatuses(newSts);
                                        }} />
                                        <input type="text" className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs bg-white" placeholder="Tailwind classes" value={sts.color} onChange={(e) => {
                                            const newSts = [...localStatuses];
                                            newSts[idx].color = e.target.value;
                                            setLocalStatuses(newSts);
                                        }} />
                                        <div className={`w-6 h-6 rounded border border-slate-200 ${sts.color}`}></div>
                                        <button onClick={() => setLocalStatuses(localStatuses.filter(s => s.id !== sts.id))} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center gap-4">
                        <button onClick={handleSaveConfig} className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-teal-700 flex items-center gap-2 shadow-lg">
                            <Save size={16} /> Save Configuration
                        </button>
                        {generalSuccess && <span className="text-emerald-600 text-sm font-bold flex items-center gap-2 animate-in fade-in"><CheckCircle2 size={16}/> Saved</span>}
                    </div>
                </div>
            )}

            {/* Staff Tab content - UPDATED WITH PERMISSIONS */}
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
                        <input type="text" placeholder="Search staff members..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" value={staffSearch} onChange={e => setStaffSearch(e.target.value)} />
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
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3">Timestamp</th>
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Action</th>
                                    <th className="px-4 py-3">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {accessLogs.slice(0, 50).map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-2 font-mono text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-4 py-2 font-medium text-slate-700">{log.userName}</td>
                                        <td className="px-4 py-2"><span className="bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">{log.action}</span></td>
                                        <td className="px-4 py-2 text-slate-600">{log.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'permit-template' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Permit Template Design</h2>
                            <p className="text-sm text-slate-500">Customize the layout and text for printed garage permits.</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                <h4 className="font-bold text-slate-800 mb-4">Background & Layout</h4>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={localSystemConfig.garagePermitTemplate.useCustomTemplate} 
                                            onChange={(e) => setLocalSystemConfig(prev => ({ ...prev, garagePermitTemplate: { ...prev.garagePermitTemplate, useCustomTemplate: e.target.checked } }))} 
                                            className="w-4 h-4 text-teal-600 rounded" 
                                        />
                                        <span className="text-sm font-medium text-slate-700">Use Custom Background Image</span>
                                    </label>
                                    
                                    {localSystemConfig.garagePermitTemplate.useCustomTemplate && (
                                        <div className="space-y-2">
                                            {localSystemConfig.garagePermitTemplate.backgroundImage ? (
                                                <div className="relative w-32 h-44 bg-white border border-slate-300 rounded overflow-hidden group">
                                                    <img src={localSystemConfig.garagePermitTemplate.backgroundImage} className="w-full h-full object-contain" />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button onClick={handleRemoveTemplate} className="text-white hover:text-red-300"><Trash2 size={20}/></button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 gap-2 cursor-pointer hover:border-teal-500 hover:text-teal-500 transition-colors" onClick={() => templateInputRef.current?.click()}>
                                                    <Upload size={24} />
                                                    <span className="text-xs">Upload A4 Background (JPG)</span>
                                                </div>
                                            )}
                                            <input type="file" ref={templateInputRef} onChange={handleTemplateUpload} className="hidden" accept="image/jpeg,image/png" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                <h4 className="font-bold text-slate-800 mb-4">Template Text Content</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Permit Title</label>
                                        <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white" value={localSystemConfig.garagePermitTemplate.title} onChange={(e) => setLocalSystemConfig(prev => ({ ...prev, garagePermitTemplate: { ...prev.garagePermitTemplate, title: e.target.value } }))} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Declaration Text</label>
                                        <textarea className="w-full border border-slate-300 rounded px-3 py-2 text-sm h-24 resize-none bg-white" value={localSystemConfig.garagePermitTemplate.declaration} onChange={(e) => setLocalSystemConfig(prev => ({ ...prev, garagePermitTemplate: { ...prev.garagePermitTemplate, declaration: e.target.value } }))} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-[600px] overflow-y-auto">
                            <h4 className="font-bold text-slate-800 mb-4 flex justify-between items-center">
                                Field Positioning
                                <span className="text-xs font-normal text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">Values in % (Top/Left)</span>
                            </h4>
                            <div className="space-y-2">
                                {Object.entries(localSystemConfig.garagePermitTemplate.fieldPositions).map(([key, value]) => {
                                    const pos = value as TemplateFieldPos;
                                    return (
                                    <div key={key} className="bg-white p-3 rounded border border-slate-200 text-xs">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input type="checkbox" checked={pos.visible} onChange={(e) => updateField(key, { visible: e.target.checked })} className="w-3 h-3" />
                                                <span className="text-[10px]">Show</span>
                                            </label>
                                        </div>
                                        {pos.visible && (
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-slate-400">T:</span>
                                                    <input type="number" className="w-full border border-slate-300 rounded px-1 bg-white" value={pos.top} onChange={(e) => updateField(key, { top: Number(e.target.value) })} />
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-slate-400">L:</span>
                                                    <input type="number" className="w-full border border-slate-300 rounded px-1 bg-white" value={pos.left} onChange={(e) => updateField(key, { left: Number(e.target.value) })} />
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-slate-400">Sz:</span>
                                                    <input type="number" className="w-full border border-slate-300 rounded px-1 bg-white" value={pos.fontSize} onChange={(e) => updateField(key, { fontSize: Number(e.target.value) })} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-4 flex items-center gap-4">
                        <button onClick={handleSaveGeneral} className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-teal-700 flex items-center gap-2 shadow-lg">
                            <Save size={16} /> Save Template Config
                        </button>
                        {generalSuccess && <span className="text-emerald-600 text-sm font-bold flex items-center gap-2 animate-in fade-in"><CheckCircle2 size={16}/> Saved</span>}
                    </div>
                </div>
            )}

            {activeTab === 'data' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Data & Storage</h2>
                            <p className="text-sm text-slate-500">Manage cloud connectivity and local backup.</p>
                        </div>
                        {isSupabaseConfigured() ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 text-sm font-medium">
                                <Cloud size={16} /> Cloud Active
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-100 text-sm font-medium">
                                <Database size={16} /> Local Only
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Cloud size={18}/> Cloud Connection</h4>
                            <p className="text-sm text-slate-600 mb-6">
                                Test the connection to the Supabase backend. This ensures data is safely synced to the cloud.
                            </p>
                            <button 
                                onClick={handleTestConnection}
                                disabled={testingConnection}
                                className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 flex items-center gap-2 w-full justify-center"
                            >
                                {testingConnection ? <Loader2 className="animate-spin" size={16}/> : <PlugZap size={16}/>}
                                Test Connection
                            </button>
                            {connectionStatus && (
                                <div className={`mt-4 p-3 rounded-lg text-xs font-mono border ${connectionStatus.success ? 'bg-emerald-100 border-emerald-200 text-emerald-800' : 'bg-red-100 border-red-200 text-red-800'}`}>
                                    {connectionStatus.message}
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Database size={18}/> Local Storage</h4>
                            <p className="text-sm text-slate-600 mb-6">
                                Current browser storage usage. Clearing this without cloud sync will result in data loss.
                            </p>
                            <div className="flex justify-between items-center mb-4 text-sm font-mono bg-white p-3 rounded border border-slate-200">
                                <span>Used Storage:</span>
                                <span>{((JSON.stringify(localStorage).length / 1024) / 1024).toFixed(2)} MB</span>
                            </div>
                            <button 
                                onClick={() => {
                                    if(window.confirm("WARNING: This will wipe all local data. Only proceed if Cloud Sync is confirmed.")) {
                                        localStorage.clear();
                                        window.location.reload();
                                    }
                                }}
                                className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 flex items-center gap-2 w-full justify-center"
                            >
                                <Trash2 size={16}/> Clear Local Data
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isStaffModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">{editingStaffId ? 'Edit Staff Profile' : 'Register New Staff'}</h3>
                            <button onClick={() => setIsStaffModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleSaveStaff} className="p-6 space-y-6">
                            
                            {/* Profile Photo */}
                            <div className="flex justify-center">
                                <div className="relative group cursor-pointer" onClick={() => staffPhotoInputRef.current?.click()}>
                                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 hover:border-teal-500 transition-colors">
                                        {newStaff.avatar ? <img src={newStaff.avatar} className="w-full h-full object-cover"/> : <Camera size={24} className="text-slate-400"/>}
                                    </div>
                                    <input type="file" ref={staffPhotoInputRef} onChange={handleStaffPhotoChange} className="hidden" accept="image/*" />
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                                    <input required type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Primary Role</label>
                                    <select 
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none" 
                                        value={newStaff.role} 
                                        onChange={e => handleRoleChange(e.target.value as UserRole)}
                                    >
                                        <option value="Staff">Staff</option>
                                        <option value="Senior Management">Senior Management</option>
                                        <option value="Executive">Executive</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            {/* GRANULAR PERMISSIONS SECTION */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Shield size={14} className="text-teal-600" /> Module Permissions
                                </h4>
                                <p className="text-xs text-slate-500 mb-4">Toggle specific access areas for this staff member. Defaults are set based on the selected Role.</p>
                                
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={editingPermissions.dashboard} onChange={() => handlePermissionToggle('dashboard')} className="accent-teal-600 rounded" />
                                        <span className="text-sm font-medium text-slate-700">View Dashboard</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={editingPermissions.requests} onChange={() => handlePermissionToggle('requests')} className="accent-teal-600 rounded" />
                                        <span className="text-sm font-medium text-slate-700">Requests</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={editingPermissions.hudha} onChange={() => handlePermissionToggle('hudha')} className="accent-teal-600 rounded" />
                                        <span className="text-sm font-medium text-slate-700">Hudha Forms</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={editingPermissions.houses} onChange={() => handlePermissionToggle('houses')} className="accent-teal-600 rounded" />
                                        <span className="text-sm font-medium text-slate-700">House Registry</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={editingPermissions.assets} onChange={() => handlePermissionToggle('assets')} className="accent-teal-600 rounded" />
                                        <span className="text-sm font-medium text-slate-700">Asset Registry</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={editingPermissions.garage} onChange={() => handlePermissionToggle('garage')} className="accent-teal-600 rounded" />
                                        <span className="text-sm font-medium text-slate-700">Garage Permits</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={editingPermissions.analytics} onChange={() => handlePermissionToggle('analytics')} className="accent-teal-600 rounded" />
                                        <span className="text-sm font-medium text-slate-700">Analytics</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={editingPermissions.manage_users} onChange={() => handlePermissionToggle('manage_users')} className="accent-red-600 rounded" />
                                        <span className="text-sm font-bold text-red-700">Manage Staff</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={editingPermissions.delete_records} onChange={() => handlePermissionToggle('delete_records')} className="accent-red-600 rounded" />
                                        <span className="text-sm font-bold text-red-700">Delete Records</span>
                                    </label>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email / Login ID</label>
                                <input required type="email" className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Designation</label>
                                <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none" value={newStaff.designation} onChange={e => setNewStaff({...newStaff, designation: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Staff ID (RC)</label>
                                    <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none" value={newStaff.rcNo} onChange={e => setNewStaff({...newStaff, rcNo: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                                    <input type="password" placeholder="Leave blank to keep current" className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none" value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                                <button type="button" onClick={() => setIsStaffModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded hover:bg-slate-200">Cancel</button>
                                <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-teal-600 rounded hover:bg-teal-700 shadow-sm">Save Staff</button>
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
