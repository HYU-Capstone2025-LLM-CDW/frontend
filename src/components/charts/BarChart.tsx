import React from 'react';

interface ChartData {
  message: string;
}

const CustomBarChart: React.FC<{ data: ChartData }> = ({ data }) => {
  return <div>{data.message}</div>;
};

export default CustomBarChart;
