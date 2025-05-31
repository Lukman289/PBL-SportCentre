import { Branch } from "./branch.types";
import { User } from "./user.types";

export enum FieldStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  MAINTENANCE = 'maintenance',
  CLOSED = 'closed'
}

export interface FieldType {
  id: number;
  name: string;
}

export interface Field {
  id: number;
  name: string;
  branchId: number;
  branch?: Branch;
  typeId: number;
  type?: FieldType;
  priceDay: number;
  priceNight: number;
  status?: FieldStatus;
  imageUrl?: string;
  createdAt?: string;
}

export interface FieldReview {
  id: number;
  userId: number;
  fieldId: number;
  rating: number;
  review?: string;
  createdAt: string;
  user: User;
  field: Field;
  branch: Branch;
}

export interface FieldListParams {
  page?: number;
  limit?: number;
  status?: FieldStatus;
  search?: string;
  branchId?: number;
  q?: string;
}

export interface FieldResponseWithMeta {
  data: Field[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
}

export interface FieldReviewResponseWithMeta {
  data: FieldReview[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
}

export interface StandardFieldResponse {
  status: boolean;
  message: string;
  data: Field;
}

export interface LegacyFieldResponse {
  field: Field;
}

// Union type for all possible response formats
export type FieldCreateResponse = StandardFieldResponse | LegacyFieldResponse | Field;

// Interface untuk slot waktu ketersediaan
export interface TimeSlot {
  start: string;
  end: string;
}

// Interface untuk data ketersediaan lapangan
export interface FieldAvailability {
  fieldId: number;
  availableTimeSlots: TimeSlot[];
}

// Interface untuk respons availability
export interface AvailabilityResponse {
  success: boolean;
  data: FieldAvailability[];
} 