import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";
import CreateComplaint from "../components/complaints/CreateComplaint";
import MyComplaints from "../components/complaints/MyComplaints";
import AdminApproveOfficers from "./AdminApproveOfficers";
import Profile from "./Profile";
import Sidebar from "../components/layout/Sidebar";
import { ComplaintStatus, Complaint } from "../types";
import ComplaintKanbanBoard from "./ComplaintTracker";

const OfficerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin or district commissioner
    const adminRoles = ["ADMIN", "DISTRICT_COMMISSIONER"];
    const userRole = user?.role || "";
    const isUserAdmin = adminRoles.includes(userRole);
    setIsAdmin(isUserAdmin);
  }, [user]);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "create-complaint":
        return <CreateComplaint />;
      case "my-complaints":
        return <MyComplaints />;
      case "admin-approvals":
        return <AdminApproveOfficers />;
      case "profile":
        return <Profile />;
      case "complaint-board":
        return <ComplaintKanbanBoard />;
      default:
        return <DashboardContent isAdmin={isAdmin} user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        isAdmin={isAdmin}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <span className="text-lg font-semibold text-blue-600">
              DC Office
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="bg-white shadow-sm border-b hidden lg:block">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === "dashboard" && "Dashboard"}
                {activeTab === "create-complaint" && "Create Complaint"}
                {activeTab === "my-complaints" && "My Complaints"}
                {activeTab === "admin-approvals" && "Admin Approvals"}
                {activeTab === "profile" && "Profile"}
                {activeTab === "complaint-board" && "Complaint Board"}
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.name || "User"}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role || "OFFICER"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6">{renderContent()}</main>
      </div>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent: React.FC<{ isAdmin: boolean; user: any }> = ({
  isAdmin,
  user,
}) => {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    myComplaints: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch complaints based on user role - single API call
      let complaints: Complaint[];
      if (isAdmin) {
        // For DC/Admin - get all complaints
        complaints = await authService.getComplaints();
      } else {
        // For regular officers - get their own complaints
        complaints = await authService.getMyComplaints();
      }

      // Filter complaints client-side for better performance
      const pendingComplaints = complaints.filter(
        (c) => c.status === "CREATED"
      );
      const resolvedComplaints = complaints.filter(
        (c) => c.status === "RESOLVED"
      );

      setStats({
        totalComplaints: complaints.length,
        pendingComplaints: pendingComplaints.length,
        resolvedComplaints: resolvedComplaints.length,
        myComplaints: isAdmin ? 0 : complaints.length, // DC doesn't have "my complaints" concept
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]); // Memoize based on isAdmin dependency

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]); // Re-fetch when function changes

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Welcome back, {user?.name || "Officer"}!
          </h3>
          <div className="mt-2 max-w-xll text-sm text-gray-500">
            <p>
              {isAdmin
                ? "As a District Commissioner, you have full access to all complaints and administrative functions."
                : "Manage complaints and track their progress from your dashboard."}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Complaints */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">📋</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {isAdmin ? "Total Complaints" : "My Complaints"}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalComplaints}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Complaints */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">⏳</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.pendingComplaints}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Resolved Complaints */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">✅</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Resolved
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.resolvedComplaints}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">📊</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Resolution Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalComplaints > 0
                      ? `${Math.round(
                          (stats.resolvedComplaints / stats.totalComplaints) *
                            100
                        )}%`
                      : "0%"}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => {
                /* This will be handled by parent component */
              }}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-600 ring-4 ring-white">
                  <span className="text-xl">➕</span>
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Create Complaint
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create a new complaint on behalf of a citizen
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                /* This will be handled by parent component */
              }}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-600 ring-4 ring-white">
                  <span className="text-xl">📋</span>
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  View My Complaints
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  View and manage complaints you created
                </p>
              </div>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  /* This will be handled by parent component */
                }}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-600 ring-4 ring-white">
                    <span className="text-xl">👥</span>
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Approve Officers
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Review and approve officer registrations
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
