"use client";
import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  employee_number: string;
}

export default function AdminPage() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);

  const fetchPendingUsers = async () => {
    const response = await fetch("/api/auth/pending");
    const data = await response.json();
    setPendingUsers(data.users);
  };

  const handleApprove = async (email: string) => {
    const response = await fetch("/api/auth/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    alert(data.message);
    fetchPendingUsers(); // 목록 갱신
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h2>승인 대기중인 사용자</h2>
      {pendingUsers.length === 0 ? (
        <p>대기중인 사용자가 없습니다.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {pendingUsers.map((user) => (
            <li key={user.id} style={{
              padding: "16px",
              marginBottom: "16px",
              backgroundColor: "#f0f0f0",
              borderRadius: "8px"
            }}>
              <div><strong>이름:</strong> {user.name}</div>
              <div><strong>이메일:</strong> {user.email}</div>
              <div><strong>사번:</strong> {user.employee_number}</div>
              <button 
                onClick={() => handleApprove(user.email)}
                style={{
                  marginTop: "8px",
                  padding: "8px 16px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                승인하기
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
