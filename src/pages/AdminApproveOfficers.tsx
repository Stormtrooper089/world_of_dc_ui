import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const AdminApproveOfficers: React.FC = () => {
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();

  const load = async () => {
    try {
      setLoading(true);
      const res = await authService.fetchPendingOfficers();
      if (res.success) setOfficers(res.data.officers || []);
      else setError(res.message || 'Failed to load');
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    try {
      setLoading(true);
      const approverEmployeeId = user?.id || (user as any)?.employeeId || '';
      const res = await authService.approveOfficer(id, approverEmployeeId, 'OFFICER');
      if (res.success) {
        setOfficers((prev) => prev.filter(o => o.id !== id));
      } else {
        setError(res.message || 'Failed to approve');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to approve');
    } finally {
      setLoading(false);
    }
  };

  const reject = async (id: string) => {
    try {
      setLoading(true);
      const approverEmployeeId = user?.id || (user as any)?.employeeId || '';
      const res = await authService.rejectOfficer(id, approverEmployeeId);
      if (res.success) {
        setOfficers((prev) => prev.filter(o => o.id !== id));
      } else {
        setError(res.message || 'Failed to reject');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to reject');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pending Officer Approvals</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <ul className="space-y-4">
        {officers.map((o) => (
          <li key={o.id} className="p-4 bg-white rounded shadow flex justify-between items-center">
            <div>
              <div className="font-semibold">{o.name} ({o.employeeId})</div>
              <div className="text-sm text-gray-600">{o.email} • {o.department}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => approve(o.id)} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
              <button onClick={() => reject(o.id)} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminApproveOfficers;
