
import React, { useState } from 'react';
import { ShoppingCart, FileText, Printer, Plus, Trash2, CheckCircle2, Eye, ChevronLeft, Calendar } from 'lucide-react';
import { SystemConfig, User, RequisitionForm, RequisitionItem } from '../types';

interface HudhaFormsProps {
  systemConfig: SystemConfig;
  currentUser: User;
  requisitionForms: RequisitionForm[];
  onAddRequisition: (form: RequisitionForm) => void;
}

type FormType = 'requisition' | 'agu-balaa';
type ViewMode = 'list' | 'create' | 'view';

interface Quotation {
  supplier: string;
  price: number;
  duration: string;
  comments: string;
}

const OFFICE_CODE = "258"; // Office Code for Requisition Forms

const HudhaForms: React.FC<HudhaFormsProps> = ({ systemConfig, currentUser, requisitionForms, onAddRequisition }) => {
  const [activeForm, setActiveForm] = useState<FormType>('requisition');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedForm, setSelectedForm] = useState<RequisitionForm | null>(null);

  // Requisition Create State
  const [reqItems, setReqItems] = useState<RequisitionItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0 }
  ]);
  const [reqPurpose, setReqPurpose] = useState('');
  const [reqDate, setReqDate] = useState(new Date().toISOString().split('T')[0]);
  const [reqDepartment, setReqDepartment] = useState('Secretariat');
  const [generatedId, setGeneratedId] = useState('');

  // Agu Balaa Form State (kept as local state for demo purposes, can be lifted similarly if needed)
  const [projectTitle, setProjectTitle] = useState('');
  const [quotations, setQuotations] = useState<Quotation[]>([
    { supplier: '', price: 0, duration: '', comments: '' },
    { supplier: '', price: 0, duration: '', comments: '' },
    { supplier: '', price: 0, duration: '', comments: '' }
  ]);
  const [selectedSupplierIndex, setSelectedSupplierIndex] = useState<number | null>(null);
  const [selectionReason, setSelectionReason] = useState('');

  // --- Handlers for Requisition Forms ---

  const handleStartNewRequisition = () => {
      // Logic for ID: RF[CODE]/[YEAR]/[SEQ]
      const year = new Date().getFullYear();
      const prefix = `RF${OFFICE_CODE}/${year}/`;
      const existingInYear = requisitionForms.filter(f => f.id.startsWith(prefix)).length;
      const nextSeq = String(existingInYear + 1).padStart(2, '0');
      const newId = `${prefix}${nextSeq}`;

      setGeneratedId(newId);
      setReqItems([{ id: Date.now().toString(), description: '', quantity: 1, rate: 0 }]);
      setReqPurpose('');
      setReqDepartment('Secretariat');
      setReqDate(new Date().toISOString().split('T')[0]);
      setViewMode('create');
  };

  const handleSaveRequisition = () => {
      if (reqItems.length === 0 || !reqPurpose) {
          alert("Please add items and a purpose.");
          return;
      }
      
      const totalAmount = reqItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
      
      const newForm: RequisitionForm = {
          id: generatedId,
          date: reqDate,
          department: reqDepartment,
          requestedBy: currentUser.name,
          purpose: reqPurpose,
          items: reqItems,
          status: 'Pending',
          totalAmount: totalAmount,
          createdAt: new Date().toISOString()
      };

      onAddRequisition(newForm);
      setSelectedForm(newForm);
      setViewMode('view');
  };

  const addReqItem = () => {
    setReqItems([...reqItems, { id: Date.now().toString(), description: '', quantity: 1, rate: 0 }]);
  };

  const updateReqItem = (id: string, field: keyof RequisitionItem, value: any) => {
    setReqItems(reqItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeReqItem = (id: string) => {
    if (reqItems.length > 1) {
      setReqItems(reqItems.filter(item => item.id !== id));
    }
  };

  const calculateTotal = (items: RequisitionItem[]) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  // --- Handlers for Agu Balaa ---
  const updateQuotation = (index: number, field: keyof Quotation, value: any) => {
    const newQuotes = [...quotations];
    newQuotes[index] = { ...newQuotes[index], [field]: value };
    setQuotations(newQuotes);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleViewForm = (form: RequisitionForm) => {
      setSelectedForm(form);
      setViewMode('view');
  };

  // --- Render ---

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Tabs / Mode Switcher (Hidden when printing) */}
      <div className="print:hidden">
          {viewMode === 'list' ? (
              <div className="flex border-b border-slate-200 bg-white rounded-t-xl overflow-hidden">
                <button
                onClick={() => setActiveForm('requisition')}
                className={`px-6 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                    activeForm === 'requisition'
                    ? 'border-teal-600 text-teal-700 bg-teal-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
                >
                <ShoppingCart size={18} />
                GOODS/SERVICES REQUISITION
                </button>
                <button
                onClick={() => setActiveForm('agu-balaa')}
                className={`px-6 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                    activeForm === 'agu-balaa'
                    ? 'border-teal-600 text-teal-700 bg-teal-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
                >
                <FileText size={18} />
                AGU BALAA FORM
                </button>
            </div>
          ) : (
             <button onClick={() => setViewMode('list')} className="mb-4 flex items-center gap-2 text-slate-600 hover:text-teal-600 font-bold text-sm">
                 <ChevronLeft size={16} /> Back to Forms List
             </button>
          )}
      </div>

      <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 shadow-sm p-8 print:border-none print:shadow-none print:p-0 print:bg-white">
        
        {/* REQUISITION SECTION */}
        {activeForm === 'requisition' && (
            <>
                {/* LIST VIEW */}
                {viewMode === 'list' && (
                    <div>
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-800">Requisition Records</h3>
                            <button onClick={handleStartNewRequisition} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-teal-700">
                                <Plus size={16} /> Create New Requisition
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Form ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Requested By</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Total (MVR)</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {requisitionForms.map(form => (
                                        <tr key={form.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-teal-700">{form.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{new Date(form.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{form.department}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{form.requestedBy}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-bold text-right">{form.totalAmount.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button onClick={() => handleViewForm(form)} className="text-teal-600 hover:text-teal-800 font-medium text-sm flex items-center justify-end gap-1">
                                                    <Eye size={16} /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {requisitionForms.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">No requisition forms found. Create one to get started.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* CREATE VIEW */}
                {viewMode === 'create' && (
                    <div className="max-w-4xl mx-auto border border-slate-300 p-8 min-h-[1000px] relative">
                         {/* Header */}
                        <div className="text-center border-b-2 border-slate-800 pb-6 mb-6">
                            <h1 className="text-xl font-bold uppercase tracking-wide">{systemConfig.councilName}</h1>
                            <h2 className="text-lg font-medium text-slate-600">{systemConfig.secretariatName}</h2>
                            <div className="mt-4 bg-slate-900 text-white inline-block px-4 py-1 text-sm font-bold uppercase">
                                Goods / Services Requisition Form
                            </div>
                        </div>

                        {/* Metadata Inputs */}
                        <div className="grid grid-cols-2 gap-8 mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-bold uppercase w-24">Date:</span>
                                    <input type="date" value={reqDate} onChange={e => setReqDate(e.target.value)} className="border-b border-slate-300 focus:outline-none px-1 text-sm bg-transparent" />
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-bold uppercase w-24">Department:</span>
                                    <input type="text" value={reqDepartment} onChange={e => setReqDepartment(e.target.value)} className="border-b border-slate-300 focus:outline-none px-1 text-sm bg-transparent w-48" />
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center justify-end gap-2 mb-2">
                                    <span className="text-xs font-bold uppercase">Req No:</span>
                                    <span className="font-mono bg-slate-100 px-2 py-1 text-sm font-bold text-slate-800 border border-slate-300">{generatedId}</span>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <table className="w-full border-collapse border border-slate-300 mb-6 text-sm">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="border border-slate-300 px-3 py-2 text-left w-12">No.</th>
                                    <th className="border border-slate-300 px-3 py-2 text-left">Description of Goods / Services</th>
                                    <th className="border border-slate-300 px-3 py-2 text-right w-20">Qty</th>
                                    <th className="border border-slate-300 px-3 py-2 text-right w-24">Est. Rate</th>
                                    <th className="border border-slate-300 px-3 py-2 text-right w-28">Total</th>
                                    <th className="border border-slate-300 px-2 py-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {reqItems.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td className="border border-slate-300 px-3 py-2 text-center">{idx + 1}</td>
                                        <td className="border border-slate-300 px-3 py-2">
                                            <input type="text" className="w-full outline-none bg-transparent" value={item.description} onChange={(e) => updateReqItem(item.id, 'description', e.target.value)} placeholder="Item description..." />
                                        </td>
                                        <td className="border border-slate-300 px-3 py-2">
                                            <input type="number" className="w-full outline-none bg-transparent text-right" value={item.quantity} onChange={(e) => updateReqItem(item.id, 'quantity', Number(e.target.value))} />
                                        </td>
                                        <td className="border border-slate-300 px-3 py-2">
                                            <input type="number" className="w-full outline-none bg-transparent text-right" value={item.rate} onChange={(e) => updateReqItem(item.id, 'rate', Number(e.target.value))} />
                                        </td>
                                        <td className="border border-slate-300 px-3 py-2 text-right font-medium">
                                            {(item.quantity * item.rate).toFixed(2)}
                                        </td>
                                        <td className="border border-slate-300 px-2 py-2 text-center">
                                            <button onClick={() => removeReqItem(item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan={6} className="p-2 bg-slate-50 text-center">
                                        <button onClick={addReqItem} className="text-teal-600 text-xs font-bold flex items-center justify-center gap-1 mx-auto hover:text-teal-800">
                                            <Plus size={14} /> Add Line Item
                                        </button>
                                    </td>
                                </tr>
                                <tr className="bg-slate-50 font-bold">
                                    <td colSpan={4} className="border border-slate-300 px-3 py-2 text-right uppercase text-xs">Grand Total (MVR)</td>
                                    <td className="border border-slate-300 px-3 py-2 text-right text-base">{calculateTotal(reqItems).toFixed(2)}</td>
                                    <td className="border border-slate-300"></td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="mb-8">
                            <label className="block text-xs font-bold uppercase mb-1">Purpose / Justification:</label>
                            <textarea className="w-full border border-slate-300 rounded p-2 text-sm h-24 resize-none focus:outline-none focus:border-slate-500 bg-transparent" value={reqPurpose} onChange={(e) => setReqPurpose(e.target.value)}></textarea>
                        </div>
                        
                        <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-slate-200">
                            <button onClick={() => setViewMode('list')} className="px-4 py-2 text-sm font-bold text-slate-500 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                            <button onClick={handleSaveRequisition} className="px-4 py-2 text-sm font-bold text-white bg-teal-600 rounded-lg hover:bg-teal-700 flex items-center gap-2">
                                <CheckCircle2 size={16} /> Save & View
                            </button>
                        </div>
                    </div>
                )}

                {/* DETAIL / PRINT VIEW */}
                {viewMode === 'view' && selectedForm && (
                    <div className="max-w-[210mm] mx-auto bg-white" id="hudha-form-print-area">
                         <div className="flex justify-end mb-6 print:hidden">
                            <button 
                                onClick={handlePrint}
                                className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-900 transition-colors"
                            >
                                <Printer size={16} /> Print Official Form
                            </button>
                        </div>

                        {/* OFFICIAL PRINT LAYOUT */}
                        <div className="border border-slate-900 p-8 min-h-[297mm] text-slate-900 print:border-none print:p-0">
                             {/* Header */}
                             <div className="grid grid-cols-12 gap-4 mb-8 border-b-2 border-slate-900 pb-4">
                                <div className="col-span-2 flex items-center justify-center">
                                    {/* Placeholder for Logo if available */}
                                    <div className="w-16 h-16 border-2 border-slate-900 rounded-full flex items-center justify-center font-bold text-xl">
                                        {systemConfig.councilName.charAt(0)}
                                    </div>
                                </div>
                                <div className="col-span-8 text-center">
                                    <h1 className="text-xl font-black uppercase tracking-widest mb-1">{systemConfig.councilName}</h1>
                                    <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3">{systemConfig.secretariatName}</h2>
                                    <div className="inline-block border-2 border-slate-900 px-6 py-2">
                                        <h3 className="text-lg font-black uppercase tracking-wide">GOODS / SERVICES REQUISITION FORM</h3>
                                    </div>
                                </div>
                                <div className="col-span-2 flex flex-col items-end justify-center">
                                    <div className="text-[10px] font-bold uppercase mb-1">REQ NO:</div>
                                    <div className="font-mono font-bold text-sm border border-slate-900 px-2 py-1 bg-slate-50">{selectedForm.id}</div>
                                </div>
                             </div>

                             {/* Info Grid */}
                             <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8">
                                <div className="flex border-b border-slate-300 pb-1">
                                    <span className="w-32 text-xs font-bold uppercase">Date:</span>
                                    <span className="flex-1 font-mono text-sm">{new Date(selectedForm.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex border-b border-slate-300 pb-1">
                                    <span className="w-32 text-xs font-bold uppercase">Department:</span>
                                    <span className="flex-1 text-sm font-bold uppercase">{selectedForm.department}</span>
                                </div>
                                <div className="col-span-2 flex border-b border-slate-300 pb-1">
                                    <span className="w-32 text-xs font-bold uppercase">Requested By:</span>
                                    <span className="flex-1 text-sm">{selectedForm.requestedBy}</span>
                                </div>
                             </div>

                             {/* Table */}
                             <table className="w-full border-collapse border-2 border-slate-900 mb-6 text-sm">
                                <thead>
                                    <tr className="bg-slate-100">
                                        <th className="border border-slate-900 px-2 py-2 w-12 text-center">No.</th>
                                        <th className="border border-slate-900 px-2 py-2 text-left">Description of Goods / Services</th>
                                        <th className="border border-slate-900 px-2 py-2 w-20 text-center">Qty</th>
                                        <th className="border border-slate-900 px-2 py-2 w-24 text-right">Rate</th>
                                        <th className="border border-slate-900 px-2 py-2 w-32 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedForm.items.map((item, idx) => (
                                        <tr key={item.id}>
                                            <td className="border border-slate-900 px-2 py-2 text-center">{idx + 1}</td>
                                            <td className="border border-slate-900 px-2 py-2">{item.description}</td>
                                            <td className="border border-slate-900 px-2 py-2 text-center">{item.quantity}</td>
                                            <td className="border border-slate-900 px-2 py-2 text-right">{item.rate.toFixed(2)}</td>
                                            <td className="border border-slate-900 px-2 py-2 text-right font-bold">{(item.quantity * item.rate).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {/* Empty rows to fill space if needed */}
                                    {Array.from({ length: Math.max(0, 5 - selectedForm.items.length) }).map((_, idx) => (
                                        <tr key={`empty-${idx}`}>
                                            <td className="border border-slate-900 px-2 py-4">&nbsp;</td>
                                            <td className="border border-slate-900 px-2 py-4"></td>
                                            <td className="border border-slate-900 px-2 py-4"></td>
                                            <td className="border border-slate-900 px-2 py-4"></td>
                                            <td className="border border-slate-900 px-2 py-4"></td>
                                        </tr>
                                    ))}
                                    <tr className="bg-slate-50">
                                        <td colSpan={4} className="border border-slate-900 px-2 py-2 text-right font-black uppercase text-xs">Grand Total (MVR)</td>
                                        <td className="border border-slate-900 px-2 py-2 text-right font-black text-base">{selectedForm.totalAmount.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                             </table>

                             {/* Purpose */}
                             <div className="mb-8 border border-slate-900 p-4 min-h-[100px]">
                                <h4 className="text-xs font-bold uppercase mb-2 underline">Purpose / Justification:</h4>
                                <p className="text-sm">{selectedForm.purpose}</p>
                             </div>

                             {/* Signatures */}
                             <div className="grid grid-cols-3 gap-4 mt-auto">
                                <div className="border border-slate-900 p-4 h-40 flex flex-col justify-between">
                                    <div className="text-xs font-bold uppercase text-center border-b border-slate-300 pb-2">Requested By</div>
                                    <div className="text-center text-[10px] text-slate-500 italic mt-auto pt-2 border-t border-dotted border-slate-400">Signature & Date</div>
                                </div>
                                <div className="border border-slate-900 p-4 h-40 flex flex-col justify-between">
                                    <div className="text-xs font-bold uppercase text-center border-b border-slate-300 pb-2">Verified By</div>
                                    <div className="text-center text-[10px] text-slate-500 italic mt-auto pt-2 border-t border-dotted border-slate-400">Signature & Stamp</div>
                                </div>
                                <div className="border border-slate-900 p-4 h-40 flex flex-col justify-between">
                                    <div className="text-xs font-bold uppercase text-center border-b border-slate-300 pb-2">Approved By</div>
                                    <div className="text-center text-[10px] text-slate-500 italic mt-auto pt-2 border-t border-dotted border-slate-400">Signature & Stamp</div>
                                </div>
                             </div>

                             <div className="mt-8 text-[10px] text-center text-slate-500 font-mono">
                                 Generated System Record: {new Date().toISOString()} | Ref: {selectedForm.id}
                             </div>
                        </div>
                    </div>
                )}
            </>
        )}

        {/* AGU BALAA FORM */}
        {activeForm === 'agu-balaa' && (
             <div className="max-w-4xl mx-auto border border-slate-300 p-8 min-h-[1000px] relative print:border-none print:p-0" id="agu-balaa-print-area">
                <div className="text-center border-b-2 border-slate-800 pb-6 mb-6">
                    <h1 className="text-xl font-bold uppercase tracking-wide">{systemConfig.councilName}</h1>
                    <h2 className="text-lg font-medium text-slate-600">{systemConfig.secretariatName}</h2>
                    <div className="mt-4 bg-slate-900 text-white inline-block px-4 py-1 text-sm font-bold uppercase">
                        Price Verification Form (Agu Balaa)
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs font-bold uppercase w-32 flex-shrink-0">Project / Item:</span>
                        <input 
                            type="text" 
                            className="w-full border-b border-slate-300 focus:outline-none px-1 text-sm bg-transparent" 
                            placeholder="Enter project or item name..."
                            value={projectTitle}
                            onChange={(e) => setProjectTitle(e.target.value)}
                        />
                    </div>
                     <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase w-32 flex-shrink-0">Ref Number:</span>
                        <span className="text-sm font-mono">PVF-{new Date().getFullYear()}-00X</span>
                    </div>
                </div>

                <table className="w-full border-collapse border border-slate-300 mb-8 text-sm">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="border border-slate-300 px-3 py-3 text-left w-32">Details</th>
                            <th className="border border-slate-300 px-3 py-3 text-center w-1/3">Quotation 1</th>
                            <th className="border border-slate-300 px-3 py-3 text-center w-1/3">Quotation 2</th>
                            <th className="border border-slate-300 px-3 py-3 text-center w-1/3">Quotation 3</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-slate-300 px-3 py-3 font-bold bg-slate-50">Supplier Name</td>
                            {quotations.map((q, i) => (
                                <td key={i} className="border border-slate-300 px-3 py-2">
                                    <input 
                                        type="text" 
                                        className="w-full text-center outline-none bg-transparent"
                                        placeholder={`Supplier ${i+1}`}
                                        value={q.supplier}
                                        onChange={(e) => updateQuotation(i, 'supplier', e.target.value)}
                                    />
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <td className="border border-slate-300 px-3 py-3 font-bold bg-slate-50">Total Price</td>
                             {quotations.map((q, i) => (
                                <td key={i} className="border border-slate-300 px-3 py-2">
                                    <input 
                                        type="number" 
                                        className="w-full text-center outline-none bg-transparent font-medium"
                                        placeholder="0.00"
                                        value={q.price}
                                        onChange={(e) => updateQuotation(i, 'price', Number(e.target.value))}
                                    />
                                </td>
                            ))}
                        </tr>
                         <tr>
                            <td className="border border-slate-300 px-3 py-3 font-bold bg-slate-50">Duration</td>
                             {quotations.map((q, i) => (
                                <td key={i} className="border border-slate-300 px-3 py-2">
                                    <input 
                                        type="text" 
                                        className="w-full text-center outline-none bg-transparent"
                                        placeholder="e.g. 5 days"
                                        value={q.duration}
                                        onChange={(e) => updateQuotation(i, 'duration', e.target.value)}
                                    />
                                </td>
                            ))}
                        </tr>
                         <tr>
                            <td className="border border-slate-300 px-3 py-3 font-bold bg-slate-50 align-top">Comments</td>
                             {quotations.map((q, i) => (
                                <td key={i} className="border border-slate-300 px-3 py-2">
                                    <textarea 
                                        className="w-full text-center outline-none bg-transparent resize-none h-16"
                                        placeholder="Warranty, specs..."
                                        value={q.comments}
                                        onChange={(e) => updateQuotation(i, 'comments', e.target.value)}
                                    />
                                </td>
                            ))}
                        </tr>
                        <tr className="print:hidden">
                            <td className="border border-slate-300 px-3 py-3 font-bold bg-slate-50">Selection</td>
                             {quotations.map((q, i) => (
                                <td key={i} className="border border-slate-300 px-3 py-2 text-center">
                                    <button 
                                        onClick={() => setSelectedSupplierIndex(i)}
                                        className={`p-2 rounded-full border-2 ${selectedSupplierIndex === i ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-200 text-slate-300 hover:border-slate-400'}`}
                                    >
                                        <CheckCircle2 size={24} />
                                    </button>
                                </td>
                            ))}
                        </tr>
                         <tr className="hidden print:table-row">
                            <td className="border border-slate-300 px-3 py-3 font-bold bg-slate-50">Selected</td>
                             {quotations.map((q, i) => (
                                <td key={i} className="border border-slate-300 px-3 py-2 text-center">
                                     {selectedSupplierIndex === i ? (
                                         <div className="flex items-center justify-center gap-1 font-bold text-black">
                                             [ X ] SELECTED
                                         </div>
                                     ) : ''}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>

                <div className="mb-8">
                    <label className="block text-xs font-bold uppercase mb-1">Recommendation / Justification for Selection:</label>
                    <textarea 
                        className="w-full border border-slate-300 rounded p-2 text-sm h-24 resize-none focus:outline-none focus:border-slate-500 bg-transparent"
                        placeholder="e.g. Lowest price compliant with requirements..."
                        value={selectionReason}
                        onChange={(e) => setSelectionReason(e.target.value)}
                    ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t border-slate-200">
                    <div>
                        <h3 className="text-xs font-bold uppercase border-b border-slate-400 pb-1 mb-12">Verified By</h3>
                        <div className="text-sm">
                            <p className="mb-1"><span className="font-bold">Name:</span> {currentUser.name}</p>
                            <p className="border-t border-dotted border-slate-400 mt-8 pt-1 w-3/4 text-xs text-slate-500">Signature</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold uppercase border-b border-slate-400 pb-1 mb-12">Approved By (Financial Controller)</h3>
                        <div className="text-sm">
                            <p className="mb-1"><span className="font-bold">Name:</span> ______________________</p>
                            <p className="border-t border-dotted border-slate-400 mt-8 pt-1 w-3/4 text-xs text-slate-500">Signature & Stamp</p>
                        </div>
                    </div>
                </div>
                 <div className="mt-12 text-[10px] text-slate-400 text-center border-t border-slate-100 pt-2">
                    Generated via {systemConfig.councilName} Digital Portal on {new Date().toLocaleString()}
                </div>
                
                 <div className="flex justify-end mt-4 print:hidden">
                    <button 
                        onClick={handlePrint}
                        className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-900 transition-colors"
                    >
                        <Printer size={16} /> Print Form
                    </button>
                </div>
             </div>
        )}
        
        {/* Print Styles for Requisition and Agu Balaa forms */}
        <style>{`
            @media print {
                @page { size: A4 portrait; margin: 0; }
                body { margin: 0; padding: 0; background: white; }
                body > * { display: none !important; }
                body * { visibility: hidden; }

                /* Only show hudha form containers */
                #hudha-form-print-area, #hudha-form-print-area *,
                #agu-balaa-print-area, #agu-balaa-print-area * {
                    visibility: visible;
                }

                #hudha-form-print-area,
                #agu-balaa-print-area {
                    position: fixed;
                    left: 0;
                    top: 0;
                    width: 210mm !important;
                    height: 297mm !important;
                    margin: 0 !important;
                    padding: 20mm !important; /* Proper padding for forms */
                    z-index: 99999;
                    background: white;
                    display: block !important;
                    box-sizing: border-box;
                }
            }
        `}</style>
      </div>
    </div>
  );
};

export default HudhaForms;