import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import axios from "axios";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, "g-recaptcha-response": token } = body;

        // ✅ 1. reCAPTCHA 검증
        const secret = process.env.RECAPTCHA_SECRET_KEY;
        const captchaResult = await axios.post(
            "https://www.google.com/recaptcha/api/siteverify",
            null,
            {
                params: {
                    secret,
                    response: token,
                },
            }
        );

        console.log("1️⃣ token:", token);

        console.log("2️⃣ secret:", secret);

        console.log("3️⃣ captcha response:", captchaResult.data);

        if (!captchaResult.data.success) {
            return NextResponse.json({ message: "로봇일 가능성이 있습니다." }, { status: 403 });
        }

        // ✅ 2. 사용자 이메일 확인
        const result = await db.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );

        if (!result.rows.length) {
            return NextResponse.json({ message: "아이디 또는 비밀번호가 올바르지 않습니다."}, { status: 401 })
        }

        const user = result.rows[0];

        // ✅ 3. 승인 상태 확인
        if (user.status !== "APPROVED") {
            return NextResponse.json({ message: "아직 관리자의 승인을 받지 않았습니다." }, { status: 403 });
        }

        if (user.account_locked) {
            return NextResponse.json({
                message: "비밀번호를 5회 이상 잘못 입력하였습니다. 본인 인증을 통해 비밀번호를 재설정해주세요."
            }, { status: 403 });
        }


        // ✅ 4. 비밀번호 비교
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            const newFailCount = user.login_fail_count + 1;

            await db.query(`UPDATE users
                            SET login_fail_count = $1
                            WHERE email = $2`, [newFailCount, email]);

            if (newFailCount >= 5) {
                await db.query(`UPDATE users
                                SET account_locked = TRUE
                                WHERE email = $1`, [email]);
                return NextResponse.json({message: `비밀번호 오류 횟수 : ${newFailCount}\n 비밀번호를 5회 이상 잘못 입력하였습니다. 본인 인증을 통해 비밀번호를 재설정해주세요.`}, {status: 403 });
            }

            return NextResponse.json({message: `아이디 또는 비밀번호가 올바르지 않습니다.\n비밀번호 오류 횟수 : ${newFailCount}\n비밀번호를 5회 이상 잘못 입력하시면 계정이 잠깁니다.`}, { status: 401});
        }

        await db.query(`UPDATE users SET login_fail_count = 0, account_locked = FALSE WHERE email = $1`, [email]);

        // ✅ 5. 로그인 성공 → 쿠키 설정
        const response = NextResponse.json({ message: "로그인 성공" }, { status: 200 });
        response.headers.set(
            "Set-Cookie",
            `userEmail=${email}; Path=/; Max-Age=86400; SameSite=Lax`
        );

        return response;

    } catch (error) {
        console.error("로그인 처리 중 오류:", error);
        return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}
