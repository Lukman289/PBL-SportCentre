import { Branch } from "./branch.types";

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
  status?: string;
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
  user: {
    id: number;
    name: string;
  };
  field: {
    id: number;
    name: string;
    branch: {
      id: number;
      name: string;
    };
  };
} 