import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { Officer } from '../types';
import { 
  CheckCircle, XCircle, Shield, User, Mail, 
  Building, Loader2, RefreshCw 
} from 'lucide-react';

const AdminApproveOfficers: React.FC = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // Stores ID of item being processed
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { user } = useAuth();

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await authService.fetchPendingOfficers();
      if (res.success) {
        setOfficers(Array.isArray(res.data) ? res.data : []);
      } else {
        setError(res.message || 'Failed to load');
      }
    } catch (e: any) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      setActionLoading(id);
      const approverId = (user as any)?.employeeId || '';
      const res = action === 'APPROVE' 
        ? await authService.approveOfficer(id, approverId, 'OFFICER')
        : await authService.rejectOfficer(id, approverId);

      if (res.success) {
        setOfficers(prev => prev.filter(o => o.id !== id));
        setMessage(`Officer ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(res.message || 'Action failed');
      }
    } catch (e) {
      setError('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 p-8 overflow-y-auto h-full">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
             <h2 className="text-2xl font-bold text-gray-900">Approvals Center</h2>
             <p className="text-gray-500 text-sm mt-1">Review registration requests from new officers.</p>
          </div>
          <button 
            onClick={load} 
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Feedback Messages */}
        {(message || error) && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message || error}
          </div>
        )}

        {/* List */}
        <div className="space-y-4">
          {!loading && officers.length === 0 && (
             <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
               <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
               <h3 className="text-gray-900 font-medium">All Caught Up</h3>
               <p className="text-gray-500 text-sm">No pending approvals found.</p>
             </div>
          )}

          {officers.map(officer => (
            <div key={officer.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              {/* Main Info */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-bold shrink-0">
                  {officer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    {officer.name}
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">Pending</span>
                  </h3>
                  <div className="text-sm text-gray-500 mt-1 space-y-1 md:space-y-0 md:flex md:gap-4">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {officer.employeeId}</span>
                    <span className="flex items-center gap-1"><Building className="w-3 h-3" /> {officer.department} ({officer.designation})</span>
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {officer.email}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 mt-2 md:mt-0">
                 <button 
                   onClick={() => handleAction(officer.id, 'REJECT')}
                   disabled={!!actionLoading}
                   className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent"
                 >
                   Reject
                 </button>
                 <button 
                   onClick={() => handleAction(officer.id, 'APPROVE')}
                   disabled={!!actionLoading}
                   className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 min-w-[100px]"
                 >
                   {actionLoading === officer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                   Approve
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminApproveOfficers;