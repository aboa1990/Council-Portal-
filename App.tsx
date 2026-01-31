
import React, { useState, useEffect, useRef } from 'react';
import { ViewState, CitizenRequest, RequestStatus, Asset, User, UserRole, House, AssetCategory, AssetStatusConfig, SystemConfig, GaragePermit, TemplateFieldPos, AccessLog, RequisitionForm } from './types';
import { MOCK_REQUESTS, MOCK_ASSETS, MOCK_HOUSES, DEFAULT_ASSET_CATEGORIES, DEFAULT_ASSET_STATUSES, MOCK_GARAGE_PERMITS, MOCK_STAFF, DEFAULT_FIELD_POSITIONS } from './constants';
import Sidebar from './components/Sidebar';
import DashboardStats from './components/DashboardStats';
import RequestList from './components/RequestList';
import RequestDetail from './components/RequestDetail';
import AssetRegistry from './components/AssetRegistry';
import AssetDetail from './components/AssetDetail';
import HouseRegistry from './components/HouseRegistry';
import GaragePermitRegistry from './components/GaragePermitRegistry';
import HudhaForms from './components/HudhaForms';
import AIChat from './components/AIChat';
import Login from './components/Login';
import Settings from './components/Settings';
import { Menu, Cloud, CloudOff, RefreshCw, AlertTriangle, Database, Terminal } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { fetchPortalState, savePortalState, isSupabaseConfigured, testConnection } from './services/supabaseService';

const STORAGE_KEYS = {
  REQUESTS: 'civicpulse_requests',
  ASSETS: 'civicpulse_assets',
  HOUSES: 'civicpulse_houses',
  GARAGE_PERMITS: 'civicpulse_garage_permits',
  REQUISITION_FORMS: 'civicpulse_requisitions',
  STAFF: 'civicpulse_staff',
  CONFIG: 'civicpulse_config',
  LOGS: 'civicpulse_logs',
  USER: 'civicpulse_current_user'
};

// CONSTANT KEY for Database Syncing - Ensures all PCs look at the same record
const DB_SYNC_KEY = 'OFFICIAL_PORTAL_STATE';

const AppContent: React.FC = () => {
  const loadLocal = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === 'null' || saved === 'undefined') return fallback;
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      console.error(`Error loading ${key}`, e);
      return fallback;
    }
  };

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadLocal<User | null>(STORAGE_KEYS.USER, null));
  const [staffMembers, setStaffMembers] = useState<User[]>(() => loadLocal<User[]>(STORAGE_KEYS.STAFF, MOCK_STAFF));
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(() => loadLocal<AccessLog[]>(STORAGE_KEYS.LOGS, []));

  // App Data State
  const [requests, setRequests] = useState<CitizenRequest[]>(() => loadLocal<CitizenRequest[]>(STORAGE_KEYS.REQUESTS, MOCK_REQUESTS));
  const [assets, setAssets] = useState<Asset[]>(() => loadLocal<Asset[]>(STORAGE_KEYS.ASSETS, MOCK_ASSETS));
  const [houses, setHouses] = useState<House[]>(() => loadLocal<House[]>(STORAGE_KEYS.HOUSES, MOCK_HOUSES));
  const [garagePermits, setGaragePermits] = useState<GaragePermit[]>(() => loadLocal<GaragePermit[]>(STORAGE_KEYS.GARAGE_PERMITS, MOCK_GARAGE_PERMITS));
  const [requisitionForms, setRequisitionForms] = useState<RequisitionForm[]>(() => loadLocal<RequisitionForm[]>(STORAGE_KEYS.REQUISITION_FORMS, []));

  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedRequest, setSelectedRequest] = useState<CitizenRequest | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  
  const [assetCategories, setAssetCategories] = useState<AssetCategory[]>(DEFAULT_ASSET_CATEGORIES);
  const [assetStatuses, setAssetStatuses] = useState<AssetStatusConfig[]>(DEFAULT_ASSET_STATUSES);

  // Robust System Config Initialization with Deep Merge
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => {
      const saved = loadLocal<SystemConfig | null>(STORAGE_KEYS.CONFIG, null);
      const defaults: SystemConfig = {
          councilName: 'Hanimaadhoo Council',
          secretariatName: 'Secretariat of',
          inventoryPrefix: '258',
          garagePermitTemplate: {
              title: 'GARAGE UTILIZATION PERMIT',
              header: 'SECRETARIAT OF THE HANIMAADHOO COUNCIL\nNORTH THILADHUNMATHI, MALDIVES',
              footer: 'This permit is issued in accordance with the Land Management Regulations. Any alterations to the registered garage space or vehicle must be reported within 7 days.',
              declaration: 'This document serves as an official confirmation that the following vehicle is authorized to utilize the designated garage space as registered with the Council records.',
              useCustomTemplate: false,
              fieldPositions: DEFAULT_FIELD_POSITIONS
          }
      };

      if (!saved) return defaults;

      // Ensure critical nested structures exist
      return {
          ...defaults,
          ...saved,
          garagePermitTemplate: {
              ...defaults.garagePermitTemplate,
              ...(saved.garagePermitTemplate || {}),
              fieldPositions: {
                  ...defaults.garagePermitTemplate.fieldPositions,
                  ...(saved.garagePermitTemplate?.fieldPositions || {})
              }
          }
      };
  });

  // DB Sync States
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error' | 'local'>(isSupabaseConfigured() ? 'idle' : 'local');
  const [dbConnectionError, setDbConnectionError] = useState<string | null>(null);
  const isInitialLoad = useRef(true);

  // Language and UI state
  const { t, isRTL } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Apply Custom Font Effect
  useEffect(() => {
    const styleId = 'custom-dhivehi-font-style';
    let styleTag = document.getElementById(styleId);

    if (systemConfig.customDhivehiFont) {
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = styleId;
            document.head.appendChild(styleTag);
        }
        
        // Comprehensive Style Injection for Custom Font
        styleTag.innerHTML = `
            @font-face {
                font-family: 'CustomDhivehiFont';
                src: url('${systemConfig.customDhivehiFont}');
                font-display: swap;
            }
            #civic-portal-root[dir="rtl"],
            #civic-portal-root[dir="rtl"] * {
                font-family: 'CustomDhivehiFont', 'Noto Sans Thaana', sans-serif !important;
            }
            #civic-portal-root[dir="rtl"] input,
            #civic-portal-root[dir="rtl"] textarea,
            #civic-portal-root[dir="rtl"] select,
            #civic-portal-root[dir="rtl"] button {
                font-family: 'CustomDhivehiFont', 'Noto Sans Thaana', sans-serif !important;
            }
        `;
    } else {
        if (styleTag) {
            styleTag.remove();
        }
    }
  }, [systemConfig.customDhivehiFont]);

  // Background Sync from Supabase on mount
  useEffect(() => {
    if (isSupabaseConfigured()) {
      const initCloud = async () => {
        const connection = await testConnection();
        if (!connection.success) {
            setDbConnectionError(connection.message);
            setSyncStatus('error');
            return;
        }

        setSyncStatus('syncing');
        // Use CONSTANT Key
        const cloudData = await fetchPortalState(DB_SYNC_KEY);
        if (cloudData) {
          if (cloudData.requests) setRequests(cloudData.requests);
          if (cloudData.assets) setAssets(cloudData.assets);
          if (cloudData.houses) setHouses(cloudData.houses);
          if (cloudData.garagePermits) setGaragePermits(cloudData.garagePermits);
          if (cloudData.requisitionForms) setRequisitionForms(cloudData.requisitionForms);
          if (cloudData.staffMembers) setStaffMembers(cloudData.staffMembers);
          if (cloudData.systemConfig) setSystemConfig(cloudData.systemConfig);
          if (cloudData.accessLogs) setAccessLogs(cloudData.accessLogs);
          setSyncStatus('synced');
        } else {
          setSyncStatus('idle');
        }
        isInitialLoad.current = false;
      };
      initCloud();
    }
  }, []);

  // Sync state to localStorage AND Supabase
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
    localStorage.setItem(STORAGE_KEYS.HOUSES, JSON.stringify(houses));
    localStorage.setItem(STORAGE_KEYS.GARAGE_PERMITS, JSON.stringify(garagePermits));
    localStorage.setItem(STORAGE_KEYS.REQUISITION_FORMS, JSON.stringify(requisitionForms));
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffMembers));
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(systemConfig));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(accessLogs));
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));

    if (!isInitialLoad.current && isSupabaseConfigured() && !dbConnectionError) {
      const syncToCloud = async () => {
        setSyncStatus('syncing');
        // Use CONSTANT Key
        const success = await savePortalState(DB_SYNC_KEY, {
          requests, assets, houses, garagePermits, requisitionForms, staffMembers, systemConfig, accessLogs
        });
        setSyncStatus(success ? 'synced' : 'error');
      };
      const timer = setTimeout(syncToCloud, 2000);
      return () => clearTimeout(timer);
    }
  }, [requests, assets, houses, garagePermits, requisitionForms, staffMembers, systemConfig, accessLogs, currentUser, dbConnectionError]);

  const handleAddAccessLog = (action: string, details: string) => {
    if (!currentUser) return;
    const log: AccessLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      action,
      timestamp: new Date().toISOString(),
      details
    };
    setAccessLogs(prev => [log, ...prev]);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
    handleAddAccessLog('Login', 'User successfully logged into the system.');
  };

  const handleLogout = () => {
    if (currentUser) {
        handleAddAccessLog('Logout', 'User logged out.');
    }
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  const handleUpdateProfile = (updatedUser: User) => {
      setCurrentUser(updatedUser);
      setStaffMembers(prev => prev.map(s => s.id === updatedUser.id ? updatedUser : s));
  };

  const handleUpdateStaff = (updatedStaff: User[]) => {
      setStaffMembers(updatedStaff);
  };

  const handleSelectRequest = (req: CitizenRequest) => {
    setSelectedRequest(req);
    setSelectedAsset(null);
    setCurrentView('requests');
  };

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setSelectedRequest(null);
    setCurrentView('assets');
  }

  const handleUpdateStatus = (id: string, status: RequestStatus) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest({ ...selectedRequest, status });
    }
  };

  const handleAddRequest = (data: Partial<CitizenRequest>) => {
    const newId = `REQ-${new Date().getFullYear()}-${String(requests.length + 1).padStart(3, '0')}`;
    const newRequest: CitizenRequest = {
        id: newId,
        citizenName: data.citizenName || 'Unknown',
        title: data.title || 'No Title',
        description: data.description || '',
        category: data.category || 'General',
        status: RequestStatus.NEW,
        priority: data.priority || 'Medium',
        date: new Date().toISOString(),
        location: data.location || 'Not specified'
    } as CitizenRequest;
    setRequests(prev => [newRequest, ...prev]);
  };

  const handleImportAssets = (newAssets: Asset[]) => {
      setAssets(prev => [...newAssets, ...prev]);
  };

  const handleUpdateAsset = (updatedAsset: Asset) => {
      setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
      if (selectedAsset && selectedAsset.id === updatedAsset.id) {
          setSelectedAsset(updatedAsset);
      }
  };

  const handleDeleteAsset = (assetId: string) => {
      setAssets(prev => prev.filter(a => a.id !== assetId));
      if (selectedAsset && selectedAsset.id === assetId) {
          setSelectedAsset(null);
      }
  };

  const handleAddHouse = (newHouse: House) => {
      setHouses(prev => [newHouse, ...prev]);
  };

  const handleAddGaragePermit = (newPermit: GaragePermit) => {
      setGaragePermits(prev => [newPermit, ...prev]);
  };

  const handleUpdateGaragePermit = (updatedPermit: GaragePermit) => {
      setGaragePermits(prev => prev.map(p => p.permitId === updatedPermit.permitId ? updatedPermit : p));
  };

  const handleDeleteGaragePermit = (permitId: string) => {
    setGaragePermits(prev => prev.filter(p => p.permitId !== permitId));
  };

  const handleAddRequisitionForm = (newForm: RequisitionForm) => {
      setRequisitionForms(prev => [newForm, ...prev]);
      handleAddAccessLog('Requisition Created', `New form ${newForm.id} created by ${currentUser?.name}`);
  };

  const handleUpdateCategories = (newCategories: AssetCategory[]) => {
      setAssetCategories(newCategories);
  };

  const handleUpdateStatuses = (newStatuses: AssetStatusConfig[]) => {
      setAssetStatuses(newStatuses);
  };

  const handleUpdateSystemConfig = (newConfig: SystemConfig) => {
      setSystemConfig(newConfig);
  }

  const renderContent = () => {
    if (selectedRequest) {
      return (
        <RequestDetail 
          request={selectedRequest} 
          onBack={() => setSelectedRequest(null)} 
          onUpdateStatus={handleUpdateStatus}
        />
      );
    }

    if (selectedAsset) {
        return (
            <AssetDetail 
                asset={selectedAsset}
                statuses={assetStatuses}
                onBack={() => setSelectedAsset(null)}
            />
        )
    }

    switch (currentView) {
      case 'dashboard':
        return <DashboardStats requests={requests} assets={assets} />;
      case 'requests':
        return (
            <RequestList 
                requests={requests} 
                onSelectRequest={handleSelectRequest} 
                onAddRequest={handleAddRequest}
            />
        );
      case 'hudha':
        return (
            <HudhaForms 
                systemConfig={systemConfig} 
                currentUser={currentUser!} 
                requisitionForms={requisitionForms}
                onAddRequisition={handleAddRequisitionForm}
            />
        );
      case 'houses':
        return (
            <HouseRegistry 
                houses={houses}
                onAddHouse={handleAddHouse}
            />
        );
      case 'assets':
        if (currentUser?.role === 'Staff') {
            return (
                <div className="flex flex-col items-center justify-center h-96 text-slate-500 bg-white rounded-lg border border-slate-200">
                    <p>Access Restricted: Executive, Senior Management and Admin only.</p>
                </div>
            )
        }
        return (
            <AssetRegistry 
                currentUser={currentUser!}
                assets={assets} 
                categories={assetCategories}
                statuses={assetStatuses}
                onSelectAsset={handleSelectAsset} 
                onImportAssets={handleImportAssets}
                onUpdateAsset={handleUpdateAsset}
                onDeleteAsset={handleDeleteAsset}
                systemConfig={systemConfig}
            />
        );
      case 'garage':
        return (
            <GaragePermitRegistry
                currentUser={currentUser!}
                permits={garagePermits}
                onAddPermit={handleAddGaragePermit}
                onUpdatePermit={handleUpdateGaragePermit}
                onDeletePermit={handleDeleteGaragePermit}
                systemConfig={systemConfig}
            />
        );
      case 'analytics':
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
                <div className="text-6xl mb-4">📊</div>
                <h2 className="text-xl font-medium">Advanced Analytics Module</h2>
                <p className="mt-2">Connecting to Hanimaadhoo Data Warehouse...</p>
            </div>
        );
      case 'settings':
        return (
            <Settings 
                currentUser={currentUser!}
                onUpdateUser={handleUpdateProfile}
                staffMembers={staffMembers}
                onUpdateStaff={handleUpdateStaff}
                onAddAccessLog={handleAddAccessLog}
                accessLogs={accessLogs}
                assetCategories={assetCategories}
                onUpdateCategories={handleUpdateCategories}
                assetStatuses={assetStatuses}
                onUpdateStatuses={handleUpdateStatuses}
                systemConfig={systemConfig}
                onUpdateSystemConfig={handleUpdateSystemConfig}
            />
        );
      default:
        return <DashboardStats requests={requests} assets={assets} />;
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} systemConfig={systemConfig} staffList={staffMembers} />;
  }

  return (
    <div 
        id="civic-portal-root"
        className={`flex min-h-screen bg-slate-50 text-slate-900 ${isRTL ? 'font-thaana' : 'font-sans'}`}
        dir={isRTL ? 'rtl' : 'ltr'}>
      
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
             <div className={`absolute top-0 h-full bg-white w-64 shadow-xl p-4 ${isRTL ? 'right-0' : 'left-0'}`} onClick={e => e.stopPropagation()}>
                <h2 className="font-bold text-lg mb-6 text-teal-800">{t('menu')}</h2>
                <button onClick={() => { setCurrentView('dashboard'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 border-b border-slate-100 text-slate-600">{t('nav_dashboard')}</button>
                <button onClick={() => { setCurrentView('requests'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 border-b border-slate-100 text-slate-600">{t('nav_requests')}</button>
                <button onClick={() => { setCurrentView('hudha'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 border-b border-slate-100 text-slate-600">{t('nav_hudha')}</button>
                <button onClick={() => { setCurrentView('houses'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 border-b border-slate-100 text-slate-600">{t('nav_houses')}</button>
                <button onClick={() => { setCurrentView('assets'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 border-b border-slate-100 text-slate-600">{t('nav_assets')}</button>
                 <button onClick={() => { setCurrentView('garage'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 border-b border-slate-100 text-slate-600">{t('nav_garage')}</button>
                <button onClick={handleLogout} className="mt-4 text-sm text-red-500 font-medium">{t('sign_out')}</button>
             </div>
        </div>
      )}

      <Sidebar 
        currentView={currentView} 
        onChangeView={(view) => {
            setCurrentView(view);
            setSelectedRequest(null);
            setSelectedAsset(null);
        }}
        userRole={currentUser.role}
        onLogout={handleLogout}
        systemConfig={systemConfig}
        syncStatus={syncStatus}
      />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isRTL ? 'md:mr-64' : 'md:ml-64'}`}>
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
             {systemConfig.councilLogo ? (
                 <img src={systemConfig.councilLogo} alt="Logo" className="w-8 h-8 object-contain" />
             ) : (
                 <div className="bg-teal-700 w-8 h-8 rounded flex items-center justify-center text-white font-bold">H</div>
             )}
             <h1 className="font-bold text-lg text-slate-900">{systemConfig.councilName}</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 hover:bg-slate-50 rounded">
            <Menu />
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
            {/* OFFLINE MODE WARNING */}
            {!isSupabaseConfigured() && (
                <div className="bg-amber-50 border border-amber-200 p-4 mb-6 rounded-lg flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex-shrink-0 mt-0.5">
                        <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-amber-800">Running in Local Storage Mode</h3>
                        <p className="text-sm text-amber-700 mt-1">
                            Your data is saved to this browser only. To enable Cloud Sync, create a <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 border border-amber-200">.env</code> file with your Supabase keys.
                        </p>
                    </div>
                </div>
            )}

            {/* DATABASE CONNECTION ERROR */}
            {dbConnectionError && (
                 <div className="bg-red-50 border border-red-200 p-4 mb-6 rounded-lg flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex-shrink-0 mt-0.5">
                        <Database className="h-5 w-5 text-red-600" aria-hidden="true" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-red-800">Database Setup Required</h3>
                        <p className="text-sm text-red-700 mt-1 mb-2">
                            {dbConnectionError}
                        </p>
                        {dbConnectionError.includes('does not exist') && (
                            <div className="bg-red-100 p-3 rounded text-xs font-mono text-red-900 border border-red-200">
                                <p className="font-bold mb-1 flex items-center gap-1"><Terminal size={12}/> Run this in Supabase SQL Editor:</p>
                                create table if not exists council_portal_state (
                                  council_name text primary key,
                                  data jsonb not null,
                                  last_updated timestamptz default now()
                                );
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="mb-6 flex justify-between items-end border-b border-slate-200 pb-4">
                <div className="flex items-center gap-4">
                     <div className="hidden md:block">
                        {currentUser.avatar ? (
                            <img src={currentUser.avatar} alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-teal-500 shadow-sm" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold border-2 border-teal-500 shadow-sm text-lg">
                                {currentUser.name.charAt(0)}
                            </div>
                        )}
                     </div>
                     <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-bold text-slate-900 capitalize tracking-tight">
                              {selectedRequest ? 'Request Details' : selectedAsset ? 'Asset Details' : currentView === 'dashboard' ? systemConfig.councilName : currentView === 'hudha' ? 'Hudha Forms' : currentView.replace('-', ' ')}
                          </h2>
                          {syncStatus === 'syncing' && <RefreshCw size={16} className="animate-spin text-teal-500" />}
                        </div>
                        <p className="text-slate-500 text-sm mt-1">
                            {t('welcome_back')}, <span className="font-medium text-teal-700">{currentUser.name}</span> ({currentUser.role})
                        </p>
                    </div>
                </div>
            </div>
            
            {renderContent()}
        </main>
      </div>

      <AIChat />
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;
