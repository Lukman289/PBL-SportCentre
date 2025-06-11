export interface ActivityLog {
  id: number;
  userId: number;
  action: string;
  details?: string;
  relatedId?: number;
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface ActivityLogListParams {
  userId?: number;
  realtime?: boolean;
}

export interface ActivityLogListResponse {
  status: boolean;
  message: string;
  data: ActivityLog[];
}

export interface CreateActivityLogRequest {
  userId: number;
  action: string;
  details?: string;
  relatedId?: number | null;
}

export interface CreateActivityLogResponse {
  status: boolean;
  message: string;
  data: ActivityLog;
}

export interface DeleteActivityLogResponse {
  status: boolean;
  message: string;
}