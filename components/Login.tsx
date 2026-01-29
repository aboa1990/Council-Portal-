import React, { useState } from 'react';
import { User, UserRole, SystemConfig } from '../types';
import { Building2, Lock, ArrowRight, UserCircle2, ShieldCheck, Hexagon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginProps {
  onLogin: (user: User) => void;
  systemConfig: SystemConfig;
}

const Login: React.FC<LoginProps> = ({ onLogin, systemConfig }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { t, isRTL } = useLanguage();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API delay and Role Logic based on username for demo purposes
    // In production, the backend returns the role.
    const lowerUser = username.toLowerCase();
    let assignedRole: UserRole = 'Staff';
    
    if (lowerUser.includes('admin')) {
        assignedRole = 'Admin';
    } else if (lowerUser.includes('manager') || lowerUser.includes('sg') || lowerUser.includes('sec')) {
        assignedRole = 'Secretary General';
    } else if (lowerUser.includes('sup')) {
        assignedRole = 'Supervisor';
    }

    setTimeout(() => {
      onLogin({
        id: 'USR-' + Math.floor(Math.random() * 1000),
        name: username || 'Council Staff',
        role: assignedRole,
        email: `${(username || 'staff').toLowerCase().replace(' ', '.')}@hanimaadhoo.gov.mv`,
        designation: assignedRole === 'Admin' ? 'IT Admin' : 'Officer',
        idNo: 'A123456',
        rcNo: 'RC-999',
        sex: 'Male'
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className={`min-h-screen flex items-stretch relative overflow-hidden bg-slate-50 ${isRTL ? 'font-thaana' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Left Side - Visual & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-teal-900 items-center justify-center overflow-hidden">
        {/* Abstract shapes/background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-800 to-emerald-900 z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        
        {/* Content */}
        <div className="relative z-10 p-12 text-white max-w-lg">
           <div className="mb-8 inline-block p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
               <Building2 size={48} className="text-emerald-300" />
           </div>
           <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
             {t('login_title')} <br/>
             <span className="text-emerald-400">Reimagined.</span>
           </h1>
           <p className="text-teal-100 text-lg leading-relaxed mb-8 opacity-90">
             {t('login_subtitle').replace('Hanimaadhoo Council', systemConfig.councilName)}
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
                <div className="lg:hidden inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-700 mb-6">
                    <Building2 size={32} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{t('login_heading')}</h2>
                <p className="text-slate-500 mt-2">{t('login_instruction')}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6 mt-8 flex-1">
                
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
                            className={`block w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-slate-50 focus:bg-white`}
                            placeholder="e.g. admin, manager, staff"
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
                            className={`block w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-slate-50 focus:bg-white`}
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