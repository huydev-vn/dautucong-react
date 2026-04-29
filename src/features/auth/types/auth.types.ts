import type { ApiWrapped } from '@/types';

// re-export để các module cũ import từ đây vẫn hoạt động
export type { ApiWrapped };

// Giữ lại để các module khác (nguoi-dung) dùng
export type UserRole = 'admin' | 'manager' | 'editor' | 'viewer';

/** Shape trả về từ backend POST /api/Auth/Login */
export interface User {
  Id: string;
  TenDangNhap: string;
  TenDaiDien: string;
  MaDonVi: string;
}

/** Form dùng username/password; API layer map sang query param user/pass */
export interface LoginPayload {
  username: string;
  password: string;
}

/** Một tác vụ được phân quyền (HETHONG_TACVU) */
export interface TacVuItem {
  Ma: string;
  Ten: string;
  Icon: string | null;
  Stt: number;
  ViTri: string;
  Style: string | null;
}

/** Một mục menu con (Children = []) */
export interface MenuItem {
  Id: number;
  Ma: string;
  Ten: string;
  Url: string | null;
  Icon: string | null;
  IdCha: number;
  SapXep: number;
  Children: MenuItem[];
}

/** Backend trả về – refreshToken nằm trong HttpOnly cookie, không trong body */
export interface LoginResponse {
  accessToken: string;
  user: User;
  Menu: MenuItem[];
  version: string;
  /** key = Id chức năng (string), value = danh sách tác vụ */
  DSTacVu: Record<string, TacVuItem[]>;
}

/** Shape trả về từ GET /api/Auth/QuyenTacVu */
export interface QuyenTacVuResponse {
  version: string;
  DSTacVu: Record<string, TacVuItem[]>;
}

/** LibNetCore bọc tất cả response trong wrapper này — định nghĩa của sốt trong @/types/api.types */

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  menu: MenuItem[];
  dsTacVu: Record<string, TacVuItem[]>;
  tacVuVersion: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  initialize: () => void;
  setQuyenTacVu: (version: string, dsTacVu: Record<string, TacVuItem[]>) => void;
}
