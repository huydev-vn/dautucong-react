// ── Phân trang mặc định ──────────────────────────────────────
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ── Năm ngân sách ────────────────────────────────────────────
export const CURRENT_YEAR = new Date().getFullYear();
export const YEAR_OPTIONS: number[] = Array.from(
  { length: 10 },
  (_, i) => CURRENT_YEAR - 3 + i,
);

// ── Local storage keys ───────────────────────────────────────
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
} as const;

/**
 * ID chức năng từ bảng HETHONG_CHUCNANG — dùng cho usePermission(id).
 * Cập nhật khi thêm chức năng mới.
 */
export const CHUC_NANG_IDS = {
  CHUC_NANG: 7,     // "Quản lý chức năng"    /qtht/chucnang
  NGUOI_DUNG: 9,    // "Quản lý người dùng"   /qtht/nguoidung
  PHAN_QUYEN: 8,    // "Phân quyền chức năng" /qtht/phanquyen
  NHOM_NGUOI_DUNG: 10, // "Quản lý nhóm người dùng" /qtht/nhomnguoidung
  TAC_VU: 374,      // "Quản lý tác vụ"       /qtht/tacvu
} as const;

// ── Mã tác vụ chuẩn — khớp với cột MA trong bảng HETHONG_TACVU ──────────────
/**
 * Dùng các hằng này thay vì tự gõ string để có autocomplete + type-check.
 *
 * @example
 * const { coQuyen } = usePermission(CHUC_NANG_IDS.NGUOI_DUNG);
 * if (coQuyen(MA_TAC_VU.THEM)) { ... }
 */
export const MA_TAC_VU = {
  XEM:       'XEM',       // Xem danh sách / chi tiết
  THEM:      'THEM',      // Thêm mới
  SUA:       'SUA',       // Sửa / cập nhật
  XOA:       'XOA',       // Xóa
  TRINH:     'TRINH',     // Trình duyệt
  PHEDUYET:  'PHEDUYET',  // Phê duyệt
  HUYDUYET:  'HUYDUYET',  // Hủy duyệt
  LICHSU:    'LICHSU',    // Xem lịch sử
  XUATFILE:  'XUATFILE',  // Xuất file Excel/PDF
} as const;

/** Union type của tất cả mã tác vụ — dùng làm tham số cho coQuyen() */
export type MaTacVu = typeof MA_TAC_VU[keyof typeof MA_TAC_VU];
