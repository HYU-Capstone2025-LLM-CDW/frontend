"use client";

import { useState } from "react";
import Script from "next/script";
declare const grecaptcha: any;

export default function Page() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = grecaptcha.getResponse();

        if (!token) {
            alert("로봇 인증을 먼저 완료해 주세요.");
            return;
        }

        const payload = {
            ...formData,
            "g-recaptcha-response": token,
        };

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                alert("로그인 성공: " + data.message);
                window.location.href = "/";
            } else {
                alert("실패: " + data.message);
            }
        } catch (err) {
            console.error("로그인 중 오류:", err);
            alert("서버 오류가 발생했습니다.");
        } finally {
            grecaptcha.reset(); // ✅ reCAPTCHA 초기화
        }
    };


    return (
        <>
            <Script src="https://www.google.com/recaptcha/api.js" async defer></Script>

            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-md"
                >
                    <h2 className="text-2xl font-bold mb-6 text-center">로그인</h2>

                    <label className="block text-gray-700 mb-2">이메일</label>
                    <input
                        type="text"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mb-4 w-full px-3 py-2 border rounded"
                        required
                    />

                    <label className="block text-gray-700 mb-2">비밀번호</label>
                    <div className="relative mb-4">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="mb-4 w-full px-3 py-2 border rounded"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-[75%] text-gray-600"
                            style={{ zIndex: 10 }}
                            tabIndex={-1}
                        >
                            <img
                                src={showPassword ? "/images/eye.png" : "/images/eye_password.png"}
                                alt="비밀번호 보기"
                                className={"w-5 h-5"}
                            />
                        </button>
                    </div>
                    <div className="mb-4 w-full">
                        <div id="google_recaptha">
                            <div className="g-recaptcha"
                                 data-sitekey="6LcPgyorAAAAAB7zVAm3YDdodw7UgAOiRdl3rCww"
                                 style={{
                                     width: "100%",
                                     transform: "scale(1)",
                                     transformOrigin: "0 0"
                                 }}
                            ></div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
                    >
                        로그인
                    </button>
                </form>
            </div>

        </>

    )
}
