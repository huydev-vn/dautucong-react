import axiosInstance from '@/lib/axios';
import type { ApiWrapped } from '@/types';
import { createDmApi } from '../../api/danh-muc.api';
import type { DonVi, DonViFormValues, DonViListParams } from '../types/don-vi.type';

const BASE = '/Dm_DonVi';

const _base = createDmApi<DonVi, DonViFormValues, DonViListParams>('Dm_DonVi');

export const donViApi = {
  // ── Kế thừa từ factory ────────────────────────────────────────────────────
  getList: _base.getList,
  save:    _base.save,
  delete:  _base.delete,

  /**
   * GET /api/Dm_DonVi/ThongTin?id=
   * Controller dùng endpoint ThongTin thay vì LayTheoId.
   */
  getById: async (id: number): Promise<DonVi> => {
    const { data } = await axiosInstance.get<ApiWrapped<DonVi>>(`${BASE}/ThongTin`, { params: { id } });
    return data.data;
  },
};
