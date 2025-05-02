import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 사용자 이메일로 정보 조회
    const result = await db.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ message: "존재하지 않는 사용자입니다." }, { status: 401 });
    }

    const user = result.rows[0];

    // 승인 여부 확인
    if (user.status !== "APPROVED") {
      return NextResponse.json({ message: "아직 관리자의 승인을 받지 않았습니다." }, { status: 403 });
    }

    // 비밀번호 확인
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return NextResponse.json({ message: "비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    // ✅ 로그인 성공 → 쿠키 설정
    const response = NextResponse.json({ message: "로그인 성공" }, { status: 200 });
    response.headers.set("Set-Cookie", `userEmail=${email}; Path=/; Max-Age=86400; SameSite=Lax`);

    return response;

  } catch (error) {
    console.error("로그인 처리 중 오류:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
