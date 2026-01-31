
import React, { useRef, useState, useEffect } from 'react';
import { Asset, AssetCategory, AssetStatusConfig, AccessLog, User, SystemConfig } from '../types';
import { Search, MapPin, Truck, Monitor, Armchair, Hammer, CheckCircle, Upload, Plus, X, Filter, Printer, FileText, Layers, QrCode, FileDown, FileSpreadsheet, Pencil, Trash2, Building, Globe, Book, Shield, Cpu } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import QRCode from "react-qr-code";
import { getPermissionsForRole } from '../constants';

interface AssetRegistryProps {
  currentUser: User;
  assets: Asset[];
  categories: AssetCategory[];
  statuses: AssetStatusConfig[];
  onSelectAsset: (asset: Asset) => void;
  onImportAssets: (assets: Asset[]) => void;
  onUpdateAsset: (asset: Asset) => void;
  onDeleteAsset: (assetId: string) => void;
  systemConfig: SystemConfig;
}

const AssetRegistry: React.FC<AssetRegistryProps> = ({ currentUser, assets, categories, statuses, onSelectAsset, onImportAssets, onUpdateAsset, onDeleteAsset, systemConfig }) => {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  
  // Use the prefix from system config or default to 258
  const officeCode = systemConfig.inventoryPrefix || "258";

  // Default to first category or Furniture if available
  const initialCategory = categories.find(c => c.name.toLowerCase().includes('furniture')) || categories[0];
  const initialStatus = statuses.find(s => s.name === 'Operational') || statuses[0];

  // New Asset Form State
  const [formData, setFormData] = useState<Partial<Asset>>({
      id: '',
      name: '',
      category: initialCategory ? initialCategory.name : '',
      status: initialStatus ? initialStatus.name : '',
      location: '',
      value: 0,
      modelNumber: '',
      serialNumber: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      entryDate: new Date().toISOString().split('T')[0],
      lastMaintenance: '',
      notes: '',
      assetSize: '',
      constructedDate: ''
  });
  const [customCategory, setCustomCategory] = useState('');
  const [inventoryGroupCode, setInventoryGroupCode] = useState('');

  // Report State
  const currentYear = new Date().getFullYear();
  const [reportYear, setReportYear] = useState(currentYear);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ID Generation Logic: [OFFICE]-[YEAR]-[CAT]-[SEQ]
  const generateAssetIdData = (categoryName: string, entryDate: string) => {
      const year = new Date(entryDate).getFullYear();
      
      const foundCat = categories.find(c => c.name === categoryName);
      const catCode = foundCat ? foundCat.code : '99';
      
      // The Group Code: 258-2026-02
      const groupCode = `${officeCode}-${year}-${catCode}`;
      
      // Calculate Sequence
      // Find all assets starting with this group code
      const existingInGroup = assets.filter(a => a.id.startsWith(groupCode)).length;
      const sequence = (existingInGroup + 1).toString().padStart(2, '0');
      
      // Final ID: 258-2026-02-01
      const finalId = `${groupCode}-${sequence}`;
      
      return { groupCode, finalId };
  };

  const openAddModal = () => {
    setEditingAssetId(null);
    setFormData({
        id: '',
        name: '', 
        category: initialCategory ? initialCategory.name : 'Furniture', 
        status: initialStatus ? initialStatus.name : 'Operational', 
        location: '', 
        value: 0, 
        modelNumber: '', 
        serialNumber: '', 
        purchaseDate: new Date().toISOString().split('T')[0], 
        entryDate: new Date().toISOString().split('T')[0], 
        lastMaintenance: '', 
        notes: '',
        assetSize: '',
        constructedDate: ''
    });
    setCustomCategory('');
    // Trigger initial ID generation for new asset
    updateFormIds(initialCategory ? initialCategory.name : 'Furniture', new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (asset: Asset, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    setEditingAssetId(asset.id);
    setFormData({ ...asset });
    setCustomCategory(''); // Reset custom category if it was used, or parse it if logic required
    // For edit, we don't regenerate ID, so we just set the group code for display
    const parts = asset.id.split('-');
    if (parts.length >= 3) {
        setInventoryGroupCode(`${parts[0]}-${parts[1]}-${parts[2]}`);
    }
    setIsModalOpen(true);
  };

  const handleDelete = (assetId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm(t('confirm_delete'))) {
          onDeleteAsset(assetId);
      }
  };

  // Effect to update ID when category or entry date changes in the form (ONLY when adding)
  const updateFormIds = (categoryName: string, entryDate: string) => {
      if (editingAssetId) return; // Do not change ID when editing

      const { groupCode, finalId } = generateAssetIdData(categoryName, entryDate);
      setInventoryGroupCode(groupCode);
      setFormData(prev => ({ 
          ...prev, 
          id: finalId, 
          category: categoryName,
          entryDate: entryDate
      }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const catName = e.target.value;
      updateFormIds(catName === 'Other' ? 'Other' : catName, formData.entryDate!);
  };

  const handleEntryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = e.target.value;
      updateFormIds(formData.category === 'Other' ? 'Other' : formData.category!, date);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const finalCategory = formData.category === 'Other' ? customCategory : formData.category;
      
      if (editingAssetId) {
          // UPDATE EXISTING
          const originalAsset = assets.find(a => a.id === editingAssetId);
          const updateLog: AccessLog = {
              id: `log-${Date.now()}`,
              action: 'Updated',
              userId: currentUser.id,
              userName: currentUser.name,
              timestamp: new Date().toISOString(),
              details: 'Asset details updated.'
          };
          
          const updatedAsset: Asset = {
              ...formData as Asset,
              category: finalCategory || 'Uncategorized',
              logs: originalAsset ? [...(originalAsset.logs || []), updateLog] : [updateLog]
          };
          
          onUpdateAsset(updatedAsset);

      } else {
          // CREATE NEW
          // Recalculate ID one last time to be safe
          const { finalId } = generateAssetIdData(formData.category || (initialCategory ? initialCategory.name : 'Uncategorized'), formData.entryDate!);

          // Create Initial Log
          const initialLog: AccessLog = {
              id: `log-${Date.now()}`,
              action: 'Created',
              userId: currentUser.id,
              userName: currentUser.name,
              timestamp: new Date().toISOString(),
              details: 'Initial registration'
          };

          const assetToAdd: Asset = {
              ...formData as Asset,
              id: finalId, // Ensure ID is the generated one
              category: finalCategory || 'Uncategorized',
              value: Number(formData.value),
              logs: [initialLog]
          };
          onImportAssets([assetToAdd]);
      }
      
      setIsModalOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);
        if (Array.isArray(json)) {
          onImportAssets(json as Asset[]);
          alert(`Successfully imported ${json.length} assets.`);
        } else {
          alert('Invalid format: Expected a JSON array of assets.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    // CSV Header
    const headers = ["ID", "Name", "Category", "Status", "Location", "Value (MVR)", "Purchase Date", "Model No", "Serial No", "Asset Size", "Constructed Date", "Notes"];
    
    // CSV Rows
    const rows = assets.map(asset => [
        `"${asset.id}"`, // Quote ID to prevent Excel scientific notation on some formats
        `"${asset.name.replace(/"/g, '""')}"`, // Escape quotes
        `"${asset.category}"`,
        `"${asset.status}"`,
        `"${asset.location.replace(/"/g, '""')}"`,
        asset.value,
        asset.purchaseDate,
        `"${(asset.modelNumber || '').replace(/"/g, '""')}"`,
        `"${(asset.serialNumber || '').replace(/"/g, '""')}"`,
        `"${(asset.assetSize || '').replace(/"/g, '""')}"`,
        `"${(asset.constructedDate || '').replace(/"/g, '""')}"`,
        `"${(asset.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map(r => r.join(","))
    ].join("\n");

    downloadCSV(csvContent, `assets_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleDownloadTemplate = () => {
     const headers = ["name", "category", "status", "location", "value", "purchaseDate", "modelNumber", "serialNumber", "assetSize", "constructedDate", "notes"];
     const example = ["Example Chair", "Furniture", "Operational", "Reception", "1500", "2024-01-01", "CH-01", "SN123", "", "", "Office chair"];
     
     const csvContent = [headers.join(","), example.join(",")].join("\n");
     downloadCSV(csvContent, "asset_import_template.csv");
  };

  const getStatusColor = (statusName: string) => {
    const statusConfig = statuses.find(s => s.name === statusName);
    return statusConfig ? statusConfig.color : 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const getCategoryIcon = (category: string) => {
      const cat = category.toLowerCase();
      if (cat.includes('vehicle') || cat.includes('fleet')) return <Truck size={18} />;
      if (cat.includes('it') || cat.includes('computer') || cat.includes('hardware') || cat.includes('software')) return <Monitor size={18} />;
      if (cat.includes('furniture') || cat.includes('fixture')) return <Armchair size={18} />;
      if (cat.includes('tool') || cat.includes('equipment')) return <Hammer size={18} />;
      if (cat.includes('building') || cat.includes('land') || cat.includes('tangible')) return <Building size={18} />;
      if (cat.includes('island') || cat.includes('reef') || cat.includes('seed')) return <Globe size={18} />;
      if (cat.includes('historical')) return <Book size={18} />;
      if (cat.includes('copyright') || cat.includes('pattern')) return <Shield size={18} />;
      if (cat.includes('plant') || cat.includes('machiner')) return <Cpu size={18} />;
      return <CheckCircle size={18} />;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-MV', { style: 'currency', currency: 'MVR', maximumFractionDigits: 0 }).format(val);
  }

  // Filter Logic
  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || a.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || a.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const uniqueCategories = Array.from(new Set(assets.map(a => a.category))).sort();
  const reportAssets = assets.filter(a => new Date(a.entryDate).getFullYear() === reportYear);

  // Permission Check
  const perms = currentUser.permissions || getPermissionsForRole(currentUser.role);
  const canDelete = perms.delete_records || currentUser.role === 'Admin';

  // Specific check for the Land category
  const isLandAsset = formData.category?.toLowerCase().includes('land') || formData.category?.toLowerCase().includes('building');
  
  // Find selected category object to get Dhivehi name
  const selectedCategoryObj = categories.find(c => c.name === formData.category);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
        
        {/* Header Actions */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div>
                 <h2 className="text-xl font-bold text-slate-900">{t('asset_registry_title')}</h2>
                 <p className="text-sm text-slate-500">{t('asset_registry_subtitle')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
                 <button 
                    onClick={handleDownloadTemplate}
                    className="bg-white border border-slate-300 text-slate-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
                    title="Download CSV Template for Import"
                >
                    <FileSpreadsheet size={16} />
                    <span className="hidden sm:inline">{t('download_template')}</span>
                </button>
                <button 
                    onClick={handleExportCSV}
                    className="bg-white border border-slate-300 text-slate-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
                    title="Export all assets to CSV"
                >
                    <FileDown size={16} />
                    <span className="hidden sm:inline">{t('export_csv')}</span>
                </button>

                 <button 
                    onClick={() => setShowReport(true)}
                    className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Printer size={16} />
                    <span className="hidden sm:inline">{t('audit_report')}</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Upload size={16} />
                    <span className="hidden sm:inline">{t('import')} (JSON)</span>
                </button>
                <button 
                    onClick={openAddModal}
                    className="bg-teal-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Plus size={16} />
                    {t('new_asset')}
                </button>
            </div>
        </div>

        {/* Audit Report Modal */}
        {showReport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center print:hidden">
                        <div className="flex items-center gap-4">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <FileText className="text-teal-600" />
                                {t('audit_report')}
                            </h3>
                            <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                                <span className="text-xs font-semibold text-slate-500 px-2">Fiscal Year:</span>
                                <select 
                                    className="bg-white border border-slate-300 rounded text-sm py-1 px-2 focus:ring-1 focus:ring-teal-500 outline-none"
                                    value={reportYear}
                                    onChange={(e) => setReportYear(Number(e.target.value))}
                                >
                                    {Array.from({length: 5}, (_, i) => currentYear - i).map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => window.print()} className="bg-teal-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-teal-700 flex items-center gap-2">
                                <Printer size={16} /> Print
                            </button>
                            <button onClick={() => setShowReport(false)} className="bg-slate-200 text-slate-700 px-3 py-2 rounded hover:bg-slate-300">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-8 print:p-0" id="print-area">
                        <div className="print:block">
                            <div className="text-center mb-8 border-b-2 border-slate-800 pb-4">
                                <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900">{t('secretariat')} {t('council_name')}</h1>
                                <h2 className="text-lg font-medium text-slate-600 mt-2">Detailed Asset Inventory Report - {reportYear}</h2>
                                <p className="text-sm text-slate-500 mt-1">Generated on: {new Date().toLocaleDateString()}</p>
                            </div>

                            {/* Summary Boxes for Report */}
                            <div className="grid grid-cols-4 gap-4 mb-8 text-sm">
                                <div className="border border-slate-300 p-3 rounded">
                                    <div className="text-xs text-slate-500 uppercase font-bold">Total Assets</div>
                                    <div className="font-bold text-lg">{reportAssets.length}</div>
                                </div>
                                <div className="border border-slate-300 p-3 rounded">
                                    <div className="text-xs text-slate-500 uppercase font-bold">Total Value</div>
                                    <div className="font-bold text-lg">{new Intl.NumberFormat('en-MV', { style: 'currency', currency: 'MVR' }).format(reportAssets.reduce((sum, a) => sum + (a.value || 0), 0))}</div>
                                </div>
                                <div className="border border-slate-300 p-3 rounded">
                                    <div className="text-xs text-slate-500 uppercase font-bold">Operational</div>
                                    <div className="font-bold text-lg text-emerald-600">{reportAssets.filter(a => a.status === 'Operational').length}</div>
                                </div>
                                <div className="border border-slate-300 p-3 rounded">
                                    <div className="text-xs text-slate-500 uppercase font-bold">Maintenance/Repair</div>
                                    <div className="font-bold text-lg text-amber-600">{reportAssets.filter(a => ['Maintenance', 'Repair Needed'].includes(a.status)).length}</div>
                                </div>
                            </div>

                            <table className="w-full text-sm text-left border-collapse mb-10">
                                <thead>
                                    <tr className="border-b-2 border-slate-800 bg-slate-50">
                                        <th className="py-2 pl-2 font-bold text-slate-900 w-24">ID / Date</th>
                                        <th className="py-2 font-bold text-slate-900">Asset Details</th>
                                        <th className="py-2 font-bold text-slate-900">Category & Location</th>
                                        <th className="py-2 font-bold text-slate-900 text-right">Value</th>
                                        <th className="py-2 pr-2 font-bold text-slate-900 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {reportAssets.length > 0 ? reportAssets.map((asset) => (
                                        <tr key={asset.id} className="break-inside-avoid hover:bg-slate-50">
                                            <td className="py-3 pl-2 align-top">
                                                <div className="font-mono text-xs font-bold text-slate-700">{asset.id}</div>
                                                <div className="text-[10px] text-slate-500">{new Date(asset.entryDate).toLocaleDateString()}</div>
                                            </td>
                                            <td className="py-3 align-top">
                                                <div className="font-bold text-slate-900">{asset.name}</div>
                                                <div className="text-xs text-slate-600 mt-0.5">
                                                    {asset.category.toLowerCase().includes('land') || asset.category.toLowerCase().includes('building') ? (
                                                        <>
                                                            {asset.assetSize && <span className="mr-2">Size: {asset.assetSize}</span>}
                                                            {asset.constructedDate && <span>Built: {asset.constructedDate}</span>}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {asset.modelNumber && <span className="mr-2">Model: {asset.modelNumber}</span>}
                                                            {asset.serialNumber && <span>SN: {asset.serialNumber}</span>}
                                                        </>
                                                    )}
                                                </div>
                                                {asset.notes && <div className="text-[10px] text-slate-500 italic mt-1 line-clamp-2 max-w-xs">{asset.notes}</div>}
                                            </td>
                                            <td className="py-3 align-top">
                                                <div className="text-xs font-semibold text-slate-700">{asset.category}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <span className="truncate max-w-[150px]">{asset.location}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 align-top text-right">
                                                <div className="font-mono text-sm">{new Intl.NumberFormat('en-MV').format(asset.value)}</div>
                                            </td>
                                            <td className="py-3 pr-2 align-top text-right">
                                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                                    asset.status === 'Operational' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                                                    asset.status.includes('Repair') ? 'bg-red-50 border-red-200 text-red-700' :
                                                    'bg-slate-50 border-slate-200 text-slate-600'
                                                }`}>
                                                    {asset.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-slate-500 italic">{t('no_assets')}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            
                            {/* Signature Footer for Official Use */}
                            <div className="mt-16 break-inside-avoid border-t border-slate-200 pt-8">
                                <div className="grid grid-cols-2 gap-20">
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">{t('report_footer_prepared')}</p>
                                        
                                        <div className="mb-6">
                                            <div className="font-bold text-slate-900 text-lg">{currentUser.name}</div>
                                            <div className="text-sm text-slate-600">{currentUser.designation || currentUser.role}</div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="text-xs text-slate-400 uppercase w-12">Date:</div>
                                            <div className="font-mono text-sm font-bold text-slate-800">{new Date().toLocaleDateString()}</div>
                                        </div>
                                        
                                        <div className="mt-8 border-b border-dashed border-slate-400 w-3/4"></div>
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase">Signature</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">{t('report_footer_verified')}</p>
                                        <div className="border-b border-slate-400 h-8"></div>
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase">Name / Signature / Stamp</p>
                                        <div className="border-b border-slate-400 h-8 mt-6"></div>
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase">{t('report_footer_date')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Print Styles for modal content only */}
                <style>{`
                    @media print {
                        body * { visibility: hidden; }
                        #print-area, #print-area * { visibility: visible; }
                        #print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 40px; }
                        @page { size: auto; margin: 0mm; }
                    }
                `}</style>
            </div>
        )}

        {/* Add/Edit Asset Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-800">{editingAssetId ? t('update_asset') : t('register_new_asset')}</h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                    </div>
                    <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            
                            {/* Inventory Group Code (Read Only) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('inventory_code_group')}</label>
                                <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-100 text-slate-600 font-mono" 
                                    readOnly
                                    value={inventoryGroupCode} />
                            </div>

                             {/* Full Asset ID (Read Only) */}
                             <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('asset_id_auto')}</label>
                                <input required type="text" className="w-full border border-teal-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-teal-50 text-teal-800 font-bold font-mono" 
                                    readOnly
                                    value={formData.id} />
                            </div>
                            
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('category')}</label>
                                <select 
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none bg-white disabled:bg-slate-100"
                                    value={formData.category} 
                                    onChange={handleCategoryChange}
                                    disabled={!!editingAssetId} // Prevent category change on edit to preserve ID logic
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                                {selectedCategoryObj?.nameDh && (
                                    <div className="text-right text-xs text-teal-600 font-thaana mt-1 px-1">
                                        {selectedCategoryObj.nameDh}
                                    </div>
                                )}
                                {formData.category === 'Other' && !editingAssetId && (
                                    <input 
                                        type="text" 
                                        placeholder={t('enter_new_category')}
                                        className="mt-2 w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-500"
                                        value={customCategory}
                                        onChange={e => setCustomCategory(e.target.value)}
                                        required
                                    />
                                )}
                            </div>

                             {/* Date Fields - Entry Date affects ID */}
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('entry_date')} (System Registry)</label>
                                <input 
                                    type="date" 
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100" 
                                    value={formData.entryDate} 
                                    onChange={handleEntryDateChange}
                                    disabled={!!editingAssetId} // Prevent date change affecting ID on edit
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('asset_name')}</label>
                                <input required type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white" 
                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('location')}</label>
                                <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none bg-white" 
                                    value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                            </div>

                            {/* Conditional Fields based on Category */}
                            {isLandAsset ? (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asset Size</label>
                                        <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none bg-white" placeholder="e.g. 500 Sqft"
                                            value={formData.assetSize || ''} onChange={e => setFormData({...formData, assetSize: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Constructed / Acquired Year</label>
                                        <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none bg-white" placeholder="e.g. 2020"
                                            value={formData.constructedDate || ''} onChange={e => setFormData({...formData, constructedDate: e.target.value})} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('model_number')}</label>
                                        <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none bg-white" placeholder="e.g. S-5000"
                                            value={formData.modelNumber} onChange={e => setFormData({...formData, modelNumber: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('serial_number')}</label>
                                        <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none bg-white" placeholder="e.g. SN-998877"
                                            value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('status')}</label>
                                <select className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none bg-white"
                                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                    {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('value_mvr')}</label>
                                <input type="number" className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none bg-white" 
                                    value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{isLandAsset ? "Received Date" : t('purchase_date')}</label>
                                <input type="date" className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none bg-white" 
                                    value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} />
                            </div>
                           
                            
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{isLandAsset ? "Additional Info" : t('notes')}</label>
                                <textarea 
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-teal-500 resize-none h-20" 
                                    placeholder={t('notes_placeholder')}
                                    value={formData.notes || ''} 
                                    onChange={e => setFormData({...formData, notes: e.target.value})} 
                                />
                            </div>
                            
                            {formData.category?.toLowerCase().includes('fleet') && (
                                <div className="col-span-2 bg-amber-50 p-3 rounded border border-amber-100">
                                    <label className="block text-xs font-bold text-amber-700 uppercase mb-1">{t('last_service')}</label>
                                    <input type="date" className="w-full border border-amber-200 rounded px-3 py-2 text-sm outline-none bg-white" 
                                        value={formData.lastMaintenance} onChange={e => setFormData({...formData, lastMaintenance: e.target.value})} />
                                </div>
                            )}

                             {/* QR Preview Section */}
                             {!editingAssetId && (
                                <div className="col-span-2 bg-slate-50 rounded-lg p-4 border border-slate-200 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-1">
                                            <QrCode size={16} />
                                            {t('qr_preview')}
                                        </h4>
                                        <p className="text-xs text-slate-500">Auto-generated for tag printing.</p>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-slate-100 shadow-sm">
                                        <QRCode
                                            size={64}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                            value={`${formData.id} | ${formData.name}`}
                                            viewBox={`0 0 256 256`}
                                        />
                                    </div>
                                </div>
                             )}
                        </div>
                        <div className="pt-4 flex justify-end gap-2">
                             <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200">{t('cancel')}</button>
                             <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded hover:bg-teal-700">{editingAssetId ? t('save_changes') : t('save_asset')}</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
             <div className="flex-1 relative">
                <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                    <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                    type="text" 
                    placeholder={t('search_placeholder')} 
                    className={`block w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <div className="relative">
                    <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-2' : 'left-0 pl-2'} flex items-center pointer-events-none`}>
                         <Filter size={14} className="text-slate-500" />
                    </div>
                    <select 
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className={`px-8 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white`}
                    >
                        <option value="All">{t('all_categories')}</option>
                        {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                 <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                >
                    <option value="All">{t('all_statuses')}</option>
                    {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
            </div>
        </div>

        {/* Asset Table */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                    <tr>
                        <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-bold text-slate-500 uppercase tracking-wider`}>{t('th_asset_info')}</th>
                        <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-bold text-slate-500 uppercase tracking-wider`}>{t('th_specs')}</th>
                        <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-bold text-slate-500 uppercase tracking-wider`}>{t('th_status')}</th>
                        <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-bold text-slate-500 uppercase tracking-wider`}>{t('th_location')}</th>
                        <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-bold text-slate-500 uppercase tracking-wider`}>{t('th_value')}</th>
                        <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-bold text-slate-500 uppercase tracking-wider`}>{t('th_service')}</th>
                        <th scope="col" className={`px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider`}>{t('actions')}</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {filteredAssets.map((asset) => (
                        <tr 
                            key={asset.id} 
                            onClick={() => onSelectAsset(asset)}
                            className="hover:bg-teal-50/50 cursor-pointer transition-colors"
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded text-slate-500 hidden sm:block">
                                        {getCategoryIcon(asset.category)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">{asset.name}</div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5">{asset.id}</div>
                                        <div className="text-xs text-teal-600 font-medium mt-0.5 max-w-[200px] truncate">{asset.category}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-xs text-slate-500">
                                    {asset.category?.toLowerCase().includes('land') || asset.category?.toLowerCase().includes('building') ? (
                                        <>
                                            <div className="flex gap-1"><span className="font-semibold">Size:</span> {asset.assetSize || '-'}</div>
                                            <div className="flex gap-1"><span className="font-semibold">Year:</span> {asset.constructedDate || '-'}</div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex gap-1"><span className="font-semibold">M:</span> {asset.modelNumber || '-'}</div>
                                            <div className="flex gap-1"><span className="font-semibold">S:</span> {asset.serialNumber || '-'}</div>
                                        </>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(asset.status)}`}>
                                    {asset.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center text-sm text-slate-500">
                                    <MapPin className={`flex-shrink-0 h-4 w-4 text-slate-400 ${isRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                                    {asset.location}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium font-numeric">
                                {formatCurrency(asset.value)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                {asset.category?.toLowerCase().includes('fleet') ? (
                                    <span className="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded">{asset.lastMaintenance || 'Overdue'}</span>
                                ) : (
                                    <span className="text-slate-300">-</span>
                                )}
                            </td>
                             <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-2">
                                     <button 
                                        onClick={(e) => openEditModal(asset, e)}
                                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
                                        title={t('edit_asset')}
                                     >
                                         <Pencil size={16} />
                                     </button>
                                     {canDelete && (
                                        <button 
                                            onClick={(e) => handleDelete(asset.id, e)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title={t('delete_asset')}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                     )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredAssets.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-6 py-10 text-center text-slate-500 italic">
                                {t('no_assets')}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default AssetRegistry;
