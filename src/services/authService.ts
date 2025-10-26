import api from './api';
import { LoginCredentials, AuthResponse, User, RegisterData, ApiResponse, OfficerLoginCredentials, OfficerSignupData } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async refreshToken(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh');
    return response.data;
  },

  // Send OTP to mobile number (create otp)
  async sendOtp(mobileNumber: string): Promise<void> {
    await api.post('/citizen/send-otp', { mobileNumber });
  },

  // Verify OTP for a mobile number
  // Backend returns { success: boolean, message: string, data: { token?: string } }
  async verifyOtp(mobileNumber: string, otp: string): Promise<ApiResponse<{ token?: string }>> {
    const response = await api.post<ApiResponse<{ token?: string }>>('/citizen/verify-otp', { mobileNumber, otp });
    return response.data;
  },

  // Register a citizen after OTP verification
  async register(data: RegisterData): Promise<void> {
    await api.post('/citizen/register', data);
  },
  
  // Officer management
  // Officer signup (creates officer with isApproved=false)
  async signupOfficer(data: OfficerSignupData): Promise<ApiResponse<{ officerId?: string }>> {
    const response = await api.post<ApiResponse<{ officerId?: string }>>('/officer/signup', data);
    return response.data;
  },

  // Officer login (only succeeds if officer is approved)
  async officerLogin(credentials: OfficerLoginCredentials): Promise<ApiResponse<{ token?: string; officerId?: string; name?: string; email?: string; employeeId?: string; role?: string }>> {
    const response = await api.post<ApiResponse<{ token?: string; officerId?: string; name?: string; email?: string; employeeId?: string; role?: string }>>('/officer/login', credentials);
    return response.data;
  },
  
  // Admin: fetch officers pending approval
  async fetchPendingOfficers(): Promise<ApiResponse<any[]>> {
    const response = await api.get<ApiResponse<any[]>>('/officer/pending');
    return response.data;
  },

  // Admin: approve officer (assign role)
  async approveOfficer(officerId: string, approverEmployeeId: string, role: string): Promise<ApiResponse<any>> {
    const response = await api.post<ApiResponse<any>>(`/officer/approve/${encodeURIComponent(officerId)}`, { approverEmployeeId, role });
    return response.data;
  },

  // Admin: reject officer signup
  async rejectOfficer(officerId: string, approverEmployeeId: string): Promise<ApiResponse<any>> {
    const response = await api.post<ApiResponse<any>>(`/officer/reject/${encodeURIComponent(officerId)}`, { approverEmployeeId });
    return response.data;
  },

  // Get current officer profile
  async getOfficerProfile(): Promise<ApiResponse<any>> {
    const response = await api.get<ApiResponse<any>>('/officer/profile');
    return response.data;
  },

  // Update officer profile
  async updateOfficerProfile(data: any): Promise<ApiResponse<any>> {
    const response = await api.put<ApiResponse<any>>('/officer/profile', data);
    return response.data;
  },
};
