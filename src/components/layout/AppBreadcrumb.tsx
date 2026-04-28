import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/** Map path segment → nhãn tiếng Việt */
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Bảng điều khiển',
  'danh-muc': 'Danh mục',
  'nha-thau': 'Nhà thầu',
  'dia-ban': 'Địa bàn',
  'du-an-dau-tu': 'Dự án đầu tư',
  'nha-dau-tu-tckt': 'Nhà đầu tư TCKT',
  'du-an': 'Dự án',
  'ke-hoach-von': 'Kế hoạch vốn',
  'giai-ngan': 'Giải ngân',
  'hop-dong': 'Hợp đồng',
  'tien-do-thuc-hien': 'Tiến độ thực hiện',
  'ket-qua-du-an': 'Kết quả dự án',
  'thanh-tra-kiem-tra': 'Thanh tra, kiểm tra',
  'bao-cao': 'Báo cáo',
  'nguoi-dung': 'Người dùng',
};

const DYNAMIC_SEG = /^(\d+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

interface Crumb {
  label: string;
  path: string;
  isLast: boolean;
}

function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean);
  let acc = '';
  return segments.map((seg, i) => {
    acc += '/' + seg;
    const label = DYNAMIC_SEG.test(seg) ? 'Chi tiết' : (SEGMENT_LABELS[seg] ?? seg);
    return { label, path: acc, isLast: i === segments.length - 1 };
  });
}

/**
 * Thanh breadcrumb mỏng hiển thị dưới header.
 * Chỉ render khi có ≥ 2 cấp đường dẫn (ví dụ /danh-muc/nha-thau).
 */
export function AppBreadcrumb() {
  const { pathname } = useLocation();
  const crumbs = buildCrumbs(pathname);

  if (crumbs.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex h-8 shrink-0 items-center border-b border-[#1a3c6e]/8 bg-[#f8fafc] px-6"
    >
      <Link
        to="/dashboard"
        title="Trang chủ"
        className="flex items-center text-[#1a3c6e]/35 transition-colors hover:text-[#1a3c6e]"
      >
        <Home size={13} />
      </Link>

      {crumbs.map((crumb) => (
        <span key={crumb.path} className="flex items-center">
          <ChevronRight size={13} className="mx-1.5 text-gray-300" />
          {crumb.isLast ? (
            <span className="text-[12px] font-semibold text-[#1a3c6e]">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.path}
              className="text-[12px] text-gray-400 transition-colors hover:text-[#1a3c6e]"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
