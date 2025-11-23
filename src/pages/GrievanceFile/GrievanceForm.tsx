import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Department } from "../../constants/enums";
import { getDepartmentDisplayName } from "../../utils/departmentUtils";
import { Upload, X } from "lucide-react";

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
      mobileNumber: "",
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

  const onFormSubmit = (data: GrievanceFormData) => {
    // Create FileList from selected files
    if (selectedFiles.length > 0) {
      const dataTransfer = new DataTransfer();
      selectedFiles.forEach((file) => dataTransfer.items.add(file));
      data.files = dataTransfer.files as any;
    }

    if (onSubmit) {
      onSubmit(data);
      // Reset form after submission
      reset();
      setSelectedFiles([]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Subject */}
      <div>
        <label
          htmlFor="subject"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Subject *
        </label>
        <input
          {...register("subject", { required: "Subject is required" })}
          type="text"
          id="subject"
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 ${
            errors.subject ? "border-red-500" : ""
          }`}
          placeholder="Enter subject"
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description *
        </label>
        <textarea
          {...register("description", { required: "Description is required" })}
          id="description"
          rows={4}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 ${
            errors.description ? "border-red-500" : ""
          }`}
          placeholder="Enter description"
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
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Location *
        </label>
        <input
          {...register("location", { required: "Location is required" })}
          type="text"
          id="location"
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 ${
            errors.location ? "border-red-500" : ""
          }`}
          placeholder="Enter location"
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
        )}
      </div>

      {/* Department */}
      <div>
        <label
          htmlFor="department"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Department *
        </label>
        <select
          {...register("department", { required: "Department is required" })}
          id="department"
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 ${
            errors.department ? "border-red-500" : ""
          }`}
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
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Mobile Number *
        </label>
        <input
          {...register("mobileNumber", {
            required: "Mobile number is required",
            pattern: {
              value: /^[6-9]\d{9}$/,
              message: "Please enter a valid 10-digit mobile number",
            },
          })}
          type="tel"
          id="mobileNumber"
          maxLength={10}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 ${
            errors.mobileNumber ? "border-red-500" : ""
          }`}
          placeholder="9000000000"
        />
        {errors.mobileNumber && (
          <p className="mt-1 text-sm text-red-600">
            {errors.mobileNumber.message}
          </p>
        )}
      </div>

      {/* Files */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Files
        </label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="file"
              id="files"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="files"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700"
            >
              <Upload className="h-4 w-4" />
              Select files
            </label>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="mt-2 space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200"
                >
                  <span className="flex-1 text-sm text-gray-700 truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
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
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default GrievanceForm;
export type { GrievanceFormData };
