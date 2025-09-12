// Simple Connect-RPC service using fetch
// This will be replaced by proper Connect-RPC client when protobuf generation is working

const API_BASE_URL = 'https://demoafya.ddnsgeek.com/api/v1';

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

// Helper function to make Connect-RPC requests with caching
async function makeConnectRequest<T>(
  path: string, 
  method: 'GET' | 'POST' = 'POST', 
  body?: any,
  useCache: boolean = true,
  cacheTTL: number = 30000 // 30 seconds default
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const token = localStorage.getItem('access_token');
  
  // Create cache key
  const cacheKey = `${method}:${path}:${JSON.stringify(body)}:${token || 'no-token'}`;
  
  // Check cache first
  if (useCache && method === 'POST') {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
  }
  
  // Check for pending requests
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Connect-Protocol-Version': '1',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Create the request promise
  const requestPromise = (async () => {
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const refreshResponse = await fetch(`${API_BASE_URL}/afiagate.v1.AuthService/RefreshToken`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Connect-Protocol-Version': '1',
                },
                body: JSON.stringify({ refreshToken }),
              });
              
              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                localStorage.setItem('access_token', refreshData.accessToken);
                localStorage.setItem('refresh_token', refreshData.refreshToken);
                
                // Retry original request with new token
                headers['Authorization'] = `Bearer ${refreshData.accessToken}`;
                const retryResponse = await fetch(url, {
                  method,
                  headers,
                  body: body ? JSON.stringify(body) : undefined,
                });
                
                if (!retryResponse.ok) {
                  throw new Error(`Request failed: ${retryResponse.statusText}`);
                }
                
                const result = await retryResponse.json();
                
                // Cache the result
                if (useCache && method === 'POST') {
                  cache.set(cacheKey, { data: result, timestamp: Date.now(), ttl: cacheTTL });
                }
                
                return result;
              } else {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                throw new Error('Authentication failed');
              }
            } catch (error) {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              window.location.href = '/login';
              throw error;
            }
          }
        }
        throw new Error(`Request failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Cache the result
      if (useCache && method === 'POST') {
        cache.set(cacheKey, { data: result, timestamp: Date.now(), ttl: cacheTTL });
      }
      
      return result;
    } finally {
      // Remove from pending requests
      pendingRequests.delete(cacheKey);
    }
  })();

  // Store the pending request
  pendingRequests.set(cacheKey, requestPromise);
  
  return requestPromise;
}

// Clear cache function
export function clearCache() {
  cache.clear();
}

// Transform Connect-RPC User to match existing User type
function transformUser(connectUser: any) {
  return {
    id: connectUser.id,
    email: connectUser.email,
    full_name: connectUser.fullName,
    phone_number: connectUser.phoneNumber,
    role: connectUser.role.toLowerCase(),
    is_verified: connectUser.isVerified,
    location: connectUser.location,
    specialization: connectUser.specialization,
    experience: connectUser.experience,
    rating: connectUser.rating,
    is_available: connectUser.isAvailable,
    created_at: connectUser.createdAt,
    updated_at: connectUser.updatedAt,
  };
}

// Transform Connect-RPC Facility to match existing Facility type
function transformFacility(connectFacility: any) {
  return {
    id: connectFacility.id,
    name: connectFacility.name,
    type: connectFacility.type,
    location: connectFacility.location,
    distance: connectFacility.distance,
    rating: connectFacility.rating,
    services: connectFacility.services,
    phone_number: connectFacility.phoneNumber,
    operating_hours: connectFacility.operatingHours,
    specialties: connectFacility.specialties,
    is_emergency: connectFacility.isEmergency,
    description: connectFacility.description,
    created_at: connectFacility.createdAt,
    updated_at: connectFacility.updatedAt,
    available_services: connectFacility.availableServices || [],
  };
}

// Transform Connect-RPC Appointment to match existing Appointment type
function transformAppointment(connectAppointment: any) {
  return {
    id: connectAppointment.id,
    patient_id: connectAppointment.patientId,
    provider_id: connectAppointment.providerId,
    facility_id: connectAppointment.facilityId,
    service_id: connectAppointment.serviceId,
    appointment_date: connectAppointment.appointmentDate,
    appointment_time: connectAppointment.appointmentTime,
    notes: connectAppointment.notes,
    status: connectAppointment.status.toLowerCase(),
    created_at: connectAppointment.createdAt,
    updated_at: connectAppointment.updatedAt,
  };
}

// Types from our temporary interface file
interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  isVerified: boolean;
  location: string;
  specialization: string;
  rating: number;
  experience: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Facility {
  id: string;
  name: string;
  type: string;
  location: string;
  distance: string;
  rating: number;
  services: string[];
  phoneNumber: string;
  operatingHours: string;
  specialties: string[];
  isEmergency: boolean;
  description: string;
  availableServices: any[];
}

interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  facilityId: string;
  serviceId: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

class ConnectApiService {
  // Auth endpoints
  async login(email: string, password: string) {
    const response = await makeConnectRequest<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>('/afiagate.v1.AuthService/Login', 'POST', { email, password }, false);
    
    return {
      access_token: response.accessToken,
      refresh_token: response.refreshToken,
      user: transformUser(response.user)
    };
  }

  async register(userData: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    role: string;
    location?: string;
  }) {
    const response = await makeConnectRequest<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>('/afiagate.v1.AuthService/Register', 'POST', userData, false);
    
    return {
      access_token: response.accessToken,
      refresh_token: response.refreshToken,
      user: transformUser(response.user)
    };
  }

  async refreshToken(refreshToken: string) {
    const response = await makeConnectRequest<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>('/afiagate.v1.AuthService/RefreshToken', 'POST', { refreshToken }, false);
    
    return {
      access_token: response.accessToken,
      refresh_token: response.refreshToken,
      user: transformUser(response.user)
    };
  }

  async logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      await makeConnectRequest('/afiagate.v1.AuthService/Logout', 'POST', { refreshToken }, false);
    }
  }

  // User endpoints
  async getProfile(userId: string) {
    const response = await makeConnectRequest<{ user: User }>('/afiagate.v1.UserService/GetUser', 'POST', { id: userId });
    return transformUser(response.user);
  }

  async updateProfile(userId: string, userData: {
    fullName?: string;
    phoneNumber?: string;
    location?: string;
  }) {
    const response = await makeConnectRequest<{ user: User }>('/afiagate.v1.UserService/UpdateUser', 'POST', {
      id: userId,
      ...userData
    }, false);
    return transformUser(response.user);
  }

  async getDoctors(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const response = await makeConnectRequest<{
      users: User[];
      total: number;
      page: number;
      limit: number;
    }>('/afiagate.v1.UserService/ListUsers', 'POST', {
      role: 'doctor',
      page: params?.page || 1,
      limit: params?.limit || 10,
      search: params?.search || ''
    }, true, 60000); // Cache for 1 minute
    
    return {
      data: response.users.map(transformUser),
      total: response.total,
      page: response.page,
      limit: response.limit
    };
  }

  async getDoctorById(id: string) {
    const response = await makeConnectRequest<{ user: User }>('/afiagate.v1.UserService/GetUser', 'POST', { id }, true, 300000); // Cache for 5 minutes
    return transformUser(response.user);
  }

  // Facility endpoints
  async getFacilities(params?: {
    page?: number;
    limit?: number;
    type?: string;
    location?: string;
  }) {
    const response = await makeConnectRequest<{ facilities: Facility[] }>('/afiagate.v1.FacilityService/ListFacilities', 'POST', {
      page: params?.page || 1,
      limit: params?.limit || 10,
      type: params?.type || '',
      location: params?.location || ''
    }, true, 60000); // Cache for 1 minute
    
    return {
      data: response.facilities.map(transformFacility),
      total: 0, // Not returned by current API
      page: params?.page || 1,
      limit: params?.limit || 10
    };
  }

  async getFacilityById(id: string) {
    const response = await makeConnectRequest<{ facility: Facility }>('/afiagate.v1.FacilityService/GetFacility', 'POST', { id }, true, 300000); // Cache for 5 minutes
    return transformFacility(response.facility);
  }

  async getFacilityTypes() {
    const response = await makeConnectRequest<{ types: string[] }>('/afiagate.v1.FacilityService/GetFacilityTypes', 'POST', {}, true, 300000); // Cache for 5 minutes
    return response.types;
  }

  async bookFacility(bookingData: {
    facilityId: string;
    serviceId: string;
    patientName: string;
    patientPhone: string;
    appointmentDate: string;
    appointmentTime: string;
    notes?: string;
  }) {
    const response = await makeConnectRequest('/afiagate.v1.FacilityService/BookFacility', 'POST', bookingData, false);
    return response;
  }

  // Appointment endpoints
  async createAppointment(appointmentData: {
    patientId: string;
    providerId: string;
    facilityId?: string;
    serviceId?: string;
    appointmentDate: string;
    appointmentTime: string;
    notes?: string;
  }) {
    const response = await makeConnectRequest<{ appointment: Appointment }>('/afiagate.v1.AppointmentService/CreateAppointment', 'POST', appointmentData, false);
    return transformAppointment(response.appointment);
  }

  async getAppointments(params?: {
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await makeConnectRequest<{
      appointments: Appointment[];
      total: number;
      page: number;
      limit: number;
    }>('/afiagate.v1.AppointmentService/ListAppointments', 'POST', {
      userId: params?.userId || '',
      status: params?.status || '',
      page: params?.page || 1,
      limit: params?.limit || 10
    }, true, 30000); // Cache for 30 seconds
    
    return {
      data: response.appointments.map(transformAppointment),
      total: response.total,
      page: response.page,
      limit: response.limit
    };
  }

  async getAppointmentById(id: string) {
    const response = await makeConnectRequest<{ appointment: Appointment }>('/afiagate.v1.AppointmentService/GetAppointment', 'POST', { id }, true, 300000); // Cache for 5 minutes
    return transformAppointment(response.appointment);
  }

  async updateAppointment(id: string, appointmentData: {
    appointmentDate?: string;
    appointmentTime?: string;
    notes?: string;
  }) {
    const response = await makeConnectRequest<{ appointment: Appointment }>('/afiagate.v1.AppointmentService/UpdateAppointment', 'POST', {
      id,
      ...appointmentData
    }, false);
    return transformAppointment(response.appointment);
  }

  async cancelAppointment(id: string, reason?: string) {
    const response = await makeConnectRequest<{ success: boolean }>('/afiagate.v1.AppointmentService/CancelAppointment', 'POST', {
      id,
      reason: reason || ''
    }, false);
    return response.success;
  }
}

export const connectApiService = new ConnectApiService();
export default connectApiService; 