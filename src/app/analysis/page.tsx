"use client";

import { useEffect, useRef, useState } from "react";
import 'echarts-gl';
import * as echarts from "echarts";

interface ChartRow {
    [key: string]: string | number;
}

export default function Page() {
    const chartRef = useRef<HTMLDivElement>(null);
    const [sql, setSql] = useState("");
    const [xAxis, setXAxis] = useState("");
    const [yAxis, setYAxis] = useState("");
    const [zAxis, setZAxis] = useState("");
    const [limit, setLimit] = useState<number | undefined>(undefined);
    const [globalData, setGlobalData] = useState<ChartRow[]>([]);
    const [columnNames, setColumnNames] = useState<string[]>([]);
    const [currentChartType, setCurrentChartType] = useState<string | null>(null);
    const [hoveredAxis, setHoveredAxis] = useState<string | null>(null);

    const fetchChartData = async () => {
        try {
            setCurrentChartType("table");
            const response = await fetch("/api/chart-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sql }),
            });

            if (!response.ok) throw new Error("쿼리 요청 실패");
            const result = await response.json();

            const cleanedData = result.data.map((row: any) => {
                const cleanedRow: ChartRow = {};
                for (const key in row) {
                    cleanedRow[key] = row[key] !== null ? row[key] : "N/A";
                }
                return cleanedRow;
            });

            if (cleanedData.length === 0) {
                alert("조회된 데이터가 없습니다.");
                return;
            }

            setGlobalData(cleanedData);
            setColumnNames(
                Object.keys(cleanedData[0]).filter(key =>
                    cleanedData.some(row => row[key] !== "N/A")
                )
            );
            setCurrentChartType("table");
            renderTable(cleanedData);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const filteredData = limit ? globalData.slice(0, limit) : globalData;

    const calculateSummary = (col: string) => {
        const values = filteredData.map(row => Number(row[col])).filter(val => !isNaN(val));
        if (values.length === 0) return null;

        const sorted = [...values].sort((a, b) => a - b);
        const median = sorted.length % 2 === 0
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            : sorted[Math.floor(sorted.length / 2)];

        return {
            mean: values.reduce((a, b) => a + b, 0) / values.length,
            median,
            max: Math.max(...values),
            min: Math.min(...values),
            count: values.length,
        };
    };

    const renderTable = (data: ChartRow[]) => {
        if (!chartRef.current) return;
        const validColumns = columnNames.filter((key) => data.some((row) => row[key] !== "N/A"));

        const tableHtml = `
            <table class="w-full border">
                <thead>
                    <tr>${validColumns.map((key) => `<th class='border px-2 py-1'>${key}</th>`).join("")}</tr>
                </thead>
                <tbody>
                    ${data
            .map(row => `<tr>${validColumns.map(key => `<td class='border px-2 py-1'>${row[key]}</td>`).join("")}</tr>`)
            .join("")}
                </tbody>
            </table>`;

        chartRef.current.innerHTML = tableHtml;
    };

    const renderChart = (type: string) => {
        if (!chartRef.current || !filteredData.length) return;

        if (echarts.getInstanceByDom(chartRef.current)) {
            echarts.dispose(chartRef.current);
        }

        const chart = echarts.init(chartRef.current);
        setCurrentChartType(type);

        if (type === "bar3D") {
            const data = filteredData.map((row) => [row[xAxis], row[yAxis], isNaN(Number(row[zAxis])) ? 0 : Number(row[zAxis])]);
            chart.setOption({
                tooltip: {
                    formatter: (params: any) => `${xAxis}: ${params.value[0]}<br>${yAxis}: ${params.value[1]}<br>${zAxis}: ${params.value[2]}`,
                },
                title: {
                    text: "3D bar 그래프",
                    left: "center"
                },
                xAxis3D: { type: "category", name: xAxis, nameTextStyle: { fontWeight: "bold" } },
                yAxis3D: { type: "category", name: yAxis, nameTextStyle: { fontWeight: "bold" } },
                zAxis3D: { type: "value", name: zAxis, nameTextStyle: { fontWeight: "bold" } },
                grid3D: {
                    boxWidth: 100,
                    boxDepth: 80,
                    viewControl: { projection: "orthographic", autoRotate: true },
                    axisLabel: { show: true },
                },
                series: [{
                    type: "bar3D",
                    data: data.map((item) => ({ value: item })),
                    shading: "lambert",
                    label: { show: false },
                    emphasis: {
                        label: { show: true, fontSize: 12, color: "#fff" },
                        itemStyle: { color: "#900" },
                    },
                }],
            });
        } else if (type === "pie") {
            const pieData = filteredData.map((row) => ({
                name: row[xAxis],
                value: isNaN(Number(row[yAxis])) ? 0 : Number(row[yAxis]),
            }));

            chart.setOption({
                title: {
                    text: "pie 차트",
                    left: "center",
                },
                tooltip: {
                    trigger: "item",
                    formatter: "{a} <br/>{b} : {c} ({d}%)",
                },
                series: [
                    {
                        name: yAxis,
                        type: "pie",
                        radius: "55%",
                        center: ["50%", "50%"],
                        data: pieData,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: "rgba(0, 0, 0, 0.5)",
                            },
                        },
                    },
                ],
            });
        } else {
            const xData = filteredData.map((row) => row[xAxis]);
            const yData = filteredData.map((row) => (isNaN(Number(row[yAxis])) ? 0 : Number(row[yAxis])));

            chart.setOption({
                title: { text: `${type} 그래프`, left: "center" },
                xAxis: {
                    type: "category",
                    data: xData,
                    name: xAxis,
                    nameLocation: "middle",
                    nameGap: 30,
                    nameTextStyle: { fontWeight: "bold" },
                },
                yAxis: {
                    type: "value",
                    name: yAxis,
                    nameLocation: "middle",
                    nameGap: 50,
                    nameTextStyle: { fontWeight: "bold" },
                },
                tooltip: {
                    trigger: "axis",
                    formatter: (params: any) => `${xAxis}: ${params[0].name}<br>${yAxis}: ${params[0].value}`,
                },
                series: [
                    {
                        type,
                        data: yData,
                        name: yAxis,
                    },
                ],
            });
        }
    };

    useEffect(() => {
        if (!currentChartType || currentChartType === "table") return;
        renderChart(currentChartType);
    }, [xAxis, yAxis, zAxis, limit]);

    const renderSummaryTooltip = (col: string) => {
        const summary = calculateSummary(col);
        if (!summary) return null;
        return (
            <div className="absolute z-10 bg-white border border-gray-300 rounded-md shadow-lg text-sm p-2 whitespace-nowrap">
                <p><strong>{col} 요약</strong></p>
                <p>개수: {summary.count}</p>
                <p>평균: {summary.mean.toFixed(2)}</p>
                <p>중앙값: {summary.median}</p>
                <p>최댓값: {summary.max}</p>
                <p>최솟값: {summary.min}</p>
            </div>
        );
    };

    return (
        <div className="font-sans text-center">
            <h1 className="text-3xl font-bold mt-6">CDW 데이터 시각화</h1>

            <div className="w-4/5 mx-auto my-4 flex flex-col items-end bg-white p-4 rounded-lg">
                <textarea
                    rows={4}
                    placeholder="SQL 쿼리를 입력하세요."
                    className="w-full mb-2 border rounded p-2"
                    value={sql}
                    onChange={(e) => setSql(e.target.value)}
                />
                <button
                    onClick={fetchChartData}
                    className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200 active:bg-gray-300"
                >
                    쿼리 실행
                </button>
            </div>

            <div className="flex justify-center gap-4 flex-wrap">
                {['xAxis', 'yAxis', currentChartType === 'bar3D' ? 'zAxis' : null].filter(Boolean).map(axis => {
                    const value = axis === 'xAxis' ? xAxis : axis === 'yAxis' ? yAxis : zAxis;
                    return (
                        <div
                            key={axis}
                            className="relative"
                            onMouseEnter={() => setHoveredAxis(axis!)}
                            onMouseLeave={() => setHoveredAxis(null)}
                        >
                            <select
                                value={value}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (axis === 'xAxis') setXAxis(val);
                                    else if (axis === 'yAxis') setYAxis(val);
                                    else setZAxis(val);
                                }}
                                className="border rounded px-3 py-2"
                            >
                                <option value="">{axis?.charAt(0)}축 선택</option>
                                {columnNames.map((name) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                            {hoveredAxis === axis && value && (
                                <div className="absolute left-full ml-2 top-0">
                                    {renderSummaryTooltip(value)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="my-6 flex justify-center">
                <div className="text-left">
                    <h3 className="font-semibold">🔹 상위 데이터 개수</h3>
                    <label htmlFor="rowLimitInput">개수 입력: </label>
                    <input
                        type="number"
                        id="rowLimitInput"
                        min={1}
                        value={limit || ""}
                        onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setLimit(isNaN(value) ? undefined : value);
                        }}
                        className="border rounded px-3 py-1 ml-2"
                        placeholder="숫자 입력"
                    />
                    <span className="ml-4 text-gray-500">
                        총 {globalData.length}개 데이터 조회됨
                    </span>
                </div>
            </div>

            <h3 className="font-semibold">📊 원하는 시각화 선택:</h3>
            <div className="flex justify-center flex-wrap gap-4 mt-2">
                <ChartButton label={<img src="/images/bar.png" alt="Bar Chart" />} onClick={() => renderChart("bar")} />
                <ChartButton label={<img src="/images/line.png" alt="Line Chart" />} onClick={() => renderChart("line")} />
                <ChartButton label={<img src="/images/scatter.png" alt="Scatter Chart" />} onClick={() => renderChart("scatter")} />
                <ChartButton label={<img src="/images/bar.png" alt="bar3D Chart" />} onClick={() => renderChart("bar3D")} />
                <ChartButton label={<img src="/images/pie.png" alt="pie Chart" />} onClick={() => renderChart("pie")} />
                <ChartButton label={<img src="/images/table.png" alt="Table Chart" />} onClick={() => renderTable(filteredData)} />
            </div>

            <div ref={chartRef} id="chart" className="w-4/5 h-[500px] mx-auto my-4" />
        </div>
    );
}

function ChartButton({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center justify-center w-20 h-20 border rounded-2xl shadow-md text-6xl hover:bg-gray-100 transition"
        >
            {label}
        </button>
    );
}
