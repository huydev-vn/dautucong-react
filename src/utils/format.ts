import { format as dateFnsFormat } from 'date-fns';
import { vi } from 'date-fns/locale';

// ── Tiền tệ ─────────────────────────────────────────────────
const VND = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const NUMBER_FORMAT = new Intl.NumberFormat('vi-VN');

/** Định dạng số tiền VNĐ: 1.000.000 đ */
export function formatCurrency(value: number): string {
  return VND.format(value);
}

/** Định dạng tỷ đồng: 1,5 tỷ */
export function formatTyDong(value: number): string {
  const ty = value / 1_000_000_000;
  return `${NUMBER_FORMAT.format(+ty.toFixed(2))} tỷ đồng`;
}

/** Định dạng triệu đồng */
export function formatTrieuDong(value: number): string {
  const trieu = value / 1_000_000;
  return `${NUMBER_FORMAT.format(+trieu.toFixed(1))} triệu đồng`;
}

/** Tự chọn đơn vị phù hợp theo giá trị */
export function formatMoney(value: number): string {
  if (value >= 1_000_000_000) return formatTyDong(value);
  if (value >= 1_000_000) return formatTrieuDong(value);
  return formatCurrency(value);
}

// ── Ngày tháng ───────────────────────────────────────────────
/** dd/MM/yyyy */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  try {
    return dateFnsFormat(new Date(date), 'dd/MM/yyyy', { locale: vi });
  } catch {
    return '—';
  }
}

/** dd/MM/yyyy HH:mm */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  try {
    return dateFnsFormat(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi });
  } catch {
    return '—';
  }
}

// ── Tỷ lệ phần trăm ─────────────────────────────────────────
/** Định dạng % với 1 chữ số thập phân */
export function formatPercent(value: number): string {
  return `${(+value.toFixed(1)).toLocaleString('vi-VN')}%`;
}

// ── Số ──────────────────────────────────────────────────────
export function formatNumber(value: number): string {
  return NUMBER_FORMAT.format(value);
}
