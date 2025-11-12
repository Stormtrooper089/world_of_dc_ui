import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

const OtpVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const mobile = searchParams.get('mobile') || '';
  const flow = (searchParams.get('flow') || 'register') as 'register' | 'login';

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!mobile) {
      setError('Mobile number is required to verify OTP.');
    }
  }, [mobile]);

  const verify = async () => {
    if (!mobile) return;
    try {
      setError('');
      setIsLoading(true);
      const res = await authService.verifyOtp(mobile, otp);
      if (res?.success && res.data?.token) {
        const token = res.data.token;
        // persist token immediately so subsequent requests include it
        localStorage.setItem('token', token);

        // Decode minimal user info from JWT payload to avoid calling /auth/me immediately
        const decodePayload = (jwt: string) => {
          try {
            const parts = jwt.split('.');
            if (parts.length !== 3) return null;
            const payload = parts[1];
            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
            const decoded = atob(padded);
            return JSON.parse(decoded);
          } catch (e) {
            return null;
          }
        };

        const payload = decodePayload(token) as any;
        const minimalUser = {
          id: payload?.sub || payload?.citizenId || '',
          email: payload?.email || '',
          name: payload?.name || '',
          role: payload?.role || 'CUSTOMER',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // set auth in context with minimal user so ProtectedRoute allows navigation
        setAuth({ token, user: minimalUser as any });

        // navigate to citizen home
        navigate('/citizen');
        return;
      }

      // show message from backend when available
      if (res && res.message) {
        setError(res.message);
      } else {
        setError('OTP verification failed.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const resend = async () => {
    try {
      setError('');
      setIsLoading(true);
      await authService.sendOtp(mobile);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Enter OTP</h2>
          <p className="mt-2 text-center text-sm text-gray-600">We sent an OTP to {mobile}</p>
          {error && <div className="mt-4 rounded-md bg-red-50 p-4"><div className="text-sm text-red-700">{error}</div></div>}
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            type="text"
            placeholder="123456"
            className="appearance-none rounded-md relative block w-full pl-3 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={verify}
              disabled={isLoading || otp.trim().length < 4}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              onClick={resend}
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50"
            >
              Resend
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
