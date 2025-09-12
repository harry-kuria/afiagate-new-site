import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Facility, 
  Appointment, 
  CreateAppointmentRequest,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse,
  PaginatedResponse
} from '../types';

const API_BASE_URL = 'https://demoafya.ddnsgeek.com/api/v1';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('access_token', response.access_token);
              localStorage.setItem('refresh_token', response.refresh_token);
              originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/api/v1/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/api/v1/auth/register', userData);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/api/v1/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/api/v1/auth/logout');
  }

  // User endpoints
  async getProfile(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/api/v1/users/profile');
    return response.data;
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.put('/api/v1/users/profile', userData);
    return response.data;
  }

  async getDoctors(params?: { page?: number; limit?: number; specialization?: string; location?: string }): Promise<PaginatedResponse<User>> {
    const response: AxiosResponse<PaginatedResponse<User>> = await this.api.get('/api/v1/users', { 
      params: { 
        ...params, 
        role: 'doctor',
        is_available: true 
      } 
    });
    return response.data;
  }

  async getDoctorById(id: string): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get(`/api/v1/users/${id}`);
    return response.data;
  }

  // Facility endpoints
  async getFacilities(params?: { page?: number; limit?: number; type?: string; location?: string }): Promise<PaginatedResponse<Facility>> {
    const response: AxiosResponse<PaginatedResponse<Facility>> = await this.api.get('/api/v1/facilities', { params });
    return response.data;
  }

  async getFacilityById(id: string): Promise<Facility> {
    const response: AxiosResponse<Facility> = await this.api.get(`/api/v1/facilities/${id}`);
    return response.data;
  }

  async bookFacility(bookingData: any): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post(`/api/v1/facilities/${bookingData.facility_id}/book`, bookingData);
    return response.data;
  }

  // Appointment endpoints
  async createAppointment(appointmentData: CreateAppointmentRequest): Promise<Appointment> {
    const response: AxiosResponse<Appointment> = await this.api.post('/api/v1/appointments', appointmentData);
    return response.data;
  }

  async getAppointments(params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<Appointment>> {
    const response: AxiosResponse<PaginatedResponse<Appointment>> = await this.api.get('/api/v1/appointments', { params });
    return response.data;
  }

  async getAppointmentById(id: string): Promise<Appointment> {
    const response: AxiosResponse<Appointment> = await this.api.get(`/api/v1/appointments/${id}`);
    return response.data;
  }

  async updateAppointment(id: string, appointmentData: Partial<Appointment>): Promise<Appointment> {
    const response: AxiosResponse<Appointment> = await this.api.put(`/api/v1/appointments/${id}`, appointmentData);
    return response.data;
  }

  async cancelAppointment(id: string): Promise<void> {
    await this.api.delete(`/api/v1/appointments/${id}`);
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 