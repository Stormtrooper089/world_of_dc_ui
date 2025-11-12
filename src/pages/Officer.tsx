import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";
import { OfficerLoginCredentials, OfficerSignupData } from "../types";
import { User, Menu, X, ArrowLeft } from "lucide-react";

const Officer: React.FC = () => {
  // default to login view; officer can switch to sign-up
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { officerLogin } = useAuth();
  const navigate = useNavigate();
  const headerRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OfficerSignupData>();
  const {
    register: registerLogin,
    handleSubmit: handleLogin,
    formState: { errors: loginErrors },
  } = useForm<OfficerLoginCredentials>();

  const [pendingMessage, setPendingMessage] = useState("");

  // Handle scroll to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const clearMessages = () => {
    setError("");
    setPendingMessage("");
  };

  const onCreate = async (data: OfficerSignupData) => {
    try {
      setError("");
      setPendingMessage("");
      setIsLoading(true);
      const res = await authService.signupOfficer(data);
      if (res.success) {
        setPendingMessage(
          "Account created successfully! Your account is pending admin approval. You will be notified once approved."
        );
        setIsCreating(false);
        // Reset form
        window.location.reload();
      } else {
        setError(
          res.message || "Failed to create officer account. Please try again."
        );
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      if (err.response?.status === 409) {
        setError("An officer with this employee ID or email already exists.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError(
          "Failed to create officer account. Please check your connection and try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onLogin = async (data: OfficerLoginCredentials) => {
    try {
      setError("");
      setPendingMessage("");
      setIsLoading(true);

      await officerLogin(data);

      // If we get here, login was successful
      window.location.href = "/officer-dashboard";
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.response?.status === 401) {
        setError("Invalid employee ID or password. Please try again.");
      } else if (err.response?.status === 403) {
        setError(
          "Your account is not approved yet. Please contact administrator."
        );
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Login failed. Please check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Matching Home Page Style */}
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-[#0d47a1] shadow-lg"
            : "bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div className="bg-white w-32 h-16 relative overflow-hidden">
                <div className="absolute top-2 left-3">
                  <div className="w-8 h-8 border-2 border-gray-800 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
                <div className="absolute bottom-2 left-3 text-xs font-bold text-gray-900">
                  Officer Portal
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                to="/"
                className={`px-4 py-2 rounded-full hover:opacity-90 transition-all flex items-center text-sm font-medium ${
                  isScrolled
                    ? "bg-blue-700 text-white hover:bg-blue-600"
                    : "bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
                }`}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-white"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t bg-blue-800/95 backdrop-blur-sm border-blue-700/50">
            <div className="px-4 py-4 space-y-2">
              <Link
                to="/"
                className="block px-4 py-2 text-white hover:bg-blue-700 rounded"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with Gradient Background */}
      <div className="relative mt-20 min-h-[calc(100vh-5rem)] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10"></div>

        {/* Main Content */}
        <div className="relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-5rem)]">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
                Officer Portal
              </h2>
              <p className="text-lg text-gray-600">
                {isCreating
                  ? "Create a new officer account"
                  : "Sign in to your officer account"}
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            {pendingMessage && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <div className="text-sm text-green-700">{pendingMessage}</div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-200">
              <div className="space-y-4 mb-6">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      clearMessages();
                    }}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      !isCreating
                        ? "bg-[#0d47a1] text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(true);
                      clearMessages();
                    }}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      isCreating
                        ? "bg-[#0d47a1] text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Sign up
                  </button>
                </div>
              </div>

              {isCreating ? (
                <form className="space-y-5" onSubmit={handleSubmit(onCreate)}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID
                    </label>
                    <input
                      {...register("employeeId", {
                        required: "Employee ID is required",
                      })}
                      className={`mt-1 block w-full rounded-lg border-2 px-4 py-2.5 focus:ring-2 focus:ring-[#0d47a1] focus:border-transparent transition-all ${
                        errors.employeeId ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.employeeId && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.employeeId.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      {...register("name", { required: "Name is required" })}
                      className={`mt-1 block w-full rounded-lg border-2 px-4 py-2.5 focus:ring-2 focus:ring-[#0d47a1] focus:border-transparent transition-all ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      type="email"
                      className={`mt-1 block w-full rounded-lg border-2 px-4 py-2.5 focus:ring-2 focus:ring-[#0d47a1] focus:border-transparent transition-all ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number
                    </label>
                    <input
                      {...register("mobileNumber", {
                        required: "Mobile number is required",
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Mobile number must be 10 digits",
                        },
                      })}
                      className={`mt-1 block w-full rounded-lg border-2 px-4 py-2.5 focus:ring-2 focus:ring-[#0d47a1] focus:border-transparent transition-all ${
                        errors.mobileNumber
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.mobileNumber && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.mobileNumber.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Designation
                    </label>
                    <input
                      {...register("designation", {
                        required: "Designation is required",
                      })}
                      className={`mt-1 block w-full rounded-lg border-2 px-4 py-2.5 focus:ring-2 focus:ring-[#0d47a1] focus:border-transparent transition-all ${
                        errors.designation
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.designation && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.designation.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      {...register("department", {
                        required: "Department is required",
                      })}
                      className={`mt-1 block w-full rounded-lg border-2 px-4 py-2.5 focus:ring-2 focus:ring-[#0d47a1] focus:border-transparent transition-all ${
                        errors.department ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.department && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.department.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      {...register("role", { required: "Role is required" })}
                      className={`mt-1 block w-full rounded-lg border-2 px-4 py-2.5 focus:ring-2 focus:ring-[#0d47a1] focus:border-transparent transition-all ${
                        errors.role ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select a role</option>
                      <option value="DISTRICT_COMMISSIONER">
                        District Commissioner
                      </option>
                      <option value="ADDITIONAL_DISTRICT_COMMISSIONER">
                        Additional District Commissioner
                      </option>
                      <option value="BLOCK_DEVELOPMENT_OFFICER">
                        Block Development Officer
                      </option>
                      <option value="GRAM_PANCHAYAT_OFFICER">
                        Gram Panchayat Officer
                      </option>
                    </select>
                    {errors.role && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.role.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      type="password"
                      className={`mt-1 block w-full rounded-lg border-2 px-4 py-2.5 focus:ring-2 focus:ring-[#0d47a1] focus:border-transparent transition-all ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-[#0d47a1] text-white rounded-lg font-semibold hover:bg-[#1565c0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      {isLoading ? "Creating..." : "Create Officer Account"}
                    </button>
                  </div>
                </form>
              ) : (
                <form className="space-y-5" onSubmit={handleLogin(onLogin)}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID
                    </label>
                    <input
                      {...registerLogin("employeeId", {
                        required: "Employee ID is required",
                      })}
                      type="text"
                      className={`mt-1 block w-full rounded-lg border-2 px-4 py-2.5 focus:ring-2 focus:ring-[#0d47a1] focus:border-transparent transition-all ${
                        loginErrors.employeeId
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {loginErrors.employeeId && (
                      <p className="mt-1 text-sm text-red-600">
                        {loginErrors.employeeId.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      {...registerLogin("password", {
                        required: "Password is required",
                      })}
                      type="password"
                      className={`mt-1 block w-full rounded-lg border-2 px-4 py-2.5 focus:ring-2 focus:ring-[#0d47a1] focus:border-transparent transition-all ${
                        loginErrors.password
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {loginErrors.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {loginErrors.password.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-[#0d47a1] text-white rounded-lg font-semibold hover:bg-[#1565c0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Officer;
