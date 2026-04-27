import ReactECharts from 'echarts-for-react';
import { TRANG_THAI_DU_AN } from '../data/dashboard.data';

export function TrangThaiDuAnChart() {
  const total = TRANG_THAI_DU_AN.reduce((s, d) => s + d.value, 0);

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: <b>{c} dự án</b> ({d}%)',
    },
    series: [
      {
        type: 'pie',
        radius: ['55%', '80%'],
        center: ['50%', '48%'],
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          fontSize: 10,
          lineHeight: 16,
        },
        labelLine: { length: 8, length2: 6 },
        data: TRANG_THAI_DU_AN.map((d) => ({
          name: d.name,
          value: d.value,
          itemStyle: { color: d.color },
        })),
      },
    ],
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '40%',
        style: { text: `${total}`, fill: '#1e293b', fontSize: 22, fontWeight: 'bold' },
      },
      {
        type: 'text',
        left: 'center',
        top: '52%',
        style: { text: 'dự án', fill: '#64748b', fontSize: 11 },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 260 }} />;
}
