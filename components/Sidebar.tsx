
import React from 'react';
import { LayoutDashboard, FileText, BarChart3, Settings, Building2, LogOut, Box, Users, Home, Globe, Hexagon, Car, Database, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { ViewState, UserRole, SystemConfig } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  userRole: UserRole;
  onLogout: () => void;
  systemConfig: SystemConfig;
  syncStatus?: 'idle' | 'syncing' | 'synced' | 'error' | 'local';
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, userRole, onLogout, systemConfig, syncStatus = 'local' }) => {
  const { t, language, setLanguage, isRTL } = useLanguage();
  
  const allNavItems = [
    { id: 'dashboard', label: t('nav_dashboard'), icon: LayoutDashboard, roles: ['Admin', 'Executive', 'Senior Management', 'Staff'] },
    { id: 'requests', label: t('nav_requests'), icon: FileText, roles: ['Admin', 'Executive', 'Senior Management', 'Staff'] },
    { id: 'houses', label: t('nav_houses'), icon: Home, roles: ['Admin', 'Executive', 'Senior Management', 'Staff'] },
    { id: 'assets', label: t('nav_assets'), icon: Box, roles: ['Admin', 'Executive', 'Senior Management'] },
    { id: 'garage', label: t('nav_garage'), icon: Car, roles: ['Admin', 'Executive', 'Senior Management', 'Staff'] },
    { id: 'analytics', label: t('nav_analytics'), icon: BarChart3, roles: ['Admin', 'Executive'] },
    { id: 'settings', label: t('nav_settings'), icon: Settings, roles: ['Admin', 'Executive', 'Senior Management'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  const getSyncBadge = () => {
    switch(syncStatus) {
      case 'syncing':
        return { icon: <RefreshCw size={14} className="animate-spin text-teal-400" />, label: 'Syncing...', color: 'text-teal-400' };
      case 'synced':
        return { icon: <Cloud size={14} className="text-emerald-400" />, label: 'Synced with Cloud', color: 'text-emerald-400' };
      case 'error':
        return { icon: <CloudOff size={14} className="text-red-400" />, label: 'Sync Failed', color: 'text-red-400' };
      case 'local':
        return { icon: <Database size={14} className="text-slate-400" />, label: 'Local Storage Only', color: 'text-slate-400' };
      default:
        return { icon: <Database size={14} className="text-slate-400" />, label: 'Database Active', color: 'text-slate-400' };
    }
  };

  const badge = getSyncBadge();

  return (
    <div className={`w-64 bg-teal-900 text-teal-100 flex flex-col h-screen fixed top-0 z-20 hidden md:flex shadow-2xl transition-all duration-300 ${isRTL ? 'right-0' : 'left-0'}`}>
      <div className={`h-24 flex items-center gap-4 px-6 bg-teal-950 border-b border-teal-800 ${isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
        <div className="bg-white p-2 rounded-lg border-2 border-emerald-500 shadow-lg shadow-teal-900/50 flex-shrink-0">
           <Building2 size={32} className="text-teal-700" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold truncate">{systemConfig.secretariatName}</span>
          <h1 className="font-bold text-white text-sm tracking-tight leading-tight line-clamp-2">{systemConfig.councilName}</h1>
        </div>
      </div>

      <div className="px-4 py-6 flex-1 overflow-y-auto">
        <div className={`text-xs font-bold text-teal-500 uppercase tracking-widest mb-4 px-2 flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            {t('main_menu')}
            <span className="text-[10px] bg-teal-800 text-teal-200 px-1.5 py-0.5 rounded capitalize">{userRole}</span>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id as ViewState)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all duration-200 ${isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'} ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 font-medium' 
                    : 'text-teal-300 hover:bg-teal-800 hover:text-white'
                }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span className="font-medium truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className={`mt-8 px-2 py-3 rounded-xl bg-teal-950/40 border border-teal-800/50 flex items-center gap-3 ${isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
            <div className="relative">
                {badge.icon}
                {syncStatus === 'synced' && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse border border-teal-900"></div>
                )}
            </div>
            <div>
                <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${badge.color}`}>Cloud Sync Status</p>
                <p className="text-[11px] text-teal-500 mt-1 font-medium">{badge.label}</p>
            </div>
        </div>
      </div>

      <div className="p-4 border-t border-teal-800 bg-teal-950 space-y-4">
        <div className="flex bg-teal-900/50 rounded-xl p-1 border border-teal-800/50 shadow-inner">
            <button 
                onClick={() => setLanguage('en')}
                className={`flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-bold transition-all duration-300 ${language === 'en' ? 'bg-emerald-600 text-white shadow-md' : 'text-teal-500 hover:text-teal-300'}`}
            >
                English
            </button>
            <button 
                onClick={() => setLanguage('dv')}
                className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-thaana transition-all duration-300 ${language === 'dv' ? 'bg-emerald-600 text-white shadow-md' : 'text-teal-500 hover:text-teal-300'}`}
            >
                ދިވެހި
            </button>
        </div>

        <button 
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 text-teal-400 hover:text-white transition-colors text-sm font-medium hover:bg-teal-900/50 rounded-lg ${isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          <span>{t('sign_out')}</span>
        </button>
        
        <div className="pt-2 border-t border-teal-900 flex justify-center">
            <div className="flex items-center gap-1.5 text-teal-600/40 hover:text-teal-400 transition-colors cursor-default">
                <Hexagon size={12} />
                <span className="text-[9px] font-black tracking-widest uppercase">Aboa Works</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
