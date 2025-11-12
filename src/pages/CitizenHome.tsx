import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, List, User } from 'lucide-react';

const CitizenHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome, Citizen</h1>

        <p className="text-gray-600 mb-8">Quick actions to manage your complaints and profile.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/dashboard/complaints/create')}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow hover:shadow-md"
          >
            <PlusCircle className="h-10 w-10 text-blue-600 mb-2" />
            <span className="font-semibold">Raise a new complaint</span>
          </button>

          <button
            onClick={() => navigate('/dashboard/complaints')}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow hover:shadow-md"
          >
            <List className="h-10 w-10 text-blue-600 mb-2" />
            <span className="font-semibold">Fetch all complaints</span>
          </button>

          <button
            onClick={() => navigate('/dashboard/profile')}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow hover:shadow-md"
          >
            <User className="h-10 w-10 text-blue-600 mb-2" />
            <span className="font-semibold">Profile page</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CitizenHome;
