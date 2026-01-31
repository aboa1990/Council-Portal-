

import React, { useState } from 'react';
import { RequestPriority, CitizenRequest, RequestStatus } from '../types';
import { X, Save, Sparkles, Loader2 } from 'lucide-react';
import { analyzeRequestPriority } from '../services/geminiService';

interface RequestFormProps {
  onClose: () => void;
  onSubmit: (data: Partial<CitizenRequest>) => void;
}

const RequestForm: React.FC<RequestFormProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    citizenName: '',
    description: '',
    category: 'Infrastructure',
    location: '',
    priority: RequestPriority.MEDIUM as RequestPriority
  });
  
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.description) return;
    
    setAnalyzing(true);
    const result = await analyzeRequestPriority(formData.description, formData.category);
    if (result) {
        setFormData(prev => ({
            ...prev,
            priority: result.priority as RequestPriority
        }));
    }
    setAnalyzing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
        ...formData,
        status: RequestStatus.NEW,
        date: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            Create Service Request
            <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Manual Entry</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Issue Title</label>
            <input 
              required
              type="text" 
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="e.g. Broken streetlight on 5th"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Citizen Name</label>
            <input 
              required
              type="text" 
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="e.g. John Doe"
              value={formData.citizenName}
              onChange={e => setFormData({...formData, citizenName: e.target.value})}
            />
          </div>

           <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Location</label>
            <input 
              required
              type="text" 
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="e.g. 123 Main St"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
            <select 
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
                <option>Infrastructure</option>
                <option>Waste Management</option>
                <option>Noise Control</option>
                <option>Parks & Rec</option>
                <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex justify-between">
                Priority
                {analyzing && <span className="text-purple-600 flex items-center gap-1 normal-case"><Loader2 className="animate-spin" size={10} /> AI Analyzing...</span>}
            </label>
            <select 
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
              value={formData.priority}
              onChange={e => setFormData({...formData, priority: e.target.value as RequestPriority})}
            >
                <option value={RequestPriority.LOW}>Low</option>
                <option value={RequestPriority.MEDIUM}>Medium</option>
                <option value={RequestPriority.HIGH}>High</option>
                <option value={RequestPriority.CRITICAL}>Critical</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <button 
                    type="button"
                    onClick={handleAnalyze}
                    className="text-[10px] text-purple-600 hover:bg-purple-50 px-2 py-1 rounded border border-purple-200 flex items-center gap-1 transition-colors"
                >
                    <Sparkles size={10} /> Auto-set Priority
                </button>
            </div>
            <textarea 
              required
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none h-24 resize-none"
              placeholder="Describe the issue in detail..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="md:col-span-2 border-t border-slate-100 pt-4 flex justify-end gap-3">
             <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
            >
                Cancel
             </button>
             <button 
                type="submit" 
                className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md shadow-sm flex items-center gap-2 transition-colors"
            >
                <Save size={16} />
                Submit Request
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestForm;