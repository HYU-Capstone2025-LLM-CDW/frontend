"use client";

import { useEffect, useRef, useState } from "react";
import { BarChart3, LineChart, PieChart } from "lucide-react";
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

    const fetchChartData = async () => {
        try {
            setCurrentChartType("table");
            const response = await fetch("/api/chart-data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
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
            setColumnNames(Object.keys(cleanedData[0]));
            setCurrentChartType("table");
            renderTable(cleanedData);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const filteredData = limit ? globalData.slice(0, limit) : globalData;

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
            .map(
                (row) =>
                    `<tr>${validColumns
                        .map((key) => `<td class='border px-2 py-1'>${row[key]}</td>`)
                        .join("")}</tr>`
            )
            .join("")}
        </tbody>
      </table>`;

        chartRef.current.innerHTML = tableHtml;
    };

    const renderChart = (type: string) => {
        if (!chartRef.current || !filteredData.length) return;

        const chart = echarts.init(chartRef.current);
        setCurrentChartType(type);

        if (type === "bar3D") {
            const data = filteredData.map((row) => [row[xAxis], row[yAxis], isNaN(Number(row[zAxis])) ? 0 : Number(row[zAxis])]);
            chart.setOption({
                tooltip: {
                    formatter: (params: any) => `${xAxis}: ${params.value[0]}<br>${yAxis}: ${params.value[1]}<br>${zAxis}: ${params.value[2]}`,
                },
                title: {
                    text: "3D 막대그래프",
                    left: "center",
                    subtext: `X축: ${xAxis}, Y축: ${yAxis}, Z축(값): ${zAxis}`,
                    subtextStyle: { color: "#666" },
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
                series: [
                    {
                        type: "bar3D",
                        data: data.map((item) => ({ value: item })),
                        shading: "lambert",
                        label: { show: false },
                        emphasis: {
                            label: { show: true, fontSize: 12, color: "#fff" },
                            itemStyle: { color: "#900" },
                        },
                    },
                ],
            });
        } else if (type === "pie") {
            const x = xAxis;
            const y = yAxis;
            const data = filteredData.map((row) => ({
                name: `${row[x]}`,
                value: isNaN(Number(row[y])) ? 0 : Number(row[y]),
            }));

            chart.setOption({
                title: {
                    text: "파이 차트",
                    left: "center",
                    subtext: `카테고리: ${x}, 값: ${y}`,
                    subtextStyle: { color: "#666" },
                },
                tooltip: {
                    trigger: "item",
                    formatter: (params: any) => `${params.name}<br>${y}: ${params.value.toLocaleString()} (${params.percent}%)`,
                },
                legend: {
                    orient: "vertical",
                    left: "left",
                    type: "scroll",
                    formatter: (name: string) => (name.length > 15 ? name.slice(0, 15) + "..." : name),
                },
                series: [
                    {
                        type: "pie",
                        radius: "50%",
                        data,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: "rgba(0, 0, 0, 0.5)",
                            },
                        },
                        label: {
                            formatter: "{b}: {d}%",
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
        if (currentChartType === "pie") renderChart("pie");
        else if (currentChartType === "table") renderTable(filteredData);
        else if (currentChartType === "bar3D") renderChart("bar3D");
        else renderChart(currentChartType);
    }, [xAxis, yAxis, zAxis]);

    return (
        <div className="font-sans text-center">
            <h1 className="text-3xl font-bold mt-6">CDW 데이터 시각화</h1>

            <div className="w-4/5 mx-auto my-4 flex flex-col items-end bg-white p-4 rounded-lg">
        <textarea
            id="queryInput"
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

            <div className="flex flex-wrap justify-start ml-[10%]">
                <div className="m-4 text-left">
                    <h3 className="font-semibold mb-2">🔹 그래프 축 선택</h3>
                    <select
                        value={xAxis}
                        onChange={(e) => setXAxis(e.target.value)}
                        className="block my-1 border rounded px-3 py-2"
                    >
                        <option value="">x축 선택</option>
                        {columnNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={yAxis}
                        onChange={(e) => setYAxis(e.target.value)}
                        className="block my-1 border rounded px-3 py-2"
                    >
                        <option value="">y축 선택</option>
                        {columnNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={zAxis}
                        onChange={(e) => setZAxis(e.target.value)}
                        className="block my-1 border rounded px-3 py-2"
                    >
                        <option value="">z축 선택</option>
                        {columnNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 데이터 수 제한 입력 */}
            <div className="mb-4 ml-4">
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
                <button
                    className="ml-2 bg-gray-300 px-2 py-1 rounded hover:bg-gray-400"
                    onClick={fetchChartData}
                >
                </button>
                <span className="ml-4 text-gray-500">
                  총 {globalData.length}개 데이터 조회됨
                </span>
            </div>


            <h3 className="text-xl mt-6">📊 원하는 시각화 선택:</h3>
            <div className="flex justify-center flex-wrap gap-4 mt-2">
                <ChartButton label={<BarChart3 className="w-5 h-5" />} onClick={() => renderChart("bar")} />
                <ChartButton label={<LineChart className="w-5 h-5" />} onClick={() => renderChart("line")} />
                <ChartButton label="산점도 그래프 (X, Y)" icon="scatter" onClick={() => renderChart("scatter")} />
                <ChartButton label="3D 막대 그래프 (X, Y, Z)" icon="3d-bar-chart" onClick={() => renderChart("bar3D")} />
                <ChartButton label="파이 차트 (X, Y)" icon="pie-chart" onClick={() => renderChart("pie")} />
                <ChartButton label="테이블 보기" icon="table" onClick={() => renderTable(filteredData)} />
            </div>

            <div ref={chartRef} id="chart" className="w-4/5 h-[500px] mx-auto my-4" />
        </div>
    );
}

function ChartButton({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200 active:bg-gray-300"
        >
            <img
                src={`https://cdn.iconscout.com/icon/premium/png-512-thumb/${icon}.png?f=webp&w=512`}
                alt=""
                className="w-6 h-6"
            />
            {label}
        </button>
    );
}
