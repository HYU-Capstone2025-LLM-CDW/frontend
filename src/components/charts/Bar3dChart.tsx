import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import 'echarts-gl';

interface Bar3DChartProps {
    data: { x: string | number; y: string | number; z: number }[];
    zKey: string;
}

const Bar3DChart: React.FC<Bar3DChartProps> = ({ data, zKey }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartRef.current || !data.length) return;
        const chart = echarts.init(chartRef.current);

        chart.setOption({
            tooltip: {},
            title: { text: '3D 막대그래프', left: 'center' },
            xAxis3D: { type: 'category', name: 'X' },
            yAxis3D: { type: 'category', name: 'Y' },
            zAxis3D: { type: 'value', name: zKey },
            grid3D: {
                boxWidth: 100,
                boxDepth: 80,
                viewControl: { projection: 'orthographic' }
            },
            series: [
                {
                    type: 'bar3D',
                    data: data.map((item) => ({ value: [item.x, item.y, item.z] })),
                    shading: 'lambert',
                    label: { show: false },
                    emphasis: {
                        label: { show: true, fontSize: 12, color: '#fff' },
                        itemStyle: { color: '#900' }
                    }
                }
            ]
        });

        const resizeObserver = new ResizeObserver(() => chart.resize());
        resizeObserver.observe(chartRef.current);

        return () => {
            chart.dispose();
            resizeObserver.disconnect();
        };
    }, [data, zKey]);

    return <div ref={chartRef} className="w-full h-[500px]" />;
};

export default Bar3DChart;