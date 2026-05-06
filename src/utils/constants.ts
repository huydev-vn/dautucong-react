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

// ── Query keys ───────────────────────────────────────────────
export const QUERY_KEYS = {
  DU_AN: 'du-an',
  KE_HOACH_VON: 'ke-hoach-von',
  GIAI_NGAN: 'giai-ngan',
  HOP_DONG: 'hop-dong',
  NHA_THAU: 'nha-thau',
  BAO_CAO: 'bao-cao',
  DASHBOARD: 'dashboard',
  NGUOI_DUNG: 'nguoi-dung',
  DANH_MUC: 'danh-muc',
  CHUC_NANG: 'chuc-nang',
  NHOM: 'nhom',
  TAC_VU: 'tac-vu',
  PHAN_QUYEN: 'phan-quyen',
} as const;
