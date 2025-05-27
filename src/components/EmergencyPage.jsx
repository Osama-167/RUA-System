import React, { useState } from "react";
import ip from "./ip";
import "../styles/EmergencyPage.css";

export default function EmergencyPage() {
  const [taskCount, setTaskCount] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); 

  const team = localStorage.getItem("team");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const handleTaskCountChange = (e) => {
    const count = parseInt(e.target.value) || 0;
    setTaskCount(count);

    const initialTasks = Array.from({ length: count }, () => ({
      taskNumber: "",
      subscriptionNumber: "",
      description: "",
      note: "",
      date: "",
    }));

    setTasks(initialTasks);
    setSubmitted(false);
    setErrorMsg("");
  };

  const handleTaskChange = (index, field, value) => {
    const updated = [...tasks];
    updated[index][field] = value;
    setTasks(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!team || !role) {
      alert("❌ لا يمكن إرسال البيانات بدون تسجيل دخول");
      return;
    }

    setErrorMsg("");
    setSubmitted(false);

    try {
      for (const task of tasks) {
        const formData = new FormData();
        formData.append("team", team);
        formData.append("role", role);
        formData.append("taskNumber", task.taskNumber.trim());
        formData.append("subscriptionNumber", task.subscriptionNumber);
        formData.append("description", task.description);
        formData.append("note", task.note || "");
        formData.append("date", task.date);

        const response = await fetch(`${ip}/api/reports/upload`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          // هنا بنفحص حالة الخطأ لو 409 يعني رقم المهمة موجود سابقا
          if (response.status === 409) {
            setErrorMsg(`❌ رقم المهمة ${task.taskNumber} موجود بالفعل.`);
            throw new Error(data.message || "تكرار رقم مهمة");
          } else {
            setErrorMsg(data.message || "❌ فشل رفع المهمة");
            throw new Error(data.message || "فشل رفع المهمة");
          }
        }
      }

      setSubmitted(true);
      alert("✅ تم إرسال كل المهام بنجاح!");
    } catch (err) {
      console.error(err);
      // لو في رسالة خطأ خاصة تم عرضها، لا نحتاج alert ثاني
      if (!errorMsg) {
        alert("❌ فشل في إرسال المهام");
      }
    }
  };

  return (
    <div className="emergency-container">
      <div className="header">
        <h2>تسجيل مهام الطوارئ</h2>
        <button className="logout-btn" onClick={handleLogout}>
          تسجيل الخروج
        </button>
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

            <input
              type="text"
              placeholder="رقم المهمة"
              value={task.taskNumber}
              onChange={(e) =>
                handleTaskChange(index, "taskNumber", e.target.value)
              }
              required
            />

            <input
              type="text"
              placeholder="رقم الاشتراك"
              value={task.subscriptionNumber}
              onChange={(e) =>
                handleTaskChange(index, "subscriptionNumber", e.target.value)
              }
              required
            />

            <textarea
              placeholder="الوصف"
              value={task.description}
              onChange={(e) =>
                handleTaskChange(index, "description", e.target.value)
              }
              required
            />

            <input
              type="text"
              placeholder="ملاحظة (اختياري)"
              value={task.note}
              onChange={(e) =>
                handleTaskChange(index, "note", e.target.value)
              }
            />

            <input
              type="date"
              value={task.date}
              onChange={(e) => handleTaskChange(index, "date", e.target.value)}
              required
            />
          </div>
        ))}

        {taskCount > 0 && (
          <button type="submit" className="submit-btn">
            إرسال المهام
          </button>
        )}
      </form>

      {errorMsg && <p className="error-msg">{errorMsg}</p>}

      {submitted && !errorMsg && (
        <p className="success-msg">✅ تم إرسال المهام بنجاح!</p>
      )}
    </div>
  );
}
