import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import CitizenHome from "../../pages/CitizenHome";

const RoleBasedHome: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is authenticated, redirect based on role
  if (isAuthenticated && user) {
    // If not citizen (i.e., officer), go to officer dashboard
    if (user.role !== "CITIZEN") {
      return <Navigate to="/officer-dashboard" replace />;
    }

    // Citizen - go to citizen portal
    return <Navigate to="/citizen" replace />;
  }

  // Not authenticated or unknown role - show default citizen home
  return <CitizenHome />;
};

export default RoleBasedHome;
