import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const Officer: React.FC = () => {
  // default to login view; officer can switch to sign-up
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuth();

  const { register, handleSubmit } = useForm();
  const { register: registerLogin, handleSubmit: handleLogin } = useForm();

  const [pendingMessage, setPendingMessage] = useState('');

  const onCreate = async (data: any) => {
    try {
      setError('');
      setIsLoading(true);
      const res = await authService.signupOfficer(data);
      if (res.success) {
        setPendingMessage('Account created and pending admin approval. You will be notified once approved.');
        setIsCreating(false);
      } else {
        setError(res.message || 'Failed to create officer.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create officer.');
    } finally {
      setIsLoading(false);
    }
  };

  const onLogin = async (data: any) => {
    try {
      setError('');
      setIsLoading(true);
      const res = await authService.officerLogin(data);
      if (res.success && res.data?.token) {
        const token = res.data.token;
        localStorage.setItem('token', token);
        // optionally decode minimal user or fetch /auth/me
        setAuth({ token, user: { id: res.data.officerId || '', name: '', email: '', role: 'OFFICER', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as any });
        window.location.href = '/dashboard';
      } else {
        setError(res.message || 'Login failed.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Officer login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Officer Portal</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Sign in to your officer account or create a new one</p>
        </div>

        {error && <div className="rounded-md bg-red-50 p-4"><div className="text-sm text-red-700">{error}</div></div>}

        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setIsCreating(false)} className={`flex-1 py-2 px-4 rounded-md ${!isCreating ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Login</button>
            <button onClick={() => setIsCreating(true)} className={`flex-1 py-2 px-4 rounded-md ${isCreating ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Sign up</button>
          </div>

          {isCreating ? (
            <form className="space-y-4" onSubmit={handleSubmit(onCreate)}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                <input {...register('employeeId')} className="mt-1 block w-full rounded-md border-gray-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input {...register('name')} className="mt-1 block w-full rounded-md border-gray-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input {...register('email')} type="email" className="mt-1 block w-full rounded-md border-gray-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                <input {...register('mobileNumber')} className="mt-1 block w-full rounded-md border-gray-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Designation</label>
                <input {...register('designation')} className="mt-1 block w-full rounded-md border-gray-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <input {...register('department')} className="mt-1 block w-full rounded-md border-gray-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <input {...register('role')} className="mt-1 block w-full rounded-md border-gray-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input {...register('password')} type="password" className="mt-1 block w-full rounded-md border-gray-300" />
              </div>
              <div>
                <button type="submit" disabled={isLoading} className="w-full py-2 px-4 bg-blue-600 text-white rounded-md">{isLoading ? 'Creating...' : 'Create Officer'}</button>
              </div>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleLogin(onLogin)}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input {...registerLogin('email')} type="email" className="mt-1 block w-full rounded-md border-gray-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input {...registerLogin('password')} type="password" className="mt-1 block w-full rounded-md border-gray-300" />
              </div>
              <div>
                <button type="submit" disabled={isLoading} className="w-full py-2 px-4 bg-blue-600 text-white rounded-md">{isLoading ? 'Signing in...' : 'Sign in'}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Officer;
