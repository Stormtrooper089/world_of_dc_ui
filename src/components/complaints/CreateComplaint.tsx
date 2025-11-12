import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { complaintService } from "../../services/complaintService";
import { useAuth } from "../../contexts/AuthContext";
import { ComplaintPriority, Department } from "../../types";
import { getDepartmentDisplayName } from "../../utils/departmentUtils";

interface CreateComplaintData {
  subject: string;
  description: string;
  priority: ComplaintPriority;
  location?: string;
  department?: Department;
  files?: FileList;
}

interface CreateComplaintProps {
  onSuccess?: () => void;
}

const CreateComplaint: React.FC<CreateComplaintProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();

  // Hardcoded citizen for officer to create complaints on behalf of
  const HARDCODED_CITIZEN_MOBILE = "9876543210";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateComplaintData>();

  const onSubmit = async (data: CreateComplaintData) => {
    try {
      setIsSubmitting(true);
      setError("");
      setSubmitMessage("");

      // Create form data for file uploads
      const formData = new FormData();
      formData.append("mobileNumber", HARDCODED_CITIZEN_MOBILE); // Use hardcoded citizen
      formData.append("subject", data.subject);
      formData.append("description", data.description);
      formData.append("priority", data.priority);
      if (data.location) {
        formData.append("location", data.location);
      }
      if (data.department) {
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
          <p className="text-sm text-gray-600 mb-6">
            Creating complaint on behalf of citizen:{" "}
            <span className="font-medium">{HARDCODED_CITIZEN_MOBILE}</span>
          </p>

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

            {/* Priority */}
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700"
              >
                Priority *
              </label>
              <select
                {...register("priority", { required: "Priority is required" })}
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
            </div>

            {/* Department */}
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
                    value: 20,
                    message: "Description must be at least 20 characters",
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
