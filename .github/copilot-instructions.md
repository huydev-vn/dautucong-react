# GitHub Copilot Instructions — Dự án Đầu tư Công

## Stack
React 19 + TypeScript strict, Vite, TailwindCSS v4, React Router v7, TanStack Query v5,
Zustand v5, React Hook Form + Zod v4, Axios, shadcn/ui, Sonner.
Path alias: `@/` → `src/`. Feature-Based Architecture.

## React Best Practices — BẮT BUỘC tuân thủ mọi lúc

> Full rules + examples: `.github/skills/react-best-practices/AGENTS.md`
> Chỉ đọc file đó khi cần ví dụ chi tiết cho một rule cụ thể — không đọc toàn bộ.

### CRITICAL — Eliminating Waterfalls
- `Promise.all()` cho independent async ops; KHÔNG await tuần tự khi không có dependency
- Di chuyển `await` vào branch thực sự dùng nó (defer await until needed)
- Kiểm tra cheap sync condition TRƯỚC khi await remote flag
- Start promises sớm, await muộn trong API routes

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

### API & Cache
- API files: dùng `axiosInstance`, trả về unwrapped `data.data`
- Query keys: dùng `queryKeys` factory từ `@/lib/query-keys` — KHÔNG dùng string thô
- Cache tier: import `STALE_TIME`, `GC_TIME` từ `@/lib/cache-config` và chọn đúng tier:
  - `REFERENCE` (30 phút) — dropdown ít thay đổi: Nhóm, Đơn vị, Tác vụ
  - `LIST` (5 phút) — danh sách CRUD
  - `DETAIL` (2 phút) — chi tiết 1 record
- Mutation `onError`: KHÔNG khai báo — `query-client.ts` đã xử lý toast lỗi toàn cục
- Sau mutation: `invalidateQueries({ queryKey: queryKeys.X.all() })` để xóa cache

### Router
- Lazy import page **trực tiếp** tới file `.tsx`, KHÔNG qua barrel `index.ts`
- Layouts (`AppLayout`, `AuthLayout`): eager import — không lazy
- `ProtectedRoute` dùng Zustand `isAuthenticated + isInitialized`

### Form & Dialog
- Luôn dùng React Hook Form + Zod; tất cả field dùng `Controller`
- KHÔNG reset form bằng `key` prop + counter — dùng `useEffect(() => { if (open) form.reset(...) }, [open, editItem])`
- Dropdown data: prefetch ở page level, KHÔNG fetch bên trong form với `enabled: open`
- `key` prop chỉ được phép khi component có state nội bộ phức tạp (>50 items) — phải comment lý do

### Misc
- Feature `index.ts` = public API barrel — chỉ export những gì feature khác cần
- `cn()` từ `@/lib/utils` để merge TailwindCSS class
- Màu thương hiệu: `#1a3c6e`
