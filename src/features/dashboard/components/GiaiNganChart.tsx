import ReactECharts from 'echarts-for-react';
import { GIAI_NGAN_THEO_THANG } from '../data/dashboard.data';

export function GiaiNganChart() {
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any[]) =>
        params
          .map((p: any) => `${p.marker}${p.seriesName}: <b>${p.value ? p.value.toLocaleString('vi-VN') : '—'} tỷ</b>`)
          .join('<br/>'),
    },
    legend: {
      data: ['Kế hoạch', 'Thực hiện', 'Lũy kế'],
      bottom: 0,
      textStyle: { fontSize: 11 },
    },
    grid: { top: 16, right: 16, bottom: 40, left: 56 },
    xAxis: {
      type: 'category',
      data: GIAI_NGAN_THEO_THANG.months,
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisTick: { show: false },
      axisLabel: { fontSize: 11 },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Tỷ đồng',
        nameTextStyle: { fontSize: 10, color: '#94a3b8' },
        axisLabel: { fontSize: 10 },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
      },
      {
        type: 'value',
        name: 'Lũy kế',
        nameTextStyle: { fontSize: 10, color: '#94a3b8' },
        axisLabel: { fontSize: 10 },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'Kế hoạch',
        type: 'bar',
        barMaxWidth: 20,
        data: GIAI_NGAN_THEO_THANG.keHoach,
        itemStyle: { color: '#bfdbfe', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: 'Thực hiện',
        type: 'bar',
        barMaxWidth: 20,
        data: GIAI_NGAN_THEO_THANG.thucHien,
        itemStyle: { color: '#2563eb', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: 'Lũy kế',
        type: 'line',
        yAxisIndex: 1,
        data: GIAI_NGAN_THEO_THANG.luyKe,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#f59e0b', width: 2.5 },
        itemStyle: { color: '#f59e0b' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(245,158,11,0.18)' }, { offset: 1, color: 'rgba(245,158,11,0)' }] } },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 280 }} />;
}
