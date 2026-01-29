
import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole, AssetCategory, AssetStatusConfig, SystemConfig, TemplateFieldPos } from '../types';
import { UserCircle, Upload, Save, Plus, Trash2, Shield, Mail, Check, Camera, X, Layers, Activity, Globe, Key, FileBadge, Briefcase, UserSquare2, FileText, Layout, Move, Settings as SettingsIcon, Eye, Type, Bold, Info } from 'lucide-react';
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

const Settings: React.FC<SettingsProps> = ({ currentUser, onUpdateUser, assetCategories = [], onUpdateCategories, assetStatuses = [], onUpdateStatuses, systemConfig, onUpdateSystemConfig }) => {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'general' | 'profile' | 'staff' | 'config' | 'permit-template'>('profile');
  
  // Profile State
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const templateInputRef = useRef<HTMLInputElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // General Settings State - Local copy for editing
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

  // Sync with props when they change
  useEffect(() => {
    if (systemConfig) {
      setLocalSystemConfig(systemConfig);
    }
  }, [systemConfig]);

  // Template Editor State
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setAvatar(url);
    }
  };

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setLocalSystemConfig(prev => ({
          ...prev,
          garagePermitTemplate: {
            ...prev.garagePermitTemplate,
            backgroundImage: base64,
            useCustomTemplate: true
          }
        }));
      };
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
                    onClick={() => setActiveTab('permit-template')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'permit-template' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Layout size={18} />
                    Permit Template
                </button>
            )}
        </div>

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
    </div>
  );
};

export default Settings;
