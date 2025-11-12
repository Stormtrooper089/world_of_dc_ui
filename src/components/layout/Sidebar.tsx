import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User } from "../../types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: User | null;
  isAdmin: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  user,
  isAdmin,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊", path: "/dashboard" },
    {
      id: "create-complaint",
      label: "Create Complaint",
      icon: "➕",
      path: "/dashboard/complaints/create",
    },
    {
      id: "my-complaints",
      label: "My Complaints",
      icon: "📋",
      path: "/dashboard/complaints",
    },
    {
      id: "meetings",
      label: "My Meetings",
      icon: "📅",
      path: "/dashboard/meetings",
    },
    ...(isAdmin
      ? [
          {
            id: "admin-approvals",
            label: "Admin Approvals",
            icon: "👥",
            path: "/dashboard/admin/approvals",
          },
        ]
      : []),
    { id: "profile", label: "Profile", icon: "👤", path: "/dashboard/profile" },
  ];

  const handleNavigation = (item: { id: string; path: string }) => {
    navigate(item.path);
    onTabChange(item.id);
    onClose();
  };

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-semibold text-blue-600">
                DC Office
              </span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role || "OFFICER"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                  isActive(item.path)
                    ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="text-xs text-gray-500 text-center">
              <p>DC Office System</p>
              <p>Version 1.0</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
