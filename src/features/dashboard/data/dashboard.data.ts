// ─── Fake data cho Dashboard Đầu tư Công ─────────────────────────────────────

// ── 1. Thẻ tổng quan (KPI cards) ─────────────────────────────────────────────
export const KPI_CARDS = [
  {
    id: 'tong-von',
    label: 'Tổng vốn kế hoạch',
    value: 4_820,
    unit: 'tỷ đồng',
    change: +8.4,
    icon: 'currency',
    color: 'blue',
  },
  {
    id: 'giai-ngan',
    label: 'Đã giải ngân',
    value: 2_376,
    unit: 'tỷ đồng',
    change: +12.1,
    icon: 'check',
    color: 'green',
  },
  {
    id: 'ty-le',
    label: 'Tỷ lệ giải ngân',
    value: 49.3,
    unit: '%',
    change: +3.2,
    icon: 'percent',
    color: 'indigo',
  },
  {
    id: 'du-an',
    label: 'Dự án đang triển khai',
    value: 142,
    unit: 'dự án',
    change: +6,
    icon: 'project',
    color: 'amber',
  },
  {
    id: 'hoan-thanh',
    label: 'Hoàn thành trong năm',
    value: 38,
    unit: 'dự án',
    change: +14,
    icon: 'done',
    color: 'teal',
  },
  {
    id: 'cham-tien-do',
    label: 'Chậm tiến độ',
    value: 17,
    unit: 'dự án',
    change: -4,
    icon: 'warning',
    color: 'red',
  },
] as const;

// ── 2. Biểu đồ giải ngân theo tháng (cột + đường) ────────────────────────────
export const GIAI_NGAN_THEO_THANG = {
  months: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
  keHoach: [180, 220, 310, 380, 420, 500, 540, 580, 620, 690, 750, 820],
  thucHien: [142, 175, 260, 320, 395, 430, 490, 0, 0, 0, 0, 0],
  luyKe: [142, 317, 577, 897, 1292, 1722, 2212, 0, 0, 0, 0, 0],
};

// ── 3. Cơ cấu vốn theo lĩnh vực ──────────────────────────────────────────────
export const CO_CAU_LINH_VUC = [
  { name: 'Giao thông', value: 1420, color: '#2563eb' },
  { name: 'Giáo dục',   value: 680,  color: '#0891b2' },
  { name: 'Y tế',       value: 520,  color: '#7c3aed' },
  { name: 'Nông nghiệp',value: 490,  color: '#16a34a' },
  { name: 'Đô thị',     value: 870,  color: '#d97706' },
  { name: 'CNTT',       value: 360,  color: '#dc2626' },
  { name: 'Khác',       value: 480,  color: '#6b7280' },
];

// ── 4. Top dự án lớn nhất ─────────────────────────────────────────────────────
export const TOP_DU_AN = [
  { ten: 'QL1A đoạn Bắc Ninh – Hà Nội',       vonDT: 850, giaiNgan: 620, tienDo: 73 },
  { ten: 'BV Đa khoa tỉnh – Giai đoạn 2',     vonDT: 620, giaiNgan: 310, tienDo: 50 },
  { ten: 'Hạ tầng KCN Tiên Sơn mở rộng',      vonDT: 540, giaiNgan: 490, tienDo: 91 },
  { ten: 'Trường THPT Từ Sơn',                 vonDT: 180, giaiNgan: 140, tienDo: 78 },
  { ten: 'Kè sông Đuống đoạn thị xã',         vonDT: 320, giaiNgan: 95,  tienDo: 30 },
  { ten: 'Nâng cấp đường ĐT295B',             vonDT: 260, giaiNgan: 195, tienDo: 75 },
  { ten: 'Trung tâm hành chính huyện Lương Tài', vonDT: 150, giaiNgan: 30, tienDo: 20 },
];

// ── 5. Tỷ lệ theo trạng thái dự án ───────────────────────────────────────────
export const TRANG_THAI_DU_AN = [
  { name: 'Đang thi công',   value: 86,  color: '#2563eb' },
  { name: 'Chuẩn bị đầu tư',value: 28,  color: '#0891b2' },
  { name: 'Hoàn thành',      value: 38,  color: '#16a34a' },
  { name: 'Chậm tiến độ',    value: 17,  color: '#dc2626' },
  { name: 'Tạm dừng',        value: 5,   color: '#d97706' },
];

// ── 6. So sánh giải ngân 3 năm gần nhất ──────────────────────────────────────
export const SO_SANH_3_NAM = {
  months: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
  nam2024: [110, 145, 190, 265, 310, 380, 420, 470, 530, 580, 640, 720],
  nam2025: [125, 170, 240, 310, 365, 440, 490, 550, 600, 670, 730, 800],
  nam2026: [142, 175, 260, 320, 395, 430, 490, 0, 0, 0, 0, 0],
};

// ── 7. Giải ngân theo đơn vị / huyện ─────────────────────────────────────────
export const GIAI_NGAN_THEO_DON_VI = [
  { ten: 'Thành phố Bắc Ninh', keHoach: 820, thucHien: 490 },
  { ten: 'TP Từ Sơn',           keHoach: 650, thucHien: 380 },
  { ten: 'Huyện Tiên Du',       keHoach: 580, thucHien: 290 },
  { ten: 'Huyện Yên Phong',     keHoach: 520, thucHien: 240 },
  { ten: 'Huyện Quế Võ',        keHoach: 480, thucHien: 175 },
  { ten: 'Huyện Gia Bình',      keHoach: 360, thucHien: 210 },
  { ten: 'Huyện Lương Tài',     keHoach: 290, thucHien: 95  },
  { ten: 'Huyện Thuận Thành',   keHoach: 430, thucHien: 310 },
];

// ── 8. Timeline dự án gần kết thúc năm ───────────────────────────────────────
export const DU_AN_SAN_HAN = [
  { ten: 'Kè sông Đuống đoạn thị xã',       hanHT: 'T9/2026', tienDo: 30, nguyCo: 'cao' },
  { ten: 'BV Đa khoa tỉnh – Giai đoạn 2',  hanHT: 'T10/2026', tienDo: 50, nguyCo: 'tb' },
  { ten: 'Trường THPT Từ Sơn',              hanHT: 'T11/2026', tienDo: 78, nguyCo: 'thap' },
  { ten: 'Trung tâm hành chính Lương Tài',  hanHT: 'T12/2026', tienDo: 20, nguyCo: 'cao' },
  { ten: 'QL1A đoạn Bắc Ninh – Hà Nội',    hanHT: 'T12/2026', tienDo: 73, nguyCo: 'thap' },
] as const;
