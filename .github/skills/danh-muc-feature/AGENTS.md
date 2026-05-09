# Frontend — Danh Mục Feature Pattern

> **Đọc file này khi:** tạo màn danh mục mới (DM_*), bao gồm types, api, hooks, form, list page.
> **Reference implementation:** `src/features/danh-muc/dia-ban/` (chuẩn nhất — đã review đầy đủ)

---

## Quyết định kiến trúc

- Mỗi danh mục = 1 feature folder: `src/features/danh-muc/{domain}/`
- API: dùng `createDmApi` factory → KHÔNG viết axios call thủ công cho CRUD cơ bản
- Cache: `STALE_TIME.REFERENCE` + `GC_TIME.REFERENCE` cho data danh mục (ít thay đổi)
- Tree data: load toàn bộ (`pageSize: 9999`), filter **client-side** để giữ cây cha-con
- Flat data: pagination bình thường, filter server-side
- `pageSize: 9999` KHÔNG phải anti-pattern cho danh mục: TanStack Query cache kết quả,
  chỉ gọi 1 lần/session với `STALE_TIME.REFERENCE = 30 phút`

---

## File structure chuẩn

```
src/features/danh-muc/{domain}/
├── types/
│   └── {domain}.type.ts       ← interfaces + form values
├── api/
│   └── {domain}.api.ts        ← createDmApi factory + custom endpoints
├── hooks/
│   └── use{Domain}.ts         ← useQuery + useMutation
├── components/
│   └── {Domain}Form.tsx       ← React Hook Form + Zod dialog
└── pages/
    └── {Domain}ListPage.tsx   ← list page (TreeTable hoặc DataTable)
```

---

## 1. Types (`{domain}.type.ts`)

```typescript
import type { BaseModel, PagedResult } from '@/types';

// Entity trả về từ API
export interface {Domain} extends BaseModel {
  Ma:      string;
  Ten:     string;
  HieuLuc: number;
  Stt:     number | null;
  GhiChu:  string | null;
  // Nếu có hierarchy:
  IdCha:   number | null;
  TenCha:  string | null;
}

// Params cho getList (pageNumber, pageSize luôn có)
export interface {Domain}ListParams {
  pageNumber?: number;
  pageSize?:   number;
  keyword?:    string;
  hieuLuc?:    number;
  // Nếu hierarchy: idCha?: number;
}

// Form values — dùng cho React Hook Form
export interface {Domain}FormValues {
  id:      number;      // 0 = thêm mới
  ma:      string;
  ten:     string;
  hieuLuc: number;
  stt?:    number;
  ghiChu?: string;
  // Nếu hierarchy: idCha?: number | null;
}

export type {Domain}PagedResult = PagedResult<{Domain}>;
```

### BaseModel fields (không khai báo lại trong entity)
```typescript
// Từ src/types/index.ts — BaseModel có sẵn:
Id: number;
NgayTao: string | null;
NgaySua: string | null;
NguoiTao: string | null;
NguoiSua: string | null;
IsDelete: number;
```

---

## 2. API (`{domain}.api.ts`)

```typescript
import axiosInstance from '@/lib/axios';
import type { ApiWrapped } from '@/types';
import { createDmApi } from '../../api/danh-muc.api';
import type { {Domain}, {Domain}FormValues, {Domain}ListParams } from '../types/{domain}.type';

// Tên controller PHẢI khớp với backend route: api/Dm_{Domain}
const _base = createDmApi<{Domain}, {Domain}FormValues, {Domain}ListParams>('Dm_{Domain}');

export const {domain}Api = {
  // CRUD cơ bản — kế thừa từ factory
  getList: _base.getList,
  save:    _base.save,
  delete:  _base.delete,

  // Override getById nếu controller dùng endpoint khác (ThongTin thay vì LayTheoId)
  getById: async (id: number): Promise<{Domain}> => {
    const { data } = await axiosInstance.get<ApiWrapped<{Domain}>>('/Dm_{Domain}/ThongTin', { params: { id } });
    return data.data;
  },

  // Nếu hierarchy: thêm getByParent
  getByParent: async (idCha?: number | null): Promise<{Domain}[]> => {
    const { data } = await axiosInstance.get<ApiWrapped<{Domain}[]>>('/Dm_{Domain}/LayTheoCha', {
      params: idCha != null ? { idCha } : {},
    });
    return data.data ?? [];
  },
};
```

---

## 3. Hooks (`use{Domain}.ts`)

### Danh mục phẳng (không hierarchy)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import { STALE_TIME, GC_TIME } from '@/lib/cache-config';
import { {domain}Api } from '../api/{domain}.api';
import type { {Domain}FormValues, {Domain}ListParams } from '../types/{domain}.type';

export function use{Domain}List(params?: {Domain}ListParams) {
  return useQuery({
    queryKey:  queryKeys.danhMuc.{domain}.list(params),
    queryFn:   () => {domain}Api.getList(params),
    staleTime: STALE_TIME.LIST,
    gcTime:    GC_TIME.LIST,
  });
}

// Dùng cho dropdown / SelectField — ít thay đổi → REFERENCE tier
export function use{Domain}All(params?: Pick<{Domain}ListParams, 'hieuLuc'>) {
  return useQuery({
    queryKey: queryKeys.danhMuc.{domain}.list({ all: true, ...params }),
    queryFn:  () => {domain}Api.getList({ pageSize: 9999, ...params }),
    staleTime: STALE_TIME.REFERENCE,
    gcTime:    GC_TIME.REFERENCE,
    select:    (data) => data?.Items ?? [],
  });
}

export function useSave{Domain}() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (model: {Domain}FormValues) => {domain}Api.save(model),
    onSuccess: (_, vars) => {
      toast.success(vars.id > 0 ? 'Cập nhật thành công' : 'Thêm mới thành công');
      void qc.invalidateQueries({ queryKey: queryKeys.danhMuc.{domain}.all() });
    },
  });
}

export function useDelete{Domain}() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {domain}Api.delete(id),
    onSuccess: () => {
      toast.success('Xóa thành công');
      void qc.invalidateQueries({ queryKey: queryKeys.danhMuc.{domain}.all() });
    },
  });
}
```

### Danh mục có hierarchy (tree) — quan trọng

```typescript
// KHÔNG truyền keyword lên backend — filter client-side để giữ cây cha-con
// Giải thích: nếu backend lọc theo keyword, node cha của kết quả bị mất →
// TreeTable không thể dựng cây đúng vị trí.
export function use{Domain}All(params?: Pick<{Domain}ListParams, 'hieuLuc'>) {
  return useQuery({
    queryKey: queryKeys.danhMuc.{domain}.list({ all: true, ...params }),
    queryFn:  () => {domain}Api.getList({ pageSize: 9999, ...params }),
    staleTime: STALE_TIME.REFERENCE,
    gcTime:    GC_TIME.REFERENCE,
    select:    (data) => data?.Items ?? [],
  });
}
```

---

## 4. Tree-aware client-side search (CHỈ cho hierarchy)

Đặt ở module-level (ngoài component) trong `{Domain}ListPage.tsx`:

```typescript
// Khi node con khớp search → giữ nguyên tất cả node cha để TreeTable dựng cây đúng.
// Generic — copy paste và đổi tên type cho mỗi feature.
function filterTreeItems(items: {Domain}[], search: string): {Domain}[] {
  if (!search.trim()) return items;
  const q = search.trim().toLowerCase();
  const itemMap = new Map(items.map((i) => [i.Id, i]));
  const keepSet = new Set<number>();

  for (const item of items) {
    if (item.Ma.toLowerCase().includes(q) || item.Ten.toLowerCase().includes(q)) {
      keepSet.add(item.Id);
      let cur: {Domain} | undefined = item;
      while (cur?.IdCha != null) {
        const parent = itemMap.get(cur.IdCha);
        if (!parent) break;
        keepSet.add(parent.Id);
        cur = parent;
      }
    }
  }
  return items.filter((i) => keepSet.has(i.Id));
}
```

Dùng trong component:
```typescript
const { data: allItems = [], isLoading } = use{Domain}All({ hieuLuc: filterHieuLuc });
const items = useMemo(() => filterTreeItems(allItems, search), [allItems, search]);
```

Truyền vào TreeTable:
```tsx
<TreeTable<{Domain}>
  columns={columns}
  data={items}
  rowKey="Id"
  parentKey="IdCha"
  defaultExpanded={search.trim() ? 'all' : 'first-level'}  // 'all' khi search để mở node cha
  pageSize={20}
/>
```

---

## 5. Form (`{Domain}Form.tsx`)

```typescript
const schema = z.object({
  id:      z.number(),
  ma:      z.string().min(1, 'Mã không được để trống').max(20),
  ten:     z.string().min(1, 'Tên không được để trống').max(200),
  hieuLuc: z.coerce.number(),
  stt:     z.coerce.number().int().optional(),
  ghiChu:  z.string().max(500).optional().or(z.literal('')),
  // Nếu hierarchy:
  idCha:   z.preprocess(
    (v) => (v === '' || v == null ? null : Number(v)),
    z.number().int().positive().nullable(),
  ),
});

// Reset form khi mở dialog:
useEffect(() => {
  if (!open) return;
  form.reset(toDefaults(editItem));
}, [open, editItem]);
```

### Dropdown cha (hierarchy) — dùng SearchSelectField, KHÔNG SelectField

```typescript
// parentOptions truyền parentValue → SearchSelectField tự dựng cây dropdown
const parentOptions = useMemo(() => {
  const selfId = editItem?.Id;
  return allItems
    .filter((d) => d.Id !== selfId)  // loại bản thân (tránh self-reference)
    .map((d) => ({ value: d.Id, label: `${d.Ma} — ${d.Ten}`, parentValue: d.IdCha ?? null }));
}, [allItems, editItem]);

// Trong JSX:
<SearchSelectField
  control={form.control}
  name="idCha"
  label="{Domain} cha"
  options={parentOptions}
  placeholder="— Không có cha (node gốc) —"
  clearable
  className="col-span-2"
/>
```

---

## 6. List Page (`{Domain}ListPage.tsx`)

### Flat list (DataTable)

```typescript
export function {Domain}ListPage() {
  const { coQuyen } = usePermissionByUrl('/qldm/dm{domain}');
  const [search,        setSearch]       = useState('');
  const [page,          setPage]         = useState(1);
  const [filterHieuLuc, setFilterHieuLuc] = useState<number | undefined>(undefined);
  const [formOpen,      setFormOpen]     = useState(false);
  const [editItem,      setEditItem]     = useState<{Domain} | null>(null);
  const [deleteTarget,  setDeleteTarget] = useState<{Domain} | null>(null);
  const [detailItem,    setDetailItem]   = useState<{Domain} | null>(null);

  const { data, isLoading } = use{Domain}List({ pageNumber: page, pageSize: 20, keyword: search, hieuLuc: filterHieuLuc });
  // ...
}
```

### Tree list (TreeTable + filterTreeItems)

```typescript
export function {Domain}ListPage() {
  const { coQuyen } = usePermissionByUrl('/qldm/dm{domain}');
  const [search,        setSearch]        = useState('');
  const [filterHieuLuc, setFilterHieuLuc] = useState<number | undefined>(undefined);
  // ... form/detail state

  // Load toàn bộ — keyword KHÔNG truyền lên backend
  const { data: allItems = [], isLoading } = use{Domain}All({ hieuLuc: filterHieuLuc });
  const items = useMemo(() => filterTreeItems(allItems, search), [allItems, search]);
  // ...
}
```

### Row actions chuẩn

```typescript
// buildColumns — định nghĩa ngoài component (module level)
function buildColumns(
  search: string,
  coQuyen: UsePermissionResult['coQuyen'],
  handlers: { onView: ...; onEdit: ...; onDelete: ... },
): ColumnDef<{Domain}>[] {
  const rowActions: RowActionDef<{Domain}>[] = [
    { key: 'view',   maTacVu: MA_TAC_VU.XEM, icon: Eye,    variant: 'view',   title: 'Xem chi tiết', onClick: handlers.onView },
    { key: 'edit',   maTacVu: MA_TAC_VU.SUA, icon: Pencil, variant: 'edit',   title: 'Sửa',          onClick: handlers.onEdit },
    { key: 'delete', maTacVu: MA_TAC_VU.XOA, icon: Trash2, variant: 'delete', title: 'Xóa',          onClick: handlers.onDelete },
  ];
  // ...
}
```

### DetailDialog — KHÔNG viết inline Dialog thủ công

```tsx
import { DetailDialog } from '@/components/shared/DetailDialog';

<DetailDialog
  open={!!detailItem}
  onClose={() => setDetailItem(null)}
  title="Chi tiết {domain}"
  size="sm"
  fields={detailItem ? [
    { label: 'Mã',      value: <span className="font-mono font-semibold text-[#1a3c6e]">{detailItem.Ma}</span> },
    { label: 'Thứ tự',  value: detailItem.Stt },
    { label: 'Tên',     value: detailItem.Ten, span: 2 },
    // Nếu hierarchy:
    { label: '{Domain} cha', value: tenCha ?? '— (node gốc)', span: 2 },
    { label: 'Hiệu lực', value: <TableBadge label={...} variant={...} /> },
    { label: 'Ghi chú', value: detailItem.GhiChu, span: 2, hidden: !detailItem.GhiChu },
    { label: 'Ngày tạo', value: <span className="text-gray-500">{detailItem.NgayTao}</span> },
    { label: 'Người tạo', value: <span className="text-gray-500">{detailItem.NguoiTao}</span> },
  ] : []}
/>
```

### TenCha fallback client-side (hierarchy)

Sau khi fix Oracle alias (`TENCHA` thay vì `TEN_CHA`) thì backend trả đúng.
Thêm fallback để phòng khi backend chưa deploy:

```typescript
const detailItemMap = useMemo(() => new Map(allItems.map((i) => [i.Id, i])), [allItems]);
const detailTenCha = useMemo(() => {
  if (!detailItem) return null;
  if (detailItem.TenCha) return detailItem.TenCha; // backend đã trả đúng
  if (detailItem.IdCha == null) return null;        // root node
  return detailItemMap.get(detailItem.IdCha)?.Ten ?? null; // fallback từ allItems
}, [detailItem, detailItemMap]);
```

---

## 7. Query Keys — thêm vào `src/lib/query-keys.ts`

```typescript
// Trong object danhMuc:
{domain}: {
  all:    () => ['dm', '{domain-slug}'] as const,
  lists:  () => ['dm', '{domain-slug}', 'list'] as const,
  list:   (params?: unknown) => ['dm', '{domain-slug}', 'list', params] as const,
  detail: (id: number) => ['dm', '{domain-slug}', 'detail', id] as const,
  // Nếu hierarchy:
  byParent: (idCha?: number | null) => ['dm', '{domain-slug}', 'by-parent', idCha ?? null] as const,
},
```

---

## 8. CRITICAL — Lỗi hay gặp

### Dapper không map cột Oracle có underscore

```sql
-- SAI: TEN_CHA có dấu '_' → Dapper không map được vào property TenCha (C#)
cha.TEN AS TEN_CHA

-- ĐÚNG: alias không có underscore → Dapper map case-insensitive
cha.TEN AS TENCHA
```

**Rule chung:** Oracle alias trong `SELECT` → KHÔNG dùng underscore khi muốn Dapper map vào C# property dạng PascalCase.
Tất cả cột tự nhiên như `IDCHA`, `NGAYTAO`, `NGUOITAO` không có underscore nên map đúng.

### defaultExpanded phải là 'all' khi có search

```tsx
// SAI: node cha không mở → node con matching bị ẩn
defaultExpanded="first-level"

// ĐÚNG: khi search, mở toàn bộ cây để hiện node matching ở cấp sâu
defaultExpanded={search.trim() ? 'all' : 'first-level'}
```

### keyword KHÔNG gửi lên backend cho tree

```typescript
// SAI: backend trả về subset → TreeTable mất parent context
useDiaBanAll({ keyword: search, hieuLuc })

// ĐÚNG: filter client-side qua filterTreeItems()
useDiaBanAll({ hieuLuc })
// const items = useMemo(() => filterTreeItems(allItems, search), [allItems, search]);
```

---

## 9. Checklist khi tạo màn mới

- [ ] `{domain}.type.ts` — interface, params, form values
- [ ] `{domain}.api.ts` — createDmApi factory
- [ ] `use{Domain}.ts` — useQuery hooks + mutations
- [ ] `query-keys.ts` — thêm key mới cho domain
- [ ] `{Domain}Form.tsx` — RHF + Zod, SearchSelectField nếu có hierarchy
- [ ] `{Domain}ListPage.tsx` — TreeTable hoặc DataTable
- [ ] Route trong App router
- [ ] Oracle: alias cột JOIN không dùng underscore
