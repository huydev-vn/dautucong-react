import axiosInstance from '@/lib/axios';
import type { ApiWrapped, PagedResult } from '@/types';

export interface NhomItem {
  Id: number;
  Ma: string;
  Ten: string;
  GhiChu: string | null;
}

const BASE = '/Nhom';

export const nhomApi = {
  /** Lấy toàn bộ nhóm — dùng cho dropdown */
  getAll: async (): Promise<NhomItem[]> => {
    const { data } = await axiosInstance.get<ApiWrapped<PagedResult<NhomItem>>>(`${BASE}/LietKe`, {
      params: { pageNumber: 1, pageSize: 1000 },
    });
    return data.data?.Items ?? [];
  },
};
