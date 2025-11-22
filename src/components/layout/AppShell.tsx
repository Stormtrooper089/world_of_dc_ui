import React, { useState } from 'react';
import { 
  LayoutDashboard, FileCheck, UserCircle, LogOut, 
  ShieldCheck
} from 'lucide-react';
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../constants/enums"; 

// Import your views
import TicketDashboard from '../../pages/ComplaintTracker'; 
import Approvals from '../../pages/AdminApproveOfficers';
import Profile from '../../pages/Profile';

// Helper for Rail Icons (Light Mode Updated)
const NavIcon = ({ icon: Icon, label, isActive, onClick, badge }: any) => (
  <button
    onClick={onClick}
    className={`
      relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 group mb-3
      ${isActive 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-200' // Active: Blue with soft shadow
        : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600' // Inactive: Gray to Blue hover
      }
    `}
    title={label}
  >
    <Icon className="w-5 h-5" />
    {badge > 0 && (
      <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
    )}
    
    {/* Tooltip (Dark tooltip contrasts well on light theme) */}
    <span className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-medium shadow-xl">
      {label}
    </span>
  </button>
);

export default function AppShell() {
  const [activeView, setActiveView] = useState('CONSOLE'); 
  const { user, logout } = useAuth();

  const isAdmin = user?.role === UserRole.DISTRICT_COMMISSIONER || user?.role === 'ADMIN';

  return (
    <div className="h-screen flex bg-slate-50 font-sans overflow-hidden">
      
      {/* 1. NAVIGATION RAIL (Light Mode) */}
      <nav className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 shrink-0 z-50">
        
        {/* Brand / Logo */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200 mb-8 cursor-default">
          DC
        </div>

        {/* Nav Items */}
        <div className="flex flex-col w-full px-2">
          <NavIcon 
            icon={LayoutDashboard} 
            label="Console" 
            isActive={activeView === 'CONSOLE'} 
            onClick={() => setActiveView('CONSOLE')} 
          />
          
          {/* Only show Approvals for Admin */}
          {isAdmin && (
            <NavIcon 
              icon={ShieldCheck} 
              label="Approvals" 
              isActive={activeView === 'APPROVALS'} 
              onClick={() => setActiveView('APPROVALS')} 
              badge={0} 
            />
          )}
          
          <NavIcon 
            icon={UserCircle} 
            label="Profile" 
            isActive={activeView === 'PROFILE'} 
            onClick={() => setActiveView('PROFILE')} 
          />
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto">
          <NavIcon 
            icon={LogOut} 
            label="Sign Out" 
            onClick={() => {
              if(window.confirm('Are you sure you want to logout?')) logout();
            }} 
          />
        </div>
      </nav>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* View Router */}
        {activeView === 'CONSOLE' && <TicketDashboard />}
        {activeView === 'APPROVALS' && <Approvals />}
        {activeView === 'PROFILE' && <Profile />}
      </div>
    </div>
  );
}