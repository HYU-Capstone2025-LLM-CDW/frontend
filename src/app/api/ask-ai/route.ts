// app/api/ask-ai/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { question } = await req.json();

    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ answer: "❌ OpenAI API 키가 없습니다." }, { status: 500 });
        }

        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a helpful assistant that returns SQL queries when appropriate." },
                    { role: "user", content: question }
                ]
            })
        });

        const data = await openaiRes.json();
        console.log("🔍 OpenAI 응답 데이터:", JSON.stringify(data, null, 2));

        const answer = data?.choices?.[0]?.message?.content;

        if (!answer) {
            return NextResponse.json({ answer: "❌ OpenAI로부터 유효한 답변을 받지 못했습니다." }, { status: 500 });
        }

        return NextResponse.json({ answer });

    } catch (err) {
        console.error("❌ OpenAI API 호출 실패:", err);
        return NextResponse.json({ answer: "서버 오류로 AI 응답을 받을 수 없습니다." }, { status: 500 });
    }
}
