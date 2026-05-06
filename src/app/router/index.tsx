import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { withSuspense } from './PageLoader';
import { PlaceholderPage } from '@/components/shared/PlaceholderPage';
import { NotFoundPage } from '@/components/shared/NotFoundPage';

// ── Auth pages ────────────────────────────────────────────
const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
);

// ── App pages (lazy) ──────────────────────────────────────
const DashboardPage = lazy(() =>
  import('@/features/dashboard').then((m) => ({ default: m.DashboardPage })),
);

// Quản trị hệ thống (/qtht)
const ChucNangListPage = lazy(() =>
  import('@/features/quan-tri').then((m) => ({ default: m.ChucNangListPage })),
);
const NguoiDungListPage = lazy(() =>
  import('@/features/quan-tri').then((m) => ({ default: m.NguoiDungListPage })),
);
const PhanQuyenPage = lazy(() =>
  import('@/features/quan-tri/phan-quyen/pages/PhanQuyenPage').then((m) => ({ default: m.PhanQuyenPage })),
);

// Danh mục (/qldm)
const NhaThauPage = lazy(() =>
  import('@/features/danh-muc/pages/NhaThauPage').then((m) => ({ default: m.NhaThauPage })),
);
const DanhMucPage = lazy(() =>
  import('@/features/danh-muc/pages/DanhMucPage').then((m) => ({ default: m.DanhMucPage })),
);

// Nghiệp vụ
const DuAnListPage = lazy(() =>
  import('@/features/du-an').then((m) => ({ default: m.DuAnListPage })),
);
const DuAnDetailPage = lazy(() =>
  import('@/features/du-an').then((m) => ({ default: m.DuAnDetailPage })),
);
const KeHoachVonListPage = lazy(() =>
  import('@/features/ke-hoach-von').then((m) => ({ default: m.KeHoachVonListPage })),
);
const GiaiNganListPage = lazy(() =>
  import('@/features/giai-ngan').then((m) => ({ default: m.GiaiNganListPage })),
);
const HopDongListPage = lazy(() =>
  import('@/features/hop-dong').then((m) => ({ default: m.HopDongListPage })),
);
const HopDongDetailPage = lazy(() =>
  import('@/features/hop-dong').then((m) => ({ default: m.HopDongDetailPage })),
);
const NhaThauListPage = lazy(() =>
  import('@/features/nha-thau').then((m) => ({ default: m.NhaThauListPage })),
);
const BaoCaoPage = lazy(() =>
  import('@/features/bao-cao').then((m) => ({ default: m.BaoCaoPage })),
);

// ── Router definition ─────────────────────────────────────
export const router = createBrowserRouter([
  // Auth routes
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: withSuspense(LoginPage, 'auth') },
    ],
  },

  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: withSuspense(DashboardPage) },

          // ── Quản trị hệ thống (/qtht) ──────────────────────────
          { path: '/qtht/chucnang',     element: withSuspense(ChucNangListPage) },
          { path: '/qtht/nguoidung',    element: withSuspense(NguoiDungListPage) },
          { path: '/qtht/phanquyen',    element: withSuspense(PhanQuyenPage) },
          { path: '/qtht/nhomnguoidung', element: <PlaceholderPage title="Quản lý nhóm người dùng" /> },

          // ── Quản lý danh mục (/qldm) ────────────────────────────
          { path: '/qldm',                        element: withSuspense(DanhMucPage) },
          { path: '/qldm/dmnhathau',              element: withSuspense(NhaThauPage) },
          { path: '/qldm/dmnganhlinhvucdautu',    element: <PlaceholderPage title="Danh mục ngành / lĩnh vực đầu tư" /> },
          { path: '/qldm/dmdiaban',               element: <PlaceholderPage title="Danh mục địa bàn" /> },
          { path: '/qldm/dmduandautu',            element: <PlaceholderPage title="Danh mục dự án đầu tư" /> },
          { path: '/qldm/dmchudautu',             element: <PlaceholderPage title="Danh mục chủ đầu tư" /> },
          { path: '/qldm/dmloaigoithau',          element: <PlaceholderPage title="Danh mục loại gói thầu" /> },
          { path: '/qldm/danhmuchtlcnt',          element: <PlaceholderPage title="Danh mục hình thức lựa chọn nhà thầu" /> },
          { path: '/qldm/dmdonvi',                element: <PlaceholderPage title="Danh mục đơn vị" /> },
          { path: '/qldm/dmcanbolanhdao',         element: <PlaceholderPage title="Danh mục cán bộ / lãnh đạo" /> },
          { path: '/qldm/dmgoithau',              element: <PlaceholderPage title="Danh mục gói thầu" /> },
          { path: '/qldm/dmnhombaocao',           element: <PlaceholderPage title="Danh mục nhóm báo cáo" /> },
          { path: '/qldm/dmchung',                element: <PlaceholderPage title="Danh mục chung" /> },
          { path: '/qldm/dmctmtqg',               element: <PlaceholderPage title="Danh mục chương trình mục tiêu quốc gia" /> },
          { path: '/qldm/dmphanloailuatdauthau',  element: <PlaceholderPage title="Danh mục phân loại luật đấu thầu" /> },

          // ── Quản lý các gói thầu thực hiện đầu tư (/QLCGTTHDT) ─
          { path: '/QLCGTTHDT/quanlygoithau',            element: <PlaceholderPage title="Quản lý gói thầu" /> },
          { path: '/QLCGTTHDT/quanlydauthau',            element: <PlaceholderPage title="Quản lý đấu thầu" /> },
          { path: '/QLCGTTHDT/quanlyhopdonggoithau',     element: withSuspense(HopDongListPage) },
          { path: '/QLCGTTHDT/quanlyhopdonggoithau/:id', element: withSuspense(HopDongDetailPage) },
          { path: '/QLCGTTHDT/quanlytiendohopdong',      element: <PlaceholderPage title="Quản lý tiến độ thi công" /> },
          { path: '/QLCGTTHDT/doichieutinhhinhgiaingan',  element: <PlaceholderPage title="Đối chiếu tình hình giải ngân với kho bạc" /> },
          { path: '/QLCGTTHDT/noptrangansachnhanuoc',    element: <PlaceholderPage title="Nộp trả ngân sách nhà nước" /> },
          { path: '/QLCGTTHDT/quanlyvanbankiennghi',     element: <PlaceholderPage title="Quản lý văn bản kiến nghị và thanh tra" /> },

          // ── Quản lý thông tin dự án (/qlttda) ──────────────────
          { path: '/qlttda/quanlydexuatduan',            element: <PlaceholderPage title="Quản lý đề xuất dự án" /> },
          { path: '/qlttda/quanlyhsxinykienvathamdinh',  element: <PlaceholderPage title="Quản lý hồ sơ xin ý kiến và thẩm định" /> },
          { path: '/qlttda/quanlythongtinduan',          element: withSuspense(DuAnListPage) },
          { path: '/qlttda/quanlythongtinduan/:id',      element: withSuspense(DuAnDetailPage) },
          { path: '/qlttda/thongbaopheduyetvataikhoan',  element: <PlaceholderPage title="TB phê duyệt và tài khoản hệ thống CĐT" /> },
          { path: '/qlttda/quanlythongtinkyquy',         element: <PlaceholderPage title="Quản lý thông tin ký quỹ" /> },
          { path: '/qlttda/qlttthanhtoan',               element: withSuspense(GiaiNganListPage) },
          { path: '/qlttda/dieuchinhtongmucdautu',       element: <PlaceholderPage title="Điều chỉnh tổng mức đầu tư" /> },

          // ── Kế hoạch phân bổ vốn (/LKPBV) ────────────────────
          { path: '/LKPBV/quyet-dinh-phe-duyet-ke-hoach-von-trung-han', element: <PlaceholderPage title="Quản lý kế hoạch vốn trung hạn" /> },
          { path: '/LKPBV/quanlykehoachvonnam',          element: withSuspense(KeHoachVonListPage) },

          // ── Quản lý kết quả thực hiện dự án (/qlkqth) ─────────
          { path: '/qlkqth/quanlyketquathuchienduan',    element: <PlaceholderPage title="Quản lý kết quả thực hiện dự án" /> },
          { path: '/qlkqth/quanlybaocaoguiUB',           element: <PlaceholderPage title="Quản lý báo cáo gửi UB" /> },

          // ── Giám sát dự án (/gsda) ─────────────────────────────
          { path: '/gsda/caygiamsatduan',               element: <PlaceholderPage title="Cây giám sát dự án" /> },

          // ── Báo cáo (/bc) ──────────────────────────────────────
          { path: '/bc/baocao',                         element: withSuspense(BaoCaoPage) },

          // ── Nghiệp vụ riêng (không có trong menu chính) ────────
          { path: '/nha-thau',                          element: withSuspense(NhaThauListPage) },
        ],
      },
    ],
  },

  // 404
  { path: '*', element: <NotFoundPage /> },
]);
