import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";
import CreateComplaint from "../components/complaints/CreateComplaint";
import MyComplaints from "../components/complaints/MyComplaints";
import AdminApproveOfficers from "./AdminApproveOfficers";
import Profile from "./Profile";
import AppShell from "../components/layout/AppShell";
import { Complaint, Officer, OfficerUpdateData } from "../types";
import {
  Designation,
  Department,
  getDesignationLabel,
  getDepartmentLabel,
  canAssignRole,
  isAdminRole,
} from "../constants/enums";
import ComplaintKanbanBoard from "./ComplaintTracker";
import { User, X } from "lucide-react";

const OfficerDashboard: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [officerProfile, setOfficerProfile] = useState<Officer | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [formData, setFormData] = useState<OfficerUpdateData>({
    name: "",
    email: "",
    mobileNumber: "",
    designation: Designation.OTHER,
    department: Department.OTHER,
  });

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

  // Fetch officer profile when modal opens
  useEffect(() => {
    if (isProfileModalOpen && user) {
      fetchOfficerProfile();
    }
  }, [isProfileModalOpen, user]);

  const fetchOfficerProfile = async () => {
    try {
      setIsLoadingProfile(true);
      setProfileError("");
      const response = await authService.getOfficerProfile();
      if (response.success && response.data) {
        setOfficerProfile(response.data);
        setFormData({
          name: response.data.name || "",
          email: response.data.email || "",
          mobileNumber: response.data.mobileNumber || "",
          designation: Object.values(Designation).includes(
            response.data.designation as Designation
          )
            ? (response.data.designation as Designation)
            : Designation.OTHER,
          department: Object.values(Department).includes(
            response.data.department as Department
          )
            ? (response.data.department as Department)
            : Department.OTHER,
        });
      } else {
        setProfileError("Failed to load profile data");
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setProfileError(
        err.response?.data?.message || "Failed to load profile data"
      );
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setProfileError("");
    setProfileSuccess("");
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileError("");
    setProfileSuccess("");
    // Reset form to original data
    if (officerProfile) {
      setFormData({
        name: officerProfile.name || "",
        email: officerProfile.email || "",
        mobileNumber: officerProfile.mobileNumber || "",
        designation: Object.values(Designation).includes(
          officerProfile.designation as Designation
        )
          ? (officerProfile.designation as Designation)
          : Designation.OTHER,
        department: Object.values(Department).includes(
          officerProfile.department as Department
        )
          ? (officerProfile.department as Department)
          : Department.OTHER,
      });
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsUpdatingProfile(true);
      setProfileError("");
      setProfileSuccess("");

      const response = await authService.updateOfficerProfile(formData);
      if (response.success && response.data) {
        setOfficerProfile(response.data);
        setProfileSuccess("Profile updated successfully!");
        setIsEditingProfile(false);

        // Update user context with new data
        updateUser({
          name: response.data.name,
          email: response.data.email,
        });

        // Clear success message after 3 seconds
        setTimeout(() => setProfileSuccess(""), 3000);
      } else {
        setProfileError(response.message || "Failed to update profile");
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setProfileError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setIsEditingProfile(false);
    setProfileError("");
    setProfileSuccess("");
    setOfficerProfile(null);
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
      <AppShell
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
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
              >
                <span className="text-blue-600 font-semibold text-sm">
                  {user?.name?.charAt(0) || "U"}
                </span>
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
                onClick={() => setIsProfileModalOpen(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6">{renderContent()}</main>
      </div>

      {/* Profile Modal */}
      {isProfileModalOpen && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={closeProfileModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {officerProfile?.name || user.name || "Officer"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {officerProfile?.employeeId ||
                      user.employeeId ||
                      "Employee"}
                  </p>
                </div>
              </div>
            </div>

            {isLoadingProfile ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {profileError && (
                  <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                    <p className="text-sm text-red-700">{profileError}</p>
                  </div>
                )}

                {profileSuccess && (
                  <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                    <p className="text-sm text-green-700">{profileSuccess}</p>
                  </div>
                )}

                {isEditingProfile ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdateProfile();
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="mobileNumber"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Mobile Number
                      </label>
                      <input
                        id="mobileNumber"
                        type="tel"
                        value={formData.mobileNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            mobileNumber: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10),
                          })
                        }
                        required
                        maxLength={10}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="designation"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Designation
                      </label>
                      <select
                        id="designation"
                        value={formData.designation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            designation: e.target.value as Designation,
                          })
                        }
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Object.values(Designation)
                          .filter((designation) => {
                            // Prevent non-admin users from selecting admin-level designations
                            const currentUserRole = user?.role;
                            if (!currentUserRole) return true;

                            // Admin users can select any designation
                            if (
                              isAdminRole(
                                currentUserRole as import("../constants/enums").UserRole
                              )
                            ) {
                              return true;
                            }

                            // Non-admin users cannot select admin-level designations
                            const adminDesignations = [
                              Designation.DISTRICT_COLLECTOR,
                              Designation.ADDITIONAL_DISTRICT_COLLECTOR,
                              Designation.DISTRICT_MAGISTRATE,
                              Designation.DISTRICT_COMMISSIONER,
                            ];

                            return !adminDesignations.includes(designation);
                          })
                          .map((designation) => (
                            <option key={designation} value={designation}>
                              {getDesignationLabel(designation)}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="department"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Department
                      </label>
                      <select
                        id="department"
                        value={formData.department}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            department: e.target.value as Department,
                          })
                        }
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Object.values(Department).map((department) => (
                          <option key={department} value={department}>
                            {getDepartmentLabel(department)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isUpdatingProfile}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdatingProfile ? "Updating..." : "Update Profile"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="border-t pt-4">
                      <div className="space-y-3">
                        {officerProfile?.name && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Name:
                            </span>
                            <span className="text-sm text-gray-900">
                              {officerProfile.name}
                            </span>
                          </div>
                        )}
                        {officerProfile?.employeeId && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Employee ID:
                            </span>
                            <span className="text-sm text-gray-900">
                              {officerProfile.employeeId}
                            </span>
                          </div>
                        )}
                        {officerProfile?.email && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Email:
                            </span>
                            <span className="text-sm text-gray-900">
                              {officerProfile.email}
                            </span>
                          </div>
                        )}
                        {officerProfile?.mobileNumber && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Mobile:
                            </span>
                            <span className="text-sm text-gray-900">
                              {officerProfile.mobileNumber}
                            </span>
                          </div>
                        )}
                        {officerProfile?.designation && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Designation:
                            </span>
                            <span className="text-sm text-gray-900">
                              {getDesignationLabel(
                                officerProfile.designation as Designation
                              )}
                            </span>
                          </div>
                        )}
                        {officerProfile?.department && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Department:
                            </span>
                            <span className="text-sm text-gray-900">
                              {getDepartmentLabel(
                                officerProfile.department as Department
                              )}
                            </span>
                          </div>
                        )}
                        {officerProfile?.role && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Role:
                            </span>
                            <span className="text-sm text-gray-900">
                              {officerProfile.role}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-sm font-medium text-gray-700">
                            Approval Status:
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              officerProfile?.isApproved
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {officerProfile?.isApproved
                              ? "✓ Approved"
                              : "⏳ Pending Approval"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-4 border-t">
                      <button
                        onClick={handleEditProfile}
                        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={() => {
                          closeProfileModal();
                          handleLogout();
                        }}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
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
