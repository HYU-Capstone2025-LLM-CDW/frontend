import React from 'react';
import ReactECharts from 'echarts-for-react';

interface Props {
    data: any[];
    xKey: string;
    yKey: string;
}

const LineChart: React.FC<Props> = ({ data, xKey, yKey }) => {
    const option = {
        title: { text: '선 차트', left: 'center' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: data.map(d => d[xKey]) },
        yAxis: { type: 'value' },
        series: [{ type: 'line', data: data.map(d => Number(d[yKey]) || 0) }],
    };

    return <ReactECharts option={option} style={{ height: 400 }} />;
};

export default LineChart;
