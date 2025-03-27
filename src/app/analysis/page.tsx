"use client";

import { useState, useEffect } from 'react';
import Layout from "@/components/layout/Layout";
import Card from "@/components/ui/Card";
import CustomBarChart from "@/components/charts/BarChart";
import Dropdown from "@/components/ui/Dropdown";

// API 호출 함수를 여기로 이동
async function fetchChartData(dataType: string, xAxis: string, yAxis: string, chartType: string) {
  const response = await fetch('/api/chart-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ dataType, xAxis, yAxis, chartType }),
  });
  
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  
  const data = await response.text();
  return { message: data };
}

export default function AnalysisPage() {
    const [selectedDataType, setSelectedDataType] = useState('cost');
    const [selectedXAxis, setSelectedXAxis] = useState('total_cost');
    const [selectedYAxis, setSelectedYAxis] = useState('total_paid');
    const [selectedChartType, setSelectedChartType] = useState('bar_chart');
    const [chartData, setChartData] = useState<{ message: string } | null>(null);

    const dataTypeOptions = ['cost', 'concept', 'drug_exposure'];
    const axisOptions = ['total_cost', 'total_paid', 'total_charge'];
    const chartTypeOptions = ['line_chart', 'pie_chart', 'bar_chart'];

    useEffect(() => {
        async function loadChartData() {
            try {
                const data = await fetchChartData(selectedDataType, selectedXAxis, selectedYAxis, selectedChartType);
                setChartData(data);
            } catch (error) {
                console.error('Failed to fetch chart data:', error);
            }
        }

        loadChartData();
    }, [selectedDataType, selectedXAxis, selectedYAxis, selectedChartType]);

    return (
        <Layout>
            <div className="mb-6">
                <Dropdown
                    options={dataTypeOptions}
                    value={selectedDataType}
                    onChange={setSelectedDataType}
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <Card 
                    title="X축" 
                    options={axisOptions}
                    value={selectedXAxis}
                    onOptionChange={setSelectedXAxis}
                />
                <Card 
                    title="Y축" 
                    options={axisOptions}
                    value={selectedYAxis}
                    onOptionChange={setSelectedYAxis}
                />
                <Card 
                    title="차트 종류" 
                    options={chartTypeOptions}
                    value={selectedChartType}
                    onOptionChange={setSelectedChartType}
                />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">{selectedXAxis} 대 {selectedYAxis} 분포 ({selectedChartType})</h2>
                {chartData ? (
                    <CustomBarChart data={chartData} />
                ) : (
                    <p>Loading chart data...</p>
                )}
            </div>
        </Layout>
    );
}