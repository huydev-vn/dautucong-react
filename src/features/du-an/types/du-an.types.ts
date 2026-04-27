import type { GiaiDoanDuAn, LinhVuc, NguonVon, NhomDuAn } from '@/types';

export interface DuAn {
  id: string;
  maDuAn: string;
  tenDuAn: string;
  chuDauTu: string;
  donViQuanLy: string;
  tongMucDauTu: number;
  nguonVon: NguonVon[];
  linhVuc: LinhVuc;
  nhomDuAn: NhomDuAn;
  tinhThanh: string;
  quanHuyen: string;
  diaDiem: string;
  giaiDoan: GiaiDoanDuAn;
  ngayKhoiCong?: string;
  ngayDuKienHoanThanh?: string;
  ngayHoanThanh?: string;
  tienDoVatLy: number;
  tienDoTaiChinh: number;
  ghiChu?: string;
  ngayTao: string;
  ngayCapNhat: string;
}

export interface DuAnListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  giaiDoan?: GiaiDoanDuAn;
  linhVuc?: LinhVuc;
  tinhThanh?: string;
  nam?: number;
}
