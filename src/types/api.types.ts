// ============================================================
// LibNetCore — khớp với DTKT.Util.Model.* (PascalCase)
// ============================================================

/**
 * LibNetCore bọc TẤT CẢ response trong wrapper này.
 * Ánh xạ từ cấu trúc { status, data, message } của backend.
 */
export interface ApiWrapped<T> {
  status: number;
  data: T;
  message: string | null;
}

/**
 * Ánh xạ DTKT.Util.Model.BaseModel.
 * Mọi entity model đều kế thừa interface này.
 */
export interface BaseModel {
  IdDonVi: number;
  Id: number;
  NgayTao: string | null;
  NgaySua: string | null;
  NguoiTao: string | null;
  NguoiSua: string | null;
  IsDelete: number;
}

/**
 * Ánh xạ DTKT.Util.Model.Common.PagedResultModel<T>.
 * Dùng sau khi unwrap ApiWrapped<PagedResult<T>>.
 */
export interface PagedResult<T> {
  Page: number;
  PageSize: number;
  Total: number;
  Items: T[];
}

// ============================================================
// Legacy — giữ lại cho các feature placeholder chưa connect API
// ============================================================

/** @deprecated Dùng ApiWrapped<T> thay thế */
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  statusCode: number;
}

/** @deprecated Dùng PagedResult<T> thay thế */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================
// Request Params
// ============================================================

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type QueryParams = PaginationParams & Record<string, string | number | boolean | undefined>;
