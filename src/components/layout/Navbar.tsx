"use client";

import Link from 'next/link';
import { Bell, User } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-10">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold lg:ml-64">Clinical Datawarehouse</span>
            </div>
          </div>
          <div className="flex items-center">
            <Bell className="h-6 w-6 mr-4 cursor-pointer" />
            <User className="h-6 w-6 cursor-pointer" />
          </div>
        </div>
      </div>
    </nav>
  );
}