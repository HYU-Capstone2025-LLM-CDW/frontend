"use client";

import { useState } from "react";

export default function Page() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("로그인 요청:", formData);
        // 로그인 요청 처리 로직 (API 호출 등)
    };


    return (
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
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="mb-4 w-full px-3 py-2 border rounded"
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
                >
                    로그인
                </button>
            </form>
        </div>
    )
}