// Simple Connect-RPC service using fetch
// This will be replaced by proper Connect-RPC client when protobuf generation is working

const API_BASE_URL = 'https://api.afyagate.com/api/v1';

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
              const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Connect-Protocol-Version': '1',
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
              });
              
              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                localStorage.setItem('access_token', refreshData.access_token);
                localStorage.setItem('refresh_token', refreshData.refresh_token);
                
                // Retry original request with new token
                headers['Authorization'] = `Bearer ${refreshData.access_token}`;
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
      access_token: string;
      refresh_token: string;
      user: User;
    }>('/auth/login', 'POST', { email, password }, false);
    
    return {
      access_token: response.access_token,
      refresh_token: response.refresh_token,
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
      access_token: string;
      refresh_token: string;
      user: User;
    }>('/auth/register', 'POST', userData, false);
    
    return {
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      user: transformUser(response.user)
    };
  }

  async refreshToken(refreshToken: string) {
    const response = await makeConnectRequest<{
      access_token: string;
      refresh_token: string;
      user: User;
    }>('/auth/refresh', 'POST', { refresh_token: refreshToken }, false);
    
    return {
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      user: transformUser(response.user)
    };
  }

  async logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      await makeConnectRequest('/auth/logout', 'POST', { refresh_token: refreshToken }, false);
    }
  }

  // User endpoints
  async getProfile(userId: string) {
    const response = await makeConnectRequest<User>(`/users/${userId}`, 'GET');
    return transformUser(response);
  }

  async updateProfile(userId: string, userData: {
    fullName?: string;
    phoneNumber?: string;
    location?: string;
  }) {
    const response = await makeConnectRequest<User>(`/users/${userId}`, 'PUT', userData, false);
    return transformUser(response);
  }

  async getDoctors(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const queryParams = new URLSearchParams({
      role: 'doctor',
      page: (params?.page || 1).toString(),
      limit: (params?.limit || 10).toString(),
      search: params?.search || ''
    });
    
    const response = await makeConnectRequest<{
      data: User[];
      total: number;
      page: number;
      limit: number;
    }>(`/users?${queryParams}`, 'GET', undefined, true, 60000); // Cache for 1 minute
    
    return {
      data: response.data.map(transformUser),
      total: response.total,
      page: response.page,
      limit: response.limit
    };
  }

  async getDoctorById(id: string) {
    const response = await makeConnectRequest<User>(`/users/${id}`, 'GET', undefined, true, 300000); // Cache for 5 minutes
    return transformUser(response);
  }

  // Facility endpoints
  async getFacilities(params?: {
    page?: number;
    limit?: number;
    type?: string;
    location?: string;
  }) {
    const queryParams = new URLSearchParams({
      page: (params?.page || 1).toString(),
      limit: (params?.limit || 10).toString(),
      type: params?.type || '',
      location: params?.location || ''
    });
    
    const response = await makeConnectRequest<{
      data: Facility[];
      total: number;
      page: number;
      limit: number;
    }>(`/facilities?${queryParams}`, 'GET', undefined, true, 60000); // Cache for 1 minute
    
    return {
      data: response.data.map(transformFacility),
      total: response.total,
      page: response.page,
      limit: response.limit
    };
  }

  async getFacilityById(id: string) {
    const response = await makeConnectRequest<Facility>(`/facilities/${id}`, 'GET', undefined, true, 300000); // Cache for 5 minutes
    return transformFacility(response);
  }

  async getFacilityTypes() {
    // For now, return a static list since the API doesn't have a specific endpoint
    // This could be enhanced to fetch from a dedicated endpoint if available
    return [
      'Hospital',
      'Clinic', 
      'Medical Center',
      'Laboratory',
      'Pharmacy',
      'Dental Clinic',
      'Eye Clinic',
      'Specialty Center'
    ];
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
    const response = await makeConnectRequest<Appointment>('/appointments', 'POST', appointmentData, false);
    return transformAppointment(response);
  }

  async getAppointments(params?: {
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams({
      userId: params?.userId || '',
      status: params?.status || '',
      page: (params?.page || 1).toString(),
      limit: (params?.limit || 10).toString()
    });
    
    const response = await makeConnectRequest<{
      data: Appointment[];
      total: number;
      page: number;
      limit: number;
    }>(`/appointments?${queryParams}`, 'GET', undefined, true, 30000); // Cache for 30 seconds
    
    return {
      data: response.data.map(transformAppointment),
      total: response.total,
      page: response.page,
      limit: response.limit
    };
  }

  async getAppointmentById(id: string) {
    const response = await makeConnectRequest<Appointment>(`/appointments/${id}`, 'GET', undefined, true, 300000); // Cache for 5 minutes
    return transformAppointment(response);
  }

  async updateAppointment(id: string, appointmentData: {
    appointmentDate?: string;
    appointmentTime?: string;
    notes?: string;
  }) {
    const response = await makeConnectRequest<Appointment>(`/appointments/${id}`, 'PUT', appointmentData, false);
    return transformAppointment(response);
  }

  async cancelAppointment(id: string, reason?: string) {
    const response = await makeConnectRequest<{ success: boolean }>(`/appointments/${id}/cancel`, 'POST', {
      reason: reason || ''
    }, false);
    return response.success;
  }
}

export const connectApiService = new ConnectApiService();
export default connectApiService; 