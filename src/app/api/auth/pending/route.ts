import { NextResponse } from "next/server";
import { db } from "lib/db";

export async function GET() {
  try {
    const result = await db.query(`
      SELECT id, name, email, employee_number
      FROM users
      WHERE status = 'PENDING'
    `);

    return NextResponse.json({ users: result.rows }, { status: 200 });

  } catch (error) {
    console.error("승인 대기 목록 가져오기 오류:", error);
    return NextResponse.json({ message: "서버 오류" }, { status: 500 });
  }
}
