import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { OfficerLoginCredentials, OfficerSignupData } from '../types';
import { getRoleFromToken, getOfficerIdFromToken, getEmployeeIdFromToken } from '../utils/jwt';

const Officer: React.FC = () => {
  // default to login view; officer can switch to sign-up
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<OfficerSignupData>();
  const { register: registerLogin, handleSubmit: handleLogin, formState: { errors: loginErrors } } = useForm<OfficerLoginCredentials>();

  const [pendingMessage, setPendingMessage] = useState('');

  const clearMessages = () => {
    setError('');
    setPendingMessage('');
  };

  const onCreate = async (data: OfficerSignupData) => {
    try {
      setError('');
      setPendingMessage('');
      setIsLoading(true);
      const res = await authService.signupOfficer(data);
      if (res.success) {
        setPendingMessage('Account created successfully! Your account is pending admin approval. You will be notified once approved.');
        setIsCreating(false);
        // Reset form
        window.location.reload();
      } else {
        setError(res.message || 'Failed to create officer account. Please try again.');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.response?.status === 409) {
        setError('An officer with this employee ID or email already exists.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to create officer account. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onLogin = async (data: OfficerLoginCredentials) => {
    try {
      setError('');
      setPendingMessage('');
      setIsLoading(true);
      const res = await authService.officerLogin(data);
      if (res.success && res.data?.token) {
        const token = res.data.token;
        
        // Extract role and other info from JWT token
        const role = getRoleFromToken(token);
        const officerId = getOfficerIdFromToken(token);
        const employeeId = getEmployeeIdFromToken(token);
        
        localStorage.setItem('token', token);
        
        // Store officer info in localStorage for persistence
        const userData = { 
          id: officerId || res.data.officerId || '', 
          name: res.data.name || '', 
          email: res.data.email || '', 
          role: role, 
          employeeId: employeeId,
          createdAt: new Date().toISOString(), 
          updatedAt: new Date().toISOString() 
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setAuth({ token, user: userData as any });
        window.location.href = '/officer-dashboard';
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response?.status === 401) {
        setError('Invalid employee ID or password. Please try again.');
      } else if (err.response?.status === 403) {
        setError('Your account is not approved yet. Please contact administrator.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-gray-900">
                  Officer Portal
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/customer"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Customer Portal
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Officer Portal</h2>
            <p className="mt-2 text-center text-sm text-gray-600">Sign in to your officer account or create a new one</p>
          </div>

          {error && <div className="rounded-md bg-red-50 p-4"><div className="text-sm text-red-700">{error}</div></div>}
          {pendingMessage && <div className="rounded-md bg-green-50 p-4"><div className="text-sm text-green-700">{pendingMessage}</div></div>}

          <div className="space-y-4">
            <div className="flex gap-2">
              <button onClick={() => { setIsCreating(false); clearMessages(); }} className={`flex-1 py-2 px-4 rounded-md ${!isCreating ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Login</button>
              <button onClick={() => { setIsCreating(true); clearMessages(); }} className={`flex-1 py-2 px-4 rounded-md ${isCreating ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Sign up</button>
            </div>

            {isCreating ? (
              <form className="space-y-4" onSubmit={handleSubmit(onCreate)}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                  <input 
                    {...register('employeeId', { required: 'Employee ID is required' })} 
                    className={`mt-1 block w-full rounded-md border-gray-300 ${errors.employeeId ? 'border-red-500' : ''}`} 
                  />
                  {errors.employeeId && <p className="mt-1 text-sm text-red-600">{errors.employeeId.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input 
                    {...register('name', { required: 'Name is required' })} 
                    className={`mt-1 block w-full rounded-md border-gray-300 ${errors.name ? 'border-red-500' : ''}`} 
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
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
                    className={`mt-1 block w-full rounded-md border-gray-300 ${errors.email ? 'border-red-500' : ''}`} 
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
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
                    className={`mt-1 block w-full rounded-md border-gray-300 ${errors.mobileNumber ? 'border-red-500' : ''}`} 
                  />
                  {errors.mobileNumber && <p className="mt-1 text-sm text-red-600">{errors.mobileNumber.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Designation</label>
                  <input 
                    {...register('designation', { required: 'Designation is required' })} 
                    className={`mt-1 block w-full rounded-md border-gray-300 ${errors.designation ? 'border-red-500' : ''}`} 
                  />
                  {errors.designation && <p className="mt-1 text-sm text-red-600">{errors.designation.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <input 
                    {...register('department', { required: 'Department is required' })} 
                    className={`mt-1 block w-full rounded-md border-gray-300 ${errors.department ? 'border-red-500' : ''}`} 
                  />
                  {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select 
                    {...register('role', { required: 'Role is required' })} 
                    className={`mt-1 block w-full rounded-md border-gray-300 ${errors.role ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select a role</option>
                    <option value="DISTRICT_COMMISSIONER">District Commissioner</option>
                    <option value="ADDITIONAL_DISTRICT_COMMISSIONER">Additional District Commissioner</option>
                    <option value="BLOCK_DEVELOPMENT_OFFICER">Block Development Officer</option>
                    <option value="GRAM_PANCHAYAT_OFFICER">Gram Panchayat Officer</option>
                  </select>
                  {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input 
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })} 
                    type="password" 
                    className={`mt-1 block w-full rounded-md border-gray-300 ${errors.password ? 'border-red-500' : ''}`} 
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                </div>
                <div>
                  <button type="submit" disabled={isLoading} className="w-full py-2 px-4 bg-blue-600 text-white rounded-md disabled:opacity-50">{isLoading ? 'Creating...' : 'Create Officer'}</button>
                </div>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleLogin(onLogin)}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                  <input 
                    {...registerLogin('employeeId', { required: 'Employee ID is required' })} 
                    type="text" 
                    className={`mt-1 block w-full rounded-md border-gray-300 ${loginErrors.employeeId ? 'border-red-500' : ''}`} 
                  />
                  {loginErrors.employeeId && <p className="mt-1 text-sm text-red-600">{loginErrors.employeeId.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input 
                    {...registerLogin('password', { required: 'Password is required' })} 
                    type="password" 
                    className={`mt-1 block w-full rounded-md border-gray-300 ${loginErrors.password ? 'border-red-500' : ''}`} 
                  />
                  {loginErrors.password && <p className="mt-1 text-sm text-red-600">{loginErrors.password.message}</p>}
                </div>
                <div>
                  <button type="submit" disabled={isLoading} className="w-full py-2 px-4 bg-blue-600 text-white rounded-md disabled:opacity-50">{isLoading ? 'Signing in...' : 'Sign in'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Officer;