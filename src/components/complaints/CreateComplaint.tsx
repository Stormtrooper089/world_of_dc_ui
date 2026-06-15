import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { complaintService } from "../../services/complaintService";
import { wardsService } from "../../services/wardsService";
import { useAuth } from "../../contexts/AuthContext";
import {
  ComplaintCategory,
  ComplaintPriority,
  Department,
  UserRole,
  getComplaintCategoryLabel,
} from "../../constants/enums";
import { getDepartmentDisplayName } from "../../utils/departmentUtils";
import { Ward } from "../../types";

interface CreateComplaintData {
  subject: string;
  description: string;
  category: ComplaintCategory;
  priority?: ComplaintPriority;
  location?: string;
  latitude?: number;
  longitude?: number;
  wardNumber?: number;
  department?: Department;
  files?: FileList;
  mobileNumber?: string; // For citizen complaints
}

const SMC_CATEGORY_OPTIONS = [
  ComplaintCategory.GARBAGE_NOT_COLLECTED,
  ComplaintCategory.ILLEGAL_DUMPING,
  ComplaintCategory.DRAIN_BLOCKAGE,
  ComplaintCategory.WATER_LOGGING,
  ComplaintCategory.STREET_LIGHT,
  ComplaintCategory.ROAD_DAMAGE,
  ComplaintCategory.PUBLIC_TOILET,
  ComplaintCategory.STRAY_ANIMAL,
  ComplaintCategory.WATER_SUPPLY,
  ComplaintCategory.PROPERTY_TAX,
  ComplaintCategory.TRADE_LICENSE,
  ComplaintCategory.BUILDING_PERMISSION,
  ComplaintCategory.BIRTH_DEATH_CERTIFICATE,
  ComplaintCategory.OTHER,
];

interface CreateComplaintProps {
  onSuccess?: () => void;
  isCitizenMode?: boolean; // If true, show citizen form (limited fields)
}

const CreateComplaint: React.FC<CreateComplaintProps> = ({
  onSuccess,
  isCitizenMode = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [error, setError] = useState("");
  const [wards, setWards] = useState<Ward[]>([]);
  const [gpsMessage, setGpsMessage] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Determine if this is a citizen complaint
  const isCitizen =
    isCitizenMode ||
    (user && (user.role === UserRole.CITIZEN || !user.employeeId));

  // Hardcoded citizen for officer to create complaints on behalf of
  const HARDCODED_CITIZEN_MOBILE = "9876543210";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateComplaintData>();

  const latitude = watch("latitude");
  const longitude = watch("longitude");

  useEffect(() => {
    wardsService.getWards().then(setWards);
  }, []);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setGpsMessage("Location capture is not supported on this device.");
      return;
    }
    setIsLocating(true);
    setGpsMessage("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue("latitude", Number(position.coords.latitude.toFixed(6)));
        setValue("longitude", Number(position.coords.longitude.toFixed(6)));
        setGpsMessage("GPS location captured.");
        setIsLocating(false);
      },
      () => {
        setGpsMessage("Unable to capture GPS. You can still submit with a written location.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const onSubmit = async (data: CreateComplaintData) => {
    try {
      setIsSubmitting(true);
      setError("");
      setSubmitMessage("");

      // Create form data for file uploads
      const formData = new FormData();

      // For authenticated citizens, don't send mobile number (backend will use their ID from token)
      // For officers creating complaints on behalf of citizens, send mobile number
      if (isCitizen && isAuthenticated && user) {
        // Authenticated citizen - backend will use their ID from JWT token
        // Don't send mobile number
      } else if (!isCitizen) {
        // Officer creating complaint on behalf of citizen - must provide mobile number
        const mobileNumber = data.mobileNumber || HARDCODED_CITIZEN_MOBILE;

        if (!mobileNumber) {
          setError(
            "Mobile number is required when creating complaint on behalf of citizen"
          );
          setIsSubmitting(false);
          return;
        }

        formData.append("mobileNumber", mobileNumber);
      }
      formData.append("subject", data.subject);
      formData.append("description", data.description);
      formData.append("category", data.category || ComplaintCategory.OTHER);

      // Priority and department only for officer complaints
      if (!isCitizen && data.priority) {
        formData.append("priority", data.priority);
      }

      if (data.location) {
        formData.append("location", data.location);
      }
      if (Number.isFinite(data.latitude)) {
        formData.append("latitude", String(data.latitude));
      }
      if (Number.isFinite(data.longitude)) {
        formData.append("longitude", String(data.longitude));
      }
      if (Number.isFinite(data.wardNumber)) {
        formData.append("wardNumber", String(data.wardNumber));
      }

      if (!isCitizen && data.department) {
        formData.append("department", data.department);
      }

      // Add files if any
      if (data.files && data.files.length > 0) {
        for (let i = 0; i < data.files.length; i++) {
          formData.append("files", data.files[i]);
        }
      }

      const response = await complaintService.createComplaint(formData);

      if (response.success) {
        setSubmitMessage(
          `Complaint created successfully! Complaint Number: ${response.data.complaintNumber}`
        );
        reset();
        // Call onSuccess callback if provided
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 2000); // Wait 2 seconds to show success message
        }
      } else {
        setError(response.message || "Failed to create complaint");
      }
    } catch (err: any) {
      console.error("Error creating complaint:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create complaint. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create New Complaint
          </h1>
          {!isCitizen && (
            <p className="text-sm text-gray-600 mb-6">
              Creating complaint on behalf of citizen:{" "}
              <span className="font-medium">{HARDCODED_CITIZEN_MOBILE}</span>
            </p>
          )}

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {submitMessage && (
            <div className="mb-4 rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{submitMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Mobile Number - Only for officers creating complaints on behalf of citizens */}
            {!isCitizen && (
              <div>
                <label
                  htmlFor="mobileNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Citizen Mobile Number *
                </label>
                <input
                  {...register("mobileNumber", {
                    required: !isCitizen
                      ? "Citizen mobile number is required"
                      : false,
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: "Please enter a valid 10-digit mobile number",
                    },
                  })}
                  type="tel"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.mobileNumber ? "border-red-500" : ""
                  }`}
                  placeholder="9000000000"
                  defaultValue={HARDCODED_CITIZEN_MOBILE}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter the mobile number of the citizen you're creating this
                  complaint for
                </p>
                {errors.mobileNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.mobileNumber.message}
                  </p>
                )}
              </div>
            )}

            {/* Show logged-in citizen info */}
            {isCitizen && isAuthenticated && user && (
              <div className="mb-4 rounded-md bg-blue-50 p-4">
                <p className="text-sm text-blue-700">
                  Creating complaint as:{" "}
                  <span className="font-medium">
                    {user.name || user.mobileNumber || user.id}
                  </span>
                </p>
              </div>
            )}

            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700"
              >
                Complaint Subject *
              </label>
              <input
                {...register("subject", { required: "Subject is required" })}
                type="text"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.subject ? "border-red-500" : ""
                }`}
                placeholder="Brief description of the issue"
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.subject.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Municipal Issue Type *
                </label>
                <select
                  {...register("category", {
                    required: "Issue type is required",
                  })}
                  defaultValue={ComplaintCategory.GARBAGE_NOT_COLLECTED}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.category ? "border-red-500" : ""
                  }`}
                >
                  {SMC_CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>
                      {getComplaintCategoryLabel(category)}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="wardNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Ward
                </label>
                <select
                  {...register("wardNumber", { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  defaultValue=""
                >
                  <option value="">Select ward if known</option>
                  {wards.map((ward) => (
                    <option key={ward.wardNumber} value={ward.wardNumber}>
                      Ward {ward.wardNumber}
                      {ward.name ? ` - ${ward.name}` : ""}
                      {ward.zone ? ` (${ward.zone})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority - Only for officer complaints */}
            {!isCitizen && (
              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-gray-700"
                >
                  Priority *
                </label>
                <select
                  {...register("priority", {
                    required: "Priority is required",
                  })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.priority ? "border-red-500" : ""
                  }`}
                  defaultValue={ComplaintPriority.MEDIUM}
                >
                  <option value={ComplaintPriority.LOW}>Low</option>
                  <option value={ComplaintPriority.MEDIUM}>Medium</option>
                  <option value={ComplaintPriority.HIGH}>High</option>
                  <option value={ComplaintPriority.URGENT}>Urgent</option>
                </select>
                {errors.priority && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.priority.message}
                  </p>
                )}
              </div>
            )}

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Location
              </label>
              <input
                {...register("location")}
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Specific location or address (optional)"
              />
              <input type="hidden" {...register("latitude", { valueAsNumber: true })} />
              <input type="hidden" {...register("longitude", { valueAsNumber: true })} />
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={captureLocation}
                  disabled={isLocating}
                  className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLocating ? "Capturing..." : "Capture Current Location"}
                </button>
                {(latitude || longitude) && (
                  <span className="text-sm text-gray-600">
                    {latitude}, {longitude}
                  </span>
                )}
                {gpsMessage && (
                  <span className="text-sm text-gray-500">{gpsMessage}</span>
                )}
              </div>
            </div>

            {/* Department - Only for officer complaints */}
            {!isCitizen && (
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700"
                >
                  Department
                </label>
                <select
                  {...register("department")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select Department (optional)</option>
                  {Object.values(Department).map((dept) => (
                    <option key={dept} value={dept}>
                      {getDepartmentDisplayName(dept)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description *
              </label>
              <textarea
                {...register("description", {
                  required: "Description is required",
                  minLength: {
                    value: isCitizen ? 10 : 20,
                    message: isCitizen
                      ? "Description must be at least 10 characters"
                      : "Description must be at least 20 characters",
                  },
                })}
                rows={4}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.description ? "border-red-500" : ""
                }`}
                placeholder="Detailed description of the issue, including any relevant information..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Attachments */}
            <div>
              <label
                htmlFor="files"
                className="block text-sm font-medium text-gray-700"
              >
                Attachments
              </label>
              <input
                {...register("files")}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-1 text-sm text-gray-500">
                You can attach images, PDFs, or documents (max 10MB per file)
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => reset()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create Complaint"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateComplaint;
