export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  requestId: string;
  timestamp: string;
}

export interface ApiErrorEnvelope {
  success: false;
  message: string;
  code: string;
  requestId: string;
  timestamp: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginatedMeta;
}
