import type { BaseModel, PagedResult } from '@/types';

export interface DonVi extends BaseModel {
  Ma: string;
  Ten: string;
  DienThoai: string | null;
  Email: string | null;
  DiaChi: string | null;
  HieuLuc: number;
  Stt: number | null;
  GhiChu: string | null;
}

export interface DonViListParams {
  pageNumber?: number;
  pageSize?: number;
  keyword?: string;
  hieuLuc?: number;
}

export interface DonViFormValues {
  id: number;
  ma: string;
  ten: string;
  dienThoai?: string;
  email?: string;
  diaChi?: string;
  hieuLuc: number;
  stt?: number;
  ghiChu?: string;
}

export type DonViPagedResult = PagedResult<DonVi>;
