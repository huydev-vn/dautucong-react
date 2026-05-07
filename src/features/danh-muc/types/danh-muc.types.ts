import type { BaseModel } from '@/types';

// ============================================================
// Backend-aligned types — khớp với DTKT.Util.Model.DanhMuc.*
// ============================================================

/**
 * Request params cho các Dm_* controller (dùng pageNumber/searchText/hieuLuc
 * theo convention của LibNetCore, khác với PaginationParams dùng page/search).
 */
export interface DmListParams {
  pageNumber?: number;
  pageSize?: number;
  searchText?: string;
  /** 1 = đang hiệu lực, 0 = ngừng hiệu lực, null = tất cả */
  hieuLuc?: number;
}

/** Ánh xạ Dm_LinhVucModel — bảng danh mục lĩnh vực đầu tư */
export interface Dm_LinhVucItem extends BaseModel {
  MaLinhVuc: string;
  TenLinhVuc: string;
  MoTa: string | null;
  HieuLuc: number | null;
}

/** Ánh xạ Dm_DuAnDauTuModel — bảng danh mục dự án đầu tư */
export interface Dm_DuAnDauTuItem extends BaseModel {
  Ma: string;
  Ten: string;
  ChuDauTu: string | null;
  MoTa: string | null;
  DiaDiem: string | null;
  TongMucDauTu: number | null;
  NguonVon: string | null;
  ThoiGianThucHien: string | null;
  NgayBatDau: string | null;
  NgayKetThuc: string | null;
  TrangThai: string | null;
  NhomDuAn: string | null;
  IdLinhVuc: number | null;
}
