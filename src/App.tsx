import React from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import OtpVerification from "./components/auth/OtpVerification";
import RoleBasedHome from "./components/auth/RoleBasedHome";
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
import Elections from "./pages/Elections.tsx";
import ControlRoomPage from "./pages/elections/ControlRoomPage";
import LocationUpdatePage from "./pages/elections/LocationUpdatePage";
import MaterialsReceivedPage from "./pages/elections/MaterialsReceivedPage";
import ReportIssuePage from "./pages/elections/ReportIssuePage";
import TeamDirectoryPage from "./pages/elections/TeamDirectoryPage";
import VehicleLocatorPage from "./pages/elections/VehicleLocatorPage";
import Home from "./pages/Home";
import Officer from "./pages/Officer";
import Profile from "./pages/Profile";
import AppShell from "./components/layout/AppShell";
import { UserRole } from "./constants/enums";

// Officer roles that can access officer dashboard
const OFFICER_ROLES: UserRole[] = [
  UserRole.OFFICER,
  UserRole.DISTRICT_COMMISSIONER,
  UserRole.ADDITIONAL_DISTRICT_COMMISSIONER,
  UserRole.BLOCK_DEVELOPMENT_OFFICER,
  UserRole.GRAM_PANCHAYAT_OFFICER,
  UserRole.TEHSILDAR,
  UserRole.SUB_DIVISIONAL_OFFICER,
  UserRole.HEALTH_OFFICER,
  UserRole.EDUCATION_OFFICER,
  UserRole.REVENUE_OFFICER,
  UserRole.AGRICULTURE_OFFICER,
  UserRole.PUBLIC_WORKS_OFFICER,
  UserRole.PWD_OFFICER,
  UserRole.POLICE_OFFICER,
  UserRole.ADMIN,
];

// Main App Routes
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<RoleBasedHome />} />
      {/* <Route path="/" element={<CustomerPage />} /> */}
      <Route path="/customer" element={<CustomerPage />} />
      <Route path="/elections/*" element={<Elections />}>
        <Route index element={<Navigate to="control-room" replace />} />
        <Route path="team-directory" element={<TeamDirectoryPage />} />
        <Route path="vehicle-locator" element={<VehicleLocatorPage />} />
        <Route path="location-update" element={<LocationUpdatePage />} />
        <Route path="materials" element={<MaterialsReceivedPage />} />
        <Route path="control-room" element={<ControlRoomPage />} />
        <Route path="issues/new" element={<ReportIssuePage />} />
      </Route>
      <Route path="/officer-login" element={<Officer />} />
      <Route path="/customer2" element={<Home />} />
      <Route path="/verify-otp" element={<OtpVerification />} />
      <Route
        path="/signup"
        element={isAuthenticated ? <RoleBasedHome /> : <SignUpForm />}
      />
      <Route
        path="/officer-dashboard"
        element={
          <RoleProtectedRoute allowedRoles={OFFICER_ROLES}>
            <AppShell />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/citizen"
        element={
          <RoleProtectedRoute allowedRoles={["CITIZEN"]}>
            <CitizenHome />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/dashboard/*"
        element={
          <RoleProtectedRoute allowedRoles={OFFICER_ROLES}>
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
          </RoleProtectedRoute>
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
