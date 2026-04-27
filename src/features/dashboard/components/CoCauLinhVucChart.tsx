import ReactECharts from 'echarts-for-react';
import { CO_CAU_LINH_VUC } from '../data/dashboard.data';

export function CoCauLinhVucChart() {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: <b>{c} tỷ</b> ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 8,
      top: 'center',
      textStyle: { fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['38%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 13, fontWeight: 'bold' },
          scaleSize: 6,
        },
        data: CO_CAU_LINH_VUC.map((d) => ({
          name: d.name,
          value: d.value,
          itemStyle: { color: d.color },
        })),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 260 }} />;
}
