import React, { useState } from "react";
import DialogBox from "../../components/common/DialogBox";
import GrievanceForm from "./GrievanceForm";
import { GrievanceFormData } from "./GrievanceForm";

const GrievanceIndex: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFormSubmit = (data: GrievanceFormData) => {
    console.log("Form submitted:", data);
    // Handle form submission logic here
    // You can call an API service here
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Grievance File</h1>
      </div>

      <button
        onClick={() => setIsDialogOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Create Grievance
      </button>

      <DialogBox
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Create Grievance"
        size="lg"
      >
        <GrievanceForm onSubmit={handleFormSubmit} onCancel={handleCancel} />
      </DialogBox>
    </div>
  );
};

export default GrievanceIndex;
