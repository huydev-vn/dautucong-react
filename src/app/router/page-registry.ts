/**
 * PAGE REGISTRY — single source of truth cho URL → component mapping.
 *
 * Thêm page mới: chỉ cần thêm 1 entry ở đây.
 * Router tự generate từ registry này → không cần động vào router/index.tsx.
 *
 * Hai loại entry:
 *  - component: lazy component thực sự
 *  - title:     PlaceholderPage (chưa implement, hiển thị placeholder)
 *
 * Lưu ý: URL trong registry phải khớp CHÍNH XÁC với Url từ backend menu
 * sau khi đã normalize (leading /, trimmed). Xem auth.store.ts normalizeMenu().
 */
import { lazy } from 'react';
import type React from 'react';

type LazyPage = React.LazyExoticComponent<React.ComponentType>;

export interface PageEntry {
  /** Đường dẫn khớp với menu Url từ backend (sau normalize) */
  path: string;
  /** Lazy component — nếu undefined thì render PlaceholderPage với title */
  component?: LazyPage;
  /** Hiển thị PlaceholderPage khi chưa implement */
  title?: string;
}

export const PAGE_REGISTRY: PageEntry[] = [
  // ── Dashboard ──────────────────────────────────────────────────────────────
  {
    path: '/dashboard',
    component: lazy(() => import('@/features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))),
  },

  // ── Quản trị hệ thống (/qtht) ──────────────────────────────────────────────
  {
    path: '/qtht/chucnang',
    component: lazy(() => import('@/features/quan-tri/chuc-nang/pages/ChucNangListPage').then((m) => ({ default: m.ChucNangListPage }))),
  },
  {
    path: '/qtht/nguoidung',
    component: lazy(() => import('@/features/quan-tri/nguoi-dung/pages/NguoiDungListPage').then((m) => ({ default: m.NguoiDungListPage }))),
  },
  {
    path: '/qtht/phanquyen',
    component: lazy(() => import('@/features/quan-tri/phan-quyen/pages/PhanQuyenPage').then((m) => ({ default: m.PhanQuyenPage }))),
  },
  {
    path: '/qtht/tacvu',
    component: lazy(() => import('@/features/quan-tri/tac-vu/pages/TacVuListPage').then((m) => ({ default: m.TacVuListPage }))),
  },
  {
    path: '/qtht/nhomnguoidung',
    component: lazy(() => import('@/features/quan-tri/nhom-nguoi-dung/pages/NhomNguoiDungListPage').then((m) => ({ default: m.NhomNguoiDungListPage }))),
  },
  { path: '/qtht/phanquyenthdv',  title: 'Phân quyền tổng hợp đơn vị' },

  // ── Quản lý danh mục (/qldm) ────────────────────────────────────────────────
  {
    path: '/qldm',
    component: lazy(() =>
      import('@/features/danh-muc/pages/DanhMucPage').then((m) => ({ default: m.DanhMucPage })),
    ),
  },
  {
    path: '/qldm/dmnhathau',
    component: lazy(() =>
      import('@/features/danh-muc/pages/NhaThauPage').then((m) => ({ default: m.NhaThauPage })),
    ),
  },
  { path: '/qldm/dmnganhlinhvucdautu',   title: 'Danh mục ngành / lĩnh vực đầu tư' },
  { path: '/qldm/dmdiaban',              title: 'Danh mục địa bàn' },
  { path: '/qldm/dmduandautu',           title: 'Danh mục dự án đầu tư' },
  { path: '/qldm/dmchudautu',            title: 'Danh mục chủ đầu tư' },
  { path: '/qldm/dmloaigoithau',         title: 'Danh mục loại gói thầu' },
  { path: '/qldm/danhmuchtlcnt',         title: 'Danh mục hình thức lựa chọn nhà thầu' },
  { path: '/qldm/dmdonvi',               title: 'Danh mục đơn vị' },
  { path: '/qldm/dmcanbolanhdao',        title: 'Danh mục cán bộ / lãnh đạo' },
  { path: '/qldm/dmgoithau',             title: 'Danh mục gói thầu' },
  { path: '/qldm/dmnhombaocao',          title: 'Danh mục nhóm báo cáo' },
  { path: '/qldm/dmchung',               title: 'Danh mục chung' },
  { path: '/qldm/dmctmtqg',             title: 'Danh mục chương trình mục tiêu quốc gia' },
  { path: '/qldm/dmphanloailuatdauthau', title: 'Danh mục phân loại luật đấu thầu' },

  // ── Quản lý các gói thầu thực hiện đầu tư (/QLCGTTHDT) ────────────────────
  { path: '/QLCGTTHDT/quanlygoithau',   title: 'Quản lý gói thầu' },
  { path: '/QLCGTTHDT/quanlydauthau',   title: 'Quản lý đấu thầu' },
  {
    path: '/QLCGTTHDT/quanlyhopdonggoithau',
    component: lazy(() =>
      import('@/features/hop-dong/pages/HopDongListPage').then((m) => ({ default: m.HopDongListPage })),
    ),
  },
  {
    // Detail page — có :id param, không xuất hiện trong menu
    path: '/QLCGTTHDT/quanlyhopdonggoithau/:id',
    component: lazy(() =>
      import('@/features/hop-dong/pages/HopDongDetailPage').then((m) => ({ default: m.HopDongDetailPage })),
    ),
  },
  { path: '/QLCGTTHDT/quanlytiendohopdong',      title: 'Quản lý tiến độ thi công' },
  { path: '/QLCGTTHDT/doichieutinhhinhgiaingan',  title: 'Đối chiếu tình hình giải ngân với kho bạc' },
  { path: '/QLCGTTHDT/noptrangansachnhanuoc',     title: 'Nộp trả ngân sách nhà nước' },
  { path: '/QLCGTTHDT/quanlyvanbankiennghi',      title: 'Quản lý văn bản kiến nghị và thanh tra' },

  // ── Quản lý thông tin dự án (/qlttda) ──────────────────────────────────────
  { path: '/qlttda/quanlydexuatduan',           title: 'Quản lý đề xuất dự án' },
  { path: '/qlttda/quanlyhsxinykienvathamdinh', title: 'Quản lý hồ sơ xin ý kiến và thẩm định' },
  {
    path: '/qlttda/quanlythongtinduan',
    component: lazy(() =>
      import('@/features/du-an/pages/DuAnListPage').then((m) => ({ default: m.DuAnListPage })),
    ),
  },
  {
    // Detail page — có :id param
    path: '/qlttda/quanlythongtinduan/:id',
    component: lazy(() =>
      import('@/features/du-an/pages/DuAnDetailPage').then((m) => ({ default: m.DuAnDetailPage })),
    ),
  },
  { path: '/qlttda/thongbaopheduyetvataikhoan', title: 'TB phê duyệt và tài khoản hệ thống CĐT' },
  { path: '/qlttda/quanlythongtinkyquy',        title: 'Quản lý thông tin ký quỹ' },
  {
    path: '/qlttda/qlttthanhtoan',
    component: lazy(() =>
      import('@/features/giai-ngan/pages/GiaiNganListPage').then((m) => ({ default: m.GiaiNganListPage })),
    ),
  },
  { path: '/qlttda/dieuchinhtongmucdautu', title: 'Điều chỉnh tổng mức đầu tư' },

  // ── Kế hoạch phân bổ vốn (/LKPBV) ─────────────────────────────────────────
  {
    path: '/LKPBV/quyet-dinh-phe-duyet-ke-hoach-von-trung-han',
    title: 'Quản lý kế hoạch vốn trung hạn',
  },
  {
    path: '/LKPBV/quanlykehoachvonnam',
    component: lazy(() =>
      import('@/features/ke-hoach-von/pages/KeHoachVonListPage').then((m) => ({ default: m.KeHoachVonListPage })),
    ),
  },

  // ── Quản lý kết quả thực hiện dự án (/qlkqth) ─────────────────────────────
  { path: '/qlkqth/quanlyketquathuchienduan', title: 'Quản lý kết quả thực hiện dự án' },
  { path: '/qlkqth/quanlybaocaoguiUB',        title: 'Quản lý báo cáo gửi UB' },

  // ── Giám sát dự án (/gsda) ─────────────────────────────────────────────────
  { path: '/gsda/caygiamsatduan', title: 'Cây giám sát dự án' },

  // ── Báo cáo (/bc) ──────────────────────────────────────────────────────────
  {
    path: '/bc/baocao',
    component: lazy(() =>
      import('@/features/bao-cao/pages/BaoCaoPage').then((m) => ({ default: m.BaoCaoPage })),
    ),
  },

  // ── Không có trong menu — truy cập trực tiếp bằng URL ──────────────────────
  {
    path: '/nha-thau',
    component: lazy(() =>
      import('@/features/nha-thau/pages/NhaThauListPage').then((m) => ({ default: m.NhaThauListPage })),
    ),
  },
];
