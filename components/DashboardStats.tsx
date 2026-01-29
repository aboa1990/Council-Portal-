import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Asset, CitizenRequest, RequestStatus } from '../types';
import { AlertCircle, CheckCircle2, Clock, Inbox, TrendingUp, Box, DollarSign } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardStatsProps {
  requests: CitizenRequest[];
  assets: Asset[];
}

const COLORS = ['#0d9488', '#f59e0b', '#10b981', '#64748b']; // Teal, Amber, Emerald, Slate

const DashboardStats: React.FC<DashboardStatsProps> = ({ requests, assets }) => {
  const { t } = useLanguage();
  
  // Request Stats
  const total = requests.length;
  const newReqs = requests.filter(r => r.status === RequestStatus.NEW).length;
  const inProgress = requests.filter(r => r.status === RequestStatus.IN_PROGRESS).length;
  const resolved = requests.filter(r => r.status === RequestStatus.RESOLVED).length;

  const statusData = [
    { name: 'New', value: newReqs },
    { name: 'In Progress', value: inProgress },
    { name: 'Resolved', value: resolved },
  ];

  const categoryCount = requests.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.keys(categoryCount).map(key => ({
    name: key,
    count: categoryCount[key]
  }));

  // Asset Stats
  const totalAssets = assets.length;
  const totalAssetValue = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  
  const assetCategoryCount = assets.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const assetCategoryData = Object.keys(assetCategoryCount).map(key => ({
    name: key,
    count: assetCategoryCount[key]
  }));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-MV', { style: 'currency', currency: 'MVR', maximumFractionDigits: 0 }).format(val);
  }

  const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
    <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon size={64} className={color.replace('text-', 'text-')} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 mt-2">{value}</h3>
      </div>
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
         {subtext}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Request Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
            title="Total Requests" 
            value={total} 
            subtext={<span className="text-emerald-600 flex items-center gap-1"><TrendingUp size={12}/> +12% this week</span>}
            icon={Inbox} 
            color="text-teal-700" 
        />
        <StatCard 
            title="Pending Attention" 
            value={newReqs} 
            subtext="Requires triage"
            icon={AlertCircle} 
            color="text-amber-600" 
        />
        <StatCard 
            title="Active Jobs" 
            value={inProgress} 
            subtext="Currently assigned"
            icon={Clock} 
            color="text-indigo-600" 
        />
        <StatCard 
            title="Completed" 
            value={resolved} 
            subtext="This month"
            icon={CheckCircle2} 
            color="text-emerald-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm h-96">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6">Volume by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}} 
                contentStyle={{borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
              />
              <Bar dataKey="count" fill="#0d9488" radius={[2, 2, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm h-96 flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2">Status Distribution</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                >
                    {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '4px', border: '1px solid #e2e8f0'}} />
                </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4 border-t border-slate-100 pt-4">
              {statusData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">{entry.name}</span>
                      <span className="text-xs text-slate-400">({entry.value})</span>
                  </div>
              ))}
          </div>
        </div>
      </div>

      {/* Asset Overview Section */}
      <div className="pt-6 border-t border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">{t('asset_overview')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard 
                title={t('total_assets')} 
                value={totalAssets} 
                subtext="Registered items"
                icon={Box} 
                color="text-blue-700" 
              />
              <StatCard 
                title={t('total_value')} 
                value={formatCurrency(totalAssetValue)} 
                subtext="Inventory Valuation"
                icon={DollarSign} 
                color="text-emerald-700" 
              />
          </div>

          <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm">
             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">{t('asset_distribution')}</h3>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                 {assetCategoryData.map((cat) => (
                     <div key={cat.name} className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
                         <div className="text-2xl font-bold text-slate-700">{cat.count}</div>
                         <div className="text-xs font-medium text-slate-500 uppercase mt-1">{cat.name}</div>
                     </div>
                 ))}
             </div>
          </div>
      </div>
    </div>
  );
};

export default DashboardStats;