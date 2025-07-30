// Temporary TypeScript interfaces for Connect-RPC services
// This will be replaced by generated protobuf code

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  isVerified: boolean;
  location: string;
  specialization: string;
  rating: number;
  experience: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  USER_ROLE_UNSPECIFIED = 0,
  USER_ROLE_PATIENT = 1,
  USER_ROLE_DOCTOR = 2,
  USER_ROLE_NURSE = 3,
  USER_ROLE_CAREGIVER = 4,
  USER_ROLE_FACILITY = 5,
}

export interface Facility {
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
  availableServices: FacilityServiceInfo[];
}

export interface FacilityServiceInfo {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  facilityId: string;
  serviceId: string;
  appointmentDate: string;
  appointmentTime: string;
  status: AppointmentStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export enum AppointmentStatus {
  APPOINTMENT_STATUS_UNSPECIFIED = 0,
  APPOINTMENT_STATUS_PENDING = 1,
  APPOINTMENT_STATUS_CONFIRMED = 2,
  APPOINTMENT_STATUS_COMPLETED = 3,
  APPOINTMENT_STATUS_CANCELLED = 4,
}

// Request/Response interfaces
export interface GetUserRequest {
  id: string;
}

export interface GetUserResponse {
  user: User;
}

export interface UpdateUserRequest {
  id: string;
  fullName: string;
  phoneNumber: string;
  location: string;
}

export interface UpdateUserResponse {
  user: User;
}

export interface ListUsersRequest {
  page: number;
  limit: number;
  role: string;
  search: string;
}

export interface ListUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  location: string;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresAt: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresAt: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface LogoutResponse {
  success: boolean;
}

export interface ListFacilitiesRequest {
  type: string;
  location: string;
  page: number;
  limit: number;
}

export interface ListFacilitiesResponse {
  facilities: Facility[];
}

export interface GetFacilityRequest {
  id: string;
}

export interface GetFacilityResponse {
  facility: Facility;
}

export interface GetFacilityTypesRequest {}

export interface GetFacilityTypesResponse {
  types: string[];
}

export interface BookFacilityRequest {
  facilityId: string;
  serviceId: string;
  patientName: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  notes: string;
}

export interface BookFacilityResponse {
  bookingId: string;
  facilityName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  createdAt: string;
}

export interface CreateAppointmentRequest {
  patientId: string;
  providerId: string;
  facilityId: string;
  serviceId: string;
  appointmentDate: string;
  appointmentTime: string;
  notes: string;
}

export interface CreateAppointmentResponse {
  appointment: Appointment;
}

export interface GetAppointmentRequest {
  id: string;
}

export interface GetAppointmentResponse {
  appointment: Appointment;
}

export interface ListAppointmentsRequest {
  userId: string;
  status: string;
  page: number;
  limit: number;
}

export interface ListAppointmentsResponse {
  appointments: Appointment[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateAppointmentRequest {
  id: string;
  appointmentDate: string;
  appointmentTime: string;
  notes: string;
}

export interface UpdateAppointmentResponse {
  appointment: Appointment;
}

export interface CancelAppointmentRequest {
  id: string;
  reason: string;
}

export interface CancelAppointmentResponse {
  success: boolean;
}

// Service interfaces
export interface UserService {
  getUser(request: GetUserRequest): Promise<GetUserResponse>;
  updateUser(request: UpdateUserRequest): Promise<UpdateUserResponse>;
  listUsers(request: ListUsersRequest): Promise<ListUsersResponse>;
}

export interface AuthService {
  register(request: RegisterRequest): Promise<RegisterResponse>;
  login(request: LoginRequest): Promise<LoginResponse>;
  refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse>;
  logout(request: LogoutRequest): Promise<LogoutResponse>;
}

export interface FacilityService {
  listFacilities(request: ListFacilitiesRequest): Promise<ListFacilitiesResponse>;
  getFacility(request: GetFacilityRequest): Promise<GetFacilityResponse>;
  getFacilityTypes(request: GetFacilityTypesRequest): Promise<GetFacilityTypesResponse>;
  bookFacility(request: BookFacilityRequest): Promise<BookFacilityResponse>;
}

export interface AppointmentService {
  createAppointment(request: CreateAppointmentRequest): Promise<CreateAppointmentResponse>;
  getAppointment(request: GetAppointmentRequest): Promise<GetAppointmentResponse>;
  listAppointments(request: ListAppointmentsRequest): Promise<ListAppointmentsResponse>;
  updateAppointment(request: UpdateAppointmentRequest): Promise<UpdateAppointmentResponse>;
  cancelAppointment(request: CancelAppointmentRequest): Promise<CancelAppointmentResponse>;
} 