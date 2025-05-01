import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { question } = await req.json();

    try {
        const duckdnsRes = await fetch("https://api-hyu.duckdns.org/sql-generator/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: question })
        });

        // 예: /app/api/ask-ai/route.ts
        const data = await duckdnsRes.json();

        if (duckdnsRes.status === 422) {
            const errorMsg = data?.detail?.[0]?.msg || "유효성 오류가 발생했습니다.";
            return NextResponse.json({
                sql: data.sql,
                error: data.error,
                debug: data,
                answer: `❌ [422 오류] ${errorMsg}`
            });
        }

        if (data.error) {
            return NextResponse.json({
                sql: data.sql,
                error: data.error,
                debug: data,
                answer: `❌ DuckDNS 오류: ${data.error}`
            });
        }

        const sql = data.sql;
        return NextResponse.json({
            sql: data.sql,
            error: data.error,
            debug: data,
            answer: (sql ? sql : `❌ SQL이 생성되지 않았습니다.\n\n${JSON.stringify(data, null, 2)}`)
        });

    } catch (err) {
        console.error("❌ API 호출 실패:", err);
        return NextResponse.json({ answer: "❌ 서버 오류로 응답을 받을 수 없습니다." });
    }
}
