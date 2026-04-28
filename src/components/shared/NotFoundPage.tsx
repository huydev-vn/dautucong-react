import { Link, useLocation } from 'react-router-dom';
import { Home, MoveLeft, SearchX } from 'lucide-react';

export function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        {/* Icon */}
        <div className="flex size-20 items-center justify-center rounded-2xl bg-[#1a3c6e]/8 text-[#1a3c6e]/40">
          <SearchX size={40} strokeWidth={1.5} />
        </div>

        {/* Số 404 */}
        <p className="mt-6 text-[80px] font-extrabold leading-none tracking-tight text-[#1a3c6e]/10 select-none">
          404
        </p>

        {/* Tiêu đề */}
        <h1 className="mt-2 text-xl font-bold text-gray-800">Trang không tồn tại</h1>

        {/* Mô tả */}
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Đường dẫn{' '}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-[12px] font-mono text-gray-600">
            {location.pathname}
          </code>{' '}
          không tồn tại hoặc đã bị xóa.
        </p>

        {/* Nút hành động */}
        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50"
          >
            <MoveLeft size={15} />
            Quay lại
          </button>
          <Link
            to="/dashboard"
            className="flex h-9 items-center gap-2 rounded-lg bg-[#1a3c6e] px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0f2a52]"
          >
            <Home size={15} />
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
