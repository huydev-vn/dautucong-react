import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  Banknote,
  FileText,
  HardHat,
  BarChart3,
  UserCog,
  Database,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui.store';
import { useAuth } from '@/features/auth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Tổng quan',          href: '/dashboard',    icon: LayoutDashboard },
  { label: 'Dự án',              href: '/du-an',        icon: Building2 },
  { label: 'Kế hoạch vốn',       href: '/ke-hoach-von', icon: CalendarDays },
  { label: 'Giải ngân',          href: '/giai-ngan',    icon: Banknote },
  { label: 'Hợp đồng',           href: '/hop-dong',     icon: FileText },
  { label: 'Nhà thầu',           href: '/nha-thau',     icon: HardHat },
  { label: 'Báo cáo',            href: '/bao-cao',      icon: BarChart3 },
  { label: 'Người dùng',         href: '/nguoi-dung',   icon: UserCog,   roles: ['admin'] },
  { label: 'Danh mục',           href: '/danh-muc',     icon: Database,  roles: ['admin', 'manager'] },
];

export function Sidebar() {
  const { collapsed, toggle } = useUIStore((s) => ({
    collapsed: s.sidebarCollapsed,
    toggle: s.toggleSidebar,
  }));
  const { user } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <aside
      className={cn(
        'relative flex h-full flex-col border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className={cn('flex h-16 items-center border-b px-4', collapsed && 'justify-center')}>
        {collapsed ? (
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
            ĐTC
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 min-w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
              ĐTC
            </div>
            <div>
              <p className="text-sm font-semibold leading-none text-foreground">Đầu tư Công</p>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">Quản lý toàn diện</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {visibleItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground',
                collapsed && 'justify-center px-2',
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t p-2">
        <button
          onClick={toggle}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground',
            'hover:bg-accent hover:text-accent-foreground transition-colors',
            collapsed && 'justify-center px-2',
          )}
          title={collapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          {collapsed ? <ChevronRight size={16} /> : (
            <>
              <ChevronLeft size={16} />
              <span>Thu gọn</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
