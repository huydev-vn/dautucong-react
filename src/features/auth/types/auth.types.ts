export type UserRole = 'admin' | 'manager' | 'editor' | 'viewer';

export interface UserPermission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface User {
  id: string;
  username: string;
  hoTen: string;
  email: string;
  role: UserRole;
  donVi: string;
  permissions: UserPermission[];
  avatar?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
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
