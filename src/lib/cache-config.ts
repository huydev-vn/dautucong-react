// ── Cache time tiers — dùng cho staleTime và gcTime trong TanStack Query ──────
//
// Cách chọn tier:
//
//   REFERENCE → dữ liệu danh mục ổn định (Nhóm, Đơn vị, Tác vụ, Chức năng khi dùng dropdown).
//               Admin mới sửa, user bình thường không thấy thay đổi trong phiên làm việc.
//
//   LIST      → danh sách CRUD thông thường có filter/pagination.
//               User expect fresh ngay sau khi mutation (invalidateQueries xử lý việc này).
//
//   DETAIL    → chi tiết một record cụ thể.
//               Nên fresh hơn LIST để tránh hiển thị dữ liệu cũ khi user mở lại trang detail.
//
// Lưu ý: staleTime = "data vẫn còn tươi trong bao lâu → chưa tươi thì sẽ refetch nền".
//        gcTime    = "giữ data trong memory bao lâu SAU KHI component unmount".
//        Quy tắc: gcTime >= staleTime. Không đặt gcTime quá thấp vì làm mất cache giữa navigation.

const MINUTE = 60_000;

export const STALE_TIME = {
  /** 30 phút — Nhóm, Đơn vị, Tác vụ, ChứcNăng dropdown */
  REFERENCE: 30 * MINUTE,
  /** 5 phút — Danh sách CRUD có filter */
  LIST: 5 * MINUTE,
  /** 2 phút — Chi tiết record */
  DETAIL: 2 * MINUTE,
} as const;

export const GC_TIME = {
  /** 60 phút — ít query, giữ lâu để tránh refetch khi quay lại trang */
  REFERENCE: 60 * MINUTE,
  /** 10 phút */
  LIST: 10 * MINUTE,
  /** 5 phút */
  DETAIL: 5 * MINUTE,
} as const;
