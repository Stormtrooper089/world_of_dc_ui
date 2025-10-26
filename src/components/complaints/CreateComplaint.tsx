import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { complaintService } from '../../services/complaintService';

interface CreateComplaintData {
  title: string;
  description: string;
  category: string;
  priority: string;
  location?: string;
  attachments?: FileList;
}

const CreateComplaint: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateComplaintData>();

  const onSubmit = async (data: CreateComplaintData) => {
    try {
      setIsSubmitting(true);
      setError('');
      setSubmitMessage('');

      // Create form data for file uploads
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('priority', data.priority);
      if (data.location) {
        formData.append('location', data.location);
      }
      
      // Add attachments if any
      if (data.attachments && data.attachments.length > 0) {
        for (let i = 0; i < data.attachments.length; i++) {
          formData.append('attachments', data.attachments[i]);
        }
      }

      const response = await complaintService.createComplaint(formData);
      
      if (response.success) {
        setSubmitMessage('Complaint created successfully! Complaint ID: ' + response.data.complaintNumber);
        reset();
      } else {
        setError(response.message || 'Failed to create complaint');
      }
    } catch (err: any) {
      console.error('Error creating complaint:', err);
      setError(err.response?.data?.message || 'Failed to create complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Complaint</h1>
          
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
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Complaint Title *
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : ''
                }`}
                placeholder="Brief description of the issue"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.category ? 'border-red-500' : ''
                }`}
              >
                <option value="">Select a category</option>
                <option value="INFRASTRUCTURE">Infrastructure</option>
                <option value="PUBLIC_SERVICES">Public Services</option>
                <option value="ENVIRONMENT">Environment</option>
                <option value="SAFETY">Safety</option>
                <option value="TRANSPORTATION">Transportation</option>
                <option value="UTILITIES">Utilities</option>
                <option value="GENERAL">General</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority *
              </label>
              <select
                {...register('priority', { required: 'Priority is required' })}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.priority ? 'border-red-500' : ''
                }`}
              >
                <option value="">Select priority level</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
              {errors.priority && (
                <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                {...register('location')}
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Specific location or address (optional)"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                {...register('description', { 
                  required: 'Description is required',
                  minLength: {
                    value: 20,
                    message: 'Description must be at least 20 characters'
                  }
                })}
                rows={4}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : ''
                }`}
                placeholder="Detailed description of the issue, including any relevant information..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Attachments */}
            <div>
              <label htmlFor="attachments" className="block text-sm font-medium text-gray-700">
                Attachments
              </label>
              <input
                {...register('attachments')}
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
                {isSubmitting ? 'Creating...' : 'Create Complaint'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateComplaint;
