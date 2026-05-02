import type { BaseModel, PagedResult } from '@/types';

// Ánh xạ HETHONG_NGUOIDUNG + NguoiDungModel.cs — kế thừa BaseModel (PascalCase)
export interface NguoiDung extends BaseModel {
  TaiKhoan: string;
  TenNguoiDung: string;
  NhomNguoiDungId: string | null;
  Email: string | null;
  IsAdmin: number; // 0 = thường, 1 = admin
}

// Params cho GET /api/NguoiDung/LietKe
export interface NguoiDungListParams {
  pageNumber?: number;
  pageSize?: number;
  searchText?: string;
  idDonVi?: number;
}

// Body POST /api/NguoiDung/Nhap (id = 0 → tạo mới, id > 0 → cập nhật)
export interface NguoiDungFormValues {
  id: number;
  idDonVi: number;
  taiKhoan: string;
  tenNguoiDung: string;
  /** ID nhóm (số). API call sẽ chuyển thành chuỗi "[id]" khi gửi backend. */
  nhomId?: number;
  matKhau?: string;   // bắt buộc khi tạo mới, tùy chọn khi cập nhật
  email?: string;
  /** 0 = kích hoạt, 1 = khóa tài khoản */
  isDelete: number;
}

// Body POST /api/NguoiDung/DatLaiMatKhau
export interface DatLaiMatKhauValues {
  taiKhoan: string;
  matKhauMoi: string;
}

// Response type alias
export type NguoiDungPagedResult = PagedResult<NguoiDung>;
