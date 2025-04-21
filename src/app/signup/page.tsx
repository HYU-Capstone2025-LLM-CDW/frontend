"use client";

import { useState } from "react";

export default function Page() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        department: "",
        institution: "",
        password: "",
        agree: false,
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
        if (!formData.agree) {
            alert("약관에 동의해야 회원가입이 가능합니다.");
            return;
        }
        console.log("회원가입 요청:", formData);
        // 회원가입 요청 처리 로직 (API 호출 등)
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">회원가입</h2>

                <label className="block text-gray-700 mb-2">이름</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mb-4 w-full px-3 py-2 border rounded"
                    required
                />

                <label className="block text-gray-700 mb-2">이메일</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mb-4 w-full px-3 py-2 border rounded"
                    required
                />

                <label className="block text-gray-700 mb-2">기관명</label>
                <select name="institution" className="mb-4 w-full px-1.5 py-2 border rounded">
                    <option value="">기관을 선택하세요</option>
                    <option>한양대학교병원</option>
                    <option>한양대학교 구리병원</option>
                </select>


                <label className="block text-gray-700 mb-2">부서</label>
                <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="mb-4 w-full px-3 py-2 border rounded"
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

                <div className="flex items-center mb-4">
                    <input
                        type="checkbox"
                        name="agree"
                        checked={formData.agree}
                        onChange={handleChange}
                        className="mr-2"
                    />
                    <label className="text-sm text-gray-600">
                        <span className="font-medium text-gray-800">이용약관</span>에 동의합니다.
                    </label>
                </div>

                <button
                    type="submit"
                    className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
                >
                    회원가입
                </button>
            </form>
        </div>
    );
}
