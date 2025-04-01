interface DataTableProps {
    data: Array<Record<string, string | number | null>>;
}

export default function DataTable({ data }: DataTableProps) {
    if (!data || data.length === 0) {
        return <p className="text-gray-500">📭 테이블에 표시할 데이터가 없습니다.</p>;
    }

    const columns = Object.keys(data[0]);

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-100">
                <tr>
                    {columns.map((col) => (
                        <th key={col} className="border px-4 py-2 text-sm font-semibold">
                            {col}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                        {columns.map((col) => (
                            <td key={col} className="border px-4 py-2 text-sm text-center">
                                {row[col] ?? 'N/A'}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
