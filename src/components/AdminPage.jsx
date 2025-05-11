import React, { useState, useEffect } from "react";
import ip from "./ip";
import "../styles/AdminPage.css";

export default function AdminPage() {
  const [teams, setTeams] = useState([]);
  const [newTeam, setNewTeam] = useState({
    code: "",
    role: "",
    password: ""
  });

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch(`${ip}/api/admin/users`);
        const data = await res.json();
        if (res.ok) {
          const formatted = data.map(u => ({
            code: u.teamCode,
            role: u.role
          }));
          setTeams(formatted);
        }
      } catch (err) {
        console.error("❌ خطأ في الاتصال:", err);
      }
    };

    fetchTeams();
  }, []);

  const handleInputChange = (field, value) => {
    setNewTeam({ ...newTeam, [field]: value });
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();

    const { code, role, password } = newTeam;
    const name = code;

    if (!code || !role || !password) {
      alert("من فضلك املأ جميع الحقول");
      return;
    }

    try {
      const response = await fetch(`${ip}/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, teamCode: code, role, password })
      });

      const data = await response.json();
      if (response.ok) {
        setTeams(prev => [...prev, { code, role }]);
        setNewTeam({ code: "", role: "", password: "" });
        alert("✅ تم إنشاء الفرقة بنجاح");
      } else {
        alert(`❌ فشل: ${data.message}`);
      }
    } catch (error) {
      alert("❌ فشل الاتصال");
    }
  };

  const handleDeleteTeam = async (teamCode) => {
    if (!window.confirm("هل أنت متأكد من الحذف؟")) return;

    try {
      const response = await fetch(`${ip}/api/admin/users/${teamCode}`, {
        method: "DELETE"
      });

      const data = await response.json();
      if (response.ok) {
        setTeams(prev => prev.filter(t => t.code !== teamCode));
        alert("✅ تم الحذف");
      } else {
        alert(`❌ فشل الحذف: ${data.message}`);
      }
    } catch (err) {
      alert("❌ خطأ بالسيرفر");
    }
  };

  return (
    <div className="admin-container">
      <h2>لوحة التحكم – المدير</h2>

      <form className="admin-form" onSubmit={handleCreateTeam}>
        <h3>إنشاء فرقة جديدة</h3>
        <input
          type="text"
          placeholder="اسم الفرقة"
          value={newTeam.code}
          onChange={e => handleInputChange("code", e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="كلمة المرور"
          value={newTeam.password}
          onChange={e => handleInputChange("password", e.target.value)}
          required
        />
        <select
          value={newTeam.role}
          onChange={e => handleInputChange("role", e.target.value)}
          required
        >
          <option value="">اختر الدور</option>
          <option value="emergency">طوارئ</option>
          <option value="maintenance">صيانة</option>
          <option value="supervisor">مشرف</option>
        </select>
        <button type="submit">إنشاء الفرقة</button>
      </form>

      <h3>الفرق المسجلة</h3>
      <ul className="team-list">
        {teams.map((team, idx) => (
          <li key={idx}>
            <span><strong>الكود:</strong> {team.code} | <strong>الدور:</strong> {team.role}</span>
            <button
              className="delete-btn"
              onClick={() => handleDeleteTeam(team.code)}
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
