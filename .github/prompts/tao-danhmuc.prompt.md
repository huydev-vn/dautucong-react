---
mode: 'agent'
description: 'Tạo đầy đủ frontend cho một màn Danh mục: types → api → hooks → form → list page'
---

Tạo màn danh mục mới cho dự án **Đầu tư Công** — phần **frontend React**.

## Bước 0 — Đọc skill files trước khi viết bất kỳ dòng code nào

Đọc file này TRƯỚC, không cần đọc lại toàn bộ nếu đã đọc:
- `.github/skills/danh-muc-feature/AGENTS.md` — pattern chuẩn cho toàn bộ màn danh mục
- `.github/skills/react-best-practices/AGENTS.md` — chỉ đọc section 5 (Re-render) và 2.1 (bundle)

Reference implementation đã chuẩn nhất: `src/features/danh-muc/dia-ban/`

---

## Input

**Tên domain (PascalCase, không dấu):** `${input:domainName}`
*(VD: `LinhVuc`, `LoaiGoiThau`, `NhaThai`, `DiaBan`)*

**Slug URL (kebab-case):** `${input:domainSlug}`
*(VD: `linh-vuc`, `loai-goi-thau`, `nha-thai`, `dia-ban`)*

**Tên hiển thị tiếng Việt:** `${input:domainLabel}`
*(VD: `Lĩnh vực`, `Loại gói thầu`, `Địa bàn`)*

**Có quan hệ cha-con (hierarchy)?** `${input:hasHierarchy}`
*(Nhập `yes` nếu bảng cần cha-con — dùng TreeTable + filterTreeItems + SearchSelectField)*

**Các field hiển thị trong bảng (ngoài Ma, Ten, HieuLuc, Thao tác):** `${input:extraFields}`
*(VD: `MoTa`, `NamHoc` — hoặc để trống nếu không có)*

---

## Yêu cầu tạo các file sau

### 1. Types — `src/features/danh-muc/{domainSlug}/types/{domainSlug}.type.ts`

- Interface `${input:domainName}` extends `BaseModel` — có `Ma`, `Ten`, `HieuLuc`, `Stt`, `GhiChu`
- Nếu hierarchy: thêm `IdCha: number | null`, `TenCha: string | null`
- Thêm các extraFields nếu có
- Interface `${input:domainName}ListParams` — có `pageNumber?`, `pageSize?`, `keyword?`, `hieuLuc?`
  - Nếu hierarchy: KHÔNG thêm `keyword` (filter client-side)
- Interface `${input:domainName}FormValues` — `id`, `ma`, `ten`, `hieuLuc`, `stt?`, `ghiChu?`
  - Nếu hierarchy: thêm `idCha?: number | null`
- Type alias `${input:domainName}PagedResult = PagedResult<${input:domainName}>`

### 2. API — `src/features/danh-muc/{domainSlug}/api/{domainSlug}.api.ts`

- Dùng `createDmApi<..>('Dm_${input:domainName}')` factory từ `../../api/danh-muc.api`
- Export `getList`, `save`, `delete` từ factory
- Override `getById` nếu controller dùng `ThongTin` thay vì `LayTheoId`
- Nếu hierarchy: thêm `getByParent` gọi endpoint `LayTheoCha?idCha=`

### 3. Query Keys — thêm vào `src/lib/query-keys.ts`

Thêm key cho `${input:domainSlug}` vào object `danhMuc`:
```typescript
${input:domainSlug}: {
  all:    () => ['dm', '${input:domainSlug}'] as const,
  lists:  () => ['dm', '${input:domainSlug}', 'list'] as const,
  list:   (params?: unknown) => ['dm', '${input:domainSlug}', 'list', params] as const,
  detail: (id: number) => ['dm', '${input:domainSlug}', 'detail', id] as const,
  // Nếu hierarchy:
  byParent: (idCha?: number | null) => ['dm', '${input:domainSlug}', 'by-parent', idCha ?? null] as const,
},
```

### 4. Hooks — `src/features/danh-muc/{domainSlug}/hooks/use${input:domainName}.ts`

**Nếu KHÔNG hierarchy:**
- `use${input:domainName}List(params?)` — `STALE_TIME.LIST`, standard pagination
- `use${input:domainName}All(params?)` — `pageSize: 9999`, `STALE_TIME.REFERENCE` cho dropdown

**Nếu CÓ hierarchy:**
- `use${input:domainName}All(params?: Pick<..., 'hieuLuc'>)` — `pageSize: 9999`, `STALE_TIME.REFERENCE`
- KHÔNG nhận `keyword` — filter client-side
- `useSave${input:domainName}()` — invalidate `queryKeys.danhMuc.${input:domainSlug}.all()`
- `useDelete${input:domainName}()` — invalidate `queryKeys.danhMuc.${input:domainSlug}.all()`
- KHÔNG khai báo `onError` trong mutation — đã có global handler

### 5. Form — `src/features/danh-muc/{domainSlug}/components/${input:domainName}Form.tsx`

- Zod schema validate đủ field
- `toDefaults(item | null)` tính từ editItem — KHÔNG dùng `useEffect` để derive state
- `useEffect(() => { if (!open) return; form.reset(toDefaults(editItem)); }, [open, editItem])` — reset khi mở dialog
- Field `idCha` (nếu hierarchy): dùng `SearchSelectField` với `parentValue: d.IdCha ?? null`, `clearable`
  KHÔNG dùng `SelectField` thông thường
- Field `hieuLuc`: dùng `SelectField` với options `[{value:1,label:'Đang dùng'},{value:0,label:'Ngừng dùng'}]`
- Dùng `useUnsavedChanges(form.formState.isDirty, onClose)` → `guardedClose`
- Grid layout: `grid grid-cols-2 gap-x-4 gap-y-3`

### 6. List Page — `src/features/danh-muc/{domainSlug}/pages/${input:domainName}ListPage.tsx`

> **Chọn component bảng dựa theo `hasHierarchy`:**
>
> | Trường hợp | Component | Import |
> |------------|-----------|--------|
> | `hasHierarchy = no` (dữ liệu phẳng) | `<DataTable>` | `@/components/shared/DataTable` |
> | `hasHierarchy = yes` (có cấp cha-con) | `<TreeTable>` | `@/components/shared/TreeTable` |
>
> **DataTable** — server-side pagination, keyword search gửi lên backend:
> - State: `search`, `page`, `filterHieuLuc`, ...
> - Hook: `use${domainName}List({ pageNumber: page, pageSize: 20, keyword: search, hieuLuc: filterHieuLuc })`
> - Reset `page` về 1 khi `search` hoặc `filterHieuLuc` thay đổi
> - Props: `<DataTable columns data={data?.Items ?? []} loading pageSize={PAGE_SIZE} total={data?.Total ?? 0} page onPageChange />`
>
> **TreeTable** — load toàn bộ client-side, keyword filter ở frontend để giữ cây:
> - State: `search`, `filterHieuLuc`, ... (KHÔNG có `page`)
> - Hook: `use${domainName}All({ hieuLuc: filterHieuLuc })` — KHÔNG truyền keyword
> - `filterTreeItems()` function ở module-level (xem skill file) — lọc và giữ tổ tiên
> - Props: `<TreeTable rowKey="Id" parentKey="IdCha" defaultExpanded={search.trim() ? 'all' : 'first-level'} pageSize={20} />`
> - `badge={allItems.length}` (tổng server) không phải `items.length` (sau filter client)

**Cả hai:**
- `buildColumns()` ở module-level, KHÔNG định nghĩa trong component
- Row actions: view (`MA_TAC_VU.XEM`), edit (`MA_TAC_VU.SUA`), delete (`MA_TAC_VU.XOA`)
- `<DetailDialog>` từ `@/components/shared/DetailDialog` — KHÔNG viết Dialog thủ công
- `<ConfirmDialog>` cho xóa
- `<ListPageShell>` cho layout chuẩn
- `usePermissionByUrl('/qldm/dm${input:domainSlug}')` cho kiểm tra quyền
- Filter hiệu lực: `<select>` với "Tất cả hiệu lực / Đang dùng / Ngừng dùng"

---

## Constraints bắt buộc

- Import từ lucide-react trực tiếp: `import { Eye } from 'lucide-react'` (vite tree-shakes tốt, ok)
- `buildColumns` và `filterTreeItems` phải ở module-level, KHÔNG trong component
- KHÔNG dùng `key` counter để reset form — dùng `useEffect` + `form.reset()`
- KHÔNG khai báo `onError` trong mutation — global handler đã lo
- KHÔNG viết axios call thủ công cho CRUD cơ bản — dùng factory
- `cn()` từ `@/lib/utils` để merge class
- Màu thương hiệu chỉ dùng `#1a3c6e`

---

## Checklist cuối

Sau khi tạo xong, verify:
- [ ] `query-keys.ts` đã có key mới
- [ ] Route đã thêm vào App router (lazy import trực tiếp tới file `.tsx`)
- [ ] Form có `useUnsavedChanges`
- [ ] TreeTable có `defaultExpanded` động theo `search`
- [ ] DetailDialog dùng `DetailField[]` không viết JSX tay
- [ ] Không có `onError` trong mutation hooks
