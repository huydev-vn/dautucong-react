import ReactECharts from 'echarts-for-react';
import { GIAI_NGAN_THEO_DON_VI } from '../data/dashboard.data';

export function GiaiNganDonViChart() {
  const sorted = [...GIAI_NGAN_THEO_DON_VI].sort((a, b) => a.keHoach - b.keHoach);
  const names = sorted.map((d) => d.ten);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any[]) =>
        `${params[0].name}<br/>` +
        params.map((p: any) => `${p.marker}${p.seriesName}: <b>${p.value.toLocaleString('vi-VN')} tỷ</b>`).join('<br/>'),
    },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    grid: { top: 8, right: 120, bottom: 40, left: 8, containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { fontSize: 10 },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
    },
    yAxis: {
      type: 'category',
      data: names,
      axisLabel: { fontSize: 10, width: 130, overflow: 'truncate' },
      axisTick: { show: false },
    },
    series: [
      {
        name: 'Kế hoạch',
        type: 'bar',
        barMaxWidth: 14,
        barGap: '15%',
        data: sorted.map((d) => d.keHoach),
        itemStyle: { color: '#bfdbfe', borderRadius: [0, 4, 4, 0] },
        label: { show: false },
      },
      {
        name: 'Thực hiện',
        type: 'bar',
        barMaxWidth: 14,
        data: sorted.map((d) => d.thucHien),
        itemStyle: { color: '#2563eb', borderRadius: [0, 4, 4, 0] },
        label: {
          show: true,
          position: 'right',
          fontSize: 10,
          formatter: (p: any) => `${Math.round((p.value / sorted[p.dataIndex].keHoach) * 100)}%`,
          color: '#374151',
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 300 }} />;
}
