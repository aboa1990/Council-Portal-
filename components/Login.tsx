
import React, { useState } from 'react';
import { User, UserRole, SystemConfig } from '../types';
import { Building2, Lock, ArrowRight, UserCircle2, ShieldCheck, Hexagon, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginProps {
  onLogin: (user: User) => void;
  systemConfig: SystemConfig;
  staffList: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, systemConfig, staffList }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, isRTL } = useLanguage();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Simulate API delay and check credentials
    setTimeout(() => {
      // 1. Check against the managed staff list (from LocalStorage or DB)
      let staffMember = staffList.find(s => 
        (s.email.toLowerCase() === username.toLowerCase() || s.name.toLowerCase() === username.toLowerCase()) && 
        (s.password === password || (!s.password && password === 'password123'))
      );

      // 2. FAILSAFE / RECOVERY LOGIN
      // This ensures that even if the database is disconnected or local storage is empty on a new device,
      // the administrator can always log in with the default credentials.
      if (!staffMember && (username.toLowerCase() === 'admin' || username.toLowerCase() === 'admin@hanimaadhoo.gov.mv') && password === 'admin') {
          staffMember = {
            id: 'MASTER-ADMIN',
            name: 'System Administrator',
            role: 'Admin',
            email: 'admin@hanimaadhoo.gov.mv',
            designation: 'Recovery Access',
            rcNo: 'MASTER',
            address: 'System Root',
            joinedDate: new Date().toISOString()
          };
      }

      if (staffMember) {
        onLogin(staffMember);
      } else {
        setError('Access Denied: Invalid credentials. Please contact your System Administrator.');
      }
      setLoading(false);
    }, 1200);
  };

  const titleLine1 = systemConfig.loginTitle || "Digital Governance";
  const titleLine2 = systemConfig.loginHighlight || "Reimagined.";
  const subtitle = systemConfig.loginSubtitle || t('login_subtitle').replace('Hanimaadhoo Council', systemConfig.councilName);

  return (
    <div className={`min-h-screen flex items-stretch relative overflow-hidden bg-slate-50 ${isRTL ? 'font-thaana' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Left Side - Visual & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-teal-900 items-center justify-center overflow-hidden">
        {/* Abstract shapes/background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-800 to-emerald-900 z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        
        {/* Content */}
        <div className="relative z-10 p-12 text-white max-w-lg">
           <div className="mb-8 inline-block p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl overflow-hidden">
               {systemConfig.councilLogo ? (
                   <img src={systemConfig.councilLogo} alt="Logo" className="w-auto h-20 object-contain" />
               ) : (
                   <Building2 size={48} className="text-emerald-300" />
               )}
           </div>
           <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
             {titleLine1} <br/>
             <span className="text-emerald-400">{titleLine2}</span>
           </h1>
           <p className="text-teal-100 text-lg leading-relaxed mb-8 opacity-90">
             {subtitle}
           </p>
           
           <div className="grid grid-cols-2 gap-4 text-sm text-teal-200/80 mt-12 border-t border-teal-700/50 pt-8">
              <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-teal-800/50"><ShieldCheck size={20}/></div>
                 <span>{t('secure_access')}</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-teal-800/50"><UserCircle2 size={20}/></div>
                 <span>{t('role_control')}</span>
              </div>
           </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
         <div className="w-full max-w-md space-y-8 animate-fade-in flex flex-col min-h-[500px]">
            <div className={`text-center ${isRTL ? 'lg:text-right' : 'lg:text-left'}`}>
                <div className="lg:hidden inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-100 text-teal-700 mb-6 overflow-hidden p-2">
                     {systemConfig.councilLogo ? (
                        <img src={systemConfig.councilLogo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                        <Building2 size={32} />
                    )}
                </div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{t('login_heading')}</h2>
                <p className="text-slate-500 mt-2">{t('login_instruction')}</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6 mt-4 flex-1">
                
                {/* Username Input */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">{t('login_id_label')}</label>
                    <div className="relative group">
                        <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors`}>
                            <UserCircle2 size={20} />
                        </div>
                        <input 
                            type="text" 
                            required
                            className={`block w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white`}
                            placeholder="Staff Name or Email"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                    </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-slate-700">{t('login_pass_label')}</label>
                    </div>
                    <div className="relative group">
                        <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors`}>
                            <Lock size={20} />
                        </div>
                        <input 
                            type="password" 
                            required
                            className={`block w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white`}
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('login_verifying')}
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            {t('login_button')} <ArrowRight size={18} className={isRTL ? 'rotate-180' : ''} />
                        </span>
                    )}
                </button>
            </form>

            <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col items-center">
                <div className="flex items-center gap-2 text-slate-400 opacity-60 hover:opacity-100 transition-opacity">
                    <Hexagon size={16} />
                    <span className="text-xs font-semibold tracking-wide">Powered by Aboa Works</span>
                </div>
                 <p className="text-xs text-slate-300 mt-2">© 2024 {systemConfig.secretariatName} {systemConfig.councilName}</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Login;
