import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginForm from './components/auth/LoginForm';
import SignUpForm from './components/auth/SignUpForm';
import OtpVerification from './components/auth/OtpVerification';
import Home from './pages/Home';
import CitizenHome from './pages/CitizenHome';
import Profile from './pages/Profile';
import AdminApproveOfficers from './pages/AdminApproveOfficers';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';
import Officer from './pages/Officer';
import Dashboard from './pages/Dashboard';
import ComplaintList from './components/complaints/ComplaintList';

// Main App Routes
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
        <Route path="/verify-otp" element={<OtpVerification />} />
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginForm />} 
      />
      <Route 
        path="/signup" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignUpForm />} 
      />
      <Route path="/officer" element={<Officer />} />
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
                <Route path="/complaints/create" element={<div>Create Complaint Page (Coming Soon)</div>} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin/approvals" element={<RoleProtectedRoute allowedRoles={["ADMIN","DISTRICT_COMMISSIONER"]}><AdminApproveOfficers /></RoleProtectedRoute>} />
                <Route path="/users" element={<div>Users Page (Coming Soon)</div>} />
                <Route path="/analytics" element={<div>Analytics Page (Coming Soon)</div>} />
                <Route path="/notifications" element={<div>Notifications Page (Coming Soon)</div>} />
                <Route path="/settings" element={<div>Settings Page (Coming Soon)</div>} />
                <Route path="*" element={<Navigate to="/" replace />} />
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
