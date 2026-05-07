import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { withSuspense } from './PageLoader';
import { PlaceholderPage } from '@/components/shared/PlaceholderPage';
import { NotFoundPage } from '@/components/shared/NotFoundPage';
import { PAGE_REGISTRY } from './page-registry';

// Auth pages
const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
);

// Router definition
// Routes duoc generate tu dong tu PAGE_REGISTRY.
// De them page moi: chi can them entry vao src/app/router/page-registry.ts
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
          // Generate tu PAGE_REGISTRY - xem page-registry.ts de them/sua route
          ...PAGE_REGISTRY.map(({ path, component: Page, title }) => ({
            path,
            element: Page
              ? withSuspense(Page)
              : <PlaceholderPage title={title ?? path} />,
          })),
        ],
      },
    ],
  },

  // 404
  { path: '*', element: <NotFoundPage /> },
]);
