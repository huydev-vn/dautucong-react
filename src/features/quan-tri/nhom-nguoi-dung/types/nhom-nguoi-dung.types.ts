import type { BaseModel, PagedResult } from '@/types';

// ── Entity ────────────────────────────────────────────────────
// Ánh xạ NhomModel.cs + HETHONG_NHOM table (PascalCase theo quy ước dự án)
export interface Nhom extends BaseModel {
  Ma: string;
  Ten: string;
  GhiChu: string | null;
}

// Ánh xạ NguoiDungTrongNhomRow.cs — dùng cho màn hình thành viên
export interface NguoiDungTrongNhomRow {
  Id: number;
  TaiKhoan: string;
  TenNguoiDung: string;
  Email: string | null;
}

// ── Pagination ────────────────────────────────────────────────
export type NhomPagedResult = PagedResult<Nhom>;
export type NguoiDungTrongNhomPagedResult = PagedResult<NguoiDungTrongNhomRow>;

// ── Params ────────────────────────────────────────────────────
export interface NhomListParams {
  pageNumber?: number;
  pageSize?: number;
  searchText?: string;
}

export interface MemberListParams {
  idNhom: number;
  searchText?: string;
  pageNumber?: number;
  pageSize?: number;
}

// ── Form ──────────────────────────────────────────────────────
export interface NhomFormValues {
  id: number;
  ma: string;
  ten: string;
  ghiChu: string;
}
