import type { LoaiHopDong, TrangThaiHopDong } from '@/types';

export interface HopDong {
  id: string;
  soHopDong: string;
  tenHopDong: string;
  duAnId: string;
  tenDuAn?: string;
  nhaThauId: string;
  tenNhaThau?: string;
  loai: LoaiHopDong;
  giaTriHopDong: number;
  giaTriThucTe?: number;
  ngayKy: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  ngayHoanThanh?: string;
  trangThai: TrangThaiHopDong;
  baoLanhThucHien?: number;
  baoLanhTamUng?: number;
  ghiChu?: string;
  ngayTao: string;
  ngayCapNhat: string;
}

export interface HopDongListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  duAnId?: string;
  trangThai?: TrangThaiHopDong;
}
