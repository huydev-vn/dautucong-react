import type { BaseModel, PagedResult } from '@/types';

// Ánh xạ từ HETHONG_CHUCNANG + ChucNangModel.cs — kế thừa BaseModel (PascalCase)
export interface ChucNang extends BaseModel {
  Ma: string;
  Ten: string;
  Url?: string;
  SapXep?: number;
  Icon?: string;
  IdCha?: number;
  GhiChu?: string;
}

// Params truyền vào GET /api/ChucNang/LietKe
export interface ChucNangListParams {
  pageNumber?: number;
  pageSize?: number;
  searchText?: string;
}

// Body gửi lên POST /api/ChucNang/Nhap (Tạo mới: id = 0, Cập nhật: id > 0)
export interface ChucNangFormValues {
  id: number;
  ma: string;
  ten: string;
  url?: string;
  sapXep?: number;
  icon?: string;
  idCha?: number;
  ghiChu?: string;
}

// Response từ LietKe sau khi unwrap ApiWrapped<T> — dùng PagedResult chung
export type ChucNangPagedResult = PagedResult<ChucNang>;
