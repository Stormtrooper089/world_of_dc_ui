import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { complaintService } from "../../services/complaintService";
import { officerService } from "../../services/officerService";
import {
  Complaint,
  ComplaintStatus,
  ComplaintPriority,
  Department,
  ComplaintUpdateRequest,
  UserRole,
  Officer,
} from "../../types";
import { getDepartmentDisplayName } from "../../utils/departmentUtils";
import { getAllowedNextStatuses, statusDisplay } from "../../utils/statusUtils";
import Toast from "../common/Toast";
import CommentSection from "./CommentSection";

interface ComplaintEditModalProps {
  complaint: Complaint;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedComplaint: Complaint) => void;
}

const ComplaintEditModal: React.FC<ComplaintEditModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "success"
  );
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [officerSearchQuery, setOfficerSearchQuery] = useState("");
  const [filteredOfficers, setFilteredOfficers] = useState<Officer[]>([]);
  const [showOfficerDropdown, setShowOfficerDropdown] = useState(false);

  // Unified form state
  const [formData, setFormData] = useState({
    subject: complaint.subject || "",
    description: complaint.description || "",
    location: complaint.location || "",
    priority: complaint.priority || ComplaintPriority.MEDIUM,
    status: complaint.status || ComplaintStatus.CREATED,
    departmentRemarks: complaint.departmentRemarks || "",
    assignedDepartment: complaint.assignedDepartment || Department.UNASSIGNED,
    assignedToId: complaint.assignedToId || "",
  });

  const isAdminRole =
    user?.role === UserRole.DISTRICT_COMMISSIONER ||
    user?.role === UserRole.ADDITIONAL_DISTRICT_COMMISSIONER;
  const canEdit =
    isAdminRole ||
    complaint.createdById === user?.id ||
    complaint.assignedToId === user?.id;

  useEffect(() => {
    if (isOpen) {
      setFormData({
        subject: complaint.subject || "",
        description: complaint.description || "",
        location: complaint.location || "",
        priority: complaint.priority || ComplaintPriority.MEDIUM,
        status: complaint.status || ComplaintStatus.CREATED,
        departmentRemarks: complaint.departmentRemarks || "",
        assignedDepartment:
          complaint.assignedDepartment || Department.UNASSIGNED,
        assignedToId: complaint.assignedToId || "",
      });
      setError("");

      // Fetch officers list when modal opens
      const fetchOfficers = async () => {
        try {
          const officersList = await officerService.getAllOfficers();
          const approvedOfficers = officersList.filter((o) => o.isApproved);
          setOfficers(approvedOfficers);
          setFilteredOfficers(approvedOfficers);

          // If there's an assigned officer, ensure they're in the list
          // If not found, we might need to fetch them individually (though they should be in the list if approved)
          if (complaint.assignedToId) {
            const assignedOfficer = approvedOfficers.find(
              (o) => o.id === complaint.assignedToId
            );
            if (!assignedOfficer) {
              console.warn(
                `Assigned officer ${complaint.assignedToId} not found in approved officers list`
              );
            }
          }
        } catch (err) {
          console.error("Failed to fetch officers:", err);
        }
      };
      fetchOfficers();
      setOfficerSearchQuery("");
      setShowOfficerDropdown(false);
    }
  }, [isOpen, complaint]);

  // Search officers when query changes
  useEffect(() => {
    const searchOfficers = async () => {
      if (officerSearchQuery.trim().length >= 2) {
        try {
          const results = await officerService.getAllOfficers(
            officerSearchQuery
          );
          const approvedResults = results.filter((o) => o.isApproved);
          setFilteredOfficers(approvedResults);
          setShowOfficerDropdown(true);
        } catch (err) {
          console.error("Failed to search officers:", err);
        }
      } else if (officerSearchQuery.trim().length === 0) {
        // Show all officers when search is cleared
        setFilteredOfficers(officers.filter((o) => o.isApproved));
        setShowOfficerDropdown(false);
      } else if (officerSearchQuery.trim().length === 1) {
        // Don't search with just 1 character, but show all officers
        setFilteredOfficers(officers.filter((o) => o.isApproved));
        setShowOfficerDropdown(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchOfficers();
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(debounceTimer);
  }, [officerSearchQuery, officers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".officer-search-container")) {
        setShowOfficerDropdown(false);
      }
    };

    if (showOfficerDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showOfficerDropdown]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Removed separate department change handler - now using unified formData

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      setError("You don't have permission to edit this complaint");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Single API call to update everything
      const updateRequest: ComplaintUpdateRequest = {
        complaintId: complaint.complaintId,
        subject: formData.subject,
        description: formData.description,
        location: formData.location,
        priority: formData.priority,
        status: formData.status,
        // Include department assignment if DC and department changed
        ...(isAdminRole &&
          formData.assignedDepartment !== complaint.assignedDepartment && {
            assignedDepartment: formData.assignedDepartment,
            departmentRemarks: formData.departmentRemarks,
          }),
        // Include officer assignment if changed or newly assigned
        ...(formData.assignedToId &&
          formData.assignedToId !== complaint.assignedToId && {
            assignedToId: formData.assignedToId,
          }),
      };

      const updatedComplaint = await complaintService.updateComplaint(
        updateRequest
      );

      // Show success message
      setSuccess("Complaint updated successfully!");
      setToastMessage("Complaint updated successfully!");
      setToastType("success");
      setShowToast(true);

      // Update parent component
      onUpdate(updatedComplaint);

      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to update complaint";
      setError(errorMessage);
      setToastMessage(errorMessage);
      setToastType("error");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">
              Edit Complaint #{complaint.complaintNumber}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {!canEdit && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
              <div className="text-red-700">
                You don't have permission to edit this complaint. Only the
                District Commissioner or the complaint creator can make changes.
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-1 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-md bg-green-50 p-4 border border-green-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Success!
                    </h3>
                    <div className="mt-1 text-sm text-green-700">{success}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Unified Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value={ComplaintPriority.LOW}>Low</option>
                    <option value={ComplaintPriority.MEDIUM}>Medium</option>
                    <option value={ComplaintPriority.HIGH}>High</option>
                    <option value={ComplaintPriority.URGENT}>Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {getAllowedNextStatuses(complaint.status).map((s) => (
                      <option key={s} value={s}>
                        {statusDisplay(s)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="relative officer-search-container">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign to Officer
                  </label>

                  {/* Display Currently Assigned Officer */}
                  {(formData.assignedToId || complaint.assignedToId) && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">
                          {formData.assignedToId !== complaint.assignedToId
                            ? "New Assignment:"
                            : "Currently Assigned:"}
                        </span>{" "}
                        {(() => {
                          const assignedId =
                            formData.assignedToId || complaint.assignedToId;
                          const assignedOfficer = officers.find(
                            (o) => o.id === assignedId
                          );
                          return assignedOfficer
                            ? `${assignedOfficer.name} (${assignedOfficer.employeeId})`
                            : assignedId;
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Search Input for Officer Assignment */}
                  <div className="relative">
                    <input
                      type="text"
                      value={
                        formData.assignedToId && !officerSearchQuery
                          ? (() => {
                              const selectedOfficer = officers.find(
                                (o) => o.id === formData.assignedToId
                              );
                              return selectedOfficer
                                ? `${selectedOfficer.name} (${selectedOfficer.employeeId})`
                                : "";
                            })()
                          : officerSearchQuery
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setOfficerSearchQuery(value);
                        // Clear selected officer if user starts typing a new search
                        if (value && formData.assignedToId) {
                          setFormData((prev) => ({
                            ...prev,
                            assignedToId: "",
                          }));
                        }
                        // Don't set showOfficerDropdown here - let the useEffect handle it after search
                        if (!value) {
                          setShowOfficerDropdown(false);
                        }
                      }}
                      onFocus={() => {
                        // If there's a search query or we have filtered results, show dropdown
                        if (
                          officerSearchQuery.length >= 2 ||
                          filteredOfficers.length > 0
                        ) {
                          setShowOfficerDropdown(true);
                        }
                      }}
                      placeholder={
                        formData.assignedToId || complaint.assignedToId
                          ? "Search for a different officer (type at least 2 characters)..."
                          : "Search officer by name (type at least 2 characters)..."
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-10"
                    />
                    {officerSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setOfficerSearchQuery("");
                          setShowOfficerDropdown(false);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none w-6 h-6 flex items-center justify-center"
                        title="Clear search"
                      >
                        ×
                      </button>
                    )}

                    {/* Dropdown with Search Results */}
                    {showOfficerDropdown && filteredOfficers.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredOfficers.map((officer) => {
                          const isCurrentlySelected =
                            formData.assignedToId === officer.id;
                          return (
                            <div
                              key={officer.id}
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  assignedToId: officer.id,
                                }));
                                setOfficerSearchQuery(""); // Clear search query to show selected officer name
                                setShowOfficerDropdown(false);
                              }}
                              className={`px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                                isCurrentlySelected ? "bg-blue-100" : ""
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {officer.name}
                                    {isCurrentlySelected && (
                                      <span className="ml-2 text-xs text-blue-600 font-normal">
                                        (Selected)
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {officer.employeeId} -{" "}
                                    {officer.role?.replace("_", " ") ||
                                      "Officer"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* No Results Message */}
                    {showOfficerDropdown &&
                      officerSearchQuery.length >= 2 &&
                      filteredOfficers.length === 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center text-gray-500">
                          No officers found matching "{officerSearchQuery}"
                        </div>
                      )}
                  </div>

                  {/* Helper Text */}
                  <p className="mt-2 text-xs text-gray-500">
                    Type at least 2 characters to search for officers. Select an
                    officer from the list to assign them to this complaint.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Department Assignment Section - Only for DC */}
              {isAdminRole && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Department Assignment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assign to Department
                      </label>
                      <select
                        name="assignedDepartment"
                        value={formData.assignedDepartment}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value={Department.UNASSIGNED}>
                          Select Department
                        </option>
                        {Object.values(Department)
                          .filter((dept) => dept !== Department.UNASSIGNED)
                          .map((dept) => (
                            <option key={dept} value={dept}>
                              {getDepartmentDisplayName(dept)}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="border-t pt-6 mt-6">
                <CommentSection
                  complaintId={complaint.id}
                  initialComments={complaint.comments || []}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !canEdit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading && (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  <span>{loading ? "Updating..." : "Update Complaint"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComplaintEditModal;
