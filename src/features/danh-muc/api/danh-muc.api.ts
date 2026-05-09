import axiosInstance from '@/lib/axios';
import type { ApiWrapped, PagedResult, BaseModel } from '@/types';

/**
 * Factory tạo API client cho các Danh Mục (Dm) theo convention của backend.
 *
 * Convention backend:
 *   GET  /{controller}/LietKe?pageNumber=&pageSize=&searchText=&hieuLuc=
 *   GET  /{controller}/LayTheoId?id={decimal}
 *   POST /{controller}/Nhap          body: model
 *   POST /{controller}/Xoa?id={decimal}
 *
 * Cách dùng:
 *   const base = createDmApi<MyModel, MyFormValues, MyListParams>('Dm_TenDanhMuc');
 *   export const myApi = { ...base, /* custom methods * / };
 */
function createDmApi<
  TModel extends BaseModel,
  TFormValues,
  TListParams extends object = object,
>(controller: string) {
  const BASE = `/${controller}`;

  return {
    /**
     * GET /{controller}/LietKe — danh sách phân trang
     */
    getList: async (params?: TListParams): Promise<PagedResult<TModel>> => {
      const { data } = await axiosInstance.get<ApiWrapped<PagedResult<TModel>>>(`${BASE}/LietKe`, { params });
      return data.data;
    },

    /**
     * GET /{controller}/LayTheoId?id= — chi tiết 1 bản ghi
     * (override khi controller dùng endpoint khác, vd: ThongTin)
     */
    getById: async (id: number): Promise<TModel> => {
      const { data } = await axiosInstance.get<ApiWrapped<TModel>>(`${BASE}/LayTheoId`, { params: { id } });
      return data.data;
    },

    /**
     * POST /{controller}/Nhap — thêm mới (id=0) hoặc cập nhật (id>0)
     */
    save: async (model: TFormValues): Promise<number> => {
      const { data } = await axiosInstance.post<ApiWrapped<number>>(`${BASE}/Nhap`, model);
      return data.data;
    },

    /**
     * POST /{controller}/Xoa?id= — xoá mềm
     */
    delete: async (id: number): Promise<number> => {
      const { data } = await axiosInstance.post<ApiWrapped<number>>(`${BASE}/Xoa`, null, { params: { id } });
      return data.data;
    },
  };
}

export { createDmApi };