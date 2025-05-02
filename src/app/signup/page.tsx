"use client";
import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");

  const handleSignup = async () => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, employeeNumber }),
    });
    const data = await response.json();

    // ✅ 알림 메시지에 승인 필요 안내 포함
    alert(`${data.message}\n\n관리자의 승인이 완료된 후 로그인하실 수 있습니다.`);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f5f5f5"
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        width: "350px",
        textAlign: "center"
      }}>
        <h2 style={{ marginBottom: "16px", fontSize: "24px", color: "#333" }}>회원가입</h2>

        {/* ✅ 승인 안내 메시지 박스 */}
        <p style={{
          fontSize: "14px",
          color: "#555",
          marginBottom: "24px"
        }}>
          가입 후 관리자의 승인을 받은 후에<br />로그인이 가능합니다.
        </p>

        <input
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="병원 사번"
          value={employeeNumber}
          onChange={(e) => setEmployeeNumber(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleSignup} style={buttonStyle}>
          회원가입
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  marginBottom: "16px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  fontSize: "16px"
};

const buttonStyle = {
  width: "100%",
  padding: "12px 16px",
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  cursor: "pointer",
  marginTop: "8px"
};
