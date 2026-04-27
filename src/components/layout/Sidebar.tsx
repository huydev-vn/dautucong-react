import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Database,
  HardHat,
  MapPin,
  Building2,
  Activity,
  CheckSquare,
  Shield,
  BarChart3,
  UserCog,
  ChevronDown,
  Layers,
  User,
  FolderOpen,
  Landmark,
  CalendarDays,
  Banknote,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui.store';
import { useAuth } from '@/features/auth';

// ── Types ──────────────────────────────────────────────────────
interface NavLeaf {
  kind: 'leaf';
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavParent {
  kind: 'parent';
  id: string;
  label: string;
  icon: React.ElementType;
  children: Array<{ label: string; href: string; icon: React.ElementType }>;
}

type NavEntry = NavLeaf | NavParent;

// ── Nav config ─────────────────────────────────────────────────
const NAV: NavEntry[] = [
  { kind: 'leaf', label: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
  {
    kind: 'parent',
    id: 'danh-muc',
    label: 'Quản lý danh mục',
    icon: Database,
    children: [
      { label: 'Danh mục nhà thầu',    href: '/danh-muc/nha-thau',        icon: HardHat   },
      { label: 'Danh mục địa bàn',      href: '/danh-muc/dia-ban',          icon: MapPin    },
      { label: 'Danh mục dự án đầu tư', href: '/danh-muc/du-an-dau-tu',    icon: Building2 },
      { label: 'Nhà đầu tư & TCKT',     href: '/danh-muc/nha-dau-tu-tckt', icon: Landmark  },
    ],
  },
  {
    kind: 'parent',
    id: 'thong-tin-du-an',
    label: 'Quản lý thông tin dự án',
    icon: FolderOpen,
    children: [
      { label: 'Danh sách dự án', href: '/du-an',        icon: Building2    },
      { label: 'Kế hoạch vốn',   href: '/ke-hoach-von', icon: CalendarDays },
      { label: 'Giải ngân',      href: '/giai-ngan',    icon: Banknote     },
      { label: 'Hợp đồng',       href: '/hop-dong',     icon: FileText     },
    ],
  },
  { kind: 'leaf', label: 'Quản lý tiến độ thực hiện', href: '/tien-do-thuc-hien',  icon: Activity    },
  { kind: 'leaf', label: 'Kết quả thực hiện dự án',   href: '/ket-qua-du-an',      icon: CheckSquare },
  { kind: 'leaf', label: 'Quản lý thanh tra, KT',     href: '/thanh-tra-kiem-tra', icon: Shield      },
  { kind: 'leaf', label: 'Báo cáo',                   href: '/bao-cao',            icon: BarChart3   },
];

const BOTTOM_NAV: NavLeaf[] = [
  { kind: 'leaf', label: 'Người dùng', href: '/nguoi-dung', icon: UserCog },
];

// ── Helpers ────────────────────────────────────────────────────
function getInitialOpen(pathname: string): Set<string> {
  const open = new Set<string>();
  NAV.forEach((e) => {
    if (e.kind === 'parent' && e.children.some((c) => pathname.startsWith(c.href))) {
      open.add(e.id);
    }
  });
  return open;
}

// ── Component ──────────────────────────────────────────────────
export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggle    = useUIStore((s) => s.toggleSidebar);
  const { user } = useAuth();
  const location = useLocation();

  const [openGroups, setOpenGroups] = useState<Set<string>>(() =>
    getInitialOpen(location.pathname),
  );

  const toggleGroup = (id: string) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });

  function LeafItem({ item }: { item: NavLeaf }) {
    return (
      <NavLink
        to={item.href}
        title={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          cn(
            'flex items-center rounded-lg text-[13px] font-medium transition-all duration-150',
            collapsed ? 'h-10 w-10 mx-auto justify-center' : 'h-9 gap-3 px-3',
            isActive
              ? 'bg-white/20 text-white font-semibold'
              : 'text-white/75 hover:bg-white/10 hover:text-white',
          )
        }
      >
        {({ isActive }) => (
          <>
            <item.icon size={16} className={cn('shrink-0', isActive ? 'text-white' : 'text-white/65')} />
            {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
            {!collapsed && isActive && (
              <span className="ml-auto size-1.5 shrink-0 rounded-full bg-sky-300" />
            )}
          </>
        )}
      </NavLink>
    );
  }

  return (
    <aside
      data-tour="sidebar"
      className={cn(
        'relative flex h-full flex-col select-none transition-all duration-300',
        'bg-[#1a3c6e]',
        collapsed ? 'w-[4.5rem]' : 'w-64',
      )}
    >
      {/* ── Logo ── */}
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-white/[0.12] px-3',
          collapsed ? 'justify-center' : 'gap-3',
        )}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
          <Layers size={18} className="text-sky-200" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-[17px] font-extrabold text-white leading-snug truncate tracking-tight uppercase">
              Đầu tư Công
            </p>
            {/* <p className="text-[11px] text-sky-200/80 leading-tight">Sở Tài Chính Bắc Ninh</p> */}
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 space-y-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV.map((entry) => {
          if (entry.kind === 'leaf') {
            return <LeafItem key={entry.href} item={entry} />;
          }

          const isAnyChildActive = entry.children.some((c) =>
            location.pathname.startsWith(c.href),
          );
          const isOpen = !collapsed && openGroups.has(entry.id);

          return (
            <div key={entry.id}>
              <button
                onClick={() => !collapsed && toggleGroup(entry.id)}
                title={collapsed ? entry.label : undefined}
                className={cn(
                  'w-full flex items-center rounded-lg text-[13px] font-medium transition-all duration-150',
                  collapsed ? 'h-10 w-10 mx-auto justify-center' : 'h-9 gap-3 px-3',
                  isAnyChildActive
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-white/75 hover:bg-white/10 hover:text-white',
                )}
              >
                <entry.icon size={16} className={cn('shrink-0', isAnyChildActive ? 'text-white' : 'text-white/65')} />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate text-left">{entry.label}</span>
                    <ChevronDown
                      size={13}
                      className={cn(
                        'shrink-0 transition-transform duration-200',
                        isOpen && 'rotate-180',
                      )}
                    />
                  </>
                )}
              </button>

              {isOpen && (
                <ul className="mt-0.5 ml-3 space-y-0.5 border-l border-sky-400/30 pl-3">
                  {entry.children.map((child) => (
                    <li key={child.href}>
                      <NavLink
                        to={child.href}
                        className={({ isActive }) =>
                          cn(
                            'flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[12px] font-medium transition-all',
                            isActive
                              ? 'bg-white/20 text-white font-semibold'
                              : 'text-white/60 hover:bg-white/10 hover:text-white',
                          )
                        }
                      >
                        <child.icon size={13} className="shrink-0 opacity-75" />
                        <span className="truncate">{child.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}

        <div className="my-2 mx-1 h-px bg-white/[0.10]" />

        {BOTTOM_NAV.map((item) => (
          <LeafItem key={item.href} item={item} />
        ))}
      </nav>

      {/* ── Nút thu gọn ── */}
      <div className={`shrink-0 border-t border-white/[0.10] px-2 py-2`}>
        <button
          data-tour="sidebar-collapse"
          onClick={toggle}
          title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          className={`flex w-full items-center rounded-lg h-9 text-[12px] font-medium text-white/55 hover:bg-white/10 hover:text-white transition-all ${
            collapsed ? 'justify-center' : 'gap-2.5 px-3'
          }`}
        >
          {collapsed
            ? <PanelLeftOpen  size={15} className="shrink-0" />
            : <><PanelLeftClose size={15} className="shrink-0" /><span>Thu gọn sidebar</span></>}
        </button>
      </div>

      {/* ── Người dùng ── */}
      {user && (
        <div
          className={cn(
            'shrink-0 border-t border-white/[0.12] px-3 py-3',
            collapsed && 'flex justify-center',
          )}
        >
          {collapsed ? (
            <div
              className="flex size-9 items-center justify-center rounded-lg bg-white/15 text-sky-200 ring-1 ring-white/20"
              title={user.TenDaiDien || user.TenDangNhap}
            >
              <User size={15} />
            </div>
          ) : (
            <div className="flex items-center gap-2.5 rounded-lg bg-white/[0.08] px-2.5 py-2 ring-1 ring-white/[0.12]">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-400/25 text-sky-200 ring-1 ring-sky-300/20">
                <User size={14} />
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-white truncate leading-tight">
                  {user.TenDaiDien || '—'}
                </p>
                <p className="text-[10px] text-sky-200/70 truncate leading-tight">
                  {user.TenDangNhap}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}