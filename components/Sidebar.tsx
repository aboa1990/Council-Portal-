import React from 'react';
import { LayoutDashboard, FileText, BarChart3, Settings, Building2, LogOut, Box, Users, Home, Globe, Hexagon } from 'lucide-react';
import { ViewState, UserRole, SystemConfig } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  userRole: UserRole;
  onLogout: () => void;
  systemConfig: SystemConfig;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, userRole, onLogout, systemConfig }) => {
  const { t, language, setLanguage, isRTL } = useLanguage();
  
  const allNavItems = [
    { id: 'dashboard', label: t('nav_dashboard'), icon: LayoutDashboard, roles: ['Admin', 'Secretary General', 'Supervisor', 'Staff'] },
    { id: 'requests', label: t('nav_requests'), icon: FileText, roles: ['Admin', 'Secretary General', 'Supervisor', 'Staff'] },
    { id: 'houses', label: t('nav_houses'), icon: Home, roles: ['Admin', 'Secretary General', 'Supervisor', 'Staff'] },
    { id: 'assets', label: t('nav_assets'), icon: Box, roles: ['Admin', 'Secretary General', 'Supervisor'] },
    { id: 'analytics', label: t('nav_analytics'), icon: BarChart3, roles: ['Admin', 'Secretary General'] },
    { id: 'settings', label: t('nav_settings'), icon: Settings, roles: ['Admin', 'Secretary General'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  return (
    <div className={`w-64 bg-teal-900 text-teal-100 flex flex-col h-screen fixed top-0 z-20 hidden md:flex shadow-2xl transition-all duration-300 ${isRTL ? 'right-0 font-thaana' : 'left-0 font-sans'}`}>
      {/* Council Branding Header */}
      <div className="h-24 flex items-center gap-4 px-6 bg-teal-950 border-b border-teal-800">
        <div className="bg-white p-2 rounded-lg border-2 border-emerald-500 shadow-lg shadow-teal-900/50">
           {/* Primary Logo Placement */}
           <Building2 size={32} className="text-teal-700" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">{systemConfig.secretariatName}</span>
          <h1 className="font-bold text-white text-sm tracking-tight leading-tight">{systemConfig.councilName}</h1>
        </div>
      </div>

      <div className="px-4 py-6 flex-1 overflow-y-auto">
        <div className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-4 px-2 flex justify-between items-center">
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
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all duration-200 ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 font-medium' 
                    : 'text-teal-300 hover:bg-teal-800 hover:text-white'
                }`}
              >
                <Icon size={18} className={isRTL ? 'ml-0' : ''} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-teal-800 bg-teal-950 space-y-3">
         {/* Language Switcher */}
        <div className="flex bg-teal-900 rounded-lg p-1 border border-teal-800">
            <button 
                onClick={() => setLanguage('en')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-colors ${language === 'en' ? 'bg-emerald-600 text-white shadow-sm' : 'text-teal-400 hover:text-white'}`}
            >
                English
            </button>
            <button 
                onClick={() => setLanguage('dv')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium font-thaana transition-colors ${language === 'dv' ? 'bg-emerald-600 text-white shadow-sm' : 'text-teal-400 hover:text-white'}`}
            >
                ދިވެހި
            </button>
        </div>

        <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-teal-400 hover:text-white transition-colors text-sm font-medium hover:bg-teal-900 rounded-lg"
        >
          <LogOut size={18} />
          <span>{t('sign_out')}</span>
        </button>
        
        {/* Aboa Works Footer */}
        <div className="pt-2 mt-2 border-t border-teal-900 flex justify-center">
            <div className="flex items-center gap-1.5 text-teal-600 opacity-60 hover:opacity-100 transition-opacity cursor-default">
                <Hexagon size={12} />
                <span className="text-[10px] font-semibold tracking-wide uppercase">Aboa Works</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;