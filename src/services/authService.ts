import api from "./api";
import {
  LoginCredentials,
  AuthResponse,
  User,
  RegisterData,
  ApiResponse,
  OfficerLoginCredentials,
  OfficerSignupData,
  Complaint,
  ComplaintStatus,
} from "../types";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },

  async refreshToken(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/refresh");
    return response.data;
  },

  // Send OTP to mobile number (create otp)
  async sendOtp(mobileNumber: string): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>("/citizen/send-otp", {
      mobileNumber,
    });
    return response.data;
  },

  // Send OTP for citizen login (only for existing citizens)
  async citizenLogin(mobileNumber: string): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>("/citizen/login", {
      mobileNumber,
    });
    return response.data;
  },

  // Verify OTP for a mobile number
  // Backend returns { success: boolean, message: string, data: { token?: string } }
  async verifyOtp(
    mobileNumber: string,
    otp: string
  ): Promise<ApiResponse<{ token?: string }>> {
    const response = await api.post<ApiResponse<{ token?: string }>>(
      "/citizen/verify-otp",
      { mobileNumber, otp }
    );
    return response.data;
  },

  // Register a citizen after OTP verification
  async register(data: RegisterData): Promise<void> {
    await api.post("/citizen/register", data);
  },

  // Officer management
  // Officer signup (creates officer with isApproved=false)
  async signupOfficer(
    data: OfficerSignupData
  ): Promise<ApiResponse<{ officerId?: string }>> {
    const response = await api.post<ApiResponse<{ officerId?: string }>>(
      "/officer/signup",
      data
    );
    return response.data;
  },

  // Officer login (only succeeds if officer is approved)
  async officerLogin(credentials: OfficerLoginCredentials): Promise<
    ApiResponse<{
      token?: string;
      officerId?: string;
      name?: string;
      email?: string;
      employeeId?: string;
      role?: string;
    }>
  > {
    const response = await api.post<
      ApiResponse<{
        token?: string;
        officerId?: string;
        name?: string;
        email?: string;
        employeeId?: string;
        role?: string;
      }>
    >("/officer/login", credentials);
    return response.data;
  },

  // Admin: fetch officers pending approval
  async fetchPendingOfficers(): Promise<ApiResponse<any[]>> {
    const response = await api.get<ApiResponse<any[]>>("/officer/pending");
    return response.data;
  },

  // Admin: approve officer (assign role)
  async approveOfficer(
    officerId: string,
    approverEmployeeId: string,
    role: string
  ): Promise<ApiResponse<any>> {
    const response = await api.post<ApiResponse<any>>(
      `/officer/approve/${encodeURIComponent(officerId)}`,
      { approverEmployeeId, role }
    );
    return response.data;
  },

  // Admin: reject officer signup
  async rejectOfficer(
    officerId: string,
    approverEmployeeId: string
  ): Promise<ApiResponse<any>> {
    const response = await api.post<ApiResponse<any>>(
      `/officer/reject/${encodeURIComponent(officerId)}`,
      { approverEmployeeId }
    );
    return response.data;
  },

  // Get current officer profile
  async getOfficerProfile(): Promise<ApiResponse<any>> {
    const response = await api.get<ApiResponse<any>>("/officer/profile");
    return response.data;
  },

  // Update officer profile
  async updateOfficerProfile(data: any): Promise<ApiResponse<any>> {
    const response = await api.put<ApiResponse<any>>("/officer/profile", data);
    return response.data;
  },

  // Get current citizen profile
  async getCitizenProfile(): Promise<ApiResponse<any>> {
    const response = await api.get<ApiResponse<any>>("/citizen/profile");
    return response.data;
  },

  // Update citizen profile
  async updateCitizenProfile(data: any): Promise<ApiResponse<any>> {
    const response = await api.put<ApiResponse<any>>("/citizen/profile", data);
    return response.data;
  },

  // Dashboard methods
  async getComplaints(): Promise<Complaint[]> {
    const response = await api.get<ApiResponse<Complaint[]>>("/complaints");
    return response.data.data;
  },

  async getMyComplaints(): Promise<Complaint[]> {
    // This will automatically use the current officer's ID from the backend
    const response = await api.get<ApiResponse<Complaint[]>>("/complaints");
    return response.data.data;
  },

  // Get carousel slides for citizen home page
  async getCarouselSlides(): Promise<ApiResponse<CarouselSlide[]>> {
    const response = await api.get<ApiResponse<CarouselSlide[]>>(
      "/citizen/carousel"
    );
    return response.data;
  },

  // Get portal statistics for citizen home page
  async getPortalStatistics(): Promise<ApiResponse<PortalStatistics>> {
    const response = await api.get<ApiResponse<PortalStatistics>>(
      "/citizen/portal-stats"
    );
    return response.data;
  },
};

// Types for carousel and portal statistics
export interface CarouselSlide {
  title: string;
  description: string;
  backgroundImage?: string | null; // URL or path to image
  backgroundColor?: string | null; // Simple color name (e.g., "blue", "green", "yellow") - frontend converts to gradient
}

export interface PortalStatistics {
  grievancesFiled: number;
  resolved: number;
  avgResolutionTime: string;
  satisfactionRate: string;
}
