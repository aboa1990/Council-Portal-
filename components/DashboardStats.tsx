
import React from 'react';
import { Asset, CitizenRequest, RequestStatus, GaragePermit, House, RequisitionForm } from '../types';
import { AlertCircle, CheckCircle2, Clock, Inbox, TrendingUp, Box, DollarSign, Car, Home, FileText, Ban, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardStatsProps {
  requests: CitizenRequest[];
  assets: Asset[];
  garagePermits: GaragePermit[];
  houses: House[];
  requisitionForms: RequisitionForm[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ requests, assets, garagePermits, houses, requisitionForms }) => {
  const { t } = useLanguage();
  
  // Request Stats
  const total = requests.length;
  const newReqs = requests.filter(r => r.status === RequestStatus.NEW).length;
  const inProgress = requests.filter(r => r.status === RequestStatus.IN_PROGRESS).length;
  const resolved = requests.filter(r => r.status === RequestStatus.RESOLVED).length;

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

  // Garage Stats
  const activePermits = garagePermits.filter(p => p.status === 'Issued').length;
  const pendingPermits = garagePermits.filter(p => p.status === 'Pending Upload').length;
  const voidPermits = garagePermits.filter(p => p.status === 'Void').length;

  // House Stats
  const totalHouses = houses.length;
  const housesByZone = houses.reduce((acc, h) => {
      acc[h.islandZone] = (acc[h.islandZone] || 0) + 1;
      return acc;
  }, {} as Record<string, number>);
  const sortedZones = Object.entries(housesByZone).sort((a: [string, number], b: [string, number]) => b[1] - a[1]).slice(0, 3);

  // Hudha Stats
  const totalReqs = requisitionForms.length;
  const totalReqValue = requisitionForms.reduce((sum, f) => sum + f.totalAmount, 0);
  const pendingReqs = requisitionForms.filter(f => f.status === 'Pending').length;

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
    <div className="space-y-8 pb-12">
      {/* 1. Request Overview (Top Row) */}
      <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Inbox size={20} className="text-teal-600"/>
              Service Requests Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
                title="Total Requests" 
                value={total} 
                subtext={<span className="text-emerald-600 flex items-center gap-1"><TrendingUp size={12}/> All time</span>}
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
                subtext="Resolved issues"
                icon={CheckCircle2} 
                color="text-emerald-600" 
            />
          </div>
      </div>

      {/* 2. Departmental Overviews (New Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Garage Permit Overview */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <Car size={18} className="text-indigo-600"/>
                  <h3 className="font-bold text-slate-800">Garage Permits</h3>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center">
                  <div className="flex items-end justify-between mb-6">
                      <div>
                          <p className="text-sm text-slate-500 font-medium">Total Registered</p>
                          <p className="text-3xl font-bold text-slate-900">{garagePermits.length}</p>
                      </div>
                      <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                          <Car size={20}/>
                      </div>
                  </div>
                  <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                          <span className="flex items-center gap-2 text-slate-600"><CheckCircle2 size={14} className="text-emerald-500"/> Active / Issued</span>
                          <span className="font-bold text-slate-900">{activePermits}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="flex items-center gap-2 text-slate-600"><Clock size={14} className="text-amber-500"/> Pending Upload</span>
                          <span className="font-bold text-slate-900">{pendingPermits}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="flex items-center gap-2 text-slate-600"><Ban size={14} className="text-red-500"/> Void / Cancelled</span>
                          <span className="font-bold text-slate-900">{voidPermits}</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* House Registry Overview */}
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <Home size={18} className="text-teal-600"/>
                  <h3 className="font-bold text-slate-800">House Registry</h3>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center">
                  <div className="flex items-end justify-between mb-6">
                      <div>
                          <p className="text-sm text-slate-500 font-medium">Total Houses</p>
                          <p className="text-3xl font-bold text-slate-900">{totalHouses}</p>
                      </div>
                      <div className="h-10 w-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600">
                          <Home size={20}/>
                      </div>
                  </div>
                  <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Top Zones</p>
                      {sortedZones.length > 0 ? sortedZones.map(([zone, count]) => (
                          <div key={zone} className="flex justify-between items-center text-sm">
                              <span className="flex items-center gap-2 text-slate-600"><MapPin size={14} className="text-slate-400"/> {zone} Zone</span>
                              <span className="font-bold text-slate-900">{count}</span>
                          </div>
                      )) : (
                          <p className="text-sm text-slate-400 italic">No house data available</p>
                      )}
                  </div>
              </div>
          </div>

           {/* Hudha Forms Overview */}
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <FileText size={18} className="text-rose-600"/>
                  <h3 className="font-bold text-slate-800">Hudha Forms</h3>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center">
                  <div className="flex items-end justify-between mb-6">
                      <div>
                          <p className="text-sm text-slate-500 font-medium">Total Requisitions</p>
                          <p className="text-3xl font-bold text-slate-900">{totalReqs}</p>
                      </div>
                      <div className="h-10 w-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-600">
                          <FileText size={20}/>
                      </div>
                  </div>
                  <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                          <span className="flex items-center gap-2 text-slate-600"><Clock size={14} className="text-amber-500"/> Pending Approval</span>
                          <span className="font-bold text-slate-900">{pendingReqs}</span>
                      </div>
                      <div className="pt-3 border-t border-slate-100">
                          <p className="text-xs text-slate-500 mb-1">Total Requested Value</p>
                          <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalReqValue)}</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* 3. Asset Overview Section (Bottom) */}
      <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Box size={20} className="text-blue-600"/>
              {t('asset_overview')}
          </h2>
          
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
                         <div className="text-xs font-medium text-slate-500 uppercase mt-1 truncate w-full" title={cat.name}>{cat.name}</div>
                     </div>
                 ))}
             </div>
          </div>
      </div>
    </div>
  );
};

export default DashboardStats;
