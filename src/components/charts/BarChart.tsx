import React from 'react';
import ReactECharts from 'echarts-for-react';

interface Props {
  data: any[];
  xKey: string;
  yKey: string;
}

const BarChart: React.FC<Props> = ({ data, xKey, yKey }) => {
  const option = {
    title: { text: '막대 차트', left: 'center' },
    tooltip: {},
    xAxis: { type: 'category', data: data.map(d => d[xKey]) },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: data.map(d => Number(d[yKey]) || 0) }],
  };

  return <ReactECharts option={option} style={{ height: 400 }} />;
};

export default BarChart;
