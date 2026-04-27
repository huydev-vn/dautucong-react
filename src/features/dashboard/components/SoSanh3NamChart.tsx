import ReactECharts from 'echarts-for-react';
import { SO_SANH_3_NAM } from '../data/dashboard.data';

export function SoSanh3NamChart() {
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any[]) =>
        params[0].name +
        '<br/>' +
        params
          .map((p: any) => `${p.marker}${p.seriesName}: <b>${p.value ? p.value.toLocaleString('vi-VN') : '—'} tỷ</b>`)
          .join('<br/>'),
    },
    legend: {
      data: ['Năm 2024', 'Năm 2025', 'Năm 2026'],
      bottom: 0,
      textStyle: { fontSize: 11 },
    },
    grid: { top: 12, right: 16, bottom: 40, left: 56 },
    xAxis: {
      type: 'category',
      data: SO_SANH_3_NAM.months,
      axisTick: { show: false },
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      name: 'Tỷ đồng',
      nameTextStyle: { fontSize: 10, color: '#94a3b8' },
      axisLabel: { fontSize: 10 },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
    },
    series: [
      {
        name: 'Năm 2024',
        type: 'line',
        data: SO_SANH_3_NAM.nam2024,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#94a3b8', width: 2, type: 'dashed' },
        itemStyle: { color: '#94a3b8' },
      },
      {
        name: 'Năm 2025',
        type: 'line',
        data: SO_SANH_3_NAM.nam2025,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#7dd3fc', width: 2 },
        itemStyle: { color: '#7dd3fc' },
      },
      {
        name: 'Năm 2026',
        type: 'line',
        data: SO_SANH_3_NAM.nam2026,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#2563eb', width: 3 },
        itemStyle: { color: '#2563eb' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(37,99,235,0.18)' },
              { offset: 1, color: 'rgba(37,99,235,0)' },
            ],
          },
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 280 }} />;
}
