import type { BaseModel, PagedResult } from '@/types';

export interface DiaBan extends BaseModel {
  Ma: string;
  Ten: string;
  IdCha: number | null;
  TenCha: string | null;
  HieuLuc: number;
  Stt: number | null;
  GhiChu: string | null;
}

export interface DiaBanListParams {
  pageNumber?: number;
  pageSize?: number;
  keyword?: string;
  idCha?: number;
  hieuLuc?: number;
}

export interface DiaBanFormValues {
  id: number;
  ma: string;
  ten: string;
  idCha?: number | null;
  hieuLuc: number;
  stt?: number;
  ghiChu?: string;
}

export type DiaBanPagedResult = PagedResult<DiaBan>;
