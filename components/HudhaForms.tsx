
import React, { useState } from 'react';
import { ShoppingCart, FileText, Printer, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { SystemConfig, User } from '../types';

interface HudhaFormsProps {
  systemConfig: SystemConfig;
  currentUser: User;
}

type FormType = 'requisition' | 'agu-balaa';

interface RequisitionItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

interface Quotation {
  supplier: string;
  price: number;
  duration: string;
  comments: string;
}

const HudhaForms: React.FC<HudhaFormsProps> = ({ systemConfig, currentUser }) => {
  const [activeForm, setActiveForm] = useState<FormType>('requisition');

  // Requisition Form State
  const [reqItems, setReqItems] = useState<RequisitionItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0 }
  ]);
  const [reqPurpose, setReqPurpose] = useState('');
  const [reqDate, setReqDate] = useState(new Date().toISOString().split('T')[0]);
  const [reqDepartment, setReqDepartment] = useState('Secretariat');

  // Agu Balaa Form State
  const [projectTitle, setProjectTitle] = useState('');
  const [quotations, setQuotations] = useState<Quotation[]>([
    { supplier: '', price: 0, duration: '', comments: '' },
    { supplier: '', price: 0, duration: '', comments: '' },
    { supplier: '', price: 0, duration: '', comments: '' }
  ]);
  const [selectedSupplierIndex, setSelectedSupplierIndex] = useState<number | null>(null);
  const [selectionReason, setSelectionReason] = useState('');

  // Requisition Handlers
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

  const calculateTotal = () => {
    return reqItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  // Agu Balaa Handlers
  const updateQuotation = (index: number, field: keyof Quotation, value: any) => {
    const newQuotes = [...quotations];
    newQuotes[index] = { ...newQuotes[index], [field]: value };
    setQuotations(newQuotes);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl overflow-hidden print:hidden">
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

      <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 shadow-sm p-8 print:border-none print:shadow-none print:p-0">
        <div className="flex justify-end mb-6 print:hidden">
            <button 
                onClick={handlePrint}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-900 transition-colors"
            >
                <Printer size={16} /> Print Form
            </button>
        </div>

        {/* REQUISITION FORM */}
        {activeForm === 'requisition' && (
          <div className="max-w-4xl mx-auto border border-slate-300 p-8 min-h-[1000px] relative print:border-none print:p-0">
            <div className="text-center border-b-2 border-slate-800 pb-6 mb-6">
                <h1 className="text-xl font-bold uppercase tracking-wide">{systemConfig.councilName}</h1>
                <h2 className="text-lg font-medium text-slate-600">{systemConfig.secretariatName}</h2>
                <div className="mt-4 bg-slate-900 text-white inline-block px-4 py-1 text-sm font-bold uppercase">
                    Goods / Services Requisition Form
                </div>
            </div>

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
                        <span className="font-mono bg-slate-100 px-2 py-1 text-sm">AUTO-GEN</span>
                    </div>
                </div>
            </div>

            <table className="w-full border-collapse border border-slate-300 mb-6 text-sm">
                <thead className="bg-slate-100">
                    <tr>
                        <th className="border border-slate-300 px-3 py-2 text-left w-12">No.</th>
                        <th className="border border-slate-300 px-3 py-2 text-left">Description of Goods / Services</th>
                        <th className="border border-slate-300 px-3 py-2 text-right w-20">Qty</th>
                        <th className="border border-slate-300 px-3 py-2 text-right w-24">Est. Rate</th>
                        <th className="border border-slate-300 px-3 py-2 text-right w-28">Total</th>
                        <th className="border border-slate-300 px-2 py-2 w-10 print:hidden"></th>
                    </tr>
                </thead>
                <tbody>
                    {reqItems.map((item, idx) => (
                        <tr key={item.id}>
                            <td className="border border-slate-300 px-3 py-2 text-center">{idx + 1}</td>
                            <td className="border border-slate-300 px-3 py-2">
                                <input 
                                    type="text" 
                                    className="w-full outline-none bg-transparent" 
                                    value={item.description}
                                    onChange={(e) => updateReqItem(item.id, 'description', e.target.value)}
                                    placeholder="Item description..."
                                />
                            </td>
                            <td className="border border-slate-300 px-3 py-2">
                                <input 
                                    type="number" 
                                    className="w-full outline-none bg-transparent text-right" 
                                    value={item.quantity}
                                    onChange={(e) => updateReqItem(item.id, 'quantity', Number(e.target.value))}
                                />
                            </td>
                            <td className="border border-slate-300 px-3 py-2">
                                <input 
                                    type="number" 
                                    className="w-full outline-none bg-transparent text-right" 
                                    value={item.rate}
                                    onChange={(e) => updateReqItem(item.id, 'rate', Number(e.target.value))}
                                />
                            </td>
                            <td className="border border-slate-300 px-3 py-2 text-right font-medium">
                                {(item.quantity * item.rate).toFixed(2)}
                            </td>
                            <td className="border border-slate-300 px-2 py-2 text-center print:hidden">
                                <button onClick={() => removeReqItem(item.id)} className="text-red-500 hover:text-red-700">
                                    <Trash2 size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    <tr className="print:hidden">
                        <td colSpan={6} className="p-2 bg-slate-50 text-center">
                            <button onClick={addReqItem} className="text-teal-600 text-xs font-bold flex items-center justify-center gap-1 mx-auto hover:text-teal-800">
                                <Plus size={14} /> Add Line Item
                            </button>
                        </td>
                    </tr>
                    <tr className="bg-slate-50 font-bold">
                        <td colSpan={4} className="border border-slate-300 px-3 py-2 text-right uppercase text-xs">Grand Total (MVR)</td>
                        <td className="border border-slate-300 px-3 py-2 text-right text-base">{calculateTotal().toFixed(2)}</td>
                        <td className="border border-slate-300 print:hidden"></td>
                    </tr>
                </tbody>
            </table>

            <div className="mb-8">
                <label className="block text-xs font-bold uppercase mb-1">Purpose / Justification:</label>
                <textarea 
                    className="w-full border border-slate-300 rounded p-2 text-sm h-24 resize-none focus:outline-none focus:border-slate-500 bg-transparent"
                    value={reqPurpose}
                    onChange={(e) => setReqPurpose(e.target.value)}
                ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t border-slate-200">
                 <div>
                    <h3 className="text-xs font-bold uppercase border-b border-slate-400 pb-1 mb-12">Requested By</h3>
                    <div className="text-sm">
                        <p className="mb-1"><span className="font-bold">Name:</span> {currentUser.name}</p>
                        <p className="mb-1"><span className="font-bold">Date:</span> {new Date().toLocaleDateString()}</p>
                        <p className="border-t border-dotted border-slate-400 mt-8 pt-1 w-3/4 text-xs text-slate-500">Signature</p>
                    </div>
                 </div>
                 <div>
                    <h3 className="text-xs font-bold uppercase border-b border-slate-400 pb-1 mb-12">Approved By (Head of Dept)</h3>
                     <div className="text-sm">
                        <p className="mb-1"><span className="font-bold">Name:</span> ______________________</p>
                        <p className="mb-1"><span className="font-bold">Date:</span> ______________________</p>
                        <p className="border-t border-dotted border-slate-400 mt-8 pt-1 w-3/4 text-xs text-slate-500">Signature & Stamp</p>
                    </div>
                 </div>
            </div>

             <div className="mt-12 text-[10px] text-slate-400 text-center border-t border-slate-100 pt-2">
                Generated via {systemConfig.councilName} Digital Portal on {new Date().toLocaleString()}
             </div>
          </div>
        )}

        {/* AGU BALAA FORM */}
        {activeForm === 'agu-balaa' && (
             <div className="max-w-4xl mx-auto border border-slate-300 p-8 min-h-[1000px] relative print:border-none print:p-0">
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
             </div>
        )}
      </div>
    </div>
  );
};

export default HudhaForms;