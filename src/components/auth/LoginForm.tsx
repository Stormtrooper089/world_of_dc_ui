import React, { useState } from "react";
import { authService } from "../../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LogIn } from "lucide-react";

const LoginForm: React.FC = () => {
  const { isLoading: isAuthLoading, setAuth } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");

  // OTP login helpers
  const [mobileOtp, setMobileOtp] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sendLoginOtp = async () => {
    if (!mobileOtp.trim() || mobileOtp.trim().length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setError("");
      setIsLoading(true);
      // Call send-otp API (no auth required)
      const response = await authService.sendOtp(mobileOtp.trim());

      // Only show OTP field if API call was successful
      if (response?.success) {
        setOtpSent(true);
        setOtp("");
      } else {
        setError(response?.message || "Failed to send OTP.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setError("");
      setIsLoading(true);
      const response = await authService.sendOtp(mobileOtp.trim());

      if (response?.success) {
        setOtp("");
        setError("");
      } else {
        setError(
          response?.message || "Failed to resend OTP. Please try again."
        );
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to resend OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const verifyLoginOtp = async () => {
    if (!otp.trim() || otp.trim().length < 4) {
      setError("Please enter a valid OTP");
      return;
    }

    try {
      setError("");
      setIsLoading(true);
      const res = await authService.verifyOtp(mobileOtp.trim(), otp.trim());

      if (res?.success && res.data?.token) {
        const token = res.data.token;

        // Decode minimal user info from JWT payload
        const decodePayload = (jwt: string) => {
          try {
            const parts = jwt.split(".");
            if (parts.length !== 3) return null;
            const payload = parts[1];
            const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
            const padded = base64.padEnd(
              base64.length + ((4 - (base64.length % 4)) % 4),
              "="
            );
            const decoded = atob(padded);
            return JSON.parse(decoded);
          } catch (e) {
            return null;
          }
        };

        const payload = decodePayload(token) as any;
        const minimalUser = {
          id: payload?.sub || payload?.citizenId || "",
          email: payload?.email || "",
          name: payload?.name || "",
          role: payload?.role || "CUSTOMER",
          mobileNumber: mobileOtp.trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Store in localStorage first to ensure persistence
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(minimalUser));

        // Set auth in context so ProtectedRoute allows navigation
        setAuth({ token, user: minimalUser as any });

        // Navigate to customer dashboard after successful login (with delay to allow state update)
        setTimeout(() => {
          navigate("/customer");
        }, 100);
      } else {
        setError(res?.message || "OTP verification failed.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "OTP verification failed. Please try again."
      );
    } finally {
      setIsLoading(false);
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
            Citizen Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Complaint Management System
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="space-y-4 bg-white shadow-md rounded-xl p-6">
            {!otpSent ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mobile number
                  </label>
                  <div className="mt-1">
                    <input
                      value={mobileOtp}
                      onChange={(e) => setMobileOtp(e.target.value)}
                      type="tel"
                      placeholder="9000000000"
                      maxLength={10}
                      className="appearance-none rounded-md relative block w-full pl-3 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !isLoading && !isAuthLoading) {
                          sendLoginOtp();
                        }
                      }}
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-4 border border-red-200">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}

                <div>
                  <button
                    type="button"
                    onClick={sendLoginOtp}
                    disabled={
                      isLoading || isAuthLoading || mobileOtp.trim().length < 10
                    }
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Sending..." : "Send OTP"}
                  </button>
                </div>

                <div className="text-center pt-2 border-t">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      to="/signup"
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Enter OTP
                  </label>
                  <div className="mt-1">
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      type="text"
                      placeholder="123456"
                      maxLength={6}
                      className="appearance-none rounded-md relative block w-full text-center text-lg tracking-widest pl-3 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !isLoading && !isAuthLoading) {
                          verifyLoginOtp();
                        }
                      }}
                      autoFocus
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    We sent an OTP to {mobileOtp}
                  </p>
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-4 border border-red-200">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                      setError("");
                    }}
                    disabled={isLoading || isAuthLoading}
                    className="w-1/3 py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={verifyLoginOtp}
                    disabled={
                      isLoading || isAuthLoading || otp.trim().length < 4
                    }
                    className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading || isAuthLoading}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                  >
                    {isLoading ? "Sending..." : "Resend OTP"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
