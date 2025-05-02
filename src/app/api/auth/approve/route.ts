import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    await db.query(
      `UPDATE users SET status = 'APPROVED' WHERE email = $1`,
      [email]
    );

    // 메일 발송
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "회원가입 승인 완료",
      text: "회원가입이 승인되었습니다. 로그인 후 서비스를 이용해주세요.",
    });

    return NextResponse.json({ message: "승인 완료 및 메일 발송" }, { status: 200 });

  } catch (error) {
    console.error("승인 처리 중 오류:", error);
    return NextResponse.json({ message: "서버 오류" }, { status: 500 });
  }
}
