import type { UserRole } from '@/features/auth';
import type { TrangThaiChung } from '@/types';

export interface NguoiDung {
  id: string;
  username: string;
  hoTen: string;
  email: string;
  dienThoai?: string;
  donVi: string;
  chucVu?: string;
  role: UserRole;
  trangThai: TrangThaiChung;
  ngayTao: string;
  ngayCapNhat: string;
}

export interface NguoiDungListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
  trangThai?: TrangThaiChung;
}
