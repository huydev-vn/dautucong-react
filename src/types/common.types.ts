// ============================================================
// Domain Enums dùng chung toàn hệ thống Đầu tư công
// ============================================================

/**
 * Nguồn vốn đầu tư công
 */
export type NguonVon =
  | 'ngan_sach_trung_uong'
  | 'ngan_sach_dia_phuong'
  | 'oda'
  | 'vay_nuoc_ngoai'
  | 'von_khac';

export const NGUON_VON_LABEL: Record<NguonVon, string> = {
  ngan_sach_trung_uong: 'Ngân sách Trung ương',
  ngan_sach_dia_phuong: 'Ngân sách Địa phương',
  oda: 'Vốn ODA',
  vay_nuoc_ngoai: 'Vay nước ngoài',
  von_khac: 'Vốn khác',
};

/**
 * Giai đoạn dự án
 */
export type GiaiDoanDuAn =
  | 'chuan_bi_dau_tu'
  | 'thuc_hien_dau_tu'
  | 'hoan_thanh'
  | 'tam_dung';

export const GIAI_DOAN_LABEL: Record<GiaiDoanDuAn, string> = {
  chuan_bi_dau_tu: 'Chuẩn bị đầu tư',
  thuc_hien_dau_tu: 'Thực hiện đầu tư',
  hoan_thanh: 'Hoàn thành',
  tam_dung: 'Tạm dừng',
};

/**
 * Phân loại dự án theo quy mô vốn
 */
export type NhomDuAn = 'a' | 'b' | 'c';

export const NHOM_DU_AN_LABEL: Record<NhomDuAn, string> = {
  a: 'Nhóm A',
  b: 'Nhóm B',
  c: 'Nhóm C',
};

/**
 * Loại hợp đồng
 */
export type LoaiHopDong =
  | 'tron_goi'
  | 'theo_don_gia'
  | 'theo_thoi_gian'
  | 'hop_dong_khung';

export const LOAI_HOP_DONG_LABEL: Record<LoaiHopDong, string> = {
  tron_goi: 'Hợp đồng trọn gói',
  theo_don_gia: 'Hợp đồng theo đơn giá',
  theo_thoi_gian: 'Hợp đồng theo thời gian',
  hop_dong_khung: 'Hợp đồng khung',
};

/**
 * Trạng thái hợp đồng
 */
export type TrangThaiHopDong =
  | 'cho_ky'
  | 'dang_thuc_hien'
  | 'hoan_thanh'
  | 'thanh_ly'
  | 'huy';

export const TRANG_THAI_HOP_DONG_LABEL: Record<TrangThaiHopDong, string> = {
  cho_ky: 'Chờ ký',
  dang_thuc_hien: 'Đang thực hiện',
  hoan_thanh: 'Hoàn thành',
  thanh_ly: 'Thanh lý',
  huy: 'Hủy',
};

/**
 * Loại giải ngân
 */
export type LoaiGiaiNgan = 'tam_ung' | 'thanh_toan' | 'quyet_toan';

export const LOAI_GIAI_NGAN_LABEL: Record<LoaiGiaiNgan, string> = {
  tam_ung: 'Tạm ứng',
  thanh_toan: 'Thanh toán',
  quyet_toan: 'Quyết toán',
};

/**
 * Trạng thái phổ thông
 */
export type TrangThaiChung = 'hoat_dong' | 'khong_hoat_dong';

export const TRANG_THAI_CHUNG_LABEL: Record<TrangThaiChung, string> = {
  hoat_dong: 'Hoạt động',
  khong_hoat_dong: 'Không hoạt động',
};

/**
 * Lĩnh vực đầu tư
 */
export type LinhVuc =
  | 'giao_thong'
  | 'y_te'
  | 'giao_duc'
  | 'thuy_loi'
  | 'nong_nghiep'
  | 'nang_luong'
  | 'cong_nghe_thong_tin'
  | 'moi_truong'
  | 'khac';

export const LINH_VUC_LABEL: Record<LinhVuc, string> = {
  giao_thong: 'Giao thông',
  y_te: 'Y tế',
  giao_duc: 'Giáo dục',
  thuy_loi: 'Thủy lợi',
  nong_nghiep: 'Nông nghiệp',
  nang_luong: 'Năng lượng',
  cong_nghe_thong_tin: 'Công nghệ thông tin',
  moi_truong: 'Môi trường',
  khac: 'Khác',
};
