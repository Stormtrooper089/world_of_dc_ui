import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { Officer } from '../types';

const AdminApproveOfficers: React.FC = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const { user } = useAuth();

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await authService.fetchPendingOfficers();
      if (res.success) {
        // Backend returns data directly as array, not as { officers: [...] }
        setOfficers(Array.isArray(res.data) ? res.data : []);
      } else {
        setError(res.message || 'Failed to load');
      }
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
      setError('');
      setSuccessMessage('');
      const approverEmployeeId = (user as any)?.employeeId || '';
      const res = await authService.approveOfficer(id, approverEmployeeId, 'OFFICER');
      if (res.success) {
        setOfficers((prev) => prev.filter(o => o.id !== id));
        setSuccessMessage('Officer approved successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
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
      setError('');
      setSuccessMessage('');
      const approverEmployeeId = (user as any)?.employeeId || '';
      const res = await authService.rejectOfficer(id, approverEmployeeId);
      if (res.success) {
        setOfficers((prev) => prev.filter(o => o.id !== id));
        setSuccessMessage('Officer rejected successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(res.message || 'Failed to reject');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to reject');
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = (officer: Officer) => {
    setSelectedOfficer(officer);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedOfficer(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pending Officer Approvals</h1>
              <p className="mt-1 text-sm text-gray-600">
                {!loading && officers.length > 0 
                  ? `${officers.length} officer${officers.length === 1 ? '' : 's'} awaiting approval`
                  : 'Review and approve officer registration requests'
                }
              </p>
            </div>
            <button
              onClick={load}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{successMessage}</div>
            </div>
          )}

          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading officers...</span>
            </div>
          )}

          {!loading && officers.length === 0 && (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
              <p className="mt-1 text-sm text-gray-500">All officers have been processed.</p>
            </div>
          )}

          {!loading && officers.length > 0 && (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Officer Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department & Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {officers.map((officer) => (
                    <tr key={officer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {officer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{officer.name}</div>
                            <div className="text-sm text-gray-500">{officer.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{officer.email}</div>
                        <div className="text-sm text-gray-500">{officer.mobileNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{officer.department}</div>
                        <div className="text-sm text-gray-500">{officer.designation}</div>
                        <div className="text-xs text-blue-600 font-medium mt-1">
                          {officer.role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <svg className="w-2 h-2 mr-1.5" fill="currentColor" viewBox="0 0 8 8">
                            <circle cx={4} cy={4} r={3} />
                          </svg>
                          Pending Approval
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewDetails(officer)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => approve(officer.id)}
                            disabled={loading}
                            className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => reject(officer.id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Officer Details Modal */}
      {showDetails && selectedOfficer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <span className="text-lg font-medium text-blue-600">
                      {selectedOfficer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedOfficer.name}</h3>
                    <p className="text-sm text-gray-500">{selectedOfficer.employeeId}</p>
                  </div>
                </div>
                <button
                  onClick={closeDetails}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-100"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedOfficer.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedOfficer.mobileNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedOfficer.department}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Designation</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedOfficer.designation}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assigned Role</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedOfficer.role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <svg className="w-2 h-2 mr-1.5" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx={4} cy={4} r={3} />
                        </svg>
                        Pending Approval
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeDetails}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      approve(selectedOfficer.id);
                      closeDetails();
                    }}
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Approve Officer
                  </button>
                  <button
                    onClick={() => {
                      reject(selectedOfficer.id);
                      closeDetails();
                    }}
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject Officer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApproveOfficers;
