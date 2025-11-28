import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { authService } from "../../services/authService";
import { RegisterData } from "../../types";

const SignUpForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const { register, handleSubmit } = useForm<RegisterData>({
    defaultValues: {
      mobileNumber: "",
      name: "",
      email: "",
      address: "",
      aadharNumber: "",
    },
  });

  const onRegister = async (data: RegisterData) => {
    try {
      setError("");
      setIsLoading(true);
      // Call register endpoint. Backend will send OTP to mobile if registration successful.
      await authService.register(data);
      // Navigate to shared OTP verification page
      navigate(
        `/verify-otp?mobile=${encodeURIComponent(
          data.mobileNumber
        )}&flow=register`
      );
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>

          <p className="mt-2 text-center text-sm text-gray-600">
            Sign up with your mobile number
          </p>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onRegister)}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mobile number
            </label>
            <input
              {...register("mobileNumber")}
              type="tel"
              placeholder="9999999999"
              className="mt-1 block w-full rounded-md border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              {...register("name")}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              className="mt-1 block w-full rounded-md border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              {...register("address")}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Aadhar Number
            </label>
            <input
              {...register("aadharNumber")}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md disabled:opacity-50"
            >
              {isLoading ? "Registering..." : "Create account"}
            </button>
          </div>
          <div className="text-center text-sm text-gray-600">
            <Link to="/officer-login" className="text-blue-600">
              Officer login instead
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;
