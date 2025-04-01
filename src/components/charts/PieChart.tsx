import React from 'react';
import ReactECharts from 'echarts-for-react';

interface Props {
    data: any[];
    nameKey: string;
    valueKey: string;
}

const PieChart: React.FC<Props> = ({ data, nameKey, valueKey }) => {
    const option = {
        title: { text: '파이 차트', left: 'center' },
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [
            {
                type: 'pie',
                radius: '50%',
                data: data.map(item => ({
                    name: `${item[nameKey]}`,
                    value: Number(item[valueKey]) || 0,
                })),
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                },
            },
        ],
    };

    return <ReactECharts option={option} style={{ height: 400 }} />;
};

export default PieChart;
