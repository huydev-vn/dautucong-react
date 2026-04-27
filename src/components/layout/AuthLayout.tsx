import { Outlet } from 'react-router-dom';
import loginBg from '@/assets/login-background.jpg';

export function AuthLayout() {
  return (
    // fixed inset-0: container ghim đúng bằng viewport — browser không bao giờ scroll body
    // overflow-y-auto + scrollbar-hide: cho phép cuộn nội bộ nếu màn rất thấp, nhưng ẩn thanh cuộn
    <div className="fixed inset-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `url(${loginBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Blue overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-950/80 via-blue-900/70 to-blue-800/60" />

      {/* Content — min-h-full đảm bảo căn giữa dọ khi có khoảng trống */}
      <div className="flex min-h-full items-center justify-center px-4 py-6">
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
