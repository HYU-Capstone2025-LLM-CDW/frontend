import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface ScatterChartProps {
    data: { [key: string]: string | number | null }[];
    xKey: string;
    yKey: string;
}

const ScatterChart: React.FC<ScatterChartProps> = ({ data, xKey, yKey }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartRef.current || data.length === 0) return;

        const chart = echarts.init(chartRef.current);

        const seriesData = data.map((d) => [d[xKey], d[yKey]]);

        chart.setOption({
            title: { text: '산점도 차트', left: 'center' },
            tooltip: {},
            xAxis: { type: 'value', name: xKey },
            yAxis: { type: 'value', name: yKey },
            series: [
                {
                    type: 'scatter',
                    data: seriesData,
                    symbolSize: 10,
                },
            ],
        });

        const resizeObserver = new ResizeObserver(() => chart.resize());
        resizeObserver.observe(chartRef.current);

        return () => {
            chart.dispose();
            resizeObserver.disconnect();
        };
    }, [data, xKey, yKey]);

    return <div ref={chartRef} className="w-full h-[500px]" />;
};

export default ScatterChart;
