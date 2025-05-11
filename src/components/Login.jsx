import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ip from "./ip";
import logo from "../assets/logo.jpeg";
import "../styles/Login.css";

export default function Login() {
  const [teamCode, setTeamCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${ip}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamCode, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const { role, token } = data;
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("team", teamCode);
        navigate(`/${role}`);
      } else {
        setError(data.message || "❌ اسم المستخدم أو كلمة المرور غير صحيحة");
      }
    } catch (err) {
      setError("❌ خطأ في الاتصال بالسيرفر");
    }
  };

  return (
    <div className="login-container">
      <div className="logo-wrapper">
        <img src={logo} alt="RUA Logo" className="animated-logo" />
        <h2 className="brand-text">Rua Alafaq</h2>
      </div>

      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="رمز الفريق"
          value={teamCode}
          onChange={(e) => setTeamCode(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error-text">{error}</p>}
        <button type="submit">دخول</button>
      </form>
    </div>
  );
}
