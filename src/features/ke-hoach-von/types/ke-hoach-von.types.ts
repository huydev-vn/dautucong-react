export interface KeHoachVon {
  id: string;
  duAnId: string;
  tenDuAn?: string;
  nam: number;
  vonKeHoach: number;
  vonBoTri: number;
  vonGiaiNgan: number;
  tyLeGiaiNgan: number;
  ghiChu?: string;
  ngayTao: string;
  ngayCapNhat: string;
}

export interface KeHoachVonListParams {
  page?: number;
  pageSize?: number;
  nam?: number;
  duAnId?: string;
  search?: string;
}
