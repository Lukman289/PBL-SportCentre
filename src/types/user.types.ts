import { BranchAdmin } from './branch.types';

export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN_CABANG = 'admin_cabang',
  OWNER_CABANG = 'owner_cabang',
  USER = 'user'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  branches?: BranchAdmin[]; // Relasi dengan cabang (sesuai schema)
  createdAt: string;
}

export interface UserWithToken {
  user: User;
  token: string;
}

// Interface untuk login yang mendukung email atau nomor telepon
export interface LoginRequest {
  identifier: string; // Bisa berisi email atau nomor telepon
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: Role;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token?: string; 
  password: string;
  confirmPassword: string;
}
