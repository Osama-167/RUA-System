import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ip from "./ip";
import * as XLSX from "xlsx";
import "../styles/SupervisorPage.css";

export default function SupervisorPage() {
  const [entries, setEntries] = useState([]);
  const [filteredTeam, setFilteredTeam] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${ip}/api/reports`);
      const data = await response.json();
      if (response.ok) {
        setEntries(data);
      } else {
        console.error("فشل تحميل التقارير:", data.message);
      }
    } catch (error) {
      console.error("❌ خطأ في الاتصال بالسيرفر:", error);
    } finally {
      setLoading(false);
    }
  };

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

    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, type === "emergency" ? "طوارئ" : "صيانة");
    XLSX.writeFile(workbook, `${type}_reports.xlsx`);
  };

  const deleteReport = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا التقرير؟")) return;
    try {
      await fetch(`${ip}/api/reports/${id}`, { method: "DELETE" });
      setEntries(entries.filter((e) => e._id !== id));
    } catch (err) {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const deleteByDateRange = async () => {
    if (!fromDate || !toDate) {
      alert("يرجى تحديد من و إلى تاريخ أولًا");
      return;
    }

    if (!window.confirm(`هل أنت متأكد من حذف جميع التقارير من ${fromDate} إلى ${toDate}؟`)) return;

    try {
      await fetch(`${ip}/api/reports?from=${fromDate}&to=${toDate}`, {
        method: "DELETE",
      });
      fetchReports(); 
    } catch (err) {
      alert("حدث خطأ أثناء الحذف حسب التاريخ");
    }
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

      {loading && <p>⏳ جاري تحميل التقارير...</p>}

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
        <button onClick={deleteByDateRange}>🗑️ حذف حسب التاريخ</button>
      </div>

      <div className="export-buttons">
        <button onClick={() => exportToExcel(emergencies, "emergency")}>📥 تحميل تقرير الطوارئ Excel</button>
        <button onClick={() => exportToExcel(maintenances, "maintenance")}>📥 تحميل تقرير الصيانة Excel</button>
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
          <br />
          <button onClick={() => deleteReport(entry._id)}>🗑️ حذف</button>
        </div>
      ))}

      <h3>تقارير الصيانة</h3>
      {maintenances.map((entry, i) => (
        <div key={i} className="report-card">
          <strong>الفرقة:</strong> {entry.team} <br />
          <strong>نوع العمل:</strong> {entry.workType} <br />
          {entry.note && <><strong>ملاحظة:</strong> {entry.note}<br /></>}
          {entry.date && <><strong>التاريخ:</strong> {entry.date}</>}
          <br />
          <button onClick={() => deleteReport(entry._id)}>🗑️ حذف</button>
        </div>
      ))}
    </div>
  );
}
