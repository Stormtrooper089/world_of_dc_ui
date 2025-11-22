import { Calendar } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";

interface FileGrievanceFormData {
  complainantName: string;
  address: string;
  contact: string;
  dateOfSubmission: string;
  onBehalfOfSomeone: "yes" | "no";
  departmentOrServantName: string;
  designationOrOffice: string;
  officeAddressOrLocation: string;
}

interface FileGFormProps {
  onSubmit?: (data: FileGrievanceFormData) => void;
  onCancel?: () => void;
}

const FileGForm: React.FC<FileGFormProps> = ({ onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FileGrievanceFormData>({
    defaultValues: {
      dateOfSubmission: new Date().toISOString().split("T")[0],
      onBehalfOfSomeone: "no",
    },
  });

  const handleFormSubmit = (data: FileGrievanceFormData) => {
    if (onSubmit) {
      onSubmit(data);
    } else {
      console.log("Form Data:", data);
      // Reset form after submission
      reset();
    }
  };

  const handleCancel = () => {
    reset();
    if (onCancel) {
      onCancel();
    }
  };

  // Validation patterns
  const phonePattern = /^[6-9]\d{9}$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateContact = (value: string) => {
    if (!value.trim()) return "Contact information is required";
    const isPhone = phonePattern.test(value.trim());
    const isEmail = emailPattern.test(value.trim());
    if (!isPhone && !isEmail) {
      return "Please enter a valid phone number (10 digits) or email address";
    }
    return true;
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Complainant Name */}
      <div>
        <label
          htmlFor="complainantName"
          className="block text-sm font-semibold text-purple-900 mb-2"
        >
          Complainant Name <span className="text-red-500">*</span>
        </label>
        <input
          {...register("complainantName", {
            required: "Complainant name is required",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters",
            },
          })}
          type="text"
          id="complainantName"
          placeholder="Enter your full name"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            errors.complainantName
              ? "border-red-400 focus:ring-red-400 bg-red-50"
              : "border-purple-300 focus:ring-purple-400 bg-white"
          }`}
        />
        {errors.complainantName && (
          <p className="mt-1 text-sm text-red-600">
            {errors.complainantName.message}
          </p>
        )}
      </div>

      {/* Address */}
      <div>
        <label
          htmlFor="address"
          className="block text-sm font-semibold text-purple-900 mb-2"
        >
          Address <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("address", {
            required: "Address is required",
            minLength: {
              value: 10,
              message: "Address must be at least 10 characters",
            },
          })}
          id="address"
          rows={3}
          placeholder="Enter your complete address"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
            errors.address
              ? "border-red-400 focus:ring-red-400 bg-red-50"
              : "border-purple-300 focus:ring-purple-400 bg-white"
          }`}
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>

      {/* Contact (Phone / Email) */}
      <div>
        <label
          htmlFor="contact"
          className="block text-sm font-semibold text-purple-900 mb-2"
        >
          Contact (Phone / Email) <span className="text-red-500">*</span>
        </label>
        <input
          {...register("contact", {
            required: "Contact information is required",
            validate: validateContact,
          })}
          type="text"
          id="contact"
          placeholder="Phone number or email address"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            errors.contact
              ? "border-red-400 focus:ring-red-400 bg-red-50"
              : "border-purple-300 focus:ring-purple-400 bg-white"
          }`}
        />
        {errors.contact && (
          <p className="mt-1 text-sm text-red-600">{errors.contact.message}</p>
        )}
      </div>

      {/* Date of Submission */}
      <div>
        <label
          htmlFor="dateOfSubmission"
          className="block text-sm font-semibold text-purple-900 mb-2"
        >
          Date of Submission <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            {...register("dateOfSubmission", {
              required: "Date of submission is required",
            })}
            type="date"
            id="dateOfSubmission"
            className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              errors.dateOfSubmission
                ? "border-red-400 focus:ring-red-400 bg-red-50"
                : "border-purple-300 focus:ring-purple-400 bg-white"
            }`}
          />
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400 pointer-events-none" />
        </div>
        {errors.dateOfSubmission && (
          <p className="mt-1 text-sm text-red-600">
            {errors.dateOfSubmission.message}
          </p>
        )}
      </div>

      {/* Are you lodging on behalf of someone else? */}
      <div>
        <label className="block text-sm font-semibold text-purple-900 mb-2">
          Are you lodging this grievance on behalf of someone else?{" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-6">
          <label className="flex items-center cursor-pointer">
            <input
              {...register("onBehalfOfSomeone", {
                required: "Please select an option",
              })}
              type="radio"
              value="yes"
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-purple-300"
            />
            <span className="ml-2 text-sm text-purple-900">Yes</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              {...register("onBehalfOfSomeone", {
                required: "Please select an option",
              })}
              type="radio"
              value="no"
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-purple-300"
            />
            <span className="ml-2 text-sm text-purple-900">No</span>
          </label>
        </div>
        {errors.onBehalfOfSomeone && (
          <p className="mt-1 text-sm text-red-600">
            {errors.onBehalfOfSomeone.message}
          </p>
        )}
      </div>

      {/* Name of Department / Public Servant */}
      <div>
        <label
          htmlFor="departmentOrServantName"
          className="block text-sm font-semibold text-purple-900 mb-2"
        >
          Name of Department / Public Servant against whom grievance is made{" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          {...register("departmentOrServantName", {
            required: "Department or public servant name is required",
            minLength: {
              value: 3,
              message: "Name must be at least 3 characters",
            },
          })}
          type="text"
          id="departmentOrServantName"
          placeholder="Enter department or public servant name"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            errors.departmentOrServantName
              ? "border-red-400 focus:ring-red-400 bg-red-50"
              : "border-purple-300 focus:ring-purple-400 bg-white"
          }`}
        />
        {errors.departmentOrServantName && (
          <p className="mt-1 text-sm text-red-600">
            {errors.departmentOrServantName.message}
          </p>
        )}
      </div>

      {/* Designation / Office */}
      <div>
        <label
          htmlFor="designationOrOffice"
          className="block text-sm font-semibold text-purple-900 mb-2"
        >
          Designation / Office <span className="text-red-500">*</span>
        </label>
        <input
          {...register("designationOrOffice", {
            required: "Designation or office is required",
            minLength: {
              value: 2,
              message: "Designation must be at least 2 characters",
            },
          })}
          type="text"
          id="designationOrOffice"
          placeholder="Enter designation or office"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            errors.designationOrOffice
              ? "border-red-400 focus:ring-red-400 bg-red-50"
              : "border-purple-300 focus:ring-purple-400 bg-white"
          }`}
        />
        {errors.designationOrOffice && (
          <p className="mt-1 text-sm text-red-600">
            {errors.designationOrOffice.message}
          </p>
        )}
      </div>

      {/* Address or Location of Office */}
      <div>
        <label
          htmlFor="officeAddressOrLocation"
          className="block text-sm font-semibold text-purple-900 mb-2"
        >
          Address or Location of the Office{" "}
          <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("officeAddressOrLocation", {
            required: "Office address or location is required",
            minLength: {
              value: 10,
              message: "Address must be at least 10 characters",
            },
          })}
          id="officeAddressOrLocation"
          rows={3}
          placeholder="Enter office address or location"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
            errors.officeAddressOrLocation
              ? "border-red-400 focus:ring-red-400 bg-red-50"
              : "border-purple-300 focus:ring-purple-400 bg-white"
          }`}
        />
        {errors.officeAddressOrLocation && (
          <p className="mt-1 text-sm text-red-600">
            {errors.officeAddressOrLocation.message}
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-purple-200">
        <button
          type="button"
          onClick={handleCancel}
          className="px-6 py-2 border border-purple-300 text-purple-700 rounded-lg font-medium hover:bg-purple-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-md hover:shadow-lg"
        >
          Submit Grievance
        </button>
      </div>
    </form>
  );
};

export default FileGForm;
