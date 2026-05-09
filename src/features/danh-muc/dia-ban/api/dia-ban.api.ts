import axiosInstance from '@/lib/axios';
import type { ApiWrapped } from '@/types';
import { createDmApi } from '../../api/danh-muc.api';
import type { DiaBan, DiaBanFormValues, DiaBanListParams } from '../types/dia-ban.type';

// Controller: Dm_DiaBanController → route /api/Dm_DiaBan
const BASE = '/Dm_DiaBan';

const _base = createDmApi<DiaBan, DiaBanFormValues, DiaBanListParams>('Dm_DiaBan');

export const diaBanApi = {
  // ── Kế thừa từ factory (LietKe / Nhap / Xoa) ──────────────────────────────
  getList:  _base.getList,
  save:     _base.save,
  delete:   _base.delete,

  /**
   * GET /api/Dm_DiaBan/ThongTin?id=
   * Override getById — controller dùng endpoint ThongTin thay vì LayTheoId.
   */
  getById: async (id: number): Promise<DiaBan> => {
    const { data } = await axiosInstance.get<ApiWrapped<DiaBan>>(`${BASE}/ThongTin`, { params: { id } });
    return data.data;
  },

  /**
   * GET /api/Dm_DiaBan/LayTheoCha?idCha=
   * Lấy danh sách con trực tiếp — dùng cho cascade dropdown.
   * idCha = undefined | null → trả về cấp 1 (Tỉnh/TP).
   */
  getByParent: async (idCha?: number | null): Promise<DiaBan[]> => {
    const { data } = await axiosInstance.get<ApiWrapped<DiaBan[]>>(`${BASE}/LayTheoCha`, {
      params: idCha != null ? { idCha } : {},
    });
    return data.data ?? [];
  },
};
