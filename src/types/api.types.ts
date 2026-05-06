// ============================================================
// LibNetCore — khớp với DTKT.Util.Model.* (PascalCase)
// ============================================================

/**
 * LibNetCore bọc TẤT CẢ response trong wrapper này.
 * Ánh xạ từ cấu trúc { status, data, message } của backend.
 *
 * Dạng đầy đủ khi gọi API phân trang:
 *   ApiWrapped<PagedResult<T>>
 */
export interface ApiWrapped<T> {
  status: number;
  data: T;
  message: string | null;
}

/**
 * Ánh xạ DTKT.Util.Model.BaseModel.
 * Mọi entity model đều kế thừa interface này.
 *
 * Lưu ý: backend dùng decimal cho Id/IdDonVi nên frontend nhận số.
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
 *
 * Ví dụ response thực tế:
 *   { status: 200, data: { Page, PageSize, Total, Items: [...] }, message: "Success" }
 */
export interface PagedResult<T> {
  Page: number;
  PageSize: number;
  Total: number;
  Items: T[];
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

// ============================================================
// Placeholder types — dùng tạm cho các feature chưa connect API thật
// TODO: migrate du-an, ke-hoach-von, nha-thau sang ApiWrapped<PagedResult<T>>
// ============================================================

/** @deprecated → dùng ApiWrapped<T> */
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  statusCode: number;
}

/** @deprecated → dùng PagedResult<T> */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

