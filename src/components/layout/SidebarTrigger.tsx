import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIStore } from '@/stores/ui.store';

/**
 * Nút toggle sidebar kiểu shadcn — nằm ở ranh giới sidebar/content,
 * vị trí absolute translate-x-1/2 để nằm đúng trên đường biên.
 */
export function SidebarTrigger() {
  const collapsed  = useUIStore((s) => s.sidebarCollapsed);
  const toggle     = useUIStore((s) => s.toggleSidebar);

  return (
    <button
      data-tour="sidebar-trigger"
      onClick={toggle}
      title={collapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
      className="
        absolute top-[4.5rem] right-0 z-50
        flex size-6 translate-x-1/2 items-center justify-center
        rounded-full border border-[#1a3c6e]/25 bg-white
        text-[#1a3c6e]/70 shadow-[0_1px_6px_0_rgba(26,60,110,0.18)]
        transition-all duration-200
        hover:bg-[#1a3c6e] hover:text-white hover:shadow-[0_2px_10px_0_rgba(26,60,110,0.35)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a3c6e]/50
      "
    >
      {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
    </button>
  );
}