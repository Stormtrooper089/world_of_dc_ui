import { Upload, X } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Department } from "../../constants/enums";
import { useAuth } from "../../contexts/AuthContext";
import { complaintService } from "../../services/complaintService";
import { getDepartmentDisplayName } from "../../utils/departmentUtils";

export interface GrievanceFormData {
  subject: string;
  description: string;
  location: string;
  department: Department;
  files?: FileList;
  mobileNumber: string;
}

interface GrievanceFormProps {
  onSubmit?: (data: GrievanceFormData) => void;
  onCancel?: () => void;
}

const GrievanceForm: React.FC<GrievanceFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();

  const mobileNumber = user?.mobileNumber || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GrievanceFormData>({
    defaultValues: {
      subject: "",
      description: "",
      location: "",
      department: Department.ELECTRICITY_DEPARTMENT,
      mobileNumber: mobileNumber || "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setSelectedFiles((prev) => [...prev, ...fileArray]);
      setFileError("");
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (data: GrievanceFormData) => {
    console.log("onFormSubmit", data);
    try {
      setIsSubmitting(true);
      setError("");
      setSubmitMessage("");

      // Create FormData for API call
      const formData = new FormData();
      formData.append("subject", data.subject);
      formData.append("description", data.description);
      formData.append("location", data.location);
      formData.append("department", data.department);
      formData.append("mobileNumber", data.mobileNumber);

      // Add files if any
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append("files", file);
        });
      }

      // Call API service
      const response = await complaintService.createComplaint(formData);

      if (response.success) {
        setSubmitMessage(
          `Grievance created successfully! Complaint Number: ${response.data.complaintNumber}`
        );
        reset();
        setSelectedFiles([]);

        // Call onSubmit callback if provided (for parent component to handle)
        if (onSubmit) {
          // Pass the form data and response to parent
          setTimeout(() => {
            onSubmit(data);
          }, 2000);
        }
      } else {
        setError(response.message || "Failed to create grievance");
      }
    } catch (err: any) {
      console.error("Error creating grievance:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create grievance. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Success Message */}
      {submitMessage && (
        <div className="rounded-md bg-green-50 p-4 border border-green-200">
          <div className="text-sm text-green-700">{submitMessage}</div>
        </div>
      )}

      {/* Subject */}
      <div>
        <label
          htmlFor="subject"
          className="block text-sm font-medium text-gray-700"
        >
          Subject *
        </label>
        <input
          {...register("subject", { required: "Subject is required" })}
          type="text"
          id="subject"
          className={`mt-1 block w-full rounded-md border-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.subject ? "border-red-500" : ""
          }`}
          placeholder="Enter subject"
          disabled={isSubmitting}
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
        )}
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
          {...register("description", { required: "Description is required" })}
          id="description"
          rows={4}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.description ? "border-red-500" : ""
          }`}
          placeholder="Enter description"
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
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
          id="location"
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.location ? "border-red-500" : ""
          }`}
          placeholder="Enter location"
          disabled={isSubmitting}
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
        )}
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
          id="department"
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.department ? "border-red-500" : ""
          }`}
          disabled={isSubmitting}
        >
          {Object.values(Department).map((dept) => (
            <option key={dept} value={dept}>
              {getDepartmentDisplayName(dept)}
            </option>
          ))}
        </select>
        {errors.department && (
          <p className="mt-1 text-sm text-red-600">
            {errors.department.message}
          </p>
        )}
      </div>

      {/* Mobile Number */}
      <div>
        <label
          htmlFor="mobileNumber"
          className="block text-sm font-medium text-gray-700"
        >
          Mobile Number
        </label>
        <input
          {...register("mobileNumber", {
            pattern: {
              value: /^[6-9]\d{9}$/,
              message: "Please enter a valid 10-digit mobile number",
            },
          })}
          type="tel"
          id="mobileNumber"
          maxLength={10}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.mobileNumber ? "border-red-500" : ""
          }`}
          placeholder={"9000000000"}
          disabled={isSubmitting}
        />
        {errors.mobileNumber && (
          <p className="mt-1 text-sm text-red-600">
            {errors.mobileNumber.message}
          </p>
        )}
      </div>

      {/* Files */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Files</label>
        <div className="mt-1 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="file"
              id="files"
              multiple
              onChange={handleFileChange}
              className="hidden"
              disabled={isSubmitting}
            />
            <label
              htmlFor="files"
              className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : "cursor-pointer"
              }`}
            >
              <Upload className="h-4 w-4" />
              Select files
            </label>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    disabled={isSubmitting}
                    className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {fileError && (
            <p className="mt-1 text-sm text-red-600">{fileError}</p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default GrievanceForm;
export type { GrievanceFormData };
