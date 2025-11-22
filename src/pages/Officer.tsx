import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";
import { OfficerLoginCredentials, OfficerSignupData } from "../types";
import { 
  User, Lock, Mail, Phone, Building, Briefcase, 
  Shield, Loader2, AlertCircle, CheckCircle2, ArrowRight 
} from "lucide-react";

const Officer: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingMessage, setPendingMessage] = useState("");
  
  const { officerLogin } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetSignup
  } = useForm<OfficerSignupData>();

  const {
    register: registerLogin,
    handleSubmit: handleLogin,
    formState: { errors: loginErrors },
  } = useForm<OfficerLoginCredentials>();

  const clearMessages = () => {
    setError("");
    setPendingMessage("");
  };

  const toggleMode = (creating: boolean) => {
    setIsCreating(creating);
    clearMessages();
    if (creating) resetSignup();
  };

  const onCreate = async (data: OfficerSignupData) => {
    try {
      clearMessages();
      setIsLoading(true);
      const res = await authService.signupOfficer(data);
      if (res.success) {
        setPendingMessage("Account created! Pending admin approval.");
        setIsCreating(false); // Switch back to login view
      } else {
        setError(res.message || "Failed to create account.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  const onLogin = async (data: OfficerLoginCredentials) => {
    try {
      clearMessages();
      setIsLoading(true);
      await officerLogin(data);
      navigate("/officer-dashboard"); 
    } catch (err: any) {
      if (err.response?.status === 401) setError("Invalid credentials.");
      else if (err.response?.status === 403) setError("Account not approved yet.");
      else setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for Input Fields to keep JSX clean
  const InputField = ({ icon: Icon, label, error, registration, type = "text", placeholder }: any) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className={`h-5 w-5 ${error ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-500'}`} />
        </div>
        <input
          type={type}
          {...registration}
          className={`
            block w-full pl-10 pr-3 py-2.5 bg-white border rounded-lg text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 transition-all
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100 text-gray-900'
            }
          `}
          placeholder={placeholder}
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error.message}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      
      {/* Logo / Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-900/20 mb-6">
          <span className="text-white font-bold text-2xl">DC</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Officer Portal
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          District Administration Management System
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200 sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {/* Segmented Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex mb-8">
            <button
              onClick={() => toggleMode(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                !isCreating 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => toggleMode(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                isCreating 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              New Registration
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {pendingMessage && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-100 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{pendingMessage}</p>
            </div>
          )}

          {/* Forms */}
          {isCreating ? (
            // --- SIGN UP FORM ---
            <form className="space-y-5" onSubmit={handleSubmit(onCreate)}>
              <div className="grid grid-cols-2 gap-4">
                <InputField 
                  icon={User} label="Full Name" placeholder="e.g. John Doe"
                  registration={register("name", { required: "Required" })}
                  error={errors.name}
                />
                <InputField 
                  icon={Shield} label="Employee ID" placeholder="EMP-000"
                  registration={register("employeeId", { required: "Required" })}
                  error={errors.employeeId}
                />
              </div>

              <InputField 
                icon={Mail} label="Email Address" type="email" placeholder="officer@gov.in"
                registration={register("email", { 
                  required: "Required",
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                })}
                error={errors.email}
              />

              <div className="grid grid-cols-2 gap-4">
                 <InputField 
                  icon={Phone} label="Mobile" placeholder="9876543210"
                  registration={register("mobileNumber", { 
                    required: "Required",
                    pattern: { value: /^[0-9]{10}$/, message: "10 digits required" }
                  })}
                  error={errors.mobileNumber}
                />
                 <InputField 
                  icon={Briefcase} label="Designation" placeholder="e.g. Senior Inspector"
                  registration={register("designation", { required: "Required" })}
                  error={errors.designation}
                />
              </div>

              <InputField 
                icon={Building} label="Department" placeholder="e.g. Sanitation"
                registration={register("department", { required: "Required" })}
                error={errors.department}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    {...register("role", { required: "Required" })}
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  >
                    <option value="">Select Role</option>
                    <option value="DISTRICT_COMMISSIONER">District Commissioner</option>
                    <option value="BLOCK_DEVELOPMENT_OFFICER">Block Dev. Officer</option>
                    <option value="GRAM_PANCHAYAT_OFFICER">Gram Panchayat Officer</option>
                  </select>
                </div>
                {errors.role && <p className="text-xs text-red-600 mt-1">{errors.role.message}</p>}
              </div>

              <InputField 
                icon={Lock} label="Password" type="password" placeholder="••••••••"
                registration={register("password", { 
                  required: "Required",
                  minLength: { value: 6, message: "Min 6 chars" }
                })}
                error={errors.password}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors mt-6"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Registration"}
              </button>
            </form>
          ) : (
            // --- LOGIN FORM ---
            <form className="space-y-6" onSubmit={handleLogin(onLogin)}>
              <InputField 
                icon={Shield} label="Employee ID" placeholder="Enter your ID"
                registration={registerLogin("employeeId", { required: "Employee ID is required" })}
                error={loginErrors.employeeId}
              />

              <div className="space-y-1">
                <InputField 
                  icon={Lock} label="Password" type="password" placeholder="Enter password"
                  registration={registerLogin("password", { required: "Password is required" })}
                  error={loginErrors.password}
                />
                <div className="flex justify-end">
                  <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-500">Forgot password?</a>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}
        </div>
        
        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-400">
          &copy; 2025 Government of Assam, District Administration Official Portal.
        </p>
      </div>
    </div>
  );
};

export default Officer;