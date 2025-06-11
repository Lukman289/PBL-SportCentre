import { Field } from './field.types';
import { User } from './user.types';

export interface Booking {
  id: number;
  userId: number;
  fieldId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  field?: Field;
  user?: User;
  status: BookingStatus;
  payment?: Payment & { paymentUrl?: string };
  payments?: (Payment & { paymentUrl?: string })[];
}

export interface BookingMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  DP_PAID = 'dp_paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum BookingStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  BCA_VA = 'bca_va',
  BNI_VA = 'bni_va',
  BRI_VA = 'bri_va',
  MANDIRI_VA = 'mandiri_va',
  PERMATA_VA = 'permata_va',
  CIMB_VA = 'cimb_va',
  DANAMON_VA = 'danamon_va',
  GOPAY = 'gopay',
  SHOPEEPAY = 'shopeepay',
  QRIS = 'qris',
  DANA = 'dana',
  INDOMARET = 'indomaret',
  ALFAMART = 'alfamart',
  AKULAKU = 'akulaku',
  KREDIVO = 'kredivo',
  PAYPAL = 'paypal',
  GOOGLE_PAY = 'google_pay',
}

export interface Payment {
  id: number;
  bookingId: number;
  userId: number;
  amount: number;
  paymentMethod: PaymentMethod | null;
  status: PaymentStatus;
  createdAt: string;
  expiresDate?: string;
  transactionId?: string;
  paymentUrl?: string;
}

export interface BookingWithPayment extends Booking {
  payment?: Payment;
}

export interface BookingRequest {
  fieldId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  promoCode?: string;
  notes?: string;
  branchId?: number;
  sportId?: number;
  userId?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
} 