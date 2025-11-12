import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { meetingService } from "../../services/meetingService";
import { officerService } from "../../services/officerService";
import { Officer, MeetingCreateRequest } from "../../types";
import Toast from "../common/Toast";

interface CreateMeetingProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateMeeting: React.FC<CreateMeetingProps> = ({
  isOpen,
  onClose,
  onSuccess,
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

  // Officer search state
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [officerSearchQuery, setOfficerSearchQuery] = useState("");
  const [filteredOfficers, setFilteredOfficers] = useState<Officer[]>([]);
  const [showOfficerDropdown, setShowOfficerDropdown] = useState(false);
  const [selectedOfficers, setSelectedOfficers] = useState<Officer[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    durationMinutes: 60,
  });

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        title: "",
        description: "",
        startDate: "",
        startTime: "",
        durationMinutes: 60,
      });
      setSelectedOfficers([]);
      setOfficerSearchQuery("");
      setError("");
      setSuccess("");

      // Fetch officers list when modal opens
      const fetchOfficers = async () => {
        try {
          const officersList = await officerService.getAllOfficers();
          const approvedOfficers = officersList.filter((o) => o.isApproved);
          setOfficers(approvedOfficers);
          setFilteredOfficers(approvedOfficers);
        } catch (err) {
          console.error("Failed to fetch officers:", err);
        }
      };
      fetchOfficers();
    }
  }, [isOpen]);

  // Search officers when query changes
  useEffect(() => {
    const searchOfficers = async () => {
      if (officerSearchQuery.trim().length >= 2) {
        try {
          const results = await officerService.getAllOfficers(
            officerSearchQuery
          );
          const approvedResults = results.filter((o) => o.isApproved);
          // Filter out already selected officers
          const filtered = approvedResults.filter(
            (o) => !selectedOfficers.some((so) => so.id === o.id)
          );
          setFilteredOfficers(filtered);
          setShowOfficerDropdown(true);
        } catch (err) {
          console.error("Failed to search officers:", err);
        }
      } else if (officerSearchQuery.trim().length === 0) {
        // Show all officers when search is cleared (excluding selected ones)
        const filtered = officers
          .filter((o) => o.isApproved)
          .filter((o) => !selectedOfficers.some((so) => so.id === o.id));
        setFilteredOfficers(filtered);
        setShowOfficerDropdown(false);
      } else if (officerSearchQuery.trim().length === 1) {
        // Don't search with just 1 character
        const filtered = officers
          .filter((o) => o.isApproved)
          .filter((o) => !selectedOfficers.some((so) => so.id === o.id));
        setFilteredOfficers(filtered);
        setShowOfficerDropdown(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchOfficers();
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(debounceTimer);
  }, [officerSearchQuery, officers, selectedOfficers]);

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

  const handleSelectOfficer = (officer: Officer) => {
    if (!selectedOfficers.some((o) => o.id === officer.id)) {
      setSelectedOfficers([...selectedOfficers, officer]);
    }
    setOfficerSearchQuery("");
    setShowOfficerDropdown(false);
  };

  const handleRemoveOfficer = (officerId: string) => {
    setSelectedOfficers(selectedOfficers.filter((o) => o.id !== officerId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (!formData.title.trim()) {
      setError("Title is required");
      setLoading(false);
      return;
    }

    if (!formData.startDate || !formData.startTime) {
      setError("Start date and time are required");
      setLoading(false);
      return;
    }

    if (selectedOfficers.length === 0) {
      setError("At least one officer must be invited");
      setLoading(false);
      return;
    }

    try {
      // Send date and time as local time string (IST) without timezone conversion
      // Backend is configured with Asia/Kolkata timezone, so it will interpret this correctly as IST
      // Format: YYYY-MM-DDTHH:mm:ss (without 'Z' suffix to avoid UTC conversion)
      const localDateTime = `${formData.startDate}T${formData.startTime}:00`;

      const request: MeetingCreateRequest = {
        title: formData.title,
        description: formData.description || undefined,
        startDateTime: localDateTime, // Local IST time
        durationMinutes: parseInt(formData.durationMinutes.toString()),
        invitedOfficerIds: selectedOfficers.map((o) => o.id),
      };

      await meetingService.createMeeting(request);

      setSuccess("Meeting created successfully!");
      setToastMessage("Meeting created successfully!");
      setToastType("success");
      setShowToast(true);

      // Reset form
      setFormData({
        title: "",
        description: "",
        startDate: "",
        startTime: "",
        durationMinutes: 60,
      });
      setSelectedOfficers([]);
      setOfficerSearchQuery("");

      // Notify parent and close after delay
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to create meeting";
      setError(errorMessage);
      setToastMessage(errorMessage);
      setToastType("error");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0];

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
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">Create Meeting</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  placeholder="Enter meeting title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter meeting description (optional)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    min={today}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="durationMinutes"
                  value={formData.durationMinutes}
                  onChange={handleInputChange}
                  min="15"
                  step="15"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="relative officer-search-container">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invite Officers <span className="text-red-500">*</span>
                </label>

                {/* Display Selected Officers */}
                {selectedOfficers.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {selectedOfficers.map((officer) => (
                      <div
                        key={officer.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        <span>
                          {officer.name} ({officer.employeeId})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOfficer(officer.id)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={officerSearchQuery}
                    onChange={(e) => {
                      setOfficerSearchQuery(e.target.value);
                    }}
                    onFocus={() => {
                      if (
                        officerSearchQuery.length >= 2 ||
                        filteredOfficers.length > 0
                      ) {
                        setShowOfficerDropdown(true);
                      }
                    }}
                    placeholder="Search officer by name (type at least 2 characters)..."
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
                      {filteredOfficers.map((officer) => (
                        <div
                          key={officer.id}
                          onClick={() => handleSelectOfficer(officer)}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">
                                {officer.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {officer.employeeId} -{" "}
                                {officer.role?.replace("_", " ") || "Officer"}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
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
                  Type at least 2 characters to search for officers. Select
                  officers from the list to invite them to the meeting.
                </p>
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
                  disabled={loading}
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
                  <span>{loading ? "Creating..." : "Create Meeting"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateMeeting;
