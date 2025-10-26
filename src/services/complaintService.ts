import api from './api';
import { 
  Complaint, 
  CreateComplaintData, 
  UpdateComplaintData, 
  PaginatedResponse,
  ComplaintStatus,
  ComplaintPriority,
  ComplaintCategory,
  ApiResponse
} from '../types';

export const complaintService = {
  async getComplaints(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Complaint>> {
    const response = await api.get<PaginatedResponse<Complaint>>(`/complaints?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getComplaintById(id: string): Promise<Complaint> {
    const response = await api.get<Complaint>(`/complaints/${id}`);
    return response.data;
  },

  async createComplaint(data: FormData): Promise<ApiResponse<{ complaintNumber: string }>> {
    const response = await api.post<ApiResponse<{ complaintNumber: string }>>('/complaints', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateComplaint(id: string, data: UpdateComplaintData): Promise<Complaint> {
    const response = await api.put<Complaint>(`/complaints/${id}`, data);
    return response.data;
  },

  async deleteComplaint(id: string): Promise<void> {
    await api.delete(`/complaints/${id}`);
  },

  async getComplaintsByStatus(status: ComplaintStatus): Promise<Complaint[]> {
    const response = await api.get<Complaint[]>(`/complaints/status/${status}`);
    return response.data;
  },

  async getComplaintsByPriority(priority: ComplaintPriority): Promise<Complaint[]> {
    const response = await api.get<Complaint[]>(`/complaints/priority/${priority}`);
    return response.data;
  },

  async getComplaintsByCategory(category: ComplaintCategory): Promise<Complaint[]> {
    const response = await api.get<Complaint[]>(`/complaints/category/${category}`);
    return response.data;
  },

  async searchComplaints(query: string): Promise<Complaint[]> {
    const response = await api.get<Complaint[]>(`/complaints/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};
