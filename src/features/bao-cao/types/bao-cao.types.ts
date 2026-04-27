export type LoaiBaoCao =
  | 'tong_hop_von'
  | 'tien_do_du_an'
  | 'giai_ngan_theo_thang'
  | 'hop_dong_het_han'
  | 'du_an_cham_tien_do';

export const LOAI_BAO_CAO_LABEL: Record<LoaiBaoCao, string> = {
  tong_hop_von: 'Tổng hợp vốn đầu tư công',
  tien_do_du_an: 'Tiến độ dự án',
  giai_ngan_theo_thang: 'Giải ngân theo tháng',
  hop_dong_het_han: 'Hợp đồng hết hạn',
  du_an_cham_tien_do: 'Dự án chậm tiến độ',
};

export interface BaoCaoParams {
  loai: LoaiBaoCao;
  nam?: number;
  thang?: number;
  tinhThanh?: string;
  linhVuc?: string;
}
