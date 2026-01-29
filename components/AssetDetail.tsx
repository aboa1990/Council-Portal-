import React, { useState } from 'react';
import { Asset, AssetStatusConfig } from '../types';
import { generateMaintenancePlan } from '../services/geminiService';
import { ArrowLeft, Sparkles, Wrench, DollarSign, Calendar, MapPin, Loader2, ClipboardCheck, Printer, X, QrCode, History } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; 
import QRCode from "react-qr-code";
import { useLanguage } from '../contexts/LanguageContext';

interface AssetDetailProps {
  asset: Asset;
  statuses: AssetStatusConfig[];
  onBack: () => void;
}

const AssetDetail: React.FC<AssetDetailProps> = ({ asset, statuses, onBack }) => {
  const { t, isRTL } = useLanguage();
  const [maintenancePlan, setMaintenancePlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const handleGeneratePlan = async () => {
    setLoading(true);
    const plan = await generateMaintenancePlan(asset);
    setMaintenancePlan(plan);
    setLoading(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-MV', { style: 'currency', currency: 'MVR' }).format(val);
  }

  const getStatusColor = (statusName: string) => {
    const statusConfig = statuses.find(s => s.name === statusName);
    return statusConfig ? statusConfig.color : 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const isVehicle = asset.category === 'Fleet';

  return (
    <div className="space-y-6 animate-fade-in">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-2"
      >
        <ArrowLeft size={18} />
        Back to Registry
      </button>

      {/* Asset Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-slate-900">{asset.name}</h1>
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-500">{asset.id}</span>
                </div>
                <div className="flex gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><MapPin size={14} /> {asset.location}</span>
                    <span className="flex items-center gap-1 bg-slate-50 px-2 rounded border border-slate-100">{asset.category}</span>
                </div>
            </div>
            <div>
                 <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(asset.status)}`}>
                      {asset.status}
                </span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
             <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-3 rounded-lg text-blue-600"><DollarSign size={20} /></div>
                <div>
                    <div className="text-xs text-slate-500 font-medium uppercase">Purchase Value</div>
                    <div className="font-semibold text-slate-800">{formatCurrency(asset.value)}</div>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <div className="bg-purple-50 p-3 rounded-lg text-purple-600"><Calendar size={20} /></div>
                <div>
                    <div className="text-xs text-slate-500 font-medium uppercase">Acquired</div>
                    <div className="font-semibold text-slate-800">{new Date(asset.purchaseDate).toLocaleDateString()}</div>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <div className="bg-orange-50 p-3 rounded-lg text-orange-600"><Wrench size={20} /></div>
                <div>
                    <div className="text-xs text-slate-500 font-medium uppercase">Last Service</div>
                    <div className="font-semibold text-slate-800">{asset.lastMaintenance || 'N/A'}</div>
                </div>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-6">
            
            {/* AI Maintenance Section - Only for Fleet */}
            {isVehicle && (
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <ClipboardCheck className="text-blue-600" size={20} />
                            Maintenance Schedule
                        </h3>
                        <button 
                            onClick={handleGeneratePlan}
                            disabled={loading}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                            {maintenancePlan ? 'Regenerate Plan' : 'Generate AI Plan'}
                        </button>
                    </div>
                    
                    <div className="p-6 bg-slate-50 flex-1 min-h-[300px]">
                        {maintenancePlan ? (
                            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line animate-in fade-in slide-in-from-bottom-2">
                                {maintenancePlan}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                                <Wrench size={48} className="opacity-20" />
                                <p>Generate an AI-powered maintenance schedule based on asset age and category.</p>
                            </div>
                        )}
                    </div>
                 </div>
            )}

            {/* Access/Activity Log */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                 <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <History className="text-emerald-600" size={20} />
                        {t('access_log')}
                    </h3>
                </div>
                <div className="p-0">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-bold text-slate-500 uppercase tracking-wider`}>{t('log_date')}</th>
                                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-bold text-slate-500 uppercase tracking-wider`}>{t('log_action')}</th>
                                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-bold text-slate-500 uppercase tracking-wider`}>{t('log_user')}</th>
                                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-bold text-slate-500 uppercase tracking-wider`}>{t('log_details')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {asset.logs && asset.logs.length > 0 ? (
                                asset.logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-numeric">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                             <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                log.action === 'Created' ? 'bg-emerald-100 text-emerald-800' :
                                                log.action === 'Updated' ? 'bg-blue-100 text-blue-800' :
                                                log.action === 'Maintenance' ? 'bg-amber-100 text-amber-800' :
                                                'bg-slate-100 text-slate-800'
                                             }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{log.userName}</span>
                                                <span className="text-xs text-slate-400">{log.userId}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {log.details || '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500 italic">
                                        {t('no_logs')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
         </div>

         {/* Side Panel Info */}
         <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-4">Quick Actions</h4>
                <div className="space-y-3">
                    <button 
                        onClick={() => setShowQrModal(true)}
                        className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700 transition-colors border border-slate-100 flex items-center gap-2"
                    >
                        <QrCode size={16} />
                        {t('print_label') || "Print Asset Tag"}
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700 transition-colors border border-slate-100">
                        Log Maintenance
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700 transition-colors border border-slate-100">
                        Report Issue
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-sm font-medium text-red-600 transition-colors border border-slate-100">
                        Retire Asset
                    </button>
                </div>
            </div>

            {/* Asset Notes */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wider">Asset Notes</h4>
                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-100 min-h-[60px]">
                    {asset.notes ? asset.notes : <span className="text-slate-400 italic">No notes available.</span>}
                </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-800 mb-2 text-sm">Staff Note</h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                    Ensure all maintenance logs are signed off by the department head. Assets valued over MVR 50k require quarterly audits.
                </p>
            </div>
         </div>
      </div>

       {/* Print Label Modal */}
       {showQrModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center print:hidden">
                        <h3 className="font-bold text-lg text-slate-800">{t('print_label') || "Print Asset Tag"}</h3>
                        <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                    </div>
                    
                    <div className="p-8 flex flex-col items-center justify-center bg-white" id="print-label-area">
                        <div className="border-4 border-slate-900 p-4 rounded-lg w-full text-center">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{t('secretariat')} {t('council_name')}</h2>
                            <div className="my-4 flex justify-center">
                                <QRCode
                                    size={128}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    value={`${asset.id} | ${asset.name}`}
                                    viewBox={`0 0 256 256`}
                                />
                            </div>
                            <div className="font-mono font-bold text-xl text-slate-900">{asset.id}</div>
                            <div className="text-sm text-slate-600 mt-1 line-clamp-1">{asset.name}</div>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 print:hidden">
                         <button onClick={() => setShowQrModal(false)} className="flex-1 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50">Cancel</button>
                         <button onClick={() => window.print()} className="flex-1 py-2 text-sm font-medium text-white bg-teal-600 rounded hover:bg-teal-700 flex items-center justify-center gap-2">
                            <Printer size={16} />
                            Print
                         </button>
                    </div>
                </div>
                 {/* Print Styles for label modal content only */}
                <style>{`
                    @media print {
                        body * { visibility: hidden; }
                        #print-label-area, #print-label-area * { visibility: visible; }
                        #print-label-area { 
                            position: absolute; 
                            left: 0; 
                            top: 0; 
                            width: 100%; 
                            height: 100%; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center;
                            padding: 0;
                            margin: 0;
                        }
                    }
                `}</style>
            </div>
        )}
    </div>
  );
};

export default AssetDetail;