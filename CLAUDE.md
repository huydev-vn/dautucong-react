# CLAUDE.md — Dự án Đầu tư Công

## Stack
React 19 + TypeScript strict, Vite, TailwindCSS v4, React Router v7, TanStack Query v5,
Zustand v5, React Hook Form + Zod v4, Axios, shadcn/ui, Sonner, ECharts.
Path alias: `@/` → `src/`. Feature-Based Architecture.

## React Best Practices — BẮT BUỘC tuân thủ mọi lúc

> Full rules + examples: `.github/skills/react-best-practices/AGENTS.md`
> Chỉ đọc file đó khi cần ví dụ chi tiết cho một rule cụ thể — không đọc toàn bộ.

### CRITICAL — Eliminating Waterfalls
- `Promise.all()` cho independent async ops; KHÔNG await tuần tự khi không có dependency
- Di chuyển `await` vào branch thực sự dùng nó (defer await until needed)
- Kiểm tra cheap sync condition TRƯỚC khi await remote flag
- Start promises sớm, await muộn trong API routes/Server Actions

### CRITICAL — Bundle Size
- KHÔNG import từ barrel file — import trực tiếp (lucide-react, date-fns, v.v.)
- `React.lazy()` + `Suspense` cho heavy components không cần ở initial render
- Lazy load module chỉ khi feature được kích hoạt
- Prefer statically analyzable import paths (explicit map, không dynamic string concat)

### HIGH — Re-render Optimization
- **KHÔNG định nghĩa component bên trong component** — remount mỗi render, mất state
- Derive state trong render; KHÔNG dùng `useEffect` để sync state từ state/props khác
- `useState(() => expensiveInit())` cho lazy initialization
- `setX(prev => ...)` (functional setState) khi state mới phụ thuộc state cũ
- Tách `useMemo`/`useEffect` có dependencies độc lập thành hooks riêng
- KHÔNG wrap expression đơn giản primitive trong `useMemo` (overhead > benefit)
- Logic do user action trigger → event handler, KHÔNG phải `useEffect`
- Hoist default non-primitive props ra constant ngoài component khi dùng `memo()`
- `useTransition` / `startTransition` cho non-urgent updates

### MEDIUM — Rendering Performance
- Conditional rendering: ternary `? :` thay vì `&&` khi condition có thể là `0` / `NaN`
- Animate wrapper `<div>`, KHÔNG animate SVG element trực tiếp
- `useTransition` thay vì manual `isLoading` state

### LOW-MEDIUM — JavaScript Performance
- `Map` thay vì `.find()` lặp lại nhiều lần cùng key
- `Set` cho O(1) membership checks thay vì `Array.includes()`
- `.toSorted()` thay vì `.sort()` (immutability)
- Kết hợp `.filter().map()` thành `.flatMap()` một pass
- Early return ngay khi đã có kết quả
- Hoist RegExp ra ngoài render; dùng `useMemo` nếu dynamic

### LOW — Advanced
- KHÔNG đặt kết quả `useEffectEvent` vào dependency array
- App-wide init: module-level guard, KHÔNG `useEffect(fn, [])`

## Conventions dự án
- Feature `index.ts` = public API barrel — chỉ export ra ngoài từ đây
- Router: lazy import page **trực tiếp** (không qua barrel) để code splitting hoạt động
- API files: dùng `axiosInstance`, trả về unwrapped data
- Query keys: dùng từ `QUERY_KEYS` constant
- Auth guard: `ProtectedRoute` dùng Zustand `isAuthenticated + isInitialized`
- Layouts (`AppLayout`, `AuthLayout`): eager import — không lazy

## Dialog Form Reset — BẮT BUỘC

> Quy tắc này áp dụng cho **mọi** trang CRUD có dialog form.

**KHÔNG được** dùng `key` prop + `formKey` counter để reset form khi mở dialog:
```tsx
// ❌ SAI — gây remount toàn bộ component, delay ~100-300ms
const [formKey, setFormKey] = useState(0);
<MyForm key={editItem?.Id ?? `new-${formKey}`} ... />
```

**PHẢI** dùng pattern sau:

**1. Trong form component** — thêm `useEffect` reset:
```tsx
// Reset khi dialog mở hoặc editItem thay đổi
useEffect(() => {
  if (open) form.reset(toDefaults(editItem));
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [open, editItem]);
```

**2. Trong page component** — bỏ `formKey`, bỏ `key` prop trên form:
```tsx
// ✅ ĐÚNG
const handleOpenAdd = () => { setEditItem(null); setFormOpen(true); };
const handleEdit = (item) => { setEditItem(item); setFormOpen(true); };
<MyForm open={formOpen} editItem={editItem} ... />  // không có key prop
```

**3. Dropdown/select data** — prefetch ở **page level**, KHÔNG lazy fetch bên trong form với `enabled: open`.

**Ngoại lệ hợp lệ:** `key` được phép khi component cần reset **toàn bộ state nội bộ phức tạp** khi chuyển entity khác nhau, ví dụ: `<PhanQuyenPanel key={selectedNhom.Id} />` (100+ checkbox state). Phải comment lý do rõ ràng.
