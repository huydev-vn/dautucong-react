/**
 * dev-logger.ts
 *
 * Logger cho API calls — CHỈ hoạt động ở môi trường development.
 * Tự động bị tree-shake khỏi production build.
 *
 * Output mẫu:
 *   ▶ GET /DanhMuc/DiaBan   ✓ 200   142ms
 *   ▶ POST /Auth/Login      ✕ 401   38ms
 *
 * Cách dùng: import và gọi trong axios interceptors (xem lib/axios.ts).
 */

const isDev = import.meta.env.DEV;

// ── Colors (One Dark palette — đọc tốt trên cả light/dark devtools) ──
const C = {
  GET:    '#61afef',
  POST:   '#98c379',
  PUT:    '#e5c07b',
  PATCH:  '#c678dd',
  DELETE: '#e06c75',
  fast:   '#98c379',   // < 300ms
  medium: '#e5c07b',   // 300–1000ms
  slow:   '#e06c75',   // > 1000ms
  muted:  '#5c6370',
} as const;

// ── Helpers ───────────────────────────────────────────────────

function methodColor(method: string): string {
  return C[method as keyof typeof C] ?? '#abb2bf';
}

function durationColor(ms: number): string {
  if (ms < 300) return C.fast;
  if (ms < 1000) return C.medium;
  return C.slow;
}

function fmt(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
}

/** Chỉ lấy path + search, bỏ origin — cho log gọn hơn */
function shortUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname + u.search;
  } catch {
    return url;
  }
}

// ── Public API ────────────────────────────────────────────────

export interface ApiLogEntry {
  method: string;
  url: string;
  /** ms — tính từ lúc request được gửi */
  duration: number;
  status?: number;
  /** Request params (query string) */
  params?: unknown;
  /** Request body */
  body?: unknown;
  /** Response data (raw từ axios, chưa unwrap) */
  data?: unknown;
  /** Error message nếu có */
  errorMessage?: string;
}

/**
 * Log một API response (success hoặc error).
 *
 * - Dùng `console.groupCollapsed` → click để xem chi tiết, không spam console.
 * - Màu duration: xanh < 300ms, vàng < 1s, đỏ ≥ 1s.
 */
export function logApiCall(entry: ApiLogEntry): void {
  if (!isDev) return;

  const method = entry.method.toUpperCase();
  const path   = shortUrl(entry.url);
  const mc     = methodColor(method);
  const dc     = durationColor(entry.duration);
  const dur    = fmt(entry.duration);

  const isError = entry.status === undefined || entry.status >= 400;
  const statusText = entry.status !== undefined
    ? `${isError ? '✕' : '✓'} ${entry.status}`
    : '✕ ERR';

  // Dùng group thay groupCollapsed khi lỗi để nổi bật hơn
  const group = isError ? console.group : console.groupCollapsed;

  group(
    `%c ${method} %c ${path}  %c${statusText}  %c${dur}`,
    // method badge
    `background:${mc};color:#282c34;font-weight:bold;padding:1px 5px;border-radius:3px;font-size:11px`,
    // path
    'color:#abb2bf;font-size:12px',
    // status
    isError
      ? 'color:#e06c75;font-weight:bold;font-size:12px'
      : 'color:#98c379;font-weight:bold;font-size:12px',
    // duration
    `color:${dc};font-style:italic;font-size:12px`,
  );

  if (entry.params)       console.log('%cparams ', `color:${C.muted}`, entry.params);
  if (entry.body)         console.log('%cbody   ', `color:${C.muted}`, entry.body);
  if (entry.data !== undefined) console.log('%cdata   ', `color:${C.muted}`, entry.data);
  if (entry.errorMessage) console.error(entry.errorMessage);

  console.groupEnd();
}
