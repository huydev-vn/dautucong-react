import axiosInstance from '@/lib/axios';
import type { ApiWrapped, PagedResult } from '@/types';

export interface DonViItem {
  Id: number;
  IdDonVi: number;
  Ten: string;
  Ma: string | null;
}

const BASE = '/Dm_DonVi';

export const donViApi = {
  /** Lấy toàn bộ đơn vị — dùng cho dropdown */
  getAll: async (): Promise<DonViItem[]> => {
    const { data } = await axiosInstance.get<ApiWrapped<PagedResult<DonViItem>>>(`${BASE}/LietKe`, {
      params: { pageNumber: 1, pageSize: 500, hieuLuc: 1 },
    });
    return data.data?.Items ?? [];
  },
};
