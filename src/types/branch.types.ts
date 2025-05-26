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
  address: string;
  logo?: File;
  open_time: string;
  close_time: string;
  location: string;
  ownerId: number;
  admin_ids?: number[];
}

export interface UpdateBranchRequest {
  name?: string;
  location?: string;
  imageUrl?: string;
  status?: 'active' | 'inactive';
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
