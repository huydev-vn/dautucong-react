// ── Query key factory — nguồn duy nhất cho mọi cache key ─────────────────────
//
// Pattern: Mỗi entity có object con với các factory function trả về typed tuple.
//
// Tại sao dùng factory thay vì string constant?
//   ✅ Có hierarchy → invalidateQueries({ queryKey: queryKeys.duAn.all() })
//      tự động invalidate MỌI query của duAn (list, detail, filter...).
//   ✅ TypeScript infer type chính xác → không bao giờ typo.
//   ✅ Params được mã hoá vào key → hai params khác nhau = hai cache entry khác nhau.
//
// Cấu trúc 3 tầng (theo guideline TkDodo):
//   all()          → ['entity']                        — invalidate toàn bộ entity
//   lists()        → ['entity', 'list']                — invalidate tất cả list queries
//   list(params?)  → ['entity', 'list', params]        — một list cụ thể
//   details()      → ['entity', 'detail']              — invalidate tất cả detail queries
//   detail(id)     → ['entity', 'detail', id]          — một record cụ thể
//   dropdown()     → ['entity', 'dropdown']            — dropdown/select (REFERENCE staleTime)
//
// Ví dụ invalidate:
//   qc.invalidateQueries({ queryKey: queryKeys.duAn.all() })       // ← xóa hết duAn cache
//   qc.invalidateQueries({ queryKey: queryKeys.duAn.lists() })     // ← chỉ xóa list, giữ detail
//   qc.invalidateQueries({ queryKey: queryKeys.duAn.detail(id) })  // ← chỉ xóa 1 record

export const queryKeys = {
  // ── Danh mục — Reference data ────────────────────────────────────────────────
  nhom: {
    all:      () => ['nhom'] as const,
    lists:    () => ['nhom', 'list'] as const,
    list:     (params?: unknown) => ['nhom', 'list', params] as const,
    dropdown: () => ['nhom', 'dropdown'] as const,
  },

  donVi: {
    all:      () => ['don-vi'] as const,
    dropdown: () => ['don-vi', 'dropdown'] as const,
  },

  // ── Quản trị hệ thống ─────────────────────────────────────────────────────────
  chucNang: {
    all:      () => ['chuc-nang'] as const,
    lists:    () => ['chuc-nang', 'list'] as const,
    list:     (params?: unknown) => ['chuc-nang', 'list', params] as const,
    dropdown: () => ['chuc-nang', 'dropdown'] as const,
  },

  tacVu: {
    all:      () => ['tac-vu'] as const,
    lists:    () => ['tac-vu', 'list'] as const,
    list:     (params?: unknown) => ['tac-vu', 'list', params] as const,
    dropdown: () => ['tac-vu', 'dropdown'] as const,
  },

  nguoiDung: {
    all:   () => ['nguoi-dung'] as const,
    lists: () => ['nguoi-dung', 'list'] as const,
    list:  (params?: unknown) => ['nguoi-dung', 'list', params] as const,
  },

  nhomNguoiDung: {
    all:        () => ['nhom-nguoi-dung'] as const,
    lists:      () => ['nhom-nguoi-dung', 'list'] as const,
    list:       (params?: unknown) => ['nhom-nguoi-dung', 'list', params] as const,
    membersAll: (idNhom: number) => ['nhom-nguoi-dung', 'members', idNhom] as const,
    members:    (idNhom: number, params: unknown) => ['nhom-nguoi-dung', 'members', idNhom, params] as const,
    memberIds:  (idNhom: number) => ['nhom-nguoi-dung', 'member-ids', idNhom] as const,
    myNhomIds:  () => ['nhom-nguoi-dung', 'my-nhom-ids'] as const,
  },

  phanQuyen: {
    all:     () => ['phan-quyen'] as const,
    byNhom:  (idNhom: number) => ['phan-quyen', 'nhom', idNhom] as const,
  },

  // ── Nghiệp vụ ─────────────────────────────────────────────────────────────────
  duAn: {
    all:     () => ['du-an'] as const,
    lists:   () => ['du-an', 'list'] as const,
    list:    (params?: unknown) => ['du-an', 'list', params] as const,
    details: () => ['du-an', 'detail'] as const,
    detail:  (id: string) => ['du-an', 'detail', id] as const,
  },

  hopDong: {
    all:     () => ['hop-dong'] as const,
    lists:   () => ['hop-dong', 'list'] as const,
    list:    (params?: unknown) => ['hop-dong', 'list', params] as const,
    details: () => ['hop-dong', 'detail'] as const,
    detail:  (id: string) => ['hop-dong', 'detail', id] as const,
  },

  giaiNgan: {
    all:     () => ['giai-ngan'] as const,
    lists:   () => ['giai-ngan', 'list'] as const,
    list:    (params?: unknown) => ['giai-ngan', 'list', params] as const,
    details: () => ['giai-ngan', 'detail'] as const,
    detail:  (id: string) => ['giai-ngan', 'detail', id] as const,
  },

  keHoachVon: {
    all:   () => ['ke-hoach-von'] as const,
    lists: () => ['ke-hoach-von', 'list'] as const,
    list:  (params?: unknown) => ['ke-hoach-von', 'list', params] as const,
  },

  nhaThau: {
    all:     () => ['nha-thau'] as const,
    lists:   () => ['nha-thau', 'list'] as const,
    list:    (params?: unknown) => ['nha-thau', 'list', params] as const,
    details: () => ['nha-thau', 'detail'] as const,
    detail:  (id: string) => ['nha-thau', 'detail', id] as const,
  },

  baoCao: {
    all:  () => ['bao-cao'] as const,
    list: (params?: unknown) => ['bao-cao', 'list', params] as const,
  },

  dashboard: {
    all:     () => ['dashboard'] as const,
    summary: () => ['dashboard', 'summary'] as const,
  },

  // ── Danh mục Dm_* (HeThong API) ──────────────────────────────────────────────
  danhMuc: {
    linhVuc: {
      all:    () => ['dm', 'linh-vuc'] as const,
      list:   (params?: unknown) => ['dm', 'linh-vuc', 'list', params] as const,
      detail: (id: number) => ['dm', 'linh-vuc', 'detail', id] as const,
    },
    duAnDauTu: {
      all:    () => ['dm', 'du-an-dau-tu'] as const,
      list:   (params?: unknown) => ['dm', 'du-an-dau-tu', 'list', params] as const,
      detail: (id: number) => ['dm', 'du-an-dau-tu', 'detail', id] as const,
    },
    diaBan: {
      all:      () => ['dm', 'dia-ban'] as const,
      lists:    () => ['dm', 'dia-ban', 'list'] as const,
      list:     (params?: unknown) => ['dm', 'dia-ban', 'list', params] as const,
      detail:   (id: number) => ['dm', 'dia-ban', 'detail', id] as const,
      /** Cascade dropdown — byParent(undefined) = cấp 1, byParent(id) = con của id */
      byParent: (idCha?: number | null) => ['dm', 'dia-ban', 'by-parent', idCha ?? null] as const,
    },
  },
} as const;
