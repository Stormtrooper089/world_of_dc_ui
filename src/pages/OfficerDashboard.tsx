import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import CreateComplaint from '../components/complaints/CreateComplaint';
import AdminApproveOfficers from './AdminApproveOfficers';
import Profile from './Profile';

const OfficerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin or district commissioner
    const adminRoles = ['ADMIN', 'DISTRICT_COMMISSIONER'];
    const userRole = user?.role || '';
    const isUserAdmin = adminRoles.includes(userRole);
    setIsAdmin(isUserAdmin);
  }, [user]);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'create-complaint':
        return <CreateComplaint />;
      case 'admin-approvals':
        return <AdminApproveOfficers />;
      case 'profile':
        return <Profile />;
      default:
        return <DashboardContent isAdmin={isAdmin} user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-gray-900">
                  Officer Portal
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('create-complaint')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'create-complaint'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Create Complaint
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('admin-approvals')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'admin-approvals'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Approve Officers
                </button>
              )}
            </nav>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0) || 'O'}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">{user?.name || 'Officer'}</span>
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowProfileMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Update Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
              activeTab === 'dashboard'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('create-complaint')}
            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
              activeTab === 'create-complaint'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            Create Complaint
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin-approvals')}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                activeTab === 'admin-approvals'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Approve Officers
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
};

// Dashboard Content Component
interface DashboardContentProps {
  isAdmin: boolean;
  user: any;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ isAdmin, user }) => {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    activeComplaints: 0,
    resolvedComplaints: 0,
    pendingInformation: 0
  });

  useEffect(() => {
    // Fetch dashboard stats
    // This would typically call an API to get officer-specific stats
    // For now, we'll use mock data
    setStats({
      totalComplaints: 12,
      activeComplaints: 5,
      resolvedComplaints: 6,
      pendingInformation: 1
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name || 'Officer'}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {user?.name ? `Here's an overview of your assigned complaints and tasks, ${user.name.split(' ')[0]}.` : 'Here\'s an overview of your assigned complaints and tasks.'}
          </p>
          {user?.role && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user.role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Complaints</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalComplaints}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Complaints</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.activeComplaints}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Resolved</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.resolvedComplaints}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Info</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.pendingInformation}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-gray-400">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Create New Complaint
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Report a new complaint or issue that needs attention.
                </p>
              </div>
            </button>

            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-gray-400">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  View My Complaints
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  See all complaints assigned to you and their current status.
                </p>
              </div>
            </button>

            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-gray-400">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Update Profile
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Manage your personal information and account settings.
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
