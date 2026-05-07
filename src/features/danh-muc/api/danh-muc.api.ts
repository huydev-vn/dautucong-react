import axiosInstance from '@/lib/axios';
import type { ApiWrapped, PagedResult, BaseModel } from '@/types';
import type { DmListParams } from '../types/danh-muc.types';

/**
 * Factory tạo API client cho các Dm_* controller trong HeThong.
 *
 * Convention backend:
 *   GET  /{controller}/LietKe?pageNumber=&pageSize=&searchText=&hieuLuc=
 *   GET  /{controller}/LayTheoId?id={decimal}
 *   POST /{controller}/Nhap          body: model
 *   POST /{controller}/Xoa?id={decimal}
 */
function createDmApi<T extends BaseModel>(controller: string) {
  return {
    getList: async (params?: DmListParams): Promise<PagedResult<T>> => {
      const { data } = await axiosInstance.get<ApiWrapped<PagedResult<T>>>(
        `/${controller}/LietKe`,
        { params },
      );
      return data.data;
    },

    getById: async (id: number): Promise<T> => {
      const { data } = await axiosInstance.get<ApiWrapped<T>>(
        `/${controller}/LayTheoId`,
        { params: { id } },
      );
      return data.data;
    },

    create: async (payload: Omit<T, keyof BaseModel>): Promise<number> => {
      const { data } = await axiosInstance.post<ApiWrapped<number>>(
        `/${controller}/Nhap`,
        payload,
      );
      return data.data;
    },

    delete: async (id: number): Promise<number> => {
      const { data } = await axiosInstance.post<ApiWrapped<number>>(
        `/${controller}/Xoa`,
        null,
        { params: { id } },
      );
      return data.data;
    },
  };
}

export { createDmApi };

// ── Các API cụ thể — thêm mới khi cần quản lý thêm danh mục ──────────────
import type { Dm_LinhVucItem, Dm_DuAnDauTuItem } from '../types/danh-muc.types';

export const danhMucLinhVucApi = createDmApi<Dm_LinhVucItem>('Dm_LinhVuc');
export const danhMucDuAnDauTuApi = createDmApi<Dm_DuAnDauTuItem>('Dm_DuAnDauTu');
