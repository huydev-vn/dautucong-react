import axiosInstance from '@/lib/axios';
import type { ApiWrapped } from '@/types';
import type {
  NguoiDung,
  NguoiDungFormValues,
  NguoiDungListParams,
  NguoiDungPagedResult,
  DatLaiMatKhauValues,
} from '../types/nguoi-dung.types';

// LibNetCore bọc TẤT CẢ response trong { status, data: T, message } → phải unwrap .data

const BASE = '/NguoiDung';

export const nguoiDungApi = {
  /**
   * GET /api/NguoiDung/LietKe
   * Backend trả về ApiWrapped<PagedResult<NguoiDung>> với PascalCase fields.
   */
  getList: async (params?: NguoiDungListParams): Promise<NguoiDungPagedResult> => {
    const { data } = await axiosInstance.get<ApiWrapped<NguoiDungPagedResult>>(`${BASE}/LietKe`, { params });
    return data.data;
  },

  /**
   * POST /api/NguoiDung/Nhap
   * id = 0 → Tạo mới (MatKhau bắt buộc); id > 0 → Cập nhật.
   */
  save: async (model: NguoiDungFormValues): Promise<NguoiDung> => {
    // NhomNguoiDungId được lưu dạng JSON array string trong DB: "[1]" hoặc "[]"
    const nhomStr = model.nhomId ? `[${model.nhomId}]` : '[]';
    const payload = {
      Id: model.id,
      IdDonVi: model.idDonVi,
      TaiKhoan: model.taiKhoan,
      TenNguoiDung: model.tenNguoiDung,
      NhomNguoiDungId: nhomStr,
      MatKhau: model.matKhau ?? '',
      Email: model.email ?? '',
      IsDelete: model.isDelete ?? 0,
    };
    const { data } = await axiosInstance.post<ApiWrapped<NguoiDung>>(`${BASE}/Nhap`, payload);
    return data.data;
  },

  /**
   * POST /api/NguoiDung/Xoa?id={id}&nguoiThaoTac={nguoiThaoTac}
   * Xóa mềm (ISDELETE = 1).
   */
  delete: async (id: number, nguoiThaoTac: string): Promise<number> => {
    const { data } = await axiosInstance.post<ApiWrapped<number>>(`${BASE}/Xoa`, null, {
      params: { id, nguoiThaoTac },
    });
    return data.data;
  },

  /**
   * POST /api/NguoiDung/DatLaiMatKhau
   * Admin đặt lại mật khẩu cho người dùng khác.
   */
  datLaiMatKhau: async (body: DatLaiMatKhauValues): Promise<number> => {
    const { data } = await axiosInstance.post<ApiWrapped<number>>(`${BASE}/DatLaiMatKhau`, {
      TaiKhoan: body.taiKhoan,
      MatKhauMoi: body.matKhauMoi,
    });
    return data.data;
  },

  /**
   * GET /api/NguoiDung/DanhSachNguoiDungTheoNhom?idNhom={idNhom}
   * Dùng nội bộ bởi module Nhóm.
   */
  getDanhSachTheoNhom: async (idNhom: number): Promise<NguoiDung[]> => {
    const { data } = await axiosInstance.get<ApiWrapped<NguoiDung[]>>(
      `${BASE}/DanhSachNguoiDungTheoNhom`,
      { params: { idNhom } },
    );
    return data.data;
  },
};
