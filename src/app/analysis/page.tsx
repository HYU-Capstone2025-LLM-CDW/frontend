"use client";

import { useState, useEffect } from 'react';
import Layout from "@/components/layout/Layout";
import BarChart from "@/components/charts/BarChart";
import LineChart from "@/components/charts/LineChart";
import PieChart from "@/components/charts/PieChart";
import ScatterChart from "@/components/charts/ScatterChart";
import DataTable from "@/components/charts/DataTable";
import Bar3DChart from "@/components/charts/Bar3dChart";

interface ChartRow {
    [key: string]: string | number | null;
}

export default function AnalysisPage() {
    const [customSql, setCustomSql] = useState('SELECT gender_concept_id, COUNT(*) AS value FROM cdmdatabaseschema."person" GROUP BY gender_concept_id');
    const [chartData, setChartData] = useState<ChartRow[]>([]);
    const [columnNames, setColumnNames] = useState<string[]>([]);
    const [xAxis, setXAxis] = useState('');
    const [yAxis, setYAxis] = useState('');
    const [zAxis, setZAxis] = useState('');
    const [chartType, setChartType] = useState('bar_chart');
    const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
    const [rowLimit, setRowLimit] = useState('all');
    const [errorMessage, setErrorMessage] = useState('');

    const chartTypeOptions = ['bar_chart', 'line_chart', 'pie_chart', 'scatter_chart', 'bar3d_chart'];
    const rowLimitOptions = ['10', '20', '50', '100', 'all'];

    useEffect(() => {
        const autoSql = sessionStorage.getItem("custom_sql");
        if (autoSql) {
            setCustomSql(autoSql);
            sessionStorage.removeItem("custom_sql");
            fetchCustomData(autoSql);
        }
    }, []);

    const fetchCustomData = async (sqlQuery?: string) => {
        try {
            const limitedSql = sqlQuery || customSql;
            const res = await fetch('/api/chart-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sql: limitedSql }),
            });

            const json = await res.json();
            const parsed = JSON.parse(json.message);

            if (Array.isArray(parsed) && parsed.length > 0) {
                setChartData(parsed);
                const columns = Object.keys(parsed[0]);
                setColumnNames(columns);
                setXAxis(columns[0]);
                setYAxis(columns[1] || columns[0]);
                setZAxis(columns[2] || columns[0]);
                setErrorMessage('');
            } else {
                setChartData([]);
                setErrorMessage('📭 결과가 비어있습니다.');
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : '알 수 없는 오류';
            console.error('쿼리 실행 오류:', message);
            setChartData([]);
            setErrorMessage('❌ 데이터를 불러오지 못했습니다.');
        }
    };

    const renderChartComponent = () => {
        const limitedData = rowLimit === 'all' ? chartData : chartData.slice(0, Number(rowLimit));

        switch (chartType) {
            case 'bar_chart':
                return <BarChart data={limitedData} xKey={xAxis} yKey={yAxis} />;
            case 'line_chart':
                return <LineChart data={limitedData} xKey={xAxis} yKey={yAxis} />;
            case 'pie_chart':
                return <PieChart data={limitedData} nameKey={xAxis} valueKey={yAxis} />;
            case 'scatter_chart':
                return <ScatterChart data={limitedData} xKey={xAxis} yKey={yAxis} />;
            case 'bar3d_chart': {
                if (!xAxis || !yAxis || !zAxis) {
                    return <p className="text-red-600 font-medium">❌ 3D 차트를 그릴 수 있는 데이터가 충분하지 않습니다.</p>;
                }

                const converted3DData = limitedData.filter(
                    (d): d is { x: string | number; y: string | number; z: number } =>
                        'x' in d && 'y' in d && 'z' in d && typeof d.z === 'number'
                );

                if (converted3DData.length === 0) {
                    return <p className="text-red-600 font-medium">❌ 유효한 3D 데이터가 없어 차트를 표시할 수 없습니다.</p>;
                }

                return <Bar3DChart data={converted3DData} zKey={zAxis} />;
            }
            default:
                return <p>지원하지 않는 차트 유형입니다.</p>;
        }
    };

    return (
        <Layout>
            <div className="mb-4">
                <textarea
                    className="w-full p-2 border rounded"
                    rows={4}
                    value={customSql}
                    onChange={(e) => setCustomSql(e.target.value)}
                    placeholder="SQL 쿼리를 입력하세요"
                />
                <div className="mt-2 flex gap-4">
                    <button onClick={() => fetchCustomData()} className="btn">쿼리 실행</button>
                    <div>
                        <label className="mr-2 font-medium">행 개수 제한:</label>
                        <select value={rowLimit} onChange={(e) => setRowLimit(e.target.value)} className="border p-2 rounded">
                            {rowLimitOptions.map(limit => (
                                <option key={limit} value={limit}>{limit === 'all' ? '전체' : `${limit}개`}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {chartData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block mb-1 font-medium">X축</label>
                        <select value={xAxis} onChange={(e) => setXAxis(e.target.value)} className="w-full border p-2 rounded">
                            {columnNames.map(col => <option key={col} value={col}>{col}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Y축</label>
                        <select value={yAxis} onChange={(e) => setYAxis(e.target.value)} className="w-full border p-2 rounded">
                            {columnNames.map(col => <option key={col} value={col}>{col}</option>)}
                        </select>
                    </div>
                    {chartType === 'bar3d_chart' && (
                        <div>
                            <label className="block mb-1 font-medium">Z축</label>
                            <select value={zAxis} onChange={(e) => setZAxis(e.target.value)} className="w-full border p-2 rounded">
                                {columnNames.map(col => <option key={col} value={col}>{col}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block mb-1 font-medium">차트 종류</label>
                        <select value={chartType} onChange={(e) => setChartType(e.target.value)} className="w-full border p-2 rounded">
                            {chartTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                </div>
            )}

            <div className="flex gap-2 mb-4">
                <button onClick={() => setViewMode('chart')} className="btn">차트 보기</button>
                <button onClick={() => setViewMode('table')} className="btn">테이블 보기</button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                {errorMessage ? (
                    <p className="text-red-600 font-medium">{errorMessage}</p>
                ) : viewMode === 'table' ? (
                    <DataTable data={rowLimit === 'all' ? chartData : chartData.slice(0, Number(rowLimit))} />
                ) : (
                    renderChartComponent()
                )}
            </div>
        </Layout>
    );
}
