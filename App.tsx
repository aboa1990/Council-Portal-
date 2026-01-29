import React, { useState } from 'react';
import { ViewState, CitizenRequest, RequestStatus, Asset, User, UserRole, House, AssetCategory, AssetStatusConfig, SystemConfig, GaragePermit } from './types';
import { MOCK_REQUESTS, MOCK_ASSETS, MOCK_HOUSES, DEFAULT_ASSET_CATEGORIES, DEFAULT_ASSET_STATUSES, MOCK_GARAGE_PERMITS } from './constants';
import Sidebar from './components/Sidebar';
import DashboardStats from './components/DashboardStats';
import RequestList from './components/RequestList';
import RequestDetail from './components/RequestDetail';
import AssetRegistry from './components/AssetRegistry';
import AssetDetail from './components/AssetDetail';
import HouseRegistry from './components/HouseRegistry';
import GaragePermitRegistry from './components/GaragePermitRegistry';
import AIChat from './components/AIChat';
import Login from './components/Login';
import Settings from './components/Settings';
import { Menu } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

const AppContent: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // App State
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [requests, setRequests] = useState<CitizenRequest[]>(MOCK_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<CitizenRequest | null>(null);
  
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetCategories, setAssetCategories] = useState<AssetCategory[]>(DEFAULT_ASSET_CATEGORIES);
  const [assetStatuses, setAssetStatuses] = useState<AssetStatusConfig[]>(DEFAULT_ASSET_STATUSES);

  const [houses, setHouses] = useState<House[]>(MOCK_HOUSES);
  const [garagePermits, setGaragePermits] = useState<GaragePermit[]>(MOCK_GARAGE_PERMITS);

  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
      councilName: 'Hanimaadhoo Council',
      secretariatName: 'Secretariat of'
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { t, isRTL } = useLanguage();

  // Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  const handleUpdateProfile = (updatedUser: User) => {
      setCurrentUser(updatedUser);
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
    const updated = requests.map(r => r.id === id ? { ...r, status } : r);
    setRequests(updated);
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

    setRequests([newRequest, ...requests]);
  };

  const handleImportAssets = (newAssets: Asset[]) => {
      setAssets([...newAssets, ...assets]);
  };

  const handleUpdateAsset = (updatedAsset: Asset) => {
      setAssets(assets.map(a => a.id === updatedAsset.id ? updatedAsset : a));
      // If we are viewing details of this asset, update the view as well
      if (selectedAsset && selectedAsset.id === updatedAsset.id) {
          setSelectedAsset(updatedAsset);
      }
  };

  const handleDeleteAsset = (assetId: string) => {
      setAssets(assets.filter(a => a.id !== assetId));
      if (selectedAsset && selectedAsset.id === assetId) {
          setSelectedAsset(null);
      }
  };

  const handleAddHouse = (newHouse: House) => {
      setHouses([newHouse, ...houses]);
  };

  const handleAddGaragePermit = (newPermit: GaragePermit) => {
      setGaragePermits([newPermit, ...garagePermits]);
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
    // Detail View Routing
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

    // Main Views
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
      case 'houses':
        return (
            <HouseRegistry 
                houses={houses}
                onAddHouse={handleAddHouse}
            />
        );
      case 'assets':
        // Role check for assets
        if (currentUser?.role === 'Staff') {
            return (
                <div className="flex flex-col items-center justify-center h-96 text-slate-500 bg-white rounded-lg border border-slate-200">
                    <p>Access Restricted: Supervisors, Secretary General and Admin only.</p>
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
            />
        );
      case 'garage':
        return (
            <GaragePermitRegistry
                permits={garagePermits}
                onAddPermit={handleAddGaragePermit}
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
    return <Login onLogin={handleLogin} systemConfig={systemConfig} />;
  }

  return (
    <div 
        className={`flex min-h-screen bg-slate-50 text-slate-900 ${isRTL ? 'font-thaana' : 'font-sans'}`}
        dir={isRTL ? 'rtl' : 'ltr'}
    >
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
             <div className={`absolute top-0 h-full bg-white w-64 shadow-xl p-4 ${isRTL ? 'right-0' : 'left-0'}`} onClick={e => e.stopPropagation()}>
                <h2 className="font-bold text-lg mb-6 text-teal-800">{t('menu')}</h2>
                <button onClick={() => { setCurrentView('dashboard'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 border-b border-slate-100 text-slate-600">{t('nav_dashboard')}</button>
                <button onClick={() => { setCurrentView('requests'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 border-b border-slate-100 text-slate-600">{t('nav_requests')}</button>
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
      />

      {/* Main Layout margin adjustment for RTL/LTR */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isRTL ? 'md:mr-64' : 'md:ml-64'}`}>
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
             <div className="bg-teal-700 w-8 h-8 rounded flex items-center justify-center text-white font-bold">H</div>
             <h1 className="font-bold text-lg text-slate-900">{systemConfig.councilName}</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 hover:bg-slate-50 rounded">
            <Menu />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
            <div className="mb-6 flex justify-between items-end border-b border-slate-200 pb-4">
                <div className="flex items-center gap-4">
                     {/* Avatar Display */}
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
                        <h2 className="text-2xl font-bold text-slate-900 capitalize tracking-tight">
                            {selectedRequest ? 'Request Details' : selectedAsset ? 'Asset Details' : currentView === 'dashboard' ? systemConfig.councilName : currentView.replace('-', ' ')}
                        </h2>
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