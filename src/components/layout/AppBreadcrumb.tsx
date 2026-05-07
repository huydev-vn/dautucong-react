import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

/**
 * Map URL segment → nhãn breadcrumb tiếng Việt.
 * Tổ chức theo nhóm nghiệp vụ để dễ bảo trì khi thêm route mới.
 */
const SEGMENT_LABELS: Record<string, string> = {
  // ── Trang chủ ────────────────────────────────────────────────
  dashboard: 'Bảng điều khiển',

  // ── Danh mục dùng chung ──────────────────────────────────────
  'qldm':        'Danh mục',
  'dmphanloailuatdauthau':'Phân loại luật đấu thầu',
  'dia-ban':         'Địa bàn',
  'du-an-dau-tu':    'Dự án đầu tư',
  'nha-dau-tu-tckt': 'Nhà đầu tư TCKT',

  // ── Nghiệp vụ chính ──────────────────────────────────────────
  'du-an':              'Dự án',
  'ke-hoach-von':       'Kế hoạch vốn',
  'giai-ngan':          'Giải ngân',
  'hop-dong':           'Hợp đồng',
  'tien-do-thuc-hien':  'Tiến độ thực hiện',
  'ket-qua-du-an':      'Kết quả dự án',
  'thanh-tra-kiem-tra': 'Thanh tra, kiểm tra',
  'bao-cao':            'Báo cáo',

  // ── Quản trị hệ thống (/qtht/*) ──────────────────────────────
  'qtht':       'Quản trị hệ thống',
  'nguoidung': 'Quản lý người dùng',
  'chucnang':  'Quản lý chức năng',
  'phanquyen':  'Phân quyền',
  'nha-thau-ql':'Quản lý nhà thầu',
};

const DYNAMIC_SEG = /^(\d+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

/**
 * Các segment không có trang riêng — hiển thị là text thuần, không thành link
 * để tránh 404 khi người dùng click.
 */
const NON_NAVIGABLE_SEGS = new Set(['qtht', 'qldm']);

interface Crumb {
  label: string;
  path: string;
  isLast: boolean;
  navigable: boolean;
}

function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean);
  let acc = '';
  return segments.map((seg, i) => {
    acc += '/' + seg;
    const label = DYNAMIC_SEG.test(seg) ? 'Chi tiết' : (SEGMENT_LABELS[seg] ?? seg);
    return {
      label,
      path: acc,
      isLast: i === segments.length - 1,
      navigable: !NON_NAVIGABLE_SEGS.has(seg),
    };
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
    <div className="flex h-8 shrink-0 items-center border-b border-[#1a3c6e]/8 bg-[#f8fafc] px-6">
      <Breadcrumb>
        <BreadcrumbList className="flex-nowrap gap-0 text-[12px]">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                to="/dashboard"
                title="Trang chủ"
                className="flex items-center text-[#1a3c6e]/40 transition-colors hover:text-[#1a3c6e]"
              >
                <Home size={13} />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {crumbs.map((crumb) => (
            <React.Fragment key={crumb.path}>
              <BreadcrumbSeparator className="mx-0.5 text-gray-300" />
              <BreadcrumbItem>
                {crumb.isLast ? (
                  <BreadcrumbPage className="text-[12px] font-semibold text-[#1a3c6e]">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : crumb.navigable ? (
                  <BreadcrumbLink asChild>
                    <Link
                      to={crumb.path}
                      className="text-[12px] text-gray-400 transition-colors hover:text-[#1a3c6e]"
                    >
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <span className="text-[12px] text-gray-400 cursor-default select-none">
                    {crumb.label}
                  </span>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
