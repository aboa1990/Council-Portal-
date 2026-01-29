import React, { useState } from 'react';
import { CitizenRequest, RequestStatus } from '../types';
import { analyzeRequestPriority, generateOfficialResponse } from '../services/geminiService';
import { ArrowLeft, Sparkles, Send, CheckCircle, MapPin, User, Calendar, Loader2 } from 'lucide-react';

interface RequestDetailProps {
  request: CitizenRequest;
  onBack: () => void;
  onUpdateStatus: (id: string, status: RequestStatus) => void;
}

const RequestDetail: React.FC<RequestDetailProps> = ({ request, onBack, onUpdateStatus }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ priority: string, reasoning: string, suggestedAction: string } | null>(null);
  const [generatedResponse, setGeneratedResponse] = useState<string>('');
  const [draftNote, setDraftNote] = useState('');

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const result = await analyzeRequestPriority(request.description, request.category);
    setAiAnalysis(result);
    setAnalyzing(false);
  };

  const handleGenerateResponse = async () => {
    setGeneratingResponse(true);
    const text = await generateOfficialResponse(request);
    setGeneratedResponse(text);
    setGeneratingResponse(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-2"
      >
        <ArrowLeft size={18} />
        Back to List
      </button>

      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">{request.title}</h1>
              <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-500">#{request.id}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1"><User size={14} /> {request.citizenName}</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {request.location}</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(request.date).toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Status:</span>
            <select 
              value={request.status} 
              onChange={(e) => onUpdateStatus(request.id, e.target.value as RequestStatus)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {Object.values(RequestStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 leading-relaxed">
          {request.description}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Triage Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Sparkles className="text-purple-600" size={20} />
              AI Smart Triage
            </h3>
            {!aiAnalysis && (
              <button 
                onClick={handleAnalyze} 
                disabled={analyzing}
                className="text-sm bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg font-medium hover:bg-purple-100 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {analyzing ? <Loader2 className="animate-spin" size={14} /> : 'Analyze Priority'}
              </button>
            )}
          </div>

          {aiAnalysis ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-sm font-medium text-slate-500">Recommended Priority</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                  aiAnalysis.priority === 'Critical' ? 'bg-red-100 text-red-700' : 
                  aiAnalysis.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                  aiAnalysis.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                }`}>
                  {aiAnalysis.priority}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reasoning</span>
                <p className="text-sm text-slate-600 mt-1">{aiAnalysis.reasoning}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Suggested Action</span>
                <p className="text-sm text-slate-600 mt-1">{aiAnalysis.suggestedAction}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm italic">
              Run analysis to get insights...
            </div>
          )}
        </div>

        {/* Response Generator */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
           <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Send className="text-blue-600" size={20} />
              Response Draft
            </h3>
            <button 
                onClick={handleGenerateResponse} 
                disabled={generatingResponse}
                className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {generatingResponse ? <Loader2 className="animate-spin" size={14} /> : 'Draft Response'}
            </button>
          </div>

          {generatedResponse ? (
            <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
               <textarea 
                className="w-full flex-1 p-3 text-sm text-slate-700 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-slate-50"
                value={generatedResponse}
                onChange={(e) => setGeneratedResponse(e.target.value)}
              />
              <div className="mt-4 flex justify-end gap-2">
                <button 
                  onClick={() => setGeneratedResponse('')}
                  className="px-4 py-2 text-sm text-slate-500 hover:text-slate-800"
                >
                  Discard
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm">
                  <CheckCircle size={16} />
                  Approve & Send
                </button>
              </div>
            </div>
          ) : (
             <div className="flex-1 flex flex-col">
               <textarea 
                  className="w-full flex-1 p-3 text-sm text-slate-700 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Type manual response or use AI to draft..."
                  value={draftNote}
                  onChange={(e) => setDraftNote(e.target.value)}
                />
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;