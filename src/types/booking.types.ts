import { Field } from './field.types';

export interface Booking {
  id: number;
  userId: number;
  fieldId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status?: string; // Status booking (pending, approved, completed, cancelled, rejected)
  createdAt: string;
  field?: Field;
  payment?: Payment & { paymentUrl?: string };
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  DP_PAID = 'dp_paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  MIDTRANS = 'midtrans',
  CASH = 'cash',
  TRANSFER = 'transfer',
  CREDIT_CARD = 'credit_card',
  EWALLET = 'ewallet'
}

export interface Payment {
  id: number;
  bookingId: number;
  userId: number;
  amount: number;
  paymentMethod: PaymentMethod;
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
} 