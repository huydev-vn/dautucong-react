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

/** Backend trả về – refreshToken nằm trong HttpOnly cookie, không trong body */
export interface LoginResponse {
  accessToken: string;
  user: User;
  Menu: unknown[];
  version: string;
  DSTacVu: unknown[];
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  initialize: () => void;
}
