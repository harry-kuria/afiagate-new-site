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
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST', 
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
    full_name: connectUser.full_name,
    phone_number: connectUser.phone_number,
    role: connectUser.role?.toLowerCase() || 'user',
    is_verified: connectUser.is_verified,
    location: connectUser.location,
    specialization: connectUser.specialization,
    experience: connectUser.experience,
    rating: connectUser.rating,
    is_available: connectUser.is_available,
    created_at: connectUser.created_at,
    updated_at: connectUser.updated_at,
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
    phone_number: connectFacility.phone_number || connectFacility.phoneNumber,
    operating_hours: connectFacility.operating_hours || connectFacility.operatingHours,
    specialties: connectFacility.specialties,
    is_emergency: connectFacility.is_emergency || connectFacility.isEmergency,
    description: connectFacility.description,
    created_at: connectFacility.created_at || connectFacility.createdAt,
    updated_at: connectFacility.updated_at || connectFacility.updatedAt,
    available_services: connectFacility.available_services || connectFacility.availableServices || [],
  };
}

// Transform Connect-RPC Appointment to match existing Appointment type
function transformAppointment(connectAppointment: any) {
  return {
    id: connectAppointment.id,
    patient_id: connectAppointment.patient_id || connectAppointment.patientId,
    provider_id: connectAppointment.provider_id || connectAppointment.providerId,
    facility_id: connectAppointment.facility_id || connectAppointment.facilityId,
    service_id: connectAppointment.service_id || connectAppointment.serviceId,
    appointment_date: connectAppointment.appointment_date || connectAppointment.appointmentDate,
    appointment_time: connectAppointment.appointment_time || connectAppointment.appointmentTime,
    notes: connectAppointment.notes,
    status: connectAppointment.status?.toLowerCase() || 'pending',
    created_at: connectAppointment.created_at || connectAppointment.createdAt,
    updated_at: connectAppointment.updated_at || connectAppointment.updatedAt,
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
      data: response.data ? response.data.map(transformUser) : [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10
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
      data: response.data ? response.data.map(transformFacility) : [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10
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
      data: response.data ? response.data.map(transformAppointment) : [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10
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

  // Review endpoints
  async getReviews(providerId: string, params?: {
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams({
      provider_id: providerId,
      page: (params?.page || 1).toString(),
      limit: (params?.limit || 10).toString()
    });
    
    const response = await makeConnectRequest<{
      data: any[];
      total: number;
      page: number;
      limit: number;
    }>(`/reviews?${queryParams}`, 'GET', undefined, true, 60000); // Cache for 1 minute
    
    return {
      data: response.data ? response.data.map(transformReview) : [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10
    };
  }

  async createReview(reviewData: {
    provider_id: string;
    rating: number;
    comment: string;
  }) {
    const response = await makeConnectRequest<any>('/reviews', 'POST', reviewData, false);
    return transformReview(response);
  }

  // Education endpoints
  async getEducation(userId: string, params?: {
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams({
      user_id: userId,
      page: (params?.page || 1).toString(),
      limit: (params?.limit || 10).toString()
    });
    
    const response = await makeConnectRequest<{
      data: any[];
      total: number;
      page: number;
      limit: number;
    }>(`/education?${queryParams}`, 'GET', undefined, true, 300000); // Cache for 5 minutes
    
    return {
      data: response.data ? response.data.map(transformEducation) : [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10
    };
  }

  async createEducation(educationData: {
    institution: string;
    degree: string;
    field_of_study: string;
    graduation_year: number;
    gpa?: number;
  }) {
    const response = await makeConnectRequest<any>('/education', 'POST', educationData, false);
    return transformEducation(response);
  }

  // Licensure endpoints
  async getLicensure(userId: string, params?: {
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams({
      user_id: userId,
      page: (params?.page || 1).toString(),
      limit: (params?.limit || 10).toString()
    });
    
    const response = await makeConnectRequest<{
      data: any[];
      total: number;
      page: number;
      limit: number;
    }>(`/licensure?${queryParams}`, 'GET', undefined, true, 300000); // Cache for 5 minutes
    
    return {
      data: response.data ? response.data.map(transformLicensure) : [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10
    };
  }

  async createLicensure(licensureData: {
    license_number: string;
    issuing_authority: string;
    license_type: string;
    issue_date: string;
    expiry_date: string;
  }) {
    const response = await makeConnectRequest<any>('/licensure', 'POST', licensureData, false);
    return transformLicensure(response);
  }

  // Contact request endpoints
  async createContactRequest(contactData: {
    provider_id: string;
    message: string;
    contact_method: 'phone' | 'email' | 'appointment';
  }) {
    const response = await makeConnectRequest<any>('/contact-requests', 'POST', contactData, false);
    return transformContactRequest(response);
  }

  async getContactRequests(params?: {
    provider_id?: string;
    requester_id?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams({
      provider_id: params?.provider_id || '',
      requester_id: params?.requester_id || '',
      status: params?.status || '',
      page: (params?.page || 1).toString(),
      limit: (params?.limit || 10).toString()
    });
    
    const response = await makeConnectRequest<{
      data: any[];
      total: number;
      page: number;
      limit: number;
    }>(`/contact-requests?${queryParams}`, 'GET', undefined, true, 30000); // Cache for 30 seconds
    
    return {
      data: response.data ? response.data.map(transformContactRequest) : [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10
    };
  }
}

// Transform functions for new data types
function transformReview(connectReview: any) {
  return {
    id: connectReview.id,
    user_id: connectReview.user_id,
    provider_id: connectReview.provider_id,
    rating: connectReview.rating,
    comment: connectReview.comment,
    created_at: connectReview.created_at,
    updated_at: connectReview.updated_at,
    user: connectReview.user ? transformUser(connectReview.user) : undefined,
  };
}

function transformEducation(connectEducation: any) {
  return {
    id: connectEducation.id,
    user_id: connectEducation.user_id,
    institution: connectEducation.institution,
    degree: connectEducation.degree,
    field_of_study: connectEducation.field_of_study,
    graduation_year: connectEducation.graduation_year,
    gpa: connectEducation.gpa,
    created_at: connectEducation.created_at,
    updated_at: connectEducation.updated_at,
  };
}

function transformLicensure(connectLicensure: any) {
  return {
    id: connectLicensure.id,
    user_id: connectLicensure.user_id,
    license_number: connectLicensure.license_number,
    issuing_authority: connectLicensure.issuing_authority,
    license_type: connectLicensure.license_type,
    issue_date: connectLicensure.issue_date,
    expiry_date: connectLicensure.expiry_date,
    is_active: connectLicensure.is_active,
    created_at: connectLicensure.created_at,
    updated_at: connectLicensure.updated_at,
  };
}

function transformContactRequest(connectContactRequest: any) {
  return {
    id: connectContactRequest.id,
    requester_id: connectContactRequest.requester_id,
    provider_id: connectContactRequest.provider_id,
    message: connectContactRequest.message,
    contact_method: connectContactRequest.contact_method,
    status: connectContactRequest.status,
    created_at: connectContactRequest.created_at,
    updated_at: connectContactRequest.updated_at,
    requester: connectContactRequest.requester ? transformUser(connectContactRequest.requester) : undefined,
  };
}

export const connectApiService = new ConnectApiService();
export default connectApiService; 