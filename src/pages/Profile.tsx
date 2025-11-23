import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { OfficerUpdateData, Officer } from '../types';
import { 
  User, Mail, Phone, Briefcase, Building, 
  BadgeCheck, Save, X, Loader2, Camera 
} from 'lucide-react';

const Profile: React.FC = () => {
  const { updateUser } = useAuth();
  const [officerData, setOfficerData] = useState<Officer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<OfficerUpdateData>();

  // Fetch Data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoadingData(true);
        const response = await authService.getOfficerProfile();
        if (response.success && response.data) {
          setOfficerData(response.data);
          // Pre-fill form
          setValue('name', response.data.name || '');
          setValue('email', response.data.email || '');
          setValue('mobileNumber', response.data.mobileNumber || '');
          setValue('designation', response.data.designation || '');
          setValue('department', response.data.department || '');
        }
      } catch (err: any) {
        setError('Failed to load profile data');
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchProfileData();
  }, [setValue]);

  const onSubmit = async (data: OfficerUpdateData) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await authService.updateOfficerProfile(data);
      if (response.success && response.data) {
        setOfficerData(response.data);
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        updateUser({ name: response.data.name, email: response.data.email });
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(response.message || 'Failed to update');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="flex-1 bg-gray-50 p-8 overflow-y-auto h-full">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header & Actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Notifications */}
        {(message || error) && (
          <div className={`p-4 rounded-lg border ${message ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {message || error}
          </div>
        )}

        {/* Main Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Identity Header */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-md">
                  {officerData?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{officerData?.name}</h3>
                <p className="text-gray-500 flex items-center gap-2">
                  {officerData?.designation} 
                  <span className="text-gray-300">•</span> 
                  {officerData?.department}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${officerData?.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {officerData?.isApproved ? <BadgeCheck className="w-3 h-3 mr-1" /> : null}
                    {officerData?.isApproved ? 'Verified Officer' : 'Pending Approval'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form / Details Section */}
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="group">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase mb-1.5">
                      <User className="w-4 h-4" /> Full Name
                    </label>
                    {isEditing ? (
                      <input {...register('name')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    ) : (
                      <p className="text-gray-900 font-medium">{officerData?.name}</p>
                    )}
                  </div>

                  <div className="group">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase mb-1.5">
                      <Mail className="w-4 h-4" /> Email Address
                    </label>
                    {isEditing ? (
                      <input {...register('email')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    ) : (
                      <p className="text-gray-900 font-medium">{officerData?.email}</p>
                    )}
                  </div>

                  <div className="group">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase mb-1.5">
                      <Phone className="w-4 h-4" /> Mobile Number
                    </label>
                    {isEditing ? (
                      <input {...register('mobileNumber')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    ) : (
                      <p className="text-gray-900 font-medium">{officerData?.mobileNumber}</p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                   <div className="group">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase mb-1.5">
                      <Building className="w-4 h-4" /> Department
                    </label>
                    {isEditing ? (
                      <input {...register('department')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    ) : (
                      <p className="text-gray-900 font-medium">{officerData?.department}</p>
                    )}
                  </div>

                  <div className="group">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase mb-1.5">
                      <Briefcase className="w-4 h-4" /> Designation
                    </label>
                    {isEditing ? (
                      <input {...register('designation')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    ) : (
                      <p className="text-gray-900 font-medium">{officerData?.designation}</p>
                    )}
                  </div>

                  <div className="group">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase mb-1.5">
                      Role & ID
                    </label>
                    <p className="text-gray-500 text-sm">{officerData?.role} • <span className="font-mono text-gray-600">{officerData?.employeeId}</span></p>
                  </div>
                </div>
              </div>

              {/* Edit Actions */}
              {isEditing && (
                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;