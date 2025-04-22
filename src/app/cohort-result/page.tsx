"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DataTable from "@/components/charts/DataTable";

interface RowData {
    [key: string]: string | number | null;
}

function isSQL(query: string): boolean {
    return /^\s*select\s+.+\s+from\s+/i.test(query);
}

export default function CohortResultPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [sql, setSql] = useState<string | null>(null);
    const [data, setData] = useState<RowData[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedSql = sessionStorage.getItem("cohort_sql");
        if (storedSql && isSQL(storedSql)) {
            setSql(storedSql);
        } else {
            setError("❌ SQL이 제공되지 않았거나 유효하지 않습니다.");
        }
    }, []);

    useEffect(() => {
        if (!sql || !isSQL(sql)) return;
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await fetch("/api/chart-data", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sql }),
                });
                const json = await res.json();
                const parsed = typeof json.message === "string"
                    ? (() => {
                        try {
                            return JSON.parse(json.message);
                        } catch {
                            throw new Error(json.message);
                        }
                    })()
                    : json.message;
                if (Array.isArray(parsed)) {
                    setData(parsed);
                } else {
                    setError("데이터 형식이 올바르지 않습니다.");
                }
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "알 수 없는 오류";
                setError("❌ " + message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [sql]);

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">🧬 코호트 결과</h1>

            {loading && <p className="text-gray-500">데이터 불러오는 중...</p>}
            {error && <p className="text-red-600 font-semibold">{error}</p>}
            {!loading && !error && data.length > 0 && <DataTable data={data} />}
        </div>
    );
}