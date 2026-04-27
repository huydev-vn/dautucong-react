# GitHub Copilot Instructions — Dự án Đầu tư Công

## Stack
React 19 + TypeScript strict, Vite, TailwindCSS v4, React Router v7, TanStack Query v5, Zustand v5, React Hook Form + Zod v4, Axios, shadcn/ui, Sonner, ECharts.
Path alias: `@/` → `src/`. Feature-Based Architecture.

---

## React Best Practices (Vercel — áp dụng mọi lúc)

### CRITICAL — Eliminating Waterfalls
- Dùng `Promise.all()` cho các async operations độc lập, không await tuần tự
- Di chuyển `await` vào đúng branch cần dùng, không await trước rồi mới kiểm tra
- Kiểm tra điều kiện synchronous rẻ tiền TRƯỚC khi await flag/remote value

### CRITICAL — Bundle Size
- **Không import từ barrel file** khi có thể import trực tiếp (ví dụ: lucide-react, date-fns)
- Dùng `React.lazy()` + `Suspense` cho heavy components không cần ở initial render
- Lazy load module chỉ khi feature đó được kích hoạt

### MEDIUM — Re-render Optimization
- **Không định nghĩa component bên trong component khác** — luôn định nghĩa ở ngoài và truyền props
- Derive state trong render, không dùng `useEffect` để sync state từ state khác
- Dùng `useState(() => expensiveInit())` (lazy initialization) cho giá trị khởi tạo tốn kém
- Dùng functional setState `setX(prev => ...)` khi state mới phụ thuộc state cũ
- Tách `useMemo`/`useEffect` có dependencies độc lập thành các hook riêng biệt
- Không wrap expression đơn giản có kết quả primitive trong `useMemo`
- Logic triggered bởi user action → đặt trong event handler, không phải `useEffect`
- Dùng `useTransition` / `startTransition` cho updates không khẩn cấp

### MEDIUM — Rendering Performance  
- Conditional rendering: dùng ternary `? :` thay vì `&&` khi condition có thể là `0` hoặc `NaN`
- Animate wrapper `<div>` thay vì animate SVG element trực tiếp (hardware acceleration)
- Dùng `useTransition` thay vì manual `useState` cho loading states

### LOW-MEDIUM — JavaScript Performance
- Dùng `Map` thay vì `.find()` lặp lại nhiều lần với cùng key
- Dùng `Set` cho O(1) membership checks thay vì `Array.includes()`
- Dùng `.toSorted()` thay vì `.sort()` để tránh mutate array (React immutability)
- Kết hợp nhiều `.filter().map()` thành một pass dùng `.flatMap()`
- Early return khi đã xác định được kết quả
- Hoist RegExp ra ngoài component, dùng `useMemo` nếu dynamic

### LOW — Advanced Patterns
- Không đặt kết quả `useEffectEvent` vào dependency array của `useEffect`
- App-wide initialization chạy một lần: dùng module-level guard, không dùng `useEffect([], [])`

---

## Conventions dự án

- Feature `index.ts` = public API barrel — chỉ export từ đây ra ngoài
- Router lazy imports từng page **trực tiếp** (không qua barrel) để code splitting hoạt động
- API files: `axiosInstance`, trả về unwrapped data
- Query keys: dùng từ `QUERY_KEYS` constant
- Auth guard: `ProtectedRoute` dùng Zustand `isAuthenticated + isInitialized`
- Layouts (`AppLayout`, `AuthLayout`): eager import — không lazy
