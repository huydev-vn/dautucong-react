import type { TrangThaiChung } from '@/types';

// Danh mục dùng chung
export interface DanhMucItem {
  id: string;
  ma: string;
  ten: string;
  moTa?: string;
  trangThai: TrangThaiChung;
  thuTu: number;
  ngayTao: string;
  ngayCapNhat: string;
}

// Danh mục nguồn vốn
export type DanhMucNguonVon = DanhMucItem;

// Danh mục lĩnh vực
export type DanhMucLinhVuc = DanhMucItem;

// Đơn vị hành chính
export interface DonViHanhChinh {
  id: string;
  ma: string;
  ten: string;
  capDon: 'tinh' | 'huyen' | 'xa';
  capChaId?: string;
  trangThai: TrangThaiChung;
}

export interface DanhMucListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  trangThai?: TrangThaiChung;
}
