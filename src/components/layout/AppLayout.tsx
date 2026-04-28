import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { SidebarTrigger } from './SidebarTrigger';
import { Header } from './Header';
import { AppBreadcrumb } from './AppBreadcrumb';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar + edge toggle */}
      <div className="relative flex-none">
        <Sidebar />
        <SidebarTrigger />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <AppBreadcrumb />

        <main className="flex-1 overflow-y-auto p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
