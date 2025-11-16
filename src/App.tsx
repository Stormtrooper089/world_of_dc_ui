import React from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import LoginForm from "./components/auth/LoginForm";
import OtpVerification from "./components/auth/OtpVerification";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleProtectedRoute from "./components/auth/RoleProtectedRoute";
import SignUpForm from "./components/auth/SignUpForm";
import ComplaintList from "./components/complaints/ComplaintList";
import CreateComplaint from "./components/complaints/CreateComplaint";
import Layout from "./components/layout/Layout";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AdminApproveOfficers from "./pages/AdminApproveOfficers";
import CitizenHome from "./pages/CitizenHome";
import ComplaintDetail from "./pages/ComplaintDetail";
import CustomerPage from "./pages/CustomerPage";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Officer from "./pages/Officer";
import OfficerDashboard from "./pages/OfficerDashboard";
import Profile from "./pages/Profile";

// Main App Routes
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<CitizenHome />} />
      {/* <Route path="/" element={<CustomerPage />} /> */}
      <Route path="/customer" element={<CustomerPage />} />
      <Route path="/officer-login" element={<Officer />} />
      <Route path="/customer2" element={<Home />} />
      <Route path="/verify-otp" element={<OtpVerification />} />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/officer-dashboard" replace />
          ) : (
            <LoginForm />
          )
        }
      />
      <Route
        path="/signup"
        element={
          isAuthenticated ? (
            <Navigate to="/officer-dashboard" replace />
          ) : (
            <SignUpForm />
          )
        }
      />
      <Route
        path="/officer-dashboard"
        element={
          <ProtectedRoute>
            <OfficerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen"
        element={
          <ProtectedRoute>
            <CitizenHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/complaints" element={<ComplaintList />} />
                <Route path="/complaints/:id" element={<ComplaintDetail />} />
                <Route
                  path="/complaints/create"
                  element={<CreateComplaint />}
                />
                <Route path="/profile" element={<Profile />} />
                <Route
                  path="/admin/approvals"
                  element={
                    <RoleProtectedRoute
                      allowedRoles={["ADMIN", "DISTRICT_COMMISSIONER"]}
                    >
                      <AdminApproveOfficers />
                    </RoleProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={<div>Users Page (Coming Soon)</div>}
                />
                <Route
                  path="/analytics"
                  element={<div>Analytics Page (Coming Soon)</div>}
                />
                <Route
                  path="/notifications"
                  element={<div>Notifications Page (Coming Soon)</div>}
                />
                <Route
                  path="/settings"
                  element={<div>Settings Page (Coming Soon)</div>}
                />
                <Route path="*" element={<Navigate to="/customer" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
