import { FileText, Plus } from "lucide-react";
import React, { useState } from "react";
import DialogBox from "../../components/common/DialogBox";
import FileGForm from "./FileGForm";

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

const FileGrievancesIndex: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setSubmitMessage("");
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSubmitMessage("");
  };

  const handleFormSubmit = async (data: FileGrievanceFormData) => {
    try {
      // TODO: Integrate with your backend API here
      console.log("Form submitted with data:", data);

      // Simulate API call
      // const response = await grievanceService.createGrievance(data);

      // Show success message
      setSubmitMessage(
        "Grievance submitted successfully! We will process your request shortly."
      );

      // Close dialog after 2 seconds
      setTimeout(() => {
        handleCloseDialog();
      }, 2000);
    } catch (error: any) {
      console.error("Error submitting grievance:", error);
      setSubmitMessage(
        error.response?.data?.message ||
          "Failed to submit grievance. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full mb-4 shadow-lg">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-purple-900 mb-2">
            File a Grievance
          </h1>
          <p className="text-lg text-purple-700">
            Submit your complaint or concern to the appropriate department
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-purple-200">
          <h2 className="text-xl font-semibold text-purple-900 mb-3">
            How to File a Grievance
          </h2>
          <ul className="space-y-2 text-purple-700">
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">•</span>
              <span>
                Fill out all required fields marked with an asterisk (*)
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">•</span>
              <span>Provide accurate contact information for follow-up</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">•</span>
              <span>
                Include complete details about the department or public servant
                involved
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">•</span>
              <span>
                Your grievance will be reviewed and processed accordingly
              </span>
            </li>
          </ul>
        </div>

        {/* Open Form Button */}
        <div className="text-center">
          <button
            onClick={handleOpenDialog}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
          >
            <Plus className="h-6 w-6" />
            File New Grievance
          </button>
        </div>

        {/* Success Message */}
        {submitMessage && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
            {submitMessage}
          </div>
        )}
      </div>

      {/* Dialog with Form */}
      <DialogBox
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        title="File a Grievance"
        maxWidth="4xl"
      >
        {submitMessage ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-lg text-green-700 font-medium">
              {submitMessage}
            </p>
          </div>
        ) : (
          <FileGForm onSubmit={handleFormSubmit} onCancel={handleCloseDialog} />
        )}
      </DialogBox>
    </div>
  );
};

export default FileGrievancesIndex;
