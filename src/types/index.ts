export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  role: 'patient' | 'doctor' | 'nurse' | 'caregiver' | 'facility';
  is_verified: boolean;
  location?: string;
  specialization?: string;
  facility_name?: string;
  experience?: string;
  rating: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Facility {
  id: string;
  name: string;
  type: string;
  location: string;
  distance?: string;
  rating: number;
  services: string[];
  phone_number?: string;
  operating_hours?: string;
  specialties: string[];
  is_emergency: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
  available_services: FacilityService[];
}

export interface FacilityService {
  id: string;
  facility_id: string;
  name: string;
  description?: string;
  duration?: string;
  price?: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  provider_id: string;
  facility_id?: string;
  service_id?: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  patient?: User;
  provider?: User;
  facility?: Facility;
  service?: FacilityService;
}

export interface CreateAppointmentRequest {
  patient_id: string;
  provider_id: string;
  facility_id?: string;
  service_id?: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  role: 'patient' | 'doctor' | 'nurse' | 'caregiver' | 'facility';
  location?: string;
  specialization?: string;
  facility_name?: string;
  experience?: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
} 