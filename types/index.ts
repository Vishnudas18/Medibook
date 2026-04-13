// ========================
// MediBook — Shared Types
// ========================

export type UserRole = 'patient' | 'doctor' | 'admin';

export type DoctorStatus = 'pending' | 'approved' | 'rejected';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export type PaymentStatus = 'created' | 'paid' | 'failed' | 'refunded';

export type CancelledBy = 'patient' | 'doctor' | 'admin';

// ========================
// Database Document Types
// ========================

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  avatar: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDoctorProfile {
  _id: string;
  userId: string | IUser;
  specialization: string;
  qualifications: string[];
  experience: number;
  consultationFee: number;
  clinicName: string;
  city: string;
  address: string;
  about: string;
  languages: string[];
  status: DoctorStatus;
  rejectionReason: string;
  rating: number;
  totalRatings: number;
  documents: string[];
  createdAt: Date;
}

export interface IDoctorProfileWithUser extends IDoctorProfile {
  userId: IUser;
}

export interface IAvailability {
  _id: string;
  doctorId: string | IDoctorProfile;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

export interface IAppointment {
  _id: string;
  patientId: string | IUser;
  doctorId: string | IDoctorProfile;
  date: Date;
  startTime: string;
  endTime: string;
  reason: string;
  status: AppointmentStatus;
  paymentId: string | IPayment;
  isPaid: boolean;
  notes: string;
  cancelReason: string;
  cancelledBy: CancelledBy;
  createdAt: Date;
}

export interface IPayment {
  _id: string;
  appointmentId: string | IAppointment;
  patientId: string | IUser;
  doctorId: string | IDoctorProfile;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  amount: number;
  currency: 'INR';
  status: PaymentStatus;
  paidAt: Date;
  refundedAt: Date;
  createdAt: Date;
}

export interface ILeaveDate {
  _id: string;
  doctorId: string | IDoctorProfile;
  date: Date;
  reason: string;
  createdAt: Date;
}

export interface IReview {
  _id: string;
  patientId: string | IUser;
  doctorId: string | IDoctorProfile;
  appointmentId: string | IAppointment;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface IPrescription {
  _id: string;
  appointmentId: string | IAppointment;
  patientId: string | IUser;
  doctorId: string | IDoctorProfile;
  medicines: IMedicine[];
  advice: string;
  nextFollowUp: Date;
  createdAt: Date;
}

// ========================
// API Response Types
// ========================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ========================
// Auth Types
// ========================

export interface JwtPayload {
  userId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  userId: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  user: SafeUser;
}

export interface SafeUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar: string;
  isVerified: boolean;
  isActive: boolean;
}

// ========================
// Slot Types
// ========================

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

// ========================
// Search & Filter Types
// ========================

export interface DoctorSearchParams {
  specialization?: string;
  city?: string;
  name?: string;
  minFee?: number;
  maxFee?: number;
  rating?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

// ========================
// Analytics Types
// ========================

export interface AdminAnalytics {
  totalUsers: number;
  totalDoctors: number;
  totalAppointments: number;
  totalRevenue: number;
  appointmentsByStatus: Record<AppointmentStatus, number>;
  revenueByMonth: { month: string; revenue: number }[];
  appointmentsByMonth: { month: string; count: number }[];
  topDoctors: {
    name: string;
    specialization: string;
    appointments: number;
    revenue: number;
  }[];
}

// ========================
// Component Prop Types
// ========================

export interface DoctorCardProps {
  doctor: IDoctorProfile & { userId: IUser };
}

export interface AppointmentCardProps {
  appointment: IAppointment & {
    doctorId: IDoctorProfile & { userId: IUser };
    patientId: IUser;
  };
  userRole: UserRole;
  onStatusChange?: (id: string, status: AppointmentStatus) => void;
  onCancel?: (id: string) => void;
}

export interface SlotPickerProps {
  doctorId: string;
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  onSlotSelect: (slot: TimeSlot) => void;
  selectedSlot: TimeSlot | null;
}

// ========================
// Triage Innovation Types
// ========================

export type TriageUrgency = 'low' | 'medium' | 'high';

export interface ISymptomAssessment {
  _id: string;
  patientId: string;
  symptoms: string[];
  durationDays: number;
  severity: number;
  notes?: string;
  preferredCity?: string;
  preferredLanguage?: string;
  recommendedSpecialization: string;
  urgencyLevel: TriageUrgency;
  aiSummary: string;
  createdAt: Date;
}

export interface ITriageDoctorRecommendation {
  doctorId: string;
  score: number;
  reasons: string[];
  doctor: IDoctorProfileWithUser;
}

export interface ISmartDoctorRecommendation {
  doctorId: string;
  score: number;
  reasons: string[];
  availableToday: boolean;
  pastBookings: number;
  doctor: IDoctorProfileWithUser;
}
