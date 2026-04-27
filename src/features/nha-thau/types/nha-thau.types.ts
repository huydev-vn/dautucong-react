import type { TrangThaiChung } from '@/types';

export interface NhaThau {
  id: string;
  maNhaThau: string;
  tenNhaThau: string;
  maSoThue: string;
  daiDien: string;
  dienThoai: string;
  email: string;
  diaChi: string;
  tinhThanh: string;
  loaiNhaThau: 'trong_nuoc' | 'nuoc_ngoai' | 'lien_danh';
  nangLucXepLoai?: 'A' | 'B' | 'C';
  trangThai: TrangThaiChung;
  ngayTao: string;
  ngayCapNhat: string;
}

export interface NhaThauListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  loai?: NhaThau['loaiNhaThau'];
  trangThai?: TrangThaiChung;
}
