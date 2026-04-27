import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất');
    navigate('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      {/* Left: có thể thêm breadcrumb sau */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground hidden sm:block">
          Hệ thống Quản lý Đầu tư Công
        </span>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Thông báo */}
        <Button variant="ghost" size="icon" className="relative" title="Thông báo">
          <Bell size={18} />
          {/* Badge thông báo – sẽ implement sau */}
        </Button>

        {/* Thông tin người dùng */}
        <div className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm">
          <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User size={14} />
          </div>
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium leading-none text-foreground">{user?.hoTen ?? '—'}</p>
            <p className="text-xs text-muted-foreground leading-none mt-0.5">{user?.donVi ?? ''}</p>
          </div>
        </div>

        {/* Đăng xuất */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          title="Đăng xuất"
          className="text-muted-foreground hover:text-destructive"
        >
          <LogOut size={18} />
        </Button>
      </div>
    </header>
  );
}
