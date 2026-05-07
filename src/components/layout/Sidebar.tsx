import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  ChevronDown,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { getIcon } from '@/lib/icon-registry';
import type { MenuItem } from '@/features/auth/types/auth.types';

// ── Helpers ────────────────────────────────────────────────────
function getInitialOpen(menu: MenuItem[], pathname: string): Set<string> {
  const open = new Set<string>();
  menu.forEach((item) => {
    if (
      item.Children.length > 0 &&
      item.Children.some((c) => c.Url && pathname.startsWith(c.Url))
    ) {
      open.add(String(item.Id));
    }
  });
  return open;
}

// ── LeafItem (outside Sidebar to prevent re-define on each render) ────────────
interface LeafItemProps {
  item: MenuItem;
  collapsed: boolean;
  onExpand: () => void;
}

function LeafItem({ item, collapsed, onExpand }: LeafItemProps) {
  const Icon = getIcon(item.Icon);
  return (
    <NavLink
      to={item.Url ?? '#'}
      title={collapsed ? item.Ten : undefined}
      onClick={collapsed ? onExpand : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center rounded-lg text-[13px] font-medium transition-all duration-150',
          collapsed ? 'h-10 w-10 mx-auto justify-center' : 'min-h-9 gap-3 px-3 py-1.5',
          isActive
            ? 'bg-white/20 text-white font-semibold'
            : 'text-white/75 hover:bg-white/10 hover:text-white',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={16} className={cn('shrink-0', isActive ? 'text-white' : 'text-white/65')} />
          {!collapsed && <span className="flex-1 leading-snug">{item.Ten}</span>}
          {!collapsed && isActive && (
            <span className="ml-auto size-1.5 shrink-0 rounded-full bg-sky-300" />
          )}
        </>
      )}
    </NavLink>
  );
}

// ── Component ──────────────────────────────────────────────────
export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggle    = useUIStore((s) => s.toggleSidebar);
  const menu      = useAuthStore((s) => s.menu);
  const location  = useLocation();

  const [openGroups, setOpenGroups] = useState<Set<string>>(() =>
    getInitialOpen(menu, location.pathname),
  );

  const toggleGroup = (id: string) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });

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

        {/* Dashboard — cố định ở đầu, không phụ thuộc backend menu */}
        <NavLink
          to="/dashboard"
          title={collapsed ? 'Tổng quan' : undefined}
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
              <LayoutDashboard
                size={16}
                className={cn('shrink-0', isActive ? 'text-white' : 'text-white/65')}
              />
              {!collapsed && <span className="flex-1 truncate">Tổng quan</span>}
              {!collapsed && isActive && (
                <span className="ml-auto size-1.5 shrink-0 rounded-full bg-sky-300" />
              )}
            </>
          )}
        </NavLink>

        {/* Dynamic menu từ backend */}
        {menu.map((item) => {
          const Icon = getIcon(item.Icon);
          const groupId = String(item.Id);

          if (item.Children.length === 0) {
            return (
              <LeafItem key={item.Id} item={item} collapsed={collapsed} onExpand={toggle} />
            );
          }

          const isAnyChildActive = item.Children.some(
            (c) => c.Url && location.pathname.startsWith(c.Url),
          );
          const isOpen = !collapsed && openGroups.has(groupId);

          return (
            <div key={item.Id}>
              <button
                onClick={() => {
                  if (collapsed) {
                    toggle();
                    setOpenGroups((prev) => { const next = new Set(prev); next.add(groupId); return next; });
                  } else {
                    toggleGroup(groupId);
                  }
                }}
                title={collapsed ? item.Ten : undefined}
                className={cn(
                  'w-full flex items-center rounded-lg text-[13px] font-medium transition-all duration-150',
                  collapsed ? 'h-10 w-10 mx-auto justify-center' : 'min-h-9 gap-3 px-3 py-1.5',
                  isAnyChildActive
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-white/75 hover:bg-white/10 hover:text-white',
                )}
              >
                <Icon
                  size={16}
                  className={cn('shrink-0', isAnyChildActive ? 'text-white' : 'text-white/65')}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 leading-snug text-left">{item.Ten}</span>
                    <ChevronDown
                      size={13}
                      className={cn(
                        'shrink-0 transition-transform duration-300 ease-in-out',
                        isOpen && 'rotate-180',
                      )}
                    />
                  </>
                )}
              </button>

              <div
                className={cn(
                  'overflow-hidden transition-all duration-300 ease-in-out',
                  isOpen ? 'max-h-[500px]' : 'max-h-0',
                )}
              >
                <ul className="mt-0.5 ml-3 space-y-0.5 border-l border-sky-400/30 pl-3 pb-0.5">
                  {item.Children.map((child) => {
                    const ChildIcon = getIcon(child.Icon);
                    return (
                      <li key={child.Id}>
                        <NavLink
                          to={child.Url ?? '#'}
                          className={({ isActive }) =>
                            cn(
                              'flex min-h-8 items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-all',
                              isActive
                                ? 'bg-white/20 text-white font-semibold'
                                : 'text-white/60 hover:bg-white/10 hover:text-white',
                            )
                          }
                        >
                          <ChildIcon size={13} className="shrink-0 opacity-75" />
                          <span className="leading-snug">{child.Ten}</span>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── Nút thu gọn ── */}
      <div className="shrink-0 border-t border-white/[0.10] px-2 py-2">
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
    </aside>
  );
}