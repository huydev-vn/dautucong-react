import logo from "@/assets/logo.png";
import { useNavigate } from "react-router-dom";
import { LogOut, Bell, User, Home, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth";
import { useTour } from "@/hooks/useTour";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { startTour } = useTour();

  const handleLogout = () => {
    logout();
    toast.success("Đã đăng xuất");
    navigate("/login");
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#1a3c6e]/15 bg-white px-4 shadow-[0_1px_6px_0_rgba(26,60,110,0.10)]">
      {/* ── Trái: logo + tiêu đề hệ thống ── */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#1a3c6e]/8 ring-2 ring-[#1a3c6e]/15">
          <img src={logo} alt="Quốc huy" className="size-7 object-contain" />
        </div>
        <div className="hidden sm:block min-w-0" data-tour="header-title">
          <h1 className="text-base font-extrabold uppercase tracking-widest text-[#1a3c6e] leading-tight truncate">
            Hệ thống Quản lý Đầu tư trong ngân sách
          </h1>
          <p className="mt-1 text-[12px] font-medium text-[#1a3c6e]/60 leading-tight tracking-wide">
            Sở Tài Chính Bắc Ninh
          </p>
        </div>
      </div>

      {/* ── Phải: thông tin + hành động ── */}
      <div className="flex items-center gap-1">
        {/* Tên người dùng – chỉ hiện ≥ md */}
        {user && (
          <div
            data-tour="header-user"
            className="hidden md:flex items-center gap-2 rounded-lg bg-[#1a3c6e]/6 border border-[#1a3c6e]/12 px-3 py-1.5 mr-1"
          >
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#1a3c6e] text-white">
              <User size={12} />
            </div>
            <div className="text-right">
              <p className="text-[13px] font-semibold text-[#1a3c6e] leading-tight">
                {user.TenDaiDien || user.TenDangNhap}
              </p>
            </div>
          </div>
        )}

        {/* Thông báo */}
        <button
          data-tour="header-notification"
          className="relative flex size-9 items-center justify-center rounded-lg text-[#1a3c6e]/50 hover:bg-[#1a3c6e]/8 hover:text-[#1a3c6e] transition-colors"
          title="Thông báo"
        >
          <Bell size={18} />
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
            2
          </span>
        </button>

        {/* Hướng dẫn */}
        <button
          data-tour="header-guide"
          onClick={() => startTour(true)}
          className="flex size-9 items-center justify-center rounded-lg text-[#1a3c6e]/50 hover:bg-[#1a3c6e]/8 hover:text-[#1a3c6e] transition-colors"
          title="Hướng dẫn sử dụng"
        >
          <BookOpen size={18} />
        </button>

        {/* Trang chủ */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex size-9 items-center justify-center rounded-lg text-[#1a3c6e]/50 hover:bg-[#1a3c6e]/8 hover:text-[#1a3c6e] transition-colors"
          title="Trang chủ"
        >
          <Home size={18} />
        </button>

        {/* Đăng xuất */}
        <button
          onClick={handleLogout}
          className="flex size-9 items-center justify-center rounded-lg text-[#1a3c6e]/50 hover:bg-red-50 hover:text-red-500 transition-colors"
          title="Đăng xuất"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
