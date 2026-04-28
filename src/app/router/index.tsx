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
const NguoiDungListPage = lazy(() =>
  import('@/features/nguoi-dung').then((m) => ({ default: m.NguoiDungListPage })),
);
const DanhMucPage = lazy(() =>
  import('@/features/danh-muc/pages/DanhMucPage').then((m) => ({ default: m.DanhMucPage })),
);
const NhaThauPage = lazy(() =>
  import('@/features/danh-muc/pages/NhaThauPage').then((m) => ({ default: m.NhaThauPage })),
);

// ── Router definition ─────────────────────────────────────
export const router = createBrowserRouter([
  // Auth routes (không yêu cầu đăng nhập)
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: withSuspense(LoginPage, 'auth'),
      },
    ],
  },

  // Protected routes (yêu cầu đăng nhập)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: withSuspense(DashboardPage) },

          // Danh mục
          { path: '/danh-muc', element: withSuspense(DanhMucPage) },
          { path: '/danh-muc/nha-thau', element: withSuspense(NhaThauPage) },
          { path: '/danh-muc/dia-ban', element: <PlaceholderPage title="Danh mục địa bàn" /> },
          { path: '/danh-muc/du-an-dau-tu', element: <PlaceholderPage title="Danh mục dự án đầu tư" /> },
          { path: '/danh-muc/nha-dau-tu-tckt', element: <PlaceholderPage title="Nhà đầu tư & Tổ chức kinh tế" /> },

          // Thông tin dự án
          { path: '/du-an', element: withSuspense(DuAnListPage) },
          { path: '/du-an/:id', element: withSuspense(DuAnDetailPage) },
          { path: '/ke-hoach-von', element: withSuspense(KeHoachVonListPage) },
          { path: '/giai-ngan', element: withSuspense(GiaiNganListPage) },
          { path: '/hop-dong', element: withSuspense(HopDongListPage) },
          { path: '/hop-dong/:id', element: withSuspense(HopDongDetailPage) },

          // Nghiệp vụ khác
          { path: '/tien-do-thuc-hien', element: <PlaceholderPage title="Quản lý tiến độ thực hiện" /> },
          { path: '/ket-qua-du-an', element: <PlaceholderPage title="Kết quả thực hiện dự án" /> },
          { path: '/thanh-tra-kiem-tra', element: <PlaceholderPage title="Quản lý thanh tra, kiểm tra" /> },
          { path: '/bao-cao', element: withSuspense(BaoCaoPage) },

          // Quản trị
          { path: '/nha-thau', element: withSuspense(NhaThauListPage) },
          { path: '/nguoi-dung', element: withSuspense(NguoiDungListPage) },
        ],
      },
    ],
  },

  // 404
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
