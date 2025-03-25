"use client";

import Link from "next/link";
import { Home, BarChart2, Users, FolderPlus, Settings, LucideIcon } from "lucide-react";
import { useState } from "react";

interface MenuItem {
    href: string;
    icon: LucideIcon;
    text: string;
}

const menuItems: MenuItem[] = [
    { href: "/", icon: Home, text: "홈" },
    { href: "/analysis", icon: BarChart2, text: "데이터 분석" },
    { href: "/patients", icon: Users, text: "환자 관리" },
    { href: "/cohorts", icon: FolderPlus, text: "코호트 관리" },
    { href: "/settings", icon: Settings, text: "설정" },
];

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                className="fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-md lg:hidden"
                onClick={() => setIsOpen(!isOpen)}
            >
                ☰
            </button>
            <div className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white p-4 overflow-y-auto transition-transform transform ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 z-40`}>
                <h2 className="text-xl font-bold mb-6 text-center lg:text-left">CDW Dashboard</h2>
                <nav>
                    <ul>
                        {menuItems.map((item, index) => (
                            <li key={index} className="mb-2">
                                <Link href={item.href} className="flex items-center text-white hover:bg-gray-700 px-4 py-2 rounded">
                                    <item.icon className="mr-2" size={20} />
                                    <span>{item.text}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setIsOpen(false)}></div>}
        </>
    );
}