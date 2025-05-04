"use client";

import { useEffect, useRef, useState } from "react";
import 'echarts-gl';
import * as echarts from "echarts";

interface ChartRow {
    [key: string]: string | number | null;
}

export default function AnalysisPage() {
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

    const fetchChartData = async (customQuery?: string) => {
        try {
            const queryToRun = customQuery || sql;
            setCurrentChartType("table");

            const response = await fetch(`${process.env.NEXT_PUBLIC_OPEN_API}/sql-executor/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ sql: queryToRun })
            });

            const result: { data?: ChartRow[]; error?: string; detail?: any } = await response.json();
            console.log("📦 DuckDNS 응답 전체:", JSON.stringify(result, null, 2));

            if (response.status === 422) {
                const msg = result?.detail?.[0]?.msg || "유효성 오류 발생";
                throw new Error(`422 오류: ${msg}`);
            }

            if (!response.ok || result.error) {
                throw new Error(result.error || `서버 오류: HTTP ${response.status}`);
            }

            if (!Array.isArray(result.data)) {
                throw new Error("데이터 형식이 올바르지 않습니다.");
            }

            // 초기화
            setXAxis("");
            setYAxis("");
            setZAxis("");
            setLimit(undefined);

            setGlobalData(result.data);
            setColumnNames(
                Object.keys(result.data[0]).filter(key =>
                    result.data!.some(row => row[key] !== "N/A")
                )
            );

            setCurrentChartType("table");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "알 수 없는 오류";
            console.error("SQL 실행 오류:", message);
            alert("❌ SQL 실행 오류: " + message);
        }
    };

    useEffect(() => {
        const stored = sessionStorage.getItem("custom_sql");
        if (stored) {
            setSql(stored);
            fetchChartData(stored);
            sessionStorage.removeItem("custom_sql");
        }
    }, []);

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

    useEffect(() => {
        if (!currentChartType || currentChartType === "table") return;
        renderChart(currentChartType);
    }, [xAxis, yAxis, zAxis, limit]);

    const renderChart = (type: string) => {
        if (!chartRef.current || !filteredData.length) return;
        if (echarts.getInstanceByDom(chartRef.current)) {
            echarts.dispose(chartRef.current);
        }

        const chart = echarts.init(chartRef.current);
        setCurrentChartType(type);

        if (type === "bar3D") {
            const data = filteredData.map(row => [row[xAxis], row[yAxis], isNaN(Number(row[zAxis])) ? 0 : Number(row[zAxis])]);
            chart.setOption({
                tooltip: {
                    formatter: (params: any) => `${xAxis}: ${params.value[0]}<br>${yAxis}: ${params.value[1]}<br>${zAxis}: ${params.value[2]}`,
                },
                title: { text: "3D bar 그래프", left: "center" },
                xAxis3D: { type: "category", name: xAxis },
                yAxis3D: { type: "category", name: yAxis },
                zAxis3D: { type: "value", name: zAxis },
                grid3D: { boxWidth: 100, boxDepth: 80, viewControl: { projection: "orthographic", autoRotate: true } },
                series: [{ type: "bar3D", data: data.map(item => ({ value: item })) }]
            });
        } else {
            const xData = filteredData.map(row => row[xAxis]);
            const yData = filteredData.map(row => isNaN(Number(row[yAxis])) ? 0 : Number(row[yAxis]));

            chart.setOption({
                title: { text: `${type} 그래프`, left: "center" },
                xAxis: { type: "category", data: xData, name: xAxis },
                yAxis: { type: "value", name: yAxis },
                tooltip: { trigger: "axis" },
                series: [{ type, data: yData }]
            });
        }
    };

    const renderTable = (data: ChartRow[]) => {
        if (!chartRef.current) return;
        const validColumns = columnNames.filter(key => data.some(row => row[key] !== "N/A"));

        const tableHtml = `
      <table class="w-full border">
        <thead><tr>${validColumns.map(key => `<th class='border px-2 py-1'>${key}</th>`).join("")}</tr></thead>
        <tbody>${data.map(row => `<tr>${validColumns.map(key => `<td class='border px-2 py-1'>${row[key]}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    `;

        chartRef.current.innerHTML = tableHtml;
    };

    const downloadChartImage = () => {
        const chartDom = document.getElementById("chart");
        if (!chartDom) return;
        const instance = echarts.getInstanceByDom(chartDom);
        if (!instance) {
            alert("그래프가 먼저 생성되어야 합니다.");
            return;
        }
        const base64 = instance.getDataURL({ type: "png", pixelRatio: 2 });
        const link = document.createElement("a");
        link.href = base64;
        link.download = "chart.png";
        link.click();
    };

    const downloadCSV = () => {
        if (!filteredData.length) {
            alert("다운로드할 데이터가 없습니다.");
            return;
        }

        const header = Object.keys(filteredData[0]);
        const rows = filteredData.map(row => header.map(h => `"${String(row[h] ?? "")}"`).join(","));
        const csvContent = [header.join(","), ...rows].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "table.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderSummaryTooltip = (col: string) => {
        const summary = calculateSummary(col);
        if (!summary) return null;
        return (
            <div className="absolute z-10 bg-white border p-2 rounded-md text-sm shadow-lg">
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
                    onClick={() => fetchChartData()}
                    className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200 active:bg-gray-300"
                >
                    쿼리 실행
                </button>
            </div>

            <div className="flex justify-center gap-4 flex-wrap">
                {["xAxis", "yAxis", currentChartType === "bar3D" ? "zAxis" : null].filter(Boolean).map(axis => {
                    const value = axis === "xAxis" ? xAxis : axis === "yAxis" ? yAxis : zAxis;
                    return (
                        <div
                            key={axis!}
                            className="relative"
                            onMouseEnter={() => setHoveredAxis(axis!)}
                            onMouseLeave={() => setHoveredAxis(null)}
                        >
                            <select
                                value={value}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (axis === "xAxis") setXAxis(val);
                                    else if (axis === "yAxis") setYAxis(val);
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
                                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-10">
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
                    <input
                        type="number"
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

            <div ref={chartRef} id="chart" className="relative w-4/5 h-[500px] mx-auto my-4" />

            <div className="absolute top-4 right-6 flex flex-row gap-2 z-20">
                <button
                    onClick={downloadChartImage}
                    className="px-4 py-2 text-white rounded"
                    style={{ backgroundColor: 'rgb(0, 188, 212)' }}
                >
                    그래프 다운로드
                </button>
                <button
                    onClick={downloadCSV}
                    className="px-4 py-2 text-white rounded"
                    style={{ backgroundColor: 'rgb(0, 188, 212)' }}
                >
                    테이블 CSV 다운로드
                </button>
            </div>
        </div>
    );
}

function ChartButton({ label, onClick }: { label: React.ReactNode; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center justify-center w-20 h-20 border rounded-2xl shadow-md text-6xl hover:bg-gray-100 transition"
        >
            {label}
        </button>
    );
}
