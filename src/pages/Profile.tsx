import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-700"><strong>Name:</strong> {user?.name}</p>
          <p className="text-gray-700"><strong>Email:</strong> {user?.email}</p>
          <p className="text-gray-700"><strong>Role:</strong> {user?.role}</p>
          <p className="text-gray-700"><strong>Joined:</strong> {user?.createdAt}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
