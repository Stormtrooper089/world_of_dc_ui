import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { OfficerUpdateData, Officer } from '../types';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [officerData, setOfficerData] = useState<Officer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<OfficerUpdateData>();

  // Fetch officer profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoadingData(true);
        setError('');
        const response = await authService.getOfficerProfile();
        if (response.success && response.data) {
          setOfficerData(response.data);
          // Set form values
          setValue('name', response.data.name || '');
          setValue('email', response.data.email || '');
          setValue('mobileNumber', response.data.mobileNumber || '');
          setValue('designation', response.data.designation || '');
          setValue('department', response.data.department || '');
        } else {
          setError('Failed to load profile data');
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.response?.data?.message || 'Failed to load profile data');
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
      setMessage('');

      const response = await authService.updateOfficerProfile(data);
      if (response.success && response.data) {
        // Update local officer data
        setOfficerData(response.data);
        
        // Show success message
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        
        // Update the user context with new data (only name and email)
        updateUser({
          name: response.data.name,
          email: response.data.email,
        });
        
        // Clear message after 5 seconds
        setTimeout(() => setMessage(''), 5000);
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      
      // Handle different types of errors
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        // Don't redirect automatically, let user decide
      } else if (err.response?.status === 403) {
        setError('You do not have permission to update this profile.');
      } else if (err.response?.status === 400) {
        setError(err.response.data?.message || 'Invalid data provided. Please check your input.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setMessage('');
    // Reset form to current officer data
    if (officerData) {
      setValue('name', officerData.name || '');
      setValue('email', officerData.email || '');
      setValue('mobileNumber', officerData.mobileNumber || '');
      setValue('designation', officerData.designation || '');
      setValue('department', officerData.department || '');
    }
  };

  if (isLoadingData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading profile data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Profile Information</h1>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-1 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className="mb-4 rounded-md bg-green-50 p-4 border border-green-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-green-800">Success!</h3>
                  <div className="mt-1 text-sm text-green-700">{message}</div>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="text-sm font-medium text-green-800 hover:text-green-900 underline"
                    >
                      Refresh page to see all changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    type="text"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                  <input
                    {...register('mobileNumber', { 
                      required: 'Mobile number is required',
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Mobile number must be 10 digits'
                      }
                    })}
                    type="tel"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.mobileNumber ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.mobileNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.mobileNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Designation</label>
                  <input
                    {...register('designation', { required: 'Designation is required' })}
                    type="text"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.designation ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.designation && (
                    <p className="mt-1 text-sm text-red-600">{errors.designation.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <input
                    {...register('department', { required: 'Department is required' })}
                    type="text"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.department ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.department && (
                    <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{officerData?.name || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Employee ID</label>
                  <p className="mt-1 text-sm text-gray-900">{officerData?.employeeId || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{officerData?.email || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Mobile Number</label>
                  <p className="mt-1 text-sm text-gray-900">{officerData?.mobileNumber || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Designation</label>
                  <p className="mt-1 text-sm text-gray-900">{officerData?.designation || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Department</label>
                  <p className="mt-1 text-sm text-gray-900">{officerData?.department || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Role</label>
                  <p className="mt-1 text-sm text-gray-900">{officerData?.role || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      officerData?.isApproved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {officerData?.isApproved ? 'Approved' : 'Pending Approval'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Member Since</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {officerData?.createdAt ? new Date(officerData.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {officerData?.updatedAt ? new Date(officerData.updatedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
