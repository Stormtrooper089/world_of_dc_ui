import { LocateFixed, Upload, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ComplaintCategory,
  Department,
  getComplaintCategoryLabel,
} from "../../constants/enums";
import { useAuth } from "../../contexts/AuthContext";
import { complaintService } from "../../services/complaintService";
import { wardsService } from "../../services/wardsService";
import { Ward } from "../../types";
import { getDepartmentDisplayName } from "../../utils/departmentUtils";

export interface GrievanceFormData {
  subject: string;
  description: string;
  category: ComplaintCategory;
  location: string;
  latitude?: number;
  longitude?: number;
  wardNumber?: number;
  department: Department;
  files?: FileList;
  mobileNumber: string;
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
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsMessage, setGpsMessage] = useState("");
  const { user } = useAuth();

  const mobileNumber = user?.mobileNumber || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<GrievanceFormData>({
    defaultValues: {
      subject: "",
      description: "",
      category: ComplaintCategory.GARBAGE_NOT_COLLECTED,
      location: "",
      department: Department.ELECTRICITY_DEPARTMENT,
      mobileNumber: mobileNumber || "",
    },
  });

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
      formData.append("category", data.category || ComplaintCategory.OTHER);
      formData.append("location", data.location);
      formData.append("department", data.department);
      formData.append("mobileNumber", data.mobileNumber);
      if (Number.isFinite(data.latitude)) {
        formData.append("latitude", String(data.latitude));
      }
      if (Number.isFinite(data.longitude)) {
        formData.append("longitude", String(data.longitude));
      }
      if (Number.isFinite(data.wardNumber)) {
        formData.append("wardNumber", String(data.wardNumber));
      }

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
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-6 bg-purple-50/30 rounded-lg p-4"
    >
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
          className="block text-sm font-medium text-purple-900"
        >
          Subject *
        </label>
        <input
          {...register("subject", { required: "Subject is required" })}
          type="text"
          id="subject"
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-white ${
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
          className="block text-sm font-medium text-purple-900"
        >
          Description *
        </label>
        <textarea
          {...register("description", { required: "Description is required" })}
          id="description"
          rows={4}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-white ${
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

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <p className="text-sm font-semibold text-blue-900">
          Silchar Municipal Corporation Details
        </p>
        <p className="mt-1 text-xs text-blue-700">
          Choose the municipal issue type, ward and GPS location for faster SMC routing.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-purple-900"
          >
            Municipal Issue Type *
          </label>
          <select
            {...register("category", { required: "Issue type is required" })}
            id="category"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-white ${
              errors.category ? "border-red-500" : ""
            }`}
            disabled={isSubmitting}
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
            className="block text-sm font-medium text-purple-900"
          >
            Ward
          </label>
          <select
            {...register("wardNumber", { valueAsNumber: true })}
            id="wardNumber"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-white"
            disabled={isSubmitting}
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

      {/* Location */}
      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-purple-900"
        >
          Location
        </label>
        <input
          {...register("location")}
          type="text"
          id="location"
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-white ${
            errors.location ? "border-red-500" : ""
          }`}
          placeholder="Enter location"
          disabled={isSubmitting}
        />
        <input type="hidden" {...register("latitude", { valueAsNumber: true })} />
        <input type="hidden" {...register("longitude", { valueAsNumber: true })} />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={captureLocation}
            disabled={isSubmitting || isLocating}
            className="inline-flex items-center gap-2 rounded-md border border-purple-300 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LocateFixed className="h-4 w-4" />
            {isLocating ? "Capturing..." : "Capture Current Location"}
          </button>
          {(latitude || longitude) && (
            <span className="text-sm text-purple-700">
              {latitude}, {longitude}
            </span>
          )}
          {gpsMessage && (
            <span className="text-sm text-purple-600">{gpsMessage}</span>
          )}
        </div>
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
        )}
      </div>

      {/* Department */}
      <div>
        <label
          htmlFor="department"
          className="block text-sm font-medium text-purple-900"
        >
          Department
        </label>
        <select
          {...register("department")}
          id="department"
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-white ${
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
          className="block text-sm font-medium text-purple-900"
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
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-white ${
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
        <label className="block text-sm font-medium text-purple-900">
          Files
        </label>
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
              className={`inline-flex items-center gap-2 px-4 py-2 border border-purple-300 rounded-md shadow-sm text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors ${
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
                  className="flex items-center gap-3 p-3 bg-purple-50 rounded-md border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-purple-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-purple-600 mt-0.5">
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
      <div className="flex justify-end gap-3 pt-6 border-t border-purple-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-purple-700 bg-white border border-purple-300 rounded-md shadow-sm hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default GrievanceForm;
export type { GrievanceFormData };
