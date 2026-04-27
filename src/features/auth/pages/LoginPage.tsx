import logo from "@/assets/logo.png";
import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
  return (
    <div className="flex flex-col items-center w-full max-w-[30rem] mx-auto">
      {/* Emblem + tên cơ quan */}
      <div className="flex flex-col items-center mb-4 text-white text-center">
        <div className="relative mb-2.5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-2xl shadow-black/40 ring-4 ring-white/10">
            <img
              src={logo}
              alt="Quốc huy Việt Nam"
              className="w-11 h-11 sm:w-14 sm:h-14 object-contain drop-shadow-md"
            />
          </div>
          <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-xl -z-10" />
        </div>

        <h1 className="text-lg sm:text-xl font-bold tracking-[0.15em] uppercase drop-shadow-md whitespace-nowrap">
          Sở Tài Chính Bắc Ninh
        </h1>
        <p className="mt-1 text-sm text-blue-200/90 tracking-widest font-light">
          Hệ thống Quản lý Đầu tư Công
        </p>
      </div>

      {/* Login card */}
      <div className="w-full rounded-2xl overflow-hidden bg-white shadow-2xl shadow-black/30">
        {/* Card header strip */}
        <div className="relative bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-3.5 text-white text-center overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-4 w-20 h-20 rounded-full bg-white/8" />
          <h2 className="relative text-base font-semibold tracking-wide uppercase">
            Đăng nhập hệ thống
          </h2>{" "}
        </div>

        {/* Form body */}
        <div className="px-5 sm:px-7 pt-5 pb-4">
          <LoginForm />
        </div>

        {/* Card footer */}
        <div className="border-t border-gray-100 px-6 py-2.5 text-center bg-gray-50/60">
          <span className="text-xs text-gray-400 tracking-wide">
            Phiên bản 1.0
          </span>
        </div>
      </div>

      {/* Copyright */}
      <p className="mt-3 text-xs text-blue-200/60 text-center">
        © {new Date().getFullYear()}. Sở Tài Chính Bắc Ninh. Bảo lưu mọi quyền.
      </p>
    </div>
  );
}
