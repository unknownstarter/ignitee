// 공통 타입 정의

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type FilterParams = {
  search?: string;
  status?: string;
  platform?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type ValidationError = {
  field: string;
  message: string;
};

export type ApiError = {
  code: string;
  message: string;
  details?: ValidationError[];
};
