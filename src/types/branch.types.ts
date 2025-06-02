import { User, Role } from "./user.types";

export enum BranchStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface Branch {
  id: number;
  name: string;
  location: string;
  imageUrl?: string | null;
  ownerId: number;
  status: BranchStatus;
  createdAt: string;
  owner?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface BranchAdmin {
  branchId: number;
  userId: number;
  user: User;
  branch?: {
    id: number;
    name: string;
    location: string;
  };
}
export interface BranchDetailResponse {
  data: Branch; 
  status: boolean;
  message?: string;
}

export interface BranchAdminView {
  id: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  status: BranchStatus;
  role: Role;
  lastActive: string;
}

export interface BranchView {
  id: string;
  name: string;
  location: string;
  status: BranchStatus;
  adminCount: number;
  fieldCount: number;
} 
// Interface untuk request dan response
export interface CreateBranchRequest {
  name: string;
  imageUrl?: File;
  location: string;
  ownerId: number;
  status : BranchStatus
}

export interface UpdateBranchRequest {
  name?: string;
  location?: string;
  imageUrl?: string;
  status?: 'active' | 'inactive';
  ownerId?: number;
}

export interface BranchListParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive';
  search?: string;
  q?: string;
}

export interface BranchListResponse {
  data: Branch[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface BranchAdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  branchId?: number;
  q?: string;
}

export interface BranchAdminListResponse {
  data: BranchAdmin[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

