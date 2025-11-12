import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn } from 'lucide-react';

const LoginForm: React.FC = () => {
  const { isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  // OTP login helpers
  const [mobileOtp, setMobileOtp] = useState('');
  const [otpSending, setOtpSending] = useState(false);

  const sendLoginOtp = async () => {
    try {
      setError('');
      setOtpSending(true);
      await authService.sendOtp(mobileOtp);
      navigate(`/verify-otp?mobile=${encodeURIComponent(mobileOtp)}&flow=login`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setOtpSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <LogIn className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Complaint Management System
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile number</label>
              <div className="mt-1">
                <input
                  value={mobileOtp}
                  onChange={(e) => setMobileOtp(e.target.value)}
                  type="tel"
                  placeholder="9000000000"
                  className="appearance-none rounded-md relative block w-full pl-3 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={sendLoginOtp}
                disabled={otpSending || mobileOtp.trim().length < 10}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {otpSending ? 'Sending...' : 'Send OTP'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
