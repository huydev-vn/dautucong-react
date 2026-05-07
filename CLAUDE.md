# CLAUDE.md — Quy ước Frontend React

> Đây là **luật của dự án**. Dev mới bắt buộc đọc hết trước khi viết code.
> AI assistant (GitHub Copilot, Claude) cũng đọc file này để sinh code đúng chuẩn.

---

## 1. Công nghệ sử dụng

| Công nghệ | Phiên bản | Dùng để |
|-----------|-----------|---------|
| React | 19 | UI framework |
| TypeScript | strict mode | Ngôn ngữ chính — không dùng `any` |
| Vite | mới nhất | Dev server, build tool |
| TailwindCSS | v4 | Styling — không viết CSS file riêng |
| React Router | v7 | Điều hướng trang |
| TanStack Query | v5 | Gọi API, cache dữ liệu từ server |
| Zustand | v5 | State UI (sidebar, auth) |
| React Hook Form + Zod | mới nhất | Form và validation |
| shadcn/ui + Radix UI | mới nhất | Component UI có sẵn |
| Sonner | mới nhất | Toast thông báo |
| Axios | mới nhất | HTTP client |

Path alias: `@/` trỏ tới `src/` — **luôn dùng `@/` thay vì đường dẫn tương đối**.

---

## 2. Cấu trúc thư mục `src/`

```
src/
├── app/
│   └── router/           ← Định nghĩa routes, lazy load pages
│       ├── index.ts      ← createBrowserRouter — thêm route mới ở đây
│       ├── page-registry.ts ← Danh sách tất cả lazy pages
│       ├── ProtectedRoute.tsx ← Guard kiểm tra đăng nhập
│       └── withSuspense.tsx   ← Wrapper Suspense cho lazy pages
│
├── components/
│   ├── layout/           ← AppLayout, AuthLayout, Sidebar, Header
│   ├── shared/           ← Component dùng chung nhiều feature (Form, Badge, Table...)
│   └── ui/               ← shadcn/ui components — KHÔNG sửa trực tiếp
│
├── features/             ← MỖI FEATURE = 1 THƯ MỤC ĐỘC LẬP
│   ├── auth/             ← Đăng nhập, phân quyền, auth store
│   ├── du-an/            ← Dự án đầu tư
│   ├── hop-dong/         ← Hợp đồng
│   ├── giai-ngan/        ← Giải ngân
│   ├── ke-hoach-von/     ← Kế hoạch vốn
│   ├── nha-thau/         ← Nhà thầu
│   ├── bao-cao/          ← Báo cáo
│   ├── danh-muc/         ← Danh mục dùng chung
│   ├── dashboard/        ← Trang tổng quan
│   └── quan-tri/         ← Quản trị hệ thống (người dùng, nhóm, chức năng...)
│
├── hooks/                ← Hooks dùng chung KHÔNG thuộc feature nào
│   ├── useDebounce.ts    ← Delay input search
│   ├── useLocalStorage.ts
│   └── useUnsavedChanges.tsx ← Cảnh báo khi rời trang chưa lưu
│
├── lib/                  ← Cấu hình cốt lõi — ĐỌC KỸ TRƯỚC KHI SỬA
│   ├── axios.ts          ← Axios instance + interceptors (auth, 401 refresh)
│   ├── query-client.ts   ← TanStack Query client (cấu hình cache mặc định)
│   ├── query-keys.ts     ← Factory sinh cache key — NGUỒN DUY NHẤT cho cache keys
│   ├── cache-config.ts   ← Thời gian cache theo tier (REFERENCE/LIST/DETAIL)
│   ├── parseApiError.ts  ← Chuyển lỗi API thành thông báo tiếng Việt
│   ├── token-store.ts    ← Lưu/lấy accessToken từ sessionStorage
│   └── utils.ts          ← cn() helper cho TailwindCSS class merging
│
├── stores/
│   └── ui.store.ts       ← Zustand store cho UI state (sidebar collapsed...)
│
├── types/
│   ├── api.types.ts      ← ApiResponse<T>, PaginatedResponse<T> — kiểu response chung
│   ├── common.types.ts   ← Kiểu dùng chung toàn app
│   └── index.ts          ← Re-export để import gọn: `import type { ... } from '@/types'`
│
└── utils/
    └── constants.ts      ← CHUC_NANG_IDS, MA_TAC_VU, DEFAULT_PAGE_SIZE...
```

---

## 3. Cấu trúc một feature — template chuẩn

Mỗi feature trong `src/features/` có cấu trúc giống nhau:

```
features/du-an/
├── api/
│   └── du-an.api.ts      ← Tất cả gọi API (axiosInstance). Trả về data đã unwrap.
├── hooks/
│   └── useDuAn.ts        ← useQuery + useMutation. Khai báo cache, xử lý toast.
├── pages/
│   └── DuAnListPage.tsx  ← Page component — import hooks, render UI
│   └── DuAnDetailPage.tsx
├── types/
│   └── du-an.types.ts    ← TypeScript types cho feature này
└── index.ts              ← PUBLIC API — chỉ export những gì feature khác cần dùng
```

**Nguyên tắc:** Feature khác muốn dùng gì của `du-an` → import từ `features/du-an/index.ts`, không import thẳng vào file con.

---

## 4. Cách thêm trang mới (step by step)

### Bước 1 — Tạo page component
```
src/features/[ten-feature]/pages/TenPage.tsx
```

### Bước 2 — Đăng ký vào page-registry
```ts
// src/app/router/page-registry.ts
export const PAGE_REGISTRY = {
  // ... existing pages
  TEN_PAGE: lazy(() =>
    import('@/features/ten-feature/pages/TenPage').then((m) => ({ default: m.TenPage }))
  ),
};
```
⚠️ **Quan trọng:** Import trực tiếp tới file `.tsx`, KHÔNG qua barrel `index.ts` → để code splitting hoạt động đúng.

### Bước 3 — Thêm route vào router
```ts
// src/app/router/index.ts
{ path: '/ten-path', element: withSuspense(PAGE_REGISTRY.TEN_PAGE, 'app') }
```

### Bước 4 — Thêm vào sidebar (nếu cần)
```ts
// src/components/layout/Sidebar.tsx — thêm menu item
```

---

## 5. Cách gọi API và quản lý cache

### Quy tắc vàng
- **Gọi API** → luôn qua `axiosInstance` trong file `api/*.api.ts`
- **Cache và state** → luôn qua `useQuery`/`useMutation` trong file `hooks/use*.ts`
- **Component** → chỉ gọi hooks, không gọi API trực tiếp

### Viết API file
```ts
// features/du-an/api/du-an.api.ts
export const duAnApi = {
  getList: async (params?: DuAnListParams): Promise<PaginatedResponse<DuAn>> => {
    const { data } = await axiosInstance.get<ApiResponse<PaginatedResponse<DuAn>>>('/du-an', { params });
    return data.data;  // ← unwrap .data vì backend bọc trong { status, data, message }
  },
};
```

### Viết hook — đọc dữ liệu
```ts
// features/du-an/hooks/useDuAn.ts
import { queryKeys } from '@/lib/query-keys';
import { STALE_TIME, GC_TIME } from '@/lib/cache-config';

export function useDuAnList(params?: DuAnListParams) {
  return useQuery({
    queryKey: queryKeys.duAn.list(params),   // ← luôn dùng queryKeys factory
    queryFn: () => duAnApi.getList(params),
    staleTime: STALE_TIME.LIST,              // ← chọn tier phù hợp (xem mục 6)
    gcTime: GC_TIME.LIST,
  });
}
```

### Viết hook — thêm/sửa/xóa
```ts
export function useSaveDuAn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => duAnApi.save(payload),
    onSuccess: (_, vars) => {
      toast.success(vars.id ? 'Cập nhật thành công' : 'Thêm mới thành công');
      // Xóa cache → useQuery tự động fetch lại dữ liệu mới
      void qc.invalidateQueries({ queryKey: queryKeys.duAn.all() });
    },
    // KHÔNG cần khai báo onError — query-client.ts đã xử lý toast lỗi toàn cục
  });
}
```

### Chọn tier cache

| Tier | staleTime | gcTime | Dùng cho |
|------|-----------|--------|----------|
| `STALE_TIME.REFERENCE` | 30 phút | 60 phút | Dropdown ít thay đổi: Nhóm, Đơn vị, Tác vụ |
| `STALE_TIME.LIST` | 5 phút | 10 phút | Danh sách CRUD thông thường |
| `STALE_TIME.DETAIL` | 2 phút | 5 phút | Chi tiết 1 record |

### Invalidate cache — khi nào dùng gì
```ts
// Xóa TẤT CẢ cache của duAn (list + detail)
void qc.invalidateQueries({ queryKey: queryKeys.duAn.all() });

// Chỉ xóa list, giữ nguyên detail cache
void qc.invalidateQueries({ queryKey: queryKeys.duAn.lists() });

// Chỉ xóa 1 record cụ thể
void qc.invalidateQueries({ queryKey: queryKeys.duAn.detail(id) });
```

---

## 6. Phân quyền

```ts
import { usePermission } from '@/features/auth/hooks/usePermission';
import { CHUC_NANG_IDS, MA_TAC_VU } from '@/utils/constants';

function DuAnListPage() {
  const { coQuyen } = usePermission(CHUC_NANG_IDS.DU_AN);

  return (
    <>
      {coQuyen(MA_TAC_VU.THEM) && <AddButton />}
      {coQuyen(MA_TAC_VU.XOA) && <DeleteButton />}
    </>
  );
}
```

**Khi thêm chức năng mới:** Cập nhật `CHUC_NANG_IDS` trong `src/utils/constants.ts` với ID lấy từ bảng `HETHONG_CHUCNANG` trong database.

---

## 7. Form và validation

```tsx
// Luôn dùng React Hook Form + Zod
const schema = z.object({
  tenDuAn: z.string().min(1, 'Bắt buộc nhập'),
  soVon: z.number().positive('Phải > 0'),
});

function DuAnForm({ open, editItem }: Props) {
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Reset khi dialog mở — BẮT BUỘC dùng pattern này
  useEffect(() => {
    if (open) form.reset(toDefaults(editItem));
  }, [open, editItem]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <TextField control={form.control} name="tenDuAn" label="Tên dự án" required />
    </form>
  );
}
```

**Không reset form bằng `key` prop** — gây lag 100-300ms vì remount toàn bộ component.

---

## 8. Rules bắt buộc — ĐỌC KỸ

### ❌ KHÔNG làm

```tsx
// ❌ Định nghĩa component bên trong component → remount mỗi render
function Page() {
  function Row({ item }) { return <tr>...</tr>; }  // SAI
  return <table>{items.map(i => <Row item={i} />)}</table>;
}

// ❌ Import từ barrel khi lazy load page
const Page = lazy(() => import('@/features/du-an'));  // SAI — bundle nhiều page vào 1 chunk

// ❌ Dùng magic string cho cache key
queryKey: ['du-an', 'list', params]  // SAI — dùng queryKeys.duAn.list(params)

// ❌ Khai báo onError trong mutation nếu chỉ cần toast
onError: () => toast.error('Lỗi')  // SAI — query-client.ts đã handle rồi

// ❌ useEffect để sync state từ props/state khác
useEffect(() => setFullName(first + ' ' + last), [first, last]);  // SAI
const fullName = first + ' ' + last;  // ĐÚNG — derive trong render
```

### ✅ PHẢI làm

```tsx
// ✅ Component định nghĩa ngoài — ở module level
function Row({ item }: { item: DuAn }) {
  return <tr>...</tr>;
}
function Page() {
  return <table>{items.map(i => <Row item={i} />)}</table>;
}

// ✅ Lazy import trực tiếp tới file
const Page = lazy(() =>
  import('@/features/du-an/pages/DuAnListPage').then(m => ({ default: m.DuAnListPage }))
);

// ✅ Dùng queryKeys factory
queryKey: queryKeys.duAn.list(params)

// ✅ Conditional với ternary khi value có thể là 0
{count > 0 ? <Badge>{count}</Badge> : null}   // ĐÚNG
{count && <Badge>{count}</Badge>}              // SAI — render "0" khi count = 0
```

---

## 9. Styling

- Dùng **TailwindCSS v4** — không viết file CSS riêng
- Màu thương hiệu: `#1a3c6e` (xanh đậm)
- Dùng hàm `cn()` từ `@/lib/utils` để merge class có điều kiện:
  ```ts
  import { cn } from '@/lib/utils';
  className={cn('base-class', isActive && 'active-class', error && 'error-class')}
  ```
- Component UI có sẵn: `@/components/ui/` (shadcn/ui) — dùng trước khi tự viết

---

## 10. Các file quan trọng cần biết

| File | Vai trò |
|------|---------|
| `src/lib/axios.ts` | HTTP client, tự động refresh token khi 401 |
| `src/lib/query-client.ts` | Cấu hình cache mặc định, xử lý lỗi toàn cục |
| `src/lib/query-keys.ts` | **Nguồn duy nhất** cho cache keys — thêm key mới ở đây |
| `src/lib/cache-config.ts` | Thời gian cache — xem để chọn tier đúng |
| `src/utils/constants.ts` | `CHUC_NANG_IDS`, `MA_TAC_VU`, `DEFAULT_PAGE_SIZE` |
| `src/features/auth/stores/auth.store.ts` | Zustand store lưu thông tin user, token |
| `src/app/router/page-registry.ts` | Danh sách tất cả lazy pages |
