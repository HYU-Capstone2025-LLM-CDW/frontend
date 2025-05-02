"use client";

import Link from 'next/link';
import { Bell, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // userEmail 쿠키가 있으면 로그인된 것으로 판단
    const cookie = document.cookie;
    setIsLoggedIn(cookie.includes("userEmail="));
  }, []);

  const handleLogout = () => {
    // userEmail 쿠키 제거
    document.cookie = "userEmail=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    window.location.href = "/";
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-10">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* 왼쪽: 로고 */}
          <div className="flex items-center">
            <span className="text-xl font-bold lg:ml-64">Clinical Datawarehouse</span>
          </div>

          {/* 오른쪽: 로그인/회원가입 or 로그아웃 */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-black"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-black"
                >
                  회원가입
                </Link>
              </>
            )}
            <Bell className="h-6 w-6 cursor-pointer" />
            <User className="h-6 w-6 cursor-pointer" />
          </div>
        </div>
      </div>
    </nav>
  );
}
