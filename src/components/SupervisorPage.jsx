import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ip from "./ip";
import * as XLSX from "xlsx";
import "../styles/SupervisorPage.css"; // ✅ ربط ملف الستايل

export default function SupervisorPage() {
  const [entries, setEntries] = useState([]);
  const [filteredTeam, setFilteredTeam] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`${ip}/api/reports`);
        const data = await response.json();

        if (response.ok) {
          setEntries(data);
        } else {
          console.error("فشل تحميل التقارير:", data.message);
        }
      } catch (error) {
        console.error("❌ خطأ في الاتصال بالسيرفر:", error);
      }
    };

    fetchReports();
  }, []);

  const isWithinDateRange = (entryDate) => {
    if (!fromDate && !toDate) return true;
    const d = new Date(entryDate);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    return (!from || d >= from) && (!to || d <= to);
  };

  const filtered = entries.filter(
    (e) =>
      (filteredTeam === "" || e.team === filteredTeam) &&
      isWithinDateRange(e.date)
  );

  const emergencies = filtered.filter((e) => e.role === "emergency");
  const maintenances = filtered.filter((e) => e.role === "maintenance");

  const exportToExcel = (data, type) => {
    if (data.length === 0) {
      alert("لا توجد بيانات لتصديرها");
      return;
    }

    const formatted = data.map((e, index) => {
      if (e.role === "emergency") {
        return {
          "#": index + 1,
          "التاريخ": e.date || "",
          "الفرقة": e.team,
          "رقم المهمة": e.taskNumber,
          "رقم الاشتراك": e.subscriptionNumber,
          "الوصف": e.description,
          "ملاحظة": e.note || "",
        };
      } else {
        return {
          "#": index + 1,
          "التاريخ": e.date || "",
          "الفرقة": e.team,
          "نوع العمل": e.workType,
          "ملاحظة": e.note || "",
        };
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(formatted, {
      header: Object.keys(formatted[0]),
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, type === "emergency" ? "طوارئ" : "صيانة");
    XLSX.writeFile(workbook, `${type}_reports.xlsx`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("team");
    navigate("/");
  };

  const teams = [...new Set(entries.map((e) => e.team))];

  return (
    <div className="supervisor-container">
      <h2>لوحة المشرف</h2>

      <button className="logout-btn" onClick={handleLogout}>🚪 تسجيل الخروج</button>

      <div className="filters">
        <label>فرز حسب الفرقة:</label>
        <select onChange={(e) => setFilteredTeam(e.target.value)} value={filteredTeam}>
          <option value="">كل الفرق</option>
          {teams.map((team, i) => (
            <option key={i} value={team}>{team}</option>
          ))}
        </select>
      </div>

      <div className="filters">
        <label>من تاريخ: </label>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <label>إلى تاريخ: </label>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
      </div>

      <h3>تقارير الطوارئ</h3>
      {emergencies.map((entry, i) => (
        <div key={i} className="report-card">
          <strong>الفرقة:</strong> {entry.team} <br />
          <strong>رقم المهمة:</strong> {entry.taskNumber} <br />
          <strong>رقم الاشتراك:</strong> {entry.subscriptionNumber} <br />
          <strong>الوصف:</strong> {entry.description} <br />
          {entry.note && <><strong>ملاحظة:</strong> {entry.note}<br /></>}
          {entry.date && <><strong>التاريخ:</strong> {entry.date}</>}
        </div>
      ))}
      <button onClick={() => exportToExcel(emergencies, "emergency")}>📥 تحميل تقرير الطوارئ Excel</button>

      <h3>تقارير الصيانة</h3>
      {maintenances.map((entry, i) => (
        <div key={i} className="report-card">
          <strong>الفرقة:</strong> {entry.team} <br />
          <strong>نوع العمل:</strong> {entry.workType} <br />
          {entry.note && <><strong>ملاحظة:</strong> {entry.note}<br /></>}
          {entry.date && <><strong>التاريخ:</strong> {entry.date}</>}
        </div>
      ))}
      <button onClick={() => exportToExcel(maintenances, "maintenance")}>📥 تحميل تقرير الصيانة Excel</button>
    </div>
  );
}
