
import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole, AssetCategory, AssetStatusConfig, SystemConfig, TemplateFieldPos, AccessLog } from '../types';
import { UserCircle, Upload, Save, Plus, Trash2, Shield, Mail, Check, Camera, X, Layers, Activity, Globe, Key, FileBadge, Briefcase, UserSquare2, FileText, Layout, Move, Settings as SettingsIcon, Eye, Type, Bold, Info, Lock, History, UserPlus, Search, Phone, MapPin, BadgeCheck, Fingerprint, Users, Pencil, Hash, ShieldAlert, ShieldCheck, CheckCircle2, User as UserIcon, Database, Download, RefreshCw, FileJson, Cloud, CloudOff, PlugZap, PlayCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { isSupabaseConfigured, testConnection } from '../services/supabaseService';

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
  const [activeTab, setActiveTab] = useState<'general' | 'profile' | 'staff' | 'logs' | 'config' | 'permit-template' | 'data'>('profile');
  
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

  const handleTestConnection = async () => {
      setTestingConnection(true);
      const result = await testConnection();
      setConnectionStatus(result);
      setTestingConnection(false);
      
      // Clear message after 10s
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
          localStorage.removeItem('civicpulse_requests');
          localStorage.removeItem('civicpulse_assets');
          localStorage.removeItem('civicpulse_houses');
          localStorage.removeItem('civicpulse_garage_permits');
          localStorage.removeItem('civicpulse_staff');
          localStorage.removeItem('civicpulse_config');
          localStorage.removeItem('civicpulse_logs');
          localStorage.removeItem('civicpulse_current_user');
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
            {(currentUser.role === 'Admin') && (
              <button 
                onClick={() => setActiveTab('data')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'data' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <Database size={18} />
                Data & Storage
              </button>
            )}
        </div>

        {activeTab === 'data' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Data Management & Persistence</h2>
              <p className="text-sm text-slate-500">Manage your portal's data lifecycle. Your data is synchronized between this browser and the Cloud (if configured).</p>
            </div>

            {/* Cloud Status Panel */}
            <div className={`p-6 rounded-2xl border ${isCloudActive ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isCloudActive ? 'bg-emerald-200/50 text-emerald-700' : 'bg-amber-200/50 text-amber-700'}`}>
                            {isCloudActive ? <Cloud size={24} /> : <CloudOff size={24} />}
                        </div>
                        <div>
                            <h3 className={`font-bold ${isCloudActive ? 'text-emerald-900' : 'text-amber-900'}`}>
                                {isCloudActive ? 'Cloud Sync Active' : 'Offline Mode (Local Only)'}
                            </h3>
                            <p className={`text-sm ${isCloudActive ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {isCloudActive 
                                    ? 'Your data is securely synchronized with Supabase.' 
                                    : 'Missing valid API Keys in .env file.'}
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleTestConnection} 
                        disabled={testingConnection}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm flex items-center gap-2 text-slate-700"
                    >
                        {testingConnection ? <Loader2 className="animate-spin" size={16} /> : <PlayCircle size={16} />}
                        Test Connection
                    </button>
                </div>

                {/* Connection Status Result */}
                {connectionStatus && (
                    <div className={`mt-4 p-3 rounded-lg text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1 ${connectionStatus.success ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {connectionStatus.success ? <CheckCircle2 size={16}/> : <ShieldAlert size={16}/>}
                        {connectionStatus.message}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 mb-4">
                            <Download size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Full Database Export</h3>
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">Download a complete snapshot of all portal records (assets, houses, permits, staff, and logs) as a JSON file. Use this for backups or data migration.</p>
                    </div>
                    <button onClick={handleExportDatabase} className="w-full bg-teal-600 text-white py-2.5 rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2">
                        <FileJson size={18} /> Export Portal Data
                    </button>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                            <RefreshCw size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Restore from Backup</h3>
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">Restore your council records from a previously exported JSON file. <strong>Note:</strong> This will replace all current local data.</p>
                    </div>
                    <button onClick={() => importDatabaseRef.current?.click()} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        <Upload size={18} /> Import Backup File
                    </button>
                    <input type="file" ref={importDatabaseRef} className="hidden" accept=".json" onChange={handleImportDatabase} />
                </div>

                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col justify-between md:col-span-2">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-red-600 flex-shrink-0 shadow-sm">
                            <Trash2 size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-900 mb-1 uppercase tracking-tight">Factory Reset</h3>
                            <p className="text-sm text-red-700 mb-6">Wipe all portal data and reset to factory mock data. This action is destructive and irreversible. Please ensure you have an export if you need your current data.</p>
                            <button onClick={handleClearDatabase} className="bg-red-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20">
                                Reset Database & Reload
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Info size={14}/> Storage Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Requests</p>
                        <p className="text-lg font-black text-slate-800">{localStorage.getItem('civicpulse_requests')?.length || 0} bytes</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Asset Registry</p>
                        <p className="text-lg font-black text-slate-800">{localStorage.getItem('civicpulse_assets')?.length || 0} bytes</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Houses</p>
                        <p className="text-lg font-black text-slate-800">{localStorage.getItem('civicpulse_houses')?.length || 0} bytes</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Permits</p>
                        <p className="text-lg font-black text-slate-800">{localStorage.getItem('civicpulse_garage_permits')?.length || 0} bytes</p>
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* ... existing activeTab logic ... */}
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
    </div>
  );
};

export default Settings;
