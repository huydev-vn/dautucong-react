import type { BaseModel, PagedResult } from '@/types';

// Ánh xạ từ HETHONG_TACVU + TacVuModel.cs — kế thừa BaseModel (PascalCase)
export interface TacVu extends BaseModel {
  Ma: string;
  Ten: string;
  Icon: string | null;
  Stt: number;
  ViTri: string;
  Style: string | null;
}

// Params truyền vào GET /api/TacVu/LietKe
export interface TacVuListParams {
  pageNumber?: number;
  pageSize?: number;
  searchText?: string;
}

// Body gửi lên POST /api/TacVu/Nhap (Tạo mới: id = 0, Cập nhật: id > 0)
export interface TacVuFormValues {
  id: number;
  ma: string;
  ten: string;
  icon?: string;
  stt?: number;
  viTri?: string;
  style?: string;
}

// Response từ LietKe sau khi unwrap ApiWrapped<T>
export type TacVuPagedResult = PagedResult<TacVu>;
