// ── Loại hình nhà thầu ────────────────────────────────────────
export type LoaiHinhNhaThau =
  | 'cong_ty_tnhh'
  | 'cong_ty_cp'
  | 'doanh_nghiep_tn'
  | 'cong_ty_hop_danh'
  | 'khac';

export const LOAI_HINH_LABEL: Record<LoaiHinhNhaThau, string> = {
  cong_ty_tnhh:      'Cty TNHH',
  cong_ty_cp:        'Cty Cổ phần',
  doanh_nghiep_tn:   'DN Tư nhân',
  cong_ty_hop_danh:  'Cty Hợp danh',
  khac:              'Khác',
};

// ── Trạng thái hoạt động ──────────────────────────────────────
export type TrangThaiNhaThau = 'hoat_dong' | 'tam_ngung' | 'ngung_hoat_dong';

export const TRANG_THAI_NT_LABEL: Record<TrangThaiNhaThau, string> = {
  hoat_dong:        'Hoạt động',
  tam_ngung:        'Tạm ngừng',
  ngung_hoat_dong:  'Ngừng HĐ',
};

// ── Entity ────────────────────────────────────────────────────
export interface NhaThau {
  id: string;
  ma: string;
  ten: string;
  loaiHinh: LoaiHinhNhaThau;
  maSoThue: string;
  diaChi: string;
  daiDienPhapLuat: string;
  dienThoai: string;
  email?: string;
  trangThai: TrangThaiNhaThau;
  ngayDangKy: string;
}