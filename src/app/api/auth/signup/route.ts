import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";  // 꼭 bcryptjs
import { db } from "lib/db";   // db Pool 연결

export async function POST(req: Request) {
  try {
    const { name, email, password, employeeNumber } = await req.json();

    if (!name || !email || !password || !employeeNumber) {
      return NextResponse.json({ message: "모든 필드를 입력해주세요." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users (name, email, password_hash, employee_number, status)
       VALUES ($1, $2, $3, $4, 'PENDING')`,
      [name, email, hashedPassword, employeeNumber]
    );

    return NextResponse.json({ message: "회원가입 승인신청 완료" }, { status: 200 });

  } catch (error) {
    console.error("회원가입 중 오류 발생:", error);  // 터미널에 에러 찍힘
    return NextResponse.json({ message: "서버 오류" }, { status: 500 });
  }
}
