import React, { useState } from 'react';
import { CitizenRequest, RequestPriority, RequestStatus } from '../types';
import { ChevronRight, Filter, Plus, Search } from 'lucide-react';
import RequestForm from './RequestForm';

interface RequestListProps {
  requests: CitizenRequest[];
  onSelectRequest: (request: CitizenRequest) => void;
  onAddRequest?: (request: Partial<CitizenRequest>) => void;
}

const RequestList: React.FC<RequestListProps> = ({ requests, onSelectRequest, onAddRequest }) => {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('');

  const getPriorityBadge = (priority: RequestPriority) => {
    const styles = {
      [RequestPriority.CRITICAL]: 'bg-red-50 text-red-700 ring-red-600/20',
      [RequestPriority.HIGH]: 'bg-orange-50 text-orange-700 ring-orange-600/20',
      [RequestPriority.MEDIUM]: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
      [RequestPriority.LOW]: 'bg-slate-50 text-slate-700 ring-slate-600/20',
    };
    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium ring-1 ring-inset ${styles[priority]}`}>
            {priority}
        </span>
    );
  };

  const getStatusBadge = (status: RequestStatus) => {
      const styles = {
          [RequestStatus.NEW]: 'text-teal-700 bg-teal-50',
          [RequestStatus.IN_PROGRESS]: 'text-indigo-700 bg-indigo-50',
          [RequestStatus.RESOLVED]: 'text-emerald-700 bg-emerald-50',
          [RequestStatus.ARCHIVED]: 'text-slate-600 bg-slate-50'
      };
      return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-60`}></div>
              {status}
          </span>
      )
  }

  const filteredRequests = requests.filter(r => 
    r.title.toLowerCase().includes(filter.toLowerCase()) || 
    r.citizenName.toLowerCase().includes(filter.toLowerCase()) ||
    r.id.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <>
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative max-w-sm w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:placeholder-slate-500 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition duration-150 ease-in-out"
                        placeholder="Search requests..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                        <Filter className="mr-2 h-4 w-4 text-slate-500" />
                        Filter
                    </button>
                    <button 
                        onClick={() => setShowForm(true)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Request
                    </button>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ID / Citizen</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Issue</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredRequests.map((req) => (
                                <tr 
                                    key={req.id} 
                                    onClick={() => onSelectRequest(req)}
                                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-teal-700 font-mono">{req.id}</div>
                                        <div className="text-sm text-slate-500">{req.citizenName}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-slate-900 line-clamp-1 max-w-[240px]">{req.title}</div>
                                        <div className="text-xs text-slate-500 line-clamp-1 max-w-[240px] mt-0.5">{req.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {req.category}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getPriorityBadge(req.priority)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(req.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-numeric">
                                        {new Date(req.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <ChevronRight className="text-slate-300 group-hover:text-teal-600 h-5 w-5" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredRequests.length === 0 && (
                     <div className="p-8 text-center text-slate-500 text-sm">
                        No requests found matching your search.
                     </div>
                )}
            </div>
            <div className="flex justify-between items-center text-sm text-slate-500 px-1">
                <div>Showing {filteredRequests.length} results</div>
                <div className="flex gap-2">
                    <button className="px-3 py-1 border border-slate-300 rounded hover:bg-white disabled:opacity-50" disabled>Previous</button>
                    <button className="px-3 py-1 border border-slate-300 rounded hover:bg-white disabled:opacity-50" disabled>Next</button>
                </div>
            </div>
        </div>

        {showForm && onAddRequest && (
            <RequestForm 
                onClose={() => setShowForm(false)} 
                onSubmit={(data) => {
                    onAddRequest(data);
                    setShowForm(false);
                }} 
            />
        )}
    </>
  );
};

export default RequestList;