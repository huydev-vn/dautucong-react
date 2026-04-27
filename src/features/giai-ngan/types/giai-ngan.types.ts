import type { LoaiGiaiNgan } from '@/types';

export interface GiaiNgan {
  id: string;
  hopDongId: string;
  duAnId: string;
  tenDuAn?: string;
  soHopDong?: string;
  loai: LoaiGiaiNgan;
  soTien: number;
  ngayDeNghi: string;
  ngayPheDuyet?: string;
  ngayGiaiNgan?: string;
  nguoiDeNghi: string;
  nguoiPheDuyet?: string;
  trangThai: 'cho_phe_duyet' | 'da_phe_duyet' | 'da_giai_ngan' | 'tu_choi';
  ghiChu?: string;
  ngayTao: string;
  ngayCapNhat: string;
}

export interface GiaiNganListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  duAnId?: string;
  hopDongId?: string;
  loai?: LoaiGiaiNgan;
  trangThai?: GiaiNgan['trangThai'];
  tuNgay?: string;
  denNgay?: string;
}
