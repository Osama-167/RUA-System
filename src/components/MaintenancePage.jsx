import React, { useState } from "react";
import ip from "./ip";
import "../styles/MaintenancePage.css";

export default function MaintenancePage() {
  const [taskCount, setTaskCount] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const team = localStorage.getItem("team") || "ميكانيكا";
  const role = localStorage.getItem("role") || "maintenance";

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const handleTaskCountChange = (e) => {
    const count = parseInt(e.target.value);
    const initialTasks = Array.from({ length: count }, () => ({
      workType: "",
      note: "",
      date: "",
      subscriptionNumber: "",
      description: "",
    }));
    setTaskCount(count);
    setTasks(initialTasks);
    setSubmitted(false);
  };

  const handleTaskChange = (index, field, value) => {
    const updated = [...tasks];
    updated[index][field] = value;
    setTasks(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitted(false);

    try {
      for (const task of tasks) {
        const formData = new FormData();
        formData.append("team", team);
        formData.append("role", role);
        formData.append("workType", task.workType);
        formData.append("note", task.note || "");
        formData.append("date", task.date);

        const taskNumber = role === "maintenance"
          ? Math.floor(100000 + Math.random() * 900000)
          : task.taskNumber || "";

        const subscription = role === "maintenance"
          ? "MNT-" + Math.floor(100000 + Math.random() * 900000)
          : task.subscriptionNumber || "";

        formData.append("taskNumber", taskNumber);
        formData.append("subscriptionNumber", subscription);
        formData.append("description", task.description || "");

        const response = await fetch(`${ip}/api/reports/upload`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "فشل رفع المهمة");
        }
      }

      setSubmitted(true);
      alert("✅ تم إرسال كل المهام بنجاح!");
    } catch (err) {
      alert("❌ فشل في إرسال المهام");
      console.error(err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
    }, 10000);
  };

  return (
    <div className="maintenance-container">
      <div className="header">
        <h2>تسجيل مهام الصيانة</h2>
        <button className="logout-btn" onClick={handleLogout}>تسجيل الخروج</button>
      </div>

      <div className="task-count">
        <label>كم عدد المهام؟</label>
        <input
          type="number"
          min="1"
          value={taskCount}
          onChange={handleTaskCountChange}
        />
      </div>

      <form onSubmit={handleSubmit}>
        {tasks.map((task, index) => (
          <div key={index} className="task-box">
            <h4>مهمة {index + 1}</h4>

            <select
              value={task.workType}
              onChange={(e) => handleTaskChange(index, "workType", e.target.value)}
              required
            >
              <option value="">اختر نوع العمل</option>
              <option value="شد و نظافة">شد و نظافة</option>
              <option value="بالتات و نوافذ">بالتات و نوافذ</option>
              <option value="استبدال الصناديق">استبدال الصناديق</option>
              <option value="باور اوف">باور اوف</option>
            </select>

            <input
              type="text"
              placeholder="ملاحظة (اختياري)"
              value={task.note}
              onChange={(e) => handleTaskChange(index, "note", e.target.value)}
            />

            <input
              type="date"
              value={task.date}
              onChange={(e) => handleTaskChange(index, "date", e.target.value)}
              required
            />

            {role !== "maintenance" && (
              <input
                type="text"
                placeholder="رقم الاشتراك"
                value={task.subscriptionNumber}
                onChange={(e) => handleTaskChange(index, "subscriptionNumber", e.target.value)}
                required
              />
            )}

            <input
              type="text"
              placeholder="وصف المهمة"
              value={task.description}
              onChange={(e) => handleTaskChange(index, "description", e.target.value)}
              required
            />
          </div>
        ))}

        {taskCount > 0 && (
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "⏳ جاري الإرسال..." : "إرسال المهام"}
          </button>
        )}
      </form>

      {submitted && (
        <p className="success-msg">✅ تم إرسال المهام بنجاح!</p>
      )}
    </div>
  );
}
