import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { sql } = await req.json();

        const endpoint = process.env.NEXT_PUBLIC_OPEN_API + "/sql-executor/";

        const apiRes = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify({ sql })
        });

        const result = await apiRes.json();

        if (apiRes.status === 422) {
            const msg = result?.detail?.[0]?.msg || "유효성 오류 발생";
            return NextResponse.json({ error: msg }, { status: 422 });
        }

        if (!apiRes.ok || result.error) {
            return NextResponse.json(
                { error: result.error || `서버 오류: ${apiRes.status}` },
                { status: apiRes.status }
            );
        }

        return NextResponse.json({ data: result.data });
    } catch (err) {
        const message = err instanceof Error ? err.message : "서버 오류 발생";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
