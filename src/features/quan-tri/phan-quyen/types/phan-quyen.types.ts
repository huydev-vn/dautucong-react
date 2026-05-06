import type { BaseModel, PagedResult } from '@/types';

// ── Nhóm người dùng (HETHONG_NHOM) ───────────────────────────
export interface Nhom extends BaseModel {
  Ma: string;
  Ten: string;
  GhiChu?: string;
}

export type NhomPagedResult = PagedResult<Nhom>;

// ── Tác vụ danh mục (HETHONG_TACVU) ──────────────────────────
export interface TacVu extends BaseModel {
  Ma: string;
  Ten: string;
  Icon: string | null;
  Stt: number;
  ViTri: string;
  Style: string | null;
}

export type TacVuPagedResult = PagedResult<TacVu>;

// ── Quyền theo nhóm — flat row từ GET /PhanQuyen/QuyenTheoNhom ─
// Ánh xạ HETHONG_PHANQUYEN: một dòng = một cặp (chức năng × tác vụ) được phép
export interface ChucNangTacVu {
  IdChucNang: number;
  IdTacVu: number;
}

// ── Request body POST /api/PhanQuyen/Luu ─────────────────────
export interface PhanQuyenLuuRequest {
  Id_Nhom: number;
  DanhSachQuyen: ChucNangTacVu[];
}
